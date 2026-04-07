<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
		<div><i class="bi bi-box-seam-fill me-2"></i>Paquetes</div>
    </div>

    <div class="card-body">
      <div v-if="paquetes.length === 0" class="text-muted">
        No hay paquetes asignados
      </div>

      <div class="row g-3">
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
              v-for="(paquete, index) in paquetes"
              :key="paquete.idPaquete || index"
            >
              <td>{{ paquete.nombre.toUpperCase() }}, {{ paquete.descripcion.toUpperCase() }}</td>
              <td class="text-center">{{ paquete.cantidad }}</td>
              <td class="text-end">
                {{
                  paquete.precioUnitario.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })
                }}
              </td>
              <td class="text-end">
                <template v-if="paquete.idPromocion || paquete.idPromocionVuelo">
                  <span class="text-decoration-line-through text-muted">
                    {{
                      (paquete.cantidad * paquete.precioUnitario).toLocaleString(
                        "es-MX",
                        { style: "currency", currency: "MXN" },
                      )
                    }}
                  </span>
                  <br />
                  <span
                    ><small class="badge bg-danger mt-1">{{
                      paquete.promo?.nombre || "Promoción Aplicada"
                    }}</small></span
                  >
                  <br />
                  <span class="text-success fw-bold">
                    {{
                      Number(paquete.subTotal).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </span>
                </template>
                <template v-else>
                  {{
                    Number(
                      paquete.cantidad * paquete.precioUnitario,
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
    </div>
   
  </div>
</template>

<script setup>
import TareaItem from "../TareaItem.vue";
import { ref, watch } from "vue";
const total = ref(0);
const props = defineProps({
  paquetes: { type: Array, required: true },
});

const emit = defineEmits(["tareaActualizada"]);

const totalpaquetes = () => {
  total.value = props.paquetes.reduce((acc, act) => {
    return acc + Number(act.subTotal || 0);
  }, 0);
};
watch(
  () => props.paquetes,
  () => {
    totalpaquetes();
  },
  { deep: true, immediate: true },
);

const toggleTarea = (tarea) => {
  tarea.completada = !tarea.completada;
  emit("tareaActualizada");
};
</script>
