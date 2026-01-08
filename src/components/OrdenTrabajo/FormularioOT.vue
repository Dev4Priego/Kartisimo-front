<template>
  <div class="container p-4 bs-body">
    <form @submit.prevent="guardarOT()">
      <div class="row my-3">
        <h2 class="text-start">Nueva Orden de Trabajo</h2>
        <hr />
      </div>
      <div class="row my-3">
        <div class="col-4">
          <h5>Cotización</h5>
        </div>
        <div class="col-8">
          <input
            class="form-control"
            list="cotizacionesList"
            id="slcCotizacion"
            placeholder="Buscar cotización: Num. Cotizacion, medida (225/55 R20), rango (97Y) o fecha (año-mes-dia)"
            v-model="busquedaCotizacion"
            @input="onInputCotizacion()"
            @change="validarSeleccionCotizacion()"
          />

          <datalist id="cotizacionesList">
            <option v-for="itm in itmCotizaciones" :key="itm.idCotizacion" :value="itm.idCotizacion" :label="`COT-${itm.idCotizacion} · ${itm.medidas} ${itm.rango}`">
              COT-{{ itm.idCotizacion }}
            </option>
          </datalist>
          <!-- <p>El valor de la variable 'productoSeleccionado' es: <strong>{{ ordenTrabajoForm.cotSeleccionada }}</strong></p> -->
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="col">
          <div class="row separador p-2">
            <h5 class="text-center">Vehículo</h5>
            <div class="col">
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.numSerie"
                  @input="onSerieInput($event.target.value)"
                  @change="onSerieSeleccionada"
                  list="vehiculos"
                  placeholder="Num. Serie *"
                  class="form-control"
                  @blur="validate('vehiculo.numSerie')"
                  :class="{ 'input-error': errores['vehiculo.numSerie'] }"
                />
                <small v-if="errores['vehiculo.numSerie']" class="error-msg">
                  {{ errores["vehiculo.numSerie"] }}
                </small>

                <datalist id="vehiculos">
                  <option
                    v-for="s in sugerencias"
                    :key="s.id_vehiculo"
                    :value="s.serie"
                  >
                    {{ s.marca }} {{ s.modelo }}
                  </option>
                </datalist>
              </div>
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.modelo"
                  class="form-control"
                  type="text"
                  placeholder="Modelo *"
                  @blur="validate('vehiculo.modelo')"
                  :class="{ 'input-error': errores['vehiculo.modelo'] }"
                />
                <small v-if="errores['vehiculo.modelo']" class="error-msg">
                  {{ errores["vehiculo.modelo"] }}
                </small>
              </div>

              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.kilometraje"
                  class="form-control"
                  type="number"
                  placeholder="Kilometraje *"
                  @blur="validate('vehiculo.kilometraje')"
                  :class="{ 'input-error': errores['vehiculo.kilometraje'] }"
                />
                <small v-if="errores['vehiculo.kilometraje']" class="error-msg">
                  {{ errores["vehiculo.kilometraje"] }}
                </small>
              </div>

              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.anio"
                  class="form-control"
                  type="text"
                  placeholder="Año *"
                  @blur="validate('vehiculo.anio')"
                  :class="{ 'input-error': errores['vehiculo.anio'] }"
                />
                <small v-if="errores['vehiculo.anio']" class="error-msg">
                  {{ errores["vehiculo.anio"] }}
                </small>
              </div>
            </div>
            <div class="col">
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.marca"
                  class="form-control"
                  type="text"
                  placeholder="Marca *"
                  @blur="validate('vehiculo.marca')"
                  :class="{ 'input-error': errores['vehiculo.marca'] }"
                />
                <small v-if="errores['vehiculo.marca']" class="error-msg">
                  {{ errores["vehiculo.marca"] }}
                </small>
              </div>
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.color"
                  class="form-control"
                  type="text"
                  placeholder="Color *"
                  @blur="validate('vehiculo.color')"
                  :class="{ 'input-error': errores['vehiculo.color'] }"
                />
                <small v-if="errores['vehiculo.color']" class="error-msg">
                  {{ errores["vehiculo.color"] }}
                </small>
              </div>
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.vehiculo.placas"
                  class="form-control"
                  type="text"
                  placeholder="Placas *"
                  @blur="validate('vehiculo.placas')"
                  :class="{ 'input-error': errores['vehiculo.placas'] }"
                />
                <small v-if="errores['vehiculo.placas']" class="error-msg">
                  {{ errores["vehiculo.placas"] }}
                </small>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row separador p-2">
            <h5 class="text-center">Cliente</h5>
            <div class="col">
              <!-- Nombre -->
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.cliente.clienteNombres"
                  class="form-control"
                  type="text"
                  placeholder="Nombre's *"
                  list="clientes"
                  @blur="validate('cliente.clienteNombre')"
                  :class="{ 'input-error': errores['cliente.clienteNombre'] }"
                />
                <small
                  v-if="errores['cliente.clienteNombre']"
                  class="error-msg"
                >
                  {{ errores["cliente.clienteNombre"] }}
                </small>
              </div>

              <!-- Apllidos -->
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.cliente.cleinteApllidos"
                  type="text"
                  class="form-control"
                  placeholder="Apellido's *"
                  @blur="validate('cliente.apPaterno')"
                  :class="{ 'input-error': errores['cliente.apPaterno'] }"
                />
                <small v-if="errores['cliente.apPaterno']" class="error-msg">
                  {{ errores["cliente.apPaterno"] }}
                </small>
              </div>

              <!-- <div class="mb-3">
                                <input 
                                    v-model="ordenTrabajoForm.cliente.apMaterno" 
                                    type="text"
                                    class="form-control"
                                    placeholder="Apellido Materno *"
                                    @blur="validate('cliente.apMaterno')"
                                    :class="{'input-error': errores['cliente.apMaterno']}"
                                >
                                <small v-if="errores['cliente.apMaterno']" class="error-msg">
                                    {{ errores['cliente.apMaterno'] }}
                                </small>
                            </div> -->
            </div>

            <div class="col">
              <!-- Teléfono -->
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.cliente.clienteTelefono"
                  class="form-control"
                  type="text"
                  placeholder="Teléfono *"
                  list="clientes"
                  @input="onClienteInput($event.target.value)"
                  @change="onClienteSeleccionadoByValue($event.target.value)"
                  @blur="validate('cliente.clienteTelefono')"
                  :class="{ 'input-error': errores['cliente.clienteTelefono'] }"
                />
                <small
                  v-if="errores['cliente.clienteTelefono']"
                  class="error-msg"
                >
                  {{ errores["cliente.clienteTelefono"] }}
                </small>
              </div>

              <!-- Correo -->
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.cliente.clienteCorreo"
                  class="form-control"
                  type="text"
                  placeholder="Correo *"
                  list="clientes"
                  @input="onClienteInput($event.target.value)"
                  @change="onClienteSeleccionadoByValue($event.target.value)"
                  @blur="validate('cliente.clienteCorreo')"
                  :class="{ 'input-error': errores['cliente.clienteCorreo'] }"
                />
                <small
                  v-if="errores['cliente.clienteCorreo']"
                  class="error-msg"
                >
                  {{ errores["cliente.clienteCorreo"] }}
                </small>
              </div>

              <!-- RFC -->
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.cliente.rfc"
                  type="text"
                  class="form-control"
                  placeholder="RFC"
                  list="clientes"
                  @input="onClienteInput($event.target.value)"
                  @change="onClienteSeleccionadoByValue($event.target.value)"
                  @blur="validate('cliente.rfc')"
                  :class="{ 'input-error': errores['cliente.rfc'] }"
                />
                <small v-if="errores['cliente.rfc']" class="error-msg">
                  {{ errores["cliente.rfc"] }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- datalist único para los 3 inputs -->
        <datalist id="clientes">
          <option
            v-for="c in sugerenciasClientes"
            :key="c.id_cliente"
            :value="c.nombre"
          >
            {{
              (c.nombres || "") +
              " " +
              (c.apPaterno || " ") +
              " " +
              (c.apMaterno || " ")
            }}
            <span v-if="c.telefono"> {{ c.telefono + " " }} </span>
            <span v-if="c.correo"> {{ c.correo }}</span>
          </option>
        </datalist>
      </div>

      <div class="row">
        <div class="col">
          <!-- Método de pago -->
          <div class="mb-3">
            <label class="form-label" for="formaPago">Forma de pago *</label>

            <select
              v-model="ordenTrabajoForm.cliente.metodoPago"
              @blur="validate('cliente.metodoPago')"
              class="form-select"
              name="formaPago"
              id="slcFormaPago"
              :class="{ 'input-error': errores['cliente.metodoPago'] }"
            >
              <option value="">-Selecciona-</option>
              <option value="01">01 - Efectivo</option>
              <option value="02">02 - Cheque nominativo</option>
              <option value="03">
                03 - Transferencia electrónica de fondos
              </option>
              <option value="04">04 - Tarjeta de crédito</option>
              <option value="15">15 - Condonación</option>
              <option value="17">17 - Compensación</option>
              <option value="26">26 - Prescripción o caducidad</option>
              <option value="28">28 - Tarjeta de débito</option>
              <option value="30">30 - Aplicación de anticipos</option>
              <option value="31">31 - Intermediario pagos</option>
              <option value="99">99 - Por definir</option>
            </select>

            <small v-if="errores['cliente.metodoPago']" class="error-msg">
              {{ errores["cliente.metodoPago"] }}
            </small>
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label">Fecha de entrega propuesta *</label>
            <div class="row"> 
              <div class="col">
                <input
                  type="date"
                  class="form-control"
                  v-model="fechaEntregaFecha"
                  @change="unirFechaHora"
                />
              </div>
              <div class="col">
                <input
                  type="time"
                  class="form-control"
                  v-model="fechaEntregaHora"
                  @change="unirFechaHora"
                />
              </div>
            </div>

            <small v-if="errores['fechaEntrega']" class="error-msg">
              {{ errores["fechaEntrega"] }}
            </small>
          </div>
        </div>
        <div class="col">
          <div class="mb-3">
            <label class="form-label">Fecha Alta *</label>
            <input
              v-model="ordenTrabajoForm.cliente.fechaAlta"
              class="form-control"
              type="datetime-local"
              @blur="validate('cliente.fechaAlta')"
              :class="{ 'input-error': errores['cliente.fechaAlta'] }"
              disabled
            />
            <small v-if="errores['cliente.fechaAlta']" class="error-msg">
              {{ errores["cliente.fechaAlta"] }}
            </small>
          </div>
        </div>
      </div>

      <hr />

      <div class="row">
        <div class="col-4">
          <h5>Técnico a cargo</h5>
        </div>
        <div class="col-8">
          <label class="form-label" for="slcTecnico"
            >Selecciona el técnico *</label
          >
          <select
            v-model="ordenTrabajoForm.idEmpleado"
            class="form-select"
            name="tecnico"
            id="slcTecnico"
            @blur="validate('idEmpleado')"
            :class="{ 'input-error': errores['idEmpleado'] }"
          >
            <option :value="0" disabled selected>
              -- Selecciona un técnico --
            </option>

            <option
              v-for="itm in itmEmpleados"
              :key="itm.idEmpleado"
              :value="itm.idEmpleado"
            >
              ({{ itm.puesto }}) {{ itm.nombres }} {{ itm.apePaterno }}
            </option>
          </select>
          <small v-if="errores['idEmpleado']" class="error-msg">
            {{ errores["idEmpleado"] }}
          </small>
        </div>
      </div>
      <hr />
      <div class="row my-3">
        <div class="col-4">
          <h5>Facturar</h5>
        </div>
        <div class="col-8">
          <label class="form-label">¿Se desea factura?</label><br />
          Si
          <input
            v-model="boolFactura"
            class="form-check-input btn-outline-dark mx-2"
            :value="true"
            type="radio"
          />
          No
          <input
            v-model="boolFactura"
            class="form-check-input mx-2"
            :value="false"
            type="radio"
          />
        </div>
      </div>
      <div class="row my-3">
        <div class="col-4"></div>
        <div v-if="boolFactura == true" class="col-8">
          <div class="row">
            <div class="col">
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.factura.razonSocial"
                  class="form-control"
                  type="text"
                  placeholder="Razón Social *"
                />
              </div>
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.factura.direccion"
                  class="form-control"
                  type="text"
                  placeholder="Dirección *"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Uso CFDI *</label>
                <select
                  v-model="ordenTrabajoForm.factura.usoCFDI"
                  class="form-select"
                  name="usoCFDI"
                  id="slcUsoCFDI"
                >
                  <option value="">Selecciona</option>
                  <option value="">Uso CFDI 1</option>
                  <option value="">Uso CFDI 2</option>
                  <option value="">Uso CFDI 3</option>
                </select>
              </div>
            </div>
            <div class="col">
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.factura.rfc"
                  class="form-control"
                  type="text"
                  placeholder="RFC *"
                />
              </div>
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.factura.eMail"
                  class="form-control"
                  type="text"
                  placeholder="E-mail *"
                />
              </div>
              <div class="mb-3">
                <input
                  v-model="ordenTrabajoForm.factura.cp"
                  class="form-control"
                  type="text"
                  placeholder="C.P. *"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="row my-3">
        <div class="col-4">
          <h5>Desechar Llantas</h5>
        </div>
        <div class="col-8">
          <label class="form-label">¿Se desea desechar llantas antiguas?</label
          ><br />
          Si
          <input
            v-model="boolDesecharLlanta"
            class="form-check-input btn-outline-dark mx-2"
            :value="true"
            type="radio"
          />
          No
          <input
            v-model="boolDesecharLlanta"
            class="form-check-input mx-2"
            :value="false"
            type="radio"
          />
        </div>
      </div>
      <hr />

      <div class="row">
        <div class="col-4">
          <h5>Insumos</h5>
        </div>
        <div class="col-8">
          <div
            class="row"
            id="tablaInsumos"
            style="max-height: 400px; overflow-y: auto"
          >

          <table class="table table-hover table-sm">
  <thead>
    <tr>
      <th>Descripción</th>
      <th>Cantidad</th>
      <th>P/U</th>
      <th>Subtotal</th>
      <th></th>
    </tr>
  </thead>

  <transition-group name="fade" tag="tbody">

    <!-- ================= LLANTAS ================= -->
    <template
      v-for="(llanta, index) in ordenTrabajoForm.insumo.llanta"
      :key="`llanta-${index}`"
    >
      <tr :class="{ 'fila-eliminada': llanta.eliminado }">
        <td>{{ llanta.descripcion }}</td>
        <td>{{ llanta.cantidad }}</td>
        <td>{{ Number(llanta.precioUnitario).toFixed(2) }}</td>
        <td>
          <div v-if="llanta.idPromocion">
            <span class="text-decoration-line-through text-muted">
              {{
                (llanta.cantidad * llanta.precioUnitario).toLocaleString(
                  "es-MX",
                  { style: "currency", currency: "MXN" }
                )
              }}
            </span>
            <span class="text-success fw-bold mx-2">
              {{
                Number(llanta.subTotal).toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })
              }}
            </span>
          </div>
          <div v-else>
            {{
              Number(llanta.subTotal).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })
            }}
          </div>
        </td>
        <td>
          <button
            class="btn btn-sm"
            :class="llanta.eliminado
              ? 'btn-outline-success'
              : 'btn-outline-danger'"
            @click="eliminarInsumo('llanta', index)"
            type="button"
          >
            <i
              :class="llanta.eliminado
                ? 'bi bi-arrow-counterclockwise'
                : 'bi bi-x-circle'"
            ></i>
          </button>
        </td>
      </tr>
    </template>

    <!-- ================= PAQUETES ================= -->
    <template
      v-for="(paquete, index) in ordenTrabajoForm.insumo.paquete"
      :key="`paquete-${index}`"
    >
      <tr :class="{ 'fila-eliminada': paquete.eliminado }">
        <td>{{ paquete.descripcion }}</td>
        <td>{{ paquete.cantidad }}</td>
        <td>{{ Number(paquete.precioUnitario).toFixed(2) }}</td>
        <td>
          <div v-if="paquete.idPromocion">
            <span class="text-decoration-line-through text-muted">
              {{
                (paquete.cantidad * paquete.precioUnitario).toLocaleString(
                  "es-MX",
                  { style: "currency", currency: "MXN" }
                )
              }}
            </span>
            <span class="text-success fw-bold mx-2">
              {{
                Number(paquete.subTotal).toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })
              }}
            </span>
          </div>
          <div v-else>
            {{
              Number(paquete.subTotal).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })
            }}
          </div>
        </td>
        <td>
          <button
            class="btn btn-sm"
            :class="paquete.eliminado
              ? 'btn-outline-success'
              : 'btn-outline-danger'"
            @click="eliminarInsumo('paquete', index)"
            type="button"
          >
            <i
              :class="paquete.eliminado
                ? 'bi bi-arrow-counterclockwise'
                : 'bi bi-x-circle'"
            ></i>
          </button>
        </td>
      </tr>

      <!-- Detalle del paquete -->
      <tr
        v-for="(detalle, dIndex) in paquete.detalle"
        :key="`detalle-${index}-${dIndex}`"
        class="table-light"
      >
        <td class="ps-4">↳ {{ detalle.descripcion }}</td>
        <td>{{ detalle.cantidad }}</td>
        <td>{{ detalle.precioUnitario }}</td>
        <td>{{ detalle.subTotal }}</td>
        <td></td>
      </tr>
    </template>

    <!-- ================= ADICIONALES ================= -->
    <template
      v-for="(ad, index) in ordenTrabajoForm.insumo.adicional"
      :key="`ad-${index}`"
    >
      <tr :class="{ 'fila-eliminada': ad.eliminado }">
        <td>{{ ad.descripcion }}</td>
        <td>{{ ad.cantidad }}</td>
        <td>{{ Number(ad.precioUnitario).toFixed(2) }}</td>
        <td>
          <div v-if="ad.idPromocion">
            <span class="text-decoration-line-through text-muted">
              {{
                (ad.cantidad * ad.precioUnitario).toLocaleString(
                  "es-MX",
                  { style: "currency", currency: "MXN" }
                )
              }}
            </span>
            <span class="text-success fw-bold mx-2">
              {{
                Number(ad.subTotal).toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })
              }}
            </span>
          </div>
          <div v-else>
            {{
              Number(ad.subTotal).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })
            }}
          </div>
        </td>
        <td>
          <button
            class="btn btn-sm"
            :class="ad.eliminado
              ? 'btn-outline-success'
              : 'btn-outline-danger'"
            @click="eliminarInsumo('adicional', index)"
            type="button"
          >
            <i
              :class="ad.eliminado
                ? 'bi bi-arrow-counterclockwise'
                : 'bi bi-trash'"
            ></i>
          </button>
        </td>
      </tr>
    </template>

  </transition-group>
