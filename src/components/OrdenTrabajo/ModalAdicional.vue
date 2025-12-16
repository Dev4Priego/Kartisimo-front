<template>
	<!-- Backdrop -->
	<div class="modal-backdrop fade show"></div>

	<!-- Modal -->
	<div class="modal fade show d-block" tabindex="-1">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">

				<div class="modal-header">
					<h5 class="modal-title">Adicionales</h5>
					<button type="button" class="btn-close" @click="cerrar"></button>
				</div>

				<div class="modal-body">

					<table class="table table-sm align-middle">
						<thead>
							<tr>
								<th>Concepto Trabajo</th>
								<th>Descripción</th>
								<th style="width:120px">Cantidad</th>
								<th style="width:140px">Precio</th>
								<th style="width:140px">Subtotal</th>
								<th style="width:60px"></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="(ad, i) in adicionalesLocal" :key="i">

								<!-- CONCEPTO -->
								<td>
									<select
										class="form-select form-select-sm"
										v-model="ad.idConceptoTrabajo"
									>
										<option :value="0">-- Seleccione concepto --</option>

										<option
											v-for="c in conceptoOT"
											:key="c.idConceptoOrdenTrabajo"
											:value="c.idConceptoOrdenTrabajo"
										>
											{{ c.nombre }}
										</option>
									</select>
								</td>

								<!-- DESCRIPCIÓN -->
								<td>
									<input
										class="form-control form-control-sm"
										v-model="ad.descripcion"
									/>
								</td>

								<!-- CANTIDAD -->
								<td>
									<input
										type="number"
										min="1"
										class="form-control form-control-sm"
										v-model.number="ad.cantidad"
										@input="recalcularSubtotal(ad)"
									/>
								</td>

								<!-- PRECIO -->
								<td>
									<input
										type="number"
										min="0"
										step="0.01"
										class="form-control form-control-sm"
										v-model.number="ad.precioUnitario"
										@input="recalcularSubtotal(ad)"
									/>
								</td>

								<!-- SUBTOTAL -->
								<td class="text-end">
									{{ Number(ad.subTotal).toLocaleString('es-MX', {
									style: 'currency',
									currency: 'MXN'
									}) }}
								</td>

								<!-- ELIMINAR -->
								<td class="text-center">
									<button
										class="btn btn-danger btn-sm"
										@click="eliminarFila(i)"
									>
										<i class="bi bi-trash"></i>
									</button>
								</td>

							</tr>

						</tbody>
					</table>

					<button
						type="button"
						class="btn btn-outline-primary btn-sm"
						@click="agregarFila"
					>
						<i class="bi bi-plus"></i> Agregar adicional
					</button>

				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="cerrar">
						Cerrar
					</button>
				</div>

			</div>
		</div>
	</div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
import { computed, ref } from 'vue';

const { proxy } = getCurrentInstance() 

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
const agregarFila = async () => {
	const promosDisponibles = await obtenerPromosCacheadas();
	console.log(promosDisponibles)
	adicionalesLocal.value.push({
		idDetalleCotizacionServicio: null,
		idConceptoTrabajo: 0,
		idPromocion: 0,
		descripcion: '',
		observacion: '',
		comentario: '',
		cantidad: 1,
		precioUnitario: 0,
		subTotal: '0.00',
		promosDisponibles,
		nombrePromocion: null,
		valorPromocion: null,
		tipoPromocion: null
	});
};

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
 * Eliminar fila
 */
const eliminarFila = (index) => {
	adicionalesLocal.value.splice(index, 1);
};

/**
 * Recalcular subtotal
 */
const recalcularSubtotal = (ad) => {
	const cantidad = Number(ad.cantidad) || 0;
	const precio = Number(ad.precioUnitario) || 0;
	ad.subTotal = (cantidad * precio).toFixed(2);
};

/**
 * Cerrar modal
 */
const cerrar = () => {
	emit('cerrar');
};
</script>
