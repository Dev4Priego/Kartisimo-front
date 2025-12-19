<template>
	<div 
		class="modal fade show"
		tabindex="-1" 
		style="display: block;" 
		:style="{ background: 'rgba(0,0,0,0.5)' }"
		v-if="modelValue"
		@click="handleBackdropClick"

	>
		
		<div class="modal-dialog modal-centered modal-dialog-scrollable modal-xl" style="max-width: 95vw;">
			<div class="modal-content">
				
				<div class="modal-header">
					<h5 class="modal-title">{{ title }}</h5>
					<button type="button" class="btn-close" @click="close"></button>
				</div>

				<div class="modal-body p-5">
					
					<!-- PAQUETES -->
					<div class="row">
						<h3 class="text-start mx-5">Paquetes</h3>
						<div class="col text-start my-3">
							<div v-for="(paquete, i) in paqueteDisponibles" :key="i" class="form-check-inline">
								<input 
									class="form-check-input mx-2" 
									type="checkbox" 
									:value="paquete.idPaquete" 
									v-model="paqueteSeleccionados"
									@change="onTogglePaquete(paquete)"
								>
								<label class="form-check-label" :for="'paquete-' + i">
									{{ paquete.nombre }} - ${{ paquete.precioUnitario }}
								</label>
							</div>
						</div>
					</div>

					<!-- LLANTAS -->
					<div class="row">
						<h3 class="text-start mx-5">Llantas</h3>
						<!-- Filtros -->
						<div class="d-flex gap-3 mb-3">

							<!-- Buscar -->
							<input 
								type="text" 
								class="form-control"
								placeholder="Buscar (modelo, marca, medidas...)"
								v-model="search"
								@input="onSearch"
								style="max-width: 300px"
							/>
							
							<!-- Filtro por almacén -->
							<div class="position-relative">
								<button
									type="button"
									class="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
									@click="dropdownOpen = !dropdownOpen"
								>
									<span>{{  'Elegir almacenes' }}</span>
									<i class="bi bi-caret-down-fill"></i>
								</button>
								<div
									v-if="dropdownOpen"
									class="border rounded shadow bg-white position-absolute w-100 mt-1 p-2"
									style="z-index: 1050;"
									@mouseleave="dropdownOpen = false"
								>
									<div class="form-check mb-2">
										<input
											type="checkbox"
											class="form-check-input"
											id="alm-todos"
											@change="toggleTodos"
											:checked="selectedAlmacenes.length === 0"
										/>
										<label class="form-check-label" for="alm-todos">
											Todos
										</label>
									</div>

									<div
										v-for="alm in almacenes"
										:key="alm.id"
										class="form-check"
									>
										<input
											type="checkbox"
											class="form-check-input"
											:id="'alm-' + alm.id"
											:value="alm.id"
											v-model="selectedAlmacenes"
											@change="onAlmacenesChanged"
										/>
										<label class="form-check-label" :for="'alm-' + alm.id">
											{{ alm.nombre }}
										</label>
									</div>
								</div>
							</div>
						</div>


						<!-- TABLA HTML -->
						<div class="table-responsive fixed-header-table">
							<table class="table">
								<thead>
									<tr>
										<th>Código</th>
										<th>Modelo</th>
										<th>Marca</th>
										<th>Medidas</th>
										<th>Rango</th>
										<th>Precio</th>
										<th>Almacén</th>
										<th>Cantidad</th>
										<th></th>
									</tr>
								</thead>

								<tbody>
									<tr v-for="(item, index) in items" :key="index">
										<td>{{ item.codigo }}</td>
										<td>{{ item.modelo }}</td>
										<td>{{ item.marca }}</td>
										<td>{{ item.medida }}</td>
										<td>{{ item.rango }}</td>
										<td>{{ item.precio }}</td>
										<td>{{ item.ubicacion }}</td>
										<td>{{ item.cantidad }}</td>
										<td>
											<button
												v-if="!llantas.some(ll => ll.idLlanta === item.idLlanta)"
												type="button"
												class="btn btn-success btn-sm d-flex align-items-center gap-1"
												@click="agregarLlanta(item.objLlanta)"
											>
												<i class="bi bi-plus"></i>                                            
											</button>
											<span v-else class="text-secondary small">
												Ya agregada
											</span>
										</td>
									</tr>

									<tr v-if="items.length === 0">
										<td colspan="8" class="text-center py-3">
											No hay datos disponibles
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- PAGINACIÓN -->
						<div class="d-flex justify-content-between align-items-center mt-3">
							
							<!-- Total -->
							<div>
								<strong>Página {{ page }}:</strong> 
								{{ items.length }} resultados (Total: {{ totalRows }})
							</div>

							<!-- Controles -->
							<div>
								<button class="btn btn-secondary me-2"
									@click="prevPage"
									:disabled="page <= 1"
									type="button"
								>
									◀ Anterior
								</button>

								<button class="btn btn-secondary"
									@click="nextPage"
									:disabled="page >= totalPages"
									type="button"
								>
									Siguiente ▶
								</button>
							</div>



							<!-- Selector de filas por página -->
							<div>
								<select class="form-control" v-model="rowsPerPage" @change="onRowsChange">
									<option value="10">10</option>
									<option value="20">20</option>
									<option value="50">50</option>
									<option value="100">100</option>
								</select>
							</div>

						</div>
					</div>
					<hr>
					<!-- TABLA RESUMEN DE PRODUCTOS Y SERVICIOS -->
					<div class="mt-4">
						<h4 class="mb-3">Resumen de productos y servicios</h4>

						<div class="table-responsive">
							<table class="table fixed-header-table">
								<thead >
									<tr>
										<th>Concepto trabajo</th>
										<th>Descripción</th>
										<th>Cantidad</th>
										<th>P/U</th>
										<th>Subtotal</th>
										<th>Acciones</th>
									</tr>
								</thead>
								<tbody>

									<!-- LLANTAS -->
									<tr v-for="(ll, i) in llantas || []" :key="'ll-' + i">
										<td>
											<select
												class="form-select form-select-sm"
												v-model="ll.idConceptoTrabajo"
											>
												<!-- Default -->
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
										<td>{{ ll.medida }} {{ ll.marca }} {{ ll.modelo }} </td>
										<td>
											<input
												type="number"
												min="1"
												class="form-control form-control-sm"
												v-model.number="ll.cantidad"
												@input="recalcularSubtotal(ll)"
											/>
										</td>
										<td>
											<input
												type="number"
												min="0"
												step="0.01"
												class="form-control form-control-sm input-precio-unitario"
												v-model.number="ll.precioUnitario"
												@input="recalcularSubtotal(ll)"
												@keydown="irAlSiguientePrecio"
											/>
										</td>

										<td>
											<div v-if="ll.idPromocion != null && ll.idPromocion !== 0">
                                                <span class="text-decoration-line-through text-muted">
                                                    {{ (ll.cantidad * ll.precioUnitario).toLocaleString('es-MX', { style: 'currency', currency:'MXN'}) }}
                                                </span>
                                                <span class="text-success fw-bold mx-2">
                                                    {{ (Number(ll.subTotal)).toLocaleString('es-MX', { style: 'currency', currency:'MXN'}) }}
                                                </span>
                                            </div>
                                            <div v-else>
                                                {{ (Number(ll.subTotal)).toLocaleString('es-MX', { style: 'currency', currency:'MXN'}) }}
                                            </div>
										</td>
										<td>
											<select
												class="form-select"
												v-model="ll.idPromocion"
												@change="onPromoChange(ll)"
											>
												<!-- Default -->
												<option :value="0">-- Sin promoción --</option>

												<!-- Promociones disponibles -->
												<option
													v-for="promo in ll.promosDisponibles"
													:key="promo.idPromocion"
													:value="promo.idPromocion"
												>
													{{ promo.nombre }} 	( {{ promo.tipo ? promo.valor + '%' : '$' + promo.valor }}	)
												</option>
											</select>

											<button 
												type="button"
												class="btn btn-danger btn-sm"
												@click="borrarInsumo(ll)"
											>
												<i class="bi bi-trash"></i> Borrar
											</button>
										</td>
									</tr>

									<!-- PAQUETES + DETALLES -->
									<template v-for="(paq, j) in paquetes || []" :key="'paq-' + j">

										<!-- FILA DEL PAQUETE -->
										<tr>
											<td></td>

											<td>{{ paq.descripcion }}</td>
											<td>{{ paq.cantidad }}</td>

											<td>
												{{ Number(paq.precioUnitario).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
											</td>

											<td>
												<div v-if="paq.idPromocion && paq.idPromocion !== 0">
													<span class="text-decoration-line-through text-muted">
														{{ (paq.cantidad * paq.precioUnitario).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
													</span>
													<span class="text-success fw-bold mx-2">
														{{ Number(paq.subTotal).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
													</span>
												</div>
												<div v-else>
													{{ Number(paq.subTotal).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
												</div>
											</td>

											<td>
												<select
													class="form-select"
													v-model="paq.idPromocion"
													@change="onPromoChange(paq)"
												>
													<option :value="0">-- Sin promoción --</option>
													<option
														v-for="promo in paq.promosDisponibles"
														:key="promo.idPromocion"
														:value="promo.idPromocion"
													>
														{{ promo.nombre }} ({{ promo.tipo ? promo.valor + '%' : '$' + promo.valor }})
													</option>
												</select>

												<button
													type="button"
													class="btn btn-danger btn-sm mt-1"
													@click="borrarPaquete(paq)"
												>
													<i class="bi bi-trash"></i> Borrar
												</button>
											</td>
										</tr>

										<!-- FILAS DE DETALLE DEL PAQUETE -->
										<tr
											v-for="(det, k) in paq.detalle || []"
											:key="'det-' + paq.idPaquete + '-' + k"
										>
											<td>
												<select
													class="form-select form-select-sm"
													v-model="paq.idConceptoTrabajo"
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
											<td class="ps-4">↳ {{ det.descripcion }}</td>
											<td>{{ det.cantidad }}</td>
											<td>
												{{ Number(det.precioUnitario).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
											</td>
											<td>{{ Number(det.subTotal).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}</td>
											<td></td>
										</tr>

									</template>


									<!-- ADICIONALES -->
									<tr v-for="(ad, m) in adicionales || []" :key="'ad-' + m">
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

										<td>{{ ad.descripcion }}</td>

										<td>{{ ad.cantidad }}</td>

										<td>
											{{ Number(ad.precioUnitario).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
										</td>

										<td>
											<div v-if="ad.idPromocion && ad.idPromocion !== 0">
												<span class="text-decoration-line-through text-muted">
													{{ (ad.cantidad * ad.precioUnitario).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
												</span>
												<span class="text-success fw-bold mx-2">
													{{ Number(ad.subTotal).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
												</span>
											</div>
											<div v-else>
												{{ Number(ad.subTotal).toLocaleString('es-MX', { style:'currency', currency:'MXN' }) }}
											</div>
										</td>

										<td>
											<select
												class="form-select"
												v-model="ad.idPromocion"
												@change="onPromoChange(ad)"
											>
												<option :value="0">-- Sin promoción --</option>

												<option
													v-for="promo in ad.promosDisponibles"
													:key="promo.idPromocion"
													:value="promo.idPromocion"
												>
													{{ promo.nombre }} ({{ promo.tipo ? promo.valor + '%' : '$' + promo.valor }})
												</option>
											</select>

											<button
												type="button"
												class="btn btn-danger btn-sm mt-1"
												@click="borrarAdicional(ad)"
											>
												<i class="bi bi-trash"></i> Borrar
											</button>
										</td>
									</tr>
								</tbody>
							</table>

							<button
								type="button"
								class="btn btn-primary"
								@click="mostrarModalAdicional = true"
							>
								Agregar adicionales
							</button>

							<ModalAdicional
								v-if="mostrarModalAdicional"
								v-model:adicionales="adicionales"
								:conceptoOT="conceptoOT"
								@cerrar="mostrarModalAdicional = false"
							/>
						</div>
					</div>
				</div>

				<div class="modal-footer">
					<button class="btn btn-secondary" @click="close">Cerrar</button>
				</div>			
			</div>
		</div>
	</div>
</template>

<script setup>
	
import { defineProps, defineEmits, watch, onMounted, ref, getCurrentInstance, computed } from "vue";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import ModalAdicional from "./ModalAdicional.vue";

const props = defineProps({
	modelValue: Boolean,
	title: { type: String, default: "Modal" },
	insumos: Object
});

const mostrarModalAdicional = ref(false);

const llantas = ref([]);
const paquetes = ref([]);
const adicionales = ref([]);

// mirar si hay cambios en prpos.insumo, si hay cambios copiar el arreglo y establecer el del componente
watch(
    () => props.insumos,
    (nuevo) => {
        llantas.value = [...(nuevo.llanta || [])];
        paquetes.value = [...(nuevo.paquete || [])];
        adicionales.value = [...(nuevo.adicional || [])];
    },
    { immediate: true } // carga inicial
);

const emit = defineEmits(["update:modelValue"]);
const close = () => emit("update:modelValue", false);

const { proxy } = getCurrentInstance();

// Estados
const items = ref([]);
const totalRows = ref(0);
const page = ref(1);
const rowsPerPage = ref(20);
const loading = ref(false);
const search = ref("");

const almacenes = ref([]);
const selectedAlmacenes = ref([]);  
const dropdownOpen = ref(false);     

const conceptoOT = ref([]);

const paqueteDisponibles = ref([]);
const paqueteSeleccionados = ref([]);


// Si existe idPromocion, Busca la promo en ll.promosDisponibles, Copia los datos importantes al item, recalcula Subtotal
const onPromoChange = (item) => {
    if (!item.idPromocion || item.idPromocion === 0) {
        // Sin promoción
        item.valorPromocion = null;
        item.tipoPromocion = null;
        item.excluirPromocionGeneral = false;
    } else {
        const promo = item.promosDisponibles.find(
            p => p.idPromocion === item.idPromocion
        );

        if (promo) {
			item.nombrePromocion = promo.nombre
            item.valorPromocion = promo.valor;
            item.tipoPromocion = promo.tipo; // true = porcentaje, false = monto
        }
    }

    recalcularSubtotal(item);
};



const precioFinalItem = (item) => {
    const base = item.precioUnitario ?? 0;

    // Aplica promoción individual si existe
    if (item.idPromocion && item.valorPromocion != null) {
        return item.tipoPromocion
        ? base * (1 - item.valorPromocion / 100) // porcentaje
        : Math.max(0, base - item.valorPromocion); // monto fijo
    }

    // Sin promoción
    return base;
};

const recalcularSubtotal = (item) => {
    const precioFinal = precioFinalItem(item); // aplica promo si existe
    const subtotal = (item.cantidad || 0) * precioFinal;

    item.subTotal = subtotal.toFixed(2);
};


const borrarInsumo = (insumo) => {
    insumo.eliminado = true;

    llantas.value = llantas.value.filter(
        x => x.idLlanta !== insumo.idLlanta
    );

    mostrarToast("success", "Insumo eliminado");
};

const borrarPaquete = (paquete) => {
    paquete.eliminado = true;

    paquetes.value = paquetes.value.filter(
        x => x.idPaquete !== paquete.idPaquete
    );

    mostrarToast("success", "Paquete eliminado");
};


const borrarAdicional = (adicional) => {
    adicional.eliminado = true;

    adicionales.value = adicionales.value.filter(
        x => x.idDetalleCotizacionServicio !== adicional.idDetalleCotizacionServicio
    );

    mostrarToast("success", "Servicio eliminado");
};



const mostrarToast = (type, message) => {
	const color = type === "success" 
		? "linear-gradient(to right, #96c93d)" 
		: type === "warning"
		? "linear-gradient(to right, #f5af19, #f12711)"
		: "linear-gradient(to right, #6dd5ed, #2193b0)";

	Toastify({
		text: message,
		duration: 3000,
		close: true,
		gravity: "top",
		position: "right",
		stopOnFocus: true,
		style: {
			background: color,
			borderRadius: "6px",
			color: "white",
			fontSize: "14px",
			boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
		},
	}).showToast();
};

const cargarAlmacenes = async () =>{
	try {
		const response = await fetch(`${proxy.$serverIP}api/Almacen/getAlmacen`)
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`)
		}

		const data = await response.json()   // <- aquí parseas el JSON real

		//console.log('Datos recibidos:', data)
		// Aquí mapeamos para que tenga el mismo formato que esperabas
		almacenes.value = data.map(a => ({
			id: a.idAlmacen,
			nombre: a.nombre
		}))
		
	} catch (error) {
		console.error('Error cargando almacenes:', error)
	}
}

// --- Seleccionar TODOS ---
const toggleTodos = () => {
    selectedAlmacenes.value = [];   
    cargarLlantas();             
};

// --- Cambio individual de almacén ---
const onAlmacenesChanged = () => {
    cargarLlantas();
}; 


// Total de páginas
const totalPages = computed(() =>
	Math.ceil(totalRows.value / rowsPerPage.value)
);

// Cargar datos paginados
const cargarLlantas = async () => {
    loading.value = true;

    try {
		// Aplicar filtro por Almacen
        const almacenesCsv = selectedAlmacenes.value.length > 0
                ? selectedAlmacenes.value.join(",")
                : '';// "8,5,10"

        const url =
            `${proxy.$serverIP}api/Llanta/getLlantaPrecio-Paginado?page=${page.value}` +
            `&pageSize=${rowsPerPage.value}` +
            `&search=${encodeURIComponent(search.value || '')}` +
            `&idAlmacenes=${encodeURIComponent(almacenesCsv)}`;

        const res = await fetch(url);
        const data = await res.json();

        totalRows.value = Number(data.totalRows || 0);

        items.value = data.items.map(l => ({
            codigo: l.codigo,
            modelo: l.modelo,
            marca: l.nombreMarca,
            medida: l.medidas,
            rango: l.rango,
            precio: Number(l.precio),
            ubicacion: l.nombreAlmacen,
            cantidad: Number(l.cantidad),

            idLlanta: l.idLlanta,
            idInventarioInicial: l.idInventarioInicial,
            idAlmacen: l.idAlmacen,
			objLlanta: l
        }));

    } finally {
        loading.value = false;
    }
};

// Botón "Anterior"
const prevPage = () => {
	if (page.value > 1) {
		page.value--;
		cargarLlantas();
	}
};

// Botón "Siguiente"
const nextPage = () => {
	if (page.value < totalPages.value) {
		page.value++;
		cargarLlantas();
	}
};

// Cambio en rowsPerPage
const onRowsChange = () => {
	page.value = 1;
	cargarLlantas();
};

// Watchers
watch(search, () => {
	page.value = 1;
	cargarLlantas();
});

// Cerrar con ESC
function handleEsc(event) {
	if (event.key === "Escape") close();
}

watch(() => props.modelValue, v => {
	if (v) document.addEventListener("keydown", handleEsc);
	else document.removeEventListener("keydown", handleEsc);
});


const obtenerPromosPorPaquete = async (idPaquete) => {
        try {
            const res = await fetch(
                `${proxy.$serverIP}api/Promocion/getPromocionPoridPaquete?idPaquete=${idPaquete}`
            );

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

            const data = await res.json();
            return Array.isArray(data) ? data.filter(p => p.activo) : [];
        } catch (error) {
            console.error("Error al obtener promociones por paquete:", error);
            return [];
        }
    };



const obtenerPromosPorInventario = async (idInventarioInicial) => {
	try {
		const res = await fetch(
			`${proxy.$serverIP}api/Promocion/getPromocionPorInventario?idInventario=${idInventarioInicial}`
		);

		if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

		const data = await res.json();
		// Puedes filtrar por vigencia/activo si quieres
		return Array.isArray(data) ? data.filter(p => p.activo) : [];
	} catch (error) {
		console.error('Error al obtener promociones por inventario:', error);
		return [];
	}
};
const agregarLlanta = async (itm) => {

	if (llantas.value.length >= 6) {
		mostrarToast("warning", "No puedes agregar más de 6 llantas");
		return;
	}

	const yaExiste = llantas.value.some(
		l => l.idInventarioInicial === itm.idInventarioInicial
	);

	if (yaExiste) {
		mostrarToast("warning", "Esta llanta ya fue agregada");
		return;
	}

	const nuevaLlanta = {
		idLlanta: itm.idLlanta,
		idAlmacen: itm.idAlmacen,
		idPromocion: 0,
		idConceptoTrabajo: 1,
		idInventarioInicial: itm.idInventarioInicial,

		descripcion: `${itm.medidas} ${itm.rango} ${itm.modelo}`,
		medida: itm.medidas,        // estético
		modelo: itm.modelo,        // estético
		marca: itm.nombreMarca,          // estético
		ubicacion: itm.ubicacion,  // estético

		cantidad: 4,
		precioUnitario: Math.trunc(itm.precio || 0),
		subTotal: (4 * Math.trunc(itm.precio || 0)).toFixed(2),

		promosDisponibles: [],

		// valores históricos (vacíos inicialmente)
		nombrePromocion: null,
		valorPromocion: null,
		tipoPromocion: null
	};

	try {
		const promos = await obtenerPromosPorInventario(
			itm.idInventarioInicial
		);

		nuevaLlanta.promosDisponibles = promos || [];
	} catch (error) {
		console.error("Error al cargar promociones", error);
		nuevaLlanta.promosDisponibles = [];
	}

	// agregar
	llantas.value.push(nuevaLlanta);

	// ordenar (opcional, como ya lo tenías)
	llantas.value.sort((a, b) => {
		const prioridad = (llanta) => {
			const marca = llanta.marca?.toUpperCase() || '';
			if (marca.includes('BRIDGESTONE')) return 1;
			if (marca.includes('FIRESTONE')) return 2;
			return 3;
		};

		const pa = prioridad(a);
		const pb = prioridad(b);

		if (pa !== pb) return pa - pb;
		return (b.precioUnitario || 0) - (a.precioUnitario || 0);
	});
};


const irAlSiguientePrecio = (event) => {

	const isTab = event.key === "Tab";
	const isEnter = event.key === "Enter";
	const isShift = event.shiftKey;

	// Solo intercepta Tab o Enter
	if (!isTab && !isEnter) return;

	event.preventDefault(); // Evita comportamiento por defecto

	// Obtener todos los inputs
	const inputs = Array.from(document.querySelectorAll('.input-precio-unitario'));
	const currentIndex = inputs.indexOf(event.target);

	// ⬅⬅⬅ Retroceder con Shift + Tab
	if (isTab && isShift) {
		if (inputs[currentIndex - 1]) {
			inputs[currentIndex - 1].focus();
		} else {
			// Si es el primero, ir al último
			inputs[inputs.length - 1]?.focus();
		}
		return;
	}

	// ➡➡➡ Avanzar con Tab o Enter
	if (inputs[currentIndex + 1]) {
		inputs[currentIndex + 1].focus();
	} else {
		// Si está en el último, vuelve al primero
		inputs[0]?.focus();
	}
};

const cargarConcpetoTrabajo = async () => {
	try {
		const response = await fetch(`${proxy.$serverIP}api/ConceptoTrabajo/get`)
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`)
		}

		const data = await response.json()

		conceptoOT.value = data.map(a => ({
			idConceptoOrdenTrabajo: a.idConcetoOrdenTrabajo,
			nombre: a.nombre
		}))

		// console.log('Datos recibidos:', conceptoOT.value)
		
	} catch (error) {
		console.error('Error cargando ConceptoTrabajo:', error)
	}
}

const cargarPaquetes = async () => {
	try {
		const response = await fetch(`${proxy.$serverIP}api/Paquetes/getPaquete`);

		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status}`);
		}

		const data = await response.json();

		paqueteDisponibles.value = data.map(p => ({
			idPaquete: p.idPaquete,
			nombre: p.nombre,
			descripcion: p.descripcion,
			precioUnitario: p.precioUnitario,

			// 👉 MISMO NOMBRE que usas después
			detalle: (p.detalle || []).map(d => ({
				idDesglosePaquete: d.idDesglosePaquete,
				nombre: d.descripcion,
				cantidad: d.cantidad,
				precioUnitario: d.precioUnitario
			}))
		}));
		console.log(paqueteDisponibles)
	} catch (error) {
		console.error('Error cargando paquetes:', error);
	}
};


// si hay cambios en el arreglo de paquetes, marca los checboxes de los paquetes que existan en el arreglo
watch(
	() => paquetes.value,
	(nuevoValor) => {
		if (!Array.isArray(nuevoValor)) return;

		paqueteSeleccionados.value = nuevoValor.map(p => p.idPaquete);
	},
	{ immediate: true, deep: true }
);


// agregar o quitar a el arreglo paquetes, conforme checbox
const onTogglePaquete = async (paqueteBase) => {
	const existe = paquetes.value.some(p => p.idPaquete === paqueteBase.idPaquete);

	// ➖ QUITAR
	if (existe) {
		paquetes.value = paquetes.value.filter(
			p => p.idPaquete !== paqueteBase.idPaquete
		);
		return;
	}

	// ➕ AGREGAR
	const promosDisponibles =
		await obtenerPromosPorPaquete(paqueteBase.idPaquete) || [];

	paquetes.value.push({
		idPaquete: paqueteBase.idPaquete,
		idPromocion: 0,
		idConceptoTrabajo: 0,

		descripcion: paqueteBase.nombre,
		cantidad: 1,
		precioUnitario: paqueteBase.precioUnitario,

		subTotal: (
			1 * precioFinalItem({
				precioUnitario: paqueteBase.precioUnitario,
				idPromocion: 0,
				valorPromocion: null,
				tipoPromocion: null
			})
		).toFixed(2),

		detalle: (paqueteBase.detalle || []).map(det => ({
			idDesglosePaquete: det.idDesglosePaquete,
			descripcion: det.nombre,
			cantidad: det.cantidad,
			precioUnitario: 0,
			subTotal: 0
		})),

		promosDisponibles,

		nombrePromocion: null,
		valorPromocion: null,
		tipoPromocion: null
	});
};





// Mounted
onMounted(() => {
	if (props.modelValue) document.addEventListener("keydown", handleEsc);
	cargarLlantas();
	cargarAlmacenes();
	cargarConcpetoTrabajo();
	cargarPaquetes();

	// console.log(props.insumos) props.insumos = { adicional: [], llanta: [], paquete: []}
});
</script>


<style>

.fixed-header-table {
	max-height: 400px; /* altura del scroll */
	overflow-y: auto;
}

.fixed-header-table table thead th {
	position: sticky;
	top: 0;
	z-index: 5;
	background: white; /* evita que se vea transparente */
}


</style>
