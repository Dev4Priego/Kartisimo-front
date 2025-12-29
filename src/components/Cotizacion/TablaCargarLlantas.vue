<template>
	<div class="col">
		<label for="" class="m-2">Selecciona las llantas deseadas:</label>
		<div class="row m-2">
			<div class="col-9">
				<input
					v-model="busquedaLlantas"
					class="form-control"
					placeholder="Buscar por nombre o medida..."
				/>
			</div>

			<div class="col-3">
				<div class="position-relative">
					<button
						type="button"
						class="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
						@click="dropdownOpen = !dropdownOpen"
					>
						<span>{{ selectedAlmacenes.length ? selectedAlmacenes.join(', ') : 'Elegir almacenes' }}</span>
						<i class="bi bi-caret-down-fill"></i>
					</button>

					<!-- menú -->
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
								:value="alm.nombre"
								v-model="selectedAlmacenes"
							/>
							<label class="form-check-label" :for="'alm-' + alm.id">
								{{ alm.nombre }}
							</label>
						</div>
					</div>
				</div>
			</div>

		</div>
		<div> <!-- style="max-height: 400px; overflow-y: auto;" -->
			<EasyDataTable
				:key="`${page}-${rowsPerPage}-${totalItems}`"
				:server-side="true"
				:headers="tblHeadersModal"
				:items="items"
				:server-items-length="totalItems"
				:loading="loading"
				v-model:page="page"
				v-model:rows-per-page="rowsPerPage"
				:rows-items="[10, 25, 50, 100, 200]"   
				@update:page="cargarLlantas"
				@update:rows-per-page="onRowsChange"
				show-index
				:table-height="400"
			>

				<!-- TEMPLATE PARA ADAPTAR LA INFORMACION A LA ORGANIZACION medida - marca - modelo - rango -->
				<template #item-medida="slotProps">
					{{ slotProps.medida }} {{ slotProps.rango }}
				</template>
			</EasyDataTable>
		</div>
	</div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue';
import EasyDataTable from "vue3-easy-data-table";
const { proxy } = getCurrentInstance();

const busquedaLlantas = ref('');

const selectedAlmacenes = ref([])
const dropdownOpen = ref(false)
const almacenes = ref([])

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

const tblHeadersModal = [
	{ text:"Llanta", value: "llanta" },
	{ text:"Codigo", value: "codigo"},
	{ text:"Medidas", value: "medida"},
	{ text:"Cantidad", value: "cantidad"},
	{ text:"Ubicación", value: "ubicacion"},
	{ text:"Precio", value: "precio"},        
	{ text:"Acciones", value: "acciones"}
]

const loading = ref(false)
const items = ref([])
const totalItems = ref(7002)
const page = ref(1)
const rowsPerPage = ref(10)

const cargarLlantas = async () => {
	try {
		loading.value = true

		const res = await fetch(
			`${proxy.$serverIP}api/Llanta/getLlantaPrecio-Paginado?page=${page.value}&pageSize=${rowsPerPage.value}`
		)

		if (!res.ok) throw new Error("Error al cargar llantas")

		const data = await res.json()

		items.value = data.items.map(llanta => ({
			id: llanta.idLlanta,
			codigo: llanta.codigo,
			llanta: `${llanta.nombreMarca} ${llanta.modelo}`.trim(),
			medida: llanta.medidas,
			rango: llanta.rango,
			cantidad: llanta.cantidad,
			ubicacion: llanta.nombreAlmacen,
			precio: parseFloat(llanta.precio) || 0
		}))

		totalItems.value = data.totalRows

	} catch (e) {
		console.error(e)
	} finally {
		loading.value = false
	}
}

const onRowsChange = (value) => {
	rowsPerPage.value = value
	page.value = 1              // 👈 CLAVE
	cargarLlantas()
}


/************************************/
/*   BUSQUEDA LLANTAS CON PRECIO    */
/************************************/

