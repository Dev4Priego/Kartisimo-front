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

				<div class="modal-body">
					
					<!-- FILTROS -->
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
											v-if="!props.insumos.llanta.some(ll => ll.idLlanta === item.idLlanta)"
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

const props = defineProps({
	modelValue: Boolean,
	title: { type: String, default: "Modal" },
	insumos: Object
});

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

const agregarLlanta = async (itm) =>{
	console.log(itm)

	if (props.insumos.llanta.length >= 6) {
			mostrarToast("warning", "No puedes agregar más de 6 llantas")
			console.log(props.insumos.llanta)
		return;
	}

	const nuevaLlanta = {
		idLlanta: itm.idLlanta,
		idAlmacen: itm.idAlmacen,
		cantidad: 4,
		descripcion: `${itm.medidas} ${itm.rango} ${itm.medidas}`,
		precioUnitario: Math.trunc(parseFloat(itm.precio)) || 0,
		marca: itm.marca,
		ubicacion: itm.nombreAlmacen,

		
		promosAplicables: [],
		idPromocionSeleccionada: 0,
		promo: null,
		precioConPromo: null,
		excluirPromocionGeneral: false,
		comentario: "",
	};

	try {
		//console.log(nuevaLlanta.idInventarioInicial)
		const promosDisponibles = await obtenerPromosPorInventario(itm.idInventarioInicial);
		
		nuevaLlanta.promosAplicables = promosDisponibles || [];
		nuevaLlanta.idPromocionSeleccionada = 0;
		nuevaLlanta.promo = null;
		nuevaLlanta.precioConPromo = nuevaLlanta.precioUnitario;
						
	} catch (error) {

		console.error('Error al consultar promociones:', error);
		nuevaLlanta.promosAplicables = [];
		nuevaLlanta.idPromocionSeleccionada = 0;
		nuevaLlanta.promo = null;
		nuevaLlanta.precioConPromo = nuevaLlanta.precioUnitario;

	}

	props.insumos.llanta.push(nuevaLlanta);  
            
	props.insumos.llanta.sort((a, b) => {
		const prioridad = (llanta) => {
			const modelo = llanta.modeloMedidas?.toUpperCase() || '';
			if (modelo.includes('BRIDGESTONE')) return 1;
			if (modelo.includes('FIRESTONE')) return 2;
			return 3; // resto de marcas
		};

		const aPrioridad = prioridad(a);
		const bPrioridad = prioridad(b);

		if (aPrioridad !== bPrioridad) {
			return aPrioridad - bPrioridad;
		}

		// Si tienen la misma prioridad, ordenar por precio de mayor a menor
		return (b.precioUnitario || 0) - (a.precioUnitario || 0);
	});

	console.log('agregarLlanta2: '+ JSON.stringify(props.insumos.llanta))
}

// Mounted
onMounted(() => {
	if (props.modelValue) document.addEventListener("keydown", handleEsc);
	cargarLlantas();
	cargarAlmacenes();

	console.log(props.insumos)
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
