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
          class="form-control w-100"
          v-model="buscarOrdenTrabajo"
        />
      </div>

      <div class="col d-flex align-items-center">
        <label for="" class="form-label me-2">Sucursal:</label>
        <select
          name="sucursalFilter"
          id="sucursalFilter"
          class="form-select"
          v-model="SucursalSelected"
        >
          <option value="">Todas</option>
           <option
            v-for="sucursal in sucursales"
            :key="sucursal.idSucursal"
            :value="sucursal.idSucursal"
          >
            {{ sucursal.nombre }}
          </option>
        </select>
      </div>
      <div class="col d-flex align-items-center">
        <label for="" class="form-label me-2">Estatus:</label>
        <select
          name="sucursalFilter"
          id="sucursalFilter"
          class="form-select"
          v-model="EstatusSelected"
        >
          <option value="">Todas</option>
           <option
            v-for="estatus in estatusOrdenes"
            :key="estatus"
            :value="estatus"
          >
            {{ estatus }}
          </option>
         
        </select>
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
                v-if="ot.isHija == 1"
                class="bi bi-node-plus-fill ms-1"
                title="OT Derivada"
              ></i>
            </span>
          </template>
          <template #item-clienteTelefono="ot">
            <div class="d-flrx justify-content-center align-items-center">

            <button class="btn btn-outline-success mx-1  " v-if="ot.clienteTelefono != 'N/A'" @click="GotoWhatsApp(ot.clienteTelefono)" > <i class="bi bi-whatsapp"></i></button>
            <span class="text-center mx-3">{{ formatearTelefono(ot.clienteTelefono) }}</span>
          </div>
          </template>
          <template #item-fechaAlta="ot">
            {{ formatearFecha(ot.fechaAlta) }}
          </template>

          <template #item-horaEntrega="ot">
            <span
              class="text-nowrap"
              :class="entregaFueraDeTiempo(ot) ? 'text-danger' : '' "
              :title="detalleHoraEntrega(ot)"
            >
              {{ formatearHora(ot.fechaEntrega) }}{{
                fechaEntregaEsOtroDia(ot.fechaEntrega , ot.fechaAlta) ? "*" : ""}}
            </span>
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
                ot.vigente == 0 ? 'badge bg-danger' : badgeEstado(ot.estado)
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
                v-if="
                  ot.idSucursal == userData.usuario.idSucursal ||
                  userData.usuario.idSucursal == 1
                "
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
import axios from "axios";
import { GotoWhatsApp } from "@/components/common/funciones";
import { formatearTelefono } from "@/utils/cotizacion";
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
const sucursales = ref([]);
const SucursalSelected = ref("");
const estatusOrdenes = ref([]);
const EstatusSelected = ref("");
const API_SUCURSALES = `${proxy.$serverIP}api/Sucursales/getSucursales`;
const headersOrdenTrabajo = [
  { text: "#", value: "codigo", sortable: true },
  { text: "Cliente", value: "clienteNombre", sortable: true },
  { text: "Telefono", value: "clienteTelefono", sortable: true },

  { text: "Vehiculo", value: "vehiculoTabla", sortable: true },
  { text: "Fecha", value: "fechaAlta", sortable: true },
  { text: "Hora entrega", value: "horaEntrega", sortable: true },
  { text: "Tecnico", value: "empleadoNombre", sortable: true },
  { text: "Método", value: "metodoPago", sortable: true },
  { text: "Forma", value: "formaPago", sortable: true },
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

  const res = await fetch(
    `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajo`,
    options,
  );
  const result = await res.json();
  listaOrdenTrabajo.value = result.data;
  obtenerEstatusOrdenes();
  loading.value = false;
};

const obtenerEstatusOrdenes = () => {
  const estatus = listaOrdenTrabajo.value.ordenes.map((ot) =>
    ot?.vigente == 0 ? "Cancelada" : ot?.estado,
  );

  estatusOrdenes.value = [...new Set(estatus.filter(Boolean))];
};

