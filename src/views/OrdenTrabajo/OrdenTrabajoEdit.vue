<template>
  <div class="container-fluid h-100 d-flex flex-column m-0">
    <div class="border-bottom py-2 ">
      <h3 class="mb-0">
        Editar OT # O{{ otEditar.prefijoSucursal }}-{{ otEditar.consecutivoSucursal }}
      </h3>
    </div>

    <div class="flex-grow-1 overflow-auto p-3">
      <div class="row gp-2">
        <div class="col-12 mb-3">
          <div class="card shadow-sm p-2">
            <div><span style="font-weight: bold; color: grey;" >Fecha de creación:</span>&nbsp;{{ formatearFecha(otEditar.fechaAlta) }}</div>
            <div v-if="otEditar.idCotizacion"><span style="font-weight: bold; color: grey;" >Cotización de origen:</span> C{{ otEditar.prefijoCotizacion }}-{{ otEditar.consecutivoCotizacion }}</div>
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
        <label class="form-label">¿Requiere factura?</label><br/>
          Si
          <input
            v-model="otEditar.requiereFactura"
            class="form-check-input btn-outline-dark mx-2"
            :value="true"
            type="radio"
          />
          No
          <input
            v-model="otEditar.requiereFactura"
            class="form-check-input mx-2"
            :value="false"
            type="radio"
          />
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
      <div v-if="otEditar.requiereFactura" class="col-12">
        <div class="card shadow-sm">
          <div class="card-header">
              <i class="bi bi-receipt me-2"></i> Datos fiscales para factura
            </div>
          <div class="card-body">
            <div class="row">
              <div class="col-8 col-lg-4 mb-3">
                <label for="razonsocial" class="form-label">Razón social *</label>
                <input id="razonsocial"
                  v-model="otEditar.factura.razonSocial"
                  class="form-control"
                  type="text"
                  placeholder="(Razón Social a facturar)"
                  @blur="validate('factura.razonSocial')"
                  :class="{ 'input-error': errores['factura.razonSocial'] }"
                />
                <small
                  v-if="errores['factura.razonSocial']"
                  class="error-msg"
                >
                  {{ errores['factura.razonSocial'] }}
                </small>
              </div>
              <div class="col-4 col-lg-2 mb-3">
                <label for="rfcfactura" class="form-label">RFC *</label>
                <input id="rfcfactura"
                  v-model="otEditar.factura.rfc"
                  class="form-control"
                  type="text"
                  placeholder="(RFC a facturar)"
                  @blur="validate('factura.rfc')"
                  :class="{ 'input-error': errores['factura.rfc'] }"
                />
                <small
                  v-if="errores['factura.rfc']"
                  class="error-msg"
                >
                  {{ errores["factura.rfc"] }}
                </small>
              </div>
              <div class="col-6 col-lg-3 mb-3">
                <label class="form-label">Uso CFDI *</label>
                <select
                  v-model="otEditar.factura.usoCFDI"
                  class="form-select"
                  
                  @blur="validate('factura.usoCFDI')"
                  :class="{ 'input-error': errores['factura.usoCFDI'] }"
                >
                  <option disabled value="">-Selecciona-</option>
                  <option v-for="u in usosCFDI" :key="u.idUsoCFDI" :value="u.idUsoCFDI">
                    {{ u.codigo + ' - ' + u.descripcion }}
                  </option>
                </select>
                <small
                  v-if="errores['factura.usoCFDI']"
                  class="error-msg"
                >
                  {{ errores['factura.usoCFDI'] }}
                </small>
              </div>
              <div class="col-6 col-lg-3 mb-3">
                <label class="form-label">Régimen fiscal *</label>
                <select
                  v-model="otEditar.factura.regimenFiscal"
                  class="form-select"
                  
                  @blur="validate('factura.regimenFiscal')"
                  :class="{ 'input-error': errores['factura.regimenFiscal'] }"
                >
                  <option disabled value="">-Selecciona-</option>
                  <option v-for="r in regimenFiscal" :key="r.idRegimenFiscal" :value="r.idRegimenFiscal">
                    {{ r.codigo + ' - ' + r.descripcion }}
                  </option>
                </select>
                <small
                  v-if="errores['factura.regimenFiscal']"
                  class="error-msg"
                >
                  {{ errores['factura.regimenFiscal'] }}
                </small>
              </div>
              <div class="col-8 col-lg-4 mb-3">
                <label for="direccionfiscal" class="form-label">Dirección</label>
                <input id="direccionfiscal"
                  v-model="otEditar.factura.direccion"
                  class="form-control"
                  type="text"
                  placeholder="(Domicilio)"
                />
              </div>
              <div class="col-4 col-lg-2 mb-3">
                <label for="cpfactura" class="form-label">Código postal *</label>
                <input id="cpfactura"
                  v-model="otEditar.factura.cp"
                  class="form-control"
                  type="text"
                  placeholder="(C.P.)"
                  @blur="validate('factura.cp')"
                  :class="{ 'input-error': errores['factura.cp'] }"
                />
                <small
                  v-if="errores['factura.cp']"
                  class="error-msg"
                >
                  {{ errores['factura.cp'] }}
                </small>
              </div>
              <div class="col-6 col-lg-3 mb-3">
                <label for="correofactura" class="form-label">Correo *</label>
                <input id="correofactura"
                  v-model="otEditar.factura.eMail"
                  class="form-control"
                  type="text"
                  placeholder="(Use un correo válido)"
                  @blur="validate('factura.eMail')"
                  :class="{ 'input-error': errores['factura.eMail'] }"
                />
                <small
                  v-if="errores['factura.eMail']"
                  class="error-msg"
                >
                  {{ errores['factura.eMail'] }}
                </small>
              </div>
            </div>
          </div>
            
        </div>
      </div>
      </div>
