<template>
  <div class="container-fluid p-4 reporte-rentabilidad">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="mb-1">
          <i class="bi bi-graph-up-arrow me-2"></i>
          Rentabilidad
        </h1>
        <p class="text-muted mb-0">
          Rentabilidad de ordenes de trabajo entregadas
        </p>
      </div>

      <button class="btn btn-outline-primary" type="button" @click="cargarReporte">
        <i class="bi bi-arrow-clockwise me-2"></i>
        Actualizar
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-primary">
          <span>Ordenes entregadas</span>
          <strong>{{ reporteFiltrado.length }}</strong>
        </div>
      </div>
      <div class="col-12 col-md-2">
        <div class="metric-card border-start border-4 border-success">
          <span>Precio total</span>
          <strong>{{ formatoMoneda(totales.precio) }}</strong>
        </div>
      </div>
      <div class="col-12 col-md-2">
        <div class="metric-card border-start border-4 border-success">
          <span>Precio total</span>
          <strong>{{ formatoMoneda(totales.costo) }}</strong>
        </div>
      </div>
      
      <div class="col-12 col-md-4">
        <div class="metric-card border-start border-4 border-warning">
          <span>Rentabilidad</span>
          <strong :class="totales.rentabilidad < 0 ? 'text-danger' : 'text-success'">
            {{ formatoMoneda(totales.rentabilidad) }}
          </strong>
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
            type="text"
            placeholder="OT, sucursal, llanta, cliente o vehiculo"
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
          <button class="btn btn-light" type="button" @click="limpiarFiltros">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow-sm">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0">Cargando reporte...</p>
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
              <th>Sucursal</th>
              <th>Fecha Alta</th>
              <th>Fecha Entrega</th>
              <th>Metodo Pago</th>
              <th >Precio subtotal</th>
              <th >Costo total</th>
              <th >Total Descuento</th>
             
              <th >Precio Total</th>


              <th >Rentabilidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reporteFiltrado" :key="item.ot">
              <td class="fw-semibold text-nowrap">{{ item.ot }}</td>
              <td>{{ item.sucursal || "N/A" }}</td>
              <td>{{ formatearFechaHora(item.fechaAlta)  || "N/A"}}</td>
              <td>{{ formatearFechaHora(item.fechaEntrega) || "N/A" }}</td>
              <td>{{ item.metodoPago || "N/A" }}</td>
              <td >{{ formatoMoneda(item.precioSubtotal) }}</td>
              <td >{{ formatoMoneda(item.costoTotal) }}</td>
              <td >{{ formatoMoneda(item.descuentoPromocionTotal) }}</td>
              <td >{{ formatoMoneda(item.precioTotal) }}</td>

              <td
                class=" fw-semibold"
                :class="Number(item.rentabilidad || 0) < 0 ? 'text-danger' : 'text-success'"
              >
                {{ formatoMoneda(item.rentabilidad) }}
              </td>
            </tr>

            <tr v-if="reporteFiltrado.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                No hay ordenes entregadas para mostrar.
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
import { formatearFechaHora } from "@/components/common/funciones";
const { proxy } = getCurrentInstance();

const reporte = ref([]);
const loading = ref(false);
const error = ref("");
const busqueda = ref("");
const fechaDesde = ref("");
const fechaHasta = ref("");

const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(valor || 0));

const normalizar = (valor) =>
  String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const fechaEnRango = (fecha) => {
  if (!fechaDesde.value && !fechaHasta.value) return true;

  const fechaItem = new Date(fecha);
  if (Number.isNaN(fechaItem.getTime())) return true;

  if (fechaDesde.value) {
    const desde = new Date(`${fechaDesde.value}T00:00:00`);
    if (fechaItem < desde) return false;
  }

  if (fechaHasta.value) {
    const hasta = new Date(`${fechaHasta.value}T23:59:59`);
    if (fechaItem > hasta) return false;
  }

  return true;
};

const reporteFiltrado = computed(() => {
  const texto = normalizar(busqueda.value);

  return reporte.value.filter((item) => {
    const coincideTexto =
      !texto ||
      [item.ot, item.sucursal, item.nombre, item.cliente, item.vehiculo]
        .some((valor) => normalizar(valor).includes(texto));

    return coincideTexto && fechaEnRango(item.fecha);
  });
});

const totales = computed(() =>
  reporteFiltrado.value.reduce(
    (acc, item) => {
      acc.precio += Number(item.precioTotal || 0);
      acc.costo += Number(item.costoTotal || 0);
      acc.rentabilidad += Number(item.rentabilidad || 0);
      return acc;
    },
    { precio: 0, costo: 0, rentabilidad: 0 },
  ),
);

const limpiarFiltros = () => {
  busqueda.value = "";
  fechaDesde.value = "";
  fechaHasta.value = "";
};

const cargarReporte = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/reporteRentabilidad`,
    );

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const json = await res.json();
    reporte.value = Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error("Error al cargar reporte de rentabilidad:", err);
    error.value = "No se pudo cargar el reporte de rentabilidad.";
  } finally {
    loading.value = false;
  }
};

onMounted(cargarReporte);
</script>

<style scoped>
.reporte-rentabilidad {
  min-height: calc(100vh - 70px);
  background: #f6f7fb;
}

.metric-card {
  display: grid;
  gap: 4px;
  height: 100%;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.metric-card span {
  font-size: 13px;
  color: #6c757d;
}

.metric-card strong {
  font-size: 24px;
}

th,
td {
  white-space: nowrap;
}

td:nth-child(3),
td:nth-child(4),
td:nth-child(5) {
  min-width: 190px;
  white-space: normal;
}
</style>
