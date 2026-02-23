<template>
  
	<div class="container py-4" id="area-imprimir" style="font-size: larger; max-width: 1000px;">
		
		<!-- Header -->
		<div class="card border-1 mb-4">
			<div class="card-body d-flex justify-content-between align-items-center">
				<div class="w-100">
					<h5 class="fw-bold mb-1">
						Orden de Trabajo #{{ orden?.idOrdenTrabajo }}
					</h5>
					<div class="row">
						<div class="col-7">
							<div class="text-muted small">
								<i class="bi bi-person me-1"></i>
								{{ orden?.cliente?.nombreCompleto }}
							</div>

							<div class="text-muted small">
								<i class="bi bi-person-badge me-1"></i>
								Técnico: {{ orden?.empleado?.nombreCompleto }}
							</div>
						</div>
						<div class="col-5">
							<div class="text-muted small">
								<i class="bi bi-cash me-1"></i>
								Forma de pago: {{ orden?.metodoPago }}
							</div>

							<div class="text-muted small">
								<i class="bi bi-record-circle-fill me-1"></i>
								Desechar llantas: {{ orden?.desecharLlanta ? 'Sí' : 'No' }}
							</div>
						</div>
					</div>

					<div class="mt-1">
						<i class="bi bi-clock me-1"></i>
						Fecha/hora de entrega: <strong>{{ formatearFecha(orden?.fechaEntrega) }}</strong>
					</div>
				</div>

				<span class="badge px-3 py-2 fs-6" :class="estadoClass">
				{{ orden?.estado }}
				</span>
			</div>
		</div>

		<!-- Vehículo -->
		<div class="card border-1 shadow-sm mb-2">
			<div class="card-body">
				<h5 class="fw-bold mb-3">
				<i class="bi bi-car-front-fill me-2 text-primary"></i>
				Vehículo
				</h5>

				<div class="row">
					<div class="col-12 col-lg-4">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.serie }}
						</div>
						<small class="text-muted">Num. Serie</small>
					</div>
					<div class="col-12 col-lg-8">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.marca }} {{ orden?.vehiculo?.modelo }} {{ orden?.vehiculo?.color }}
						</div>
						<small class="text-muted">Marca / Modelo / Color</small>
					</div>

					<div class="col-6 col-lg-4">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.anio }}
						</div>
						<small class="text-muted">Año</small>
					</div>

					<div class="col-6 col-lg-4">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.placas }}
						</div>
						<small class="text-muted">Placas</small>
					</div>

					<div class="col-6 col-lg-4">
						<div class="fw-semibold">
						{{ orden?.vehiculo?.kilometraje?.toLocaleString() }} km
						</div>
						<small class="text-muted">Kilometraje</small>
					</div>
				</div>
			</div>
		</div>


		<!-- CLIENTE -->
		<div class="card border-1 shadow-sm mb-2">
			<div class="card-body">
				<h5 class="fw-bold mb-3">
					<i class="bi bi-person-fill me-2 text-primary"></i>
					Cliente
				</h5>

				<div class="row">
					<div class="col-5">
						<div class="fw-semibold">
						{{ orden?.cliente?.nombreCompleto }}
						</div>
						<small class="text-muted">Nombre</small>
					</div>

					<div class="col-3">
						<div class="fw-semibold">
						{{ orden?.cliente?.telefono || '—' }}
						</div>
						<small class="text-muted">Teléfono</small>
					</div>

					<div class="col-4">
						<div class="fw-semibold">
						{{ orden?.cliente?.correo || '—' }}
						</div>
						<small class="text-muted">Correo</small>
					</div>		
				</div>
			</div>
		</div>

		<!-- FACTURA -->
		<div v-if="orden?.requiereFactura" class="card border-1 shadow-sm mb-2 no-imprimir">
			<div class="card-body">
				<h5 class="fw-bold mb-3">
					<i class="bi bi-receipt me-2 text-primary"></i>
					Datos de facturación
				</h5>

				<div class="row">
					<div class="col-4">
						<div class="fw-semibold text-uppercase">
						{{ orden?.factura?.rfc }}
						</div>
						<small class="text-muted">RFC</small>
					</div>

					<div class="col-8">
						<div class="fw-semibold">
						{{ orden?.factura?.razonSocial || '—' }}
						</div>
						<small class="text-muted">Razón social</small>
					</div>

					<div class="col-12 col-lg-6">
						<div class="fw-semibold">
						{{ orden?.regimenFiscal || '—' }}
						</div>
						<small class="text-muted">Régimen fiscal</small>
					</div>	
					<div class="col-12 col-lg-6">
						<div class="fw-semibold">
						{{ orden?.usoCFDI || '—' }}
						</div>
						<small class="text-muted">Uso CFDI</small>
					</div>

					<div class="col-12 col-lg-6">
						<div class="fw-semibold">
						{{ orden?.factura.direccion || '—' }}
						</div>
						<small class="text-muted">Domicilio</small>
					</div>	
					<div class="col-6 col-lg-3">
						<div class="fw-semibold">
						{{ orden?.factura.cp || '—' }}
						</div>
						<small class="text-muted">C.P.</small>
					</div>
					<div class="col-6 col-lg-3">
						<div class="fw-semibold">
						{{ orden?.factura.email || '—' }}
						</div>
						<small class="text-muted">Correo</small>
					</div>
				</div>
			</div>
		</div>

		<!-- LLANTAS -->
		<template v-if="tieneLlantas">
			<h5 class="text-uppercase text-muted mt-4 mb-2">Llantas</h5>

			<div class="card border-1 shadow-sm mb-2">
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

			<div class="text-end mb-2 fw-semibold text-primary">
				Subtotal llantas: ${{ subtotalLlantas.toLocaleString() }}
			</div>
		</template>



		<!-- PAQUETES -->
		<template v-if="tienePaquetes">
			<h5 class="text-uppercase text-muted mb-2">Paquetes</h5>

			<div class="card border-1 shadow-sm mb-2">
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

			<div class="text-end mb-2 fw-semibold text-primary">
				Subtotal paquetes: ${{ subtotalPaquetes.toLocaleString() }}
			</div>
		</template>



		<!-- SERVICIOS -->
		<template v-if="tieneServicios">
			<h5 class="text-uppercase text-muted mb-2">Servicios</h5>

			<div class="card border-1 shadow-sm mb-2">
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
		<div class="card border-1 mb-2">
			<div class="card-body d-flex justify-content-between align-items-center">
				<div>
					<h4 class="mb-0 fw-bold">Total</h4>
				</div>

				<h2 class="mb-0 text-success fw-bold">
					${{ totalOrden.toLocaleString() }}
				</h2>
			</div>
		</div>

		<!-- PROGRESO -->
		<!-- <div class="mb-4">
			<h6 class="mb-1">Progreso de la orden</h6>

			<div class="progress" style="height: 22px">
			<div
				class="progress-bar"
				:style="{ width: porcentaje + '%' }"
			>
				{{ porcentaje }}%
			</div>
			</div>
		</div> -->

		<!-- ACCIONES -->
		<div class="d-flex justify-content-between mt-4">
			<button
			class="btn btn-primary shadow position-relative" style="width: 140px;"
			@click="volver"
		><i class="bi bi-arrow-left-circle-fill position-absolute start-0 ms-2"></i>
			Volver
		</button>
			<button
			class="btn btn-primary shadow position-relative" style="width: 140px;"
			@click="imprimir"
		><i class="bi bi-printer-fill position-absolute start-0 ms-2"></i>
			Imprimir
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
    <!-- <small class="text-muted">
      {{ completadas }} / {{ total }} tareas
    </small> -->

