<template>
	<div class="container py-4">

		<!-- Header -->
		<div class="card border-0 shadow-sm mb-4">
			<div class="card-body d-flex justify-content-between align-items-center">
				<div>
					<h5 class="fw-bold mb-1">
						Orden de Trabajo #{{ orden?.idOrdenTrabajo }}
					</h5>

					<div class="text-muted small">
						<i class="bi bi-person me-1"></i>
						{{ orden?.cliente?.nombreCompleto }}
					</div>

					<div class="text-muted small">
						<i class="bi bi-person-badge me-1"></i>
						Técnico: {{ orden?.empleado?.nombreCompleto }}
					</div>
				</div>

				<span class="badge px-3 py-2 fs-6" :class="estadoClass">
				{{ orden?.estado }}
				</span>
			</div>
		</div>



		<!-- Vehículo -->
		<div class="card border-0 shadow-sm mb-4">
			<div class="card-body">
				<h6 class="fw-bold mb-3">
				<i class="bi bi-car-front-fill me-2 text-primary"></i>
				Vehículo
				</h6>

				<div class="row">
					<div class="col-md-4">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.marca }} {{ orden?.vehiculo?.modelo }}
						</div>
						<small class="text-muted">Marca / Modelo</small>
					</div>

					<div class="col-md-2">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.anio }}
						</div>
						<small class="text-muted">Año</small>
					</div>

					<div class="col-md-3">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.placas }}
						</div>
						<small class="text-muted">Placas</small>
					</div>

					<div class="col-md-3">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.kilometraje?.toLocaleString() }} km
						</div>
						<small class="text-muted">Kilometraje</small>
					</div>
				</div>
			</div>
		</div>


		<!-- CLIENTE -->
		<div class="card border-0 shadow-sm mb-4">
			<div class="card-body">
				<h6 class="fw-bold mb-3">
					<i class="bi bi-person-lines-fill me-2 text-primary"></i>
					Cliente
				</h6>

				<div class="row">
					<div class="col-md-6">
						<div class="fw-semibold">
						{{ orden?.cliente?.nombreCompleto }}
						</div>
						<small class="text-muted">Nombre</small>
					</div>

					<div class="col-md-3">
						<div class="fw-semibold">
						{{ orden?.cliente?.telefono || '—' }}
						</div>
						<small class="text-muted">Teléfono</small>
					</div>

					<div class="col-md-3">
						<div class="fw-semibold">
						{{ orden?.cliente?.correo || '—' }}
						</div>
						<small class="text-muted">Correo</small>
					</div>		
				</div>
			</div>
		</div>



		<!-- LLANTAS -->
		<template v-if="tieneLlantas">
			<h6 class="text-uppercase text-muted small mb-2">Llantas</h6>

			<div class="card border-0 shadow-sm mb-2">
				<ul class="list-group list-group-flush">
					<li
						v-for="llanta in orden.llantas"
						:key="llanta.idDetalleOTLlanta"
						class="list-group-item py-3"
						>
						<div class="d-flex justify-content-between align-items-start">
							<div>
								<div class="fw-semibold">
									{{ llanta.detalle }}
								</div>
								<small class="text-muted">
									Cantidad: {{ llanta.cantidad }} ·
									${{ llanta.precioUnitario.toLocaleString() }} c/u
								</small>
							</div>

							<div class="fw-bold text-end">
								${{ (llanta.cantidad * llanta.precioUnitario).toLocaleString() }}
							</div>
						</div>
					</li>
				</ul>
			</div>

			<div class="text-end mb-4 fw-semibold text-primary">
				Subtotal llantas: ${{ subtotalLlantas.toLocaleString() }}
			</div>
		</template>



		<!-- PAQUETES -->
		<template v-if="tienePaquetes">
			<h6 class="text-uppercase text-muted small mb-2">Paquetes</h6>

			<div class="card border-0 shadow-sm mb-2">
				<ul class="list-group list-group-flush">
					<li
						v-for="paquete in orden.paquetes"
						:key="paquete.idDetalleOTPaquete"
						class="list-group-item py-3"
					>
						<div class="d-flex justify-content-between">
							<div>
								<div class="fw-semibold">
									{{ paquete.nombre }}
								</div>
								<small class="text-muted">
									{{ paquete.descripcion }}
								</small>
							</div>

							<div class="fw-bold">
								${{ paquete.precioUnitario.toLocaleString() }}
							</div>
						</div>

						<ul class="mt-2 ps-3 small text-muted">
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

			<div class="text-end mb-4 fw-semibold text-primary">
				Subtotal paquetes: ${{ subtotalPaquetes.toLocaleString() }}
			</div>
		</template>



		<!-- SERVICIOS -->
		<template v-if="tieneServicios">
			<h6 class="text-uppercase text-muted small mb-2">Servicios</h6>

			<div class="card border-0 shadow-sm mb-2">
				<ul class="list-group list-group-flush">
					<li
						v-for="s in orden.adicionales"
						:key="s.idDetalleOTServicio"
						class="list-group-item py-3"
					>
						<div class="d-flex justify-content-between">
							<div>
								<div class="fw-semibold">
									{{ s.descripcionServicio }}
								</div>
								<small class="text-muted">
									Cantidad: {{ s.cantidad }}
								</small>
							</div>

							<div class="fw-bold">
								${{ (s.cantidad * s.precioUnitario).toLocaleString() }}
							</div>
						</div>
					</li>

				</ul>
			</div>

			<div class="text-end mb-4 fw-semibold text-primary">
				Subtotal servicios: ${{ subtotalServicios.toLocaleString() }}
			</div>
		</template>

		<!-- TOTAL -->
		<div class="card border-0 shadow-lg mb-4">
			<div class="card-body d-flex justify-content-between align-items-center">
				<div>
					<small class="text-muted">Total a pagar</small>
					<h4 class="mb-0 fw-bold">Total</h4>
				</div>

				<h2 class="mb-0 text-success fw-bold">
					${{ totalOrden.toLocaleString() }}
				</h2>
			</div>
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
	switch (orden.value?.estado) {

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

const subtotalLlantas = computed(() => {
	if (!orden.value?.llantas) return 0;

	return orden.value.llantas.reduce(
		(total, l) => total + (l.cantidad * l.precioUnitario),
		0
	);
});

const subtotalPaquetes = computed(() => {
	if (!orden.value?.paquetes) return 0;

	return orden.value.paquetes.reduce(
		(total, p) => total + p.precioUnitario,
		0
	);
});

const subtotalServicios = computed(() => {
	if (!orden.value?.adicionales) return 0;

	return orden.value.adicionales.reduce(
		(total, s) => total + (s.cantidad * s.precioUnitario),
		0
	);
});

const totalOrden = computed(() => {
	return (
		subtotalLlantas.value +
		subtotalPaquetes.value +
		subtotalServicios.value
	);
});

const tieneLlantas = computed(() =>
  	orden.value?.llantas?.length > 0
);

const tienePaquetes = computed(() =>
  	orden.value?.paquetes?.length > 0
);

const tieneServicios = computed(() =>
	  orden.value?.adicionales?.length > 0
);


</script>

