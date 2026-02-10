<template>
  <div class="container p-4 bs-body">
    <form>
      <div class="row my-3">
        <h2 class="text-start">Nueva Orden de Trabajo</h2>
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
            <div class="card-header" style="font-size: 14pt;">
              <i class="bi bi-car-front-fill me-2"></i> Vehículo
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-6 mb-3">
                  <label for="sumserie" class="form-label">Núm. Serie *</label>
                <input id="numserie"
                  v-model="ordenTrabajoForm.vehiculo.numSerie"
                  @input="onSerieInput($event.target.value)"
                  @change="onSerieSeleccionada"
                  list="vehiculos"
                  placeholder="(17 caracteres)"
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
              <div class="col-6 mb-3">
                <label for="marca" class="form-label">Marca *</label>
                <input id="marca"
                  v-model="ordenTrabajoForm.vehiculo.marca"
                  class="form-control"
                  type="text"
                  placeholder="Marca"
                  @blur="validate('vehiculo.marca')"
                  :class="{ 'input-error': errores['vehiculo.marca'] }"
                />
                <small v-if="errores['vehiculo.marca']" class="error-msg">
                  {{ errores["vehiculo.marca"] }}
                </small>
              </div>
              <div class="col-6 mb-3">
                <label for="modelo" class="form-label">Modelo *</label>
                <input id="modelo"
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
              <div class="col-6 mb-3">
                <label for="color" class="form-label">Color *</label>
                <input id="color"
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
              <div class="col-6 mb-3">
                <label for="kilometraje" class="form-label">Kilometraje *</label>
                <input id="kilometraje"
                  v-model="ordenTrabajoForm.vehiculo.kilometraje"
                  class="form-control"
                  type="number"
                  placeholder="(Kilometraje actual)"
                  @blur="validate('vehiculo.kilometraje')"
                  :class="{ 'input-error': errores['vehiculo.kilometraje'] }"
                />
                <small v-if="errores['vehiculo.kilometraje']" class="error-msg">
                  {{ errores["vehiculo.kilometraje"] }}
                </small>
              </div>

              <div class="col-6 mb-3">
                <label for="aniomodelo" class="form-label">Año *</label>
                <input id="aniomodelo"
                  v-model="ordenTrabajoForm.vehiculo.anio"
                  class="form-control"
                  type="number"
                  placeholder="Ej: 2019"
                  @blur="validate('vehiculo.anio')"
                  :class="{ 'input-error': errores['vehiculo.anio'] }"
                />
                <small v-if="errores['vehiculo.anio']" class="error-msg">
                  {{ errores["vehiculo.anio"] }}
                </small>
              </div>
              <div class="col-6 mb-3">
                <label for="placas" class="form-label">Placas *</label>
                <input id="placas"
                  v-model="ordenTrabajoForm.vehiculo.placas"
                  class="form-control"
                  type="text"
                  placeholder="Ej: GAB-254-A"
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
        </div>
        <div class="col-12 col-lg-6 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header" style="font-size: 14pt;">
              <i class="bi bi-person-fill me-2"></i> Cliente
            </div>
            <div class="card-body">
              <div class="row">
              <!-- Nombre -->
              <div class="col-6 mb-3">
                <label for="nombrecliente" class="form-label">Nombre(s) *</label>
                <input id="nombrecliente"
                  v-model="ordenTrabajoForm.cliente.nombres"
                  class="form-control"
                  type="text"
                  placeholder="Nombre del cliente"
                  list="clientes"
                />
              </div>
              <!-- Apellidos -->
              <div class="col-6 mb-3">
                <label for="apellidos" class="form-label">Apellido(s) *</label>
                <input id="apellidos"
                  v-model="ordenTrabajoForm.cliente.apellidos"
                  type="text"
                  class="form-control"
                  placeholder="Apellido(s) del cliente"
                />
              </div>
              <!-- Teléfono -->
              <div class="col-6 mb-3">
                <label for="telefono" class="form-label">Teléfono(s) *</label>
                <input id="telefono"
                  v-model="ordenTrabajoForm.cliente.clienteTelefono"
                  class="form-control"
                  type="text"
                  placeholder="(10 dígitos)"
                  list="clientes"
                  @input="onClienteInput($event.target.value)"
                  @change="onClienteSeleccionadoByValue($event.target.value)"
                />
                <small
                  v-if="errores['cliente.clienteTelefono']"
                  class="error-msg"
                >
                  {{ errores["cliente.clienteTelefono"] }}
                </small>
              </div>
              <!-- Correo -->
              <div class="col-6 mb-3">
                <label for="email" class="form-label">Correo electrónico *</label>
                <input id="email"
                  v-model="ordenTrabajoForm.cliente.clienteCorreo"
                  class="form-control"
                  type="text"
                  placeholder="(Use un correo válido)"
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
              <div class="col-6 mb-3">
                <label for="rfc" class="form-label">RFC</label>
                <input id="rfc"
                  v-model="ordenTrabajoForm.cliente.rfc"
                  type="text"
                  class="form-control"
                  placeholder="(12 ó 13 caracteres)"
                  list="clientes"
                  @input="onClienteInput($event.target.value)"
                  @change="onClienteSeleccionadoByValue($event.target.value)"
                  @blur="validate('cliente.rfc')"
                  :class="{ 'input-error': errores['cliente.rfc'] }"
                />

                <small
                  v-if="errores['cliente.rfc']"
                  class="error-msg"
                >
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
              <option value="">-Selecciona-</option>
              <option value="Efectivo">01 - Efectivo</option>
              <option value="Cheque nominativo">02 - Cheque nominativo</option>
              <option value="Transferencia electrónica de fondos">
                03 - Transferencia electrónica de fondos
              </option>
              <option value="Tarjeta de crédito">04 - Tarjeta de crédito</option>
              <option value="Condonación">15 - Condonación</option>
              <option value="Compensación">17 - Compensación</option>
              <option value="Prescripción o caducidad">26 - Prescripción o caducidad</option>
              <option value="Tarjeta de débito">28 - Tarjeta de débito</option>
              <option value="Aplicación de anticipos">30 - Aplicación de anticipos</option>
              <option value="Intermediario pagos">31 - Intermediario pagos</option>
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
                <input id="razonsocial"
                  v-model="ordenTrabajoForm.factura.razonSocial"
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
              <div class="col-12 col-lg-6 mb-3">
                <label for="rfcfactura" class="form-label">RFC *</label>
                <input id="rfcfactura"
                  v-model="ordenTrabajoForm.factura.rfc"
                  class="form-control"
                  type="text"
                  placeholder="(RFC a facturar)"
                  @blur="validate('cliente.rfc')"
                  :class="{ 'input-error': errores['cliente.rfc'] }"
                />
                <small
                  v-if="errores['cliente.rfc']"
                  class="error-msg"
                >
                  {{ errores["cliente.rfc"] }}
                </small>
              </div>
              <div class="col-12 col-lg-6 mb-3">
                <label for="direccionfiscal" class="form-label">Dirección</label>
                <input id="direccionfiscal"
                  v-model="ordenTrabajoForm.factura.direccion"
                  class="form-control"
                  type="text"
                  placeholder="(Domicilio)"
                />
              </div>
              <div class="col-12 col-lg-6 mb-3">
                <label for="cpfactura" class="form-label">Código postal *</label>
                <input id="cpfactura"
                  v-model="ordenTrabajoForm.factura.cp"
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
              <div class="col-12 col-lg-6 mb-3">
                <label for="correofactura" class="form-label">Correo *</label>
                <input id="correofactura"
                  v-model="ordenTrabajoForm.factura.eMail"
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
              
              <div class="col-12 col-lg-6 mb-3">
                <label class="form-label">Uso CFDI *</label>
                <select
                  v-model="ordenTrabajoForm.factura.usoCFDI"
                  class="form-select"
                  @blur="validate('factura.usoCFDI')"
                  :class="{ 'input-error': errores['factura.usoCFDI'] }"
                >
                  <option value="">-Selecciona-</option>
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
                <small
                  v-if="errores['factura.usoCFDI']"
                  class="error-msg"
                >
                  {{ errores['factura.usoCFDI'] }}
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
        <div class="col-8">
          <label class="form-label">¿Se desea desechar llantas antiguas?</label><br/>
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
                            (
                              llanta.cantidad * llanta.precioUnitario
                            ).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
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
                    <td>{{ paquete.cantidad }}</td>
                    <td>{{ Number(paquete.precioUnitario).toFixed(2) }}</td>
                    <td>
                      <div v-if="paquete.idPromocion">
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
                    <td>{{ detalle.cantidad }}</td>
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
                <!-- <tr>
                  <th colspan="3" class="text-end">Subtotal</th>
                  <th class="text-end">
                    {{
                      ordenTrabajoForm.totales.subtotal.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </th>
                  <th></th>
                </tr>

                <tr>
                  <th colspan="3" class="text-end">IVA (16%)</th>
                  <th class="text-end">
                    {{
                      ordenTrabajoForm.totales.iva.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })
                    }}
                  </th>
                  <th></th>
                </tr> -->

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
            <button class="btn btn-primary position-relative shadow mx-3" type="button" style="width: 140px;">
              <i class="bi bi-arrow-left-circle-fill position-absolute start-0 ms-2"></i> &nbsp;Volver
            </button>
          </router-link>
          <button type="button" class="btn btn-success position-relative shadow ms-3" style="width: 140px;" :disabled="!formValido" @click="mostrarVista = true">
            <i class="bi-save-fill position-absolute start-0 ms-2"></i> &nbsp;Guardar
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
                    <table style="width: 100%;">
                      <tbody>
                        <tr><td style="font-weight: bold; color: grey;">Núm. serie: </td><td colspan="3">{{ ordenTrabajoForm.vehiculo.numSerie }}</td></tr>
                      <tr><td style="font-weight: bold; color: grey;">Marca: </td><td colspan="3">{{ ordenTrabajoForm.vehiculo.marca }}</td></tr>
                      <tr><td style="font-weight: bold; color: grey;">Modelo: </td><td colspan="3">{{ ordenTrabajoForm.vehiculo.modelo }}</td></tr>
                      <tr><td style="font-weight: bold; color: grey;">Color: </td><td>{{ ordenTrabajoForm.vehiculo.color }}</td><td style="font-weight: bold; color: grey;">Kilometraje: </td><td>{{ ordenTrabajoForm.vehiculo.kilometraje }}</td></tr>
                      <tr><td style="font-weight: bold; color: grey;">Año: </td><td>{{ ordenTrabajoForm.vehiculo.anio }}</td><td style="font-weight: bold; color: grey;">Placas: </td><td>{{ ordenTrabajoForm.vehiculo.placas }}</td></tr>
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
                    <table style="width: 100%;">
                      <tbody>
                        <tr><td style="font-weight: bold; color: grey;">Nombre: </td><td>{{ ordenTrabajoForm.cliente.nombres }} {{ ordenTrabajoForm.cliente.apellidos }}</td></tr>
                        <tr><td style="font-weight: bold; color: grey;">Teléfono: </td><td>{{ ordenTrabajoForm.cliente.clienteTelefono }}</td></tr>
                        <tr><td style="font-weight: bold; color: grey;">Correo: </td><td>{{ ordenTrabajoForm.cliente.clienteCorreo }}</td></tr>
                        <tr><td style="font-weight: bold; color: grey;">RFC: </td><td>{{ ordenTrabajoForm.cliente.rfc }}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mb-3 mx-3">
              <div class="col-12 col-lg-6">
                <strong>Fecha de alta: </strong>{{ formatearFecha(ordenTrabajoForm.cliente.fechaAlta) }}
              </div>
              <div class="col-12 col-lg-6">
                <strong>Fecha de entrega propuesta: </strong> {{ formatearFecha(ordenTrabajoForm.fechaEntrega) }}
              </div>
              <div class="col-12 mt-1">
                <strong>Técnico seleccionado: </strong> {{ tecnicoSeleccionado }}
              </div>
              <div class="col-12 mt-1">
                <strong>Forma de pago: </strong> {{ ordenTrabajoForm.cliente.metodoPago }}
              </div>
              <div class="col-12 mt-1">
                <strong>Desechar llantas antiguas: </strong> {{ boolDesecharLlanta ? "Sí" : "No" }}
              </div>
            </div>
            <div v-if="boolFactura" class="card shadow-sm">
              <div class="card-header">
                <i class="bi bi-receipt me-2"></i> Datos de facturación
              </div>
              <div class="card-body">
                <table style="width:100%;">
                  <tbody>
                    <tr><td style="font-weight: bold; color: grey;">Razón social:</td><td>{{ ordenTrabajoForm.factura.razonSocial }}</td>
                    <td style="font-weight: bold; color: grey;">RFC:</td><td>{{ ordenTrabajoForm.cliente.rfc }}</td></tr>
                    <tr><td style="font-weight: bold; color: grey;">Email:</td><td>{{ ordenTrabajoForm.factura.eMail }}</td>
                    <td style="font-weight: bold; color: grey;">CP:</td><td>{{ ordenTrabajoForm.factura.cp }}</td></tr>
                    <tr><td style="font-weight: bold; color: grey;">Uso CFDI:</td><td colspan="3">{{ usoCFDITexto }}</td></tr>
                  </tbody>
                </table>
              </div> 
            </div>
            <div v-else class="mx-4 mb-2">
              El cliente no solicitó factura.
            </div>
            <div class="card shadow-sm mt-3">
              <div class="card-header">
                <i class="bi bi-nut-fill me-2"></i> Insumos
              </div>
              <div class="card-body">
                <table style="width: 100%;">
                  <thead>
                    <tr style="background:#f0f0f0; text-align:center;">
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
                      <td class="text-end">${{ i.precioUnitario.toFixed(2) }}</td>
                      <td class="text-end">${{ i.subTotal }}</td>
                    </tr>
                    <template v-for="p in insumosFiltrados.paquete" :key="p.idPaquete">
                      <tr style="font-weight:bold; background:#fafafa;">
                        <td>{{ p.descripcion }}</td>
                        <td class="text-center">{{ p.cantidad }}</td>
                        <td class="text-end">${{ p.precioUnitario.toFixed(2) }}</td>
                        <td class="text-end">${{ p.subTotal }}</td>
                      </tr>
                      <tr v-for="d in p.detalle" :key="d.idDetalle" style="color:#555;">
                        <td style="padding-left:20px;">↳ {{ d.descripcion }}</td>
                        <td class="text-center">{{ d.cantidad }}</td>
                        <td class="text-end">-</td>
                        <td class="text-end">-</td>
                      </tr>
                    </template>
                    <tr v-for="a in insumosFiltrados.adicional" :key="a.idAdicional">
                      <td>{{ a.descripcion }}</td>
                      <td class="text-center">{{ a.cantidad }}</td>
                      <td class="text-end">${{ Number(a.precioUnitario).toFixed(2) }}</td>
                      <td class="text-end">${{ a.subTotal }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="row text-end">
              <button type="button" class="btn btn-secondary position-relative shadow mx-3" style="width: 140px;" @click="mostrarVista = false">
                  <i class="bi-x-circle-fill position-absolute start-0 ms-2"></i> Cerrar
                </button>
                <button type="button" class="btn btn-success position-relative shadow mx-3" style="width: 140px;" @click="guardarOT()">
                  <i class="bi-save-fill position-absolute start-0 ms-2"></i> Guardar OT
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

const catalogoUsoCFDI = [
  { clave: 'G01', texto: 'Adquisición de mercancías' },
  { clave: 'G02', texto: 'Devoluciones, descuentos o bonificaciones' },
  { clave: 'G03', texto: 'Gastos en general' },
  { clave: 'I01', texto: 'Construcciones' },
  { clave: 'I02', texto: 'Mobiliario y equipo de oficina por inversiones' },
  { clave: 'I03', texto: 'Equipo de transporte' },
  { clave: 'I04', texto: 'Equipo de cómputo y accesorios' },
  { clave: 'I05', texto: 'Dados, troqueles, moldes, matrices y herramental' },
  { clave: 'I06', texto: 'Comunicaciones telefónicas' },
  { clave: 'I07', texto: 'Comunicaciones satelitales' },
  { clave: 'I08', texto: 'Otra maquinaria y equipo' },
  { clave: 'S01', texto: 'Sin efectos fiscales' },
]

const props = defineProps({
  idCotizacion: {
    type: [String, Number],
    required: true,
  },
});

/* VARIABLES PARA VALIDACION DE CAMPOS */
const errores = reactive({});

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

    const fechaFormateada = d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return fechaFormateada;
  };

