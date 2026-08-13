<template>
  <div class="container-fluid p-4">
    <div class="row my-3 align-items-center">
      <div>
        <h1>
          <i class="bi bi-wrench-adjustable me-2"></i>
          Ordenes de Trabajo
        </h1>
      </div>
    </div>

    <div class="row mx-4 align-items-center">
      <div class="col">
        <input
          type="text"
          placeholder="Buscar orden de trabajo."
          class="form-control form-control-md w-50"
          v-model="buscarOrdenTrabajo"
        />
      </div>
      <div class="col"></div>

      <div class="col-4 col-lg-3">
        <router-link :to="{ name: 'orden-trabajo-form' }">
          <button class="btn btn-primary form-control">
            <i class="bi bi-plus-lg me-2"></i>
            Nueva orden
          </button>
        </router-link>
      </div>
    </div>

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

    <div class="row p-3">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">Cargando ordenes...</p>
      </div>

      <div v-else class="col">
        <EasyDataTable
          :headers="headersOrdenTrabajo"
          :items="ordenesTabla"
          :rows-per-page="50"
          rows-per-page-message="Elementos por pagina:"
          empty-message="No hay ordenes de trabajo."
          buttons-pagination
          alternating
          table-class-name="table table-hover align-middle text-center mb-0"
        >
          <template #item-codigo="ot">
            <span class="text-nowrap">
              {{ ot.codigo }}
              <i
                v-if="ot.isHija"
                class="bi bi-node-plus-fill ms-1"
                title="OT Derivada"
              ></i>
            </span>
          </template>

          <template #item-fechaAlta="ot">
            {{ formatearFecha(ot.fechaAlta) }}
          </template>

          <template #item-requiereFactura="ot">
            <i
              v-if="ot.requiereFactura"
              class="bi bi-check-circle-fill text-success"
            ></i>
            <i v-else class="bi bi-x-circle-fill text-danger"></i>
          </template>

          <template #item-estadoTabla="ot">
            <span
              :class="
                ot.vigente == 0
                  ? 'badge bg-danger'
                  : badgeEstado(ot.estado)
              "
            >
              {{ ot.estadoTabla }}
            </span>
          </template>

          <template #item-desecharOrden="ot">
            <i
              v-if="ot.desecharLlanta === true"
              class="bi bi-check-circle-fill text-success"
            ></i>
            <i
              v-else-if="ot.desecharLlanta === false"
              class="bi bi-x-circle-fill text-danger"
            ></i>
            <i v-else class="bi bi-dash-circle-fill text-secondary"></i>
          </template>

          <template #item-acciones="ot">
            <div class="d-flex gap-1 justify-content-start">
              <button
                class="btn btn-sm btn-outline-info"
                @click="verOT(ot.idOrdenTrabajo)"
                title="Ver"
              >
                <i class="bi bi-eye"></i>
              </button>

              <button
                v-if="ot.idSucursal == userData.usuario.idSucursal || userData.usuario.idSucursal == 1"
                class="btn btn-sm btn-outline-warning"
                @click="editarOT(ot.idOrdenTrabajo)"
                title="Editar"
              >
                <i class="bi bi-pencil-square"></i>
              </button>
            </div>
          </template>
        </EasyDataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import EasyDataTable from "vue3-easy-data-table";

const { proxy } = getCurrentInstance();
const router = useRouter();
const userData = JSON.parse(localStorage.getItem("userSession"));
const itmEmpleados = ref({});
const loading = ref(true);
const listaOrdenTrabajo = ref({
  ordenes: [],
  totales: { finalizado: 0, enCurso: 0, creado: 0 },
});
const buscarOrdenTrabajo = ref("");
const otEditar = ref({});
let modalEditar;
let modalIncidente;

const headersOrdenTrabajo = [
  { text: "#", value: "codigo", sortable: true },
  { text: "Cliente", value: "clienteNombre", sortable: true },
  { text: "Vehiculo", value: "vehiculoTabla", sortable: true },
  { text: "Fecha", value: "fechaAlta", sortable: true },
  { text: "Tecnico", value: "empleadoNombre", sortable: true },
  { text: "Pago", value: "metodoPago", sortable: true },
  { text: "Factura", value: "requiereFactura", sortable: true },
  { text: "Estatus", value: "estadoTabla", sortable: true },
  { text: "Desechar", value: "desecharOrden", sortable: true },
  { text: "Acciones", value: "acciones", width: 110 },
];

