<template>
  <div class="container-fluid p-4 reporte-operativo">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1 class="mb-1"><i class="bi bi-cash-coin me-2"></i>Comisiones</h1>
        <p class="text-muted mb-0">Comisiones por orden de trabajo y técnico</p>
      </div>
      <button
        class="btn btn-outline-primary"
        type="button"
        :disabled="loading"
        @click="cargarReporte"
      >
        <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-primary">
          <span>Órdenes de trabajo</span
          ><strong>{{ reporteFiltrado.length }}</strong>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-info">
          <span>Conceptos de comisión</span
          ><strong>{{ totales.conceptos }}</strong>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-success">
          <span>Total de comisiones</span
          ><strong>{{ formatoMoneda(totales.total) }}</strong>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow-sm p-3 mb-3">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-5">
          <label class="form-label fw-semibold">Buscar</label>
          <input
            v-model.trim="busqueda"
            class="form-control"
            type="search"
            placeholder="OT, técnico, vehículo o sucursal"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <label class="form-label fw-semibold">Desde</label>
          <input v-model="fechaDesde" class="form-control" type="date" />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <label class="form-label fw-semibold">Hasta</label>
          <input v-model="fechaHasta" class="form-control" type="date" />
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
        <p class="text-muted mt-2 mb-0">Cargando comisiones...</p>
      </div>
      <div v-else-if="error" class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="fw-semibold mt-2 mb-0">{{ error }}</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>OT</th>
              <th>Técnico</th>
              <th>Vehículo</th>
              <th>Sucursal</th>
              <th>Fecha alta</th>
              <th>Fecha entrega</th>
              <th class="text-end">Conceptos</th>
              <th class="text-end">Total comisión</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="item in reporteFiltrado"
              :key="item.idOrdenTrabajo"
            >
              <tr
                class="fila-expandible"
                :class="{
                  'table-primary': detalleAbiertoId === item.idOrdenTrabajo,
                }"
                @click="cargarDetalle(item)"
              >
                <td class="fw-semibold text-nowrap">
                  <i
                    :class="
                      detalleAbiertoId === item.idOrdenTrabajo
                        ? 'bi bi-chevron-down'
                        : 'bi bi-chevron-right'
                    "
                    class="me-2"
                  ></i
                  >{{ item.ot }}
                </td>
                <td>{{ item.tecnico || "Sin técnico" }}</td>
                <td>{{ item.vehiculo || "N/A" }}</td>
                <td>{{ item.sucursal || "N/A" }}</td>
                <td class="text-nowrap">{{ formatoFecha(item.fechaAlta) }}</td>
                <td class="text-nowrap">
                  {{ formatoFecha(item.fechaEntrega) }}
                </td>
                <td class="text-end">{{ item.numeroComisiones }}</td>
                <td class="text-end fw-semibold text-success">
                  {{ formatoMoneda(item.totalComision) }}
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-info"
                    type="button"
                    title="Ir a la orden de trabajo"
                    @click.stop="irOT(item.idOrdenTrabajo)"
                  >
                    <i class="bi bi-box-arrow-up-right"></i>
                  </button>
                </td>
              </tr>
              <tr
                v-if="detalleAbiertoId === item.idOrdenTrabajo"
                class="detalle-row"
              >
                <td colspan="9">
                  <div class="detalle-branch">
                    <div v-if="detalleLoading" class="text-center py-3">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                      ></div>
                    </div>
                    <div v-else-if="detalleError" class="text-danger py-2">
                      <i class="bi bi-exclamation-triangle me-2"></i
                      >{{ detalleError }}
                    </div>
                    <template v-else-if="detalleSeleccionado">
                      <div
                        class="d-flex flex-wrap justify-content-between gap-2 mb-3"
                      >
                        <div>
                          <h2 class="h5 mb-1">
                            Detalle {{ detalleSeleccionado.ot }}
                          </h2>
                          <span class="text-muted small"
                            >{{ detalleSeleccionado.tecnico }} ·
                            {{ detalleSeleccionado.vehiculo }}</span
                          >
                        </div>
                        <strong class="text-success">{{
                          formatoMoneda(detalleSeleccionado.totalComision)
                        }}</strong>
                      </div>
                      <div class="table-responsive rounded border">
                        <table class="table table-sm align-middle mb-0">
                          <thead class="table-light">
                            <tr>
                              <th>Tipo</th>
                              <th>Concepto</th>
                              <th class="text-end">Cantidad</th>
                              <th class="text-end">Comisión unitaria</th>
                              <th class="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="comision in detalleSeleccionado.comisiones"
                              :key="comision.idDetalleComision"
                            >
                              <td>
                                <span class="badge text-bg-light">{{
                                  etiquetaTipo(comision.tipo)
                                }}</span>
                              </td>
                              <td>{{ comision.concepto }}</td>
                              <td class="text-end">
                                {{ formatoCantidad(comision.cantidad) }}
                              </td>
                              <td class="text-end">
                                {{ formatoMoneda(comision.comisionUnitaria) }}
                              </td>
                              <td class="text-end fw-semibold">
                                {{ formatoMoneda(comision.comisionTotal) }}
                              </td>
                            </tr>
                            <tr v-if="!detalleSeleccionado.comisiones?.length">
                              <td
                                colspan="5"
                                class="text-center text-muted py-3"
                              >
                                No hay conceptos activos para mostrar.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="reporteFiltrado.length === 0">
              <td colspan="9" class="text-center py-5 text-muted">
                No hay comisiones que coincidan con los filtros.
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
const error = ref("");
const busqueda = ref("");
const fechaDesde = ref("");
const fechaHasta = ref("");
const detalleAbiertoId = ref(null);
const detalleSeleccionado = ref(null);
const detalleLoading = ref(false);
const detalleError = ref("");

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
  if (!valor) return "N/A";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "N/A"
    : fecha.toLocaleDateString("es-MX");
};
const etiquetaTipo = (tipo) =>
  ({ PAQUETE: "Paquete", SERVICIO: "Servicio", MANO_OBRA: "Mano de obra" }[
    tipo
  ] ||
  tipo ||
  "Comisión");
