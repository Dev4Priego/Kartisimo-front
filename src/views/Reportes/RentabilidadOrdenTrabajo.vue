<template>
  <div class="container-fluid p-4 reporte-rentabilidad">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1 class="mb-1">
          <i class="bi bi-graph-up-arrow me-2"></i>
          Utilidad
        </h1>
        <p class="text-muted mb-0">Utilidad de ordenes de trabajo entregadas</p>
      </div>

      <button
        class="btn btn-outline-primary"
        type="button"
        @click="cargarReporte"
      >
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
          <span>Utilidad</span>
          <strong
            :class="totales.rentabilidad < 0 ? 'text-danger' : 'text-success'"
          >
            {{ formatoMoneda(totales.rentabilidad) }}
          </strong>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow-sm p-3 mb-3">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-5">
          <label class="form-label fw-semibold">Sucursal</label>
          <select v-model="sucursalSeleccionada" class="form-select">
            <option value="">Todas sucursales</option>
            <option v-for="s in sucursalesDisponibles" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
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
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('ot')"
                >
                  OT <i :class="iconoOrden('ot')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('sucursal')"
                >
                  Sucursal <i :class="iconoOrden('sucursal')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('fechaAlta')"
                >
                  Fecha Alta <i :class="iconoOrden('fechaAlta')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('fechaEntrega')"
                >
                  Fecha Entrega <i :class="iconoOrden('fechaEntrega')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('metodoPago')"
                >
                  Metodo Pago <i :class="iconoOrden('metodoPago')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('precioSubtotal')"
                >
                  Precio subtotal <i :class="iconoOrden('precioSubtotal')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('costoTotal')"
                >
                  Costo total <i :class="iconoOrden('costoTotal')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('descuentoPromocionTotal')"
                >
                  Total Descuento
                  <i :class="iconoOrden('descuentoPromocionTotal')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('precioTotal')"
                >
                  Precio Total <i :class="iconoOrden('precioTotal')"></i>
                </button>
              </th>
              <th>
                <button
                  class="sort-header"
                  type="button"
                  @click="ordenarPor('rentabilidad')"
                >
                  Utilidad <i :class="iconoOrden('rentabilidad')"></i>
                </button>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="item in reporteOrdenado" :key="item.rowKey">
              <tr
                class="rentabilidad-row"
                :class="{
                  'table-primary': detalleAbiertoId === item.idOrdenTrabajo,
                }"
                @click="cargarDetalle(item)"
              >
                <td class="fw-semibold text-nowrap">{{ item.ot }}</td>
                <td>{{ item.sucursal || "N/A" }}</td>
                <td>{{ formatearFechaHora(item.fechaAlta) || "N/A" }}</td>
                <td>{{ formatearFechaHora(item.fechaEntrega) || "N/A" }}</td>
                <td>{{ item.metodoPago || "N/A" }}</td>
                <td>{{ formatoMoneda(item.precioSubtotal) }}</td>
                <td>{{ formatoMoneda(item.costoTotal) }}</td>
                <td>{{ formatoMoneda(item.descuentoPromocionTotal) }}</td>
                <td>{{ formatoMoneda(item.precioTotal) }}</td>

                <td
                  class="fw-semibold"
                  :class="
                    Number(item.rentabilidad || 0) < 0
                      ? 'text-danger'
                      : 'text-success'
                  "
                >
                  {{ formatoMoneda(item.rentabilidad) }}
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-info"
                    @click.stop="IrOT(item.idOrdenTrabajo)"
                    title="Ver"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>

              <tr
                v-if="detalleAbiertoId === item.idOrdenTrabajo"
                class="detalle-row"
              >
                <td colspan="11">
                  <div v-if="detalleLoading" class="detalle-branch text-center">
                    <div class="spinner-border text-primary"></div>
                    <p class="text-muted mt-2 mb-0">
                      Cargando detalle de rentabilidad...
                    </p>
                  </div>

                  <div
                    v-else-if="detalleError"
                    class="detalle-branch text-danger"
                  >
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    {{ detalleError }}
                  </div>

                  <div v-else-if="detalleSeleccionado" class="detalle-branch">
                    <div
                      class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"
                    >
                      <div>
                        <h2 class="h5 mb-1">
                          Detalle {{ detalleSeleccionado.ot }}
                        </h2>
                        <div class="text-muted small">
                          {{ detalleSeleccionado.sucursal || "N/A" }} |
                          {{ detalleSeleccionado.cliente || "Cliente N/A" }} |
                          {{ detalleSeleccionado.vehiculo || "Vehiculo N/A" }}
                        </div>
                      </div>
                      <button
                        class="btn btn-sm btn-light"
                        type="button"
                        @click.stop="cerrarDetalle"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>

                    <div class="row g-3 mb-3">
                      <div class="col-12 col-md-2">
                        <div class="mini-metric">
                          <span>Precio subtotal</span>
                          <strong>{{
                            formatoMoneda(detalleSeleccionado.precioSubtotal)
                          }}</strong>
                        </div>
                      </div>
                      <div class="col-12 col-md-2">
                        <div class="mini-metric">
                          <span>Descuento</span>
                          <strong>{{
                            formatoMoneda(
                              detalleSeleccionado.descuentoPromocionTotal,
                            )
                          }}</strong>
                        </div>
                      </div>
                      <div class="col-12 col-md-3">
                        <div class="mini-metric">
                          <span>Precio total</span>
                          <strong>{{
                            formatoMoneda(detalleSeleccionado.precioTotal)
                          }}</strong>
                        </div>
                      </div>
                      <div class="col-12 col-md-3">
                        <div class="mini-metric">
                          <span>Costo total</span>
                          <strong>{{
                            formatoMoneda(detalleSeleccionado.costoTotal)
                          }}</strong>
                        </div>
                      </div>
                      <div class="col-12 col-md-2">
                        <div class="mini-metric">
                          <span>Utilidad</span>
                          <strong
                            :class="
                              Number(detalleSeleccionado.rentabilidad || 0) < 0
                                ? 'text-danger'
                                : 'text-success'
                            "
                          >
                            {{
                              formatoMoneda(detalleSeleccionado.rentabilidad)
                            }}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div class="table-responsive">
                      <table class="table table-sm align-middle mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>Tipo</th>
                            <th>Descripcion</th>
                            <th>Cant.</th>
                            <th>Precio unit.</th>
                            <th>Subtotal</th>
                            <th>Descuento</th>
                            <th>Precio total</th>
                            <th>Costo unit.</th>
                            <th>Costo total</th>
                            <th>Utilidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="partida in detalleSeleccionado.partidas"
                            :key="`${partida.tipo}-${partida.idDetalle}`"
                          >
                            <td>{{ partida.tipo }}</td>
                            <td class="descripcion-detalle">
                              {{ partida.descripcion || "N/A" }}
                            </td>
                            <td>
                              {{
                                Number(partida.cantidad || 0).toLocaleString(
                                  "es-MX",
                                )
                              }}
                            </td>

                            <td>{{ formatoMoneda(partida.precioUnitario) }}</td>
                            <td>{{ formatoMoneda(partida.precioSubtotal) }}</td>
                            <td>
                              {{ formatoMoneda(partida.descuentoPromocion) }}
                              <span
                                v-if="partida.nombrePromocion"
                                class="text-muted small d-block"
                              >
                                {{ partida.nombrePromocion }}
                              </span>
                            </td>
                            <td>{{ formatoMoneda(partida.precioTotal) }}</td>
                            <td>
                              {{
                                Number(
                                  partida.costoUnitario || 0,
                                ).toLocaleString("es-MX")
                              }}
                            </td>
                            <td>{{ formatoMoneda(partida.costoTotal) }}</td>
                            <td
                              class="fw-semibold"
                              :class="
                                Number(partida.rentabilidad || 0) < 0
                                  ? 'text-danger'
                                  : 'text-success'
                              "
                            >
                              {{ formatoMoneda(partida.rentabilidad) }}
                            </td>
                          </tr>
                          <tr v-if="!detalleSeleccionado.partidas?.length">
                            <td colspan="9" class="text-center text-muted py-4">
                              Esta orden no tiene partidas activas para mostrar.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="reporteOrdenado.length === 0">
              <td colspan="10" class="text-center py-5 text-muted">
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
import { useRouter } from "vue-router";
const { proxy } = getCurrentInstance();

