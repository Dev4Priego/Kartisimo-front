<template>
  <div class="border rounded-3 p-3 h-100 d-flex align-items-center flex-wrap gap-2">

  <strong>
    {{ llanta?.detalle || llanta?.descripcion }}
  </strong>

  <span>- Cantidad: {{ llanta.cantidad }}</span>
  <span>- Precio: </span>
  <!-- CON PROMO -->
  <template v-if="llanta.idPromocion || llanta.idPromocionVuelo">
    - Precio
    <span class="text-decoration-line-through text-muted">
      {{
        (llanta.cantidad * llanta.precioUnitario).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
        })
      }}
    </span>

    <small class="badge bg-danger">
      {{ llanta.promo?.nombre || "Promoción Aplicada" }}
    </small>

    <span class="text-success fw-bold">
      {{
        Number(llanta.subTotal).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
        })
      }}
    </span>

  </template>

  <!-- SIN PROMO -->
  <template v-else>
    <span class="fw-bold">
      {{
        Number(llanta.cantidad * llanta.precioUnitario).toLocaleString(
          "es-MX",
          {
            style: "currency",
            currency: "MXN",
          }
        )
      }}
    </span>
  </template>

  <!-- TAREAS -->
  <div class="d-flex gap-2 ms-auto">
    <TareaItem
      v-for="tarea in llanta.tareas"
      :key="tarea.id"
      :tarea="tarea"
      @toggle="toggleTarea(tarea)"
    />
  </div>

</div>
</template>

<script setup>
import TareaItem from "../TareaItem.vue";

const props = defineProps({
  llanta: { type: Object, required: true },
});
console.log("PROPS CARDS:", props.llanta);
const emit = defineEmits(["tareaActualizada"]);

const toggleTarea = (tarea) => {
  tarea.completada = !tarea.completada;
  emit("tareaActualizada");
};
</script>
