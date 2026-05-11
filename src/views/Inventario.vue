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
            <transition name="slide-down" class="mb-3">
            <div v-if="showUploader" class="tab-container bg-light border rounded p-3 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Carga de listas <strong>(Beta)</strong></h5>
                <button type="button" class="btn-close" @click="showUploader=false" aria-label="Close"></button>
                </div>

                <div class="alert alert-info mb-3">
                Solo se admite un archivo <strong>.xlsx</strong> (tipo <code>Excel.xlsx</code>), Asegúrate que el nombre del archivo sea igual al de los proveedores admitidos, como: Avante, Bridgestone, Kartisimo, Martinica y Llantas Directas

                <br>
                
                <br><strong class="text-warning">AVISO: </strong><strong>Asegurate que la lista cuente con una columna llamada "precio". </strong>
                </div>

                <!-- Único input file -->
                <div class="mb-3">
                <label class="form-label">Seleccionar archivo .xlsx</label>
                <input type="file"
                        class="form-control"
                        accept=".xlsx"
                        id="file-input"
                        @change="onFileChange($event)" />
                </div>
                <!--  div para mostrar el archivo -->
                    <div v-if="file!= null" class="alert alert-secondary d-flex justify-content-between align-items-center">
                    <div class="me-2 text-truncate" style="max-width: 70%;">
                        <i class="bi bi-file-earmark-spreadsheet me-2"></i>{{ file.name }}
                        <small class="text-muted">({{ prettySize(file.size) }})</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" @click="clearFile">
                        Quitar
                    </button>
                    </div>

                
                <!-- Footer con transición -->
                <div class="mt-3 d-flex justify-content-end align-items-center gap-2">
                <span class="me-auto text-muted" v-if="file">Archivo seleccionado: {{ file.name }}</span>
                
                <transition name="fade">
                    <button v-if="!isLoading" class="btn btn-success btn-procesar" 
                            :disabled="!file" @click="submit">
                    Procesar Lista
                    </button>
                </transition>

                <transition name="fade">
                    <div v-if="isLoading" class="bg-success rounded d-flex justify-content-center align-items-center" style="width: 100px; height: 40px;">
                    <img src="../../public/images/loading.gif" style="max-width: 100%; max-height: 100%;" alt="loading">
                    </div>
                </transition>
                </div>
            </div>
            </transition>
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
                <template #item-runflat="runFlat">
                    <div class="text-center">
                        <i v-if="runFlat.runflat === '1'" class="bi bi-check-circle-fill text-success"></i>
                    </div>
                </template>
            </EasyDataTable>

            

        </div>
       
        <ListaLlantas
        :showModal="mostrarModal"
        :llantas="ListaLLantas"
        @close="handleClose"
        />
     
        
    </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, reactive } from 'vue';
import EasyDataTable from "vue3-easy-data-table";
import "bootstrap/dist/js/bootstrap.bundle"; // muy importante para que offcanvas funcione
import { log } from 'pdfmake/build/pdfmake';
import ListaLlantas from '@/components/Inventario/ListaLlantas.vue';
import Swal from 'sweetalert2';

const { proxy } = getCurrentInstance()
const llantas = ref([]);
const almacen = ref([]);
const ListaLLantas = ref([]);
const mostrarModal=ref(false);
const busquedaMedida = ref('')
const almacenSeleccionado = ref('');
const busquedaCodigoDesc = ref('')
const isLoading = ref(false);
const showUploader = ref(false);
const file = ref(null);
const headers = [
    { text: "Código", value: "codigo" },
    { text: "Descripción", value: "descripcion", sortable:true },
    { text: "Medidas", value: "medidas", sortable:true },
    { text: "Runflat", value: "runflat" },
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
            const runflat = llanta.runflat && llanta.runflat !== '' ? llanta.runflat : '';
            const carga = llanta.carga && llanta.carga !== 0 ? llanta.carga : '';
            const velocidad = llanta.velocidad && llanta.velocidad !== 'N/A' ? llanta.velocidad : '';

            let medida = '';
            if (anchura) medida += anchura;
            if (perfil) medida += `/${perfil}`;
            if (rin) medida += (perfil ? ` R${rin}` : `R${rin}`);
            if (runflat) medida+= (runflat === '1' ? ' RF' : '');
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

       
        const coincideMedida = palabrasClave.length === 2 &&
            llanta.anchura.toString() === palabrasClave[0] &&
            llanta.perfil.toString() === palabrasClave[1];
        
        const coincideTodoJunto = textoUnido.includes(queryUnido);

        const coincideAlmacen = !almacen || llanta.nombreAlmacen.toLowerCase() === almacen;

        return (
            
        coincideMedida  || coincideTodoJunto) && coincideAlmacen;
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
function isXlsx(file) {
  const nameOk = file.name?.toLowerCase().endsWith('.xlsx')

  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const typeOk = validMimeTypes.includes(file.type) || file.type === ''

  return nameOk && typeOk
}



function onFileChange(e) {
  const input = e.target
  const selected = input.files[0] // solo el primer archivo
  if (!selected) return

  if (isXlsx(selected)) {
    // agrega un id interno si lo necesitas
    //selected._id = `${Date.now()}_${fileAutoId++}`
    file.value = selected
  } else {
    alert(`Se ignoró archivo no válido: ${selected.name}`)
    file.value = null
  }
  console.log("Archivo:",file)
  // Limpia el input para permitir re-selección del mismo archivo
  input.value = ''
}

function clearFile() {
  file.value = null
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



function openModal() {
  showUploader.value=true;
  console.log("Abriendo");
}

function closeModal() {
  showUploader.value = false;
}

// Envío de archivos (ejemplo con FormData)
async function submit() {
    // Remplazar boton por un gift de carga
    isLoading.value = true;
    const userSession = JSON.parse(localStorage.getItem("userSession"))
    const fd = new FormData()
    fd.append(`Archivo`, file.value, file.value.name);
    fd.append("Lista" ,file.value.name.replace(".xlsx" ,"")); // Mando solo el nombre
 
  
  //fd.append('IdUsuario', userSession.usuario.idUsuario)
  try {
    const resp = await fetch(proxy.$serverIP + 'api/Listas/ProcesarLista', {
      method: 'POST',
      body: fd
      
    })

    if (!resp.ok) throw new Error(`Error ${resp.status}`)
    const data = await resp.json();
    closeModal();
    ListaLLantas.value = data.llantas; // pasamos el resultado 
   if(ListaLLantas.value.length != 0){// llantas nuevas
    mostrarModal.value = true;
    isLoading.value = false;

   }else{
    Swal.fire({
       icon: "success",
       title: "Inventario Actualizado",
       text: `Inventario actualizado, no se encontraron llantas nuevas`,
     });
     isLoading.value = false;
   }
   
  } catch (err) {
    console.error(err)
    isLoading.value = false;
    alert('Ocurrió un error al subir los archivos. Revisa la consola.')
  }
  
}
const handleClose = () => {
  mostrarModal.value = false
  ListaLLantas.value = [] // 
}
</script>



<style scoped>
.tabla-grande {
  font-size: 1.1rem; /* o 18px, ajústalo a tu gusto */
}
/* Evita que los nombres largos rompan el layout */
.list-group-item { overflow: hidden; }
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter {
  transform: translateY(-20px);
  opacity: 0;
}
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>