</table>





          </div>
          <div class="text-center m-3">
            <button
              class="btn btn-sm btn-outline-success"
              title="Agregar"
              @click="showModal = true"
              type="button"
            >
              <i class="bi bi-plus-circle"></i> Abrir modal
            </button>

            <ModalInsumo
              v-model="showModal"
              title="Insumos"
              :insumos="ordenTrabajoForm.insumo"
            />
          </div>
        </div>
      </div>

      <div class="row my-3">
        <div class="col"></div>
        <div class="col text-end">
          <router-link :to="{ name: 'OrdenTrabajo' }">
            <button class="btn btn-dark mx-4" type="button">Volver</button>
          </router-link>
          <button class="btn btn-primary" type="submit" :disabled="!formValido">
            Guardar
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {  ref,  watch,  getCurrentInstance,  onMounted,  reactive,  nextTick,  computed,} from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import ModalInsumo from "./ModalInsumo.vue";

const router = useRouter();

const { proxy } = getCurrentInstance();
const boolFactura = ref(true);
const boolDesecharLlanta = ref(false);
const showModal = ref(false);

const props = defineProps({
  idCotizacion: {
    type: [String, Number],
    required: true,
  },
});

/* VARIABLES PARA VALIDACION DE CAMPOS */
const errores = reactive({});