<h5>Tareas</h5>

<!-- ================= LLANTAS ================= -->
<div v-if="otEditar.llantas?.length">
  <h6 class="text-muted">Llantas</h6>

  <div
    v-for="(llanta, i) in otEditar.llantas"
    :key="'llanta-'+i"
    class="card shadow-sm p-3 mb-3"
  >
    <div class="row">
      <div class="col-6">
        <strong>{{ llanta.descripcion }}</strong>
      </div>
      <div class="col-2">Cant: {{ llanta.cantidad }}</div>
      <div class="col-2">$ {{ llanta.precio }}</div>
      <div class="col-2 fw-bold">
        $ {{ calcularTotalLinea(llanta) }}
      </div>
    </div>

    <!-- DESCUENTO -->
    <div class="row mt-3 align-items-end">
      <div class="col-3">
        <label class="form-label">Tipo</label>
        <select class="form-select" v-model="llanta.descuento.tipo">
          <option :value="null">Sin descuento</option>
          <option value="PORCENTAJE">Procentaje</option>
          <option value="MONTO">Monto</option>
        </select>

      </div>

      <div class="col-3">
        <label class="form-label">Valor</label>
        <input
          type="number"
          min="0"
          class="form-control"
          v-model.number="llanta.descuento.valor"
          :disabled="!llanta.descuento.tipo"
        />
      </div>

      <div class="col-4">
        <label class="form-label">Origen</label>
        <select
          class="form-select"
          v-model="llanta.descuento.origen"
          :disabled="!llanta.descuento.tipo"
        >
          <option :value="null">Seleccionar</option>
          <option value="TIENDA">Tienda</option>
          <option value="PROMOCION">Promoción</option>
          <option value="CUPON">Cupón</option>
        </select>
      </div>
      <h5>Otros</h5>
      <div class="my-3 gp-2">
        <div class="row">
          <div class="col-12 col-lg-6">
            <Refacciones
            :otId = "otEditar.idOrdenTrabajo"
            :usuario = "idUsuarioSession"
            :key = "otEditar.idOrdenTrabajo" />
          </div>
          <div class="col-12 col-lg-6">
            <Incidentes
            :otId = "otEditar.idOrdenTrabajo"
            :usuario = "idUsuarioSession" />
          </div>
        </div>
      </div>

      <div class="col-2">
        <button
          class="btn btn-outline-danger w-100"
          @click="resetDescuento(llanta)"
        >
          Quitar
        </button>
      </div>
    </div>

    <div class="border-top py-2 px-3 bg-light text-end">
      <button class="btn btn-secondary mx-3" @click="volver()">
        <i class="bi bi-arrow-left-circle-fill me-2"></i>Volver
      </button>
      <button class="btn btn-primary mx-3" :disabled="!formValido" @click="guardarEdicion">
        Guardar cambios
      </button>
  </div>