// Helper para acceder a propiedades anidadas tipo "cliente.telefono"
const getValor = (path) => {
  return path.split(".").reduce((obj, key) => obj[key], ordenTrabajoForm);
};

function validate(path) {
  const value = getValor(path);

  // ========================= VALIDACIONES ==============================

  const rules = {
    
    // -------- VEHÍCULO ----------
    "vehiculo.marca": () => (!value ? "Marca obligatoria." : null),

    "vehiculo.modelo": () => (!value ? "Modelo obligatorio." : null),

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

    "vehiculo.color": () => (!value ? "Color obligatorio." : null),

    "vehiculo.placas": () => (!value ? "Placas obligatorias." : null),

    "vehiculo.anio": () => {
      const y = parseInt(value);
      const current = new Date().getFullYear();
      const nextyear = current + 1;
      return !y
        ? "Año obligatorio."
        : y < 1950 || y > nextyear
        ? `Año entre 1950 y ${nextyear}.`
        : null;
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

    idEmpleado: () =>
      !ordenTrabajoForm.idEmpleado || ordenTrabajoForm.idEmpleado === 0
        ? "Debes seleccionar un técnico."
        : null,

    
    // -------- FACTURA ----------
    "factura.razonSocial": () =>
      !value || !value.trim()
        ? "Razón social obligatoria."
        : null,

    "factura.usoCFDI": () =>
      !value
        ? "Debe seleccionar un uso CFDI."
        : null,

    "factura.eMail": () => {
      if (!value || !value.trim()) return "Correo obligatorio.";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value)
        ? "E-mail no válido."
        : null;
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

      const rfcRegex =
        /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;

      return !rfcRegex.test(value.toUpperCase())
        ? "RFC no válido."
        : null;
    },

  };

  // Ejecutar regla
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



const getFechaHoraLocal = () => {
  const ahora = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(
    ahora.getDate()
  )}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
};