/* ====== 1) Constantes/Helpers ====== */
const brandPriority = { bridgestone: 1, firestone: 2 };
const multiwordBrands = ['ngt auto', 'general tire'];
const reSplit = /[\s\/\-]+/;
const reNonAN = /[^a-z0-9]/gi;
const collator = new Intl.Collator('es', { sensitivity: 'base' });

function extractMarcaFromLlanta(llanta) {
	const t = (llanta || '').toString().trim();
	if (!t) return '';
	const lower = t.toLowerCase();
	const mw = multiwordBrands.find(m => lower.startsWith(m + ' '));

	return (mw ? mw : t.split(/[\s-]+/, 1)[0]).toUpperCase();
}

function parsePrecio(v) {
	if (v == null) return Number.POSITIVE_INFINITY;
	if (typeof v === 'number') return Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
	const n = Number(v.toString().replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'));
	
	return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

/* ====== 2) Prepara ítems una sola vez ====== */
const preparedItems = computed(() =>
	(items.value || []).map(it => {
		const codigo = (it.codigo ?? '').toString();
		const llanta = (it.llanta ?? '').toString();
		const medida = (it.medida ?? '').toString();
		const rango  = (it.rango  ?? '').toString();
		const ubic   = (it.ubicacion ?? '').toString();

		const text = ( llanta + ' ' + medida + ' ' + rango + ' ' + ubic ).toLowerCase();
		const unido = text.replace(reNonAN, '');

		const marca = extractMarcaFromLlanta(llanta);
		const brandRank = brandPriority[marca.toLowerCase()] ?? 3;
		const idInventarioInicial = ( it.idInventarioInicial ?? '' ).toString();
		
		return {
			...it,
			_text: text,
			_unido: unido,
			_marca: marca,
			_brandRank: brandRank,
			_priceNum: parsePrecio(it.precio),
			_code: codigo,
			_idInventarioInicial: idInventarioInicial
		};
	})
);

/* ====== 3) Orden base (una sola vez) ====== */
const baseSorted = computed(() => {

	const arr = preparedItems.value.slice();

	arr.sort((a, b) => {
		// 1. Prioridad por marca
		if (a._brandRank !== b._brandRank) return a._brandRank - b._brandRank;

		// 2. Precio DESC (mayor primero)
		if (a._priceNum !== b._priceNum) return b._priceNum - a._priceNum;


		return collator.compare(a._code, b._code);
	});

	return arr;
});

/* ====== 4) Debounce de la búsqueda ====== */
const q = busquedaLlantas;            // tu ref existente
const qDebounced = ref('');
let _t;                                // timer

watch(q, (val) => {
	clearTimeout(_t);
	_t = setTimeout(() => {
		qDebounced.value = (val || '').toLowerCase().trim();
	}, 250); // ajusta 200–300ms
});

/* ====== 5) Filtrado usando el orden base (sin reordenar en cada tecla) ====== */
const itemsFiltrados = computed(() => {
	const term = qDebounced.value
	let base = baseSorted.value

	// Filtro por búsqueda de texto
	if (term) {
		const palabras = term.split(reSplit).filter(Boolean)
		base = base.filter(it => {
			const t = it._text, u = it._unido
			for (let i = 0; i < palabras.length; i++) {
				const p = palabras[i]
				const pn = p.replace(reNonAN, '')
				if (!(t.includes(p) || u.includes(pn))) return false
			}
			return true
		})
	}
	
	// Filtro por almacenes seleccionados
	if (selectedAlmacenes.value.length > 0) {
		base = base.filter(it =>
			selectedAlmacenes.value.includes(it.ubicacion)
		)
	}


	return base
})

const toggleTodos = (e) => {
	// Si marca “Todos”, limpiar los filtros
	if (e.target.checked) {
		selectedAlmacenes.value = [];
	}
};




onMounted(() => {
	cargarLlantas();
	cargarAlmacenes();
})
</script>