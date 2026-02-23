<template>
  <div class="container-fluid h-100 d-flex flex-column m-0">
    <div class="border-bottom py-2 ">
      <h3 class="mb-0">
        Editar OT # {{ otEditar.idOrdenTrabajo }}
      </h3>
    </div>

    <div class="flex-grow-1 overflow-auto p-3">
      <div class="row gp-2">
        <div class="col-12 mb-3">
          <div class="card shadow-sm p-2">
            <div><span style="font-weight: bold; color: grey;" >Fecha de creación:</span>&nbsp;{{ formatearFecha(otEditar.fechaAlta) }}</div>
            <div v-if="otEditar.idCotizacion"><span style="font-weight: bold; color: grey;" >Cotización de origen:</span> C{{ otEditar.prefijoSucursal }}-{{ otEditar.consecutivoSucursal }}</div>
        </div>
        </div>
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <i class="bi bi-car-front-fill me-2"></i> Datos del Vehículo
            </div>
            <div v-if="otEditar.idOrdenTrabajo" class="card-body">
              <table style="width: 100%;">
                <tbody>
                  <tr><td style="font-weight: bold; color: grey;">Núm. serie: </td><td colspan="3">{{ otEditar.vehiculo.serie }}</td></tr>
                <tr><td style="font-weight: bold; color: grey;">Marca: </td><td colspan="3">{{ otEditar.vehiculo.marca }}</td></tr>
                <tr><td style="font-weight: bold; color: grey;">Modelo: </td><td colspan="3">{{ otEditar.vehiculo.modelo }}</td></tr>
                <tr><td style="font-weight: bold; color: grey;">Color: </td><td>{{ otEditar.vehiculo.color }}</td><td style="font-weight: bold; color: grey;">Kilometraje: </td><td>{{ otEditar.vehiculo.kilometraje }}</td></tr>
                <tr><td style="font-weight: bold; color: grey;">Año: </td><td>{{ otEditar.vehiculo.anio }}</td><td style="font-weight: bold; color: grey;">Placas: </td><td>{{ otEditar.vehiculo.placas }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <i class="bi bi-person-fill me-2"></i> Datos del Cliente
            </div>
            <div v-if="otEditar.idOrdenTrabajo" class="card-body">
              <table style="width: 100%;">
                <tbody>
                  <tr><td style="font-weight: bold; color: grey;">Nombre: </td><td>{{ otEditar.cliente.nombreCompleto }}</td></tr>
                  <tr><td style="font-weight: bold; color: grey;">Teléfono: </td><td>{{ otEditar.cliente.telefono }}</td></tr>
                  <tr><td style="font-weight: bold; color: grey;">Correo: </td><td>{{ otEditar.cliente.correo }}</td></tr>
                  <tr><td style="font-weight: bold; color: grey;">RFC: </td><td>{{ otEditar.cliente.rfc ? otEditar.cliente.rfc : '(N/A)' }}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <h5>Estatus de la OT</h5>
      <div class="row my-3">
        <div class="col">
          <div class="d-flex justify-content-between align-items-center">
            <div
              v-for="(e, i) in estados"
              :key="e"
              class="text-center flex-fill position-relative"
            >
              <div
                class="rounded-circle mx-auto mb-1"
                :class="clasePaso(e)"
                style="width:32px; height:32px; line-height:32px;"
              >
                <i class="bi bi-check" v-if="esCompletado(e)"></i>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <small>{{ e }}</small>

              <!-- Línea -->
              <div
                v-if="i < estados.length - 1"
                class="position-absolute top-50 start-100 translate-middle-y"
                style="width:100%; height:2px;"
                :class="lineaClase(e)"
              ></div>
            </div>
          </div>
        </div>
        <div class="col-auto">
          
          <button class="btn btn-success shadow-sm" @click="avanzarEstado"
          :disabled="otEditar.estatus != 1  ">
            Avanzar estado <i class="bi bi-arrow-right-short ms-2"></i>
          </button>
        </div>
        <div class="col-12 d-flex justify-content-end mt-3">
          
          <button class="btn btn-danger btn-sm shadow-sm" @click="cambiarEstatusOT(0)"
          :disabled="otEditar.estatus == 0">
            <i class="bi bi-x-circle-fill me-3"></i>Cancelar OT
          </button>
          
          <!-- <button class="btn btn-warning btn-sm shadow-sm ms-2" @click="cambiarEstatusOT(2)"
            :disabled="otEditar.estatus == 0">
            <i class="bi bi-stop-circle-fill me-3"></i>Suspender OT 
          </button> -->
          <button
            class="btn btn-sm shadow-sm ms-2"
            :class="otEditar.estatus == 2 ? 'btn-success' : 'btn-warning'"
            @click="cambiarEstatusOT(otEditar.estatus == 2 ? 1 : 2)"
            :disabled="otEditar.estatus == 0"
          >
            <i class="bi me-3"
              :class="otEditar.estatus == 2 ? 'bi-play-circle-fill' : 'bi-stop-circle-fill'">
            </i>

            {{ otEditar.estatus == 2 ? 'Retomar OT' : 'Suspender OT' }}
          </button>

        </div>
      </div>
      <h5>Datos generales</h5>
      <div class="row my-3 gy-3">
        <div class="col-6 col-lg-3">
          <label class="form-label">Fecha/hora comprometida</label>
          <input type="text" readonly class="form-control-plaintext" :value=formatearFecha(otEditar.fechaEntrega)>
        </div>
        <div class="col-6 col-lg-3">
        <label class="form-label">Método de pago</label>
        <select
              v-model="otEditar.metodoPago"
              class="form-select"
              name="formaPago"
              id="slcFormaPago"
            >
              <option value="Efectivo">01 - Efectivo</option>
              <option value="Cheque nominativo">02 - Cheque nominativo</option>
              <option value="Transferencia electrónica de fondos">03 - Transferencia electrónica de fondos</option>
              <option value="Tarjeta de crédito">04 - Tarjeta de crédito</option>
              <option value="Condonación">15 - Condonación</option>
              <option value="Compensación">17 - Compensación</option>
              <option value="Prescripción o caducidad">26 - Prescripción o caducidad</option>
              <option value="Tarjeta de débito">28 - Tarjeta de débito</option>
              <option value="Aplicación de anticipos">30 - Aplicación de anticipos</option>
              <option value="Intermediario pagos">31 - Intermediario pagos</option>
              <option value="Por definir">99 - Por definir</option>
            </select>
      </div>

      <div v-if="otEditar.empleado" class="col-12 col-lg-6">
        <label class="form-label" for="slcTecnico"
      >Técnico asignado</label
    >
    <select
      v-model="otEditar.empleado.idEmpleado"
      class="form-select"
      name="tecnico"
      id="slcTecnico"
    >

      <option
        v-for="itm in itmEmpleados"
        :key="itm.idEmpleado"
        :value="itm.idEmpleado"
      >
        ({{ itm.puesto }}) {{ itm.nombres }} {{ itm.apePaterno }}
      </option>
    </select>
      </div>
      <div class="col-6">
        <label class="form-label">¿Desechar llantas?</label><br/>
          Si
          <input
            v-model="otEditar.desecharLlanta"
            class="form-check-input btn-outline-dark mx-2"
            :value="true"
            type="radio"
          />
          No
          <input
            v-model="otEditar.desecharLlanta"
            class="form-check-input mx-2"
            :value="false"
            type="radio"
          />
      </div>
      
      </div>
      <h5>Tareas</h5>
      <div v-if="otEditar.llantas">
        <LlantasSection
        :llantas = "otEditar.llantas" />
      </div>
      <div v-if="otEditar.paquetes">
        <PaquetesSection
        :paquetes = "otEditar.paquetes" />
      </div>
      <div v-if="otEditar.adicionales">
        <adicionalesSection
        :adicionales = "otEditar.adicionales" />
      </div>
      <!-- <h5>Otros</h5>
      <div class="my-3 gp-2">
        <button class="btn btn-primary shadow mx-2">
          <i class="bi bi-tools me-3"></i>Recibir refacciones
        </button>
        <button class="btn btn-warning shadow mx-2" @click="abrirModalIncidente()">
          <i class="bi bi-exclamation-triangle-fill me-3"></i>Registrar incidente
        </button>
      </div> -->
    </div>

    <div class="border-top py-2 px-3 bg-light text-end">
      <button class="btn btn-secondary mx-3" @click="volver()">
        <i class="bi bi-arrow-left-circle-fill me-2"></i>Volver
      </button>
      <button class="btn btn-primary mx-3" @click="guardarEdicion">
        Guardar cambios
      </button>
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
              <div class="col-12 col-lg-6">
                <input
                  v-model="incidenteForm.fecha"
                  type="date"
                  class="form-control"
                />
              </div>
              <div class="col-12 col-lg-6">
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
            <button class="btn btn-sm btn-success mx-2" type="button">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from "bootstrap";
import OrdenTrabajoProgress from '@/components/OrdenTrabajo/EditarOrdenTrabajo/OrdenTrabajoProgress.vue'
import LlantasSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Llantas/LlantasSection.vue'
import PaquetesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Paquete/PaquetesSection.vue'
import AdicionalesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/AdicionalesSection.vue'
import { parse } from 'vue/compiler-sfc';
import axios from 'axios';
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const { proxy } = getCurrentInstance()
const route = useRoute();
const router = useRouter();
const otEditar = ref({});
const itmEmpleados = ref({});
const incidenteForm = ref({});
let modalIncidente;
/**
 * 🔒 No renderizar nada hasta que TODO esté listo
 */ 

const data45= JSON.parse(localStorage.getItem('userSession')); // o el nombre de la key que usaste
const idUsuarioSession = data45?.usuario?.idUsuario;

const orden = ref({
  llantas: [],
  paquetes: [],
  adicionales: []
})

const normalizar = (arr) =>
  Array.isArray(arr)
    ? arr.filter(i => i && typeof i === 'object')
    : []

const cargarOrden = async () => {
  try {
    const id = route.params.id
    console.log(' Cargando OT:', id)

    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${id}`
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    console.log(' RESPUESTA BACKEND:', json)

    /**
     * 🔒 Normalización total
     */
    otEditar.value = {
      ...json,
      paquetes: normalizar(json.paquetes),
      llantas: normalizar(json.llantas),
      adicionales: normalizar(json.adicionales)
    }

  } catch (err) {
    console.error(' Error cargando OT:', err)
    orden.value = null
  }
}

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

const refrescarOrden = () => {
  cargarOrden()
}

const abrirModalIncidente = () => {
  const ahora = new Date();
  incidenteForm.value.fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  incidenteForm.value.hora = ahora.toTimeString().slice(0, 5);
  incidenteForm.value.incidente = "";
  modalIncidente = new Modal(document.getElementById("modalIncidente"));
  modalIncidente.show();
}

const volver = () => {
  router.push('/content/orden-trabajo');
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

const avanzarEstado = async () => {

  const idx = estados.indexOf(otEditar.value.estado)

  // si no existe o ya es el último → no hace nada
  if (idx === -1 || idx >= estados.length - 1) return

  const nuevoEstado = estados[idx + 1]

  try {

    // actualizar en frontend
    otEditar.value.estado = nuevoEstado

    // guardar en backend
    await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/avanzarOT/${otEditar.value.idOrdenTrabajo}`,
      {
        estado: nuevoEstado,
      }
    )

    mostrarToast("success", "Orden de trabajo avanzada correctamente")

  } catch (error) {
    console.error("No se pudo actualizar el estado", error)
  }
}