</div>

<!-- ================= PAQUETES ================= -->
<div v-if="otEditar.paquetes?.length">
  <h6 class="text-muted">Paquetes</h6>

  <div
    v-for="(paq, i) in otEditar.paquetes"
    :key="'paq-'+i"
    class="card shadow-sm p-3 mb-3"
  >
    <div class="row">
      <div class="col-8">
        <strong>{{ paq.descripcion }}</strong>
      </div>
      <div class="col-4 fw-bold">
        $ {{ calcularTotalLinea(paq) }}
      </div>
    </div>

    <div class="row mt-3 align-items-end">
      <div class="col-3">
        <select class="form-select" v-model="paq.descuento.tipo">
          <option :value="null">Sin descuento</option>
          <option value="PORCENTAJE">porcentaje</option>
          <option value="MONTO">Monto</option>
        </select>
      </div>

      <div class="col-3">
        <input
          type="number"
          class="form-control"
          v-model.number="paq.descuento.valor"
          :disabled="!paq.descuento.tipo"
        />
      </div>

      <div class="col-4">
        <select
          class="form-select"
          v-model="paq.descuento.origen"
          :disabled="!paq.descuento.tipo"
        >
          <option value="TIENDA">Tienda</option>
          <option value="PROMOCION">Promoción</option>
          <option value="CUPON">Cupón</option>
        </select>
      </div>

      <div class="col-2">
        <button class="btn btn-outline-danger w-100" @click="resetDescuento(paq)">
          Quitar
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ================= ADICIONALES ================= -->
<div v-if="otEditar.adicionales?.length">
  <h6 class="text-muted">Adicionales</h6>

  <div
    v-for="(add, i) in otEditar.adicionales"
    :key="'add-'+i"
    class="card shadow-sm p-3 mb-3"
  >
    <div class="row">
      <div class="col-8">{{ add.descripcion }}</div>
      <div class="col-4 fw-bold">$ {{ calcularTotalLinea(add) }}</div>
    </div>

    <div class="row mt-3 align-items-end">
      <div class="col-3">

        <select class="form-select" v-model="add.descuento.tipo">
          <option :value="null">Sin descuento</option>
          <option value="PORCENTAJE">porcentaje </option>
          <option value="MONTO">Monto </option>
        </select>

        
      </div>

      <div class="col-3">
        <input
          type="number"
          class="form-control"
          v-model.number="add.descuento.valor"
          :disabled="!add.descuento.tipo"
        />
      </div>

      <div class="col-4">
        <select
          class="form-select"
          v-model="add.descuento.origen"
          :disabled="!add.descuento.tipo"
        >
          <option value="TIENDA">Tienda</option>
          <option value="PROMOCION">Promoción</option>
          <option value="CUPON">Cupón</option>
        </select>
      </div>

      <div class="col-2">
        <button class="btn btn-outline-danger w-100" @click="resetDescuento(add)">
          Quitar
        </button>
      </div>
    </div>
  </div>
</div>

    </div>


    
  </div>

</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed, reactive, watch } from 'vue'


import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import OrdenTrabajoProgress from '@/components/OrdenTrabajo/EditarOrdenTrabajo/OrdenTrabajoProgress.vue'
import LlantasSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Llantas/LlantasSection.vue'
import PaquetesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Paquete/PaquetesSection.vue'
import AdicionalesSection from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/AdicionalesSection.vue'
import Incidentes from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Incidentes.vue';
import Refacciones from '@/components/OrdenTrabajo/EditarOrdenTrabajo/Refacciones.vue';
import { parse } from 'vue/compiler-sfc';
import axios from 'axios';
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { Modal } from "bootstrap"
import axios from 'axios'
import Toastify from "toastify-js"
import "toastify-js/src/toastify.css"

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

/* ==============================
   ESTADO BASE (IMPORTANTE)
============================== */
const otEditar = ref({
  llantas: [],
  paquetes: [],
  adicionales: []
})

const itmEmpleados = ref([])
const incidenteForm = ref({})
let modalIncidente

/* ==============================
   USUARIO SESIÓN
============================== */
const data45 = JSON.parse(localStorage.getItem('userSession'))
const idUsuarioSession = data45?.usuario?.idUsuario

