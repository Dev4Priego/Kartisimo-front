<template>
    <div class="container-fluid p-0 min-vh-100">
        <!-- Contenido principal -->
        <div class="m-4 p-4">
            <h2 class="mb-4">Inventario</h2>

            <div class="row">
                <div class="col d-flex align-items-center gap-3 mb-3">
                    <input
                        v-model="busquedaCodigoDesc"
                        type="text"
                        placeholder="Buscar"
                        class="form-control"
                    />
                </div>
                <div class="col d-flex align-items-center gap-3 mb-3">
                    <label for="city" class="form-label mb-0">Almacén</label>
                    <select v-model="almacenSeleccionado" class="form-select w-auto" id="city">
                        <option value="">Todos los almacenes</option>
                        <option v-for="itm in almacen" :key="itm.idAlmacen" :value="itm.nombre">
                            {{itm.nombre}}
                        </option>
                    </select>
                </div>
                <div class="col-auto d-flex align-items-center mb-3">
                    <button class="btn btn-outline-secondary" @click="limpiarBusqueda">
                        Limpiar búsqueda
                    </button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-primary" @click="openModal">
                        Cargar CSV por marca
                    </button>
                </div>
            </div>

            <EasyDataTable
                :headers="headers"
                :items="llantasFiltradas"
                :rows-per-page="20"
                show-index
                border
                alternating
                buttons-pagination
                table-class-name="table table-hover align-middle mb-3 fs-2"
                class="rounded-4 shadow-sm tabla-grande"
            >
                <!-- <template #item-action="{ item }">
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" @click="editar(item)">
                            Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="eliminar(item)">
                            Eliminar
                        </button>
                    </div>
                </template> -->
            </EasyDataTable>

            <!-- Modal -->
            <div class="modal fade" tabindex="-1" ref="modalEl" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Carga de archivos CSV por marca</h5>
                            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                        </div>

                        <div class="modal-body">
                            <div class="alert alert-info mb-3">
                                Solo se admiten archivos <strong>.csv</strong> (tipo <code>text/csv</code>).
                            </div>

                            <div class="accordion" id="csvAccordion">
                                <div class="accordion-item" v-for="(brand, idx) in brands" :key="brand">
                                    <h2 class="accordion-header" :id="`heading-${idx}`">
                                        <button class="accordion-button" :class="{'collapsed': idx!==0}" type="button"
                                                data-bs-toggle="collapse"
                                                :data-bs-target="`#collapse-${idx}`"
                                                :aria-expanded="idx===0 ? 'true' : 'false'"
                                                :aria-controls="`collapse-${idx}`">
                                            {{ brand }}
                                            <span class="badge bg-secondary ms-2">{{ filesByBrand[brand].length }}</span>
                                        </button>
                                    </h2>
                                    <div :id="`collapse-${idx}`"
                                        class="accordion-collapse collapse"
                                        :class="{'show': idx===0}"
                                        :aria-labelledby="`heading-${idx}`"
                                        data-bs-parent="#csvAccordion">
                                        <div class="accordion-body">
                                            <div class="mb-3">
                                                <label class="form-label">Seleccionar archivos CSV (puedes elegir varios)</label>
                                                <input type="file"
                                                        class="form-control"
                                                        accept=".csv,text/csv"
                                                        multiple
                                                        :id="`file-${brand}`"
                                                        @change="onFileChange($event, brand)" />
                                            </div>

                                            <!-- Lista de archivos seleccionados -->
                                            <ul class="list-group mb-3" v-if="filesByBrand[brand].length">
                                                <li class="list-group-item d-flex justify-content-between align-items-center"
                                                    v-for="(f, i) in filesByBrand[brand]" :key="f._id">
                                                    <div class="me-2 text-truncate" style="max-width: 70%;">
                                                        <i class="bi bi-file-earmark-spreadsheet me-2"></i>{{ f.name }}
                                                        <small class="text-muted">({{ prettySize(f.size) }})</small>
                                                    </div>
                                                    <button class="btn btn-sm btn-outline-danger" @click="removeFile(brand, i)">
                                                        Quitar
                                                    </button>
                                                </li>
                                            </ul>

                                            <div class="d-flex gap-2">
                                                <button class="btn btn-outline-secondary btn-sm"
                                                        :disabled="!filesByBrand[brand].length"
                                                        @click="clearBrand(brand)">
                                                    Limpiar {{ brand }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div> <!-- /accordion-item -->
                            </div> <!-- /accordion -->
                        </div>

                        <div class="modal-footer">
                            <span class="me-auto text-muted" v-if="totalFiles">Total archivos: {{ totalFiles }}</span>
                            <button class="btn btn-outline-secondary" @click="closeModal">Cancelar</button>
                            <button class="btn btn-success" :disabled="!totalFiles" @click="submit">
                            Subir seleccionados
                            </button>
                        </div>
                    </div>
                </div>
            </div> <!-- /modal -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, reactive } from 'vue';
