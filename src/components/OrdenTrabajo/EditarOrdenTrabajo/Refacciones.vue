<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
            <i class="bi bi-tools me-2"></i>Refacciones
        </div>
      <button class="btn btn-sm btn-outline-primary disabled shadow-sm">
          <i class="bi bi-plus me-3"></i>Recibir refacciones
        </button>
    </div>

    <div class="card-body">
      <div v-if="refacciones.length === 0" class="text-muted">
        No hay refacciones en esta orden de trabajo.
      </div>
      <div v-else>
        <table class="table table-sm" style="font-size: 10pt;">
        <thead>
            <tr>
            <th scope="col">Proveedor</th>
            <th scope="col">Refacción</th>
            <th scope="col">Fecha/hora</th>
            <th scope="col">Creado por</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="i in refacciones">
                <td>{{ i.proveedor }}</td>
                <td>{{ i.refaccion }}</td>
                <td>{{ formatearFecha(i.fecha) }}</td>
                <td>{{ i.usuario }}</td>
            </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>

  <!-- MODAL INCIDENTE -->
  <div class="modal fade" id="modalIncidente" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <form>
          <div class="modal-header">
            <h4 class="modal-title">
              Agregar incidencia
            </h4>
          </div>
          <div class="modal-body">
            Fecha / hora de la incidencia
            <div class="row my-2">
              <div class="col-6">
                <input
                  v-model="incidenteForm.fecha"
                  type="date"
                  class="form-control"
                />
              </div>
              <div class="col-6">
                <input
                  v-model="incidenteForm.hora"
                  type="time"
                  class="form-control"
                />
              </div>
            </div>
            Incidente (detalle)
            <div class="row my-2">
              <div class="col-12">
                <textarea v-model="incidenteForm.incidente" class="form-control" rows="3" maxlength="500"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary shadow mx-2" type="button" data-bs-dismiss="modal">
              <i class="bi bi-x-circle-fill me-2"></i>Cancelar
            </button>
            <button class="btn btn-sm btn-success mx-2" type="button" @click="guardarIncidente">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, getCurrentInstance, watch } from 'vue';
import { Modal } from 'bootstrap';
import axios from 'axios';
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const { proxy } = getCurrentInstance()
const refacciones = ref([]);
const incidenteForm = ref({});
let modalIncidente;

const props = defineProps({
  otId: Number,
  usuario: Number
})

const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const d = new Date(fecha);

    const fechaFormateada = d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaFormateada = d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${fechaFormateada}, ${horaFormateada}`;
};

const cargarIncidentes =  async(ot) => {
    incidentes.value = [];
  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/OrdenTrabajo/getIncidentesPorOT?idOT=" + ot
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    const response = await res.json();
    incidentes.value = response.data;
  } catch (error) {
    console.error("Error al cargar los incidentes:", error);
  }
};

const abrirModalIncidente = () => {
  const ahora = new Date();
  incidenteForm.value.fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  incidenteForm.value.hora = ahora.toTimeString().slice(0, 5);
  incidenteForm.value.incidente = "";
  modalIncidente = new Modal(document.getElementById("modalIncidente"));
  modalIncidente.show();
}

const guardarIncidente = async () => {

  const idOT = props.otId;
  const payload = {
    usuario: props.usuario,
    fecha: incidenteForm.value.fecha + 'T' + incidenteForm.value.hora,
    idOrdenTrabajo: idOT,
    incidente: incidenteForm.value.incidente
  };
  console.log(payload);

  try {
    const response = await axios.post(
       proxy.$serverIP + 'api/OrdenTrabajo/crearIncidenteOT',
      payload
    );
    modalIncidente.hide();
    cargarIncidentes(idOT);
  } catch (error) {
    console.error("Error al crear el incidente:", error);
  }
};

// onMounted(() => {
//   if (props.otId) {
//     cargarIncidentes(props.otId)
//   }
// });
</script>