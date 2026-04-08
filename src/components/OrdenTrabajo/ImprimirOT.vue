<template>
  <div v-if="modelValue" >
  <div id="area-print">
    <div class="container py-4" id="area-imprimir" style="font-size: larger; max-width: 1000px;">
		
		<!-- Header -->
		<div class="card border-1 mb-4">
			<div class="card-body d-flex justify-content-between align-items-center">
				<div class="w-100">
					<h5 class="fw-bold mb-1">
						Orden de Trabajo O{{ props.OT?.prefijoSucursal }}-{{ props.OT?.consecutivoSucursal }}
					</h5>
					<div class="row">
						<div class="col-7">
							<div class="text-muted small">
								<i class="bi bi-person me-1"></i>
								{{ props.OT?.cliente?.nombreCompleto }}
							</div>

							<div class="text-muted small">
								<i class="bi bi-person-badge me-1"></i>
								Técnico: {{ props.OT?.empleado?.nombreCompleto }}
							</div>
						</div>
						<div class="col-5">
							<div class="text-muted small">
								<i class="bi bi-cash me-1"></i>
								Forma de pago: {{ props.OT?.metodoPago }}
							</div>

							<div class="text-muted small">
								<i class="bi bi-record-circle-fill me-1"></i>
								Desechar llantas: {{ props.OT?.desecharLlanta ? 'Sí' : 'No' }}
							</div>
						</div>
					</div>

					<div class="mt-1">
						<i class="bi bi-clock me-1"></i>
						Fecha/hora de entrega: <strong>{{ formatearFecha(props.OT?.fechaEntrega) }}</strong>
					</div>
				</div>

				<span class="badge px-3 py-2 fs-6" :class="estadoClass">
				{{ props.OT?.estado }}
				</span>
			</div>
		</div>
		
<!-- DATOS VEHICULO + CLIENTE -->
<div class="card border-1 shadow-sm mb-2 card-datos">
  <div class="card-body">

    <div class="row">

      <!-- VEHICULO -->
      <div class="col-6">
        <h5 class="fw-bold mb-3">
          <i class="bi bi-car-front-fill me-2 text-primary"></i>
          Vehículo
        </h5>

        <div class="mb-1">
          <span class="fw-semibold">Num. Serie:</span>
          {{ props.OT?.vehiculo?.serie }}
        </div>

        <div class="mb-1">
          <span class="fw-semibold">Marca / Modelo / Color:</span>
          {{ props.OT?.vehiculo?.marca }} {{ props.OT?.vehiculo?.modelo }} {{ props.OT?.vehiculo?.color }}
        </div>

        <div class="mb-1">
          <span class="fw-semibold">Año:</span>
          {{ props.OT?.vehiculo?.anio }}
        </div>

        <div class="mb-1">
          <span class="fw-semibold">Placas:</span>
          {{ props.OT?.vehiculo?.placas }}
        </div>

        <div class="mb-1">
          <span class="fw-semibold">Kilometraje:</span>
          {{ props.OT?.vehiculo?.kilometraje?.toLocaleString() }} km
        </div>
      </div>


      <!-- CLIENTE -->
      <div class="col-6">
        <h5 class="fw-bold mb-3">
          <i class="bi bi-person-fill me-2 text-primary"></i>
          Cliente
        </h5>

        <div class="mb-1">
          <span class="fw-semibold">Nombre:</span>
          {{ props.OT?.cliente?.nombreCompleto }}
        </div>

        <div class="mb-1">
          <span class="fw-semibold">Teléfono:</span>
          {{ props.OT?.cliente?.telefono || '—' }}
        </div>

        <div class="mb-1">
          <span class="fw-semibold">Correo:</span>
          {{ props.OT?.cliente?.correo || '—' }}
        </div>
      </div>

    </div>

  </div>
