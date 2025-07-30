<template>
    <div class="container-fluid p-4">
        <div class="row mx-4">
            <div class="col">
                <h2>Orden de Trabajo</h2>
            </div>
            <div class="col-4">
                <router-link :to="{ name: 'formOT'}">
                    <button 
                        class="btn btn-outline-primary form-control"
                    >
                        Nueva Orden
                    </button>
                </router-link>
            </div>
        </div>
        <div class="row mt-4 mx-4">
            <div class="col">
                <div class="mt-3 mt-md-0">
                    <div class="border-start border-4 border-success bg-white rounded shadow-sm p-3">
                        <h5 class="mb-0 fw-bold text-success">1,000</h5>
                        <small class="text-muted">Completadas</small>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="mt-3 mt-md-0">
                    <div class="border-start border-4 border-primary bg-white rounded shadow-sm p-3">
                        <h5 class="mb-0 fw-bold text-primary">15</h5>
                        <small class="text-muted">En curso</small>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class=" mt-3 mt-md-0">
                    <div class="border-start border-4 border-danger bg-white rounded shadow-sm p-3">
                        <h5 class="mb-0 fw-bold text-danger">35</h5>
                        <small class="text-muted">Retrasadas</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row p-3">
            <div class="col">
                <table class="table">
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
                    <tbody>
                        <tr>
                            <td>OT-0001</td>
                            <td>Juan Pérez</td>
                            <td>Miguel Hernández</td>
                            <td>2025-07-01</td>
                            <td>Jetta 2020 - ABC123</td>
                            <td>Efectivo</td>
                            <td><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td>$4,200.00</td>
                            <td><span class="badge bg-success">Finalizada</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0002</td>
                            <td>Laura García</td>
                            <td>Carlos Torres</td>
                            <td>2025-07-02</td>
                            <td>Mazda CX-5 - XYZ789</td>
                            <td>Tarjeta</td>
                            <td><i class="bi bi-x-circle text-danger"></i></td>
                            <td>$3,120.00</td>
                            <td><span class="badge bg-warning text-dark">En proceso</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0003</td>
                            <td>Andrés Martínez</td>
                            <td>Sandra Vega</td>
                            <td>2025-07-03</td>
                            <td>Chevrolet Aveo - GHY456</td>
                            <td>Efectivo</td>
                            <td><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td>$1,560.00</td>
                            <td><span class="badge bg-secondary">Pendiente</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0004</td>
                            <td>Mariana López</td>
                            <td>Miguel Hernández</td>
                            <td>2025-07-04</td>
                            <td>Nissan Sentra - JKL321</td>
                            <td>Tarjeta</td>
                            <td><i class="bi bi-x-circle text-danger"></i></td>
                            <td>$2,890.00</td>
                            <td><span class="badge bg-warning text-dark">En proceso</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0005</td>
                            <td>Héctor Ruiz</td>
                            <td>Carlos Torres</td>
                            <td>2025-07-05</td>
                            <td>Ford Figo - BVC852</td>
                            <td>Efectivo</td>
                            <td><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td>$3,700.00</td>
                            <td><span class="badge bg-success">Finalizada</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0006</td>
                            <td>Lucía Morales</td>
                            <td>Sandra Vega</td>
                            <td>2025-07-06</td>
                            <td>Toyota Corolla - QWE987</td>
                            <td>Tarjeta</td>
                            <td><i class="bi bi-x-circle text-danger"></i></td>
                            <td>$1,980.00</td>
                            <td><span class="badge bg-secondary">Pendiente</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0007</td>
                            <td>Pedro Castillo</td>
                            <td>Miguel Hernández</td>
                            <td>2025-07-07</td>
                            <td>Honda Civic - ASD741</td>
                            <td>Efectivo</td>
                            <td><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td>$2,450.00</td>
                            <td><span class="badge bg-success">Finalizada</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0008</td>
                            <td>Ana Ramírez</td>
                            <td>Carlos Torres</td>
                            <td>2025-07-08</td>
                            <td>Volkswagen Polo - ZXC963</td>
                            <td>Tarjeta</td>
                            <td><i class="bi bi-x-circle text-danger"></i></td>
                            <td>$1,800.00</td>
                            <td><span class="badge bg-warning text-dark">En proceso</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0009</td>
                            <td>Eduardo Mendoza</td>
                            <td>Sandra Vega</td>
                            <td>2025-07-09</td>
                            <td>Hyundai Elantra - YUI753</td>
                            <td>Efectivo</td>
                            <td><i class="bi bi-check-circle-fill text-success"></i></td>
                            <td>$2,230.00</td>
                            <td><span class="badge bg-success">Finalizada</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
                            <button class="btn btn-sm btn-outline-secondary">Editar</button>
                            </td>
                        </tr>
                        <tr>
                            <td>OT-0010</td>
                            <td>Fernanda Salinas</td>
                            <td>Miguel Hernández</td>
                            <td>2025-07-10</td>
                            <td>Kia Rio - MNB159</td>
                            <td>Tarjeta</td>
                            <td><i class="bi bi-x-circle text-danger"></i></td>
                            <td>$3,050.00</td>
                            <td><span class="badge bg-secondary">Pendiente</span></td>
                            <td>
                            <button class="btn btn-sm btn-outline-primary">Ver</button>
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

import { useRouter } from 'vue-router'
const router = useRouter()
/***** FUNCIONES PRINCIPALES *****/
const irA = (ruta) => {
  router.push(ruta)
}
</script>