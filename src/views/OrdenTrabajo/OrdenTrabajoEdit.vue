<template>
  <div class="container-fluid h-100 d-flex flex-column m-0">
    <div class="border-bottom py-2">
      <h3 class="mb-0">
        Editar OT # O{{ otEditar.prefijoSucursal }}-{{
          otEditar.consecutivoSucursal
        }}
      </h3>
    </div>

    <div class="flex-grow-1 overflow-auto p-3">
      <div class="row gp-2">
        <div class="col-12 mb-3">
          <div class="card shadow-sm p-2">
            <div>
              <span style="font-weight: bold; color: grey"
                >Fecha de creación:</span
              >&nbsp;{{ formatearFecha(otEditar.fechaAlta) }}
            </div>
            <div v-if="otEditar.idCotizacion && otEditar.idCotizacion != 0">
              <span style="font-weight: bold; color: grey"
                >Cotización de origen:</span
              >
              C{{ otEditar.prefijoCotizacion }}-{{
                otEditar.consecutivoCotizacion
              }}
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-car-front-fill me-2"></i> Datos del Vehículo</span>
              <button
                class="btn btn-sm"
                :class="editandoClienteVehiculo ? 'btn-outline-secondary' : 'btn-outline-primary'"
                @click="toggleEdicionClienteVehiculo"
              >
                <i
                  class="bi me-1"
                  :class="editandoClienteVehiculo ? 'bi-lock-fill' : 'bi-pencil-square'"
                ></i>
                {{ editandoClienteVehiculo ? "Desactivar edición" : "Editar" }}
              </button>
            </div>
            <div v-if="false" class="card-body">
              <table style="width: 100%">
                <tbody>
                  <tr>
                    <td style="font-weight: bold; color: grey">Núm. serie:</td>
                    <td colspan="3">{{ otEditar.vehiculo.serie }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Marca:</td>
                    <td colspan="3">{{ otEditar.vehiculo.marca }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Modelo:</td>
                    <td colspan="3">{{ otEditar.vehiculo.modelo }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Color:</td>
                    <td>{{ otEditar.vehiculo.color }}</td>
                    <td style="font-weight: bold; color: grey">Kilometraje:</td>
                    <td>{{ otEditar.vehiculo.kilometraje }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Año:</td>
                    <td>{{ otEditar.vehiculo.anio }}</td>
                    <td style="font-weight: bold; color: grey">Placas:</td>
                    <td>{{ otEditar.vehiculo.placas }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="otEditar.idOrdenTrabajo" class="card-body">
              <div class="row">
                <div class="col-12 mb-2">
                  <label class="form-label">Núm. serie</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.serie"
                    list="vehiculosEdit"
                    class="form-control"
                    maxlength="20"
                    :disabled="!editandoClienteVehiculo"
                    @input="buscarVehiculosEdicion(datosClienteVehiculo.vehiculo.serie)"
                    @change="seleccionarVehiculoEdicion"
                  />
                  <datalist id="vehiculosEdit">
                    <option
                      v-for="v in sugerenciasVehiculosEdicion"
                      :key="v.idVehiculo"
                      :value="v.serie"
                    >
                      {{ v.marca }} {{ v.modelo }} {{ v.placas }}
                    </option>
                  </datalist>
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Marca</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.marca"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Modelo</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.modelo"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Color</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.color"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Kilometraje</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.kilometraje"
                    type="number"
                    min="0"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Año</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.anio"
                    type="number"
                    min="1900"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Placas</label>
                  <input
                    v-model="datosClienteVehiculo.vehiculo.placas"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-person-fill me-2"></i> Datos del Cliente</span>
            </div>
            <div v-if="false" class="card-body">
              <table style="width: 100%">
                <tbody>
                  <tr>
                    <td style="font-weight: bold; color: grey">Nombre:</td>
                    <td>{{ otEditar.cliente.nombreCompleto }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Teléfono:</td>
                    <td>{{ formatearTelefono(otEditar.cliente.telefono) }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Correo:</td>
                    <td>{{ otEditar.cliente.correo }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">RFC:</td>
                    <td>
                      {{
                        otEditar.cliente.rfc ? otEditar.cliente.rfc : "(N/A)"
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="otEditar.idOrdenTrabajo" class="card-body">
              <datalist id="clientesEdit">
                <option
                  v-for="c in sugerenciasClientesEdicion"
                  :key="c.idCliente"
                  :value="[c.nombres, c.apPaterno, c.apMaterno].filter(Boolean).join(' ')"
                >
                  {{ c.telefono }} {{ c.correo }}
                </option>
              </datalist>
              <div class="row">
                <div class="col-6 mb-2">
                  <label class="form-label">Nombre(s)</label>
                  <input
                    v-model="datosClienteVehiculo.cliente.nombres"
                    list="clientesEdit"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                    @input="buscarClientesEdicion(datosClienteVehiculo.cliente.nombres)"
                    @change="seleccionarClienteEdicionPorValor(datosClienteVehiculo.cliente.nombres)"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Apellidos</label>
                  <input
                    v-model="datosClienteVehiculo.cliente.apellidos"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Teléfono</label>
                  <input
                    v-model="datosClienteVehiculo.cliente.telefono"
                    list="clientesEdit"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                    @input="buscarClientesEdicion(datosClienteVehiculo.cliente.telefono)"
                    @change="seleccionarClienteEdicionPorValor(datosClienteVehiculo.cliente.telefono)"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">Correo</label>
                  <input
                    v-model="datosClienteVehiculo.cliente.correo"
                    list="clientesEdit"
                    type="email"
                    class="form-control"
                    :disabled="!editandoClienteVehiculo"
                    @input="buscarClientesEdicion(datosClienteVehiculo.cliente.correo)"
                    @change="seleccionarClienteEdicionPorValor(datosClienteVehiculo.cliente.correo)"
                  />
                </div>
                <div class="col-6 mb-2">
                  <label class="form-label">RFC</label>
                  <input
                    v-model="datosClienteVehiculo.cliente.rfc"
                    class="form-control"
                    maxlength="13"
                    :disabled="!editandoClienteVehiculo"
                    @input="datosClienteVehiculo.cliente.rfc = (datosClienteVehiculo.cliente.rfc || '').toUpperCase()"
                  />
                </div>
              </div>
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
                style="width: 32px; height: 32px; line-height: 32px"
              >
                <i class="bi bi-check" v-if="esCompletado(e)"></i>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <small>{{ e }}</small>

              <!-- Línea -->
              <div
                v-if="i < estados.length - 1"
                class="position-absolute top-50 start-100 translate-middle-y"
                style="width: 100%; height: 2px"
                :class="lineaClase(e)"
              ></div>
            </div>
          </div>
        </div>
        <div class="col-auto">
          <button
            class="btn btn-success shadow-sm me-2"
            @click="retrocederEstado"
            :disabled="estados.indexOf(otEditar.estado) == 3"
          >
            <i class="bi bi-arrow-left-short me-1"></i>
            Retroceder estado
          </button>
          <button
            class="btn btn-success shadow-sm"
            @click="avanzarEstado"
            :disabled="otEditar.estatus != 1"
          >
            Avanzar estado <i class="bi bi-arrow-right-short ms-2"></i>
          </button>
        </div>
        <div class="col-12 d-flex justify-content-end mt-3">
          <button
            class="btn btn-danger btn-sm shadow-sm"
            @click="
              preguntaCancelar(
                'O' +
                  otEditar.prefijoSucursal +
                  '-' +
                  otEditar.consecutivoSucursal,
              )
            "
            :disabled="otEditar.estatus == 0"
          >
            <i class="bi bi-x-circle-fill me-3"></i>Cancelar OT
          </button>

          <button
            class="btn btn-sm shadow-sm ms-2"
            :class="otEditar.estatus == 2 ? 'btn-success' : 'btn-warning'"
            @click="cambiarEstatusOT(otEditar.estatus == 2 ? 1 : 2)"
            :disabled="otEditar.estatus == 0"
          >
            <i
              class="bi me-3"
              :class="
                otEditar.estatus == 2
                  ? 'bi-play-circle-fill'
                  : 'bi-stop-circle-fill'
              "
            >
            </i>

            {{ otEditar.estatus == 2 ? "Retomar OT" : "Suspender OT" }}
          </button>

          <button
            class="btn btn-sm shadow-sm ms-2 btn-info"
            @click="derivarOtPadre()"
          >
            <i class="bi bi-node-plus-fill me-3"></i>
            Derivar OT
          </button>
          <button
            class="btn btn-sm shadow-sm ms-2 btn-dark"
            @click="costeoModal = true"
          >
            <i class="bi bi-calculator-fill me-3"></i>
            Costeo
          </button>
          <button
            class="btn btn-sm shadow-sm ms-2 btn-primary"
            @click="PrintOtFunction()"
          >
            <i class="bi bi-printer-fill me-3"></i>
            Imprimir
          </button>
        </div>
      </div>
      <h5>Datos generales</h5>
      <div class="row my-3 gy-3">
        <div class="col-6 col-lg-3">
          <label class="form-label">Fecha/hora comprometida</label>
          <input
            type="text"
            readonly
            class="form-control-plaintext"
            :value="formatearFecha(otEditar.fechaEntrega)"
          />
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
            <option value="Transferencia electrónica de fondos">
              03 - Transferencia electrónica de fondos
            </option>
            <option value="Tarjeta de crédito">04 - Tarjeta de crédito</option>
            <option value="Condonación">15 - Condonación</option>
            <option value="Compensación">17 - Compensación</option>
            <option value="Prescripción o caducidad">
              26 - Prescripción o caducidad
            </option>
            <option value="Tarjeta de débito">28 - Tarjeta de débito</option>
            <option value="Aplicación de anticipos">
              30 - Aplicación de anticipos
            </option>
            <option value="Intermediario pagos">
              31 - Intermediario pagos
            </option>
            <option value="Por definir">99 - Por definir</option>
          </select>
        </div>

        <div v-if="otEditar.empleado" class="col-12 col-lg-6">
          <label class="form-label" for="slcTecnico">Técnico asignado</label>
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
          <label class="form-label">¿Requiere factura?</label><br />
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
          <label class="form-label">¿Desechar llanta?</label><br />
          <input
            class="form-check-input me-2"
            type="checkbox"
            id="aplicaDesechar"
            v-model="aplicaDesecharLlanta"
          />
          <label class="form-check-label me-4" for="aplicaDesechar">
            N/A
          </label>
          Si
          <input
            v-model="otEditar.desecharLlanta"
            class="form-check-input btn-outline-dark mx-2"
            :value="true"
            type="radio"
            :disabled="aplicaDesecharLlanta"
          />
          No
          <input
            v-model="otEditar.desecharLlanta"
            class="form-check-input mx-2"
            :value="false"
            type="radio"
            :disabled="aplicaDesecharLlanta"
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
                  <label for="razonsocial" class="form-label"
                    >Razón social *</label
                  >
                  <input
                    id="razonsocial"
                    v-model="otEditar.factura.razonSocial"
                    class="form-control"
                    type="text"
                    placeholder="(Razón Social a facturar)"
                    @input="validate('factura.razonSocial')"
                    @blur="validate('factura.razonSocial')"
                    :class="{ 'input-error': errores['factura.razonSocial'] }"
                  />
                  <small
                    v-if="errores['factura.razonSocial']"
                    class="error-msg"
                  >
                    {{ errores["factura.razonSocial"] }}
                  </small>
                </div>
                <div class="col-4 col-lg-2 mb-3">
                  <label for="rfcfactura" class="form-label">RFC *</label>
                  <input
                    id="rfcfactura"
                    v-model="otEditar.factura.rfc"
                    class="form-control"
                    type="text"
                    placeholder="(RFC a facturar)"
                    @input="validate('factura.rfc')"
                    @blur="validate('factura.rfc')"
                    :class="{ 'input-error': errores['factura.rfc'] }"
                  />
                  <small v-if="errores['factura.rfc']" class="error-msg">
                    {{ errores["factura.rfc"] }}
                  </small>
                </div>
                <div class="col-6 col-lg-3 mb-3">
                  <label class="form-label">Uso CFDI *</label>
                  <select
                    v-model="otEditar.factura.usoCFDI"
                    class="form-select"
                    @input="validate('factura.usoCFDI')"
                    @blur="validate('factura.usoCFDI')"
                    :class="{ 'input-error': errores['factura.usoCFDI'] }"
                  >
                    <option disabled value="">-Selecciona-</option>
                    <option
                      v-for="u in usosCFDI"
                      :key="u.idUsoCFDI"
                      :value="u.idUsoCFDI"
                    >
                      {{ u.codigo + " - " + u.descripcion }}
                    </option>
                  </select>
                  <small v-if="errores['factura.usoCFDI']" class="error-msg">
                    {{ errores["factura.usoCFDI"] }}
                  </small>
                </div>
                <div class="col-6 col-lg-3 mb-3">
                  <label class="form-label">Régimen fiscal *</label>
                  <select
                    v-model="otEditar.factura.regimenFiscal"
                    class="form-select"
                    @input="validate('factura.regimenFiscal')"
                    @blur="validate('factura.regimenFiscal')"
                    :class="{ 'input-error': errores['factura.regimenFiscal'] }"
                  >
                    <option disabled value="">-Selecciona-</option>
                    <option
                      v-for="r in regimenFiscal"
                      :key="r.idRegimenFiscal"
                      :value="r.idRegimenFiscal"
                    >
                      {{ r.codigo + " - " + r.descripcion }}
                    </option>
                  </select>
                  <small
                    v-if="errores['factura.regimenFiscal']"
                    class="error-msg"
                  >
                    {{ errores["factura.regimenFiscal"] }}
                  </small>
                </div>
                <div class="col-8 col-lg-4 mb-3">
                  <label for="direccionfiscal" class="form-label"
                    >Dirección</label
                  >
                  <input
                    id="direccionfiscal"
                    v-model="otEditar.factura.direccion"
                    class="form-control"
                    type="text"
                    placeholder="(Domicilio)"
                  />
                </div>
                <div class="col-4 col-lg-2 mb-3">
                  <label for="cpfactura" class="form-label"
                    >Código postal *</label
                  >
                  <input
                    id="cpfactura"
                    v-model="otEditar.factura.cp"
                    class="form-control"
                    type="text"
                    placeholder="(C.P.)"
                    @input="validate('factura.cp')"
                    @blur="validate('factura.cp')"
                    :class="{ 'input-error': errores['factura.cp'] }"
                  />
                  <small v-if="errores['factura.cp']" class="error-msg">
                    {{ errores["factura.cp"] }}
                  </small>
                </div>
                <div class="col-6 col-lg-3 mb-3">
                  <label for="correofactura" class="form-label">Correo *</label>
                  <input
                    id="correofactura"
                    v-model="otEditar.factura.email"
                    class="form-control"
                    type="text"
                    placeholder="(Use un correo válido)"
                    @input="validate('factura.email')"
                    @blur="validate('factura.email')"
                    :class="{ 'input-error': errores['factura.email'] }"
                  />
                  <small v-if="errores['factura.email']" class="error-msg">
                    {{ errores["factura.email"] }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h5>Tareas</h5>
      <div class="text-center m-3">
        <button
          class="btn btn-sm btn-primary"
          title="Agregar"
          @click="showModal = true"
          type="button"
        >
          <i class="bi bi-plus-circle-fill"></i> &nbsp;Editar insumos
        </button>

        <ModalInsumo
          v-model="showModal"
          :insumos="insumosFiltrados"
          @update:insumos="actualizarInsumos"
        />
      </div>
      <div v-if="otEditar.insumo?.llantas">
        <LlantasSection
          :llantas="otEditar.insumo.llantas"
          @agregarLlanta="agregarLlanta"
          @eliminarLlanta="eliminarLlanta"
          @guardarLLantasOT="guardarLLantasOT"
        />
      </div>

      <div v-if="otEditar.insumo.paquetes">
        <PaquetesSection :paquetes="otEditar.insumo.paquetes" />
      </div>

      <div v-if="otEditar.insumo?.adicionales">
        <OtrosSection :adicionales="otEditar.insumo.adicionales" />
      </div>
      <!-- Contenedor del total -->
      <div
        class="d-flex justify-content-end align-items-center my-3 bg-light p-2"
      >
        <h5 class="mb-0 me-2">Total:</h5>
        <span class="fw-bold text-success fs-5">
          {{
            otEditar.totales.subtotal.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })
          }}
        </span>
      </div>

      <h5>Otros</h5>
      <div class="my-3 gp-2">
        <div class="row">
          <div class="col-12 col-lg-7">
            <Refacciones
              :otId="otEditar.idOrdenTrabajo"
              :usuario="idUsuarioSession"
              :insumos="otEditar.insumo"
              :key="otEditar.idOrdenTrabajo"
              @refaccion-guardada="
                autoGuardarEdicion('Orden guardada despues de actualizar refacciones')
              "
            />
          </div>
          <div class="col-12 col-lg-5">
            <Incidentes
              :otId="otEditar.idOrdenTrabajo"
              :usuario="idUsuarioSession"
            />
          </div>
        </div>
        <h5>Observacion</h5>
        <div class="my-3">
          <div class="row">
            <div class="col-12 col-lg-12">
              <textarea
                id="ObservacionCliente"
                class="form-control mb-2"
                v-model="otEditar.observacion"
                rows="2"
                maxlength="auto"
                placeholder="Observaciones de la orden de trabajo"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="border-top py-2 px-3 bg-light d-flex justify-content-between align-items-center"
    >
      <!-- Total y cantidad en una sola línea -->

      <!-- Botones alineados a la derecha -->
      <div>
        <button class="btn btn-secondary mx-2" @click="volver()">
          <i class="bi bi-arrow-left-circle-fill me-2"></i>Volver
        </button>

        <button
          class="btn btn-primary mx-2"
          :disabled="!formValido"
          @click="guardarEdicion"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  </div>

  <ImprimirOT v-model="modelValue" :OT="prepararDatosImpresion()" />
  <CosteoOrdenTrabajoModal
    v-model="costeoModal"
    :idOrdenTrabajo="otEditar.idOrdenTrabajo || 0"
  />
</template>

<script setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  computed,
  reactive,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import Swal from "sweetalert2";
import OrdenTrabajoProgress from "@/components/OrdenTrabajo/EditarOrdenTrabajo/OrdenTrabajoProgress.vue";
import LlantasSection from "@/components/OrdenTrabajo/EditarOrdenTrabajo/Llantas/LlantasSection.vue";
import PaquetesSection from "@/components/OrdenTrabajo/EditarOrdenTrabajo/Paquete/PaquetesSection.vue";
import AdicionalesSection from "@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/AdicionalesSection.vue";
import OtrosSection from "@/components/OrdenTrabajo/EditarOrdenTrabajo/Adicionales/OtrosSection.vue";
import Incidentes from "@/components/OrdenTrabajo/EditarOrdenTrabajo/Incidentes.vue";
import ImprimirOT from "@/components/OrdenTrabajo/ImprimirOT.vue";
import Refacciones from "@/components/OrdenTrabajo/EditarOrdenTrabajo/Refacciones.vue";
import CosteoOrdenTrabajoModal from "@/components/OrdenTrabajo/EditarOrdenTrabajo/CosteoOrdenTrabajoModal.vue";
import { parse } from "vue/compiler-sfc";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import ModalInsumo from "../../components/OrdenTrabajo/ModalInsumo.vue";

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const itmEmpleados = ref({});
const usosCFDI = ref([]);
const regimenFiscal = ref([]);
const modelValue = ref(false);
const costeoModal = ref(false);
const showModal = ref(false);
const insumosCambios = ref(false);
const autoguardando = ref(false);
const aplicaDesecharLlanta = ref(false);
const insumoOriginal = ref(normalizeInsumo({}));
import {AplicarPromo} from '@/components/common/funciones'

/**
 * 🔒 Estado inicial seguro
 */

const data45 = JSON.parse(localStorage.getItem("userSession")); // o el nombre de la key que usaste
const idUsuarioSession = data45?.usuario?.idUsuario;

const otEditar = ref({
  insumo: {
    llantas: [],
    paquetes: [],
    adicionales: [],
  },
  totales: {
    subtotal: 0,
    descuento: 0,
    iva: 0,
  },
});

const editandoClienteVehiculo = ref(false);
const sugerenciasVehiculosEdicion = ref([]);
const sugerenciasClientesEdicion = ref([]);
let debounceClienteVehiculo = null;

const datosClienteVehiculo = reactive({
  cliente: {
    idCliente: 0,
    nombres: "",
    apellidos: "",
    rfc: "",
    telefono: "",
    correo: "",
  },
  vehiculo: {
    idVehiculo: 0,
    marca: "",
    modelo: "",
    color: "",
    serie: "",
    anio: "",
    placas: "",
    kilometraje: "",
  },
});

const copiarClienteVehiculoDesdeOT = () => {
  const cliente = otEditar.value.cliente || {};
  const vehiculo = otEditar.value.vehiculo || {};
  const nombreCompleto = (cliente.nombreCompleto || "").trim();
  const partesNombre = nombreCompleto.split(" ").filter(Boolean);
  const nombresCliente = cliente.nombres || cliente.nombre || partesNombre[0] || "";
  const apellidosCliente =
    [cliente.apPaterno, cliente.apMaterno].filter(Boolean).join(" ") ||
    partesNombre.slice(1).join(" ");

  Object.assign(datosClienteVehiculo.cliente, {
    idCliente: cliente.idCliente || 0,
    nombres: nombresCliente || cliente.nombreCompleto || "",
    apellidos: apellidosCliente,
    rfc: cliente.rfc || "",
    telefono: cliente.telefono || "",
    correo: cliente.correo || "",
  });

  Object.assign(datosClienteVehiculo.vehiculo, {
    idVehiculo: vehiculo.idVehiculo || 0,
    marca: vehiculo.marca || "",
    modelo: vehiculo.modelo || "",
    color: vehiculo.color || "",
    serie: vehiculo.serie || "",
    anio: vehiculo.anio || "",
    placas: vehiculo.placas || "",
    kilometraje: vehiculo.kilometraje ?? "",
  });
};

const toggleEdicionClienteVehiculo = () => {
  editandoClienteVehiculo.value = !editandoClienteVehiculo.value;
  sugerenciasClientesEdicion.value = [];
  sugerenciasVehiculosEdicion.value = [];
};

const insumosFiltrados = computed(() => {
  const insumo = otEditar.value.insumo || {
    llanta: [],
    paquete: [],
    adicional: [],
  };

  return {
    llanta: (insumo.llantas || []).filter((l) => !l.eliminado),
    paquete: (insumo.paquetes || []).filter((p) => !p.eliminado),
    adicional: (insumo.adicionales || []).filter((a) => !a.eliminado),
  };
});

const obtenerPromosPorInventario = async (
  idInventarioInicial,
  options = {},
) => {
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPorInventario?idInventario=${idInventarioInicial}`,
      options,
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
const obtenerPromosPorPaquete = async (idPaquete, options = {}) => {
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPoridPaquete?idPaquete=${idPaquete}`,
      options,
    );

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error("Error al obtener promociones por paquete:", error);
    return [];
  }
};
const obtenerPromosGeneralesParaServicio = async (options = {}) => {
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionesGenerales`,
      options,
    );
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();

    // Solo promociones activas
    return Array.isArray(data) ? data.filter((p) => p.activo) : [];
  } catch (error) {
    console.error(
      "Error al obtener promociones generales para servicios:",
      error,
    );
    return [];
  }
};

const preguntaCancelar = async (ot) => {
  await Swal.fire({
    title: "Cancelar orden de trabajo",
    text:
      "¿Desea cancelar la orden de trabajo " +
      ot +
      "? Esta acción no se puede deshacer.",
    icon: "warning",
    confirmButtonText: "Sí, cancelar la OT",
    showCancelButton: true,
    cancelButtonText: "No, volver",
  }).then((result) => {
    if (result.isConfirmed) {
      cambiarEstatusOT(0);
    }
  });
};

const cargarOrden = async (options = {}) => {
  try {
    const id = route.params.id;
    const otCreada = history.state?.otCreada ?? false;
    console.log("isCreated?: ", otCreada);

    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }

    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/getOrdenTrabajoById?id=${id}`,
      options,
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    console.log(json);

    otEditar.value = {
      idOrdenTrabajo: json?.idOrdenTrabajo || 0,
      prefijoSucursal: json.prefijoSucursal,
      consecutivoSucursal: json.consecutivoSucursal,
      consecutivoCotizacion: json.consecutivoCotizacion,
      prefijoCotizacion: json.prefijoCotizacion,
      observacion: json?.observacion,

      cliente: json.cliente || {},
      empleado: json.empleado || {},
      vehiculo: json.vehiculo || {},
      factura: json.factura || {},

      adicionales: Array.isArray(json.adicionales) ? json.adicionales : [],

      llantas: Array.isArray(json.llantas) ? json.llantas : [],
      paquetes: Array.isArray(json.paquetes) ? json.paquetes : [],

      metodoPago: json.metodoPago || "",
      usoCFDI: json.usoCFDI || "",
      regimenFiscal: json.regimenFiscal || "",

      estado: json.estado || "",
      estatus: json.estatus || "",

      fechaAlta: json.fechaAlta || null,
      fechaEntrega: json.fechaEntrega || null,

      idCotizacion: json.idCotizacion || 0,

      requiereFactura: json.requiereFactura || false,
      desecharLlanta: json.desecharLlanta,

      insumo: {
        llantas: await Promise.all(
          json.llantas.map(async (llanta) => {
            const promosDisponibles = await obtenerPromosPorInventario(
              llanta.idInventarioInicial,
            );
            
            // Construir objeto de promoción existente
            const promocionExistente = {
              idPromocion: llanta?.idPromocion || llanta?.idPromocionVuelo || 0,
              valor: llanta?.valorPromocion || llanta?.valorVuelo || 0,
              tipo: llanta?.tipoPromocion || llanta?.tipoVuelo || null,
              nombre: llanta?.nombrePromocion || llanta?.nombreVuelo || "",
            };
            
            // Crear item con promo ya asignado
            const itemConPromo = {
              ...llanta,
              cantidad: llanta.cantidad,
              precioUnitario: llanta.precioUnitario,
              promo: promocionExistente,
            };
            
            // AHORA calcular el precio con promo
            const precioConPromo = AplicarPromo(itemConPromo);
            console.log("precioConPromo:", precioConPromo);
            
            return {
              idDetalleOTLlanta: llanta.idDetalleOTLlanta, // no se agrega
              idLlanta: llanta.idLlanta,
              idAlmacen: llanta.idAlmacen,
              idConceptoTrabajo: 1,
              idPromocion: llanta.idPromocion || null,
              idPromocionVuelo: llanta.idPromocionVuelo || null,
              idPromocionSeleccionada:
                llanta?.idPromocion || llanta?.idPromocionVuelo || 0,
              descripcion: llanta.detalle,
              medida: llanta.medida, // campo estetico
              modelo: llanta.modelo, // campo estetico
              marca: llanta.marca, // campo estetica
              cantidad: llanta.cantidad,
              precioUnitario: llanta.precioUnitario,
              costo:llanta.costo,
              subTotal: precioConPromo,
               // campo estetico

              promosDisponibles: promosDisponibles || [],
              esAlVuelo: llanta.idPromocionVuelo != 0 ? true : false,
              // si ya tiene promo existente rellenar valores
              promo: promocionExistente,
            };
          }),
        ),
        paquetes: await Promise.all(
          json.paquetes.map(async (paquete) => {
            const promosDisponibles =
              (await obtenerPromosPorPaquete(paquete.idPaquete)) || [];
            
            // Construir objeto de promoción existente
            const promocionExistente = {
              idPromocion:
                paquete?.idPromocion || paquete?.idPromocionVuelo || 0,
              valor: paquete?.valorPromocion || paquete?.valorVuelo || 0,
              tipo: paquete?.tipoPromocion || paquete?.tipoVuelo || null,
              nombre: paquete?.nombrePromocion || paquete?.nombreVuelo || "",
            };
            
            // Crear item con promo ya asignado
            const itemConPromo = {
              ...paquete,
              cantidad: 1,
              precioUnitario: paquete.precioUnitario,
              promo: promocionExistente,
            };
            
            // AHORA calcular el precio con promo
            const precioConPromo = AplicarPromo(itemConPromo);
            
            return {
              idDetalleOTPaquete: paquete.idDetalleOTPaquete || 0,
              idPaquete: paquete.idPaquete,
              idPromocion: paquete?.idPromocion || null,
              idConceptoTrabajo: 0,
              idPromocionVuelo: paquete?.idPromocionVuelo || null,
              idPromocionSeleccionada:
                paquete?.idPromocion || paquete?.idPromocionVuelo || 0,
              nombre: paquete.nombre,
              descripcion: paquete.descripcion,
              cantidad: 1,
              precioUnitario: paquete.precioUnitario,
              costo:paquete.costo,
              subTotal: Number((precioConPromo).toFixed(2)),

              detalle: paquete.detalle.map((detalle) => ({
                idDesglosePaquete: detalle.idDesglosePaquete,
                idConceptoTrabajo: detalle.idConceptoTrabajo,
                descripcion: detalle.nombre,
                cantidad: detalle.cantidad,
              })),

              promosDisponibles: promosDisponibles || [],
              esAlVuelo: paquete.idPromocionVuelo != 0 ? true : false,
              // info histórica (si viene de backend)
              promo: promocionExistente,
            };
          }),
        ),
        adicionales: await Promise.all(
          json.adicionales.map(async (s) => {
            const promosDisponibles =
              (await obtenerPromosGeneralesParaServicio()) || [];

            // Construir objeto de promoción existente
            const promocionExistente = {
              idPromocion: s?.idPromocion || s?.idPromocionVuelo || 0,
              valor: s?.valorPromocion || s?.valorVuelo || 0,
              tipo: s?.tipoPromocion || s?.tipoVuelo || null,
              nombre: s?.nombrePromocion || s?.nombreVuelo || "",
            };
            
            // Crear item con promo ya asignado
            const itemConPromo = {
              ...s,
              cantidad: s.cantidad,
              precioUnitario: s.precioUnitario,
              promo: promocionExistente,
            };
            
            // AHORA calcular el precio con promo
            const precioConPromo = AplicarPromo(itemConPromo);
            
            return {
              idDetalleOTServicio: s.idDetalleOTServicio,
              idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
              idPromocion: s?.idPromocion || null,
              idConceptoTrabajo: s.idConceptoTrabajo,
              idPromocionVuelo: s?.idPromocionVuelo || null,
              idPromocionSeleccionada:
                s?.idPromocion || s?.idPromocionVuelo || 0,
              descripcion: s.descripcionServicio,
              observacion: s.observacion,
              comentario: s.comentario,

              cantidad: s.cantidad,
              precioUnitario: s.precioUnitario,
              costo:s.costo,
              subTotal: Number((precioConPromo).toFixed(2)),

              promosDisponibles: promosDisponibles || [],
              esAlVuelo: s.idPromocionVuelo != 0 ? true : false,
              // info histórica
              promo: promocionExistente,
            };
          }),
        ),
        /* llantas: Array.isArray(json.llantas) ? json.llantas : [],
        paquetes: Array.isArray(json.paquetes) ? json.paquetes : [],
        adicionales: Array.isArray(json.adicionales) ? json.adicionales : [],*/
      },
    };
    copiarClienteVehiculoDesdeOT();
    // invocar el evento imprimir
    console.log("Desechar: " + otEditar.value.desecharLlanta);
    if (otEditar.value.desecharLlanta == null) {
      aplicaDesecharLlanta.value = true;
      otEditar.value.desecharLlanta = false;
    } else {
      aplicaDesecharLlanta.value = false;
    }
    if (otCreada === true) {
      modelValue.value = true;
      history.replaceState({}, document.title);
    }
    // GUARDAR UNA COPIA NORMALIZADA DE LOS INSUMOS ORIGINALES
    insumoOriginal.value = normalizeInsumo(otEditar.value.insumo);
  } catch (err) {
    console.error("❌ Error cargando OT:", err);

    otEditar.value = {
      insumo: {
        llantas: [],
        paquetes: [],
        adicionales: [],
      },
      totales: {
        subtotal: 0,
        descuento: 0,
        iva: 0,
      },
    };
  }
  calcularTotales();
};


// Normaliza insumos para comparar: tipos consistentes y orden determinista
function normalizeInsumo(insumo) {
  const s = insumo || { llantas: [], paquetes: [], adicionales: [] };

  const normArr = (arr) =>
    (arr || [])
      .map((item) => ({
        ...item,
        cantidad: Number(item.cantidad || 0),
        precioUnitario: Number(item.precioUnitario || 0),
        subTotal: Number(item.subTotal || 0),
        eliminado: Boolean(item.eliminado),
        idPromocion: item.idPromocion == null ? null : Number(item.idPromocion),
        idPromocionVuelo:
          item.idPromocionVuelo == null ? null : Number(item.idPromocionVuelo),
      }))
      .sort((a, b) => {
        const ka =
          a.idDetalleOTLlanta ?? a.idDetalleOTPaquete ?? a.idDetalleOTServicio ?? a.idLlanta ?? a.idPaquete ?? 0;
        const kb =
          b.idDetalleOTLlanta ?? b.idDetalleOTPaquete ?? b.idDetalleOTServicio ?? b.idLlanta ?? b.idPaquete ?? 0;
        return (ka - kb) || (Number(a.cantidad || 0) - Number(b.cantidad || 0));
      });

  return {
    llantas: normArr(s.llantas),
    paquetes: normArr(s.paquetes),
    adicionales: normArr(s.adicionales),
  };
}
const autoGuardarEdicion = async (mensaje) => {
  if (autoguardando.value) return;

  autoguardando.value = true;
  try {
    await guardarEdicion({ mensaje });
  } finally {
    autoguardando.value = false;
  }
};

const actualizarInsumos = async (payload) => {
  // payload = { insumo, totales }
  // Normalizar y asignar todo el insumo de forma consistente
  otEditar.value.insumo = normalizeInsumo({
    llantas: payload.insumo.llanta,
    paquetes: payload.insumo.paquete,
    adicionales: payload.insumo.adicional,
  });

  otEditar.value.totales.subtotal = payload.totales.subtotal;
  otEditar.value.totales.descuento = payload.totales.descuento;
  otEditar.value.totales.iva = payload.totales.iva;
  otEditar.value.totales.total = payload.totales.total;

  await autoGuardarEdicion("Orden guardada despues de actualizar insumos");
};
// provicional, lo ideal es usar computed
const PrintOtFunction = () => {
  if (insumosCambios.value == true) {
    console.log("DEBES GUARDAR LOS CAMBIOS");
    insumosCambios.value = true; // Solo cambia a false al guardar
  } else {
    modelValue.value = true; // imprimir
  }
};
watch(
  () => otEditar.value.insumo,
  (newInsumo) => {
    try {
      const plainNew = normalizeInsumo(newInsumo);
      insumosCambios.value =
        JSON.stringify(plainNew) !== JSON.stringify(insumoOriginal.value);
    } catch (e) {
      // Fallback: si normalize falla por alguna razón, marcar como cambiado
      insumosCambios.value = true;
    }

    console.log("cambios en insumos", insumosCambios.value);
  },
  { deep: true },
);

const calcularTotales = () => {
  const totalLlantas = (otEditar.value.insumo.llantas || []).reduce(
    (acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0),
    0,
  );
  const totalPaquetes = (otEditar.value.insumo.paquetes || []).reduce(
    (acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0),
    0,
  );
  const totalAdicionales = (otEditar.value.insumo.adicionales || []).reduce(
    (acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0),
    0,
  );
  const subtotal = totalLlantas + totalPaquetes + totalAdicionales;

  if (!otEditar.value.totales) {
    otEditar.value.totales = {
      subtotal: 0,
      descuento: 0,
      iva: 0,
      total: 0,
    };
  }

  const descuento = otEditar.value.totales.descuento || 0;
  const iva = (subtotal - descuento) * 0.16;

  otEditar.value.totales.subtotal = Number(subtotal.toFixed(2));
  otEditar.value.totales.iva = Number(iva.toFixed(2));
  otEditar.value.totales.total = Number((subtotal - descuento).toFixed(2));
};

// Normaliza insumos para comparar: tipos consistentes y orden determinista
/*
const normalizeInsumo = (insumo) => {
  const s = insumo || { llantas: [], paquetes: [], adicionales: [] };

  const normArr = (arr) =>
    (arr || [])
      .map((item) => ({
        ...item,
        cantidad: Number(item.cantidad || 0),
        precioUnitario: Number(item.precioUnitario || 0),
        subTotal: Number(item.subTotal || 0),
        eliminado: Boolean(item.eliminado),
        idPromocion: item.idPromocion == null ? null : Number(item.idPromocion),
        idPromocionVuelo:
          item.idPromocionVuelo == null ? null : Number(item.idPromocionVuelo),
      }))
      .sort((a, b) => {
        const ka =
          a.idDetalleOTLlanta ?? a.idDetalleOTPaquete ?? a.idDetalleOTServicio ?? a.idLlanta ?? a.idPaquete ?? 0;
        const kb =
          b.idDetalleOTLlanta ?? b.idDetalleOTPaquete ?? b.idDetalleOTServicio ?? b.idLlanta ?? b.idPaquete ?? 0;
        return (ka - kb) || (Number(a.cantidad || 0) - Number(b.cantidad || 0));
      });

  return {
    llantas: normArr(s.llantas),
    paquetes: normArr(s.paquetes),
    adicionales: normArr(s.adicionales),
  };
};
*/
const cargarEmpleados = async (options = {}) => {
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }
    const res = await fetch(
      proxy.$serverIP +
        "api/Empleado/getEmpleado?idSucursal=" +
        userSession.usuario.idSucursal,
      options,
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

const cargarUsosCFDI = async (options = {}) => {
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }
    const res = await fetch(
      proxy.$serverIP + "api/OrdenTrabajo/getUsosCFDI",
      options,
    );
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    usosCFDI.value = result.data;
  } catch (error) {
    console.error("Error al cargar usos CFDI:", error);
  }
};

const cargarRegimenFiscal = async (options = {}) => {
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adjuntar el token Bearer si existe

    if (data45?.token) {
      options.headers["Authorization"] = `Bearer ${data45?.token}`;
    }
    const res = await fetch(
      proxy.$serverIP + "api/OrdenTrabajo/getRegimenFiscal",
      options,
    );
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    regimenFiscal.value = result.data;
  } catch (error) {
    console.error("Error al cargar el régimen fiscal:", error);
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

const formatearTelefono = (telefono) => {
  if (!telefono) return "";
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length !== 10) return telefono;
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
};

const refrescarOrden = () => {
  console.log("🔄 Refrescando orden...");
  cargarOrden();
};

const volver = () => {
  router.push("/content/orden-trabajo");
};

const estados = ["Creado", "En curso", "Finalizado", "Entregado"];

const indiceActual = computed(() => {
  return estados.indexOf(otEditar.value.estado);
});

// ¿ya pasó este estado?
const esCompletado = (estado) => {
  return estados.indexOf(estado) < indiceActual.value;
};

// clases del círculo
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

// clases de la línea entre pasos
const lineaClase = (estado) => {
  return estados.indexOf(estado) < indiceActual.value
    ? "bg-success"
    : "bg-secondary";
};
/*const preguntaEntregar = async (ot) => {
  await Swal.fire({
    title: "Entregar vehiculo",
    text:
      "Al entregar el vehículo no podrás retroceder la Orden de trabajo ¿Estás seguro?",
    icon: "warning",
    confirmButtonText: "Sí, cancelar la OT",
    showCancelButton: true,
    cancelButtonText: "No, volver",
  }).then((result) => {
    if (result.isConfirmed) {
      return 1; 
    }
  });
};*/

const avanzarEstado = async () => {
  console.log(estados.indexOf(otEditar.value.estado));
  const idx = estados.indexOf(otEditar.value.estado);

  // si no existe o ya es el último → no hace nada
  if (idx === -1 || idx >= estados.length - 1) return;

  const nuevoEstado = estados[idx + 1];

  // Si vamos a avanzar al último estado ('Entregado'), pedir confirmación
  if (idx + 1 === estados.length - 1) {
    const preguntaEntregar = await Swal.fire({
      title: "Entregar vehiculo",
      text: "Al entregar el vehículo no podrás retroceder la Orden de trabajo ¿Estás seguro?",
      icon: "warning",
      confirmButtonText: "Sí, Entregar vehículo",
      showCancelButton: true,
      cancelButtonText: "No, volver",
    });

    if (!preguntaEntregar.isConfirmed) return;
  }

  try {
    // actualizar en frontend
    otEditar.value.estado = nuevoEstado;

    // guardar en backend
    await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/avanzarOT/${otEditar.value.idOrdenTrabajo}`,
      {
        estado: nuevoEstado,
        idUsuario: idUsuarioSession,
      },
      { headers: { Authorization: `Bearer ${data45?.token}` } },
    );

    mostrarToast("success", "Orden de trabajo avanzada correctamente");
  } catch (error) {
    console.error("No se pudo actualizar el estado", error);
  }
};
const retrocederEstado = async () => {
  const idx = estados.indexOf(otEditar.value.estado);

  // si no existe o ya es el último → no hace nada
  if (idx === 0 || idx >= estados.length - 1) return;

  const nuevoEstado = estados[idx - 1];

  try {
    // actualizar en frontend
    otEditar.value.estado = nuevoEstado;

    // guardar en backend
    await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/avanzarOT/${otEditar.value.idOrdenTrabajo}`,
      {
        estado: nuevoEstado,
        idUsuario: idUsuarioSession,
      },
      { headers: { Authorization: `Bearer ${data45?.token}` } },
    );

    mostrarToast("success", "Orden de trabajo avanzada correctamente");
  } catch (error) {
    console.error("No se pudo actualizar el estado", error);
  }
};

const cambiarEstatusOT = async (estatus) => {
  try {
    // guardar en backend
    await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/cambiarEstatusOT/${otEditar.value.idOrdenTrabajo}`,
      {
        estatus: estatus,
      },
      { headers: { Authorization: `Bearer ${data45?.token}` } },
    );

    switch (estatus) {
      case 0:
        mostrarToast("success", "Orden de trabajo cancelada correctamente");
        break;
      case 1:
        mostrarToast("success", "Orden de trabajo retomada correctamente");
        break;
      case 2:
        mostrarToast("success", "Orden de trabajo suspendida correctamente");
        break;
    }

    cargarOrden();
  } catch (error) {
    console.error("No se pudo actualizar el estado", error);
  }
};

// funcion para guardar los datos editados de la OT
const buscarVehiculosEdicion = (serie) => {
  clearTimeout(debounceClienteVehiculo);

  if (!serie || serie.trim().length < 2) {
    sugerenciasVehiculosEdicion.value = [];
    return;
  }

  debounceClienteVehiculo = setTimeout(async () => {
    try {
      const res = await fetch(
        `${proxy.$serverIP}api/Vehiculo/bySerie?strSerie=${encodeURIComponent(
          serie.trim(),
        )}`,
      );

      sugerenciasVehiculosEdicion.value = res.ok ? await res.json() : [];
    } catch (error) {
      console.error("Error al buscar vehículos:", error);
      sugerenciasVehiculosEdicion.value = [];
    }
  }, 300);
};

const seleccionarVehiculoEdicion = () => {
  const serie = datosClienteVehiculo.vehiculo.serie?.trim().toLowerCase();
  const vehiculo = sugerenciasVehiculosEdicion.value.find(
    (v) => v.serie?.toLowerCase() === serie,
  );

  if (!vehiculo) {
    datosClienteVehiculo.vehiculo.idVehiculo = 0;
    return;
  }

  Object.assign(datosClienteVehiculo.vehiculo, {
    idVehiculo: vehiculo.idVehiculo || 0,
    marca: vehiculo.marca || "",
    modelo: vehiculo.modelo || "",
    color: vehiculo.color || "",
    serie: vehiculo.serie || "",
    anio: vehiculo.anio || "",
    placas: vehiculo.placas || "",
    kilometraje: vehiculo.kilometraje ?? "",
  });
};

const buscarClientesEdicion = (texto) => {
  clearTimeout(debounceClienteVehiculo);

  if (!texto || texto.trim().length < 2) {
    sugerenciasClientesEdicion.value = [];
    return;
  }

  debounceClienteVehiculo = setTimeout(async () => {
    try {
      const res = await fetch(
        `${proxy.$serverIP}api/Cliente/sugerenciaCliente?texto=${encodeURIComponent(
          texto.trim(),
        )}`,
      );

      sugerenciasClientesEdicion.value = res.ok ? await res.json() : [];
    } catch (error) {
      console.error("Error al buscar clientes:", error);
      sugerenciasClientesEdicion.value = [];
    }
  }, 300);
};

const seleccionarClienteEdicion = (cliente) => {
  Object.assign(datosClienteVehiculo.cliente, {
    idCliente: cliente.idCliente || 0,
    nombres: cliente.nombres || "",
    apellidos: [cliente.apPaterno, cliente.apMaterno].filter(Boolean).join(" "),
    rfc: cliente.rfc || "",
    telefono: cliente.telefono || "",
    correo: cliente.correo || "",
  });
};

const seleccionarClienteEdicionPorValor = (valor) => {
  if (!valor) return;

  const normalizado = valor.trim().toLowerCase();
  const cliente = sugerenciasClientesEdicion.value.find((c) => {
    const nombreCompleto = [c.nombres, c.apPaterno, c.apMaterno]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const telefono = c.telefono?.toLowerCase() || "";
    const correo = c.correo?.toLowerCase() || "";
    const rfc = c.rfc?.toLowerCase() || "";

    return (
      nombreCompleto === normalizado ||
      telefono === normalizado ||
      correo === normalizado ||
      rfc === normalizado
    );
  });

  if (cliente) {
    seleccionarClienteEdicion(cliente);
  } else {
    datosClienteVehiculo.cliente.idCliente = 0;
  }
};

const clienteVehiculoPayload = () => ({
  cliente: {
    idCliente: datosClienteVehiculo.cliente.idCliente || 0,
    nombres: datosClienteVehiculo.cliente.nombres?.trim() || "",
    apellidos: datosClienteVehiculo.cliente.apellidos?.trim() || "",
    rfc: datosClienteVehiculo.cliente.rfc?.trim() || "",
    telefono: datosClienteVehiculo.cliente.telefono?.trim() || "",
    correo: datosClienteVehiculo.cliente.correo?.trim() || "",
  },
  vehiculo: {
    idVehiculo: datosClienteVehiculo.vehiculo.idVehiculo || 0,
    marca: datosClienteVehiculo.vehiculo.marca?.trim() || "",
    modelo: datosClienteVehiculo.vehiculo.modelo?.trim() || "",
    color: datosClienteVehiculo.vehiculo.color?.trim() || "",
    serie: datosClienteVehiculo.vehiculo.serie?.trim() || "",
    anio: Number(datosClienteVehiculo.vehiculo.anio || 0),
    placas: datosClienteVehiculo.vehiculo.placas?.trim() || "",
    kilometraje: Number(datosClienteVehiculo.vehiculo.kilometraje || 0),
  },
});

const validarClienteVehiculoEdicion = () => {
  const { cliente, vehiculo } = clienteVehiculoPayload();
  const erroresClienteVehiculo = [];

  if (!cliente.nombres) erroresClienteVehiculo.push("El nombre del cliente es obligatorio.");
  if (!vehiculo.serie) erroresClienteVehiculo.push("El número de serie del vehículo es obligatorio.");
  if (!vehiculo.marca) erroresClienteVehiculo.push("La marca del vehículo es obligatoria.");

  if (erroresClienteVehiculo.length) {
    mostrarToast("warning", erroresClienteVehiculo[0]);
    return false;
  }

  return true;
};

const guardarEdicion = async (opciones = {}) => {
  const idOT = otEditar.value.idOrdenTrabajo;
  const mensajeExito =
    opciones?.mensaje || "Orden de trabajo editada correctamente";

  //console.log("usuario edita" , otEditar.observacion);

  var desechar;
  if (aplicaDesecharLlanta.value) {
    desechar = null;
  } else {
    desechar = otEditar.value.desecharLlanta;
  }

  const payload = {
    idUsuario: idUsuarioSession,
    idEmpleado: otEditar.value.empleado.idEmpleado,
    metodoPago: otEditar.value.metodoPago,
    desecharLlanta: desechar,
    observacion: otEditar.value.observacion,
    requiereFactura: otEditar.value.requiereFactura,
    llantas: otEditar.value.insumo.llantas,
    paquetes: otEditar.value.insumo.paquetes,
    adicionales: otEditar.value.insumo.adicionales,
    factura: otEditar.value.factura,
    ...clienteVehiculoPayload(),
  };

  if (!validarClienteVehiculoEdicion()) return;

  try {
    const response = await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/editarOT/${idOT}`,
      payload,
      { headers: { Authorization: `Bearer ${data45?.token}` } },
    );

    mostrarToast("success", mensajeExito);
    console.log("OT actualizada:", response.data);
    // Recargar OT y luego desactivar indicador de cambios
    await cargarOrden();
    editandoClienteVehiculo.value = false;
    // Habilitar boton imprimir
    insumosCambios.value = false;
    //volver()
  } catch (error) {
    console.error("Error al editar OT:", error);
  }
};

const derivarOtPadre = () => {
  router.push({
    name: "orden-trabajo-form",
    params: {
      idOrdenTrabajo: otEditar.value.idOrdenTrabajo,
    },
  });
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

// Validaciones
const errores = reactive({});

const getValor = (path) => {
  return path.split(".").reduce((obj, key) => obj[key], otEditar.value);
};

function validate(path) {
  const value = getValor(path);

  // ========================= VALIDACIONES ==============================

  const rules = {
    // -------- FACTURA ----------
    "factura.razonSocial": () =>
      !value || !value.trim() ? "Razón social obligatoria." : null,

    "factura.usoCFDI": () => (!value ? "Debe seleccionar un uso CFDI." : null),

    "factura.regimenFiscal": () =>
      !value ? "Debe seleccionar un régimen fiscal." : null,

    "factura.email": () => {
      if (!value || !value.trim()) return "Correo obligatorio.";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? "E-mail no válido." : null;
    },

    "factura.cp": () => {
      if (!value || !value.trim()) return "Código postal obligatorio.";

      const cpRegex = /^\d{5}$/;
      return !cpRegex.test(value)
        ? "El código postal debe tener 5 dígitos."
        : null;
    },

    "factura.rfc": () => {
      if (!value || !value.trim()) return "RFC obligatorio.";

      const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;

      return !rfcRegex.test(value.toUpperCase()) ? "RFC no válido." : null;
    },
  };

  // Ejecutar regla
  const error = rules[path] ? rules[path]() : null;

  if (error) errores[path] = error;
  else delete errores[path];
}

const formValido = computed(() => {
  // Si hay errores → inválido
  if (otEditar.value.requiereFactura) {
    if (Object.keys(errores).length > 0) return false;
    // Campos obligatorios SOLO si se desea factura
    const facturaRequired =
      otEditar.requiereFactura === true
        ? [
            otEditar.factura.razonSocial,
            otEditar.factura.usoCFDI,
            otEditar.factura.regimenFiscal,
            otEditar.factura.eMail,
            otEditar.factura.cp,
            otEditar.factura.rfc,
          ]
        : [];

    // 4️⃣ Validación final (no vacío / no null)
    return [...facturaRequired].every(
      (v) => v !== "" && v !== null && v !== undefined,
    );
  } else return true;
});

onMounted(() => {
  cargarOrden();
  cargarEmpleados();
  cargarUsosCFDI();
  cargarRegimenFiscal();
});

// Agregar
const agregarLlanta = (nueva) => {
  otEditar.value.llanta.push(nueva);
};

// Eliminar
const eliminarLlanta = (idLlanta) => {
  otEditar.value.llanta = otEditar.value.llanta.filter(
    (l) => l.idLlanta !== idLlanta,
  );
};

const guardarLLantasOT = async () => {
  const payload = {
    idOrdenTrabajo: otEditar.value.idOrdenTrabajo,
    idUsuario: idUsuarioSession,
    llanta: otEditar.value.llanta.map((llanta) => ({
      idDetalleOTLlanta: llanta.idDetalleOTLlanta,
      idLlanta: llanta.idLlanta,
      idAlmacen: llanta.idAlmacen,
      descripcion: llanta.detalle,
      cantidad: llanta.cantidad,
      precioUnitario: llanta.precioUnitario,
      idPromocion: llanta.idPromocion,
      idPromocionVuelo: llanta.idPromocionVuelo,
    })),
  };

  console.log("payload:", payload);

  // Ejemplo de envío al backend
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Adjuntar el token Bearer si existe

  if (data45?.token) {
    options.headers["Authorization"] = `Bearer ${data45?.token}`;
  }
  const res = await fetch(
    `${proxy.$serverIP}api/OrdenTrabajo/InsertarLlantasOT`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status}`);
  }

  const data = await res.json();
  //console.log("RESPUESTA BACKEND:", data);
};
const prepararDatosImpresion = () => {
  const insumo = otEditar.value.insumo || {};

  return {
    ...otEditar.value,

    insumo: {
      llantas: (insumo.llantas || []).filter((l) => !l.eliminado),
      paquetes: (insumo.paquetes || []).filter((p) => !p.eliminado),
      adicionales: (insumo.adicionales || []).filter((a) => !a.eliminado),
    },
  };
};
console.log("PROPIEDADES PARA IMPRIMIR:", prepararDatosImpresion());
</script>

<style>
.input-error {
  border: 1px solid red;
}

.error-msg {
  color: red;
  font-size: 12px;
}
</style>
