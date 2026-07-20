<template>
	<div class="accordion-item">
		<div class="accordion-header d-flex">
			<i class="bi bi-search m-2"></i><input
			class="form-control" data-bs-toggle="collapse" data-bs-target="#listacotiz"
			v-model="busquedaCotizacion"
			placeholder="Buscar cotización"
			@input="onInputCotizacion"
		/>
		</div>
		<div id="listacotiz" class="accordion-collapse collapse">
			<div class="accordion-body">
			<div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
				<table class="table table-hover table-sm">
					<thead style="position: sticky; top: 0; background: white; z-index: 1;">
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
							<td>{{ formatearTelefono(c.telefono && c.telefono.trim()) || "N/A"  }}</td>
						</tr>

						<tr v-if="!itmCotizaciones.length">
							<td colspan="4" class="text-center text-muted">
								No se encontraron resultados
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="text-end">
				<button class="btn btn-secondary position-relative shadow ms-3" type="button" style="width: 140px;" v-on:click="cerrarModal">
            		<i class="bi bi-x-circle-fill position-absolute start-0 ms-2"></i> &nbsp;Cerrar
          		</button>
			</div>
		</div>

		</div>
		
		<!-- Input deshabilitado -->
		
	</div>

	
</template>

<script setup>
import { getCurrentInstance, ref, onMounted } from 'vue'
const { proxy } = getCurrentInstance()
const userData = JSON.parse(localStorage.getItem('userSession'));
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
	const accordion = bootstrap.Collapse.getOrCreateInstance(document.getElementById("listacotiz"))
  	accordion.hide()
	
}

const onInputCotizacion = () => {
	clearTimeout(timeout)
	timeout = setTimeout(() => {
		cargarCotizacionesAprobadasOrRealizadas(busquedaCotizacion.value)
	}, 300)
}

const formatearTelefono = (telefono) => {
	if (!telefono) return '';
    const digitos = telefono.replace(/\D/g, '');
    if (digitos.length !== 10) return telefono;
    return `${digitos.slice(0,3)} ${digitos.slice(3,6)} ${digitos.slice(6)}`;
  }

const cargarCotizacionesAprobadasOrRealizadas = async (busqueda = '', options={}) => {
	try {
		options.headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

	// Adjuntar el token Bearer si existe
	
	console.log("token Modal Buscar:", userData)
	if (userData?.token) {
		options.headers['Authorization'] = `Bearer ${userData?.token}`;
	}
		itmCotizaciones.value = []
		const url = new URL(
			proxy.$serverIP + 'api/Cotizacion/getCotizacionIdAprobadaOrRealizada'
		)

		if (busqueda.trim()) {
			url.searchParams.append('busqueda', busqueda)
		}

		const res = await fetch(url , options)
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

onMounted(() => {
	cargarCotizacionesAprobadasOrRealizadas()
});
</script>
