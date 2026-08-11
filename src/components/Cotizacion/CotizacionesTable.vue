<template>
    <div class="row mx-4 no-imprimir">
      <div v-if="loading" class="text-center my-4">
        <table class="table table-hover table-sm">
          <thead>
            <tr>
              <th>Código</th>
              <th>Sucursal</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Llanta</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>
        <div class="text-center my-4">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Cargando Cotizaciones...</p>
        </div>
      </div>

      <div v-else>
        <table class="table table-hover table-sm">
          <caption>
            <strong>Lista de cotizaciones</strong>
          </caption>
          <thead>
            <tr>
              <th>Código</th>
              <th>Sucursal</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Llanta</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cotizacionesTransformadas"
              :key="item.idCotizacion"
            >
              <td style="white-space: nowrap;">C{{ item.codigo }}</td>
              <td>{{ item.sucursal }}</td>
              <td>{{ item.fechaCreacion }}</td>
              <td>{{ item.cliente }}</td>
              <td>{{ formatearTelefono(item.telefono) }}</td>
              <td>{{ item.nombreLlanta }}</td>
              <td>{{ item.estatus }}</td>
              <td>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-sm btn-outline-info"
                    @click="mostrarVistaPrevia(item.acciones, 'ver')"
                    title="Ver"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <button
                    v-if="item.estatus != 'Realizada'"
                    class="btn btn-sm btn-outline-warning"
                    @click="abrirModalCotizacion(item.acciones)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus != 'Cancelada'"
                    class="btn btn-sm btn-outline-danger"
                    @click="cancelarCotizacion(item.acciones)"
                    title="Cancelar"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus === 'Cancelada'"
                    class="btn btn-sm btn-outline-success"
                    @click="reactivarCotizacion(item.acciones)"
                    title="Reactivar"
                  >
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus === 'Creada'"
                    class="btn btn-sm btn-outline-primary"
                    @click="aprobarCotizacion(item.acciones)"
                    title="Aprobar"
                  >
                    <i class="bi bi-check-circle"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus === 'Aprobada'"
                    class="btn btn-sm btn-outline-secondary"
                    @click="finalizarCotizacion(item.acciones)"
                    title="Finalizar"
                  >
                    <i class="bi bi-flag"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
