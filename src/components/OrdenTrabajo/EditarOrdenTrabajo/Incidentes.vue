<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Incidentes
        </div>
      <button class="btn btn-sm btn-outline-warning shadow-sm" @click="nuevoIncidente()">
          <i class="bi bi-plus me-3"></i>Registrar incidente
        </button>
    </div>

    <div class="card-body">
        <div v-if="modalIncidente" class="row">
        <div class="col-6 mb-2">
            <label for="fechaIncidente" class="form-label"><i class="bi bi-calendar-event mx-1"></i> Fecha</label>
            <input
                id="fechaIncidente"
                v-model="incidenteForm.fecha"
                type="date"
                class="form-control"
            />
        </div>
        <div class="col-6 mb-2">
            <label for="horaIncidente" class="form-label"><i class="bi bi-clock-fill mx-1"></i> Hora</label>
            <input
                id="horaIncidente"
                v-model="incidenteForm.hora"
                type="time"
                class="form-control"
            />
        </div>
        <div class="col-12">
            <label for="textoIncidente" class="form-label"><i class="bi bi-exclamation-triangle-fill mx-1"></i> Detalle del incidente</label>
            <textarea id="textoIncidente" v-model="incidenteForm.incidente" class="form-control" rows="3" maxlength="500"></textarea>
        </div>
        <div class="col-12 my-2">
            <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-secondary shadow-sm me-3" @click="modalIncidente = false">
                    <i class="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button class="btn btn-sm btn-primary shadow-sm" @click="guardarIncidente()">
                    <i class="bi bi-save-fill me-2"></i> Guardar
                </button>
            </div>
        </div>
      </div>
      <div v-if="incidentes.length === 0" class="text-muted">
        No hay incidentes en esta orden de trabajo.
      </div>
      <div v-else>
        <table class="table table-sm" style="font-size: 10pt;">
            <thead>
                <tr>
                <th scope="col">Incidente</th>
                <th scope="col">Fecha/hora</th>
                <th scope="col">Creado por</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in incidentes" >
                    <td>{{ i.incidente }}</td>
                    <td style="white-space: nowrap;">{{ formatearFecha(i.fecha) }}</td>
                    <td style="white-space: nowrap;">{{ i.usuario }}</td>
                </tr>
            </tbody>
        </table>
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
const incidentes = ref([]);
const incidenteForm = ref({ fecha: '', hora: '', incidente: '' });
const modalIncidente = ref(false);
const userData = JSON.parse(localStorage.getItem('userSession'));
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

const cargarIncidentes =  async(ot , options = {}) => {
    incidentes.value = [];
  try {
    options.headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Adjuntar el token Bearer si existe
 
  if (userData?.token) {
    
    options.headers['Authorization'] = `Bearer ${userData?.token}`;
  }
    const res = await fetch(
      proxy.$serverIP +
        "api/OrdenTrabajo/getIncidentesPorOT?idOT=" + ot, options
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    const response = await res.json();
    incidentes.value = response.data;
  } catch (error) {
    console.error("Error al cargar los incidentes:", error);
  }
};

const nuevoIncidente = () => {
  const ahora = new Date();
  incidenteForm.value.fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  incidenteForm.value.hora = ahora.toTimeString().slice(0, 5);
  incidenteForm.value.incidente = "";
  modalIncidente.value = !modalIncidente.value;
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
  modalIncidente.value = false;
  try {
    const response = await axios.post(
       proxy.$serverIP + 'api/OrdenTrabajo/crearIncidenteOT',
      payload,{headers:{'Authorization':`Bearer ${userData?.token}`}}
    );
    cargarIncidentes(idOT);
  } catch (error) {
    console.error("Error al crear el incidente:", error);
  }
};

watch(
  () => props.otId,
  (newVal) => {
    if (newVal) {
      cargarIncidentes(newVal)
    }
  },
  { immediate: true }
);
</script>