const enRango = (valor) => {
  const fecha = valor ? new Date(valor) : null;
  if (!fecha || Number.isNaN(fecha.getTime()))
    return !fechaDesde.value && !fechaHasta.value;
  if (fechaDesde.value && fecha < new Date(`${fechaDesde.value}T00:00:00`))
    return false;
  if (fechaHasta.value && fecha > new Date(`${fechaHasta.value}T23:59:59`))
    return false;
  return true;
};
const reporteFiltrado = computed(() => {
  const texto = normalizar(busqueda.value);
  return reporte.value.filter(
    (item) =>
      (!texto ||
        [item.ot, item.tecnico, item.vehiculo, item.sucursal].some((valor) =>
          normalizar(valor).includes(texto),
        )) &&
      enRango(item.fechaAlta),
  );
});
const totales = computed(() =>
  reporteFiltrado.value.reduce(
    (acc, item) => {
      acc.conceptos += Number(item.numeroComisiones || 0);
      acc.total += Number(item.totalComision || 0);
      return acc;
    },
    { conceptos: 0, total: 0 },
  ),
);
const limpiarFiltros = () => {
  busqueda.value = "";
  fechaDesde.value = "";
  fechaHasta.value = "";
};
const cerrarDetalle = () => {
  detalleAbiertoId.value = null;
  detalleSeleccionado.value = null;
  detalleError.value = "";
};
const irOT = (id) => router.push(`/content/orden-trabajo/${id}/work`);
const cargarDetalle = async (item) => {
  if (detalleAbiertoId.value === item.idOrdenTrabajo) return cerrarDetalle();
  detalleAbiertoId.value = item.idOrdenTrabajo;
  detalleSeleccionado.value = null;
  detalleLoading.value = true;
  detalleError.value = "";
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/reporteComisiones/${item.idOrdenTrabajo}/detalle`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (detalleAbiertoId.value === item.idOrdenTrabajo)
      detalleSeleccionado.value = json.data;
  } catch (err) {
    console.error(err);
    if (detalleAbiertoId.value === item.idOrdenTrabajo)
      detalleError.value = "No se pudo cargar el detalle de comisiones.";
  } finally {
    if (detalleAbiertoId.value === item.idOrdenTrabajo)
      detalleLoading.value = false;
  }
};
const cargarReporte = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/reporteComisiones`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    reporte.value = Array.isArray(json.data) ? json.data : [];
    cerrarDetalle();
  } catch (err) {
    console.error(err);
    error.value = "No se pudo cargar el reporte de comisiones.";
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
.fila-expandible {
  cursor: pointer;
}
.detalle-row > td {
  background: #f8fafc;
  padding: 0;
}
.detalle-branch {
  border-left: 4px solid #0d6efd;
  margin: 0.75rem 1.25rem 1rem 2rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 0.35rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
}
</style>
