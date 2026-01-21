<template>
	<div class="container py-4">

		<!-- Header -->
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h5 class="fw-bold mb-0">
					Orden de Trabajo #{{ orden?.idOrdenTrabajo }}
				</h5>
				<small class="text-muted">
					{{ orden?.empleadoNombre }}
				</small>
			</div>

			<span class="badge" :class="estadoClass">
				{{ orden?.estado }}
			</span>
		</div>

		<!-- Vehículo -->
		<div class="card border-0 shadow-sm mb-4">
			<div class="card-body">
				<strong>Vehículo</strong>
				<div class="text-muted">
					{{ orden?.marca }} {{ orden?.modelo }} · {{ orden?.placas }}
				</div>
			</div>
		</div>

		<!-- LLANTAS -->
		<h6 class="text-uppercase text-muted small mb-2">Llantas</h6>

		<div class="card border-0 shadow-sm mb-4">
			<ul class="list-group list-group-flush">
				<li
				v-for="llanta in orden?.llantas"
				:key="llanta.idLlanta"
				class="list-group-item d-flex justify-content-between align-items-center"
				>
					<div class="d-flex align-items-center">
						<i class="bi bi-disc me-3 text-primary fs-5"></i>
						<div>
							<div class="fw-semibold">
								{{ llanta.detalle }}
							</div>
							<small class="text-muted">
								Cantidad: {{ llanta.cantidad }}
							</small>
						</div>
					</div>

					<span class="text-muted">
						${{ llanta.precioUnitario }}
					</span>
				</li>
			</ul>
		</div>

		<!-- PAQUETES -->
		<h6 class="text-uppercase text-muted small mb-2">Paquetes</h6>

		<div class="card border-0 shadow-sm mb-4">
		<ul class="list-group list-group-flush">
			<li
			v-for="paquete in orden?.paquetes"
			:key="paquete.idPaquete"
			class="list-group-item"
			>
			<div class="d-flex justify-content-between align-items-center">
				<div class="fw-semibold">
				<i class="bi bi-box-seam me-2 text-primary"></i>
				Paquete #{{ paquete.idPaquete }}
				</div>
				<span class="text-muted">
				${{ paquete.precioUnitario }}
				</span>
			</div>

			<ul class="mt-2 small text-muted ps-4">
				<li
				v-for="d in paquete.desglosePaquetes"
				:key="d.idDesglosePaquete"
				>
				{{ d.nombre }} (x{{ d.cantidad }})
				</li>
			</ul>
			</li>
		</ul>
		</div>

		<!-- SERVICIOS -->
		<h6 class="text-uppercase text-muted small mb-2">Servicios</h6>

		<div class="card border-0 shadow-sm mb-4">
		<ul class="list-group list-group-flush">
			<li
			v-for="s in orden?.adicionales"
			:key="s.idDetalleOTServicio"
			class="list-group-item d-flex justify-content-between align-items-center"
			>
			<div>
				<i class="bi bi-tools me-2 text-primary"></i>
				{{ s.descripcionServicio }}
			</div>

			<span class="text-muted">
				${{ s.precioUnitario }}
			</span>
			</li>
		</ul>
		</div>

		<!-- ACCIONES -->
		<div class="d-flex gap-2">
		<button
			class="btn btn-success"
			:disabled="orden?.estado !== 'Creado'"
			@click="iniciarOT"
		>
			▶ Iniciar OT
		</button>

		<button
			class="btn btn-outline-danger"
			:disabled="orden?.estado !== 'Creado'"
			@click="cancelarOT"
		>
			❌ Cancelar
		</button>

		<button
			class="btn btn-outline-secondary ms-auto"
			@click="volver"
		>
			⬅ Volver
		</button>
		</div>

	</div>
</template>


<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { proxy } = getCurrentInstance();

const route = useRoute()
const router = useRouter()

const orden = ref(null)

const cargarOrden = async () => {
  
	const id = route.params.id

	const resp = await fetch(
		`${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${id}`
	)

	const data = await resp.json()

	orden.value = data

	console.log("CargarOT " + JSON.stringify(data))
}

onMounted(cargarOrden)

const iniciarOT = () => {
	// aquí luego cambiamos estado
	router.push(`/orden-trabajo/${orden.value.idOrdenTrabajo}/work`)
}

const cancelarOT = () => {
	// aquí luego cambiamos estado
	router.push('/content/orden-trabajo')
}

const volver = () => {
  	router.push('/content/orden-trabajo')
}

const estadoClass = computed(() => {
	switch (orden?.estado) {
		case "Creado":
			return "bg-secondary";
		case "En Proceso":
			return "bg-warning text-dark";
		case "Finalizado":
			return "bg-success";
		case "Cancelado":
			return "bg-danger";
		default:
			return "bg-light text-dark";
	}
});
</script>

