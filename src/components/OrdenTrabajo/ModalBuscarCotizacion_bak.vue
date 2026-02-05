<template>
	<div class="input-group">
		<!-- Botón -->
		<button type="button" class="btn btn-outline-primary" @click="abrirModal">
			🔍
		</button>

		<!-- Input deshabilitado -->
		<input
			class="form-control"
			:value="modelValue ? `${modelValue}` : ''"
			placeholder="Seleccione una cotización"
			@input="onInput"
		/>
	</div>

	<!-- MODAL -->
	<div
		v-if="mostrarModal"
		class="modal fade show d-block"
		tabindex="-1"
		style="background: rgba(0,0,0,.5)"
	>
		<div class="modal-dialog modal-lg modal-dialog-centered">
			<div class="modal-content">

				<div class="modal-header">
					<h5 class="modal-title">Buscar cotización</h5>
					<button type="button" class="btn-close" @click="cerrarModal"></button>
				</div>

				<div class="modal-body">
					<!-- Input búsqueda -->
					<input
						class="form-control mb-3"
						placeholder="Buscar por número cotización, nombre, telefono o fecha"
						v-model="busquedaCotizacion"
						@input="onInputCotizacion"
					/>

					<!-- Tabla resultados -->
					<div class="table-responsive">
						<table class="table table-hover table-sm">
							<thead>
								<tr>
									<th>#</th>
									<th>Sucursal</th>
									<th>Fecha</th>
									<th>Nombre Cliente</th>
									<th>Telefono</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="c in itmCotizaciones"
									:key="c.idCotizacion"
									style="cursor:pointer"
									@click="seleccionarCotizacion(c)"
								>
									<td><strong>C{{ c.prefijo }} - {{ c.consecutivo }}</strong></td>
									<td>{{ c.sucursal }}</td>
									<td>{{ formatearFecha(c.fecha) }}</td>
									<td>
										{{ 
											(c.clienteNombre && c.clienteNombre.trim())
											|| [c.nombres, c.apPaterno, c.apMaterno].filter(p => p && p.trim()).join(' ')
											|| 'N/A'
										}}
									</td>
									<td>{{ (c.telefono && c.telefono.trim()) || "N/A"  }}</td>
								</tr>

								<tr v-if="!itmCotizaciones.length">
									<td colspan="4" class="text-center text-muted">
										No se encontraron resultados
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" @click="cerrarModal">
						Cerrar
					</button>
				</div>

			</div>
		</div>
	</div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: ''
	}
})

const emit = defineEmits(['update:modelValue', 'seleccionar-cotizacion'])

const onInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const mostrarModal = ref(false)
const busquedaCotizacion = ref('')
const itmCotizaciones = ref([])
let timeout = null

const abrirModal = () => {
	mostrarModal.value = true
	cargarCotizacionesAprobadasOrRealizadas()
}

const cerrarModal = () => {
	mostrarModal.value = false
	busquedaCotizacion.value = ''
	itmCotizaciones.value = []
}

const onInputCotizacion = () => {
	clearTimeout(timeout)
	timeout = setTimeout(() => {
		cargarCotizacionesAprobadasOrRealizadas(busquedaCotizacion.value)
	}, 300)
}

const cargarCotizacionesAprobadasOrRealizadas = async (busqueda = '') => {
	try {
		const url = new URL(
			proxy.$serverIP + 'api/Cotizacion/getCotizacionIdAprobadaOrRealizada'
		)

		if (busqueda.trim()) {
			url.searchParams.append('busqueda', busqueda)
		}

		const res = await fetch(url)
		if (!res.ok) throw new Error('Error en la respuesta')

		itmCotizaciones.value = await res.json()
	} catch (e) {
		console.error(e)
	}
}

const seleccionarCotizacion = (c) => {
	emit('update:modelValue', c.idCotizacion)
	emit('seleccionar-cotizacion', c.idCotizacion)
	cerrarModal()
}

const formatearFecha = (fechaIso) => {
	if (!fechaIso) return ''
	return new Date(fechaIso).toLocaleDateString('es-MX', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	})
}
</script>