const reporte = ref([]);
const loading = ref(false);
const error = ref("");
const detalleLoading = ref(false);
const detalleError = ref("");
const detalleSeleccionado = ref(null);
const detalleAbiertoId = ref(null);
const busqueda = ref("");
const fechaDesde = ref("");
const fechaHasta = ref("");
const sortKey = ref("");
const sortDirection = ref("");
const router = useRouter();

const IrOT = (idOT) => {
  router.push(`/content/orden-trabajo/${idOT}/work`);
};

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

const sucursalSeleccionada = ref("");

const sucursalesDisponibles = computed(() => {
  const arr = Array.from(
    new Set(reporte.value.map((r) => r.sucursal).filter(Boolean)),
  );
  return arr.sort((a, b) => String(a).localeCompare(String(b)));
});

const reporteFiltrado = computed(() => {
  const texto = normalizar(busqueda.value);
  const sucSel = normalizar(sucursalSeleccionada.value);

  return reporte.value.filter((item) => {
    const coincideTexto =
      !texto ||
      [item.ot, item.sucursal, item.nombre, item.cliente, item.vehiculo].some(
        (valor) => normalizar(valor).includes(texto),
      );

    const coincideSucursal =
      !sucSel || normalizar(item.sucursal || "").includes(sucSel);

    return coincideTexto && coincideSucursal && fechaEnRango(item.fecha);
  });
});

