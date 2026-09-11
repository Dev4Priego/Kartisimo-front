<template>
  <div class="container-fluid p-4 reporte-llantas">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1 class="mb-1">
          <i class="bi bi-trophy me-2"></i>Llantas más vendidas
        </h1>
        <p class="text-muted mb-0">
          Ranking por unidades vendidas, marca, modelo y medida
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-success"
          type="button"
          :disabled="cargando || exportando || !reporte.length"
          @click="exportarXlsx"
        >
          <span
            v-if="exportando"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          <i v-else class="bi bi-filetype-xlsx me-2"></i>Exportar XLSX
        </button>
        <button
          class="btn btn-outline-primary"
          type="button"
          :disabled="cargando"
          @click="cargarReporte"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-primary">
          <span>Productos encontrados</span>
          <strong>{{ formatoEntero(reporte.length) }}</strong>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-info">
          <span>Unidades vendidas</span>
          <strong>{{ formatoEntero(totalUnidades) }}</strong>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-success">
          <span>Venta neta</span>
          <strong>{{ formatoMoneda(totalVentaNeta) }}</strong>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="metric-card border-start border-4 border-warning">
          <span>Descuentos</span>
          <strong>{{ formatoMoneda(totalDescuentos) }}</strong>
        </div>
      </div>
    </div>

    <form
      class="bg-white rounded shadow-sm p-3 mb-3"
      @submit.prevent="cargarReporte"
    >
      <div class="row g-3 align-items-end">
        <div class="col-3 col-lg-3">
          <label class="form-label fw-semibold">Búsqueda general</label>
          <input
            @input="cargarReporte"
            v-model.trim="filtros.busqueda"
            class="form-control"
            type="search"
            placeholder="Ej. 205/55R16 BRIDGESTONE"
          />
        </div>

        <div class="col-2 col-lg-2">
          <label class="form-label fw-semibold">Desde</label>
          <input
            v-model="filtros.fechaInicio"
            class="form-control"
            type="date"
            @input="cargarReporte"
          />
        </div>
        <div class="col-2 col-lg-2">
          <label class="form-label fw-semibold">Hasta</label>
          <input
            v-model="filtros.fechaFin"
            class="form-control"
            type="date"
            @input="cargarReporte"
          />
        </div>
        <div class="col-12 col-md-5 col-lg-2">
          <label class="form-label fw-semibold">Sucursal</label>
          <select
            v-model="filtros.idSucursal"
            class="form-select"
            :disabled="!alcanceReportes.esAdministrador"
            @change="cargarReporte"
          >
            <option v-if="alcanceReportes.esAdministrador" value="">
              Todas las sucursales
            </option>
            <option
              v-for="sucursal in sucursales"
              :key="sucursal.idSucursal"
              :value="sucursal.idSucursal"
            >
              {{ sucursal.nombre }}
            </option>
          </select>
        </div>
        <div class="col-2 col-md-3 col-lg-2">
          <label class="form-label fw-semibold">Mostrar</label>
          <select
            v-model.number="filtros.cantidadResultados"
            @change="cargarReporte"
            class="form-select"
          >
            <option :value="10">10 resultados</option>
            <option :value="25">25 resultados</option>
            <option :value="50">50 resultados</option>
            <option :value="100">100 resultados</option>
            <option :value="200">200 resultados</option>
          </select>
        </div>
        <div class="col-6 col-md-2 col-lg-1 d-grid">
          <button
            class="btn btn-light"
            type="button"
            title="Limpiar filtros"
            :disabled="cargando"
            @click="limpiarFiltros"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="col-12 col-md-2 col-lg-2 d-grid"></div>
      </div>
    </form>

    <div class="bg-white rounded shadow-sm overflow-hidden">
      <div v-if="cargando" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0">Consultando ventas de llantas...</p>
      </div>
      <div v-else-if="error" class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="fw-semibold mt-2 mb-0">{{ error }}</p>
      </div>
      <div v-else class="table-responsive">
        <EasyDataTable
          :key="tableKey"
          :headers="headers"
          :items="reporte"
          :rows-per-page="20"
          show-index
          border
          alternating
          buttons-pagination
          table-class-name="table table-hover align-middle mb-3 fs-2"
          class="rounded-4 shadow-sm tabla-grande"
        >
          <template #item-posicion="item">
            <span class="ranking" :class="clasePosicion(item.posicion)">
              {{ item.posicion }}
            </span>
          </template>
          <template #item-cantidadVendida ="item">
            <span class="text-primary">
              {{ item.cantidadVendida }}
            </span>
          </template>
          <template #item-descuentoPromocion="item">
            <span class="text-warning-emphasis">
              {{ item.descuentoPromocion }}
            </span>
          </template>
        </EasyDataTable>
        <!-- <table class="table table-hover align-middle mb-0 tabla-ranking">
          <thead class="table-light">
            <tr>
              <th class="text-center">Posición</th>
              <th>Código</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Medida</th>
              <th class="text-end">Unidades</th>
              <th class="text-end">Órdenes</th>
              <th class="text-end">Sucursales</th>
              <th>Primera venta</th>
              <th>Última venta</th>
              <th class="text-end">Venta bruta</th>
              <th class="text-end">Descuento</th>
              <th class="text-end">Venta neta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reporte" :key="item.idLlanta">
              <td class="text-center">
                <span class="ranking" :class="clasePosicion(item.posicion)">
                  {{ item.posicion }}
                </span>
              </td>
              <td class="text-nowrap">{{ item.codigoLlanta || "N/A" }}</td>
              <td class="fw-semibold">{{ item.marca || "N/A" }}</td>
              <td>{{ item.modelo || "N/A" }}</td>
              <td class="text-nowrap fw-semibold">
                {{ item.medida || "N/A" }}
              </td>
              <td class="text-end fw-bold text-primary">
                {{ formatoEntero(item.cantidadVendida) }}
              </td>
              <td class="text-end">
                {{ formatoEntero(item.ordenesConVenta) }}
              </td>
              <td class="text-end">
                {{ formatoEntero(item.sucursalesConVenta) }}
              </td>
              <td class="text-nowrap">{{ formatoFecha(item.primeraVenta) }}</td>
              <td class="text-nowrap">{{ formatoFecha(item.ultimaVenta) }}</td>
              <td class="text-end text-nowrap">
                {{ formatoMoneda(item.importeBruto) }}
              </td>
              <td class="text-end text-nowrap text-warning-emphasis">
                {{ formatoMoneda(item.descuentoPromocion) }}
              </td>
              <td class="text-end text-nowrap fw-bold">
                {{ formatoMoneda(item.ventaNeta) }}
              </td>
            </tr>
            <tr v-if="!reporte.length">
              <td colspan="13" class="text-center text-muted py-5">
                <i class="bi bi-search fs-2 d-block mb-2"></i>
                No hay ventas de llantas que coincidan con los filtros.
              </td>
            </tr>
          </tbody>
        </table> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref } from "vue";