// Helper para acceder a propiedades anidadas tipo "cliente.telefono"
const getValor = (path) => {
  return path.split(".").reduce((obj, key) => obj[key], ordenTrabajoForm);
};

function validate(path) {
  const value = getValor(path);

  // ========================= VALIDACIONES ==============================

  const rules = {
    // -------- CLIENTE ----------
    "cliente.clienteNombre": () =>
      !value
        ? "Nombre obligatorio."
        : !/^[a-zA-ZÁÉÍÓÚÑáéíóúñ ]+$/.test(value)
        ? "Solo letras."
        : null,

    "cliente.apPaterno": () =>
      !value
        ? "Apellido obligatorio."
        : !/^[a-zA-ZÁÉÍÓÚÑáéíóúñ]+$/.test(value)
        ? "Solo letras."
        : null,

    "cliente.apMaterno": () =>
      !value
        ? "Apellido obligatorio."
        : !/^[a-zA-ZÁÉÍÓÚÑáéíóúñ]+$/.test(value)
        ? "Solo letras."
        : null,

    "cliente.rfc": () =>
      !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(value)
        ? "Ingresa un RFC válido: 4 letras + fecha (AAMMDD) + 3 caracteres finales. Solo mayúsculas."
        : null,

    "cliente.clienteTelefono": () =>
      !/^[0-9]{10}$/.test(value) ? "Debe ser un número de 10 dígitos." : null,

    "cliente.clienteCorreo": () =>
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Correo inválido." : null,

    "cliente.metodoPago": () => (!value ? "Método de pago obligatorio." : null),

    "cliente.fechaAlta": () =>
      !value
        ? "La fecha y hora de alta son obligatorias."
        : !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
        ? "Formato inválido. Usa fecha y hora (AAAA-MM-DDTHH:MM)."
        : null,
    "fechaEntrega": () => {
        let fechaEntrega = ordenTrabajoForm.fechaEntrega;
        const fechaAlta = ordenTrabajoForm.cliente?.fechaAlta;

        // 1 Si no hay fechaEntrega, asignar la fecha y hora actual automáticamente
        if (!fechaEntrega) {
            // Forma corta usando toISOString()
            fechaEntrega = new Date().toISOString().slice(0, 16); // AAAA-MM-DDTHH:MM
            ordenTrabajoForm.fechaEntrega = fechaEntrega; // actualizar el formulario
        }

        // 2 Validar el formato
        const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (!regex.test(fechaEntrega)) {
            return "Formato inválido. Usa AAAA-MM-DDTHH:MM.";
        }

        // 3️⃣ Si no hay fechaAlta, no validar la comparación
        if (!fechaAlta) return null;

        // 4️⃣ Comparar fechas
        const entrega = new Date(fechaEntrega);
        const alta = new Date(fechaAlta);
        if (entrega < alta) {
            return "La fecha y hora de entrega no pueden ser anteriores a la fecha de alta.";
        }

        // 5️⃣ Todo bien
        return null;
    },


    // -------- VEHÍCULO ----------
    "vehiculo.marca": () => (!value ? "Marca obligatoria." : null),

    "vehiculo.modelo": () => (!value ? "Modelo obligatorio." : null),

    "vehiculo.numSerie": () =>
      value.length < 5 ? "Debe tener al menos 5 caracteres." : null,

    "vehiculo.kilometraje": () =>
      value === ""
        ? "Kilometraje obligat orio."
        : isNaN(value)
        ? "Debe ser un número."
        : value < 0
        ? "No puede ser negativo."
        : value < kilometrajeBase.value
        ? `No puede ser menor a ${kilometrajeBase.value}.`
        : null,

    "vehiculo.color": () => (!value ? "Color obligatorio." : null),

    "vehiculo.placas": () =>
      !/^[A-Z0-9]{6,7}$/.test(value) ? "Placas inválidas." : null,

    "vehiculo.anio": () => {
      const y = parseInt(value);
      const current = new Date().getFullYear();
      return !y
        ? "Año obligatorio."
        : y < 1950 || y > current
        ? `Año entre 1950 y ${current}.`
        : null;
    },

    idEmpleado: () =>
      !ordenTrabajoForm.idEmpleado || ordenTrabajoForm.idEmpleado === 0
        ? "Debes seleccionar un técnico."
        : null,
  };

  // Ejecutar regla
  const error = rules[path] ? rules[path]() : null;

  if (error) errores[path] = error;
  else delete errores[path];
}

