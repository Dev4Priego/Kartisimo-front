<template>
  <div class="card mb-4 shadow-sm">
    <div
      class="card-header bg-light d-flex justify-content-between align-items-center"
    >
      <div><i class="bi bi-return me-2"></i>Seguimientos</div>
      <button
        type="button"
        class="btn btn-sm btn-outline-primary shadow-sm"
        :disabled="guardando"
        @click="nuevoSeguimiento"
      >
        <i class="bi bi-plus-lg me-2"></i>Seguimiento
      </button>
    </div>

    <div class="card-body">
      <div v-if="dropSeguimientoForm" class="row mb-3">
        <div class="col-12 mb-2">
          <label for="conceptoSeguimiento" class="form-label">
            Concepto de trabajo
          </label>
          <select
            id="conceptoSeguimiento"
            v-model.number="seguimientoForm.idConceptoTrabajo"
            class="form-select"
          >
            <option :value="null" disabled>-- Seleccione concepto --</option>
            <option
              v-for="concepto in conceptosTrabajo"
              :key="concepto.idConceptoTrabajo"
              :value="concepto.idConceptoTrabajo"
            >
              {{ concepto.nombre }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-4 mb-2">
          <label for="periodoSeguimiento" class="form-label">Periodo</label>
          <input
            id="periodoSeguimiento"
            v-model.number="seguimientoForm.periodo_cantidad"
            name="periodo"
            type="number"
            class="form-control"
            min="1"
            @input="actualizarFechaSeguimiento"
          />
        </div>

        <div class="col-12 col-md-4 mb-2">
          <label for="tipoPeriodoSeguimiento" class="form-label">
            Tipo de periodo
          </label>
          <select
            id="tipoPeriodoSeguimiento"
            v-model="seguimientoForm.tipo_periodo"
            name="tipo_periodo"
            class="form-select"
            @change="actualizarFechaSeguimiento"
          >
            <option value="Días">Días</option>
            <option value="Semanas">Semanas</option>
            <option value="Meses">Meses</option>
          </select>
        </div>

        <div class="col-12 col-md-4 mb-2">
          <label for="fechaSeguimiento" class="form-label">
            Fecha del seguimiento
          </label>
          <input
            id="fechaSeguimiento"
            :value="seguimientoForm.fecha"
            type="date"
            class="form-control bg-light"
            readonly
          />
        </div>

        <div class="col-12 mb-2">
          <label for="seguimiento" class="form-label">Seguimiento</label>
          <textarea
            id="seguimiento"
            v-model.trim="seguimientoForm.seguimiento"
            name="seguimiento"
            class="form-control"
            rows="3"
            maxlength="300"
          ></textarea>
        </div>

        <div class="col-12 mb-3">
          <div class="form-check">
            <input
              id="seguimientoHecho"
              v-model="seguimientoForm.hecho"
              class="form-check-input"
              type="checkbox"
            />
            <label class="form-check-label" for="seguimientoHecho">
              Seguimiento realizado
            </label>
          </div>
        </div>

        <div class="col-12">
          <div class="d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-sm btn-secondary shadow-sm me-2"
              :disabled="guardando"
              @click="cerrarFormulario"
            >
              <i class="bi bi-x-circle-fill me-2"></i>Cerrar
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary shadow-sm"
              :disabled="guardando"
              @click="guardarSeguimiento()"
            >
              <span
                v-if="guardando"
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              ></span>
              <i v-else class="bi bi-save-fill me-2"></i>
              Guardar
            </button>
          </div>
        </div>
      </div>

      <div v-if="cargando" class="py-3 text-center text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Cargando seguimientos...
      </div>

      <div v-else-if="seguimientos.length === 0" class="text-muted">
        No hay seguimientos en esta orden de trabajo.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Concepto de trabajo</th>
              <th scope="col">Seguimiento</th>
              <th scope="col">Periodo</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="seguimiento in seguimientos"
              :key="seguimiento.idSeguimiento"
            >
              <td>{{ seguimiento.conceptoTrabajo || "Sin concepto" }}</td>
              <td>{{ seguimiento.seguimientoDescripcion }}</td>
              <td class="text-nowrap">
                {{ seguimiento.cantidadPeriodo }} {{ seguimiento.periodo }}
              </td>
              <td class="text-nowrap">
                {{ formatearFecha(seguimiento.fecha) }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="
                    seguimiento.hecho ? 'text-bg-success' : 'text-bg-warning'
                  "
                >
                  {{ seguimiento.hecho ? "Realizado" : "Pendiente" }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-warning me-2"
                  title="Editar seguimiento"
                  :disabled="guardando"
                  @click="editarSeguimiento(seguimiento)"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  title="Eliminar seguimiento"
                  :disabled="guardando"
                  @click="eliminarSeguimiento(seguimiento)"
                >
                  <i class="bi bi-trash me-1"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, watch } from "vue";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const { proxy } = getCurrentInstance();
const userData = JSON.parse(localStorage.getItem("userSession"));

const props = defineProps({
  otId: Number,
  usuario: Number,
});

const seguimientos = ref([]);
const conceptosTrabajo = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const dropSeguimientoForm = ref(false);

const fechaLocalISO = (fecha) => {
  const fechaLocal = new Date(fecha);
  fechaLocal.setMinutes(
    fechaLocal.getMinutes() - fechaLocal.getTimezoneOffset(),
  );
  return fechaLocal.toISOString().slice(0, 10);
};

const crearSeguimientoVacio = () => ({
  idSeguimiento: null,
  idConceptoTrabajo: null,
  periodo_cantidad: 1,
  tipo_periodo: "Días",
  fecha: fechaLocalISO(new Date()),
  seguimiento: "",
  hecho: false,
});

const seguimientoForm = ref(crearSeguimientoVacio());

const headersAutorizados = () => {
  const headers = { "Content-Type": "application/json" };
  if (userData?.token) headers.Authorization = `Bearer ${userData.token}`;
  return headers;
};

const notificar = (text, esError = false) => {
  Toastify({
    text,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: { background: esError ? "#dc3545" : "#198754" },
  }).showToast();
};

const calcularFecha = () => {
  const fecha = new Date();
  const cantidad = Math.max(
    Number(seguimientoForm.value.periodo_cantidad) || 0,
    0,
  );

  switch (seguimientoForm.value.tipo_periodo) {
    case "Semanas":
      fecha.setDate(fecha.getDate() + cantidad * 7);
      break;
    case "Meses":
      fecha.setMonth(fecha.getMonth() + cantidad);
      break;
    default:
      fecha.setDate(fecha.getDate() + cantidad);
      break;
  }

  return fechaLocalISO(fecha);
};

const actualizarFechaSeguimiento = () => {
  seguimientoForm.value.fecha = calcularFecha();
};

const cerrarFormulario = () => {
  dropSeguimientoForm.value = false;
  seguimientoForm.value = crearSeguimientoVacio();
};

const nuevoSeguimiento = () => {
  seguimientoForm.value = crearSeguimientoVacio();
  actualizarFechaSeguimiento();
  dropSeguimientoForm.value = true;
};

const normalizarPeriodo = (periodo) => {
  if (periodo === "Dias") return "Días";
  return ["Días", "Semanas", "Meses"].includes(periodo) ? periodo : "Días";
};

const editarSeguimiento = (seguimiento) => {
  seguimientoForm.value = {
    idSeguimiento: seguimiento.idSeguimiento,
    idConceptoTrabajo: seguimiento.idConceptoTrabajo || null,
    periodo_cantidad: seguimiento.cantidadPeriodo,
    tipo_periodo: normalizarPeriodo(seguimiento.periodo),
    fecha: fechaLocalISO(seguimiento.fecha),
    seguimiento: seguimiento.seguimientoDescripcion,
    hecho: Number(seguimiento.hecho) === 1,
  };
  dropSeguimientoForm.value = true;
};

const cargarConceptosTrabajo = async () => {
  try {
    const response = await fetch(`${proxy.$serverIP}api/ConceptoTrabajo/get`, {
      headers: headersAutorizados(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "No fue posible cargar los conceptos.");
    }

    conceptosTrabajo.value = (Array.isArray(data) ? data : []).map(
      (concepto) => ({
        idConceptoTrabajo: Number(concepto.idConcetoOrdenTrabajo),
        nombre: concepto.nombre,
      }),
    );
  } catch (error) {
    console.error("Error al cargar conceptos de trabajo:", error);
    conceptosTrabajo.value = [];
    notificar(error.message || "No fue posible cargar los conceptos.", true);
  }
};

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const cargarSeguimientos = async () => {
  if (!props.otId) {
    seguimientos.value = [];
    return;
  }

  cargando.value = true;
  try {
    const response = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/ListarSeguimientosByOT?idOT=${props.otId}`,
      { headers: headersAutorizados() },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No fue posible cargar los seguimientos.");
    }

    seguimientos.value = data.data || [];
  } catch (error) {
    console.error("Error al cargar los seguimientos:", error);
    notificar(error.message || "No fue posible cargar los seguimientos.", true);
  } finally {
    cargando.value = false;
  }
};

const mapearSeguimiento = (seguimiento) => ({
  idSeguimiento: seguimiento.idSeguimiento || null,
  idOrdenTrabajo: props.otId,
  idConceptoTrabajo: seguimiento.idConceptoTrabajo || null,
  seguimientoDescripcion: seguimiento.seguimientoDescripcion,
  cantidadPeriodo: Number(seguimiento.cantidadPeriodo) || 0,
  periodo: normalizarPeriodo(seguimiento.periodo),
  fecha: seguimiento.fecha,
  hecho: Number(seguimiento.hecho) === 1 ? 1 : 0,
});

const coleccionConFormulario = () => {
  const seguimientoEditado = {
    idSeguimiento: seguimientoForm.value.idSeguimiento,
    idOrdenTrabajo: props.otId,
    idConceptoTrabajo: seguimientoForm.value.idConceptoTrabajo,
    seguimientoDescripcion: seguimientoForm.value.seguimiento,
    cantidadPeriodo: Number(seguimientoForm.value.periodo_cantidad) || 0,
    periodo: seguimientoForm.value.tipo_periodo,
    fecha: seguimientoForm.value.fecha,
    hecho: seguimientoForm.value.hecho ? 1 : 0,
  };

  const indice = seguimientos.value.findIndex(
    (seguimiento) =>
      seguimiento.idSeguimiento === seguimientoEditado.idSeguimiento,
  );

  if (indice === -1) return [...seguimientos.value, seguimientoEditado];

  return seguimientos.value.map((seguimiento, index) =>
    index === indice ? seguimientoEditado : seguimiento,
  );
};

const guardarSeguimiento = async (
  coleccion = coleccionConFormulario(),
  mensaje = "Seguimientos guardados correctamente.",
) => {
  if (!props.otId || !props.usuario) {
    notificar("No fue posible identificar la orden o el usuario.", true);
    return false;
  }

  if (dropSeguimientoForm.value && !seguimientoForm.value.idConceptoTrabajo) {
    notificar("Selecciona un concepto de trabajo.", true);
    return false;
  }

  if (dropSeguimientoForm.value && !seguimientoForm.value.seguimiento) {
    notificar("Escribe la descripción del seguimiento.", true);
    return false;
  }

  guardando.value = true;
  const payload = {
    seguimientos: coleccion.map(mapearSeguimiento),
    idOT: props.otId,
    idUsuario: props.usuario,
  };

  try {
    const response = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/InsertarSeguimiento`,
      {
        method: "POST",
        headers: headersAutorizados(),
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No fue posible guardar los seguimientos.");
    }

    await cargarSeguimientos();
    cerrarFormulario();
    notificar(mensaje);
    return true;
  } catch (error) {
    console.error("Error al guardar los seguimientos:", error);
    notificar(
      error.message || "No fue posible guardar los seguimientos.",
      true,
    );
    return false;
  } finally {
    guardando.value = false;
  }
};

const eliminarSeguimiento = async (seguimiento) => {
  const confirmado = window.confirm(
    "¿Deseas eliminar este seguimiento de la orden de trabajo?",
  );
  if (!confirmado) return;

  const restantes = seguimientos.value.filter(
    (item) => item.idSeguimiento !== seguimiento.idSeguimiento,
  );
  cerrarFormulario();
  await guardarSeguimiento(restantes, "Seguimiento eliminado correctamente.");
};

watch(
  () => props.otId,
  () => {
    cerrarFormulario();
    cargarSeguimientos();
  },
  { immediate: true },
);

cargarConceptosTrabajo();
</script>
