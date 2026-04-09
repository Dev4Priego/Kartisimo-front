<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
      <div><i class="bi bi-record-circle-fill me-2"></i>Llantas</div>
    </div>

    <div class="card-body">
      <div v-if="llantas.length === 0" class="text-muted">
        No hay llantas asignadas
      </div>
      <div class="row g-3" v-if="llantas.length !== 0">
        <table class="table table-hover table-sm">
          <thead>
            <tr>
              <th>Descripción</th>
              <th class="text-center">Cantidad</th>
              <th class="text-end">Precio Unit.</th>
              <th class="text-end">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <transition-group name="fade" tag="tbody">
            <tr
              v-for="(llanta, index) in llantas"
              :key="llanta.idLlanta || index"
            >
              <td>{{ llanta.descripcion }}</td>
              <td class="text-center">{{ llanta.cantidad }}</td>
              <td class="text-end">
                {{
                  llanta.precioUnitario.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })
                }}
              </td>
              <td class="text-end">
                <template v-if="llanta.idPromocion || llanta.idPromocionVuelo">
                  <span class="text-decoration-line-through text-muted">
                    {{
                      (llanta.cantidad * llanta.precioUnitario).toLocaleString(
                        "es-MX",
                        { style: "currency", currency: "MXN" },
                      )
                    }}
                  </span>
                  <br />
                  <span
                    ><small class="badge bg-danger mt-1">{{
                      llanta.promo?.nombre || "Promoción Aplicada"
                    }}</small></span
                  >
                  <br />
                  <span class="text-success fw-bold">
                    {{
                      Number(llanta.subTotal).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </span>
                </template>
                <template v-else>
                  {{
                    Number(
                      llanta.cantidad * llanta.precioUnitario,
                    ).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })
                  }}
                </template>
              </td>
            </tr>
          </transition-group>
        </table>
      </div>
      <!--
      <div class="row g-3">
        <div
          v-for="(llanta, index) in llantas"
          :key="index"
          class="col-lg-6"
        >
          <LlantaCard
            :llanta="llanta"
            @tareaActualizada="emitirCambio"
          />
        </div>
      </div>
      -->
    </div>
    
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import LlantaCard from "./LlantaCard.vue";
const total = ref(0);

const props = defineProps({
  llantas: { type: Object, required: true },
});
console.log("PROPIEDAD:", props);
const mostrarModal = ref(false);
const emit = defineEmits([
  "tareaActualizada",
  "agregarLlanta",
  "eliminarLlanta",
  "guardarLLantasOT",
]);

const totalLlantas = () => {
  total.value = props.llantas.reduce((acc, act) => {
    return acc + Number(act.subTotal || 0);
  }, 0);
};

watch(
  () => props.llantas,
  () => {
    totalLlantas();
  },
  { deep: true, immediate: true },
);

const emitirCambio = () => {
  emit("tareaActualizada", "agregarLlanta", "eliminarLlanta");
};
</script>