import EasyDataTable from "vue3-easy-data-table";
import {
  limitarSucursalesAlUsuario,
  obtenerAlcanceReportes,
} from "@/utils/reportes";

const { proxy } = getCurrentInstance();
const alcanceReportes = obtenerAlcanceReportes();
const reporte = ref([]);
const sucursales = ref([]);
const cargando = ref(false);
const exportando = ref(false);
const error = ref("");
const tableKey = ref(0);

const headers = [
  { text: "Posición", value: "posicion", sortable: true },
  { text: "Código", value: "codigoLlanta", sortable: true },
  { text: "Marca", value: "marca", sortable: true },
  { text: "Modelo", value: "modelo", sortable: true },
  { text: "Medida", value: "medida", sortable: true },
  { text: "Unidades", value: "cantidadVendida", sortable: true },
  { text: "Órdenes", value: "ordenesConVenta", sortable: true },
  { text: "Sucursales", value: "sucursalesConVenta", sortable: true },
  { text: "Primera venta", value: "primeraVenta", sortable: true },
  { text: "Última venta", value: "ultimaVenta", sortable: true },
  { text: "Venta bruta", value: "importeBruto", sortable: true },
  { text: "Descuentos", value: "descuentoPromocion", sortable: true },
  { text: "Venta Neta", value: "ventaNeta", sortable: true },
];
const filtrosIniciales = () => ({
  busqueda: "",
  medida: "",
  modelo: "",
  marca: "",
  fechaInicio: "",
  fechaFin: "",
  idSucursal: alcanceReportes.esAdministrador
    ? ""
    : alcanceReportes.idSucursal,
  cantidadResultados: 50,
});

const filtros = reactive(filtrosIniciales());

const totalUnidades = computed(() =>
  reporte.value.reduce(
    (total, item) => total + Number(item.cantidadVendida || 0),
    0,
  ),
);
const totalVentaNeta = computed(() =>
  reporte.value.reduce((total, item) => total + Number(item.ventaNeta || 0), 0),
);
const totalDescuentos = computed(() =>
  reporte.value.reduce(
    (total, item) => total + Number(item.descuentoPromocion || 0),
    0,
  ),
);

const formatoEntero = (valor) =>
  Number(valor || 0).toLocaleString("es-MX", { maximumFractionDigits: 0 });

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor || 0));

const formatoFecha = (valor) => {
  const fecha = String(valor || "").slice(0, 10);
  const partes = fecha.split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : "N/A";
};

const clasePosicion = (posicion) => ({
  oro: Number(posicion) === 1,
  plata: Number(posicion) === 2,
  bronce: Number(posicion) === 3,
});

