<template>
    <div class="container mt-4">
        
        <h3 class="mb-3 text-center">Crear Promoción</h3>

        <!-- Formulario de promoción -->
        <form class="border p-3 rounded bg-light mb-4" @submit.prevent>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Nombre de la promoción</label>
                    <input 
                        type="text" 
                        class="form-control"
                        v-model="promocionState.nombre"
                        pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+"
                        minlength="3"
                        maxlength="50"
                        required
                    />
                </div>

                <div class="col-md-3">
                    <label class="form-label">Tipo</label>
                    <select v-model="promocionState.tipo" class="form-select">
                        <option :value="false">Monto</option>
                        <option :value="true">Porcentaje</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label">Valor</label>
                    <input 
                        v-model.number="promocionState.valor" 
                        type="number" 
                        step="0.01" 
                        class="form-control" 
                        min="1"
                        max="120"
                        required
                    />
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Fecha Inicio</label>
                    <input v-model="promocionState.fechaInicio" type="date" class="form-control" />
                </div>

                <div class="col-md-6">
                    <label class="form-label">Fecha Fin</label>
                    <input v-model="promocionState.fechaFin" type="date" class="form-control" />
                </div>
            </div>

            <div class="form-check mb-3">
                <input
                    v-model="promocionState.esGeneral"
                    class="form-check-input"
                    type="checkbox"
                    id="esGeneral"
                />
                <label class="form-check-label" for="esGeneral">
                    Promoción general (aplica a monto total)
                </label>
            </div>
        </form>

        <!-- Tabla de llantas -->
        <div v-if="!promocionState.esGeneral" class="border rounded p-3 bg-white shadow-sm">
            <h5 class="mb-3">Selecciona las llantas que aplican a la promoción</h5>

            <div class="container mt-4 d-flex flex-column h-100">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <label>Registros por página:</label>
                        <select v-model.number="pageSize" @change="cambiarPageSize" class="form-select d-inline-block w-auto ms-2">
                            <option :value="20">20</option>
                            <option :value="50">50</option>
                            <option :value="100">100</option>
                        </select>
                    </div>

                    <div class="input-group w-50">
                        <input
                            v-model="busquedaMedida"
                            @input="filtrarPorMedida"
                            type="text"
                            class="form-control"
                            placeholder="Buscar por medida (ej. 205/55R16, R17, 195/65...)"
                        />
                        <button class="btn btn-outline-secondary" type="button" @click="limpiarFiltro">Limpiar</button>
                    </div>

                    <div>
                        <button class="btn btn-outline-primary me-1" :disabled="pageNumber === 1" @click="prevPage">Anterior</button>
                        <span>Página {{ pageNumber }} de {{ totalPages }}</span>
                        <button class="btn btn-outline-primary ms-1" :disabled="pageNumber === totalPages" @click="nextPage">Siguiente</button>
                    </div>
                </div>

                <!-- Tabla scrollable -->
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-striped table-bordered mb-0">
                        <thead class="table-dark position-sticky top-0">
                            <tr>
                                <!-- <th>ID</th> -->
                                <th>Nombre</th>
                                <th>Marca</th>
                                <th>Medida</th>
                                <th>Almacén</th>
                                <th>Precio</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="llanta in llantasFiltradas" :key="llanta.idProducto">
                                <!-- <td>{{ llanta.idProducto }}</td> -->
                                <td>{{ llanta.nombre || 'N/A' }}</td>
                                <td>{{ llanta.marca || 'N/A' }}</td>
                                <td>{{ formatearMedida(llanta) }}</td>
                                <td>{{ llanta.almacen || 'N/A' }}</td>
                                <td>{{ llanta.precio?.toLocaleString() || '0' }}</td>
                                <td>
                                    <button
                                        class="btn btn-sm btn-success"
                                        @click="agregarLlanta(llanta)"
                                        :disabled="isSelected(llanta)">
                                            {{ isSelected(llanta) ? "Agregado" : "Agregar" }}
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!llantas.length">
                                <td colspan="7" class="text-center text-muted">No hay llantas disponibles.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-2 bg-light p-2 border-top position-sticky bottom-0">
                    <span>Total de registros: {{ totalRegistros }}</span>
                </div>

                <div v-if="loading" class="text-center mt-2">Cargando datos...</div>

                <!-- Lista de seleccionadas -->
                <div v-if="promocionState.llantasSeleccionadas.length" class="mt-4">
                    <h5>Llantas seleccionadas</h5>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between align-items-center"
                            v-for="llanta in promocionState.llantasSeleccionadas"
                            :key="llanta.idProducto">
                            {{ llanta.marca }} {{ formatearMedida(llanta) }} - ${{ llanta.precio.toLocaleString() }}
                            <button class="btn btn-sm btn-danger" @click="eliminarLlanta(llanta)">Eliminar</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="text-center mt-4">
            <button type="button" class="btn btn-primary" :disabled="loadingGuardar" @click="guardarPromocion">
                {{ loadingGuardar ? 'Guardando...' : 'Crear Promoción' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from "vue"
import Swal from "sweetalert2"
const { proxy } = getCurrentInstance()

const llantas = ref([])
const llantasFiltradas = ref([])
const busquedaMedida = ref("")


const totalRegistros = ref(0)
const loading = ref(false)
const pageNumber = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
const loadingGuardar = ref(false)

const emit = defineEmits(['promocion-creada'])

const promocionState = reactive({
    id: null,
    nombre: "",
    tipo: false,
    valor: 0,
    esGeneral: true,
    fechaInicio: "",
    fechaFin: "",
    activo: true,
    llantasSeleccionadas: []
})

// ✅ Función para mostrar medida universal
const formatearMedida = (llanta) => {
    const anchura = llanta.anchura || ""
    const perfil = llanta.perfil || ""
    const rin = llanta.rin || ""
    const carga = llanta.carga || ""
    const velocidad = llanta.velocidad || ""


    // Ejemplo: 205/55R16 91V
    return `${anchura || ""}/${perfil || ""}R${rin || ""} ${carga || ""}${velocidad || ""}`.trim()
}


const filtrarPorMedida = () => {
    pageNumber.value = 1; 
    fetchLlantas(); // Hace búsqueda en el backend
};


const limpiarFiltro = () => {
    busquedaMedida.value = ""
    llantasFiltradas.value = [...llantas.value]
}


const isSelected = (llanta) => promocionState.llantasSeleccionadas.some(l => l.idProducto === llanta.idProducto)

const agregarLlanta = (llanta) => {
    if (!isSelected(llanta)) {
        promocionState.llantasSeleccionadas.push(llanta)
        ordenarLlantasSeleccionadas(promocionState.llantasSeleccionadas)
    }
}

const eliminarLlanta = (llanta) => {
    promocionState.llantasSeleccionadas = promocionState.llantasSeleccionadas.filter(l => l.idProducto !== llanta.idProducto)
    ordenarLlantasSeleccionadas(promocionState.llantasSeleccionadas)
}

const fetchLlantas = async () => {
    loading.value = true;
    try {
        const url = new URL(`${proxy.$serverIP}api/Llanta/getLlantaPromo`);
        
        url.searchParams.append("pageNumber", pageNumber.value);
        url.searchParams.append("pageSize", pageSize.value);
        
        if (busquedaMedida.value.trim()) {
            url.searchParams.append("busquedaMedida", busquedaMedida.value.trim());
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener las llantas");
        const data = await res.json();

        llantas.value = data.llantas || [];
        llantasFiltradas.value = [...llantas.value];
        totalRegistros.value = data.totalRegistros || 0;
        totalPages.value = Math.ceil(totalRegistros.value / pageSize.value);
    } catch (err) {
        console.error("Error al cargar llantas:", err);
        Swal.fire("Error", "No se pudieron cargar las llantas.", "error");
    } finally {
        loading.value = false;
    }
};




const nextPage = () => {
    if (pageNumber.value < totalPages.value) {
        pageNumber.value++
        fetchLlantas()
    }
}

const prevPage = () => {
    if (pageNumber.value > 1) {
        pageNumber.value--
        fetchLlantas()
    }
}

const cambiarPageSize = () => {
    pageNumber.value = 1
    fetchLlantas()
}

const ordenarLlantasSeleccionadas = (lista) => {
    lista.sort((a, b) => {
        const prioridad = (llanta) => {
            const modelo = llanta.marca?.toUpperCase() || ''
            if (modelo.includes('BRIDGESTONE')) return 1
            if (modelo.includes('FIRESTONE')) return 2
            return 3
        }

        const aPrioridad = prioridad(a)
        const bPrioridad = prioridad(b)

        if (aPrioridad !== bPrioridad) return aPrioridad - bPrioridad
        return (b.precio || 0) - (a.precio || 0)
    })
}

const guardarPromocion = async () => {
    try {
        loadingGuardar.value = true;

         const body = {
            Promocion: {
                id: promocionState.id ? promocionState.id : null,
                Nombre: promocionState.nombre,
                Tipo: promocionState.tipo,
                Valor: promocionState.valor,
                EsGeneral: promocionState.esGeneral,
                FechaInicio: promocionState.fechaInicio,
                FechaFin: promocionState.fechaFin,
                Activo: promocionState.activo
            },
            referencias: promocionState.llantasSeleccionadas.map(l => ({
                idReferencia: l.idProducto,
                tipoReferencia: "LLANTA" // si luego agregas paquetes, aquí puedes cambiar dinámicamente
            }))
        }

        const res = await fetch(`${proxy.$serverIP}api/Promocion/crear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.mensaje || "Error al crear promoción");

        Swal.fire("Éxito", "Promoción creada correctamente", "success").then(() => {
            emit('promocion-creada')
        });

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    } finally {
        loadingGuardar.value = false;
    }
};


onMounted(() => {
  fetchLlantas()
})
</script>