// Mantiene el boton de guardar deshabilitado hasta que no exista ningun error de validacion
const formValido = computed(() => {
  // si hay errores -> formulario inválido
  if (Object.keys(errores).length > 0) return false;

  // Validar si todos los campos obligatorios tienen valor
  const requiredFields = [
    ordenTrabajoForm.fechaEntrega,

    // CLIENTE
    ordenTrabajoForm.cliente.clienteNombre,
    ordenTrabajoForm.cliente.apPaterno,
    ordenTrabajoForm.cliente.rfc,
    ordenTrabajoForm.cliente.clienteTelefono,
    ordenTrabajoForm.cliente.clienteCorreo,
    ordenTrabajoForm.cliente.metodoPago,

    // VEHÍCULO
    ordenTrabajoForm.vehiculo.marca,
    ordenTrabajoForm.vehiculo.modelo,
    ordenTrabajoForm.vehiculo.numSerie,
    ordenTrabajoForm.vehiculo.kilometraje,
    ordenTrabajoForm.vehiculo.color,
    ordenTrabajoForm.vehiculo.placas,
    ordenTrabajoForm.vehiculo.anio,

    // TECNICO
    ordenTrabajoForm.idEmpleado,
  ];

  // Si uno está vacío → formulario inválido
  return requiredFields.every((v) => v !== "" && v !== null && v !== undefined);
});

const getFechaHoraLocal = () => {
  const ahora = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(
    ahora.getDate()
  )}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
};

const fechaEntregaFecha = ref("");
const fechaEntregaHora = ref("");