</div>
		<!-- FACTURA -->
		<div v-if="props.OT?.requiereFactura" class="card border-1 shadow-sm mb-2">
			<div class="card-body">
				<h5 class="fw-bold mb-3">
					<i class="bi bi-receipt me-2 text-primary"></i>
					Datos de facturación
				</h5>

				<div class="row">
					<div class="col-4 mb-1">
						<span class="fw-semibold">RFC: </span>
						<span class="text-uppercase">
						{{ props.OT?.factura?.rfc }}
						</span>
					</div>

					<div class="col-8 mb-1">
						<span class="fw-semibold">Razón social: </span>
						{{ props.OT?.factura?.razonSocial || '—' }}
						
					</div>
					
					<div class="col-12 col-lg-6 mb-1">
						<span class="fw-semibold">Régimen fiscal: </span>
						{{ props.OT?.regimenFiscal || '—' }}
						
					</div>	
					
					<div class="col-12 col-lg-6 mb-1">
						<span class="fw-semibold">Uso CFDI: </span>
						{{ props.OT?.usoCFDI || '—' }}
						
					</div>

					<div class="col-12 col-lg-6 mb-1">
						<span class="fw-semibold">Domicilio: </span>
						{{ props.OT?.factura.direccion || '—' }}
						
					</div>	
					<div class="col-6 col-lg-2 mb-1">
						<span class="fw-semibold">C.P. </span>
						{{ props.OT?.factura.cp || '—' }}
			
					</div>

					<div class="col-6 col-lg-4 mb-1">
						<span class="fw-semibold">Correo: </span>
						{{ props.OT?.factura.email || '—' }}
						
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
						v-for="llanta in OT.insumo.llantas"
						:key="llanta.idDetalleOTLlanta"
						class="list-group-item py-3 item-check renglon "
						>
						<div class="d-flex justify-content-between align-items-start">
							<div>
								<div class="fw-semibold">
									{{ llanta.descripcion }}
								</div>
								<small class="text-muted">
									Cantidad: {{ llanta.cantidad }} ·
									${{ formatNumber(llanta.precioUnitario) }} c/u
								</small>
							</div>

							<div
  v-if="(llanta.idPromocion != null && llanta.idPromocion !== 0) 
     || (llanta.idPromocionVuelo != null && llanta.idPromocionVuelo !== 0)"
  class="d-flex flex-column align-items-end"