const abrirModalEditar = async (ot) => {
  const resp = await fetch(
    `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${ot}`,
  );
  const data = await resp.json();
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

const cargarOrdenTrabajo = async (options = {}) => {
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (userData?.token) {
    options.headers["Authorization"] = `Bearer ${userData?.token}`;
  }

  const res = await fetch(`${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajo`, options);
  const result = await res.json();
  listaOrdenTrabajo.value = result.data;
  loading.value = false;
};

const listaOrdenTrabajoFilter = computed(() => {
  if (!buscarOrdenTrabajo.value) return listaOrdenTrabajo.value;

  const busqueda = buscarOrdenTrabajo.value.toLowerCase();

  const ordenesFiltered = listaOrdenTrabajo.value.ordenes.filter((ot) => {
    const orden = `o${ot?.prefijo?.toLowerCase() ?? ""}-${
      ot?.consecutivoSucursal
    }`;
    const nombre = ot?.clienteNombre?.toLowerCase() ?? "";
    return orden.includes(busqueda) || nombre.includes(busqueda);
  });

  return {
    ordenes: ordenesFiltered,
    totales: listaOrdenTrabajo.value.totales,
  };
});

const ordenesTabla = computed(() =>
  (listaOrdenTrabajoFilter.value.ordenes || []).map((ot) => ({
    ...ot,
    codigo: `O${ot.prefijo}-${ot.consecutivoSucursal}`,
    vehiculoTabla: `${ot.vehiculoModelo || ""} ${ot.vehiculoPlacas || ""}`.trim(),
    estadoTabla: ot.vigente == 0 ? "Cancelada" : ot.estado,
    desecharOrden:
      ot.desecharLlanta === true ? "Si" : ot.desecharLlanta === false ? "No" : "N/A",
  })),
);

const verOT = (id) => {
  router.push(`/content/orden-trabajo/${id}`);
};

const cargarEmpleados = async (options = {}) => {
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (userData?.token) {
    options.headers["Authorization"] = `Bearer ${userData?.token}`;
  }

  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/Empleado/getEmpleado?idSucursal=" +
        userData.usuario.idSucursal,
      options,
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    itmEmpleados.value = await res.json();
  } catch (error) {
    console.error("Error al cargar empleado:", error);
  }
};

const formatearFecha = (f) => new Date(f).toLocaleDateString("es-MX");

const badgeEstado = (e) =>
  ({
    Creado: "badge bg-secondary",
    "En curso": "badge bg-warning text-dark",
    Finalizado: "badge bg-success",
    Entregado: "badge bg-primary",
  }[e]);

const colorTotal = (k) =>
  ({
    finalizado: "border-success text-success",
    enCurso: "border-primary text-primary",
    creado: "border-warning text-warning",
    cancelado: "border-danger text-danger",
  }[k]);

const nombreTotal = (k) =>
  ({
    finalizado: "Completadas",
    enCurso: "En curso",
    creado: "Pendientes",
    cancelado: "Canceladas",
  }[k]);

onMounted(cargarOrdenTrabajo);

const editarOT = (id) => {
  console.log(" Editar OT:", id);
  router.push(`/content/orden-trabajo/${id}/work`);
};

const estados = ["Creado", "En curso", "Finalizado", "Entregado"];

const indiceActual = computed(() => {
  return estados.indexOf(otEditar.value.estado);
});

const esCompletado = (estado) => {
  return estados.indexOf(estado) < indiceActual.value;
};

const clasePaso = (estado) => {
  const idx = estados.indexOf(estado);

  if (idx < indiceActual.value) {
    return "bg-success text-white";
  }

  if (idx === indiceActual.value) {
    return "bg-primary text-white";
  }

  return "bg-light border";
};

const lineaClase = (estado) => {
  return estados.indexOf(estado) < indiceActual.value
    ? "bg-success"
    : "bg-secondary";
};
</script>