const ordenTrabajoForm = reactive({
  cotSeleccionada: 0,
  idEmpleado: 0,
  idTipoOrdenTrabajo: 0,
  fechaEntrega: "",
  cliente: {
    id_cliente: 0,
    clienteNombre: "",
    apPaterno: "",
    apMaterno: "",
    rfc: "",
    clienteTelefono: "",
    clienteCorreo: "",
    fechaAlta: getFechaHoraLocal(),
    metodoPago: "",
  },
  vehiculo: {
    id_vehiculo: 0,
    marca: "",
    modelo: "",
    numSerie: "",
    kilometraje: "",
    color: "",
    placas: "",
    anio: "",
  },
  factura: {
    razonSocial: "",
    direccion: "",
    rfc: "",
    eMail: "",
    cp: "",
    usoCFDI: "",
  },
  insumo: {
    llanta: [],
    paquete: [],
    adicional: [],
  },
});

const irAOrdenTrabajo = () => {
  router.push({ name: "OrdenTrabajo" });
};

// eliminar si es no es necesaria, se tenia por que se solicito tener fecha y hora en inputs diferentes, fechaAlta
const unirFechaHora = () => {
  if (fechaEntregaFecha.value && fechaEntregaHora.value) {
    ordenTrabajoForm.fechaEntrega = `${fechaEntregaFecha.value}T${fechaEntregaHora.value}`;
    //console.log(ordenTrabajoForm.fechaEntrega);
  } else {
    ordenTrabajoForm.fechaEntrega = "";
  }

  validate("fechaEntrega");
};

/*************************************************/
// FUNCIONES PARA LA CARGA DE INFORMACION
/*************************************************/

/* VARIABLES PARA LA CARGA DE INFO */
const itmCotizaciones = ref([]);
const itmEmpleados = ref({});
const itmTipoOT = ref([]);
const busquedaCotizacion = ref('')

let timeout = null

const onInputCotizacion = () => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    cargarCotizacionesAprobadasOrRealizadas(busquedaCotizacion.value)
  }, 300)
}

