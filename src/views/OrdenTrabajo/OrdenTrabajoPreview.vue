<template>
  <div class="mb-4">
    <h6 class="mb-1">Progreso de la orden</h6>

    <div class="progress" style="height: 22px">
      <div
        class="progress-bar"
        :style="{ width: porcentaje + '%' }"
      >
        {{ porcentaje }}%
      </div>
    </div>
	<div class="container py-4" style="font-size: larger; max-width: 1000px;">

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
			<h4 class="text-uppercase text-muted mb-2">Llantas</h4>

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
			<h4 class="text-uppercase text-muted mb-2">Paquetes</h4>

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
			<h4 class="text-uppercase text-muted mb-2">Servicios</h4>

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
		<div class="d-flex justify-content-between">
			<button
			class="btn btn-primary shadow position-relative" style="width: 140px;"
			@click="volver"
		><i class="bi bi-arrow-left-circle-fill position-absolute start-0 ms-2"></i>
			Volver
		</button>

		<!-- <button
			class="btn btn-danger shadow mx-3 position-relative" style="width: 140px;"
			:disabled="orden?.estado !== 'Creado'"
			@click="cancelarOT"
		><i class="bi bi-x-circle-fill position-absolute start-0 ms-2"></i>
			Cancelar
		</button> -->

		<button
			class="btn btn-success shadow position-relative" style="width: 140px;"
			:disabled="orden?.estado !== 'Creado'"
			@click="iniciarOT"
		><i class="bi bi-play-circle-fill position-absolute start-0 ms-2"></i>
			&nbsp;Iniciar OT
		</button>

		

		
		</div>

	</div>
    <small class="text-muted">
      {{ completadas }} / {{ total }} tareas
    </small>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  paquetes: { type: Array, default: () => [] },
  llantas: { type: Array, default: () => [] },
  adicionales: { type: Array, default: () => [] }
})

const todas = computed(() => [
  ...props.paquetes,
  ...props.llantas,
  ...props.adicionales
])

const total = computed(() => todas.value.length)

const completadas = computed(() =>
  todas.value.filter(t => t.completada === true).length
)

const porcentaje = computed(() => {
  if (total.value === 0) return 0
  return Math.round((completadas.value / total.value) * 100)
})
</script>

<style scoped>
.progress-bar {
  transition: width 0.3s ease;
}
</style>