</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { proxy } = getCurrentInstance();

const route = useRoute()
const router = useRouter()

const orden = ref(null)

const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const d = new Date(fecha);

    const fechaFormateada = d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaFormateada = d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${fechaFormateada}, ${horaFormateada}`;
  };

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
	console.log(orden.value.idOrdenTrabajo)
	router.push(`/content/orden-trabajo/${orden.value.idOrdenTrabajo}/work`)
}

const cancelarOT = () => {
	// aquí luego cambiamos estado
	router.push('/content/orden-trabajo')
}

const volver = () => {
  	router.push('/content/orden-trabajo')
}

const imprimir = () => {
	window.print();
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

@media print {

  .col-lg-1 { flex: 0 0 auto; width: 8.333333%; }
  .col-lg-2 { flex: 0 0 auto; width: 16.666667%; }
  .col-lg-3 { flex: 0 0 auto; width: 25%; }
  .col-lg-4 { flex: 0 0 auto; width: 33.333333%; }
  .col-lg-5 { flex: 0 0 auto; width: 41.666667%; }
  .col-lg-6 { flex: 0 0 auto; width: 50%; }
  .col-lg-7 { flex: 0 0 auto; width: 58.333333%; }
  .col-lg-8 { flex: 0 0 auto; width: 66.666667%; }
  .col-lg-9 { flex: 0 0 auto; width: 75%; }
  .col-lg-10 { flex: 0 0 auto; width: 83.333333%; }
  .col-lg-11 { flex: 0 0 auto; width: 91.666667%; }
  .col-lg-12 { flex: 0 0 auto; width: 100%; }

  /* Quitar márgenes gigantes */
  @page {
    margin: 8mm;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
	font-size: 14pt;
  }

  /* Ocultar TODO */
  body * {
    visibility: hidden;
  }

  .container,
  .row {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Mostrar solo el área a imprimir */
  #area-imprimir,
  #area-imprimir * {
    font-size: 11pt;
    line-height: 1.5;
    visibility: visible;
  }

  #area-imprimir {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .modal-body {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
  }

  /* 🔥 CLAVE: desactivar table-responsive */
  .table-responsive {
    overflow: visible !important;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group; /* Permite encabezado correcto */
  }

  tfoot {
    display: table-footer-group;
  }

  /* Botones fuera */
  button,
  .btn,
  .no-imprimir {
    display: none !important;
  }

  .modal,
  .modal-dialog,
  .modal-content {
    position: static !important;
    overflow: visible !important;
  }

  .page-break {
    page-break-before: always;
  }
}
</style>