const fetchSucursales = async () => {
  try {
    const res = await axios.get(API_SUCURSALES, {
      headers: {
        Authorization: `Bearer ${userData?.token}`,
      },
    });
    sucursales.value = res.data;
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    Swal.fire("Error", "Error al cargar sucursales.", "error");
  }
};
const listaOrdenTrabajoFilter = computed(() => {
  let ordenesFiltered = listaOrdenTrabajo.value.ordenes;

  // Filtro por sucursal
  if (SucursalSelected.value) {
    ordenesFiltered = ordenesFiltered.filter(
      (ot) => ot?.idSucursal == SucursalSelected.value,
    );
  }

  // Filtro por estatus
  if (EstatusSelected.value) {
    ordenesFiltered = ordenesFiltered.filter((ot) => {
      const estatus = ot?.vigente == 0 ? "Cancelada" : ot?.estado;
      return estatus === EstatusSelected.value;
    });
  }

  // Filtro por búsqueda
  if (buscarOrdenTrabajo.value) {
    const busqueda = buscarOrdenTrabajo.value.toLowerCase();
    ordenesFiltered = ordenesFiltered.filter((ot) => {
      const orden = `o${ot?.prefijo?.toLowerCase() ?? ""}-${
        ot?.consecutivoSucursal
      }`;
      const nombre = ot?.clienteNombre?.toLowerCase() ?? "";
      return orden.includes(busqueda) || nombre.includes(busqueda);
    });
  }

  return {
    ordenes: ordenesFiltered,
    totales: listaOrdenTrabajo.value.totales,
  };
});

const ordenesTabla = computed(() =>
  (listaOrdenTrabajoFilter.value.ordenes || []).map((ot) => ({
    ...ot,
    codigo: `O${ot.prefijo}-${ot?.isHija == 0  ? ot?.consecutivoSucursal : ot?.subConsecutivoSucursal}`,
    vehiculoTabla: `${ot.vehiculoModelo || ""} ${
      ot.vehiculoPlacas || ""
    }`.trim(),
    horaEntrega: ot.fechaEntrega || "",
    estadoTabla: ot.vigente == 0 ? "Cancelada" : ot.estado,
    desecharOrden:
      ot.desecharLlanta === true
        ? "Si"
        : ot.desecharLlanta === false
        ? "No"
        : "N/A",
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

const obtenerFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const esMismoDia = (fechaA, fechaB) =>
  fechaA?.getFullYear() === fechaB?.getFullYear() &&
  fechaA?.getMonth() === fechaB?.getMonth() &&
  fechaA?.getDate() === fechaB?.getDate();

const formatearHora = (valor) => {
  const fecha = obtenerFecha(valor);
  if (!fecha) return "—";

  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatearFechaHora = (valor) => {
  const fecha = obtenerFecha(valor);
  if (!fecha) return "No registrada";

  return fecha.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fechaEntregaEsOtroDia = (Entrega, Alta) => {
  const fechaEntrega = obtenerFecha(Entrega);
  const fechaAlta = obtenerFecha(Alta)
  return Boolean(fechaEntrega && !esMismoDia(fechaEntrega, fechaAlta));
};

const entregaFueraDeTiempo = (ot) => {
  const fechaComprometida = obtenerFecha(ot?.fechaEntrega);
  const fechaReal = obtenerFecha(ot?.fechaEntregaReal); //Fecha finalizado, no de entrega
  return Boolean(fechaComprometida && fechaReal && fechaReal > fechaComprometida);
};

const detalleHoraEntrega = (ot) => {
  if (!ot?.fechaEntrega) return "Sin fecha de entrega comprometida";

  const partes = [
    `Comprometida: ${formatearFechaHora(ot.fechaEntrega)}`,
  ];

  if (ot.fechaEntregaReal) {
    partes.push(`Entrega real: ${formatearFechaHora(ot.fechaEntregaReal)}`);
  }

  if (fechaEntregaEsOtroDia(ot.fechaEntrega)) {
    partes.push("* La entrega comprometida no corresponde al día de hoy");
  }

  return partes.join(". ");
};

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

onMounted(() => {
  fetchSucursales();
  cargarOrdenTrabajo();
});

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