const fechaEntregaFecha = ref("");
const fechaEntregaHora = ref("");

const tecnicoSeleccionado = computed(() => {
  const emp = itmEmpleados.value.find(
    e => e.idEmpleado === ordenTrabajoForm.idEmpleado
  )

  if (!emp) return ''

  return `(${emp.puesto}) ${emp.nombres} ${emp.apePaterno}`
});

const usoCFDITexto = computed(() => {
  const uso = catalogoUsoCFDI.find(
    u => u.clave === ordenTrabajoForm.factura.usoCFDI
  )

  return uso ? `${uso.clave} - ${uso.texto}` : ''
});

const ordenTrabajoForm = reactive({
  cotSeleccionada: 0,
  idEmpleado: 0,
  idTipoOrdenTrabajo: 0,
  fechaEntrega: "",
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

const irAOrdenTrabajo = () => {
  router.push({ name: "orden-trabajo-list" });
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
  
  cargarEmpleados();
  cargarTipoOT();
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
  ordenTrabajoForm.cliente.apellidos = cliente.apPaterno + " " + cliente.apMaterno;
  ordenTrabajoForm.cliente.nombres = cliente.nombres
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

const insumosFiltrados = computed(() => ({
  ...ordenTrabajoForm.insumo,
  llanta: (ordenTrabajoForm.insumo.llanta || []).filter(l => !l.eliminado),
  paquete: (ordenTrabajoForm.insumo.paquete || []).filter(p => !p.eliminado),
  adicional: (ordenTrabajoForm.insumo.adicional || []).filter(a => !a.eliminado)
}))

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
                  <td style="text-align:right">$${i.precioUnitario.toFixed(2)}</td>
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
                  <td style="text-align:right">$${p.precioUnitario.toFixed(2)}</td>
                  <td style="text-align:right">$${p.subTotal}</td>
                </tr>
                ${p.detalle
                  .map(
                    (d) => `
                  <tr style="color:#555;">
                    <td style="padding-left:20px;">↳ ${d.descripcion}</td>
                    <td style="text-align:center">${d.cantidad}</td>
                    <td style="text-align:right">$${d.precioUnitario.toFixed(2)}</td>
                    <td style="text-align:right">$${d.subTotal}</td>
                  </tr>
                `
                  )
                  .join("")}
              `
                )
                .join("")}

              ${ordenTrabajoForm.insumo.adicional
                .map(
                  (a) => `
                <tr>
                  <td>${a.descripcion}</td>
                  <td style="text-align:center">${a.cantidad}</td>
                  <td style="text-align:right">$${Number(a.precioUnitario).toFixed(2)}</td>
                  <td style="text-align:right">$${a.subTotal}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>

        </table>
    `;

  // 🔹 Confirmación con SweetAlert
//   const result = await Swal.fire({
//     title: "Confirmar datos",
//     html: `
//             <div style="font-family:Arial, sans-serif; font-size:14px; color:#333; max-height:400px; overflow-y:auto;">

//                 <div class="m-2">
//                     <!-- Cliente -->
//                     <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Cliente</h3>
//                     <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Nombre:</td><td>${
//                           ordenTrabajoForm.cliente.nombres + " " + ordenTrabajoForm.cliente.apellidos
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Teléfono:</td><td>${
//                           ordenTrabajoForm.cliente.clienteTelefono
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Método de pago:</td><td>${
//                           ordenTrabajoForm.cliente.metodoPago
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Fecha alta:</td><td>${
//                           ordenTrabajoForm.cliente.fechaAlta
//                         }</td></tr>
//                     </table><br>

//                     <!-- Vehículo -->
//                     <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Vehículo</h3>
//                     <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Num. Serie:</td><td>${
//                           ordenTrabajoForm.vehiculo.numSerie
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Modelo:</td><td>${
//                           ordenTrabajoForm.vehiculo.modelo
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Kilometraje:</td><td>${
//                           ordenTrabajoForm.vehiculo.kilometraje
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Color:</td><td>${
//                           ordenTrabajoForm.vehiculo.color
//                         }</td></tr>
//                         <tr><td style="padding:4px 8px; font-weight:bold;">Placas:</td><td>${
//                           ordenTrabajoForm.vehiculo.placas
//                         }</td></tr>
//                     </table>

//                     <!-- Factura -->
//                     ${
//                       boolFactura.value
//                         ? `
//                     <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Factura</h3>
//                     <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
//                     <tr><td style="padding:4px 8px; font-weight:bold;">Razón social:</td><td>${ordenTrabajoForm.factura.razonSocial}</td></tr>
//                     <tr><td style="padding:4px 8px; font-weight:bold;">RFC:</td><td>${ordenTrabajoForm.cliente.rfc}</td></tr>
//                     <tr><td style="padding:4px 8px; font-weight:bold;">Email:</td><td>${ordenTrabajoForm.factura.eMail}</td></tr>
//                     <tr><td style="padding:4px 8px; font-weight:bold;">CP:</td><td>${ordenTrabajoForm.factura.cp}</td></tr>
//                     <tr><td style="padding:4px 8px; font-weight:bold;">Uso CFDI:</td><td>${ordenTrabajoForm.factura.usoCFDI}</td></tr>
//                     </table>
//                     `
//                         : ""
//                     }

//                     <!-- Insumos -->
//                     <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Insumos</h3>
//                     ${insumosHTML}
//                 </div>

//             </div>
//         `,
//     showCancelButton: true,
//     confirmButtonText: "Confirmar y enviar",
//     cancelButtonText: "Cancelar",
//     width: "700px",
//   });

//   if (result.isConfirmed) {
//     return true;
//   }
//   return false;

  
 };


const guardarOT = async () => {
  
  const userStorage = localStorage.getItem("userSession");

  const dataUser = JSON.parse(userStorage)
  console.log('Entró');

  let factura = {};

  let insumosSelec = ({
  ...ordenTrabajoForm.insumo,
  llanta: (ordenTrabajoForm.insumo.llanta || []).filter(l => !l.eliminado),
  paquete: (ordenTrabajoForm.insumo.paquete || []).filter(p => !p.eliminado),
  adicional: (ordenTrabajoForm.insumo.adicional || []).filter(a => !a.eliminado)
})

  if (boolFactura) {
    factura = {
      razonSocial: ordenTrabajoForm.factura.razonSocial,
      direccion: ordenTrabajoForm.factura.direccion,
      rfc: ordenTrabajoForm.cliente.rfc,
      eMail: ordenTrabajoForm.factura.eMail,
      cp: ordenTrabajoForm.factura.cp,
      usoCFDI: ordenTrabajoForm.factura.usoCFDI,
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

  try {
    const res = await fetch(`${proxy.$serverIP}api/OrdenTrabajo/crearOT`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objSeend),
    });

    const data = await res.json();

    if (data.success) {
      limpiarOrdenTrabajoForm(); // Limpia formulario
      irAOrdenTrabajo();         // Redirige
    } else {
      console.log("No guardada", data);
    }
  } catch (err) {
    console.error("Error al guardar OT:", err);
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

  // console.log(JSON.stringify(data))
  ordenTrabajoForm.cotSeleccionada = data.idCotizacion || 0;

  ordenTrabajoForm.cliente.clienteNombre = data.clienteNombre || "";
  ordenTrabajoForm.cliente.nombres = data.nombres || "";
  ordenTrabajoForm.cliente.apellidos = `${data?.apPaterno ?? ""} ${data?.apMaterno ?? ""}`.trim();
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
          idConceptoTrabajo: 7,

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

const calcularTotales = () => {
  const totalLlantas = ordenTrabajoForm.insumo.llanta
    .reduce((acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0), 0);

  const totalPaquetes = ordenTrabajoForm.insumo.paquete
    .reduce((acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0), 0);

  const totalAdicionales = ordenTrabajoForm.insumo.adicional
    .reduce((acc, i) => acc + Number(i.eliminado ? 0 : i.subTotal || 0), 0);

  const subtotal = totalLlantas + totalPaquetes + totalAdicionales;
  const descuento = ordenTrabajoForm.totales.descuento || 0;
  const iva = (subtotal - descuento) * 0.16;

  ordenTrabajoForm.totales.subtotal = Number(subtotal.toFixed(2));
  ordenTrabajoForm.totales.iva = Number(iva.toFixed(2));
  ordenTrabajoForm.totales.total = Number(
    //(subtotal - descuento + iva).toFixed(2)
    (subtotal - descuento).toFixed(2)
  );
};


// observa idCotizacion prop, en cuanto se envie un valor nuevo actualiza y carga la informacion de la cotizacion
watch(
  () => props.idCotizacion,
  async (newValue) => {
    if (!newValue) return;

    ordenTrabajoForm.cotSeleccionada = newValue;
    await cargarInfoCotizacion();
  },
  { immediate: true }
);

const actualizarInsumos = (payload) => {
  // payload = { insumo, totales }

  ordenTrabajoForm.insumo.llanta = payload.insumo.llanta;
  ordenTrabajoForm.insumo.paquete = payload.insumo.paquete;
  ordenTrabajoForm.insumo.adicional = payload.insumo.adicional;

  ordenTrabajoForm.totales.subtotal = payload.totales.subtotal;
  ordenTrabajoForm.totales.descuento = payload.totales.descuento;
  ordenTrabajoForm.totales.iva = payload.totales.iva;
  ordenTrabajoForm.totales.total = payload.totales.total;
};


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
