<template>
  <div class="container-fluid p-4 reporte-operativo">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1 class="mb-1">
          <i class="bi bi-receipt-cutoff me-2"></i>Refacciones por proveedor
        </h1>
        <p class="text-muted mb-0">Relación de refacciones para facturación</p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-success"
          type="button"
          :disabled="loading || exportando || !reporteFiltrado.length"
          @click="exportarXlsx"
        >
          <span
            v-if="exportando"
            class="spinner-border spinner-border-sm me-2"
          ></span
          ><i v-else class="bi bi-filetype-xlsx me-2"></i>Exportar XLSX
        </button>
        <button
          class="btn btn-outline-primary"
          type="button"
          :disabled="loading"
          @click="cargarReporte"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
      </div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-primary">
          <span>Proveedores</span><strong>{{ totalProveedores }}</strong>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-info">
          <span>Refacciones</span><strong>{{ reporteFiltrado.length }}</strong>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-success">
          <span>Costo total</span
          ><strong>{{ formatoMoneda(costoTotal) }}</strong>
        </div>
      </div>
    </div>
    <div class="bg-white rounded shadow-sm p-3 mb-3">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-4">
          <label class="form-label fw-semibold">Proveedor</label
          ><select v-model="proveedorSeleccionado" class="form-select">
            <option value="">Todos los proveedores</option>
            <option v-for="p in proveedores" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>
        <div class="col-12 col-lg-3">
          <label class="form-label fw-semibold">Buscar</label
          ><input
            v-model.trim="busqueda"
            class="form-control"
            type="search"
            placeholder="Refacción, factura, OT o vehículo"
          />
        </div>
        <div class="col-6 col-lg-2">
          <label class="form-label fw-semibold">Desde</label
          ><input v-model="fechaDesde" class="form-control" type="date" />
        </div>
        <div class="col-6 col-lg-2">
          <label class="form-label fw-semibold">Hasta</label
          ><input v-model="fechaHasta" class="form-control" type="date" />
        </div>
        <div class="col-12 col-lg-1 d-grid">
          <button
            class="btn btn-light"
            type="button"
            title="Limpiar filtros"
            @click="limpiarFiltros"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded shadow-sm overflow-hidden">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0">Cargando refacciones...</p>
      </div>
      <div v-else-if="error" class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="fw-semibold mt-2 mb-0">{{ error }}</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Proveedor</th>
              <th>Refacción</th>
              <th class="text-end">Cantidad</th>
              <th class="text-end">Costo unitario</th>
              <th class="text-end">Costo total</th>
              <th>Factura / nota</th>
              <th>OT</th>
              <th>Vehículo</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="grupo in gruposProveedor" :key="grupo.proveedor">
              <tr class="table-secondary">
                <td colspan="4" class="fw-semibold">
                  <i class="bi bi-building me-2"></i>{{ grupo.proveedor }}
                  <span class="badge text-bg-light ms-2">{{
                    grupo.items.length
                  }}</span>
                </td>
                <td class="text-end fw-bold">
                  {{ formatoMoneda(grupo.total) }}
                </td>
                <td colspan="5"></td>
              </tr>
              <tr v-for="item in grupo.items" :key="item.idRefaccion">
                <td>{{ item.proveedor }}</td>
                <td class="fw-semibold">{{ item.refaccion || "N/A" }}</td>
                <td class="text-end">{{ formatoCantidad(item.cantidad) }}</td>
                <td class="text-end">
                  {{ formatoMoneda(item.costoUnitario) }}
                </td>
                <td class="text-end fw-semibold">
                  {{ formatoMoneda(item.costoTotal) }}
                </td>
                <td>{{ item.factura || "Sin factura" }}</td>
                <td class="fw-semibold text-nowrap">{{ item.ot }}</td>
                <td>{{ item.vehiculo || "N/A" }}</td>
                <td class="text-nowrap">{{ formatoFecha(item.fecha) }}</td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-info"
                    type="button"
                    title="Ir a la orden de trabajo"
                    @click="irOT(item.idOrdenTrabajo)"
                  >
                    <i class="bi bi-box-arrow-up-right"></i>
                  </button>
                </td>
              </tr>
            </template>
            <tr v-if="!reporteFiltrado.length">
              <td colspan="10" class="text-center text-muted py-5">
                No hay refacciones que coincidan con los filtros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const reporte = ref([]);
const loading = ref(false);
const exportando = ref(false);
const error = ref("");
const proveedorSeleccionado = ref("");
const busqueda = ref("");
const fechaDesde = ref("");
const fechaHasta = ref("");
const normalizar = (valor) =>
  String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(valor || 0),
  );