const cargarCotizacionesAprobadasOrRealizadas = async (busqueda = '') => {
  try {
    const url = new URL(
      proxy.$serverIP + 'api/Cotizacion/getCotizacionIdAprobadaOrRealizada'
    )

    // parámetro opcional
    if (busqueda && busqueda.trim() !== '') {
      url.searchParams.append('busqueda', busqueda)
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error('Error en la respuesta')

    const data = await res.json()
    itmCotizaciones.value = data
  } catch (e) {
    console.error('Error al cargar cotizaciones:', e)
  }
}
// input de seleccionar cot existente
const validarSeleccionCotizacion = () => {
  const valor = busquedaCotizacion.value?.trim()

  const encontrada = itmCotizaciones.value.find(
    x => x.idCotizacion.toString() === valor
  )

  if (encontrada) {
    // ✔ Existe → guardar valor real
    ordenTrabajoForm.cotSeleccionada = encontrada.idCotizacion
    cargarInfoCotizacion()
  } else {
    // ❌ No existe → limpiar
    ordenTrabajoForm.cotSeleccionada = null
    busquedaCotizacion.value = ''
    alert('Selecciona una cotización válida')
  }
}



const cargarEmpleados = async () => {
  const userSession = JSON.parse(sessionStorage.getItem("userSession"));
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

const cargarTipoOT = async () => {
  try {
    const res = await fetch(
      proxy.$serverIP + "api/TipoOrdenTrabajo/getTipoOrdenTrabajo"
    );
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    itmTipoOT.value = result.data;
    // console.log(result)
    // console.log(itmTipoOT.value)
  } catch (error) {
    console.error("Error al cargar tipo OT:", error);
  }
};

onMounted(() => {
  cargarCotizacionesAprobadasOrRealizadas();
  cargarEmpleados();
  cargarTipoOT();
  normalizarInsumos();
  normalizarLlantas();

  // asignar por default  la fecha actual
  fechaEntregaFecha.value = new Date()
    .toISOString()
    .split("T")[0];
});

/********************************/
// FUNCIONES PRINCIPALES
/********************************/

/***************/
// FUNCIONES buscar y rellenar vehiculo
const sugerencias = ref([]);

let debounceTimer = null;

const onSerieInput = (valor) => {
  clearTimeout(debounceTimer);

  const value = valor.trim();

  if (!value.length) {
    sugerencias.value = [];
    return;
  }

  debounceTimer = setTimeout(() => {
    buscarSugerencias(value);
  }, 300);
};

const buscarSugerencias = async (serie) => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Vehiculo/bySerie?strSerie=${encodeURIComponent(
        serie
      )}`
    );
    if (!res.ok) throw new Error("Error en la API");

    const data = await res.json();
    sugerencias.value = data;
  } catch (err) {
    console.error("Error al obtener sugerencias:", err);
    sugerencias.value = [];
  }
};
const kilometrajeBase = ref(0);

const onSerieSeleccionada = () => {
  // buscar coincidencia exacta en sugerencias
  const seleccionado = sugerencias.value.find(
    (s) => s.serie === ordenTrabajoForm.vehiculo.numSerie
  );
  // console.log(seleccionado)
  if (seleccionado) {
    ordenTrabajoForm.vehiculo = {
      id_vehiculo: seleccionado.idVehiculo,
      marca: seleccionado.marca,
      modelo: seleccionado.modelo,
      numSerie: seleccionado.serie,
      color: seleccionado.color,
      placas: seleccionado.placas,
      kilometraje: seleccionado.kilometraje ?? "",
      anio: seleccionado.anio,
    };
    kilometrajeBase.value = seleccionado.kilometraje;
    //console.log(ordenTrabajoForm.vehiculo)
  }
};

/***************/
// FUNCIONES buscar y rellenar cliente

const sugerenciasClientes = ref([]);

// Disparar búsqueda por cualquier input
const onClienteInput = (valor) => {
  clearTimeout(debounceTimer);
  if (!valor || valor.length < 2) {
    sugerenciasClientes.value = [];
    return;
  }
  debounceTimer = setTimeout(() => {
    buscarSugerenciasCliente(valor);
  }, 300);

  //console.log("SUGERENCIAS CLIENTE:", JSON.stringify(toRaw(sugerenciasClientes.value)));
};

const buscarSugerenciasCliente = async (texto) => {
  try {
    const res = await fetch(
      `${
        proxy.$serverIP
      }api/Cliente/sugerenciaCliente?texto=${encodeURIComponent(texto)}`
    );
    if (res.ok) {
      sugerenciasClientes.value = await res.json();
    }
  } catch (err) {
    console.error("Error al buscar clientes:", err);
  }
};

const onClienteSeleccionado = (cliente) => {
  ordenTrabajoForm.cliente.id_cliente = cliente.idCliente || 0;
  ordenTrabajoForm.cliente.clienteNombre = cliente.nombres || "";
  ordenTrabajoForm.cliente.apPaterno = cliente.apPaterno || "";
  ordenTrabajoForm.cliente.apMaterno = cliente.apMaterno || "";
  ordenTrabajoForm.cliente.rfc = cliente.rfc || "";
  ordenTrabajoForm.cliente.clienteTelefono = cliente.telefono || "";
  ordenTrabajoForm.cliente.clienteCorreo = cliente.correo || "";
};

const onClienteSeleccionadoByValue = (valor) => {
  if (!valor) return;

  const normalizado = valor.trim().toLowerCase();

  // Buscar por coincidencia en nombre, teléfono o correo
  const cliente = sugerenciasClientes.value.find((c) => {
    const nombreCompleto = [c.nombres, c.apPaterno, c.apMaterno]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const telefono = c.telefono?.toLowerCase() || "";
    const correo = c.correo?.toLowerCase() || "";

    // 🔍 Coincidencias parciales o exactas
    return (
      nombreCompleto.includes(normalizado) ||
      normalizado.includes(nombreCompleto) ||
      telefono.includes(normalizado) ||
      normalizado.includes(telefono) ||
      correo.includes(normalizado) ||
      normalizado.includes(correo)
    );
  });

  // console.log("Normalizado:", normalizado);
  // console.log("Valor:", valor);
  // console.log("Cliente encontrado:", cliente);

  if (cliente) {
    // console.log('clienteSeleccionado');
    onClienteSeleccionado(cliente);
  }
};

/***************************/
// FUNCIONES INSUMOS

const eliminarInsumo = (tipo, index) => {
  const item = ordenTrabajoForm.insumo[tipo][index];
  if (!item) return;

  // Inicializa si no existe
  if (item.eliminado === undefined) {
    item.eliminado = false;
  }

  // Toggle: eliminar / restaurar
  item.eliminado = !item.eliminado;
};

const normalizarInsumos = () => {
  Object.values(ordenTrabajoForm.insumo).forEach((lista) => {
    lista.forEach((item) => {
      if (item.eliminado === undefined) {
        item.eliminado = false;
      }
    });
  });

};


const normalizarLlantas = () => {
  ordenTrabajoForm.insumo.llanta =
    ordenTrabajoForm.insumo.llanta
      .filter(l => l) // elimina undefined
      .map(l => ({
        ...l,
        eliminado: l.eliminado ?? false
      }));
};


const validarYMostrarPreview = async () => {
  const errores = [];

  // Cliente
  if (!ordenTrabajoForm.cliente.clienteNombre)
    errores.push("El nombre del cliente es obligatorio.");
  if (
    !ordenTrabajoForm.cliente.clienteTelefono ||
    !/^\d{10}$/.test(ordenTrabajoForm.cliente.clienteTelefono)
  )
    errores.push("El teléfono debe tener 10 dígitos.");
  if (!ordenTrabajoForm.cliente.metodoPago)
    errores.push("El método de pago es obligatorio.");
  if (!ordenTrabajoForm.cliente.fechaAlta)
    errores.push("La fecha de alta es obligatoria.");
  if (!ordenTrabajoForm.fechaEntrega)
    errores.push("La fecha de entrega es obligatoria.");

  // Vehículo
  if (!ordenTrabajoForm.vehiculo.numSerie)
    errores.push("El número de serie es obligatorio.");
  if (!ordenTrabajoForm.vehiculo.modelo)
    errores.push("El modelo del vehículo es obligatorio.");
  if (
    !ordenTrabajoForm.vehiculo.kilometraje ||
    isNaN(ordenTrabajoForm.vehiculo.kilometraje)
  )
    errores.push("El kilometraje es obligatorio y debe ser numérico.");
  if (!ordenTrabajoForm.vehiculo.color)
    errores.push("El color del vehículo es obligatorio.");

  // Factura (si aplica)
  if (boolFactura.value) {
    // if (!ordenTrabajoForm.factura.razonSocial) errores.push('La razón social es obligatoria.')
    // if (!ordenTrabajoForm.factura.direccion) errores.push('La dirección es obligatoria.')
    // if (!ordenTrabajoForm.factura.rfc || !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(ordenTrabajoForm.factura.rfc)) errores.push('El RFC no tiene un formato válido.')
    // if (!ordenTrabajoForm.factura.eMail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(ordenTrabajoForm.factura.eMail)) errores.push('El correo de la factura no es válido.')
    // if (!ordenTrabajoForm.factura.cp || !/^\d{5}$/.test(ordenTrabajoForm.factura.cp)) errores.push('El código postal debe tener 5 dígitos.')
    // if (!ordenTrabajoForm.factura.usoCFDI) errores.push('El uso de CFDI es obligatorio.')
  }

  if (errores.length > 0) {
    Swal.fire({
      icon: "error",
      title: "Errores de validación",
      html: `<ul style="text-align:left">${errores
        .map((e) => `<li>${e}</li>`)
        .join("")}</ul>`,
    });
    return false;
  }

  // 🔹 Renderizar tabla de insumos
  const insumosHTML = `
        <table style="width:100%; border-collapse: collapse; font-size: 14px;" border="1">
            <thead>
                <tr style="background:#f0f0f0; text-align:center;">
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>P/U</th>
                <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${ordenTrabajoForm.insumo.llanta
                  .map(
                    (i) => `
                <tr>
                    <td>${i.descripcion}</td>
                    <td style="text-align:center">${i.cantidad}</td>
                    <td style="text-align:right">$${i.precioUnitario.toFixed(
                      2
                    )}</td>
                    <td style="text-align:right">$${i.subTotal}</td>
                </tr>
                `
                  )
                  .join("")}
                ${ordenTrabajoForm.insumo.paquete
                  .map(
                    (p) => `
                <tr style="font-weight:bold; background:#fafafa;">
                    <td>${p.descripcion}</td>
                    <td style="text-align:center">${p.cantidad}</td>
                    <td style="text-align:right">$${p.precioUnitario.toFixed(
                      2
                    )}</td>
                    <td style="text-align:right">$${p.subTotal}</td>
                </tr>
                ${p.detalle
                  .map(
                    (d) => `
                    <tr style="color:#555;">
                    <td style="padding-left:20px;">↳ ${d.descripcion}</td>
                    <td style="text-align:center">${d.cantidad}</td>
                    <td style="text-align:right">$${d.precioUnitario.toFixed(
                      2
                    )}</td>
                    <td style="text-align:right">$${d.subTotal}</td>
                    </tr>
                `
                  )
                  .join("")}
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;

  // 🔹 Confirmación con SweetAlert
  const result = await Swal.fire({
    title: "Confirmar datos",
    html: `
            <div style="font-family:Arial, sans-serif; font-size:14px; color:#333; max-height:400px; overflow-y:auto;">

                <div class="m-2">
                    <!-- Cliente -->
                    <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Cliente</h3>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
                        <tr><td style="padding:4px 8px; font-weight:bold;">Nombre:</td><td>${
                          ordenTrabajoForm.cliente.clienteNombre
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Teléfono:</td><td>${
                          ordenTrabajoForm.cliente.clienteTelefono
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Método de pago:</td><td>${
                          ordenTrabajoForm.cliente.metodoPago
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Fecha alta:</td><td>${
                          ordenTrabajoForm.cliente.fechaAlta
                        }</td></tr>
                    </table><br>

                    <!-- Vehículo -->
                    <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Vehículo</h3>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
                        <tr><td style="padding:4px 8px; font-weight:bold;">Num. Serie:</td><td>${
                          ordenTrabajoForm.vehiculo.numSerie
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Modelo:</td><td>${
                          ordenTrabajoForm.vehiculo.modelo
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Kilometraje:</td><td>${
                          ordenTrabajoForm.vehiculo.kilometraje
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Color:</td><td>${
                          ordenTrabajoForm.vehiculo.color
                        }</td></tr>
                        <tr><td style="padding:4px 8px; font-weight:bold;">Placas:</td><td>${
                          ordenTrabajoForm.vehiculo.placas
                        }</td></tr>
                    </table>

                    <!-- Factura -->
                    ${
                      boolFactura.value
                        ? `
                    <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Factura</h3>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
                    <tr><td style="padding:4px 8px; font-weight:bold;">Razón social:</td><td>${ordenTrabajoForm.factura.razonSocial}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">RFC:</td><td>${ordenTrabajoForm.factura.rfc}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Email:</td><td>${ordenTrabajoForm.factura.eMail}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">CP:</td><td>${ordenTrabajoForm.factura.cp}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Uso CFDI:</td><td>${ordenTrabajoForm.factura.usoCFDI}</td></tr>
                    </table>
                    `
                        : ""
                    }

                    <!-- Insumos -->
                    <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Insumos</h3>
                    ${insumosHTML}
                </div>

            </div>
        `,
    showCancelButton: true,
    confirmButtonText: "Confirmar y enviar",
    cancelButtonText: "Cancelar",
    width: "700px",
  });

  if (result.isConfirmed) {
    Swal.fire(
      "Enviado",
      "La información fue enviada correctamente.",
      "success"
    );
    return true;
  }

  return false;
};

const guardarOT = async () => {
  //console.log(ordenTrabajoForm.vehiculo.numSerie)
  let factura = {};

  if (boolFactura) {
    factura = {
      razonSocial: ordenTrabajoForm.factura.razonSocial,
      direccion: ordenTrabajoForm.factura.direccion,
      rfc: ordenTrabajoForm.factura.rfc,
      eMail: ordenTrabajoForm.factura.eMail,
      cp: ordenTrabajoForm.factura.cp,
      usoCFDI: ordenTrabajoForm.factura.usoCFDI,
    };
  }

  const objSeend = {
    idUsuario: 1,
    idCotizacion: ordenTrabajoForm.cotSeleccionada,
    idEmpleado: ordenTrabajoForm.idEmpleado,
    idTipoOrdenTrabajo: ordenTrabajoForm.idTipoOrdenTrabajo,
    metodoPago: ordenTrabajoForm.cliente.metodoPago,
    fechaAlta: ordenTrabajoForm.cliente.fechaAlta,
    fechaEntrega: ordenTrabajoForm.fechaEntrega,
    requiereFactura: boolFactura.value,
    desecharLlanta: boolDesecharLlanta.value,
    descripcion: "",
    cliente: {
      idCliente: ordenTrabajoForm.cliente.id_cliente,
      nombres: ordenTrabajoForm.cliente.clienteNombre,
      apPaterno: ordenTrabajoForm.cliente.apPaterno,
      apMaterno: ordenTrabajoForm.cliente.apMaterno,
      rfc: ordenTrabajoForm.cliente.rfc,
      telefono: ordenTrabajoForm.cliente.clienteTelefono,
      correo: ordenTrabajoForm.cliente.clienteCorreo,
    },
    vehiculo: {
      idVehiculo: ordenTrabajoForm.vehiculo.id_vehiculo
        ? ordenTrabajoForm.vehiculo.id_vehiculo
        : 0,
      modelo: ordenTrabajoForm.vehiculo.modelo,
      marca: ordenTrabajoForm.vehiculo.marca,
      serie: ordenTrabajoForm.vehiculo.numSerie,
      kilometraje: ordenTrabajoForm.vehiculo.kilometraje,
      color: ordenTrabajoForm.vehiculo.color,
      placas: ordenTrabajoForm.vehiculo.placas,
      anio: ordenTrabajoForm.vehiculo.anio,
    },
    factura: factura,
    insumos: ordenTrabajoForm.insumo,
  };

  if (await validarYMostrarPreview()) {
    console.log("Valido");
    console.log("GUARDAR OT: " + JSON.stringify(objSeend));
    fetch(`${proxy.$serverIP}api/OrdenTrabajo/crearOT`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objSeend),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("OT guardada:", data);
          limpiarOrdenTrabajoForm(); // Limpia formulario
          irAOrdenTrabajo();
        } else {
          console.log("No guardada");
        }
      });
  }
};

const obtenerPromosPorInventario = async (idInventarioInicial) => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPorInventario?idInventario=${idInventarioInicial}`
    );

    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const data = await res.json();
    // Puedes filtrar por vigencia/activo si quieres
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error("Error al obtener promociones por inventario:", error);
    return [];
  }
};

const obtenerPromosPorPaquete = async (idPaquete) => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPoridPaquete?idPaquete=${idPaquete}`
    );

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error("Error al obtener promociones por paquete:", error);
    return [];
  }
};

const obtenerPromosGeneralesParaServicio = async () => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionesGenerales`
    );
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();

    // Solo promociones activas
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error(
      "Error al obtener promociones generales para servicios:",
      error
    );
    return [];
  }
};

const cargarInfoCotizacion = async () => {
  const res = await fetch(
    proxy.$serverIP +
      "api/OrdenTrabajo/getCotizacionById?id=" +
      ordenTrabajoForm.cotSeleccionada
  );

  if (!res.ok) throw new Error("Error en la respuesta");

  const data = await res.json();

  //console.log(JSON.stringify(data.llantas))
  ordenTrabajoForm.cotSeleccionada = data.idCotizacion || 0;

  ordenTrabajoForm.cliente.clienteNombre = data.clienteNombre || "";
  ordenTrabajoForm.cliente.clienteTelefono = data.telefono || "";
  ordenTrabajoForm.cliente.clienteCorreo = data.correo || "";

  ordenTrabajoForm.insumo = {
    llanta: await Promise.all(
      data.llantas.map(async (llanta) => {
        const promosDisponibles = await obtenerPromosPorInventario(
          llanta.idInventarioInicial
        );

        return {
          idLlanta: llanta.idLlanta,
          idAlmacen: llanta.idAlmacen,
          idPromocion: llanta.idPromocion ?? 0,
          idConceptoTrabajo: 1,
          idInventarioInicial: llanta.idInventarioInicial, // para buscar promo

          descripcion: llanta.modeloMedidas,
          medida: llanta.medida, // campo estetico
          modelo: llanta.modelo, // campo estetico
          marca: llanta.marca, // campo estetico
          ubicacion: llanta.ubicacion, // campo estetico

          cantidad: llanta.cantidad,
          precioUnitario: llanta.precioUnitario,
          subTotal: (llanta.cantidad * precioFinalItem(llanta)).toFixed(2), // campo estetico

          promosDisponibles: promosDisponibles || [],

          // si ya tiene promo existente rellenar valores
          nombrePromocion: llanta.nombrePromocion,
          valorPromocion: llanta.valorPromocion,
          tipoPromocion: llanta.tipoPromocion,
        };
      })
    ),
    paquete: await Promise.all(
      data.paquetes.map(async (paquete) => {
        const promosDisponibles =
          (await obtenerPromosPorPaquete(paquete.idPaquete)) || [];

        return {
          idPaquete: paquete.idPaquete,
          idPromocion: paquete.idPromocion ?? 0,
          idConceptoTrabajo: 0,

          descripcion: paquete.nombre,
          cantidad: 1,
          precioUnitario: paquete.precioUnitario,

          subTotal: (
            1 *
            precioFinalItem({
              precioUnitario: paquete.precioUnitario,
              idPromocion: paquete.idPromocion,
              valorPromocion: paquete.valorPromocion,
              tipoPromocion: paquete.tipoPromocion,
            })
          ).toFixed(2),

          detalle: paquete.detallePaquete.map((detalle) => ({
            idDesglosePaquete: detalle.idDesglosePaquete,
            idConceptoTrabajo: detalle.idConceptoTrabajo,
            descripcion: detalle.nombre,
            cantidad: detalle.cantidad,
            precioUnitario: 0,
            subTotal: 0,
          })),

          promosDisponibles,

          // info histórica (si viene de backend)
          nombrePromocion: paquete.nombrePromocion,
          valorPromocion: paquete.valorPromocion,
          tipoPromocion: paquete.tipoPromocion,
        };
      })
    ),

    adicional: await Promise.all(
      data.servicios.map(async (s) => {
        const promosDisponibles =
          (await obtenerPromosGeneralesParaServicio()) || [];

        return {
          idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
          idPromocion: s.idPromocion ?? 0,
          idConceptoTrabajo: 0,

          descripcion: s.descripcion,
          observacion: s.observacion,
          comentario: s.comentario,

          cantidad: s.cantidad,
          precioUnitario: s.precioUnitario,

          subTotal: (
            s.cantidad *
            precioFinalItem({
              precioUnitario: s.precioUnitario,
              idPromocion: s.idPromocion,
              valorPromocion: s.valorPromocion,
              tipoPromocion: s.tipoPromocion,
            })
          ).toFixed(2),

          promosDisponibles,

          // info histórica
          nombrePromocion: s.nombrePromocion,
          valorPromocion: s.valorPromocion,
          tipoPromocion: s.tipoPromocion,
        };
      })
    ),
  };
  //console.log(JSON.stringify(ordenTrabajoForm.insumo))
};

const precioFinalItem = (item, promoGlobal) => {
  const base = item.precioUnitario ?? 0;

  // Aplica promoción individual si existe
  if (item.idPromocion && item.valorPromocion != null) {
    return item.tipoPromocion
      ? base * (1 - item.valorPromocion / 100) // porcentaje
      : Math.max(0, base - item.valorPromocion); // monto fijo
  }

  // Aplica promo global si no está excluido
  if (
    promoGlobal &&
    promoGlobal.valor != null &&
    !item.excluirPromocionGeneral
  ) {
    return promoGlobal.tipo
      ? base * (1 - promoGlobal.valor / 100) // porcentaje
      : Math.max(0, base - promoGlobal.valor); // monto fijo
  }

  // Sin promoción
  return base;
};

const limpiarOrdenTrabajoForm = () => {
  ordenTrabajoForm.cotSeleccionada = 0;
  ordenTrabajoForm.idEmpleado = 0;

  ordenTrabajoForm.cliente.id_cliente = 0;
  ordenTrabajoForm.cliente.apMaterno = "";
  ordenTrabajoForm.cliente.apPaterno = "";
  ordenTrabajoForm.cliente.clienteCorreo = "";
  ordenTrabajoForm.cliente.rfc = "";
  ordenTrabajoForm.cliente.clienteNombre = "";
  ordenTrabajoForm.cliente.clienteTelefono = "";
  ordenTrabajoForm.cliente.fechaAlta = new Date().toISOString().split("T")[0];
  ordenTrabajoForm.cliente.metodoPago = "";

  ordenTrabajoForm.vehiculo.id_vehiculo = 0;
  ordenTrabajoForm.vehiculo.marca = "";
  ordenTrabajoForm.vehiculo.modelo = "";
  ordenTrabajoForm.vehiculo.numSerie = "";
  ordenTrabajoForm.vehiculo.kilometraje = "";
  ordenTrabajoForm.vehiculo.color = "";
  ordenTrabajoForm.vehiculo.placas = "";

  ordenTrabajoForm.factura.razonSocial = "";
  ordenTrabajoForm.factura.direccion = "";
  ordenTrabajoForm.factura.rfc = "";
  ordenTrabajoForm.factura.eMail = "";
  ordenTrabajoForm.factura.cp = "";
  ordenTrabajoForm.factura.usoCFDI = "";

  ordenTrabajoForm.insumo = {
    llanta: [],
    paquete: [],
    adicional: [],
  };
};

// observa idCotizacion prop, en cuanto se envie un valor nuevo actualiza y carga la informacion de la cotizacion
watch(
  () => props.idCotizacion,
  async (newValue) => {
    if (!newValue) return;

    ordenTrabajoForm.cotSeleccionada = newValue;
    console.log("watch: " + ordenTrabajoForm.cotSeleccionada);
    await cargarInfoCotizacion();
  },
  { immediate: true }
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.input-error {
  border: 1px solid red;
}

.error-msg {
  color: red;
  font-size: 12px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.separador {
  min-height: 290px; /* 🔹 mínimo, puede crecer */
  border: 1px solid #dee2e6; /* gris claro tipo hr */
  border-radius: 10px;
  margin: 10px 0;
}

.fila-eliminada {
  opacity: 0.5;
  text-decoration: line-through;
}
</style>
