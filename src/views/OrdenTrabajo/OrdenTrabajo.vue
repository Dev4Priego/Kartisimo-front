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
                            <td style="white-space: nowrap;">OT-{{ ot.idOrdenTrabajo }}</td>
                            <td>{{ ot.clienteNombre}} {{ot.clienteTelefono}}</td>
                            <td>{{ ot.vehiculoModelo}} {{ot.vehiculoPlacas}}</td>
                            <td>{{ formatearFecha(ot.fechaAlta) }}</td>
                            <td>{{ ot.empleadoNombre }}</td>
                            <td>{{ ot.metodoPago }}</td>
  <div class="container-fluid p-4">
    <!-- HEADER -->
    <div class="row mx-4">
      <div class="col">
        <h2>Orden de Trabajo</h2>
      </div>
      <div class="col-4">
        <router-link :to="{ name: 'formOT' }">
          <button class="btn btn-outline-primary form-control">
            Nueva Orden
          </button>
        </router-link>
      </div>
    </div>

    <!-- TOTALES -->
    <div class="row mt-4 mx-4">
      <div class="col" v-for="(v, k) in listaOrdenTrabajo.totales" :key="k">
        <div class="border-start border-4 bg-white rounded shadow-sm p-3"
             :class="colorTotal(k)">
          <h5 class="mb-0 fw-bold">{{ v }}</h5>
          <small class="text-muted">{{ nombreTotal(k) }}</small>
        </div>
      </div>
    </div>

    <!-- TABLA -->
    <div class="row p-3">
      <div v-if="loading" class="text-center my-4">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Cargando órdenes...</p>
      </div>

      <div v-else class="col">
        <table class="table table-hover align-middle text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Fecha</th>
              <th>Técnico</th>
              <th>Tipo OT</th>
              <th>Pago</th>
              <th>Factura</th>
              <th>Estatus</th>
              <th>Desechar Llanta</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="ot in listaOrdenTrabajo.ordenes"
              :key="ot.idOrdenTrabajo"
            >
              <td>OT-{{ ot.idOrdenTrabajo }}</td>
              <td>{{ ot.clienteNombre }} {{ ot.clienteTelefono }}</td>
              <td>{{ ot.vehiculoModelo }} {{ ot.vehiculoPlacas }}</td>
              <td>{{ formatearFecha(ot.fechaAlta) }}</td>
              <td>{{ ot.empleadoNombre }}</td>
              <td>{{ ot.tipoOrdenTrabajo }}</td>
              <td>{{ ot.metodoPago }}</td>

              <!-- FACTURA -->
              <td>
                <i
                  v-if="ot.requiereFactura"
                  class="bi bi-check-circle-fill text-success"
                ></i>
                <i
                  v-else
                  class="bi bi-x-circle-fill text-danger"
                ></i>
              </td>

              <!-- ESTADO -->
              <td>
                <span :class="badgeEstado(ot.estado)">
                  {{ ot.estado }}
                </span>
              </td>

              <!-- DESECHAR LLANTA -->
              <td>
                <i
                  v-if="ot.desecharLlanta"
                  class="bi bi-check-circle-fill text-success"
                ></i>
                <i
                  v-else
                  class="bi bi-x-circle-fill text-danger"
                ></i>
              </td>

              <!-- ACCIONES -->
              <td>
                <div class="d-flex gap-1 justify-content-center">
                  <button
                    class="btn btn-sm btn-outline-info"
                    @click="verOT(ot.idOrdenTrabajo)"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-outline-warning"
                    @click="abrirModalEditar(ot)"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div class="modal fade" id="modalEditarOT" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Editar OT #{{ otEditar.idOrdenTrabajo }}
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body row g-3">
            <div class="col-md-6">
              <label class="form-label">Método de pago</label>
              <select class="form-select" v-model="otEditar.metodoPago">
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select class="form-select" v-model="otEditar.estado">
                <option>Creado</option>
                <option>En curso</option>
                <option>Finalizado</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Factura</label>
              <select class="form-select" v-model="otEditar.requiereFactura">
                <option :value="true">Sí</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button class="btn btn-primary" @click="guardarEdicion">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";

const { proxy } = getCurrentInstance();
const router = useRouter();

const loading = ref(true);
const listaOrdenTrabajo = ref({
  ordenes: [],
  totales: { finalizado: 0, enCurso: 0, creado: 0 },
});

/* ================= MODAL ================= */
const otEditar = ref({});
let modalEditar;

const abrirModalEditar = (ot) => {
  otEditar.value = { ...ot };
  modalEditar = new Modal(document.getElementById("modalEditarOT"));
  modalEditar.show();
};

const guardarEdicion = async () => {
  await fetch(`${proxy.$serverIP}api/OrdenTrabajo/updateOrdenTrabajo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(otEditar.value),
  });
  modalEditar.hide();
  cargarOrdenTrabajo();
};

/* ================= DATA ================= */
const cargarOrdenTrabajo = async () => {
  const res = await fetch(
    `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajo`
  );
  const result = await res.json();
  listaOrdenTrabajo.value = result.data;
  loading.value = false;
};

const verOT = (id) => {
  router.push(`/content/orden-trabajo/${id}`);
};

/* ================= HELPERS ================= */
const formatearFecha = (f) =>
  new Date(f).toLocaleDateString("es-MX");

const badgeEstado = (e) =>
  ({
    Creado: "badge bg-secondary",
    "En curso": "badge bg-warning text-dark",
    Finalizado: "badge bg-success",
  }[e]);

const colorTotal = (k) =>
  ({
    finalizado: "border-success text-success",
    enCurso: "border-primary text-primary",
    creado: "border-danger text-danger",
  }[k]);

const nombreTotal = (k) =>
  ({
    finalizado: "Completadas",
    enCurso: "En curso",
    creado: "Pendientes",
  }[k]);

onMounted(cargarOrdenTrabajo);
</script>
