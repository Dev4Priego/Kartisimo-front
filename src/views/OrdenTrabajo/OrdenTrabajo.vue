<template>
    <div class="container-fluid p-4">
        <div class="row mx-4">
            <div class="col">
                <h2><i class="bi bi-wrench-adjustable me-2"></i> Órdenes de Trabajo</h2>
            </div>
            <div class="col-4 col-lg-3">
                <router-link :to="{ name: 'orden-trabajo-form' }">
                    <button 
                        class="btn btn-primary position-relative shadow form-control"
                    ><i class="bi bi-plus-lg position-absolute start-0 ms-2"></i>
                        &nbsp;Nueva orden de trabajo
                    </button>
                </router-link>
            </div>
        </div>
        <div class="row mt-4 mx-4">
            <div class="col">
                <div class="mt-3 mt-md-0">
                    <div class="border-start border-4 border-success bg-white rounded shadow-sm p-3">
                        <h5 class="mb-0 fw-bold text-success">{{listaOrdenTrabajo.totales.finalizado}}</h5>
                        <small class="text-muted">Completadas</small>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="mt-3 mt-md-0">
                    <div class="border-start border-4 border-primary bg-white rounded shadow-sm p-3">
                        <h5 class="mb-0 fw-bold text-primary">{{listaOrdenTrabajo.totales.enCurso}}</h5>
                        <small class="text-muted">En curso</small>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class=" mt-3 mt-md-0">
                    <div class="border-start border-4 border-danger bg-white rounded shadow-sm p-3">
                        <h5 class="mb-0 fw-bold text-danger">{{listaOrdenTrabajo.totales.creado}}</h5>
                        <small class="text-muted">Pendientes</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row p-3">
            <div v-if="loading" class="text-center my-4">
                <table class="table table-hover table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Técnico</th>
                            <th>Fecha</th>
                            <th>Vehículo</th>
                            <th>Pago</th>
                            <th>Factura</th>
                            <th>Total Insumos</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>                                      
                </table>
                <div class="text-center my-4">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2 text-muted">Cargando ordenes de trabajo...</p>
                </div>  
            </div>
            <div v-else class="col">
                <table class="table">
                    <thead>
                        <tr class="align-middle text-center">
                            <th>#</th>
                            <th>Cliente</th>
                            <th>Vehículo</th>
                            <th>Fecha</th>
                            <th>Técnico</th>
                            <th>Pago</th>
                            <th>Factura</th>
                            <th>Estatus</th>
                            <th>Desechar Llanta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>                        
                        <tr v-for="ot in listaOrdenTrabajo.ordenes" :key="ot.idOrdenTrabajo" class="text-justify">
                            <td>OT-{{ ot.idOrdenTrabajo }}</td>
                            <td>{{ ot.clienteNombre}} {{ot.clienteTelefono}}</td>
                            <td>{{ ot.vehiculoModelo}} {{ot.vehiculoPlacas}}</td>
                            <td>{{ ot.fechaAlta}}</td>
                            <td>{{ot.empleadoNombre}}</td>
                            <td>{{ot.metodoPago}}</td>

                            <td v-if="ot.requiereFactura" class="text-center"><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td v-else class="text-center"><i class="bi bi-x-circle text-danger"></i></td>

                            <td v-if="ot.estado == 'En curso'"><span class="badge bg-warning text-dark">{{ot.estado}}</span></td>
                            <td v-else-if="ot.estado == 'Creado'"><span class="badge bg-secondary">{{ ot.estado }}</span></td>
                            <td v-else-if="ot.estado == 'Finalizado'"><span class="badge bg-success">{{ ot.estado }}</span></td>
                            
                            <td v-if="ot.desecharLlanta" class="text-center"><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td v-else class="text-center"><i class="bi bi-x-circle text-danger"></i></td>

                            <td>
                                <button
                                    class="btn btn-sm btn-outline-primary"
                                    @click="router.push(`/content/orden-trabajo/${ot.idOrdenTrabajo}`)"
                                >
                                    Ver
                                </button>

                                <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>

import { getCurrentInstance, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const { proxy } = getCurrentInstance() 

const loading =  ref(true)
const listaOrdenTrabajo = ref({
    ordenes:[],
    totales: {
        finalizado:0,
        enCurso:0,
        creado:0
    }
});

/***** CRAGA DE INFORMACION *****/
const cargarOrdenTrabajo = async () => {
    try {
        const res = await fetch(`${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajo`)
        if (!res.ok) throw new Error("Error en la API")

        const result = await res.json()
        listaOrdenTrabajo.value = result.data

        loading.value = false
        console.log(listaOrdenTrabajo.value)
    } catch (err) {
        console.error("Error al obtener sugerencias:", err)
        listaOrdenTrabajo.value = {}
    }
}

onMounted(() => {
    cargarOrdenTrabajo()
})
</script>