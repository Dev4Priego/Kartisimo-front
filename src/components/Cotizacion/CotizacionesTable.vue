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
          <span class="text-nowrap">{{ item.codigo }}</span>
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
import { toRefs, watch } from "vue";
import EasyDataTable from "vue3-easy-data-table";
import { useCotizaciones } from "@/composables/cotizacion/useCotizaciones";

const props = defineProps({
  busqueda: { type: String, default: "" },
  estatus: { type: String, default: "" },
  sucursal: { type: String, default: "" },
});
const emit = defineEmits(["edit", "preview", "sucursales-change"]);

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

const filtros = toRefs(props);
const {
  aprobar: aprobarCotizacion,
  cancelar: cancelarCotizacion,
  cargar,
  finalizar: finalizarCotizacion,
  formatearTelefono,
  items: cotizacionesTransformadas,
  loading,
  reactivar: reactivarCotizacion,
  sucursales,
} = useCotizaciones(filtros);

const abrirModalCotizacion = (cotizacion) => emit("edit", cotizacion);
const mostrarVistaPrevia = (cotizacion) => emit("preview", cotizacion);

watch(
  sucursales,
  (valor) => emit("sucursales-change", valor),
  { immediate: true },
);

defineExpose({ recargar: cargar });
</script>
