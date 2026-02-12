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
          <button class="btn btn-success shadow-sm">
            Avanzar estado <i class="bi bi-arrow-right-short ms-2"></i>
          </button>
        </div>
        <div class="col-12 d-flex justify-content-end mt-3">
          <button class="btn btn-danger btn-sm shadow-sm">
            <i class="bi bi-x-circle-fill me-3"></i>Cancelar OT
          </button>
          <button class="btn btn-warning btn-sm shadow-sm ms-2">
            <i class="bi bi-stop-circle-fill me-3"></i>Suspender OT 
          </button>
        </div>
      </div>
      <h5>Datos generales</h5>
      <div class="row my-3">
        <div class="col-6 col-lg-3">
          <label class="form-label">Fecha/hora comprometida</label>
          <input type="text" readonly class="form-control-plaintext" :value=formatearFecha(otEditar.fechaEntrega)>
        </div>
        <div class="col-6 col-lg-3">
        <label class="form-label">Método de pago</label>
        <select class="form-select" v-model="otEditar.metodoPago">
          <option value="G01">G01 - Adquisición de mercancías</option>
          <option value="G02">G02 - Devoluciones, descuentos o bonificaciones</option>
          <option value="G03">G03 - Gastos en general</option>
          <option value="I01">I01 - Construcciones</option>
          <option value="I02">I02 - Mobiliario y equipo de oficina por inversiones</option>
          <option value="I03">I03 - Equipo de transporte</option>
          <option value="I04">I04 - Equipo de cómputo y accesorios</option>
          <option value="I05">I05 - Dados, troqueles, moldes, matrices y herramental</option>
          <option value="I06">I06 - Comunicaciones telefónicas</option>
          <option value="I07">I07 - Comunicaciones satelitales</option>
          <option value="I08">I08 - Otra maquinaria y equipo</option>
          <option value="S01">S01 - Sin efectos fiscales</option>
        </select>
      </div>

      <div class="col-12 col-lg-6">
        <label class="form-label" for="slcTecnico"
      >Técnico asignado</label
    >
    <select
      v-model="otEditar.idEmpleado"
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

      <div class="col-12 col-lg-6">
        <label class="form-label">Estado</label>
        <select class="form-select" v-model="otEditar.estado">
          <option>Creado</option>
          <option>En curso</option>
          <option>Finalizado</option>
          <option>Entregado</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">Factura</label>
        <select
          class="form-select"
          v-model="otEditar.requiereFactura"
        >
          <option :value="true">Sí</option>
          <option :value="false">No</option>
        </select>
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
      <h5>Otros</h5>
      <div class="my-3 gp-2">
        <button class="btn btn-primary shadow-sm mx-2">
          <i class="bi bi-tools me-3"></i>Recibir refacciones
        </button>
        <button class="btn btn-warning shadow-sm mx-2" @click="abrirModalIncidente()">
          <i class="bi bi-exclamation-triangle-fill me-3"></i>Registrar incidente
        </button>
      </div>
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
                <div class="modal-header">
                  <h4 class="modal-title">
                    Agregar incidencia
                  </h4>
                  <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  Fecha / hora de la incidencia
                  <div class="row">
                    <div class="col-12 col-lg-6">
                      <input
                        type="date"
                        class="form-control"
                        
                      />
                    </div>
                    <div class="col-12 col-lg-6">
                      <input
                        type="time"
                        class="form-control"
                        
                      />
                    </div>
                  </div>
                </div>
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

const { proxy } = getCurrentInstance()
const route = useRoute();
const router = useRouter();
const otEditar = ref({});
const itmEmpleados = ref({});
let modalIncidente;
/**
 * 🔒 Estado inicial seguro
 */
const orden = ref({
  llantas: [],
  paquetes: [],
  adicionales: []
})

const cargarOrden = async () => {
  try {
    const id = route.params.id
    console.log('📌 Cargando OT:', id)

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
      llantas: Array.isArray(json.llantas) ? json.llantas : [],
      paquetes: Array.isArray(json.paquetes) ? json.paquetes : [],
      adicionales: Array.isArray(json.adicionales) ? json.adicionales : []
    }

  } catch (err) {
    console.error('❌ Error cargando OT:', err)

    // fallback seguro
    orden.value = {
      llantas: [],
      paquetes: [],
      adicionales: []
    }
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
  console.log('🔄 Refrescando orden...')
  cargarOrden()
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

onMounted(() => {
  cargarOrden();
  cargarEmpleados();
});
</script>
