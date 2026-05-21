<template>
  <div class="container-fluid p-4">

    <!-- HEADER -->
    <div class="row mx-4 align-items-center">
      <div class="col">
        <h2>
          <i class="bi bi-wrench-adjustable me-2"></i>
          Órdenes de Trabajo
        </h2>
      </div>

      <div class="col-4 col-lg-3">
        <router-link :to="{ name: 'orden-trabajo-form' }">
          <button class="btn btn-primary form-control">
            <i class="bi bi-plus-lg me-2"></i>
            Nueva orden
          </button>
        </router-link>
      </div>
    </div>

    <!-- TOTALES -->
    <div class="row mt-4 mx-4">
      <div class="col" v-for="(v, k) in listaOrdenTrabajo.totales" :key="k">
        <div
          class="border-start border-4 bg-white rounded shadow-sm p-3"
          :class="colorTotal(k)"
        >
          <h5 class="mb-0 fw-bold">{{ v }}</h5>
          <small class="text-muted">{{ nombreTotal(k) }}</small>
        </div>
      </div>
    </div>

    <!-- TABLA -->
    <div class="row p-3">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Cargando órdenes...</p>
      </div>

      <div v-else class="col">
        <table class="table table-hover align-middle text-center">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Fecha</th>
              <th>Técnico</th>
              <th>Pago</th>
              <th>Factura</th>
              <th>Estatus</th>
              <th>Desechar</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="ot in listaOrdenTrabajo.ordenes"
              :key="ot.idOrdenTrabajo"
            >
              <td style="white-space: nowrap;">O{{ ot.prefijo }}-{{ ot.consecutivoSucursal }} 
                <div v-if="ot.isHija" class="float-sm-end" >
                  <i class="bi bi-node-plus-fill ms-1" title="OT Derivada"></i>
                </div>
              </td>
              <td>{{ ot.clienteNombre }}</td>
              <td>{{ ot.vehiculoModelo }} {{ ot.vehiculoPlacas }}</td>
              <td>{{ formatearFecha(ot.fechaAlta) }}</td>
              <td>{{ ot.empleadoNombre }}</td>
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
                  v-if="ot.desecharLlanta === true"
                  class="bi bi-check-circle-fill text-success"
                ></i>
                <i
                  v-else-if="ot.desecharLlanta === false"
                  class="bi bi-x-circle-fill text-danger"
                ></i>
                <i
                  v-else
                  class="bi bi-dash-circle-fill text-secondary"
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
                  @click="editarOT(ot.idOrdenTrabajo)"
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

  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";

const { proxy } = getCurrentInstance();
const router = useRouter();

const itmEmpleados = ref({});
const loading = ref(true);
const listaOrdenTrabajo = ref({
  ordenes: [],
  totales: { finalizado: 0, enCurso: 0, creado: 0 },
});

/* ===== MODAL ===== */
const otEditar = ref({});
let modalEditar;
let modalIncidente;

const abrirModalEditar = async(ot) => {
  const resp = await fetch(
		`${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${ot}`
	)
	const data = await resp.json()
  otEditar.value = data;
  console.log(otEditar.value);
  cargarEmpleados();
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

/* ===== DATA ===== */
const cargarOrdenTrabajo = async () => {
  const res = await fetch(`${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajo`);
  const result = await res.json();
  listaOrdenTrabajo.value = result.data;
  loading.value = false;
};

const verOT = (id) => {
  router.push(`/content/orden-trabajo/${id}`);
};

const cargarEmpleados = async () => {
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/Empleado/getEmpleado?idSucursal=" +
        userSession.usuario.idSucursal
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    const data = await res.json();

    itmEmpleados.value = data;
    // console.log('Empleados: '+ JSON.stringify(data))
    // console.log('Empleados: '+ JSON.stringify(itmEmpleados.value))
  } catch (error) {
    console.error("Error al cargar empleado:", error);
  }
};

/* ===== HELPERS ===== */
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

const editarOT = (id) => {
  console.log(' Editar OT:', id)
  router.push(`/content/orden-trabajo/${id}/work`)
}

const estados = [
  'Creado',
  'En curso',
  'Finalizado',
  'Entregado'
]

const indiceActual = computed(() => {
  return estados.indexOf(otEditar.value.estado)
})

// ¿ya pasó este estado?
const esCompletado = (estado) => {
  return estados.indexOf(estado) < indiceActual.value
}

// clases del círculo
const clasePaso = (estado) => {
  const idx = estados.indexOf(estado)

  if (idx < indiceActual.value) {
    return 'bg-success text-white'
  }

  if (idx === indiceActual.value) {
    return 'bg-primary text-white'
  }

  return 'bg-light border'
}

// clases de la línea entre pasos
const lineaClase = (estado) => {
  return estados.indexOf(estado) < indiceActual.value
    ? 'bg-success'
    : 'bg-secondary'
}

</script>