const formatoCantidad = (valor) =>
  Number(valor || 0).toLocaleString("es-MX", { maximumFractionDigits: 2 });
const formatoFecha = (valor) => {
  const fecha = valor ? new Date(valor) : null;
  return !fecha || Number.isNaN(fecha.getTime())
    ? "N/A"
    : fecha.toLocaleDateString("es-MX");
};
const fechaValida = (valor) => {
  const f = valor ? new Date(valor) : null;
  if (!f || Number.isNaN(f.getTime()))
    return !fechaDesde.value && !fechaHasta.value;
  if (fechaDesde.value && f < new Date(`${fechaDesde.value}T00:00:00`))
    return false;
  if (fechaHasta.value && f > new Date(`${fechaHasta.value}T23:59:59`))
    return false;
  return true;
};
const proveedores = computed(() =>
  [...new Set(reporte.value.map((x) => x.proveedor).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es"),
  ),
);
const reporteFiltrado = computed(() => {
  const texto = normalizar(busqueda.value);
  return reporte.value.filter(
    (x) =>
      (!proveedorSeleccionado.value ||
        x.proveedor === proveedorSeleccionado.value) &&
      (!texto ||
        [x.refaccion, x.factura, x.ot, x.vehiculo, x.sucursal].some((v) =>
          normalizar(v).includes(texto),
        )) &&
      fechaValida(x.fecha),
  );
});
const costoTotal = computed(() =>
  reporteFiltrado.value.reduce(
    (total, x) => total + Number(x.costoTotal || 0),
    0,
  ),
);
const totalProveedores = computed(
  () => new Set(reporteFiltrado.value.map((x) => x.idProveedor)).size,
);
const gruposProveedor = computed(() => {
  const grupos = new Map();
  reporteFiltrado.value.forEach((item) => {
    const nombre = item.proveedor || "Sin proveedor";
    if (!grupos.has(nombre)) grupos.set(nombre, []);
    grupos.get(nombre).push(item);
  });
  return [...grupos.entries()].map(([proveedor, items]) => ({
    proveedor,
    items,
    total: items.reduce((s, x) => s + Number(x.costoTotal || 0), 0),
  }));
});
const limpiarFiltros = () => {
  proveedorSeleccionado.value = "";
  busqueda.value = "";
  fechaDesde.value = "";
  fechaHasta.value = "";
};
const irOT = (id) => router.push(`/content/orden-trabajo/${id}/work`);
const exportarXlsx = async () => {
  exportando.value = true;
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Refacciones");
    hoja.columns = [
      { header: "Proveedor", key: "proveedor", width: 28 },
      { header: "Refacción", key: "refaccion", width: 35 },
      { header: "Cantidad", key: "cantidad", width: 12 },
      { header: "Costo unitario", key: "costoUnitario", width: 18 },
      { header: "Costo total", key: "costoTotal", width: 18 },
      { header: "Factura / nota", key: "factura", width: 25 },
      { header: "OT", key: "ot", width: 14 },
      { header: "Vehículo", key: "vehiculo", width: 30 },
      { header: "Sucursal", key: "sucursal", width: 22 },
      { header: "Fecha", key: "fecha", width: 15 },
    ];
    reporteFiltrado.value.forEach((x) =>
      hoja.addRow({ ...x, fecha: x.fecha ? new Date(x.fecha) : null }),
    );
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF198754" },
    };
    hoja.autoFilter = "A1:J1";
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    hoja.getColumn(3).numFmt = "0.00";
    hoja.getColumn(4).numFmt = '"$"#,##0.00';
    hoja.getColumn(5).numFmt = '"$"#,##0.00';
    hoja.getColumn(10).numFmt = "dd/mm/yyyy";
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Refacciones_proveedor_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("No se pudo exportar el reporte de refacciones.");
  } finally {
    exportando.value = false;
  }
};
const cargarReporte = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/reporteRefacciones`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    reporte.value = Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error(err);
    error.value = "No se pudo cargar el reporte de refacciones.";
  } finally {
    loading.value = false;
  }
};
onMounted(cargarReporte);
</script>

<style scoped>
.reporte-operativo {
  background: #f5f7fb;
  min-height: calc(100vh - 70px);
}
.metric-card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  padding: 1rem;
  height: 100%;
}
.metric-card span {
  color: #6c757d;
  display: block;
  font-size: 0.85rem;
}
.metric-card strong {
  display: block;
  font-size: 1.35rem;
  margin-top: 0.2rem;
}
</style>
