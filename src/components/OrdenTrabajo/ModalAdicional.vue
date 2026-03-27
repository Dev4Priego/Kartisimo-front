<template  >
		<div class="row d-flex">
			<h4>Agregar servicio adicional</h4>
		</div>
		<div class="row my-3 mx-3" >
				 
				  <div class="d-flex gap-3 my-3">
					<div class="col">
						<label for="conceptos" class="form-label">Concepto</label>
						<select id="conceptos"
						v-model="Concepto"
						class="form-select">
						<option :value="0">-- Seleccione concepto --</option>
	
						<option
							v-for="c in conceptoOT"
							:key="c.idConceptoOrdenTrabajo"
							:value="c.idConceptoOrdenTrabajo"
						>
							{{ c.nombre }}
						</option>
					</select>
	
	
					</div>
					<div class="col">
						<label for="nombreservicio" class="form-label">Nombre</label>
					  <input id="nombreservicio"
						class="form-control"
						placeholder="Nombre del servicio"
						v-model="Servicio"
					  />
					</div>
					<div class="col-1">
						<label for="cantidad" class="form-label">Cantidad</label>
					  <input id="cantidad"
						class="form-control"
						type="number"
						min="1"
						placeholder="Cantidad"
						v-model="Cantidad"
					  />
					</div>
	
					<div class="col">
						<label for="precio" class="form-label">Precio Unit.</label>
					  <input id="precio"
						class="form-control"
						min="0"
						type="number"
						placeholder="Precio unitario"
						v-model="Precio"
					  />
					</div>
					<div class="btn btn-primary position-relative align-self-end shadow" style="width: 130px;" @click="agregarFila">
						
					  <i class="bi bi-plus-lg position-absolute start-0 ms-2"></i> 
					  &nbsp;Agregar
					</div>
				  </div>
				</div>



</template>

<script setup>
import { getCurrentInstance } from 'vue';
import { computed, ref } from 'vue';

const { proxy } = getCurrentInstance() 
const Concepto = ref(0)
const Servicio = ref('')
const Cantidad = ref(1)
const Precio = ref(0)
const props = defineProps({
  adicionales: {
    type: Array,
    required: true
  },
  conceptoOT: {
    type: Array,
    required: true
  }
});


const emit = defineEmits(['update:adicionales', 'cerrar']);
console.log("props",JSON.stringify(props.adicionales));
/**
 * v-model proxy
 */
const adicionalesLocal = computed({
	get: () => props.adicionales,
	set: (val) => emit('update:adicionales', val)
});

/**
 * Agregar fila
 */

const promosGeneralesCache = ref(null);

const obtenerPromosCacheadas = async () => {
	if (promosGeneralesCache.value) {
		return promosGeneralesCache.value;
	}

	const promos = await obtenerPromosGeneralesParaServicio();
	promosGeneralesCache.value = promos;
	return promos;
};

const generearTempId =()=>{
 	return `${Date.now()} - ${Math.random().toString(36).slice(2)}`
}
const agregarFila = async () => {
  const promosDisponibles = await obtenerPromosCacheadas()

  adicionalesLocal.value.push({
  	tempId: generearTempId(),
	idDetalleOTServicio: 0,
    idDetalleCotizacionServicio: null,
    idConceptoTrabajo: Concepto.value,
    idPromocion: 0,
	idPromocionVuelo: 0,
	idPromocionSeleccionada: 0 ,
    descripcion: Servicio.value,
    observacion: '',
    comentario: '',
    cantidad: Cantidad.value,
    precioUnitario: Precio.value,
    subTotal: (Cantidad.value * Precio.value).toFixed(2),
    promosDisponibles,
    nombrePromocion: null,
    valorPromocion: null,
    tipoPromocion: null
  })

  // limpiar formulario
  Concepto.value = 0
  Servicio.value = ''
  Cantidad.value = 1
  Precio.value = 0
}


const obtenerPromosGeneralesParaServicio = async () => {
	try {
		const res = await fetch(`${proxy.$serverIP}api/Promocion/getPromocionesGenerales`);
		if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

		const data = await res.json();

		// Solo promociones activas
		return Array.isArray(data) ? data.filter(p => p.activo) : [];
	} catch (error) {
		console.error("Error al obtener promociones generales para servicios:", error);
		return [];
	}
};



/**
 * Recalcular subtotal
 */
const recalcularSubtotal = (ad) => {
	const cantidad = Number(ad.cantidad) || 0;
	const precio = Number(ad.precioUnitario) || 0;
	ad.subTotal = (cantidad * precio).toFixed(2);
};


</script>
