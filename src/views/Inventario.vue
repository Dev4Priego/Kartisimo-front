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
                <!-- <div class="col d-flex align-items-center gap-3 mb-3">
                    <label for="search" class="form-label">Buscar medida de llanta</label>
                    <input
                        v-model="busquedaMedida"
                        type="text"
                        class="form-control"
                        id="search"
                        placeholder="Ej. XXX/XX RXX XXJ"
                    />  
                </div> -->
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
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
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
    { text: "Descripción", value: "descripcion" },
    { text: "Medidas", value: "medidas" },
    { text: "Existencia", value: "cantidad" },
    { text: "Precio", value: "precio" },
    { text: "Nombre Almacen", value: "nombreAlmacen" },
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
</script>



<style scoped>
.tabla-grande {
  font-size: 1.1rem; /* o 18px, ajústalo a tu gusto */
}
</style>