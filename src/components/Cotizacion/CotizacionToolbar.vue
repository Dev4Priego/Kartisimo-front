<template>
    <div class="row mx-4 no-imprimir">
      <h2><i class="bi bi-file-ruled-fill me-2"></i> Cotizaciones</h2>
    </div>
    <div class="row m-4 no-imprimir">
      <div class="col-5 d-flex align-items-center">
        <input
          class="form-control"
          placeholder="Buscar por código, cliente, fecha..."
          v-model="busquedaCotizaciones"
          @keydown.stop
        />
      </div>

      <div class="col-5 d-flex align-items-center">
        <label for="select" class="form-label m-2">Estatus: </label>
        <select v-model="filtroEstatus" class="form-select">
          <option value="">Todos</option>
          <option value="Creada">Activos</option>
          <option value="Cancelada">Cancelados</option>
          <option value="Aprobada">Aprobados</option>
          <option value="Realizada">Finalizados</option>
        </select>
      </div>

      <div class="col-2 d-flex align-items-right">
        <button
          class="btn btn-primary position-relative shadow w-100"
          @click="abrirModalCotizacion()"
        >
          <i class="bi bi-plus-lg position-absolute start-0 ms-2"></i>Nueva
          cotización
        </button>
      </div>
    </div>
</template>

<script setup>
import { computed, isRef } from "vue";

const props = defineProps({
  ctx: {
    type: Object,
    required: true,
  },
});

const getContextValue = (key) => {
  const value = props.ctx[key];
  return isRef(value) ? value.value : value;
};

const setContextValue = (key, nextValue) => {
  const value = props.ctx[key];

  if (isRef(value)) {
    value.value = nextValue;
    return;
  }

  props.ctx[key] = nextValue;
};

const busquedaCotizaciones = computed({
  get: () => getContextValue("busquedaCotizaciones"),
  set: (nextValue) => setContextValue("busquedaCotizaciones", nextValue),
});

const filtroEstatus = computed({
  get: () => getContextValue("filtroEstatus"),
  set: (nextValue) => setContextValue("filtroEstatus", nextValue),
});

const abrirModalCotizacion = computed({
  get: () => getContextValue("abrirModalCotizacion"),
  set: (nextValue) => setContextValue("abrirModalCotizacion", nextValue),
});
</script>