import EasyDataTable from "vue3-easy-data-table";
import "bootstrap/dist/js/bootstrap.bundle"; // muy importante para que offcanvas funcione

const { proxy } = getCurrentInstance()
const llantas = ref([]);
const almacen = ref([])
const busquedaMedida = ref('')
const almacenSeleccionado = ref('');
const busquedaCodigoDesc = ref('')

const headers = [
    { text: "Código", value: "codigo" },
    { text: "Descripción", value: "descripcion", sortable:true },
    { text: "Medidas", value: "medidas", sortable:true },
    { text: "Existencia", value: "cantidad", sortable:true },
    { text: "Precio", value: "precio", sortable:true },
    { text: "Nombre Almacen", value: "nombreAlmacen", sortable:true },
    //   { text: "Acciones", value: "action" },
];

const cargarExistenciasInventario = async () => {
    try {
        const res = await fetch(proxy.$serverIP + "api/InventarioLlanta/existenciasInventario");
        const data = await res.json();
        llantas.value = data.map((llanta) => {
            const anchura = llanta.anchura && llanta.anchura !== 0 ? llanta.anchura : '';
            const perfil = llanta.perfil && llanta.perfil !== 0 ? llanta.perfil : '';
            const rin = llanta.rin && llanta.rin !== 0 ? llanta.rin : '';
            const carga = llanta.carga && llanta.carga !== 0 ? llanta.carga : '';
            const velocidad = llanta.velocidad && llanta.velocidad !== 0 ? llanta.velocidad : '';

            let medida = '';
            if (anchura) medida += anchura;
            if (perfil) medida += `/${perfil}`;
            if (rin) medida += (perfil ? ` R${rin}` : `R${rin}`);
            if (carga || velocidad) medida += ` ${(carga ? carga : '')}${(velocidad ? velocidad : '')}`;
            medida = medida.trim();

            const nombre = llanta.nombre ? llanta.nombre : '';
            const modelo = llanta.modelo ? llanta.modelo : '';
            const descripcion = `${nombre} ${modelo} ${medida}`.trim();

            return {
                ...llanta,
                medidas: medida,
                descripcion: descripcion
            };
        });
    } catch (e) {
        console.error("Error cargando datos", e);
    }
}

const cargarListaAlmacen = async () =>{
    try {
        const res = await fetch(proxy.$serverIP + "api/InventarioLlanta/mostrarAlmacen");
        const data = await res.json();
        //console.log(JSON.stringify(data))
        almacen.value = data.map((almacen) => {
            return {
                idAlmacen: almacen.idAlmacen,
                nombre: almacen.nombre
            }
        })
        //console.log(almacen.value)
    } catch (e) {
        console.error("Error cargando datos", e);
    }
}

onMounted(async () => {
    await cargarExistenciasInventario();
    await cargarListaAlmacen();
});


// Filtrado flexible por cualquier parte del texto
const llantasFiltradas = computed(() => {
    const queryDesc = busquedaCodigoDesc.value.trim().toLowerCase();
    const almacen = almacenSeleccionado.value.trim().toLowerCase();

    // Dividimos el query en palabras clave
    const palabrasClave = queryDesc
        .split(/[\s\/\-]+/)
        .filter(p => p.length > 0);

    const queryUnido = queryDesc.replace(/[^a-z0-9]/gi, '');

    return llantas.value.filter(llanta => {
        const textoItem = `
        ${llanta.codigo}
        ${llanta.anchura}
        ${llanta.perfil}
        ${llanta.rin}
        ${llanta.carga}
        ${llanta.velocidad}
        ${llanta.modelo}
        ${llanta.medidas}
        ${llanta.descripcion}
        `.toLowerCase();

        const textoUnido = textoItem.replace(/[^a-z0-9]/gi, '');

        const coincidePorPalabras = palabrasClave.every(p =>
        textoItem.includes(p)
        );

        const coincideTodoJunto = textoUnido.includes(queryUnido);

        const coincideAlmacen = !almacen || llanta.nombreAlmacen.toLowerCase() === almacen;

        return (coincidePorPalabras || coincideTodoJunto) && coincideAlmacen;
    });
});