/* ==============================
   NORMALIZADORES
============================== */
const normalizar = (arr) =>
  Array.isArray(arr) ? arr.filter(i => i && typeof i === 'object') : []

const normalizarLinea = (linea) => ({
  ...linea,
  cantidad: linea.cantidad ?? 1,
  precio: linea.precio ?? 0,
  descuento: linea.descuento ?? {
    tipo: null,
    valor: 0,
    origen: null
  }
})

/* ==============================
   CARGAR ORDEN (AQUÍ VA json)
============================== */
const cargarOrden = async () => {
  try {
    const id = route.params.id

    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${id}`
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()

    otEditar.value = {
      ...json,
      llantas: normalizar(json.llantas).map(normalizarLinea),
      paquetes: normalizar(json.paquetes).map(normalizarLinea),
      adicionales: normalizar(json.adicionales).map(normalizarLinea)
    }

  } catch (err) {
    console.error('Error cargando OT:', err)
  }
}

/* ==============================
   EMPLEADOS
============================== */
const cargarEmpleados = async () => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Empleado/getEmpleado?idSucursal=${data45.usuario.idSucursal}`
    )
    if (!res.ok) throw new Error("Error empleados")

    itmEmpleados.value = await res.json()
  } catch (error) {
    console.error("Error al cargar empleado:", error)
  }
};

const cargarUsosCFDI = async () => {
  try {
    const res = await fetch(
      proxy.$serverIP + "api/OrdenTrabajo/getUsosCFDI"
    );
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    usosCFDI.value = result.data;
  } catch (error) {
    console.error("Error al cargar usos CFDI:", error);
  }
}

const cargarRegimenFiscal = async () => {
  try {
    const res = await fetch(
      proxy.$serverIP + "api/OrdenTrabajo/getRegimenFiscal"
    );
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    regimenFiscal.value = result.data;
  } catch (error) {
    console.error("Error al cargar el régimen fiscal:", error);
  }
}

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

const avanzarEstado = async () => {

  const idx = estados.indexOf(otEditar.value.estado)

  // si no existe o ya es el último → no hace nada
  if (idx === -1 || idx >= estados.length - 1) return

  const nuevoEstado = estados[idx + 1]

  try {

    // actualizar en frontend
    otEditar.value.estado = nuevoEstado

    // guardar en backend
}

/* ==============================
   DESCUENTOS
============================== */
const resetDescuento = (linea) => {
  linea.descuento = { tipo: null, valor: 0, origen: null }
}

const calcularTotalLinea = (linea) => {
  const base = (linea.precio || 0) * (linea.cantidad || 1)

  if (!linea.descuento?.tipo) return base

  if (linea.descuento.tipo === 'PORCENTAJE') {
    return base - (base * linea.descuento.valor / 100)
  }

  if (linea.descuento.tipo === 'MONTO') {
    return Math.max(0, base - linea.descuento.valor)
  }

  return base
}

/* ==============================
   GUARDAR EDICIÓN
============================== */


const guardarEdicion = async () => {
  try {
    await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/editarOT/${otEditar.value.idOrdenTrabajo}`,
      {
        idUsuario: idUsuarioSession,
        idEmpleado: otEditar.value.empleado?.idEmpleado,
        metodoPago: otEditar.value.metodoPago,
        desecharLlanta: otEditar.value.desecharLlanta,
        requiereFactura: otEditar.value.requiereFactura,
        factura: otEditar.value.factura
      }
    )

    mostrarToast("success", "Orden de trabajo editada correctamente")
    cargarOrden()

  } catch (error) {
    console.error("Error al editar OT:", error)
  }
}

/* ==============================
   TOAST
============================== */
const mostrarToast = (type, message) => {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background:
        type === "success"
          ? "linear-gradient(to right, #96c93d)"
          : "linear-gradient(to right, #f12711)"
    }
  }).showToast()
}

/* ==============================
   INIT
============================== */
onMounted(() => {
  cargarOrden();
  cargarEmpleados();
  cargarUsosCFDI();
  cargarRegimenFiscal();
});
  cargarOrden()
  cargarEmpleados()
})



const formatearFecha = (fecha) => {
  if (!fecha) return ''

  const d = new Date(fecha)

  const fechaFormateada = d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const horaFormateada = d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  return `${fechaFormateada}, ${horaFormateada}`
}

</script>