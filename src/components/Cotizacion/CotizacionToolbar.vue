<template>
    <div class="row mx-4 no-imprimir">
      <h2><i class="bi bi-file-ruled-fill me-2"></i> Cotizaciones</h2>
    </div>
    <div class="row m-4 g-2 no-imprimir">
      <div class="col-12 col-lg-4 d-flex align-items-center">
        <input
          class="form-control"
          placeholder="Buscar por código, cliente, fecha..."
          v-model="busquedaCotizaciones"
          @keydown.stop
        />
      </div>

      <div class="col-12 col-lg-3 d-flex align-items-center">
        <label for="selectSucursalCotizacion" class="form-label m-2">Sucursal:</label>
        <select
          id="selectSucursalCotizacion"
          v-model="filtroSucursal"
          class="form-select"
        >
          <option value="">Todas</option>
          <option
            v-for="sucursal in sucursalesCotizacion"
            :key="sucursal"
            :value="sucursal"
          >
            {{ sucursal }}
          </option>
        </select>
      </div>

      <div class="col-12 col-lg-3 d-flex align-items-center">
        <label for="selectEstatusCotizacion" class="form-label m-2">Estatus:</label>
        <select v-model="filtroEstatus" class="form-select">
          <option value="">Todos</option>
          <option value="Creada">Activos</option>
          <option value="Cancelada">Cancelados</option>
          <option value="Aprobada">Aprobados</option>
          <option value="Realizada">Finalizados</option>
        </select>
      </div>

      <div class="col-12 col-lg-2 d-flex align-items-right">
        <button
          class="btn btn-primary position-relative  w-100"
          @click="emit('create')"
        >
          <i class="bi bi-plus-lg position-absolute start-0 ms-2"></i>Nueva cotización
        </button>
      </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  busqueda: { type: String, default: "" },
  estatus: { type: String, default: "" },
  sucursal: { type: String, default: "" },
  sucursales: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "create",
  "update:busqueda",
  "update:estatus",
  "update:sucursal",
]);

const busquedaCotizaciones = computed({
  get: () => props.busqueda,
  set: (valor) => emit("update:busqueda", valor),
});
const filtroEstatus = computed({
  get: () => props.estatus,
  set: (valor) => emit("update:estatus", valor),
});
const filtroSucursal = computed({
  get: () => props.sucursal,
  set: (valor) => emit("update:sucursal", valor),
});
const sucursalesCotizacion = computed(() => props.sucursales);
</script>