const limpiarBusqueda = () => {
  busquedaMedida.value = ''
  busquedaCodigoDesc.value = ''
  almacenSeleccionado.value = ''
}

const editar = (item) => {
  console.log("Editar", item);
};

const eliminar = (item) => {
  console.log("Eliminar", item);
};

/******************************************/
/* SUBIR CSV PARA ACTUALIZACION DE PRECIOS*/

// Marcas configurables
const brands = ['Avante', 'Bridgestone', 'Martinica', 'Kartisimo', 'ztyre']

// Estado: arreglo de archivos por marca
const filesByBrand = reactive(
  Object.fromEntries(brands.map(b => [b, []]))
)

// Utilidad para IDs internos
let fileAutoId = 0

// Formatea tamaño
const prettySize = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  const units = ['B','KB','MB','GB']
  let i = 0, n = bytes
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(1)} ${units[i]}`
}

// Validar CSV por extensión y MIME
function isCsv(file) {
  const nameOk = file.name?.toLowerCase().endsWith('.csv')
  const typeOk = (file.type === 'text/csv') || file.type === '' // algunos navegadores dejan vacío
  return nameOk || typeOk
}

function onFileChange(e, brand) {
  const input = e.target
  const selected = Array.from(input.files || [])
  const accepted = []
  const rejected = []

  selected.forEach(f => {
    if (isCsv(f)) {
      // agrega un id interno para v-for
      f._id = `${Date.now()}_${fileAutoId++}`
      accepted.push(f)
    } else {
      rejected.push(f.name)
    }
  })

  if (rejected.length) {
    alert(`Se ignoraron archivos no CSV:\n• ${rejected.join('\n• ')}`)
  }

  filesByBrand[brand].push(...accepted)
  // Limpia el input para permitir re-selección del mismo archivo si hace falta
  input.value = ''
}

function removeFile(brand, index) {
  filesByBrand[brand].splice(index, 1)
}

function clearBrand(brand) {
  filesByBrand[brand].splice(0)
}

const totalFiles = computed(() =>
  Object.values(filesByBrand).reduce((acc, arr) => acc + arr.length, 0)
)

// Modal Bootstrap
const modalEl = ref(null)
let bsModal = null

onMounted(() => {
  // Asegúrate de tener Bootstrap JS cargado (window.bootstrap)
  if (window.bootstrap?.Modal) {
    bsModal = new window.bootstrap.Modal(modalEl.value, { backdrop: 'static' })
  } else {
    console.warn('Bootstrap JS no encontrado. Incluye bootstrap.bundle.min.js')
  }
})

function openModal() {
  bsModal?.show()
}

function closeModal() {
  bsModal?.hide()
}

// Envío de archivos (ejemplo con FormData)
async function submit() {
  const fd = new FormData()
  for (const brand of brands) {
    filesByBrand[brand].forEach((file, idx) => {
      // Clave por marca en arreglo, p.ej. Avante[], Bridgestone[]
      fd.append(`${brand}[]`, file, file.name)
    })
  }

  // 👉 Aquí haces tu request real
  // Ejemplo con fetch:
  try {
    // Reemplaza '/api/upload-csv' por tu endpoint real
    // const resp = await fetch('/api/upload-csv', {
    //   method: 'POST',
    //   body: fd
    // })
    // if (!resp.ok) throw new Error(`Error ${resp.status}`)

    // // Si todo bien:
    // alert('Archivos cargados correctamente.')
    // Limpia todo
    for (const b of brands) filesByBrand[b] = []
    closeModal()
  } catch (err) {
    console.error(err)
    alert('Ocurrió un error al subir los archivos. Revisa la consola.')
  }
}
</script>



<style scoped>
.tabla-grande {
  font-size: 1.1rem; /* o 18px, ajústalo a tu gusto */
}
/* Evita que los nombres largos rompan el layout */
.list-group-item { overflow: hidden; }
</style>