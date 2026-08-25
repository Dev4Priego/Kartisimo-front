<template>
  <div class="container-fluid mp-4 p-4">
    <CotizacionToolbar
      v-model:busqueda="filtros.busqueda"
      v-model:estatus="filtros.estatus"
      v-model:sucursal="filtros.sucursal"
      :sucursales="sucursales"
      @create="abrirEditor()"
    />

    <CotizacionesTable
      ref="tablaRef"
      :busqueda="filtros.busqueda"
      :estatus="filtros.estatus"
      :sucursal="filtros.sucursal"
      @edit="abrirEditor"
      @preview="abrirVistaPrevia"
      @sucursales-change="sucursales = $event"
    />

    <CotizacionPreviewModal
      ref="previewRef"
      @edit="abrirEditor"
      @status-change="recargarTabla"
    />

    <CotizacionEditorModal ref="editorRef" @saved="cotizacionGuardada" />
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import CotizacionToolbar from "@/components/Cotizacion/CotizacionToolbar.vue";
import CotizacionesTable from "@/components/Cotizacion/CotizacionesTable.vue";
import CotizacionPreviewModal from "@/components/Cotizacion/CotizacionPreviewModal.vue";
import CotizacionEditorModal from "@/components/Cotizacion/CotizacionEditorModal.vue";
import "@/assets/cotizacion.css";

const tablaRef = ref(null);
const previewRef = ref(null);
const editorRef = ref(null);
const sucursales = ref([]);
const filtros = reactive({
  busqueda: "",
  estatus: "",
  sucursal: "",
});

const abrirEditor = (cotizacion = null) => editorRef.value?.abrir(cotizacion);
const abrirVistaPrevia = (cotizacion) => previewRef.value?.abrir(cotizacion);
const recargarTabla = () => tablaRef.value?.recargar();

const cotizacionGuardada = async (cotizacion) => {
  const tareas = [recargarTabla()];
  if (cotizacion?.idCotizacion) tareas.push(abrirVistaPrevia(cotizacion));
  await Promise.all(tareas);
};
</script>
