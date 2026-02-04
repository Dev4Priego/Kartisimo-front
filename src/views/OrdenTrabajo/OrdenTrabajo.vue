<template>
    <div class="container-fluid p-4">
        <div class="row mx-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold"><i class="bi bi-wrench-adjustable me-2 text-primary"></i> Órdenes de Trabajo</h2>
            </div>
            <div class="col-4 col-lg-3">
                <router-link :to="{ name: 'orden-trabajo-form' }">
                    <button class="btn btn-primary position-relative shadow form-control">
                        <i class="bi bi-plus-lg position-absolute start-0 ms-2"></i>
                        &nbsp;Nueva orden
                    </button>
                </router-link>
            </div>
        </div>

        <div class="row mt-4 mx-4">
            <div class="col-md-4" v-for="(val, key) in totalesMap" :key="key">
                <div :class="['border-start border-4 bg-white rounded shadow-sm p-3', val.color]">
                    <h5 class="mb-0 fw-bold">{{ listaOrdenTrabajo.totales[key] || 0 }}</h5>
                    <small class="text-muted">{{ val.label }}</small>
                </div>
            </div>
        </div>

        <div class="row p-3 mt-2">
            <div v-if="loading" class="col-12 text-center my-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Cargando órdenes de trabajo...</p>
            </div>

            <div v-else class="col-12">
                <div class="table-responsive bg-white rounded shadow-sm">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr class="text-center">
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Vehículo</th>
                                <th>Fecha</th>
                                <th>Técnico</th>
                                <th>Pago</th>
                                <th>Factura</th>
                                <th>Estatus</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>                        
                            <tr v-for="ot in listaOrdenTrabajo.ordenes" :key="ot.idOrdenTrabajo">
                                <td class="fw-bold">OT-{{ ot.idOrdenTrabajo }}</td>
                                <td>
                                    <div>{{ ot.clienteNombre }}</div>
                                    <small class="text-muted"><i class="bi bi-telephone"></i> {{ ot.clienteTelefono }}</small>
                                </td>
                                <td>
                                    <div>{{ ot.vehiculoModelo }}</div>
                                    <span class="badge border text-dark fw-normal">{{ ot.vehiculoPlacas }}</span>
                                </td>
                                <td>{{ formatFecha(ot.fechaAlta) }}</td>
                                <td>{{ ot.empleadoNombre }}</td>
                                <td><small>{{ ot.metodoPago }}</small></td>

                                <td class="text-center">
                                    <i v-if="ot.requiereFactura" class="bi bi-check-circle-fill text-success"></i>
                                    <i v-else class="bi bi-dash-circle text-muted"></i>
                                </td>

                                <td class="text-center">
                                    <span :class="badgeEstatus(ot.estado)">{{ ot.estado }}</span>
                                </td>
                                
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button 
                                            class="btn btn-sm btn-outline-primary"
                                            @click="router.push(`/content/orden-trabajo/${ot.idOrdenTrabajo}`)"
                                            title="Ver detalles"
                                        >
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button 
                                            class="btn btn-sm btn-outline-secondary"
                                            @click="irAEditar(ot)"
                                            title="Editar Orden, Cliente y Vehículo"
                                        >
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { proxy } = getCurrentInstance() 

const loading = ref(true)
const listaOrdenTrabajo = ref({
    ordenes: [],
    totales: { finalizado: 0, enCurso: 0, creado: 0 }
});

// Configuración visual de los totales
const totalesMap = {
    finalizado: { label: 'Completadas', color: 'border-success text-success' },
    enCurso: { label: 'En curso', color: 'border-primary text-primary' },
    creado: { label: 'Pendientes', color: 'border-danger text-danger' }
};

const cargarOrdenTrabajo = async () => {
    loading.value = true
    try {
        const res = await fetch(`${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajo`)
        if (!res.ok) throw new Error("Error en la API")
        const result = await res.json()
        listaOrdenTrabajo.value = result.data
    } catch (err) {
        console.error("Error al obtener órdenes:", err)
    } finally {
        loading.value = false
    }
}

// Navegación a edición
const irAEditar = (ot) => {
    // Redirigimos al mismo formulario de "Nueva Orden" pero pasamos el ID
    router.push({ 
        name: 'orden-trabajo-form', 
        params: { id: ot.idOrdenTrabajo } 
    });
}

// Helpers visuales
const badgeEstatus = (estado) => {
    const classes = {
        'En curso': 'badge bg-warning text-dark',
        'Creado': 'badge bg-secondary',
        'Finalizado': 'badge bg-success'
    };
    return classes[estado] || 'badge bg-light text-dark';
}

const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

onMounted(() => {
    cargarOrdenTrabajo()
})
</script>