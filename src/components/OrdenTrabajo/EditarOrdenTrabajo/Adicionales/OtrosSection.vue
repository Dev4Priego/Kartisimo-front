<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
      <div><i class="bi bi-record-circle-fill me-2"></i>Adicionales</div>
    </div>

    <div class="card-body">
      <div v-if="adicionales.length === 0" class="text-muted">
        No hay Adicionales asignadas
      </div>
      <div class="row g-3" v-if="adicionales.length !== 0">
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
              v-for="(adicional, index) in adicionales"
              :key="adicional.idDetalleOTServicio || index || tempId"
            >
              <td>{{ adicional.descripcion }}</td>
              <td class="text-center">{{ adicional.cantidad }}</td>
              <td class="text-end">
                {{
                  adicional.precioUnitario.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })
                }}
              </td>
              <td class="text-end">
                <template v-if="adicional.idPromocion || adicional.idPromocionVuelo">
                  <span class="text-decoration-line-through text-muted">
                    {{
                      (adicional.cantidad * adicional.precioUnitario).toLocaleString(
                        "es-MX",
                        { style: "currency", currency: "MXN" },
                      )
                    }}
                  </span>
                  <br />
                  <span
                    ><small class="badge bg-danger mt-1">{{
                      adicional.promo?.nombre || "Promoción Aplicada"
                    }}</small></span
                  >
                  <br />
                  <span class="text-success fw-bold">
                    {{
                      Number(adicional.subTotal).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </span>
                </template>
                <template v-else>
                  {{
                    Number(
                      adicional.cantidad * adicional.precioUnitario,
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
          v-for="(adicional, index) in adicionales"
          :key="index"
          class="col-lg-6"
        >
          <LlantaCard
            :adicional="adicional"
            @tareaActualizada="emitirCambio"
          />
        </div>
      </div>
      -->
    </div>
    
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const { proxy } = getCurrentInstance();
const total = ref(0);
const props = defineProps({
  adicionales: { type: Object, required: true },
});

const emit = defineEmits(["tareaActualizada"]);

const totaladicionales = () => {
  total.value = props.adicionales.reduce((acc, act) => {
    return acc + Number(act.subTotal || 0);
  }, 0);
};
watch(
  () => props.adicionales,
  () => {
    console.log("ADICIONALES:", props.adicionales);
    totaladicionales();
  },
  { deep: true, immediate: true },
);

const toggleTarea = (tarea) => {
  tarea.completada = !tarea.completada;
  emit("tareaActualizada");
};
</script>
