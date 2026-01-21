<template>
	<div class="container py-3" v-if="orden">
		<OrdenTrabajoProgress
			:paquetes="orden.paquetes"
			:llantas="orden.llantas"
			:adicionales="orden.adicionales"
		/>

		<LlantasSection
			:llantas="orden.llantas"
			@tareaActualizada="refrescarOrden"
		/>

		<PaquetesSection
			:paquetes="orden.paquetes"
			@tareaActualizada="refrescarOrden"
		/>

		<AdicionalesSection
			:adicionales="orden.adicionales"
			@tareaActualizada="refrescarOrden"
		/>
	</div>
</template>

<script setup>
import OrdenTrabajoProgress from '@/components/OrdenTrabajo/EditarOrdenTrabajo/OrdenTrabajoProgress.vue';
import LlantasSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Llantas/LlantasSection.vue';
import PaquetesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Paquete/PaquetesSection.vue';
import AdicionalesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/AdicionalesSection.vue';

const orden = ref(null)


const cargarOrden = async () => {
  orden.value = {
    paquetes: [],
    llantas: [],
    adicionales: []
  }
}

const refrescarOrden = () => {
  // Por ahora no recargamos del backend
  // Luego aquí irá el PATCH / PUT
}

onMounted(cargarOrden)

</script>