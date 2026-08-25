<template>
  <div v-if="modelValue" class="modal fade show d-block costeo-backdrop" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h5 class="modal-title mb-0">
              <i class="bi bi-calculator me-2"></i>Costeo de orden de trabajo
            </h5>
            <small v-if="costeo?.ot" class="text-muted">
              {{ costeo.ot }} - {{ costeo.cliente || "Cliente no capturado" }}
            </small>
          </div>
          <button type="button" class="btn-close" @click="cerrar"></button>
        </div>

        <div class="modal-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else-if="error" class="alert alert-danger mb-0">
            {{ error }}
          </div>

          <template v-else-if="costeo">
            <div class="row g-2 mb-3">
              <div class="col-12 col-lg-3">
                <div class="costeo-total">
                  <span>Precio venta</span>
                  <strong>{{ moneda(costeo.precioTotal) }}</strong>
                </div>
              </div>
              <div class="col-12 col-lg-3">
                <div class="costeo-total">
                  <span>Costo insumos</span>
                  <strong>{{ moneda(costeo.costoInsumos) }}</strong>
                </div>
              </div>
              <div class="col-12 col-lg-3">
                <div class="costeo-total">
                  <span>Comisiones</span>
                  <strong>{{ moneda(costeo.comisiones) }}</strong>
                </div>
              </div>
              <div class="col-12 col-lg-3">
                <div class="costeo-total">
                  <span>Utilidad</span>
                  <strong :class="costeo.utilidad < 0 ? 'text-danger' : 'text-success'">
                    {{ moneda(costeo.utilidad) }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-12 col-lg">
                <span class="costeo-label">Método de pago</span>
                <div>{{ costeo.metodoPago || "Sin método" }}</div>
              </div>
              <div class="col-12 col-lg">
                <span class="costeo-label">Forma de pago</span>
                <div>{{ costeo.formaPago || "Contado" }}</div>
              </div>
              <div class="col-12 col-lg">
                <span class="costeo-label">Tecnico</span>
                <div>{{ costeo.tecnico || "Sin tecnico" }}</div>
              </div>
              <div class="col-12 col-lg">
                <span class="costeo-label">Vehiculo</span>
                <div>{{ costeo.vehiculo || "Sin vehiculo" }}</div>
              </div>
              <div class="col-12 col-lg">
                <span class="costeo-label">Costo total</span>
                <div class="fw-bold">{{ moneda(costeo.costoTotal) }}</div>
              </div>
            </div>

            <section class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Costos y precios</h6>
                <span class="fw-bold">{{ moneda(totalCostosPrecios) }}</span>
              </div>

              <div v-if="costosPrecios.length === 0" class="text-muted small">
                Sin registros
              </div>

              <div v-else class="table-responsive">
                <table class="table table-sm table-hover align-middle costeo-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descripcion</th>
                      <th class="text-end">Cant.</th>
                      <th class="text-end">Precio unit.</th>
                      <th class="text-end">Precio</th>
                      <th class="text-end">Costo unit.</th>
                      <th class="text-end">Costo Insumo</th>
                      <th class="text-end">Refacciones</th>
                      <th class="text-end">Costo final</th>
                      <th class="text-end">Utilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template
                      v-for="partida in costosPrecios"
                      :key="`${partida.tipo}-${partida.idDetalle}`"
                    >
                      <tr>
                        <td>{{ etiquetaTipo(partida.tipo) }}</td>
                        <td>{{ partida.descripcion }}</td>
                        <td class="text-end">{{ numero(partida.cantidad) }}</td>
                        <td class="text-end">{{ moneda(partida.precioUnitario) }}</td>
                        <td class="text-end">
                          <div v-if="tienePromocion(partida)" class="precio-promocion">
                            <span class="precio-anterior">
                              {{ moneda(partida.precioSubtotal) }}
                            </span>
                            <span class="badge bg-danger promo-badge">
                              {{ etiquetaPromocion(partida) }}
                            </span>
                            <span class="precio-final">
                              {{ moneda(partida.precioTotal) }}
                            </span>
                          </div>
                          <span v-else>{{ moneda(partida.precioTotal) }}</span>
                        </td>
                        <td class="text-end">{{ moneda(partida.costoUnitario) }}</td>
                        <td class="text-end text-danger">{{ moneda(partida.costoTotal) }}</td>
                        <td class="text-end">{{ moneda(partida.refaccionTotal) }}</td>
                        <td class="text-end text-danger">{{ moneda(partida.costoFinal) }}</td>
                        <td
                          class="text-end"
                          :class="partida.utilidad < 0 ? 'text-danger' : 'text-success'"
                        >
                          {{ moneda(partida.utilidad) }}
                        </td>
                      </tr>
                      <tr v-if="refaccionesDePartida(partida).length">
                        <td colspan="10" class="p-0 refacciones-cell">
                          <div class="refacciones-desglose">
                            <div class="fw-semibold small mb-2">
                              Refacciones vinculadas
                            </div>
                            <table class="table table-sm mb-0 refacciones-table">
                              <thead>
                                <tr>
                                  <th>Refaccion</th>
                                  <th class="text-end">Cant.</th>
                                  <th class="text-end">Precio unit.</th>
                                  <th class="text-end">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="refaccion in refaccionesDePartida(partida)"
                                  :key="`ref-${refaccion.idDetalle}`"
                                >
                                  <td>{{ refaccion.descripcion }}</td>
                                  <td class="text-end">{{ numero(refaccion.cantidad) }}</td>
                                  <td class="text-end">{{ moneda(refaccion.costoUnitario) }}</td>
                                  <td class="text-end fw-semibold">
                                    {{ moneda(refaccion.costoTotal) }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
             

              <div v-if="comisiones.length === 0" class="text-muted small">
                Sin comisiones registradas
              </div>

              <div v-else class="table-responsive">
                <table class="table table-sm table-hover align-middle costeo-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th class="text-end">Cant.</th>
                      <th class="text-end">Comision unit.</th>
                      <th class="text-end">Comision total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="partida in comisiones"
                      :key="`${partida.tipo}-${partida.idDetalle}`"
                    >
                      <td>{{ partida.descripcion }}</td>
                      <td class="text-end">{{ numero(partida.cantidad) }}</td>
                      <td class="text-end">{{ moneda(partida.costoUnitario) }}</td>
                      <td class="text-end fw-semibold">
                        {{ moneda(partida.comisionTotal || partida.costoFinal) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Comisiones del mecanico</h6>
                <span class="fw-bold">{{ moneda(costeo.comisiones) }}</span>
              </div>
            </section>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from "vue";
import axios from "axios";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  idOrdenTrabajo: { type: Number, required: true },
});

const emit = defineEmits(["update:modelValue"]);
const { proxy } = getCurrentInstance();

const loading = ref(false);
const error = ref("");
const costeo = ref(null);

const partidas = computed(() => costeo.value?.partidas || []);
const costosPrecios = computed(() =>
  partidas.value.filter(
    (partida) =>
      partida.tipo !== "Comision" && partida.tipo !== "RefaccionDetalle",
  ),
);
const comisiones = computed(() =>
  partidas.value.filter((partida) => partida.tipo === "Comision"),
);
const refaccionesDetalle = computed(() =>
  partidas.value.filter((partida) => partida.tipo === "RefaccionDetalle"),
);
const totalCostosPrecios = computed(() =>
  costosPrecios.value.reduce(
    (total, partida) => total + Number(partida.costoFinal || 0),
    0,
  ),
);

const cerrar = () => {
  emit("update:modelValue", false);
};

const refaccionesDePartida = (partida) =>
  refaccionesDetalle.value.filter(
    (refaccion) =>
      refaccion.tipoInsumoVinculado === partida.tipo &&
      Number(refaccion.idDetalleInsumoVinculado || 0) ===
      Number(partida.idDetalle || 0),
  );

const tienePromocion = (partida) =>
  Number(partida?.descuento || 0) > 0 ||
  Boolean((partida?.nombrePromocion || "").trim());

const esPromocionPorcentaje = (tipo) =>
  tipo === true ||
  tipo === 1 ||
  tipo === "1" ||
  String(tipo || "").toLowerCase() === "true" ||
  String(tipo || "").toLowerCase() === "porcentaje";

const etiquetaPromocion = (partida) => {
  const nombre = (partida?.nombrePromocion || "").trim();
  if (nombre) return nombre;

  const valor = Number(partida?.valorPromocion || 0);
  if (valor > 0 && esPromocionPorcentaje(partida?.tipoPromocion)) {
    return `${numero(valor)}%`;
  }
  if (valor > 0) return `${moneda(valor)} desc.`;

  return "Promocion aplicada";
};

const etiquetaTipo = (tipo) => {
  const etiquetas = {
    Llanta: "Llanta",
    Paquete: "Paquete",
    Servicio: "Servicio",
    Refaccion: "Refaccion",
  };

  return etiquetas[tipo] || tipo;
};

const moneda = (valor) => {
  return Number(valor || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
};

const numero = (valor) => {
  return Number(valor || 0).toLocaleString("es-MX", {
    maximumFractionDigits: 2,
  });
};

const cargarCosteo = async () => {
  if (!props.idOrdenTrabajo) return;

  loading.value = true;
  error.value = "";

  try {
    const session = JSON.parse(localStorage.getItem("userSession"));
    const response = await axios.get(
      `${proxy.$serverIP}api/OrdenTrabajo/${props.idOrdenTrabajo}/costeo`,
      {
        headers: session?.token
          ? { Authorization: `Bearer ${session.token}` }
          : {},
      },
    );

    costeo.value = response.data?.data || null;
  } catch (err) {
    console.error("Error al cargar costeo:", err);
    error.value = "No se pudo cargar el costeo de la orden de trabajo.";
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.modelValue, props.idOrdenTrabajo],
  ([abierto]) => {
    if (abierto) cargarCosteo();
  },
);
</script>

<style scoped>
.costeo-backdrop {
  background: rgba(0, 0, 0, 0.45);
}

.costeo-total {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem;
  min-height: 76px;
}

.costeo-total span,
.costeo-label {
  display: block;
  color: #6c757d;
  font-size: 0.82rem;
}

.costeo-total strong {
  display: block;
  font-size: 1.1rem;
  margin-top: 0.25rem;
}

.costeo-table th,
.costeo-table td {
  white-space: nowrap;
}

.costeo-table td:first-child,
.costeo-table th:first-child {
  width: 110px;
}

.costeo-table td:nth-child(2),
.costeo-table th:nth-child(2) {
  min-width: 260px;
  white-space: normal;
}

.refacciones-cell {
  background: #f8fbff;
}

.refacciones-desglose {
  margin: 0 0 0 120px;
  padding: 10px 12px;
  border-left: 3px solid #0d6efd;
}

.refacciones-table th,
.refacciones-table td {
  background: transparent;
}

.precio-promocion {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.precio-anterior {
  color: #6c757d;
  font-size: 0.78rem;
  text-decoration: line-through;
}

.promo-badge {
  max-width: 180px;
  white-space: normal;
  line-height: 1.1;
  text-align: right;
}

.precio-final {
  color: #198754;
  font-weight: 700;
}
</style>