>
  <!-- Precio anterior -->
  <span class="text-decoration-line-through text-muted small">
    {{
      (llanta.cantidad * llanta.precioUnitario).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      })
    }}
  </span>

  <!-- Promo + precio final -->
  
    <small class="badge bg-danger">
      {{ llanta?.promo.nombre || "Descuento" }}
    </small>

    <span class="text-success fw-bold">
      {{
        Number(llanta.subTotal).toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
        })
      }}
    </span>
	</div>

							<div v-else class="text-end">
							{{
								Number(llanta.subTotal).toLocaleString("es-MX", {
								style: "currency",
								currency: "MXN",
								})
							}}
							</div>
						</div>
					</li>
				</ul>
			</div>

			
		</template>



		<!-- PAQUETES -->
		<template v-if="tienePaquetes">
			<h5 class="text-uppercase text-muted mb-2">Paquetes</h5>

			<div class="card border-1 shadow-sm mb-2">
				<ul class="list-group list-group-flush">
					<li
					v-for="paquete in OT.insumo.paquetes"
					:key="paquete.idDetalleOTPaquete"
					class="list-group-item py-3 item-check renglon"					>
						<div class="d-flex justify-content-between">
							<div>
								<div class="fw-semibold">
									{{ paquete.nombre.toUpperCase() }}, {{ paquete.descripcion.toUpperCase() }}
								</div>
								<small class="text-muted">
									Subtotal: ${{ formatNumber(paquete.precioUnitario) }}
								</small>
							</div>

							<div
						v-if="(paquete.idPromocion != null && paquete.idPromocion !== 0) 
							|| (paquete.idPromocionVuelo != null && paquete.idPromocionVuelo !== 0)"
						class="d-flex flex-column align-items-end"
						>
						<!-- Precio anterior -->
						<span class="text-decoration-line-through text-muted small">
							{{
							( paquete.precioUnitario).toLocaleString("es-MX", {
								style: "currency",
								currency: "MXN",
							})
							}}
						</span>

						<!-- Promo + precio final -->
						<!--<div class="d-flex align-items-center gap-2"> -->
							<small class="badge bg-danger">
							{{ paquete?.promo.nombre}}
							</small>
							<span class="text-success fw-bold">
							{{
								Number(paquete.subTotal).toLocaleString("es-MX", {
								style: "currency",
								currency: "MXN",
								})
							}}
							</span>
						<!-- </div> -->
						</div>

						<div v-else class="text-end">
						{{
							Number(paquete.subTotal).toLocaleString("es-MX", {
							style: "currency",
							currency: "MXN",
							})
						}}
						</div>
						</div>

						<div class="mt-2 small text-muted">

						<div
							v-for="d in paquete.detalle"
							:key="d.idDesglosePaquete"
							class="paquete-item item-check"
							>
							{{ d.descripcion }} (x{{ d.cantidad }})
							</div>
						</div>


					</li>

				</ul>
			</div>

			
		</template>



		<!-- SERVICIOS -->
		<template v-if="tieneServicios">
			<h5 class="text-uppercase text-muted mb-2">Servicios</h5>

			<div class="card border-1 shadow-sm mb-2">
				<ul class="list-group list-group-flush">

					<li
					v-for="s in OT.insumo.adicionales"
					:key="s.idDetalleOTServicio"
					class="list-group-item py-3 item-check renglon"					>



						<div class="d-flex justify-content-between">
							<div>
								<div class="fw-semibold">
									{{ s.descripcion }}
								</div>
								<small class="text-muted">
									Cantidad: {{ s.cantidad }} · ${{ formatNumber(s.precioUnitario) }} c/u
								</small>
							</div>

							<div
						v-if="(s.idPromocion != null && s.idPromocion !== 0) 
							|| (s.idPromocionVuelo != null && s.idPromocionVuelo !== 0)"
						class="d-flex flex-column align-items-end"
						>
						<!-- Precio anterior -->
						<span class="text-decoration-line-through text-muted small">
							{{
							(s.cantidad * s.precioUnitario).toLocaleString("es-MX", {
								style: "currency",
								currency: "MXN",
							})
							}}
						</span>

						<!-- Promo + precio final -->
						<div class="d-flex align-items-center gap-2">
							<small class="badge bg-danger">
							{{ s?.promo.nombre }}
							</small>

							<span class="text-success fw-bold">
							{{
								Number(s.subTotal).toLocaleString("es-MX", {
								style: "currency",
								currency: "MXN",
								})
							}}
							</span>
						</div>
						</div>

						<div v-else class="text-end">
						{{
							Number(s.subTotal).toLocaleString("es-MX", {
							style: "currency",
							currency: "MXN",
							})
						}}
						</div>
						</div>
					</li>

				</ul>
			</div>

			
		</template>

		<!-- TOTAL -->
		<div class="card border-1 mb-2">
			<div class="card-body d-flex justify-content-between align-items-center">
				<div>
					<h4 class="mb-0 fw-bold">Total</h4>
				</div>

				<h4 class="mb-0 text-success fw-bold">
					${{ totalFinalOrden }}
				</h4>
			</div>
		</div>
	</div>
  </div>
</div>
	


</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';


const props = defineProps({
  modelValue: Boolean,
  OT: Object,
});

const emit = defineEmits(["update:modelValue"]);

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
		console.log("OT IMPRIMIR:" , props.OT)
      await nextTick(); // espera a que renderice
      window.print();
    }
  }
);
window.onafterprint = () => {
  emit("update:modelValue", false);
};

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '';

  return Number(value).toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

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
 

const subtotalPaquetes = computed(() => {
	if (!props.OT?.insumo?.paquetes) return 0;

	return props.OT.insumo.paquetes.reduce(
		(total, p) => total + Number(p.subTotal || 0),
		0
	);
});