const cargarSucursales = async () => {
  try {
    const respuesta = await fetch(
      `${proxy.$serverIP}api/Sucursales/getSucursales?activas=true`,
    );
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    sucursales.value = limitarSucursalesAlUsuario(datos, alcanceReportes);
  } catch (err) {
    console.error("No se pudieron cargar las sucursales:", err);
    sucursales.value = [];
  }
};

const cargarReporte = async () => {
  if (
    filtros.fechaInicio &&
    filtros.fechaFin &&
    filtros.fechaInicio > filtros.fechaFin
  ) {
    error.value = "La fecha de inicio no puede ser mayor que la fecha final.";
    return;
  }

  cargando.value = true;
  error.value = "";

  try {
    const parametros = new URLSearchParams();
    [
      "busqueda",
      "medida",
      "modelo",
      "marca",
      "fechaInicio",
      "fechaFin",
    ].forEach((campo) => {
      const valor = String(filtros[campo] || "").trim();
      if (valor) parametros.set(campo, valor);
    });

    if (filtros.idSucursal) {
      parametros.set("idSucursal", String(filtros.idSucursal));
    }
    parametros.set(
      "cantidadResultados",
      String(filtros.cantidadResultados || 50),
    );

    const respuesta = await fetch(
      `${
        proxy.$serverIP
      }api/OrdenTrabajo/reporteLlantasMasVendidas?${parametros.toString()}`,
    );
    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      throw new Error(datos?.error || `Error HTTP ${respuesta.status}`);
    }

    reporte.value = Array.isArray(datos?.data) ? datos.data : [];
  } catch (err) {
    console.error(err);
    reporte.value = [];
    error.value = err.message || "No se pudo cargar el reporte de llantas.";
  } finally {
    cargando.value = false;
  }
};

const limpiarFiltros = async () => {
  Object.assign(filtros, filtrosIniciales());
  await cargarReporte();
};

const fechaExcel = (valor) => {
  const fecha = String(valor || "").slice(0, 10);
  return fecha ? new Date(`${fecha}T00:00:00`) : null;
};

const exportarXlsx = async () => {
  exportando.value = true;
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet("Llantas más vendidas");

    hoja.columns = [
      { header: "Posición", key: "posicion", width: 11 },
      { header: "Código", key: "codigoLlanta", width: 16 },
      { header: "Marca", key: "marca", width: 20 },
      { header: "Modelo", key: "modelo", width: 28 },
      { header: "Medida", key: "medida", width: 18 },
      { header: "Unidades vendidas", key: "cantidadVendida", width: 18 },
      { header: "Órdenes con venta", key: "ordenesConVenta", width: 18 },
      { header: "Sucursales con venta", key: "sucursalesConVenta", width: 20 },
      { header: "Primera venta", key: "primeraVenta", width: 16 },
      { header: "Última venta", key: "ultimaVenta", width: 16 },
      { header: "Venta bruta", key: "importeBruto", width: 18 },
      { header: "Descuento", key: "descuentoPromocion", width: 18 },
      { header: "Venta neta", key: "ventaNeta", width: 18 },
    ];

    reporte.value.forEach((item) =>
      hoja.addRow({
        ...item,
        primeraVenta: fechaExcel(item.primeraVenta),
        ultimaVenta: fechaExcel(item.ultimaVenta),
      }),
    );

    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D6EFD" },
    };
    hoja.getRow(1).alignment = { vertical: "middle" };
    hoja.autoFilter = "A1:M1";
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    hoja.getColumn(9).numFmt = "dd/mm/yyyy";
    hoja.getColumn(10).numFmt = "dd/mm/yyyy";
    [11, 12, 13].forEach((columna) => {
      hoja.getColumn(columna).numFmt = '"$"#,##0.00';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `Llantas_mas_vendidas_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("No se pudo exportar el reporte de llantas.");
  } finally {
    exportando.value = false;
  }
};

onMounted(() => {
  cargarSucursales();
  cargarReporte();
});
</script>

<style scoped>
.reporte-llantas {
  background: #f5f7fb;
  min-height: calc(100vh - 70px);
}

.metric-card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  height: 100%;
  padding: 1rem;
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

.tabla-ranking th,
.tabla-ranking td {
  white-space: nowrap;
}

.ranking {
  align-items: center;
  background: #e9ecef;
  border-radius: 50%;
  display: inline-flex;
  font-weight: 700;
  height: 2rem;
  justify-content: center;
  min-width: 2rem;
  padding: 0 0.4rem;
}

.ranking.oro {
  background: #ffd75e;
  color: #664d03;
}

.ranking.plata {
  background: #dfe3e6;
  color: #343a40;
}

.ranking.bronce {
  background: #d9a066;
  color: #4b2e13;
}
</style>