const camposNumericos = new Set([
  "precioSubtotal",
  "costoTotal",
  "descuentoPromocionTotal",
  "precioTotal",
  "rentabilidad",
]);
const camposFecha = new Set(["fechaAlta", "fechaEntrega"]);

const valorOrdenable = (item, campo) => {
  const valor = item?.[campo];

  if (camposNumericos.has(campo)) {
    return Number(valor || 0);
  }

  if (camposFecha.has(campo)) {
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? 0 : fecha.getTime();
  }

  return normalizar(valor);
};

const reporteOrdenado = computed(() => {
  if (!sortKey.value || !sortDirection.value) {
    return reporteFiltrado.value;
  }

  const direccion = sortDirection.value === "asc" ? 1 : -1;

  return [...reporteFiltrado.value].sort((a, b) => {
    const valorA = valorOrdenable(a, sortKey.value);
    const valorB = valorOrdenable(b, sortKey.value);

    if (valorA < valorB) return -1 * direccion;
    if (valorA > valorB) return 1 * direccion;
    return 0;
  });
});

const ordenarPor = (campo) => {
  if (sortKey.value === campo) {
    if (sortDirection.value === "asc") {
      sortDirection.value = "desc";
      return;
    }

    sortKey.value = "";
    sortDirection.value = "";
    return;
  }

  sortKey.value = campo;
  sortDirection.value = "asc";
};

const iconoOrden = (campo) => {
  if (sortKey.value !== campo) return "bi bi-arrow-down-up ms-1 text-muted";
  return sortDirection.value === "asc"
    ? "bi bi-sort-up ms-1"
    : "bi bi-sort-down ms-1";
};

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
  sucursalSeleccionada.value = "";
};

const cerrarDetalle = () => {
  detalleAbiertoId.value = null;
  detalleSeleccionado.value = null;
  detalleError.value = "";
  detalleLoading.value = false;
};

const cargarDetalle = async (item) => {
  if (!item?.idOrdenTrabajo) return;

  if (detalleAbiertoId.value === item.idOrdenTrabajo) {
    cerrarDetalle();
    return;
  }

  detalleAbiertoId.value = item.idOrdenTrabajo;
  detalleSeleccionado.value = null;
  detalleLoading.value = true;
  detalleError.value = "";

  try {
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/reporteRentabilidad/${item.idOrdenTrabajo}/detalle`,
    );

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const json = await res.json();
    if (detalleAbiertoId.value === item.idOrdenTrabajo) {
      detalleSeleccionado.value = json.data || null;
    }
  } catch (err) {
    console.error("Error al cargar detalle de rentabilidad:", err);
    if (detalleAbiertoId.value === item.idOrdenTrabajo) {
      detalleError.value = "No se pudo cargar el detalle de rentabilidad.";
    }
  } finally {
    if (detalleAbiertoId.value === item.idOrdenTrabajo) {
      detalleLoading.value = false;
    }
  }
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
    reporte.value = Array.isArray(json.data)
      ? json.data.map((item, index) => ({
          ...item,
          rowKey: `${item.idOrdenTrabajo || "sin-id"}-${index}`,
        }))
      : [];
    cerrarDetalle();
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

.rentabilidad-row {
  cursor: pointer;
}

.rentabilidad-row:hover td {
  background: #eef5ff;
}

.sort-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.sort-header:hover {
  color: #0d6efd;
}

.detalle-row > td {
  padding: 0;
  background: #f8fbff;
  white-space: normal;
}

.detalle-branch {
  margin: 0;
  padding: 16px 16px 16px 24px;
  border-left: 4px solid #0d6efd;
  border-bottom: 1px solid #dbe7f8;
}

.mini-metric {
  display: grid;
  gap: 4px;
  height: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
  border-radius: 6px;
}

.mini-metric span,
.formula-box span {
  font-size: 12px;
  color: #6c757d;
}

.mini-metric strong {
  font-size: 18px;
}

.formula-box {
  display: grid;
  gap: 4px;
  padding: 12px;
  background: #fff8e6;
  border: 1px solid #ffe3a3;
  border-radius: 6px;
}

.descripcion-detalle {
  min-width: 260px;
  white-space: normal;
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
