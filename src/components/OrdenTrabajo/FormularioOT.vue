<template>
  <div class="container p-3 bs-body">
    <form>
      <div class="row my-1">
        <div class="col">
          <h2 class="text-start">{{props.idOrdenTrabajo ? "Orden de Trabajo Derivada" : "Nueva Orden de Trabajo"}}</h2>
        </div>
        <div class="col">
          <div class="d-flex justify-content-end">
            <div v-if="loggeduser" class="card bg-light shadow-sm mx-4 my-2">
              <div class="card-body" style="font-size: 10pt; color: slategray">
                <i class="bi bi-person me-2"></i> <strong>Usuario: </strong
                >{{ loggeduser.usuario.nombre }}<br />
                <i class="bi bi-building-fill me-2"></i>
                <strong>Sucursal: </strong
                >{{ sucursales[loggeduser.usuario.idSucursal - 1] }}
              </div>
            </div>
          </div>
        </div>
        <hr />
      </div>
      <div class="row my-3">
        <div class="col-4">
          <h5>Cotización</h5>
        </div>
        <div class="col-8">
          <ModalBuscarCotizacion
            v-model="ordenTrabajoForm.cotSeleccionada"
            @seleccionar-cotizacion="onCotizacionSeleccionada"
          />
        </div>
      </div>
      <hr />

      <div class="row mb-4 align-items-stretch">
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header" style="font-size: 14pt">
              <i class="bi bi-car-front-fill me-2"></i> Vehículo
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-6 mb-3">
                  <label for="sumserie" class="form-label">Núm. Serie *</label>

                  <input
                    id="numserie"
                    v-model="ordenTrabajoForm.vehiculo.serie"
                    @input="
                      onSerieInput($event.target.value),
                        validate('vehiculo.serie')
                    "
                    @change="onSerieSeleccionada"
                    list="vehiculos"
                    placeholder="(17 caracteres)"
                    class="form-control"
                    @blur="validate('vehiculo.serie')"
                    :class="{ 'input-error': errores['vehiculo.serie'] }"
                    :readonly="isReadOnly"
                  />
                  <small v-if="errores['vehiculo.serie']" class="error-msg">
                    {{ errores["vehiculo.serie"] }}
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
                <div class="col-6 mb-3">
                  <label for="marca" class="form-label">Marca *</label>

                  <input
                    id="marca"
                    v-model="ordenTrabajoForm.vehiculo.marca"
                    class="form-control"
                    type="text"
                    placeholder="Marca"
                    @input="validate('vehiculo.marca')"
                    @blur="validate('vehiculo.marca')"
                    :class="{ 'input-error': errores['vehiculo.marca'] }"
                    :readonly="isReadOnly"
                  />

                  <small v-if="errores['vehiculo.marca']" class="error-msg">
                    {{ errores["vehiculo.marca"] }}
                  </small>
                </div>
                <div class="col-6 mb-3">
                  <label for="modelo" class="form-label">Modelo *</label>
                  <input
                    id="modelo"
                    v-model="ordenTrabajoForm.vehiculo.modelo"
                    class="form-control"
                    type="text"
                    placeholder="Modelo *"
                    @input="validate('vehiculo.modelo')"
                    @blur="validate('vehiculo.modelo')"
                    :class="{ 'input-error': errores['vehiculo.modelo'] }"
                    :readonly="isReadOnly"
                  />
                  <small v-if="errores['vehiculo.modelo']" class="error-msg">
                    {{ errores["vehiculo.modelo"] }}
                  </small>
                </div>
                <div class="col-6 mb-3">
                  <label for="color" class="form-label">Color *</label>
                  <input
                    id="color"
                    v-model="ordenTrabajoForm.vehiculo.color"
                    class="form-control"
                    type="text"
                    placeholder="Color *"
                    @input="validate('vehiculo.color')"
                    @blur="validate('vehiculo.color')"
                    :class="{ 'input-error': errores['vehiculo.color'] }"
                    :readonly="isReadOnly"
                  />
                  <small v-if="errores['vehiculo.color']" class="error-msg">
                    {{ errores["vehiculo.color"] }}
                  </small>
                </div>
                <div class="col-6 mb-3">
                  <label for="kilometraje" class="form-label"
                    >Kilometraje *</label
                  >
                  <input
                    id="kilometraje"
                    v-model="ordenTrabajoForm.vehiculo.kilometraje"
                    class="form-control"
                    type="number"
                    placeholder="(Kilometraje actual)"
                    @input="validate('vehiculo.kilometraje')"
                    @blur="validate('vehiculo.kilometraje')"
                    :class="{ 'input-error': errores['vehiculo.kilometraje'] }"
                    :readonly="isReadOnly"
                  />
                  <small
                    v-if="errores['vehiculo.kilometraje']"
                    class="error-msg"
                  >
                    {{ errores["vehiculo.kilometraje"] }}
                  </small>
                </div>

                <div class="col-6 mb-3">
                  <label for="aniomodelo" class="form-label">Año *</label>
                  <input
                    id="aniomodelo"
                    v-model="ordenTrabajoForm.vehiculo.anio"
                    class="form-control"
                    type="number"
                    placeholder="Ej: 2019"
                    @input="validate('vehiculo.anio')"
                    @blur="validate('vehiculo.anio')"
                    :class="{ 'input-error': errores['vehiculo.anio'] }"
                    :readonly="isReadOnly"
                  />
                  <small v-if="errores['vehiculo.anio']" class="error-msg">
                    {{ errores["vehiculo.anio"] }}
                  </small>
                </div>
                <div class="col-6 mb-3">
                  <label for="placas" class="form-label">Placas *</label>
                  <input
                    id="placas"
                    v-model="ordenTrabajoForm.vehiculo.placas"
                    class="form-control"
                    type="text"
                    placeholder="Ej: GAB-254-A"
                    @input="validate('vehiculo.placas')"
                    @blur="validate('vehiculo.placas')"
                    :class="{ 'input-error': errores['vehiculo.placas'] }"
                    :readonly="isReadOnly"
                  />
                  <small v-if="errores['vehiculo.placas']" class="error-msg">
                    {{ errores["vehiculo.placas"] }}
                  </small>
                </div>
              </div>
            </div> 
          </div>
        </div>
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header" style="font-size: 14pt">
              <i class="bi bi-person-fill me-2"></i> Cliente
            </div>
            <div class="card-body">
              <div class="row">
                <!-- Nombre -->
                <div class="col-6 mb-3">
                  <label for="nombrecliente" class="form-label"
                    >Nombre(s) *</label
                  >
                  <input
                    id="nombrecliente"
                    v-model="ordenTrabajoForm.cliente.nombres"
                    class="form-control"
                    type="text"
                    placeholder="Nombre del cliente"
                    list="clientes"
                    @input="onClienteInput($event.target.value)"
                    :readonly="isReadOnly"
                  />
                </div>

                <!-- Apellidos -->
                <div class="col-6 mb-3">
                  <label for="apellidos" class="form-label"
                    >Apellido(s) *</label
                  >
                  <input
                    id="apellidos"
                    v-model="ordenTrabajoForm.cliente.apellidos"
                    type="text"
                    class="form-control"
                    placeholder="Apellido(s) del cliente"
                    @input="validate('cliente.apellidos')"
                    @blur="validate('cliente.apellidos')"
                    :class="{ 'input-error': errores['cliente.apellidos'] }"
                    :readonly="isReadOnly"
                  />
                </div>

                <!-- Teléfono -->
                <div class="col-6 mb-3">
                  <label for="telefono" class="form-label">Teléfono(s) *</label>
                  <input
                    id="telefono"
                    v-model="ordenTrabajoForm.cliente.clienteTelefono"
                    class="form-control"
                    type="text"
                    placeholder="(10 dígitos)"
                    list="clientes"
                    @input="validate('cliente.clienteTelefono')"
                    @change="onClienteSeleccionadoByValue($event.target.value)"
                    @blur="validate('cliente.clienteTelefono')"
                    :class="{
                      'input-error': errores['cliente.clienteTelefono'],
                    }"
                    :readonly="isReadOnly"
                  />
                  <small
                    v-if="errores['cliente.clienteTelefono']"
                    class="error-msg"
                  >
                    {{ errores["cliente.clienteTelefono"] }}
                  </small>
                </div>

                <div class="col-6 mb-3">
                  <label for="email" class="form-label"
                    >Correo electrónico</label
                  >
                  <input
                    id="email"
                    v-model="ordenTrabajoForm.cliente.clienteCorreo"
                    class="form-control"
                    type="text"
                    placeholder="(Use un correo válido)"
                    list="clientes"
                    @input="validate('cliente.clienteCorreo')"
                    @change="onClienteSeleccionadoByValue($event.target.value)"
                    @blur="validate('cliente.clienteCorreo')"
                    :class="{ 'input-error': errores['cliente.clienteCorreo'] }"
                    :readonly="isReadOnly"
                  />
                  <small
                    v-if="errores['cliente.clienteCorreo']"
                    class="error-msg"
                  >
                    {{ errores["cliente.clienteCorreo"] }}
                  </small>
                </div>

                <!-- RFC -->
                <div class="col-6 mb-3">
                  <label for="rfc" class="form-label">RFC</label>
                  <input
                    id="rfc"
                    v-model="ordenTrabajoForm.cliente.rfc"
                    type="text"
                    class="form-control"
                    placeholder="(12 ó 13 caracteres)"
                    list="clientes"
                    @input="ordenTrabajoForm.cliente.rfc = ordenTrabajoForm.cliente.rfc?.toUpperCase(), validate('cliente.rfc')"
                    @change="onClienteSeleccionadoByValue($event.target.value)"
                    @blur="validate('cliente.rfc')"
                    :class="{ 'input-error': errores['cliente.rfc'] }"
                    :readonly="isReadOnly"
                  />
                  <small v-if="errores['cliente.rfc']" class="error-msg">
                    {{ errores["cliente.rfc"] }}
                  </small>
                </div>
           <div class="col-6 mb-3">
            <label for="email" class="form-label">Correo electrónico</label>
            <input id="email"
              v-model="ordenTrabajoForm.cliente.clienteCorreo"
              class="form-control"
              type="text"
              placeholder="(Use un correo válido)"
              list="clientes"
              @change="onClienteSeleccionadoByValue($event.target.value)"
              @blur="validate('cliente.clienteCorreo')"
              :class="{ 'input-error': errores['cliente.clienteCorreo'] }"
            />
            <small v-if="errores['cliente.clienteCorreo']" class="error-msg">
              {{ errores["cliente.clienteCorreo"] }}
            </small>
          </div>



                
        <!-- RFC -->
        <div class="col-6 mb-3">
          <label for="rfc" class="form-label">RFC</label>
          <input id="rfc"
            v-model="ordenTrabajoForm.cliente.rfc"
            type="text"
            class="form-control"
            placeholder="(12 ó 13 caracteres)"
            list="clientes"
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
        <div class="col-3">
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
              <option disabled value="">-Selecciona-</option>
              <option value="Efectivo">01 - Efectivo</option>
              <option value="Cheque nominativo">02 - Cheque nominativo</option>
              <option value="Transferencia electrónica de fondos">
                03 - Transferencia electrónica de fondos
              </option>
              <option value="Tarjeta de crédito">
                04 - Tarjeta de crédito
              </option>
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

            <small v-if="errores['cliente.metodoPago']" class="error-msg">
              {{ errores["cliente.metodoPago"] }}
            </small>
          </div>
        </div>
        <div class="col-6">
          <div class="mb-3">
            <label class="form-label">Fecha de entrega propuesta *</label>
            <div class="row">
              <div class="col">
                <input
                  type="date"
                  class="form-control"
                  v-model="fechaEntregaFecha"
                  @change="unirFechaHora"
                  :class="{ 'input-error': errores['fechaEntrega'] }"
                />
              </div>
              <div class="col">
                <input
                  type="time"
                  class="form-control"
                  v-model="fechaEntregaHora"
                  @change="unirFechaHora"
                  :class="{ 'input-error': errores['fechaEntrega'] }"
                />
              </div>
            </div>

            <small v-if="errores['fechaEntrega']" class="error-msg">
              {{ errores["fechaEntrega"] }}
            </small>
          </div>
        </div>
        <div class="col-3">
          <div class="mb-3">
            <label class="form-label">Fecha Alta *</label>
            <input
              v-model="ordenTrabajoForm.cliente.fechaAlta"
              class="form-control"
              type="datetime-local"
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
            <div class="col-12 col-lg-6 mb-3">
              <label for="razonsocial" class="form-label">Razón social *</label>
              <input
                id="razonsocial"
                v-model="ordenTrabajoForm.factura.razonSocial"
                class="form-control"
                type="text"
                placeholder="(Razón Social a facturar)"
                @blur="validate('factura.razonSocial')"
                :class="{ 'input-error': errores['factura.razonSocial'] }"
              />
              <small v-if="errores['factura.razonSocial']" class="error-msg">
                {{ errores["factura.razonSocial"] }}
              </small>
            </div>
            <div class="col-12 col-lg-6 mb-3">
              <label for="rfcfactura" class="form-label">RFC *</label>
              <input
                id="rfcfactura"
                v-model="ordenTrabajoForm.factura.rfc"
                class="form-control"
                type="text"
                placeholder="(RFC a facturar)"
                @input="ordenTrabajoForm.factura.rfc = ordenTrabajoForm.factura.rfc?.toUpperCase(), validate('factura.rfc')"
                @blur="validate('factura.rfc')"
                :class="{ 'input-error': errores['factura.rfc'] }"
              />
              <small v-if="errores['factura.rfc']" class="error-msg">
                {{ errores["factura.rfc"] }}
              </small>
            </div>
            <div class="col-12 col-lg-6 mb-3">
              <label class="form-label">Uso CFDI *</label>
              <select
                v-model="ordenTrabajoForm.factura.usoCFDI"
                class="form-select"
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
            <div class="col-12 col-lg-6 mb-3">
              <label class="form-label">Régimen fiscal *</label>
              <select
                v-model="ordenTrabajoForm.factura.regimenFiscal"
                class="form-select"
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
              <small v-if="errores['factura.regimenFiscal']" class="error-msg">
                {{ errores["factura.regimenFiscal"] }}
              </small>
            </div>
            <div class="col-12 col-lg-6 mb-3">
              <label for="direccionfiscal" class="form-label">Dirección</label>
              <input
                id="direccionfiscal"
                v-model="ordenTrabajoForm.factura.direccion"
                class="form-control"
                type="text"
                placeholder="(Domicilio)"
              />
            </div>
            <div class="col-12 col-lg-6 mb-3">
              <label for="cpfactura" class="form-label">Código postal *</label>
              <input
                id="cpfactura"
                v-model="ordenTrabajoForm.factura.cp"
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
            <div class="col-12 col-lg-6 mb-3">
              <label for="correofactura" class="form-label">Correo *</label>
              <input
                id="correofactura"
                v-model="ordenTrabajoForm.factura.eMail"
                class="form-control"
                type="text"
                placeholder="(Use un correo válido)"
                @input="validate('factura.eMail')"
                @blur="validate('factura.eMail')"
                :class="{ 'input-error': errores['factura.eMail'] }"
              />
              <small v-if="errores['factura.eMail']" class="error-msg">
                {{ errores["factura.eMail"] }}
              </small>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="row my-3">
        <div class="col-4">
          <h5>Desechar Llantas</h5>
        </div>
        <div v-if="hayLlantas" class="col-8">
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
        <div v-else class="col-8">No aplica</div>
      </div>
      <hr />

      <div class="row">
        <div class="col-4">
          <h5>Insumos</h5>
        </div>
        <div class="col-8">
          <div class="row" id="tablaInsumos">
            <table class="table table-hover table-sm">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style="text-align: center">Cantidad</th>
                  <th style="text-align: right">Precio Unit.</th>
                  <th style="text-align: right">Subtotal</th>
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
                    <td style="text-align: center">{{ llanta.cantidad }}</td>
                    <td style="text-align: right">
                      {{
                        llanta.precioUnitario.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td style="text-align: right">
                      <div v-if="llanta.idPromocion || llanta.idPromocionVuelo">
                        <span class="text-decoration-line-through text-muted">
                          {{
                            (
                              llanta.cantidad * llanta.precioUnitario
                            ).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </span>
                        <br />
                        <span>
                          <small class="badge bg-danger mt-1">
                            {{ llanta.promo?.nombre || "Promocion Aplicada" }}
                          </small>
                        </span>
                        <br />
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
                          Number(
                            llanta.cantidad * llanta.precioUnitario,
                          ).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                    <td>
                      <button
                        class="btn btn-sm"
                        :class="
                          llanta.eliminado
                            ? 'btn-outline-success'
                            : 'btn-outline-danger'
                        "
                        @click="eliminarInsumo('llanta', index)"
                        type="button"
                      >
                        <i
                          :class="
                            llanta.eliminado
                              ? 'bi bi-arrow-counterclockwise'
                              : 'bi bi-x-circle'
                          "
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
                    <td style="text-align: center">{{ paquete.cantidad }}</td>
                    <td style="text-align: right">
                      {{
                        paquete.precioUnitario.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td style="text-align: right">
                      <!--check-->
                      <div
                        v-if="paquete.idPromocion || paquete.idPromocionVuelo"
                      >
                        <span class="text-decoration-line-through text-muted">
                          {{
                            (
                              paquete.cantidad * paquete.precioUnitario
                            ).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </span>
                        <br />
                        <span>
                          <small class="badge bg-danger mt-1">
                            {{ paquete.promo?.nombre || "Promocion Aplicada" }}
                          </small>
                        </span>
                        <br />
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
                          Number(
                            paquete.cantidad * paquete.precioUnitario,
                          ).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                    <td>
                      <button
                        class="btn btn-sm"
                        :class="
                          paquete.eliminado
                            ? 'btn-outline-success'
                            : 'btn-outline-danger'
                        "
                        @click="eliminarInsumo('paquete', index)"
                        type="button"
                      >
                        <i
                          :class="
                            paquete.eliminado
                              ? 'bi bi-arrow-counterclockwise'
                              : 'bi bi-x-circle'
                          "
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
                    <td style="text-align: center">{{ detalle.cantidad }}</td>
                    <td></td>
                    <td></td>
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
                    <td style="text-align: center">{{ ad.cantidad }}</td>
                    <td style="text-align: right">
                      {{
                        ad.precioUnitario.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td style="text-align: right">
                      <div v-if="ad.idPromocion || ad.idPromocionVuelo">
                        <span class="text-decoration-line-through text-muted">
                          {{
                            (ad.cantidad * ad.precioUnitario).toLocaleString(
                              "es-MX",
                              { style: "currency", currency: "MXN" },
                            )
                          }}
                        </span>
                        <br />
                        <span>
                          <small class="badge bg-danger mt-1">
                            {{ ad.promo?.nombre || "Promocion Aplicada" }}
                          </small>
                        </span>
                        <br />
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
                          Number(
                            ad.cantidad * ad.precioUnitario,
                          ).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                    <td>
                      <button
                        class="btn btn-sm"
                        :class="
                          ad.eliminado
                            ? 'btn-outline-success'
                            : 'btn-outline-danger'
                        "
                        @click="eliminarInsumo('adicional', index)"
                        type="button"
                      >
                        <i
                          :class="
                            ad.eliminado
                              ? 'bi bi-arrow-counterclockwise'
                              : 'bi bi-trash'
                          "
                        ></i>
                      </button>
                    </td>
                  </tr>
                </template>
              </transition-group>

              <tfoot class="table-light">
               

                <tr class="table-secondary fw-bold">
                  <th colspan="3" class="text-end fs-6">TOTAL</th>
                  <th class="text-end fs-6">
                    {{
                      ordenTrabajoForm.totales.total.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
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
        </div>
      </div>

      <div class="row my-3">
        <div class="col text-end">
          <router-link :to="{ name: 'orden-trabajo-list' }">
            <button
              class="btn btn-primary position-relative shadow mx-3"
              type="button"
              style="width: 140px"
            >
              <i
                class="bi bi-arrow-left-circle-fill position-absolute start-0 ms-2"
              ></i>
              &nbsp;Volver
            </button>
            <!-- Modal vista previa OT :disabled="!formValido" -->
          </router-link>
          <button
            type="button"
            class="btn btn-success position-relative shadow ms-3"
            style="width: 140px"
            :disabled="!formValido"
            
            @click="mostrarVista = true"
          >
            <i class="bi-save-fill position-absolute start-0 ms-2"></i>
            &nbsp;Guardar
          </button>
        </div>
      </div>
    </form>
  </div>

  <!-- Modal vista previa OT -->

  <div
    v-if="mostrarVista"
    class="modal fade show d-block"
    tabindex="-1"
    :style="{ background: 'rgba(0,0,0,0.5)' }"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered modal-1000">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Vista Previa de Orden de trabajo</h4>
        </div>
        <div class="modal-body p-4" :style="{ overflowY: 'auto' }">
          <div class="row gp-2">
            <div class="col-12 col-lg-6 mb-3">
              <div class="card shadow-sm h-100">
                <div class="card-header">
                  <i class="bi bi-car-front-fill me-2"></i> Datos del Vehículo
                </div>
                <div class="card-body">
                  <table style="width: 100%">
                    <tbody>
                      <tr>
                        <td style="font-weight: bold; color: grey">
                          Núm. serie:
                        </td>
                        <td colspan="3">
                          {{ ordenTrabajoForm.vehiculo.serie }}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: grey">Marca:</td>
                        <td>{{ ordenTrabajoForm.vehiculo.marca }}</td>
                        <td style="font-weight: bold; color: grey">Modelo:</td>
                        <td>{{ ordenTrabajoForm.vehiculo.modelo }}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: grey">Color:</td>
                        <td>{{ ordenTrabajoForm.vehiculo.color }}</td>
                        <td style="font-weight: bold; color: grey">
                          Kilometraje:
                        </td>
                        <td>{{ ordenTrabajoForm.vehiculo.kilometraje }}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: grey">Año:</td>
                        <td>{{ ordenTrabajoForm.vehiculo.anio }}</td>
                        <td style="font-weight: bold; color: grey">Placas:</td>
                        <td>{{ ordenTrabajoForm.vehiculo.placas }}</td>
                      </tr>
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
                <div class="card-body">
                  <table style="width: 100%">
                    <tbody>
                      <tr>
                        <td style="font-weight: bold; color: grey">Nombre:</td>
                        <td>
                          {{ ordenTrabajoForm.cliente.nombres }}
                          {{ ordenTrabajoForm.cliente.apellidos }}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: grey">
                          Teléfono:
                        </td>
                        <td>{{ ordenTrabajoForm.cliente.clienteTelefono }}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: grey">Correo:</td>
                        <td>{{ ordenTrabajoForm.cliente.clienteCorreo }}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: grey">RFC:</td>
                        <td>{{ ordenTrabajoForm.cliente.rfc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-3 mx-3">
            <div class="col-12 col-lg-6">
              <strong>Fecha de alta: </strong
              >{{ formatearFecha(ordenTrabajoForm.cliente.fechaAlta) }}
            </div>
            <div class="col-12 col-lg-6">
              <strong>Fecha de entrega propuesta: </strong>
              {{ formatearFecha(ordenTrabajoForm.fechaEntrega) }}
            </div>
            <div class="col-12 mt-1">
              <strong>Técnico seleccionado: </strong> {{ tecnicoSeleccionado }}
            </div>
            <div class="col-12 mt-1">
              <strong>Forma de pago: </strong>
              {{ ordenTrabajoForm.cliente.metodoPago }}
            </div>
            <div class="col-12 mt-1">
              <strong>Desechar llantas antiguas: </strong>
              {{ boolDesecharLlanta ? "Sí" : "No" }}
            </div>
          </div>
          <div v-if="boolFactura" class="card shadow-sm">
            <div class="card-header">
              <i class="bi bi-receipt me-2"></i> Datos de facturación
            </div>
            <div class="card-body">
              <table style="width: 100%">
                <tbody>
                  <tr>
                    <td style="font-weight: bold; color: grey">
                      Razón social:
                    </td>
                    <td>{{ ordenTrabajoForm.factura.razonSocial }}</td>
                    <td style="font-weight: bold; color: grey">RFC:</td>
                    <td>{{ ordenTrabajoForm.factura.rfc }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Uso CFDI:</td>
                    <td>{{ usoCFDITexto }}</td>
                    <td style="font-weight: bold; color: grey">
                      Régimen fiscal:
                    </td>
                    <td>{{ regimenFiscalTexto }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Domicilio:</td>
                    <td>{{ ordenTrabajoForm.factura.direccion }}</td>
                    <td style="font-weight: bold; color: grey">CP:</td>
                    <td>{{ ordenTrabajoForm.factura.cp }}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: grey">Email:</td>
                    <td>{{ ordenTrabajoForm.factura.eMail }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="mx-4 mb-2">El cliente no solicitó factura.</div>
          <div class="card shadow-sm mt-3">
            <div class="card-header">
              <i class="bi bi-nut-fill me-2"></i> Insumos
            </div>
            <div class="card-body">
              <table style="width: 100%">
                <thead>
                  <tr style="background: #f0f0f0; text-align: center">
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>P/U</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in insumosFiltrados.llanta" :key="i.idLlanta">
                    <td>{{ i.descripcion }}</td>
                    <td class="text-center">{{ i.cantidad }}</td>
                    <td class="text-end">
                      {{
                        Number(i.precioUnitario).toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td class="text-end">
                      <div v-if="i.idPromocion || i.idPromocionVuelo">
                        <span
                          class="text-decoration-line-through text-muted me-2"
                        >
                          {{
                            (i.cantidad * i.precioUnitario).toLocaleString(
                              "es-MX",
                              { style: "currency", currency: "MXN" },
                            )
                          }}
                        </span>
                        <br />
                        <span>
                          <small class="badge bg-danger">
                            {{ i.promo.nombre }}
                          </small>
                        </span>
                        <br />
                        <span class="text-success fw-bold mx-2">
                          {{
                            Number(i.subTotal).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </span>
                      </div>
                      <div v-else>
                        {{
                          Number(i.subTotal).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>
                  <template
                    v-for="p in insumosFiltrados.paquete"
                    :key="p.idPaquete"
                  >
                    <tr style="font-weight: bold; background: #fafafa">
                      <td>{{ p.descripcion }}</td>
                      <td class="text-center">{{ p.cantidad }}</td>
                      <td class="text-end">
                        {{
                          Number(p.precioUnitario).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </td>
                      <td class="text-end">
                        <div v-if="p.idPromocion || p.idPromocionVuelo">
                          <span
                            class="text-decoration-line-through text-muted me-2"
                          >
                            {{
                              (p.cantidad * p.precioUnitario).toLocaleString(
                                "es-MX",
                                { style: "currency", currency: "MXN" },
                              )
                            }}
                          </span>
                          <br />
                          <span>
                            <small class="badge bg-danger">
                              {{ p.promo.nombre }}
                            </small>
                            <br />
                          </span>
                          <span class="text-success fw-bold mx-2">
                            {{
                              Number(p.subTotal).toLocaleString("es-MX", {
                                style: "currency",
                                currency: "MXN",
                              })
                            }}
                          </span>
                        </div>
                        <div v-else>
                          {{
                            Number(p.subTotal).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="d in p.detalle"
                      :key="d.idDetalle"
                      style="color: #555"
                    >
                      <td style="padding-left: 20px">↳ {{ d.descripcion }}</td>
                      <td class="text-center">{{ d.cantidad }}</td>
                      <td class="text-end">-</td>
                      <td class="text-end">-</td>
                    </tr>
                  </template>
                  <tr
                    v-for="a in insumosFiltrados.adicional"
                    :key="a.idAdicional"
                  >
                    <td>{{ a.descripcion }}</td>
                    <td class="text-center">{{ a.cantidad }}</td>
                    <td class="text-end">
                      ${{
                        Number(a.precioUnitario).toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td class="text-end">
                      <div v-if="a.idPromocion || a.idPromocionVuelo">
                        <span
                          class="text-decoration-line-through text-muted me-2"
                        >
                          {{
                            (a.cantidad * a.precioUnitario).toLocaleString(
                              "es-MX",
                              { style: "currency", currency: "MXN" },
                            )
                          }}
                        </span>
                        <br />
                        <span>
                          <small class="badge bg-danger">
                            {{ a.promo.nombre }}
                          </small>
                        </span>
                        <br />
                        <span class="text-success fw-bold mx-2">
                          {{
                            Number(a.subTotal).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </span>
                      </div>
                      <div v-else>
                        {{
                          Number(a.subTotal).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>
                  <tr style="font-weight: bold; font-size: larger">
                    <td colspan="3">Total</td>
                    <td style="text-align: right">
                      {{
                        Number(ordenTrabajoForm.totales.total).toLocaleString(
                          "es-MX",
                          {
                            style: "currency",
                            currency: "MXN",
                          },
                        )
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="row text-end">
            <button
              type="button"
              class="btn btn-secondary position-relative shadow mx-3"
              style="width: 140px"
              @click="mostrarVista = false"
            >
              <i class="bi-x-circle-fill position-absolute start-0 ms-2"></i>
              Cerrar
            </button>

               <button type="button" class="btn btn-success position-relative shadow mx-3" style="width: 140px;" @click="guardarOT()"
>
  <i class="bi-save-fill position-absolute start-0 ms-2"></i> 
  Guardar OT
</button>

            </div>
          </div>
        </div>
      </div>
    </div>
</template>





<script setup>
import {
  ref,
  watch,
  getCurrentInstance,
  onMounted,
  reactive,
  nextTick,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import ModalInsumo from "./ModalInsumo.vue";
import ModalBuscarCotizacion from "./ModalBuscarCotizacion.vue";

const router = useRouter();

const { proxy } = getCurrentInstance();
const boolFactura = ref(true);
const boolDesecharLlanta = ref(false);
const showModal = ref(false);
const mostrarVista = ref(false);
const usosCFDI = ref([]);
const regimenFiscal = ref([]);
const loggeduser = JSON.parse(localStorage.getItem("userSession"));
const sucursales = [
  "(Ninguna)",
  "Delta",
  "López Mateos",
  "Torres Landa",
  "Martinica",
];

const props = defineProps({
  idCotizacion: {
    type: [String, Number],
   
    
  },
});

/* VARIABLES PARA VALIDACION DE CAMPOS */
const errores = reactive({});

/* =================== FORMATEO DE FECHAS =================== */

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

const formatearFechaSinHora = (fecha) => {
  if (!fecha) return "";

  const d = new Date(fecha);

  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* =================== HELPER PARA CAMPOS ANIDADOS =================== */

const getValor = (path) => {
  return path.split(".").reduce((obj, key) => obj?.[key], ordenTrabajoForm);
};


function validate(path) {
  const value = (getValor(path) ?? "").toString();

  const rules = {

    
    // -------- VEHÍCULO ----------
    "vehiculo.marca": () =>
      !value.trim() ? "Marca obligatoria." : null,

    "vehiculo.modelo": () =>
      !value.trim() ? "Modelo obligatorio." : null,

    "vehiculo.serie": () =>
      value.trim().length !== 17
        ? "El número de serie (VIN) debe tener 17 caracteres."
    "vehiculo.numSerie": () =>
      value.length < 17 ? "El número de serie (VIN) debe ser de 17 caracteres." : null,

    "vehiculo.kilometraje": () =>
      value === ""
        ? "Kilometraje obligatorio."
        : isNaN(value)
        ? "Debe ser un número."
        : value < 0
        ? "No puede ser negativo."
        : value < kilometrajeBase.value
        ? `No puede ser menor a ${kilometrajeBase.value}.`
        : null,

    "vehiculo.kilometraje": () => {
      if (value === "") return "Kilometraje obligatorio.";

      const num = Number(value);

      if (isNaN(num)) return "Debe ser un número.";
      if (num < 0) return "No puede ser negativo.";
      if (num < kilometrajeBase.value)
        return `No puede ser menor a ${kilometrajeBase.value}.`;

      return null;
    },

    "vehiculo.color": () =>
      !value.trim() ? "Color obligatorio." : null,

    "vehiculo.placas": () =>
      !value.trim() ? "Placas obligatorias." : null,

    "vehiculo.anio": () => {
      if (!value) return "Año obligatorio.";

      const y = parseInt(value);
      const current = new Date().getFullYear();
      const nextyear = current + 1;

      if (isNaN(y)) return "Año no válido.";
      if (y < 1950 || y > nextyear)
        return `Año entre 1950 y ${nextyear}.`;

      return null;
    },

    // -------- CLIENTE ----------
    "cliente.apellidos": () =>
      !value.trim() ? "Apellidos obligatorios." : null,

    "cliente.metodoPago": () =>
      !value ? "Debe seleccionar una forma de pago." : null,

    "cliente.clienteTelefono": () => {
      if (!value.trim())
        return "Debe ingresar un teléfono.";

      // 🔥 LIMPIEZA (igual que tu computed)
      let soloNumeros = value.replace(/\D/g, "");

      // Limitar a 10 dígitos
      soloNumeros = soloNumeros.slice(0, 10);

      // Guardar limpio en el modelo
      ordenTrabajoForm.cliente.clienteTelefono = soloNumeros;

      // Validaciones
      if (soloNumeros.length !== 10)
        return "El teléfono debe tener exactamente 10 dígitos.";

      return null;
    },

    "cliente.clienteCorreo": () => {
      if (!value.trim()) return null;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value)
        ? "E-mail no válido."
        : null;
    },

    "cliente.rfc": () => {
      if (!value.trim()) return null;
      const limpio = value.toUpperCase().trim();

      const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;

      return !rfcRegex.test(limpio)
        ? "RFC no válido."
        : null;
    },

    // -------- FECHA ----------
    "fechaEntrega": () => {
      if(value.length == 0) {
        console.log(value);
        return "Debe ingresar un teléfono " + value;
      } else {
      const soloNumeros = value.replace(/\D/g, "");
      console.log(soloNumeros);
      return (!value || soloNumeros.length < 10)
        ? "Teléfono no válido."
        : null;
      }
    },

    "cliente.clienteCorreo": () => {
      if(value.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (!emailRegex.test(value))
        ? "E-mail no válido."
        : null;
      } else {
        return null;
      }
    },

    "fechaEntrega": () => {
      if (!ordenTrabajoForm.fechaEntrega)
        return "La fecha y hora de entrega son obligatorias.";

      const entrega = new Date(ordenTrabajoForm.fechaEntrega);
      const ahora = new Date();

      if (entrega < ahora)
        return "La fecha de entrega no puede ser menor a la actual.";

      return null;
    },

    // -------- EMPLEADO ----------
    "idEmpleado": () =>
      !ordenTrabajoForm.idEmpleado || ordenTrabajoForm.idEmpleado === 0
        ? "Debes seleccionar un técnico."
        : null,

    // -------- FACTURA ----------
    "factura.razonSocial": () =>
      !value.trim() ? "Razón social obligatoria." : null,
      !value || !value.trim()
        ? "Razón social obligatoria."
        : null,

    "factura.usoCFDI": () =>
      !value ? "Debe seleccionar un uso CFDI." : null,
      !value
        ? "Debe seleccionar un uso CFDI."
        : null,

    "factura.regimenFiscal": () =>
      !value ? "Debe seleccionar un régimen fiscal." : null,

    "factura.eMail": () => {
      if (!value.trim()) return "Correo obligatorio.";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value)
        ? "E-mail no válido."
        : null;
    },
      },

    "factura.cp": () => {
      if (!value.trim()) return "Código postal obligatorio.";

      const cpRegex = /^\d{5}$/;
      return !cpRegex.test(value)
        ? "El código postal debe tener 5 dígitos."
        : null;
    },

    "factura.rfc": () => {
      if (!value.trim()) return "RFC obligatorio.";

      const limpio = value.toUpperCase().trim();
      const rfcRegex =
        /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;

      return !rfcRegex.test(value.toUpperCase())
        ? "RFC no válido."
        : null;
    },
  };

  const error = rules[path] ? rules[path]() : null;

  if (error) errores[path] = error;
  else delete errores[path];
}

// Mantiene el botón de guardar deshabilitado hasta que no exista ningún error de validación
const formValido = computed(() => {
  // Si hay errores → inválido
  if (Object.keys(errores).length > 0) return false;
  // Campos obligatorios SIEMPRE
  const requiredFields = [
    ordenTrabajoForm.fechaEntrega,

    // CLIENTE
    ordenTrabajoForm.cliente.clienteTelefono,
    //ordenTrabajoForm.cliente.clienteCorreo,
    ordenTrabajoForm.cliente.metodoPago,

    // VEHÍCULO
    ordenTrabajoForm.vehiculo.marca,
    ordenTrabajoForm.vehiculo.modelo,
    ordenTrabajoForm.vehiculo.numSerie,
    ordenTrabajoForm.vehiculo.kilometraje,
    ordenTrabajoForm.vehiculo.color,
    ordenTrabajoForm.vehiculo.placas,
    ordenTrabajoForm.vehiculo.anio,

    // TÉCNICO
    ordenTrabajoForm.idEmpleado,
  ];

  // 3️⃣ Campos obligatorios SOLO si se desea factura
  const facturaRequired = boolFactura.value === true
    ? [
        ordenTrabajoForm.factura.razonSocial,
        ordenTrabajoForm.factura.usoCFDI,
        ordenTrabajoForm.factura.regimenFiscal,
        ordenTrabajoForm.factura.eMail,
        ordenTrabajoForm.factura.cp,
        ordenTrabajoForm.factura.rfc,
      ]
    : [];
  

  // 4️⃣ Validación final (no vacío / no null)
  return [...requiredFields, ...facturaRequired].every(
    (v) => v !== "" && v !== null && v !== undefined
  );
});
const getFechaHoraLocal = () => {
  const ahora = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(
    ahora.getDate(),
  )}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
};

const fechaEntregaFecha = ref("");
const fechaEntregaHora = ref("");

const tecnicoSeleccionado = computed(() => {
  const emp = itmEmpleados.value.find(
    (e) => e.idEmpleado === ordenTrabajoForm.idEmpleado,
  );

  if (!emp) return "";

  return `(${emp.puesto}) ${emp.nombres} ${emp.apePaterno}`;
});

const usoCFDITexto = computed(() => {
  const uso = usosCFDI.value.find(
    (u) => u.idUsoCFDI === ordenTrabajoForm.factura.usoCFDI,
  );

  return uso ? `${uso.codigo} - ${uso.descripcion}` : "";
});

const regimenFiscalTexto = computed(() => {
  const regimen = regimenFiscal.value.find(
    (r) => r.idRegimenFiscal === ordenTrabajoForm.factura.regimenFiscal,
  );

  return regimen ? `${regimen.codigo} - ${regimen.descripcion}` : "";
});

const hayLlantas = computed(() => {
  var resp = false;
  ordenTrabajoForm?.insumo?.llanta?.forEach((l) => {
    !l.eliminado ? (resp = true) : (resp = resp);
  });
  return resp;
});

const ordenTrabajoForm = reactive({
  cotSeleccionada: 0,
  idCotPadre:0,
  idEmpleado: 0,
  idTipoOrdenTrabajo: 0,
  fechaEntrega: "",
  esHija: 0,
  idOtPAdre: 0,
  cliente: {
    id_cliente: 0,
    nombres: "",
    apellidos: "",
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
    regimenFiscal: "",
  },
  insumo: {
    llanta: [],
    paquete: [],
    adicional: [],
  },
  totales: {
    subtotal: 0,
    descuento: 0,
    iva: 0,
    total: 0,
  },
});

const irAOrdenTrabajo = (id) => {
  const otCreada = !!id;

  router.push({ 
    name: "orden-trabajo-work", 
    params: { id },
    state: { otCreada: otCreada }
  });
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

const itmEmpleados = ref({});
const itmTipoOT = ref([]);

const onOrdenTrabajoSeleccionada = async (props) => {
  if (props.idOrdenTrabajo != null) {
    //preparar el fetch
  }
};

const onCotizacionSeleccionada = async (idCotizacion) => {
  ordenTrabajoForm.cotSeleccionada = idCotizacion;
  await cargarInfoCotizacion();
};

const cargarEmpleados = async () => {
  const userSession = JSON.parse(localStorage.getItem("userSession"));
  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/Empleado/getEmpleado?idSucursal=" +
        userSession.usuario.idSucursal,
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

const cargarUsosCFDI = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/OrdenTrabajo/getUsosCFDI");
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    usosCFDI.value = result.data;
  } catch (error) {
    console.error("Error al cargar usos CFDI:", error);
  }
};

const cargarRegimenFiscal = async () => {
  try {
    const res = await fetch(
      proxy.$serverIP + "api/OrdenTrabajo/getRegimenFiscal",
    );
    if (!res.ok) throw new Error("Error en la respuesta");

    const result = await res.json();
    regimenFiscal.value = result.data;
  } catch (error) {
    console.error("Error al cargar el régimen fiscal:", error);
  }
};

const cargarTipoOT = async () => {
  try {
    const res = await fetch(
      proxy.$serverIP + "api/TipoOrdenTrabajo/getTipoOrdenTrabajo",
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
  cargarEmpleados();
  cargarTipoOT();
  cargarUsosCFDI();
  cargarRegimenFiscal();
  normalizarInsumos();
  normalizarLlantas();

  // asignar por default  la fecha actual
  fechaEntregaFecha.value = new Date().toISOString().split("T")[0];
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
        serie,
      )}`,
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
    (s) => s.serie === ordenTrabajoForm.vehiculo.serie,
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
      }api/Cliente/sugerenciaCliente?texto=${encodeURIComponent(texto)}`,
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
  ordenTrabajoForm.cliente.apellidos =
    cliente.apPaterno + " " + cliente.apMaterno;
  ordenTrabajoForm.cliente.nombres = cliente.nombres;
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

    // Coincidencias parciales o exactas
    return (
      nombreCompleto.includes(normalizado) ||
      normalizado.includes(nombreCompleto) ||
      telefono === normalizado ||
      //normalizado.includes(telefono) ||
      correo === normalizado
      //||  normalizado.includes(correo)
    );
  });


  if (cliente) {
    // console.log('clienteSeleccionado');
    onClienteSeleccionado(cliente);
  }
};

/***************************/
// FUNCIONES INSUMOS

const insumosFiltrados = computed(() => ({
  ...ordenTrabajoForm.insumo,
  llanta: (ordenTrabajoForm.insumo.llanta || []).filter((l) => !l.eliminado),
  paquete: (ordenTrabajoForm.insumo.paquete || []).filter((p) => !p.eliminado),
  adicional: (ordenTrabajoForm.insumo.adicional || []).filter(
    (a) => !a.eliminado,
  ),
}));

const eliminarInsumo = (tipo, index) => {
  const item = ordenTrabajoForm.insumo[tipo][index];
  if (!item) return;

  // Inicializa si no existe
  if (item.eliminado === undefined) {
    item.eliminado = false;
  }

  // Toggle: eliminar / restaurar
  item.eliminado = !item.eliminado;
  calcularTotales();
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
  ordenTrabajoForm.insumo.llanta = ordenTrabajoForm.insumo.llanta
    .filter((l) => l) // elimina undefined
    .map((l) => ({
      ...l,
      eliminado: l.eliminado ?? false,
    }));
};

const validarYMostrarPreview = async () => {
  const errores = [];

  // Vehículo
  if (!ordenTrabajoForm.vehiculo.serie)
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
                    2,
                  )}</td>
                  <td style="text-align:right">$${i.subTotal}</td>
                </tr>
              `,
                )
                .join("")}

              ${ordenTrabajoForm.insumo.paquete
                .map(
                  (p) => `
                <tr style="font-weight:bold; background:#fafafa;">
                  <td>${p.descripcion}</td>
                  <td style="text-align:center">${p.cantidad}</td>
                  <td style="text-align:right">$${p.precioUnitario.toFixed(
                    2,
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
                      2,
                    )}</td>
                    <td style="text-align:right">$${d.subTotal}</td>
                  </tr>
                `,
                  )
                  .join("")}
              `,
                )
                .join("")}

              ${ordenTrabajoForm.insumo.adicional
                .map(
                  (a) => `
                <tr>
                  <td>${a.descripcion}</td>
                  <td style="text-align:center">${a.cantidad}</td>
                  <td style="text-align:right">$${Number(
                    a.precioUnitario,
                  ).toFixed(2)}</td>
                  <td style="text-align:right">$${a.subTotal}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>

        </table>
    `;
};

const guardarOT = async () => {
  try {
    const userStorage = localStorage.getItem("userSession");

    const dataUser = JSON.parse(userStorage)
    console.log('Entró');

    let factura = {};
    const esValido = validaciones();

    if (!esValido) return;

    
      console.log(" Formulario válido");

    let insumosSelec = ({
    ...ordenTrabajoForm.insumo,
    llanta: (ordenTrabajoForm.insumo.llanta || []).filter(l => !l.eliminado),
    paquete: (ordenTrabajoForm.insumo.paquete || []).filter(p => !p.eliminado),
    adicional: (ordenTrabajoForm.insumo.adicional || []).filter(a => !a.eliminado)
  })

    if (boolFactura.value) {
      factura = {
        razonSocial: ordenTrabajoForm.factura.razonSocial,
        direccion: ordenTrabajoForm.factura.direccion,
        rfc: ordenTrabajoForm.factura.rfc,
        eMail: ordenTrabajoForm.factura.eMail,
        cp: ordenTrabajoForm.factura.cp,
        usoCFDI: ordenTrabajoForm.factura.usoCFDI,
        regimenFiscal: ordenTrabajoForm.factura.regimenFiscal,
      };
    } else {
      factura = {
        razonSocial: '',
        direccion: '',
        rfc: '',
        eMail: '',
        cp: '',
        usoCFDI: null,
        regimenFiscal: null,
      };
    }

    const objSeend = {
      idUsuario: dataUser.usuario.idUsuario,
      idSucursal: dataUser.usuario.idSucursal,
      idCotizacion: ordenTrabajoForm.cotSeleccionada,
      idEmpleado: ordenTrabajoForm.idEmpleado,
      idTipoOrdenTrabajo: ordenTrabajoForm.idTipoOrdenTrabajo,
      metodoPago: ordenTrabajoForm.cliente.metodoPago,
      fechaAlta: ordenTrabajoForm.cliente.fechaAlta,
      fechaEntrega: ordenTrabajoForm.fechaEntrega,
      requiereFactura: boolFactura.value,
      desecharLlanta: boolDesecharLlanta.value,
      descripcion: "",
      estado: "Creado",
      cliente: {
        idCliente: ordenTrabajoForm.cliente.id_cliente,
        nombres: ordenTrabajoForm.cliente.nombres ? ordenTrabajoForm.cliente.nombres : "",
        apellidos: ordenTrabajoForm.cliente.apellidos,
        rfc: ordenTrabajoForm.cliente.rfc ? ordenTrabajoForm.cliente.rfc : "",
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
      insumos: insumosSelec
    };

      console.log(" OBJETO FINAL:", objSeend);

      // 🔹 FETCH
      console.log(" Enviando request...");

      const res = await fetch(`${proxy.$serverIP}api/OrdenTrabajo/crearOT`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objSeend),
      });

      console.log(" Status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error(" Error HTTP:", text);
        alert("Error en el servidor");
        return;
      }

      const data = await res.json();
      console.log(" Respuesta:", data);

      if (data.success) {
        //console.log(data)
        limpiarOrdenTrabajoForm(); // Limpia formulario
        //console.log(data.codigo);
        irAOrdenTrabajo(data.codigo);         // Redirige
      } else {
        console.warn(" Backend respondió error:", data);
        alert(data.message || "No se pudo guardar la orden");
      }
  } catch (err) {
    console.error(" Error general:", err);
    alert("Error inesperado al guardar");
  }
};

const obtenerPromosPorInventario = async (idInventarioInicial) => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionPorInventario?idInventario=${idInventarioInicial}`,
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
      `${proxy.$serverIP}api/Promocion/getPromocionPoridPaquete?idPaquete=${idPaquete}`,
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
      `${proxy.$serverIP}api/Promocion/getPromocionesGenerales`,
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

const cargarInfoCotizacion = async () => {
  if (!ordenTrabajoForm.cotSeleccionada) return;
 
  let serverController = "getCotizacionById";

if (props.idOrdenTrabajo ) {
  console.log("id_ot:", props.idOrdenTrabajo);
  serverController = "getOrdenDerivada";
  ordenTrabajoForm.esHija=1; // si se manda una OT se marcara como hija
  ordenTrabajoForm.idOtPAdre = props.idOrdenTrabajo;

} else if (props.idCotizacion ) {
  serverController = "getCotizacionById";
}
  console.log("ids:", props.idOrdenTrabajo, "\n id_cot:",props.idCotizacion);
  const res = await fetch(
    proxy.$serverIP +
      "api/OrdenTrabajo/" +
      serverController +
      "?id=" +
      ordenTrabajoForm.cotSeleccionada,
  );

  if (!res.ok) throw new Error("Error en la respuesta");

  const data = await res.json();

  // console.log(JSON.stringify(data))
  ordenTrabajoForm.cotSeleccionada = data.idCotizacion || 0;
  
  //cliente
   ordenTrabajoForm.cliente.id_cliente = data?.clienteOT?.idCliente || 0;
  ordenTrabajoForm.cliente.metodoPago = data?.metodoPago;
  ordenTrabajoForm.cliente.clienteNombre =
    data?.clienteNombre || data?.clienteOT?.nombreCompleto || "";
  ordenTrabajoForm.cliente.nombres =
    data.nombres || data.clienteOT?.nombres || "";
  ordenTrabajoForm.cliente.apellidos = `${
    data?.apPaterno || data?.clienteOT?.apPaterno || ""
  } ${data?.apMaterno || data?.clienteOT?.apMaterno || ""}`.trim();
  ordenTrabajoForm.cliente.clienteTelefono =
    data?.telefono || data?.clienteOT?.telefono || "";
  ordenTrabajoForm.cliente.clienteCorreo =
    data?.correo || data?.clienteOT?.correo || "";

  //vehiculo --> Esto es por si se creara una rama de la OT
  if (data?.vehiculo) {
    console.log("Hay vehiculo");
    ordenTrabajoForm.vehiculo = data.vehiculo;
    console.log(ordenTrabajoForm.vehiculo)
  }
  //empleado (OT)
  ordenTrabajoForm.idEmpleado= data.empleadoOT?.idEmpleado;
  ordenTrabajoForm.factura.razonSocial = data.razonSocial || "";
  ordenTrabajoForm.factura.direccion = data.direccion;
  ordenTrabajoForm.factura.rfc = data.rfc || "";
  ordenTrabajoForm.factura.eMail = data.eMail || "";
  ordenTrabajoForm.factura.cp = data.cp || "";
  ordenTrabajoForm.factura.usoCFDI = data.usoCFDI || 0;
  ordenTrabajoForm.factura.regimenFiscal = data.regimenFiscal || 0;

  ordenTrabajoForm.insumo = {
    llanta: await Promise.all(
      data?.llantas.map(async (llanta) => {
        const promosDisponibles = await obtenerPromosPorInventario(
          llanta.idInventarioInicial,
        );
        const promocionExistente = {
          idPromocion: llanta?.idPromocion || llanta?.idPromocionVuelo || 0,
          valor: llanta?.valorPromocion || llanta?.valorPromocionVuelo || 0,
          tipo: llanta?.tipoPromocion || llanta?.tipoPromocionVuelo || null,
          nombre: llanta?.nombrePromocion || llanta?.nombrePromocionVuelo || "",
        };

        return {
          idLlanta: llanta.idLlanta,
          idAlmacen: llanta.idAlmacen,
          idPromocion: llanta.idPromocion || null,
          idPromocionVuelo: llanta.idPromocionVuelo || null,
          idPromocionSeleccionada:
            llanta?.idPromocion || llanta?.idPromocionVuelo || 0,
          idConceptoTrabajo: 1,
          idInventarioInicial: llanta.idInventarioInicial, // para buscar promo

          descripcion: llanta.modeloMedidas,
          medida: llanta.medida, // campo estetico
          modelo: llanta.modelo, // campo estetico
          marca: llanta.marca, // campo estetico
          ubicacion: llanta.ubicacion, // campo estetico

          cantidad: llanta.cantidad,
          precioUnitario: llanta.precioUnitario,
          subTotal: (
            llanta.cantidad *
            precioFinalItem({
              precioUnitario: llanta.precioUnitario,
              idPromocion:
                llanta.idPromocion != null
                  ? llanta.idPromocion
                  : llanta.idPromocionVuelo,
              valorPromocion:
                llanta.valorPromocion != null
                  ? llanta.valorPromocion
                  : llanta.valorPromocionVuelo,
              tipoPromocion:
                llanta.tipoPromocion != null
                  ? llanta.tipoPromocion
                  : llanta.tipoPromocionVuelo,
            })
          ).toFixed(2), // campo estetico

          promosDisponibles: promosDisponibles || [],
          esAlVuelo: llanta.idPromocionVuelo != 0 ? true : false,
          // si ya tiene promo existente rellenar valores
          promo: promocionExistente,
        };
      }),
    ),
    paquete: await Promise.all(
      data.paquetes.map(async (paquete) => {
        const promosDisponibles =
          (await obtenerPromosPorPaquete(paquete.idPaquete)) || [];
        const promocionExistente = {
          idPromocion: paquete?.idPromocion || paquete?.idPromocionVuelo || 0,
          valor: paquete?.valorPromocion || paquete?.valorPromocionVuelo || 0,
          tipo: paquete?.tipoPromocion || paquete?.tipoPromocionVuelo || null,
          nombre:
            paquete?.nombrePromocion || paquete?.nombrePromocionVuelo || "",
        };
        return {
          idPaquete: paquete.idPaquete,
          idPromocion: paquete?.idPromocion || null,
          idConceptoTrabajo: 0,
          idPromocionVuelo: paquete?.idPromocionVuelo || null,
          idPromocionSeleccionada:
            paquete?.idPromocion || paquete?.idPromocionVuelo || 0,
          descripcion: paquete.nombre,
          cantidad: 1,
          precioUnitario: paquete.precioUnitario,

          subTotal: (
            1 *
            precioFinalItem({
              precioUnitario: paquete.precioUnitario,
              idPromocion:
                paquete.idPromocion != null
                  ? paquete.idPromocion
                  : paquete.idPromocionVuelo,
              valorPromocion:
                paquete.valorPromocion != null
                  ? paquete.valorPromocion
                  : paquete.valorPromocionVuelo,
              tipoPromocion:
                paquete.tipoPromocion != null
                  ? paquete.tipoPromocion
                  : paquete.tipoPromocionVuelo,
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

          promosDisponibles: promosDisponibles || [],
          esAlVuelo: paquete.idPromocionVuelo != 0 ? true : false,
          // info histórica (si viene de backend)
          promo: promocionExistente,
        };
      }),
    ),

    adicional: await Promise.all(
      data.servicios.map(async (s) => {
        const promosDisponibles =
          (await obtenerPromosGeneralesParaServicio()) || [];
        const promocionExistente = {
          idPromocion: s?.idPromocion || s?.idPromocionVuelo || 0,
          valor: s?.valorPromocion || s?.valorPromocionVuelo || 0,
          tipo: s?.tipoPromocion || s?.tipoPromocionVuelo || null,
          nombre: s?.nombrePromocion || s?.nombrePromocionVuelo || "",
        };
        return {
          idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
          idPromocion: s?.idPromocion || null,
          idConceptoTrabajo: 7,
          idPromocionVuelo: s?.idPromocionVuelo || null,
          idPromocionSeleccionada: s?.idPromocion || s?.idPromocionVuelo || 0,
          descripcion: s.descripcion,
          observacion: s.observacion,
          comentario: s.comentario,

          cantidad: s.cantidad,
          precioUnitario: s.precioUnitario,

          subTotal: (
            s.cantidad *
            precioFinalItem({
              precioUnitario: s.precioUnitario,
              idPromocion:
                s.idPromocion != null ? s.idPromocion : s.idPromocionVuelo,
              valorPromocion:
                s.valorPromocion != null
                  ? s.valorPromocion
                  : s.valorPromocionVuelo,
              tipoPromocion:
                s.tipoPromocion != null
                  ? s.tipoPromocion
                  : s.tipoPromocionVuelo,
            })
          ).toFixed(2),

          promosDisponibles: promosDisponibles || [],
          esAlVuelo: s.idPromocionVuelo != 0 ? true : false,
          // info histórica
          promo: promocionExistente,
        };
      }),
    ),
  };

  calcularTotales();
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
  ordenTrabajoForm.vehiculo.serie = "";
  ordenTrabajoForm.vehiculo.kilometraje = "";
  ordenTrabajoForm.vehiculo.color = "";
  ordenTrabajoForm.vehiculo.placas = "";

  ordenTrabajoForm.factura.razonSocial = "";
  ordenTrabajoForm.factura.direccion = "";
  ordenTrabajoForm.factura.rfc = "";
  ordenTrabajoForm.factura.eMail = "";
  ordenTrabajoForm.factura.cp = "";
  ordenTrabajoForm.factura.usoCFDI = "";
  ordenTrabajoForm.factura.regimenFiscal = "";

  ordenTrabajoForm.insumo = {
    llanta: [],
    paquete: [],
    adicional: [],
  };
};

const calcularTotales = () => {
  const totalLlantas = ordenTrabajoForm.insumo.llanta.reduce(
    (acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0),
    0,
  );

  const totalPaquetes = ordenTrabajoForm.insumo.paquete.reduce(
    (acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0),
    0,
  );

  const totalAdicionales = ordenTrabajoForm.insumo.adicional.reduce(
    (acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0),
    0,
  );

  const subtotal = totalLlantas + totalPaquetes + totalAdicionales;
  const descuento = ordenTrabajoForm.totales.descuento || 0;
  const iva = (subtotal - descuento) * 0.16;

  ordenTrabajoForm.totales.subtotal = Number(subtotal.toFixed(2));
  ordenTrabajoForm.totales.iva = Number(iva.toFixed(2));
  ordenTrabajoForm.totales.total = Number(
    //(subtotal - descuento + iva).toFixed(2)
    (subtotal - descuento).toFixed(2),
  );
};

// observa idCotizacion prop, en cuanto se envie un valor nuevo actualiza y carga la informacion de la cotizacion
watch(
  () => [props.idCotizacion, props.idOrdenTrabajo],
  async ([idCot, idOt]) => {
    console.log("IDCOT:",idCot , "IDOT",idOt)
    let id = null;

    if (idOt != null) {
      id = idOt;
    } else if (idCot != null) {
      id = idCot;
    }

    // Si no hay ningún id, no hacer nada
    if (id == null) return;

    // Solo entra aquí si realmente hay un id válido
    ordenTrabajoForm.cotSeleccionada = id;
    await cargarInfoCotizacion();
  },
  { immediate: true }
);

watch(boolFactura, (nuevoValor) => {
  if (!nuevoValor) {
    delete errores["factura.razonSocial"];
    delete errores["factura.usoCFDI"];
    delete errores["factura.regimenFiscal"];
    delete errores["factura.eMail"];
    delete errores["factura.cp"];
    delete errores["factura.rfc"];
  }
});

const actualizarInsumos = (payload) => {
  // payload = { insumo, totales }
console.log("INUMOS:",payload);
  ordenTrabajoForm.insumo.llanta = payload.insumo.llanta;
  ordenTrabajoForm.insumo.paquete = payload.insumo.paquete;
  ordenTrabajoForm.insumo.adicional = payload.insumo.adicional;

  ordenTrabajoForm.totales.subtotal = payload.totales.subtotal;
  ordenTrabajoForm.totales.descuento = payload.totales.descuento;
  ordenTrabajoForm.totales.iva = payload.totales.iva;
  ordenTrabajoForm.totales.total = payload.totales.total;
};

function validarCampo(campo, valor) {

  const v = (valor ?? "").toString(); // 🔥 ESTA LÍNEA ES LA CLAVE

  switch (campo) {
    case "vehiculo.kilometraje": {
      const limpio = v.replace(/\D/g, ""); //  usar v, NO valor

      if (!limpio) {
        errores[campo] = "Kilometraje requerido";
      } else {
        delete errores[campo];
      }

      ordenTrabajoForm.vehiculo.kilometraje = limpio;
      break;
    }
  }
}

// Mantiene el botón de guardar deshabilitado hasta que no exista ningún error de validación
const formValido = computed(() => {
  // Si hay errores → inválido
  if (Object.keys(errores).length > 0) return false;
  // Campos obligatorios SIEMPRE
  const requiredFields = [
    ordenTrabajoForm.fechaEntrega,

    // CLIENTE
    ordenTrabajoForm.cliente.clienteTelefono,
    ordenTrabajoForm.cliente.metodoPago,

    // VEHÍCULO
    ordenTrabajoForm.vehiculo.marca,
    ordenTrabajoForm.vehiculo.modelo,
    ordenTrabajoForm.vehiculo.serie,
    ordenTrabajoForm.vehiculo.kilometraje,
    ordenTrabajoForm.vehiculo.color,
    ordenTrabajoForm.vehiculo.placas,
    ordenTrabajoForm.vehiculo.anio,

    // TÉCNICO
    ordenTrabajoForm.idEmpleado,
  ];

  // 3️⃣ Campos obligatorios SOLO si se desea factura
  if (boolFactura.value === true) {
    requiredFields.push(
      ordenTrabajoForm.factura.razonSocial,
      ordenTrabajoForm.factura.usoCFDI,
      ordenTrabajoForm.factura.eMail,
      ordenTrabajoForm.factura.cp,
      ordenTrabajoForm.factura.rfc
    );
  }

  // 4️⃣ Validación final (no vacío / no null)
  return requiredFields.every(
    (v) => v !== "" && v !== null && v !== undefined
  );
});


function validaciones() {

  const campos = [
    "vehiculo.serie",
    "vehiculo.marca",
    "vehiculo.modelo",
    "vehiculo.color",
    "vehiculo.kilometraje",
    "vehiculo.anio",
    "vehiculo.placas",
    "cliente.clienteTelefono",
    "cliente.clienteCorreo",
  ];

  const nombresBonitos = {
    "vehiculo.numSerie": "Número de serie",
    "vehiculo.marca": "Marca",
    "vehiculo.modelo": "Modelo",
    "vehiculo.color": "Color",
    "vehiculo.kilometraje": "Kilometraje",
    "vehiculo.anio": "Año",
    "vehiculo.placas": "Placas",
    "cliente.clienteTelefono": "Teléfono",
    "cliente.clienteCorreo": "Correo",
    "cliente.rfc": "RFC",
  };

  // 🔹 Ver estado completo del form
  console.log(" ordenTrabajoForm:", JSON.parse(JSON.stringify(ordenTrabajoForm)));

  // limpiar errores
  Object.keys(errores).forEach(k => delete errores[k]);

  campos.forEach(campo => {
    const valor = campo.split(".").reduce((o, k) => o?.[k], ordenTrabajoForm);

    console.log(` Campo: ${campo} →`, valor);

    validarCampo(campo, valor);
  });

  // 🔹 Teléfono
  const telefonoRaw = ordenTrabajoForm.cliente.clienteTelefono;
  const telefono = telefonoRaw?.replace(/\D/g, "");

  console.log(" Teléfono raw:", telefonoRaw);
  console.log("Teléfono limpio:", telefono);

  if (!telefono || telefono.length !== 10) {
    console.warn(" Teléfono inválido");
    errores["cliente.clienteTelefono"] = "Debe tener 10 dígitos";
  }

  // 🔹 Correo
  const correo = ordenTrabajoForm.cliente.clienteCorreo;
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  console.log(" Correo:", correo);
  console.log("¿Correo válido?:", regexCorreo.test(correo));

  if (!correo || !regexCorreo.test(correo)) {
    console.warn(" Correo inválido");
    errores["cliente.clienteCorreo"] = "Correo inválido";
  }

  // 🔹 RFC
  const rfc = ordenTrabajoForm.cliente.rfc;
  console.log("RFC:", rfc);

  if (rfc && rfc.length < 12) {
    console.warn(" RFC inválido");
    errores["cliente.rfc"] = "RFC inválido";
  }

  //  Resultado final
  console.log("ERRORES FINALES:", errores);

  if (Object.keys(errores).length > 0) {
    let mensaje = "Corrige los siguientes campos:\n\n";

    for (const campo in errores) {
      console.log(` ${campo}:`, errores[campo]);
      mensaje += `• ${nombresBonitos[campo] || campo}: ${errores[campo]}\n`;
    }

    console.log(" VALIDACIONES FALLARON");
    alert(mensaje);
    return false;
  }

  console.log(" VALIDACIONES OK");
  console.log(" ===== FIN VALIDACIONES =====");

  return true;
}



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