const subtotalServicios = computed(() => {
	if (!props.OT?.insumo?.adicionales) return 0;

	return props.OT.insumo.adicionales.reduce(
		(total, s) => s.total === 0 ? total + (s.cantidad * s.precioUnitario) : total + s.total,
		0
	);
});



const tieneLlantas = computed(() =>
  	props.OT?.insumo?.llantas?.length > 0
);

const tienePaquetes = computed(() =>
  	props.OT?.insumo?.paquetes?.length > 0
);

const tieneServicios = computed(() =>
	  props.OT?.insumo?.adicionales?.length > 0
);
const precioFinalItem = (item) => {
  const base = item.precioUnitario ?? 0;
  const valor = item?.valorVuelo || item?.valorPromocion || null;

  // si tiene tipo Promo false es Monto, si es true es Porcentual
  if ((item.idPromocion || item.idPromocionVuelo) && valor != null) {
	return item?.tipoPromocion || item?.tipoVuelo
	  ? item?.cantidad ? base * (1 - valor / 100) * item.cantidad :  base * (1 - valor / 100)
	  : item?.cantidad ? Math.max(0, base - valor) * item?.cantidad : Math.max(0, base - valor);
  } else {
	return item.cantidad ? base * item.cantidad : base;
  }
}
const totalFinalOrden = computed(() => {
	let total = 0;

	const insumo = props.OT.insumo || {};

	["llantas", "paquetes", "adicionales"].forEach(tipo => {
		if (insumo[tipo]) {
			insumo[tipo].forEach(item => {
				total += Number(item.subTotal || 0);
			});
		}
	});

	return formatNumber(total);
});
</script>
<style >
@page {

  margin: 5mm;
}
@media print {
	html, body {
		margin: 0;
		padding: 0;

	}

  #area-print {
    position: static;
	
   
  }
  
  /* quitar padding bootstrap */
  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }

  /* ===== QUITAR CARDS VISUALES ===== */
  .card {
    border: none !important;
    box-shadow: none !important;
    margin-bottom: 6px !important;
	font-size: 11pt;
  }

  .card-body {
    padding: 4px 0 !important;
  }

  /* ===== CARD SOLO PARA VEHICULO Y CLIENTE ===== */
  .card-datos {
    border: 1px solid #ccc !important;
    padding: 10px !important;
    border-radius: 6px;
    page-break-inside: avoid;
  }

  /* ocultar iconos */
  i {
    display: none !important;
  }

  /* ocultar botones */
  button {
    display: none !important;
  }

  /* ocultar secciones */
  .no-imprimir {
    display: none !important;
  }

  /* listas simples */
  .list-group {
    list-style: none !important;
    padding-left: 0 !important;
  }

  .list-group-item {
    border: none !important;
    padding: 4px 0 !important;
  }

  /* ===== CHECKBOX DECORATIVO ===== */

  .item-check {
    position: relative;
    padding-left: 24px !important;
  }

  .item-check::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    width: 14px;
    height: 14px;
    border: 2px solid #000;
    border-radius: 2px;
  }

  /* ===== RENGLONES PARA LLANTAS / PAQUETES / SERVICIOS ===== */

  .renglon {
    border-bottom: 1px solid #cfcfcf !important;
    padding-bottom: 6px !important;
    margin-bottom: 4px !important;
  }

  .renglon:last-child {
    border-bottom: 1px solid #cfcfcf !important;
  }

  /* ===== DESGLOSE DE PAQUETES ===== */

  .paquete-item {
    border-bottom: 1px solid #ddd;
    padding: 3px 0;
  }

  .paquete-item:last-child {
    border-bottom: none;
  }

  /* compactar títulos */
  h5 {
    margin-top: 6px !important;
    margin-bottom: 4px !important;
  }

  /* total grande */
  h2 {
    font-size: 26px !important;
  }

  /* compactar columnas */
  .row > div {
    margin-bottom: 2px !important;
  }

}
</style>