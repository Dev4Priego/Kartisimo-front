<template>
  <div class="row mx-4 no-imprimir">
    <div class="col">
      <EasyDataTable
        :headers="headers"
        :items="cotizacionesTransformadas"
        :loading="loading"
        :rows-per-page="50"
        rows-per-page-message="Elementos por pagina:"
        empty-message="No hay cotizaciones."
        buttons-pagination
        alternating
        table-class-name="table table-hover table-sm align-middle mb-0"
      >
        <template #item-codigo="item">
          <span class="text-nowrap">C{{ item.codigo }}</span>
        </template>

        <template #item-telefono="item">
          {{ formatearTelefono(item.telefono) }}
        </template>

        <template #item-acciones="item">
          <div class="d-flex gap-1">
            <button
              class="btn btn-sm btn-outline-info"
              @click="mostrarVistaPrevia(item.acciones, 'ver')"
              title="Ver"
            >
              <i class="bi bi-eye"></i>
            </button>

            <button
              v-if="item.estatus !== 'Realizada'"
              class="btn btn-sm btn-outline-warning"
              @click="abrirModalCotizacion(item.acciones)"
              title="Editar"
            >
              <i class="bi bi-pencil-square"></i>
            </button>

            <button
              v-if="item.estatus !== 'Cancelada'"
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click="cancelarCotizacion(item.acciones)"
              title="Cancelar"
            >
              <i class="bi bi-x-circle"></i>
            </button>

            <button
              v-if="item.estatus === 'Cancelada'"
              type="button"
              class="btn btn-sm btn-outline-success"
              @click="reactivarCotizacion(item.acciones)"
              title="Reactivar"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>

            <button
              v-if="item.estatus === 'Creada'"
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click="aprobarCotizacion(item.acciones)"
              title="Aprobar"
            >
              <i class="bi bi-check-circle"></i>
            </button>

            <button
              v-if="item.estatus === 'Aprobada'"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="finalizarCotizacion(item.acciones)"
              title="Finalizar"
            >
              <i class="bi bi-flag"></i>
            </button>
          </div>
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script setup>
import { computed, isRef } from "vue";
import EasyDataTable from "vue3-easy-data-table";

const props = defineProps({
  ctx: {
    type: Object,
    required: true,
  },
});

const headers = [
  { text: "Codigo", value: "codigo", sortable: true },
  { text: "Sucursal", value: "sucursal", sortable: true },
  { text: "Fecha", value: "fechaCreacion", sortable: true },
  { text: "Cliente", value: "cliente", sortable: true },
  { text: "Telefono", value: "telefono", sortable: true },
  { text: "Llanta", value: "nombreLlanta", sortable: true },
  { text: "Estatus", value: "estatus", sortable: true },
  { text: "Acciones", value: "acciones", width: 170 },
];

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

const loading = computed({
  get: () => getContextValue("loading"),
  set: (nextValue) => setContextValue("loading", nextValue),
});

const cancelarCotizacion = computed({
  get: () => getContextValue("cancelarCotizacion"),
  set: (nextValue) => setContextValue("cancelarCotizacion", nextValue),
});

const reactivarCotizacion = computed({
  get: () => getContextValue("reactivarCotizacion"),
  set: (nextValue) => setContextValue("reactivarCotizacion", nextValue),
});

const aprobarCotizacion = computed({
  get: () => getContextValue("aprobarCotizacion"),
  set: (nextValue) => setContextValue("aprobarCotizacion", nextValue),
});

const finalizarCotizacion = computed({
  get: () => getContextValue("finalizarCotizacion"),
  set: (nextValue) => setContextValue("finalizarCotizacion", nextValue),
});

const abrirModalCotizacion = computed({
  get: () => getContextValue("abrirModalCotizacion"),
  set: (nextValue) => setContextValue("abrirModalCotizacion", nextValue),
});

const cotizacionesTransformadas = computed({
  get: () => getContextValue("cotizacionesTransformadas"),
  set: (nextValue) => setContextValue("cotizacionesTransformadas", nextValue),
});

const mostrarVistaPrevia = computed({
  get: () => getContextValue("mostrarVistaPrevia"),
  set: (nextValue) => setContextValue("mostrarVistaPrevia", nextValue),
});

const formatearTelefono = computed({
  get: () => getContextValue("formatearTelefono"),
  set: (nextValue) => setContextValue("formatearTelefono", nextValue),
});
</script>