const cambiarEstatusOT = async (estatus) => {

  try {

    // guardar en backend
    await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/cambiarEstatusOT/${otEditar.value.idOrdenTrabajo}`,
      {
        estatus: estatus,
      }
    )

    switch (estatus) {
      case 0:
        mostrarToast("success", "Orden de trabajo cancelada correctamente")
        break
      case 1:
        mostrarToast("success", "Orden de trabajo retomada correctamente")
        break
      case 2:
        mostrarToast("success", "Orden de trabajo suspendida correctamente")
        break
    } 

    cargarOrden()

  } catch (error) {
    console.error("No se pudo actualizar el estado", error)
  }
}

// funcion para guardar los datos editados de la OT
const guardarEdicion = async () => {

  const idOT = otEditar.value.idOrdenTrabajo;

  console.log('usuario edita' + idUsuarioSession)

  const payload = {
    idUsuario: idUsuarioSession,
    idEmpleado: otEditar.value.empleado.idEmpleado,
    metodoPago: otEditar.value.metodoPago,
    desecharLlanta: otEditar.value.desecharLlanta,
    requiereFactura: otEditar.value.requiereFactura,
    factura: otEditar.value.factura
  };

  try {
    const response = await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/editarOT/${idOT}`,
      payload
    );

    mostrarToast("success", "Orden de trabajo editada correctamente");
    console.log("OT actualizada:", response.data);
    cargarOrden()
    //volver()

  } catch (error) {
    console.error("Error al editar OT:", error);
  }
};

const mostrarToast = (type, message) => {
  const color =
    type === "success"
      ? "linear-gradient(to right, #96c93d)"
      : type === "warning"
      ? "linear-gradient(to right, #f5af19, #f12711)"
      : "linear-gradient(to right, #6dd5ed, #2193b0)";

  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: color,
      borderRadius: "6px",
      color: "white",
      fontSize: "14px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    },
  }).showToast();
};

onMounted(() => {
  cargarOrden();
  cargarEmpleados();
});
</script>
