<template>
  <div class="container-fluid mp-4 p-4">
    <div class="row mx-4">
      <h2>Cotizaciones</h2>
    </div>
    <div class="row mt-4 mx-4">
      <div class="col d-flex align-items-center">
        <input
          class="form-control"
          placeholder="Buscar por código, cliente, fecha..."
          v-model="busquedaCotizaciones"
          @keydown.stop
        />
      </div>

      <div class="col d-flex align-items-center">
        <label for="select" class="form-label m-2">Estatus: </label>
        <select v-model="filtroEstatus" class="form-select">
          <option value="">Todos</option>
          <option value="Creada">Activos</option>
          <option value="Cancelada">Cancelados</option>
          <option value="Aprobada">Aprobados</option>
          <option value="Realizada">Finalizados</option>
        </select>
      </div>

      <div class="col-3 m-4">
        <!-- Botón para abrir el modal -->
        <button class="btn btn-primary" @click="abrirModalCotizacion()">
          Nueva cotización
        </button>
      </div>
    </div>
    <div class="row mx-4">
      <div v-if="loading" class="text-center my-4">
        <table class="table table-hover table-sm">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <!-- <th>Paquete</th> -->
              <!-- <th>Total</th> -->
              <th>Llanta</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>
        <div class="text-center my-4">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Cargando Cotizaciones...</p>
        </div>
      </div>

      <div v-else>
        <table class="table table-hover table-sm">
          <caption>
            <strong>Lista de cotizaciones</strong>
          </caption>
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <!-- <th>Paquete</th> -->
              <!-- <th>Total</th> -->
              <th>Llanta</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cotizacionesTransformadas" :key="item.codigo">
              <td>{{ item.codigo }}</td>
              <td>{{ item.fechaCreacion }}</td>
              <td>{{ item.cliente }}</td>
              <td>{{ item.telefono }}</td>
              <!-- <td>{{ item.paquete }}</td> -->
              <!-- <td>{{ item.total }}</td> -->
              <td>{{ item.nombreLlanta }}</td>
              <td>{{ item.estatus }}</td>
              <td>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-sm btn-outline-info"
                    @click="mostrarVistaPrevia(item.acciones, 'ver')"
                    title="Ver"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <button
                    v-if="item.estatus != 'Realizada'"
                    class="btn btn-sm btn-outline-warning"
                    @click="abrirModalCotizacion(item.acciones)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus != 'Cancelada'"
                    class="btn btn-sm btn-outline-danger"
                    @click="cancelarCotizacion(item.acciones)"
                    title="Cancelar"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus === 'Cancelada'"
                    class="btn btn-sm btn-outline-success"
                    @click="reactivarCotizacion(item.acciones)"
                    title="Reactivar"
                  >
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus === 'Creada'"
                    class="btn btn-sm btn-outline-primary"
                    @click="aprobarCotizacion(item.acciones)"
                    title="Aprobar"
                  >
                    <i class="bi bi-check-circle"></i>
                  </button>

                  <button
                    type="button"
                    v-if="item.estatus === 'Aprobada'"
                    class="btn btn-sm btn-outline-secondary"
                    @click="finalizarCotizacion(item.acciones)"
                    title="Finalizar"
                  >
                    <i class="bi bi-flag"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL PARA SCREENSHOT Y DESCARGA DE PDF -->

    <div
      v-if="mostrarVista"
      class="modal fade show d-block"
      tabindex="-1"
      :style="{ background: 'rgba(0,0,0,0.5)' }"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-1000">
        <div class="modal-content p-4">
          <div class="modal-header">
            <h4 class="modal-title">Vista Previa de Cotización</h4>
            <button
              type="button"
              class="btn-close"
              @click="mostrarVista = false"
            ></button>
          </div>
          <div
            id="area-imprimir"
            ref="pdfContent"
            class="modal-body bg-white p-4 fs-6 print-area"
            :style="{ fontSize: '14px' }"
          >
            <!-- Encabezado con direcciones y logo -->
            <div class="row my-3">
              <div class="col">
                <img
                  class="float-start"
                  src="/images/Logo-Kartisimo.png"
                  alt="Logo"
                  :style="{ maxWidth: '250px' }"
                />
              </div>
            </div>
            <div class="row border-bottom pb-3 mb-4">
              <div class="col">
                <small>
                  <strong>Blvd. Delta 2002 esq. Rio Mayo</strong><br />
                  Col. Valle de Jerez C.P 37538<br />
                  Tel. 477 330 6060 y 477 390 5090<br />
                  delta@kartisimo.mx </small
                ><br />
              </div>
              <div class="col">
                <small>
                  <strong>Blvd. Lopez Mateos 827 esq. Apolo</strong><br />
                  Col. Obrera C.P. 37340<br />
                  Tel. 477 717 7440 y 477 470 9419<br />
                  apolo@kartisimo.mx
                </small>
              </div>
              <div class="col">
                <small>
                  <strong>Blvd. Torres Landa 1901 esq. San Jacobo</strong><br />
                  Col. La Piscina C.P. 37440<br />
                  Tel. 477 390 0290 y 477 461 0028<br />
                  torreslanda@kartisimo.mx<br />
                </small>
              </div>
              <div class="col">
                <small>
                  <strong
                    >Blvd. Mariano Escobedo Pte. 2715 esq. San Sebastián</strong
                  ><br />
                  Col. La Martinica, C.P. 37500<br />
                  Tel. 477 763 3285 y 477 763 3284
                </small>
              </div>
            </div>

            <!-- Información del cliente -->
            <div class="mb-4 cotizacion-header">
              <div class="row">
                <div class="col-2">
                  <span class="mx-2">
                    {{ "COT-" + vistaCotizacion.codigo || "N/A" }}
                  </span>
                </div>
                <div class="col">
                  <span class="mx-2">
                    <strong>Fecha emisión: </strong>
                    {{ vistaCotizacion.fechaCreacion || "N/A" }}
                  </span>
                </div>
                <div class="col">
                  <span class="mx-2">
                    <strong>Cliente: </strong>
                    {{ vistaCotizacion.cliente?.nombre || "N/A" }}
                  </span>
                </div>
                <div class="col">
                  <span class="mx-2">
                    <strong>Teléfono: </strong>
                    {{ telefonoVistaFormateado || "N/A" }}
                  </span>
                </div>
                <div class="col">
                 <span class="mx-2">
                   <strong>Observaciones</strong>
                    {{ cotizacionForm.observaciones || "N/A" }}
                 </span>
              </div>
            </div>
          </div>

            <!-- Tabla Llantas -->
            <div class="table-responsive mx-auto mt-3 cotizacion-header">
              <table
                class="table table-bordered table-sm align-middle"
                style="table-layout: fixed"
              >
                <colgroup>
                  <col style="width: 50px" />
                  <col />
                  <col style="width: 120px" />
                  <col style="width: 120px" />
                </colgroup>
                <thead class="table-light">
                  <tr>
                    <th class="text-center">CANT</th>
                    <th>MEDIDA - MODELO - RANGO</th>
                    <th class="text-end">PRECIO UNITARIO</th>
                    <th class="text-end">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(llanta, i) in vistaCotizacion.llantasSelecionadas"
                    :key="'ll-' + i"
                  >
                    <td class="text-center">{{ llanta.cantidad }}</td>
                    <td>
                      {{ llanta.medidas }}
                      <br />
                      <small class="badge bg-secondary mt-1">{{
                        llanta.comentario
                      }}</small>
                    </td>
                    <td class="text-end">
                      {{
                        llanta.precioUnitario.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td class="text-end">
                      <div
                        v-if="
                          llanta.promoLabel &&
                          llanta.promoLabel !== '(Excluido de promoción)'
                        "
                      >
                        <span class="text-decoration-line-through text-muted">
                          {{
                            (
                              llanta.precioUnitario * llanta.cantidad
                            ).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                          <small
                            class="badge bg-danger d-inline-block mt-1 text-wrap"
                          >
                            {{ llanta.promoLabel }}
                          </small>
                        </span>
                        <br />
                        <span class="text-success fw-bold d-block">{{
                          llanta.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}</span>
                      </div>
                      <div v-else>
                        {{
                          llanta.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Tabla Paquetes y Servicios (sin encabezado) -->
            <div class="table-responsive mt-3 cotizacion-header">
              <table
                class="table table-bordered table-sm align-middle"
                style="table-layout: fixed"
              >
                <colgroup>
                  <col style="width: 50px" />
                  <col />
                  <col style="width: 120px" />
                  <col style="width: 120px" />
                </colgroup>
                <tbody>
                  <!-- Paquetes -->
                  <tr
                    v-for="(paquete, index) in vistaCotizacion.paquetes"
                    :key="'paq-' + index"
                  >
                    <td class="text-center">1</td>
                    <td>
                      {{ paquete.nombre.toUpperCase() }}
                      {{ paquete.descripcion.toUpperCase() }}
                      <p>
                        <small class="badge bg-secondary mt-1">{{
                          paquete.comentario
                        }}</small>
                      </p>
                    </td>
                    <td class="text-end">
                      {{
                        paquete.precioUnitario.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td class="text-end">
                      <div
                        v-if="
                          paquete.promoLabel &&
                          paquete.promoLabel !== '(Excluido de promoción)'
                        "
                      >
                        <span class="text-decoration-line-through text-muted">
                          {{
                            paquete.precioUnitario.toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                          <small class="badge bg-danger">{{
                            paquete.promoLabel
                          }}</small>
                        </span>
                        <br />
                        <span class="text-success fw-bold d-block">{{
                          paquete.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}</span>
                      </div>
                      <div v-else>
                        {{
                          paquete.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>

                  <!-- Servicios Adicionales -->
                  <tr
                    v-for="(
                      servicio, i
                    ) in vistaCotizacion.serviciosAdicionales"
                    :key="'serv-' + i"
                  >
                    <td class="text-center">{{ servicio.cantidad }}</td>
                    <td>
                      {{ servicio.nombreServicio }} {{ servicio.observacion }}
                      <p>
                        <small class="badge bg-secondary mt-1">{{
                          servicio.comentario
                        }}</small>
                      </p>
                    </td>
                    <td class="text-end">
                      {{
                        servicio.precioUnitario.toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        })
                      }}
                    </td>
                    <td class="text-end">
                      <div
                        v-if="
                          servicio.promoLabel &&
                          servicio.promoLabel !== '(Excluido de promoción)'
                        "
                      >
                        <span class="text-decoration-line-through text-muted">
                          {{
                            servicio.precioUnitario.toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                          <small class="badge bg-danger mt-1">{{
                            servicio.promoLabel
                          }}</small>
                        </span>
                        <br />
                        <span class="text-success fw-bold d-block">{{
                          servicio.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}</span>
                      </div>
                      <div v-else>
                        {{
                          servicio.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>

                  <!-- Total -->
                  <tr v-if="vistaCotizacion.mostrarTotal" class="fw-bold">
                    <td colspan="3" class="text-center">Total:</td>
                    <td class="text-end">
                      <div v-if="vistaCotizacion.tienePromocion">
                        <span class="text-decoration-line-through text-muted">
                          {{
                            vistaCotizacion.totalBase.toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </span>
                        <br />
                        <span class="text-success fw-bold d-block">{{
                          vistaCotizacion.total.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}</span>
                      </div>
                      <div v-else>
                        {{
                          vistaCotizacion.totalBase.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="row text-center">
              <div class="col">
                <!-- Botón enviar correo -->
                <EnviarCorreoModal :cotizacion="vistaCotizacion" />
              </div>

              <div class="col">
                <!-- Botón enviar pdf a imprimir -->
                <div class="mt-4">
                  <button
                    class="btn btn-outline-primary w-100"
                    @click="imprimirCotizacion"
                  >
                    Imprimir
                  </button>
                </div>
              </div>

              <div class="col">
                <!-- Botón PDF -->
                <div class="mt-4">
                  <button
                    class="btn btn-outline-secondary w-100"
                    @click="generarPDF"
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>

              <div class="col">
                <div class="mt-4">
                  <button
                    class="btn btn-outline-warning w-100"
                    @click="abrirModalCotizacion(vistaCotizacion)"
                  >
                    Editar
                  </button>
                </div>
              </div>

              <div class="col">
                <div class="mt-4">
                  <button
                    class="btn btn-outline-warning w-100"
                    @click="confirmarAccion(vistaCotizacion)"
                  >
                    Generar OT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PARA CREAR/EDITAR COTIZACION -->
    <div
      class="modal fade"
      ref="modalRef"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div
        class="modal-dialog modal-centered modal-dialog-scrollable modal-lg"
        style="max-width: 95vw"
      >
        <div
          class="modal-content"
          :style="{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }"
        >
          <div class="modal-header bg-light border-bottom">
            <div class="modal-title w-100 text-center">
              <h3 class="mb-0 fw-semibold">{{ tituloModal }}</h3>
            </div>

            <button
              type="button"
              class="btn-close"
              @click="closeModal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body" :style="{ overflowY: 'auto' }">
            <!-- Seccion informacion cliente -->

            <div class="row m-2">
              <div class="col d-flex flex-column">
                <div class="row g-3 m-2">
                  <div class="col-md-6">
                    <label for="nombre" class="form-label"
                      >Nombre del cliente</label
                    >
                    <input
                      id="nombre"
                      v-model="cotizacionForm.nombre"
                      class="form-control"
                      type="text"
                      placeholder="Ej. Nombre"
                    />
                  </div>

                  <div class="col-md-6">
                    <label for="apellido" class="form-label"
                      >Apellido del cliente</label
                    >
                    <input
                      id="apellido"
                      v-model="cotizacionForm.apellidos"
                      class="form-control"
                      type="text"
                      placeholder="Ej. Apellido"
                    />
                  </div>
                </div>

                <div class="row g-3 m-2">
                  <div class="col-md-6">
                    <label for="numTelefono" class="form-label">Teléfono</label>
                    <input
                      id="numTelefono"
                      v-model="telefonoFormateado"
                      type="number"
                      maxlength="12"
                      class="form-control"
                      placeholder="XXX-XXX-XXXX"
                    />
                  </div>

                  <div class="col-md-6">
                    <label for="correoCliente" class="form-label">Correo</label>
                    <input
                      id="correoCliente"
                      v-model="cotizacionForm.clienteCorreo"
                      type="email"
                      class="form-control"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  <div class="col-md-12">
                    

                  <!------------
                  <label for="ObservacionCliente" class="form-label"
                      >Observaciones</label
                    >
            
                  
                        <textarea
                  id="ObservacionCliente"
                  v-model="cotizacionForm.observaciones"
                  @input="console.log(' escribiendo:', cotizacionForm.observaciones)"
                  class="form-control"
                  rows="2"
                  maxlength="255"
                  ></textarea>

                  -->

                  </div>
                </div>
              </div>

              <!-- Select de cliente existente -->
              <div class="col d-flex flex-column">
                <div class="row m-2">
                  <label for="clienteExistente" class="mb-1 form-label"
                    >Cliente Existente</label
                  >
                  <select
                    id="clienteExistente"
                    class="form-select"
                    v-model="cotizacionForm.clienteExistente"
                  >
                    <option value="">Selecciona un cliente</option>

                    <option
                      v-for="(cliente, i) in clientesDisponibles"
                      :key="i"
                      :value="cliente.nombres"
                    >
                      {{ cliente.nombres }}
                    </option>
                  </select>
                </div>
                <div class="row m-2">
                  <div class="col">
                    <div class="form-check my-3">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="mostrarTotal"
                        v-model="cotizacionForm.mostrarTotal"
                      />
                      <label class="form-check-label" for="mostrarTotal">
                        Mostrar total en la vista previa
                      </label>
                    </div>
                  </div>

                  <div class="col">
                    <div
                      v-for="(paquete, i) in paquetesDisponibles"
                      :key="i"
                      class="form-check m-4"
                    >
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="'paquete-' + i"
                        :value="paquete"
                        v-model="cotizacionForm.paquetes"
                      />
                      <label class="form-check-label" :for="'paquete-' + i">
                        {{ paquete.nombre }} - ${{ paquete.precioUnitario }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Seccion seleccion de llantas -->

            <div class="row m-4">
              <div class="col">
                <label for="" class="m-2"
                  >Selecciona las llantas deseadas:</label
                >
                <div class="row m-2">
                  <div class="col-9">
                    <input
                      v-model="busquedaLlantas"
                      class="form-control"
                      placeholder="Buscar por nombre o medida..."
                    />
                  </div>

                  <div class="col-3">
                    <div class="position-relative">
                      <button
                        type="button"
                        class="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                        @click="dropdownOpen = !dropdownOpen"
                      >
                        <span>{{
                          selectedAlmacenes.length
                            ? selectedAlmacenes.join(", ")
                            : "Elegir almacenes"
                        }}</span>
                        <i class="bi bi-caret-down-fill"></i>
                      </button>

                      <!-- menú -->
                      <div
                        v-if="dropdownOpen"
                        class="border rounded shadow bg-white position-absolute w-100 mt-1 p-2"
                        style="z-index: 1050"
                        @mouseleave="dropdownOpen = false"
                      >
                        <div class="form-check mb-2">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            id="alm-todos"
                            @change="toggleTodos"
                            :checked="selectedAlmacenes.length === 0"
                          />
                          <label class="form-check-label" for="alm-todos">
                            Todos
                          </label>
                        </div>

                        <div
                          v-for="alm in almacenes"
                          :key="alm.id"
                          class="form-check"
                        >
                          <input
                            type="checkbox"
                            class="form-check-input"
                            :id="'alm-' + alm.id"
                            :value="alm.nombre"
                            v-model="selectedAlmacenes"
                          />
                          <label
                            class="form-check-label"
                            :for="'alm-' + alm.id"
                          >
                            {{ alm.nombre }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <!-- style="max-height: 400px; overflow-y: auto;" -->
                  <EasyDataTable
                    :key="tableKey"
                    :headers="tblHeadersModal"
                    :items="itemsFiltrados"
                    :rows-per-page="100"
                    show-index
                    :table-height="400"
                    :sort-by="sortBy"
                    :sort-type="sortType"
                    @update:sort-by="onUpdateSortBy"
                    @update:sort-type="onUpdateSortType"
                  >
                    <!-- TEMPLATE PARA ADAPTAR LA INFORMACION A LA ORGANIZACION medida - marca - modelo - rango -->
                    <template #item-medida="slotProps">
                      {{ slotProps.medida }} {{ slotProps.rango }}
                    </template>

                    <template #item-acciones="slotProps">
                      <button
                        v-if="
                          !cotizacionForm.llantas.some(
                            (ll) => ll.idLlanta === slotProps.id,
                          )
                        "
                        type="button"
                        class="btn btn-success btn-sm d-flex align-items-center gap-1"
                        @click="agregarLlanta(slotProps)"
                        :title="
                          cotizacionForm.llantas.some(
                            (ll) => ll.idLlanta === slotProps.id,
                          )
                            ? 'Llanta ya agregada'
                            : 'Agregar llanta'
                        "
                      >
                        <i class="bi bi-plus"></i>
                      </button>
                      <span v-else class="text-secondary small">
                        Ya agregada
                      </span>
                    </template>
                  </EasyDataTable>
                </div>
              </div>
            </div>

            <div class="row mt-3 mx-3">
              <h5>Agregar servicio adicional</h5>
              <div class="d-flex gap-3 mb-3">
                <div class="col">
                  <input
                    class="form-control"
                    placeholder="Nombre del servicio"
                    v-model="nuevoServicio"
                  />
                </div>
                <div class="col-1">
                  <input
                    class="form-control"
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    v-model="nuevaCantidad"
                  />
                </div>

                <div class="col">
                  <input
                    class="form-control"
                    min="0"
                    type="number"
                    placeholder="Precio unitario"
                    v-model="nuevoPrecio"
                  />
                </div>
                <button class="btn btn-success" @click="agregarServicioExtra">
                  Agregar
                </button>
              </div>
            </div>

            <div class="row">
              <div class="col border">
                <div class="row justify-content-center">
                  <div class="col-12 p-4 rounded-3">
                    <div class="row mb-3 d-flex">
                      <div class="col text-start">
                        <img
                          src="/images/Logo-Kartisimo.png"
                          alt="Logo"
                          :style="{ maxWidth: '250px' }"
                        />
                      </div>
                    </div>
                    <div class="row my-3 d-flex justify-content-between">
                      <div class="col">
                        <small
                          ><strong
                            >Blvd. Delta 2002 esq. Rio Mayo</strong
                          ></small
                        ><br />
                        <small>Col. Valle de Jerez C.P. 37538</small><br />
                        <small>Tel. 477 330 6060 y 477 390 5090</small><br />
                        <small>delta@kartisimo.mx</small><br />
                      </div>
                      <div class="col">
                        <small
                          ><strong
                            >Blvd. Lopez Mateos 827 esq. Apolo</strong
                          ></small
                        ><br />
                        <small>Col. Obrera C.P. 37340</small><br />
                        <small>Tel. 477 717 7440 y 477 470 9419</small><br />
                        <small>apolo@kartisimo.mx</small><br />
                      </div>
                      <div class="col">
                        <small
                          ><strong
                            >Blvd. Torres Landa 1901 esq. San Jacobo</strong
                          ></small
                        ><br />
                        <small>Col. La Piscina C.P. 37440</small><br />
                        <small>Tel. 477 390 0290 y 477 461 0028</small><br />
                        <small>torreslanda@kartisimo.mx</small><br />
                      </div>
                      <div class="col">
                        <small
                          ><strong
                            >Blvd. Mariano Escobedo Pte. 2715 esq. San
                            Sebastián</strong
                          ></small
                        ><br />
                        <small>Col. La Martinica, C.P. 37500</small><br />
                        <small>Tel. 477 763 3285 y 477 763 3284</small>
                      </div>
                    </div>

                    <div class="mb-2 d-flex cotizacion-table">
                      <span class="mx-2">
                        <strong>No. Cotización: </strong>
                        {{ cotizacionForm.codigo || "N/A" }}
                      </span>
                      <span class="mx-2">
                        <strong>Fecha emisión: </strong>
                        {{ cotizacionForm.fechaCreacion || "N/A" }}
                      </span>
                      <span class="mx-2">
                        <strong>Cliente: </strong>
                        {{ cotizacionForm.clienteNombre || "N/A" }}
                      </span>
                      <span class="mx-2">
                        <strong>Teléfono: </strong>
                        {{ telefonoFormateado || "N/A" }}
                      </span>
                      <span class="mx-2">
                        <strong>Correo: </strong>
                        {{ cotizacionForm.clienteCorreo || "N/A" }}
                      </span>

                      <span class="mx-2">
                        <strong>Observaciones</strong>
                        {{ cotizacionForm.observaciones || "N/A" }}
                      </span>

                    </div>

                    <table class="table align-middle">
                      <thead>
                        <tr>
                          <th>MEDIDA - MARCA - MODELO - RANGO</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th style="width: 100px; text-align: right">Total</th>
                          <th></th>
                          <!-- <th></th> -->
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Llantas -->
                        <tr
                          v-for="item in cotizacionForm.llantas"
                          :key="'llanta-' + item.idLlanta"
                        >
                          <td>
                            {{ item.modeloMedidas }}
                            <span class="badge bg-warning text-dark ms-2">
                              {{ item.ubicacion }}
                            </span>

                            <div class="mt-1">
                              <input
                                type="text"
                                v-model="item.comentario"
                                class="form-control form-control-sm"
                                placeholder="Agregar comentario..."
                              />
                            </div>
                          </td>

                          <!-- Cantidad -->
                          <td>
                            <input
                              type="number"
                              min="1"
                              class="form-control"
                              :style="{ width: '70px' }"
                              v-model.number="item.cantidad"
                            />
                          </td>

                          <!-- PRECIO UNITARIO -->
                          <td>
                            <div>
                              <input
                                min="0"
                                class="form-control input-precio-unitario"
                                :style="{ width: '90px' }"
                                v-model.number="item.precioUnitario"
                                placeholder="Precio c/u"
                                @keydown="irAlSiguientePrecio"
                              />
                            </div>
                          </td>

                          <!-- SUBTOTAL -->
                          <td style="text-align: right">
                            <!-- Promo individual -->
                            <div v-if="item.promo && item.promo.valor != null">
                              <span
                                class="text-decoration-line-through text-muted small"
                              >
                                {{
                                  formatoMoneda(
                                    (item.precioUnitario || 0) *
                                      (item.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ item.promo.nombre }}
                                  </small>
                                </span>
                              </span>
                              <br />
                              <span class="text-success fw-bold">
                                {{
                                  formatoMoneda(
                                    precioFinalItem(item, item.promo) *
                                      (item.cantidad ?? 1),
                                  )
                                }}
                              </span>
                            </div>

                            <!-- Promo general -->
                            <div
                              v-else-if="
                                promoGeneral && !item.excluirPromocionGeneral
                              "
                            >
                              <span
                                class="text-decoration-line-through text-muted small"
                              >
                                {{
                                  formatoMoneda(
                                    (item.precioUnitario || 0) *
                                      (item.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ promoGeneral.nombre }}
                                  </small>
                                </span>
                              </span>
                              <br />
                              <span class="text-success fw-bold d-block">
                                {{
                                  formatoMoneda(
                                    precioFinalItem(item, promoGeneral) *
                                      (item.cantidad ?? 1),
                                  )
                                }}
                              </span>
                            </div>

                            <!-- Excluido -->
                            <div
                              v-else-if="item.excluirPromocionGeneral"
                              class="text-muted fst-italic small"
                            >
                              {{
                                formatoMoneda(
                                  (item.precioUnitario || 0) *
                                    (item.cantidad ?? 1),
                                )
                              }}
                            </div>

                            <!-- Sin promoción -->
                            <div v-else>
                              {{
                                formatoMoneda(
                                  (item.precioUnitario || 0) *
                                    (item.cantidad ?? 1),
                                )
                              }}
                            </div>
                          </td>

                          <!-- Acciones -->
                          <td>
                            <div
                              v-if="
                                item.promosAplicables &&
                                item.promosAplicables.length
                              "
                              class="mb-2"
                            >
                              <select
                                class="form-select form-select-sm"
                                v-model.number="item.idPromocionSeleccionada"
                                @change="onCambioPromoLlanta(item)"
                              >
                                <option :value="0">Sin promoción</option>
                                <option
                                  v-for="promo in item.promosAplicables"
                                  :key="promo.idPromocion"
                                  :value="promo.idPromocion"
                                >
                                  {{ promo.nombre }}
                                  ({{
                                    promo.tipo
                                      ? promo.valor + "%"
                                      : "$" + promo.valor
                                  }})
                                </option>
                              </select>
                            </div>

                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="eliminarLlanta(item.idLlanta)"
                              title="Eliminar llanta"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>

                        <!-- Paquetes -->
                        <tr
                          v-for="(p, index) in cotizacionForm.paquetes"
                          :key="'paquete-' + index"
                        >
                          <td>
                            {{ p.nombre.toUpperCase() }}
                            <div class="mt-1">
                              <input
                                type="text"
                                v-model="p.comentario"
                                class="form-control form-control-sm"
                                placeholder="Agregar comentario..."
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              class="form-control"
                              :style="{ width: '70px' }"
                              :value="1"
                              disabled
                            />
                          </td>

                          <!-- PRECIO UNITARIO  -->
                          <td>
                            <div>
                              <input
                                min="0"
                                class="form-control input-precio-unitario"
                                :style="{ width: '90px' }"
                                v-model.number="p.precioUnitario"
                                placeholder="Precio c/u"
                                @keydown="irAlSiguientePrecio"
                              />
                            </div>
                          </td>

                          <!-- SUBTOTAL -->
                          <td style="text-align: right">
                            <!-- Caso 1: Promoción individual -->
                            <div v-if="p.promo && p.promo.valor != null">
                              <span
                                class="text-decoration-line-through text-muted small"
                              >
                                {{
                                  formatoMoneda(
                                    (p.precioUnitario || 0) * (p.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ p.promo.nombre }}
                                  </small>
                                </span>
                              </span>
                              <br />
                              <span class="text-success fw-bold">
                                {{
                                  formatoMoneda(
                                    precioFinalItem(p, p.promo) *
                                      (p.cantidad ?? 1),
                                  )
                                }}
                              </span>
                            </div>

                            <!-- Caso 2: Aplica promoción general (sin promo individual y no excluido) -->
                            <div
                              v-else-if="
                                promoGeneral && !p.excluirPromocionGeneral
                              "
                            >
                              <span
                                class="text-decoration-line-through text-muted d-block small"
                              >
                                {{
                                  formatoMoneda(
                                    (p.precioUnitario || 0) * (p.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ promoGeneral.nombre }}
                                  </small>
                                </span>
                              </span>
                              <span class="text-success fw-bold d-block">
                                {{
                                  formatoMoneda(
                                    precioFinalItem(p, promoGeneral) *
                                      (p.cantidad ?? 1),
                                  )
                                }}
                              </span>
                            </div>

                            <!-- Caso 3: Excluido de promoción -->
                            <div
                              v-else-if="p.excluirPromocionGeneral"
                              class="text-muted fst-italic small"
                            >
                              {{
                                formatoMoneda(
                                  (p.precioUnitario || 0) * (p.cantidad ?? 1),
                                )
                              }}
                            </div>

                            <!-- Caso 4: Sin promociones -->
                            <div v-else>
                              {{
                                formatoMoneda(
                                  (p.precioUnitario || 0) * (p.cantidad ?? 1),
                                )
                              }}
                            </div>
                          </td>

                          <td>
                            <div
                              v-if="
                                p.promosAplicables && p.promosAplicables.length
                              "
                              class="mb-2"
                            >
                              <select
                                class="form-select form-select-sm"
                                v-model.number="p.idPromocionSeleccionada"
                                @change="onCambioPromoPaquete(p)"
                              >
                                <option :value="0">Sin promoción</option>

                                <option
                                  v-for="promo in p.promosAplicables"
                                  :key="promo.idPromocion"
                                  :value="promo.idPromocion"
                                >
                                  {{ promo.nombre }}
                                  ({{
                                    promo.tipo
                                      ? promo.valor + "%"
                                      : "$" + promo.valor
                                  }})
                                </option>
                              </select>
                            </div>

                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="eliminarPaquete(p.idPaquete)"
                              title="Eliminar paquete"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                        <!-- Servicios adicionales -->
                        <tr
                          v-for="(extra, i) in cotizacionForm.serviciosExtras"
                          :key="'servicio-' + i"
                        >
                          <td>
                            {{ extra.nombre }} {{ extra.observacion }}
                            <div class="mt-1">
                              <input
                                type="text"
                                v-model="extra.comentario"
                                class="form-control form-control-sm"
                                placeholder="Agregar comentario..."
                              />
                            </div>
                          </td>

                          <td>
                            <input
                              type="number"
                              min="1"
                              class="form-control"
                              :style="{ width: '70px' }"
                              v-model.number="extra.cantidad"
                              placeholder="1"
                            />
                          </td>

                          <!-- PRECIO UNITARIO -->
                          <td style="text-align: right">
                            <!-- Caso 4: Sin promociones -->
                            <div>
                              <input
                                min="0"
                                class="form-control input-precio-unitario"
                                :style="{ width: '90px' }"
                                v-model.number="extra.precioUnitario"
                                placeholder="Precio c/u"
                                @keydown="irAlSiguientePrecio"
                              />
                            </div>
                          </td>

                          <!-- SUBTOTAL -->
                          <td style="text-align: right">
                            <!-- Promo individual -->
                            <div
                              v-if="extra.promo && extra.promo.valor != null"
                            >
                              <span
                                class="text-decoration-line-through text-muted small"
                              >
                                {{
                                  formatoMoneda(
                                    (extra.precioUnitario || 0) *
                                      (extra.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ extra.promo.nombre }}
                                  </small>
                                </span>
                              </span>
                              <br />
                              <span class="text-success fw-bold">
                                {{
                                  formatoMoneda(
                                    precioFinalItem(extra, extra.promo) *
                                      (extra.cantidad ?? 1),
                                  )
                                }}
                              </span>
                            </div>

                            <!-- Promo general -->
                            <div
                              v-else-if="
                                promoGeneral && !extra.excluirPromocionGeneral
                              "
                            >
                              <span
                                class="text-decoration-line-through text-muted d-block small"
                              >
                                {{
                                  formatoMoneda(
                                    (extra.precioUnitario || 0) *
                                      (extra.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ promoGeneral.nombre }}
                                  </small>
                                </span>
                              </span>
                              <span class="text-success fw-bold d-block">
                                {{
                                  formatoMoneda(
                                    precioFinalItem(extra, promoGeneral) *
                                      (extra.cantidad ?? 1),
                                  )
                                }}
                              </span>
                            </div>

                            <!-- Excluido -->
                            <div
                              v-else-if="extra.excluirPromocionGeneral"
                              class="text-muted fst-italic small"
                            >
                              {{
                                formatoMoneda(
                                  (extra.precioUnitario || 0) *
                                    (extra.cantidad ?? 1),
                                )
                              }}
                            </div>

                            <!-- Sin promoción -->
                            <div v-else>
                              {{
                                formatoMoneda(
                                  (extra.precioUnitario || 0) *
                                    (extra.cantidad ?? 1),
                                )
                              }}
                            </div>
                          </td>

                          <td>
                            <div
                              v-if="
                                extra.promosAplicables &&
                                extra.promosAplicables.length
                              "
                              class="mb-2"
                            >
                              <select
                                class="form-select form-select-sm"
                                v-model.number="extra.idPromocionSeleccionada"
                                @change="onCambioPromoServicio(extra)"
                              >
                                <option :value="0">Sin promoción</option>

                                <option
                                  v-for="promo in extra.promosAplicables"
                                  :key="promo.idPromocion"
                                  :value="promo.idPromocion"
                                >
                                  {{ promo.nombre }}
                                  {{
                                    promo.tipo
                                      ? promo.valor + "%"
                                      : "$" + promo.valor
                                  }}
                                </option>
                              </select>
                            </div>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="
                                eliminarServicioExtra(
                                  extra.idDetalleCotizacionServicio ?? i,
                                )
                              "
                              title="Eliminar servicio"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <!-- TOTAL GENERAL -->
                        <tr v-if="cotizacionForm.mostrarTotal">
                          <td colspan="4" class="text-end fs-5 fw-bold">
                            Total:
                          </td>
                          <td colspan="2" class="fs-5 fw-bold text-end">
                            {{ formatoMoneda(totalCotizacion) }}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cerrar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="guardarCotizacion"
            >
              Guardar
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
  computed,
  onMounted,
  getCurrentInstance,
  reactive,
  onBeforeUnmount,
  nextTick,
  toRaw,
  onUnmounted,
} from "vue";
import EasyDataTable from "vue3-easy-data-table";
import Swal from "sweetalert2";
import EnviarCorreoModal from "@/components/EnviarCorreo/EnviarCorreoModal.vue";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useRouter } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();

const modalRef = ref(null);
let modalInstance = null;
const paquetesDisponibles = ref([]);
const clientesDisponibles = ref([]);
const items = ref([]);
const nuevoServicio = ref("");
const nuevoPrecio = ref("");
const nuevaCantidad = ref(1);
const nuevaObservacion = ref("");
const busquedaLlantas = ref("");
const busquedaCotizaciones = ref("");
const cotizacionesRealizadas = ref([]);

const vistaCotizacion = ref({});

const mostrarVista = ref(false);
const mostrarTotalEnVista = ref(false); // TODO: correjir este apartado o buscar otra forma de implementarlo
const tituloModal = ref("Nueva Cotización");
const codigoCotizacionEnEdicion = ref(null); // null = creación nueva
const filtroEstatus = ref("");
const loading = ref(true);

const itemsSelected = ref([]);
const paquetesSeleccionados = ref([]);

const sortBy = ref(""); // '' = sin columna activa
const sortType = ref("asc"); // 'asc' | 'desc'
const tableKey = ref(0); // para forzar re-montaje cuando quieras

const onUpdateSortBy = (v) => {
  sortBy.value = v ?? "";
};
const onUpdateSortType = (v) => {
  sortType.value = v === "desc" ? "desc" : "asc";
};

// success => "success"
// warning => "warning"
// info => ""
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

const promoGeneral = ref(null);
const promosGeneralesDisponibles = ref([]);

const resetTabla = () => {
  sortBy.value = "";
  sortType.value = "asc";
  busquedaLlantas.value = "";
  tableKey.value++;
};

const cotizacionForm = reactive({
  codigo: "", // ← Para saber si es edición
  clienteNombre: "",
  nombre: "",
  apellidos: "",
  clienteTelefono: "",
  clienteCorreo: "",
  clienteExistente: false,
  paquetes: [],
  paquetesDetalles: {},
  llantas: [],
  serviciosExtras: [],
  mostrarTotal: false,
  observaciones: "",
  fechaCreacion: new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
});

const preciosLlantas = reactive({});

/***********************************
 *  FUNCIONES INPUTS
 ***********************************/
const telefonoFormateado = computed({
  get() {
    const soloNumeros = cotizacionForm.clienteTelefono.replace(/\D/g, "");

    // Primeros 10 dígitos (teléfono base)
    const base = soloNumeros.slice(0, 10);
    const extra = soloNumeros.slice(10); 
    // extensiones u otros teléfonos

    let formateado = base;

    if (base.length > 6) {
      formateado = base.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (base.length > 3) {
      formateado = base.replace(/(\d{3})(\d{0,3})/, "$1 $2");
    }

    // Si hay más números, los agregamos separados
    return extra ? `${formateado} ${extra}` : formateado;
  },
  set(v) {
    // Guardamos SOLO números, sin límite
    cotizacionForm.clienteTelefono = v.replace(/\D/g, "");
  },
});


const telefonoVistaFormateado = computed(() => {
  if (!vistaCotizacion.value.cliente || !vistaCotizacion.value.cliente.telefono)
    return "Sin teléfono";

  let valor = vistaCotizacion.value.cliente.telefono.replace(/\D/g, "");
  if (valor.length > 10) valor = valor.substring(0, 10);

  if (valor.length > 6) {
    return valor.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3");
  } else if (valor.length > 3) {
    return valor.replace(/(\d{3})(\d{0,3})/, "$1 $2");
  } else {
    return valor;
  }
});
/***********************************
 *  FUNCIONES PARA TABLA COTIZACION
 ***********************************/

const cancelarCotizacion = (cotizacion) => {
  const json = {
    idCotizacion: parseInt(cotizacion.codigo.replace("COT-", ""), 10),
    idEstadoCotizacion: 4, // se puede obtimizar mas los estatus y usar una sola funcion para las 4 operaciones
    idUsuario: 1, //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
  };

  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      //console.log("Cotización actualizada:", data);
      cargarCotizaciones();
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

const reactivarCotizacion = (cotizacion) => {
  const json = {
    idCotizacion: parseInt(cotizacion.codigo.replace("COT-", ""), 10),
    idEstadoCotizacion: 1,
    idUsuario: 1, //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
  };
  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      //console.log("Cotización actualizada:", data);
      cargarCotizaciones();
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

const aprobarCotizacion = (cotizacion) => {
  const idCotizacion = Number(String(cotizacion.codigo).replace("COT-", ""));

  const json = {
    idCotizacion: idCotizacion, // parseInt(cotizacion.codigo.replace('COT-', ''), 10),
    idEstadoCotizacion: 2,
    idUsuario: 1, //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
  };

  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log(
        "Cotización actualizada:" + data + " idCot: " + json.idCotizacion,
      );
      cargarCotizaciones();

      router.push({
        name: "orden-trabajo-form",
        params: {
          idCotizacion: json.idCotizacion,
        },
      });
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

const observacionesVista = computed(() => {
  const obs = vistaCotizacion.value.cliente?.observaciones;
  console.log("observaciones raw:", obs);
  return obs === null || obs === undefined ? "No disponible" : obs;
});


const finalizarCotizacion = (cotizacion) => {
  const json = {
    idCotizacion: parseInt(cotizacion.codigo.replace("COT-", ""), 10),
    idEstadoCotizacion: 3,
    idUsuario: 1, //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
  };
  fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText}`);
      }
      return res.json();
    })
    .then((data) => {
      //console.log("Cotización actualizada:", data);
      cargarCotizaciones();
    })
    .catch((error) => {
      // Aquí capturas cualquier error de la API o de red
      console.error("Error en la petición:", error.message);
    });
};

/***********************************
 *  FUNCIONES PARA CARGA DE DATOS
 ***********************************/
// Función para cargar paquetes
const cargarPaquetes = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Paquetes/getPaquete");
    if (!res.ok) throw new Error("Error en la respuesta");
    const data = await res.json();
    // paquetesDisponibles.value = data
    data.map((p) => {
      const paquete = {
        idPaquete: p.idPaquete,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precioUnitario: Math.trunc(parseFloat(p.precioUnitario)) || 0,
      };

      paquetesDisponibles.value.push(paquete);
    });
  } catch (e) {
    console.error("Error al cargar paquetes:", e);
  }
};

// Función para cargar clientes
const cargarClientes = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Cliente/getClientes");
    if (!res.ok) throw new Error("Error al obtener clientes");
    const data = await res.json();
    clientesDisponibles.value = data;
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  }
};

// Función para cargar llantas
const cargarLlantas = async () => {
  try {
    const res = await fetch(proxy.$serverIP + "api/Llanta/getLlantaPrecio");
    if (!res.ok) throw new Error("Error al obtener llantas");
    const data = await res.json();

    // Limpia precios anteriores
    Object.keys(preciosLlantas).forEach((key) => delete preciosLlantas[key]);
    const llantaArray = [];
    data.map((llanta) => {
      const nombreCompleto = `${llanta.nombreMarca} ${llanta.modelo}`.trim();
      const sobrePedido = llanta.nombreAlmacen
        .toLowerCase()
        .includes("proveedor");
      preciosLlantas[llanta.idLlanta] = parseFloat(llanta.precio);

      const obj = {
        id: llanta.idLlanta,
        idInventarioInicial: llanta.idInventarioInicial,
        codigo: llanta.codigo,
        llanta: nombreCompleto,
        medida: llanta.medidas,
        rango: llanta.rango, // campo para colocar en cotizacionForm como el cliente la solicita medida - marca - modelo - rango
        cantidad: llanta.cantidad,
        ubicacion: llanta.nombreAlmacen,
        idAlmacen: llanta.idAlmacen,
        precio: parseFloat(llanta.precio) || 0,
        sobrePedido,
      };

      llantaArray.push(obj);
    });
    items.value = llantaArray;

    return items;
  } catch (error) {
    console.error("Error al cargar llantas:", error);
  }
};

// Función para cargar cotizaciones
const cargarCotizaciones = async () => {
  loading.value = true;
  try {
    const res = await fetch(
      proxy.$serverIP + "api/Cotizacion/resumenCotizaciones",
    );
    if (!res.ok) throw new Error("Error al obtener cotizaciones");
    const data = await res.json();

    cotizacionesRealizadas.value = data.map((c, i) => ({
      codigo: "COT-" + String(c.idCotizacion).padStart(5, "0"), // Ej: COT-00001
      fechaCreacion: new Date(c.fechaCreacion).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      cliente: {
        nombre: c.clienteNombre,
        telefono: c.telefono,
        correo: c.correo,
        observaciones: c.observaciones || "", // <-- agregado
      },
      paquetes:
        c.nombresPaquetes === "Ninguno"
          ? []
          : c.nombresPaquetes.split(", ").map((nombre) => ({ nombre })),
      llantasSelecionadas: [],
      serviciosAdicionales: [],
      total: c.total,
      estatus: c.estado,
      nombreLlanta: c.nombreLlanta,
      mostrarTotal: false,
    }));
    loading.value = false;
  } catch (error) {
    console.error("Error al cargar cotizaciones:", error);
  }
};

const registrarCerrarConEsc = (mostrarVista) => {
  //console.log()
  const listener = (e) => {
    if (e.key !== "Escape") return;

    // 1Si la vista previa está activa, la cerramos
    if (mostrarVista.value) {
      mostrarVista.value = false;
      return;
    }

    // Si el modal de edición está abierto, lo cerramos
    if (modalInstance && modalRef.value.classList.contains("show")) {
      closeModal();
      return;
    }
  };

  window.addEventListener("keydown", listener);

  return () => window.removeEventListener("keydown", listener);
};

/*************************************/
/*      AL MONTAR COMPONENTE
    /*************************************/
onMounted(() => {
  const el = modalRef.value;
  el?.addEventListener("hidden.bs.modal", resetTabla);
});

let cleanupEscListener = null; // <-- DECLARADO ANTES DE onMounted

onMounted(async () => {
  cargarPaquetes();
  cargarClientes();
  cargarLlantas();
  cargarCotizaciones();
  cargarAlmacenes();
  cargarPromosGenerales();
  cleanupEscListener = registrarCerrarConEsc(mostrarVista);
});

onBeforeUnmount(() => {
  const el = modalRef.value;
  el?.removeEventListener("hidden.bs.modal", resetTabla);

  if (cleanupEscListener) cleanupEscListener();
});

/*********************************************
        FUNCIONES PARA MODAL CREACION/EDICION
    **********************************************/

const irAlSiguientePrecio = (event) => {
  const isTab = event.key === "Tab";
  const isEnter = event.key === "Enter";
  const isShift = event.shiftKey;

  // Solo intercepta Tab o Enter
  if (!isTab && !isEnter) return;

  event.preventDefault(); // Evita comportamiento por defecto

  // Obtener todos los inputs
  const inputs = Array.from(
    document.querySelectorAll(".input-precio-unitario"),
  );
  const currentIndex = inputs.indexOf(event.target);

  // ⬅⬅⬅ Retroceder con Shift + Tab
  if (isTab && isShift) {
    if (inputs[currentIndex - 1]) {
      inputs[currentIndex - 1].focus();
    } else {
      // Si es el primero, ir al último
      inputs[inputs.length - 1]?.focus();
    }
    return;
  }

  // ➡➡➡ Avanzar con Tab o Enter
  if (inputs[currentIndex + 1]) {
    inputs[currentIndex + 1].focus();
  } else {
    // Si está en el último, vuelve al primero
    inputs[0]?.focus();
  }
};

// Elimina paquete del arreglo
const eliminarPaquete = (idPaquete) => {
  // Elimina el paquete del arreglo
  cotizacionForm.paquetes = cotizacionForm.paquetes.filter(
    (p) => p.idPaquete !== idPaquete,
  );

  // Limpia el detalle asociado (si existe)
  if (
    cotizacionForm.paquetesDetalles &&
    cotizacionForm.paquetesDetalles[idPaquete]
  ) {
    delete cotizacionForm.paquetesDetalles[idPaquete];
  }
};

// Paquetes
// Relaciona el objeto de los checkbox con el objeto que se guarda/edita, eliminando o agregando a cotizacion
watch(
  () => cotizacionForm.paquetes,
  (nuevosSeleccionados) => {
    const actuales = nuevosSeleccionados.map((p) => p.idPaquete);

    // Elimina de paquetesDetalles los que ya no estén seleccionados
    Object.keys(cotizacionForm.paquetesDetalles).forEach((idPaquete) => {
      if (!actuales.includes(Number(idPaquete))) {
        delete cotizacionForm.paquetesDetalles[idPaquete];
      }
    });
  },
);

// Paquetes: colocarlo por default cuando de carge el componente
// Si no hay paquete seleccionado y ya se cargaron los paquetes, pon el primero como default
watch(
  paquetesDisponibles,
  (nuevoValor) => {
    // Solo aplica si es una nueva cotización (no edición)
    if (
      !cotizacionForm.codigo &&
      nuevoValor.length &&
      cotizacionForm.paquetes.length === 0
    ) {
      cotizacionForm.paquetes = [nuevoValor[0]];
    }
  },
  { immediate: true },
);

// Agrega Servicio Adicionales al arreglo CotizacionesForm
const agregarServicioExtra = async () => {
  const nombre = (nuevoServicio.value || "").trim().toUpperCase();
  const observacion = (nuevaObservacion.value || "").trim().toUpperCase();
  const cantidad = parseInt(nuevaCantidad.value);
  const precio = parseFloat(nuevoPrecio.value);

  if (!nombre) {
    mostrarToast("warning", "Debes ingresar el nombre del servicio.");
    return;
  }
  if (isNaN(cantidad) || cantidad <= 0) {
    mostrarToast("warning", "La cantidad debe ser mayor a 0.");
    return;
  }
  if (isNaN(precio) || precio <= 0) {
    mostrarToast("warning", "El precio debe ser mayor a 0.");
    return;
  }

  const duplicado = cotizacionForm.serviciosExtras.some(
    (s) => s.nombre.trim().toUpperCase() === nombre,
  );
  if (duplicado) {
    mostrarToast("warning", "Ya existe un servicio con ese nombre.");
    return;
  }

  const servicio = {
    idDetalleCotizacionServicio: null,
    nombre,
    observacion,
    cantidad,
    precioUnitario: Math.trunc(parseFloat(precio)) || 0,

    promo: null,
    promosAplicables: [],
    idPromocionSeleccionada: 0,
    precioConPromo: precio,
    excluirPromocionGeneral: false,
    comentario: "",
  };

  try {
    const promos = await obtenerPromosGeneralesParaServicio();
    servicio.promosAplicables = promos;
  } catch (error) {
    servicio.promosAplicables = [];
  }

  cotizacionForm.serviciosExtras.push(servicio);

  nuevoServicio.value = "";
  nuevaCantidad.value = 1;
  nuevoPrecio.value = "";
  nuevaObservacion.value = "";
};

// Elimina ServicioAdicional del arreglo
const eliminarServicioExtra = (id) => {
  // Si el idDetalleCotizacionServicio es nulo, usa el índice (i) como respaldo
  cotizacionForm.serviciosExtras = cotizacionForm.serviciosExtras.filter(
    (s, i) => (s.idDetalleCotizacionServicio ?? i) !== id,
  );
};

// Elimina la llanta del arreglo
// Opcional: elimina también su cantidad para limpiar el objeto
const eliminarLlanta = (idLlanta) => {
  cotizacionForm.llantas = cotizacionForm.llantas.filter(
    (ll) => ll.idLlanta !== idLlanta,
  );
};

// Agrega la llanta al arreglo
const agregarLlanta = async (item) => {
  if (cotizacionForm.llantas.length >= 6) {
    mostrarToast("warning", "No puedes agregar más de 6 llantas");
    return;
  }

  // console.log(item.llanta)

  const yaExiste = cotizacionForm.llantas.some((ll) => ll.idLlanta === item.id);
  if (yaExiste) {
    console.log("agregarLLanta: ya existe esa llanta");
    return;
  }

  const nuevaLlanta = {
    idDetalleCotizacionLlanta: null,
    idLlanta: item.id,
    idInventarioInicial: item.idInventarioInicial,
    cantidad: 4,
    precioUnitario: Math.trunc(parseFloat(item.precio)) || 0,
    modeloMedidas: `${item.medida} ${item.rango} ${item.llanta}`,
    marca: item.marca,
    idAlmacen: item.idAlmacen,
    ubicacion: item.ubicacion,

    promo: null,
    promosAplicables: [],
    precioConPromo: null,
    idPromocionSeleccionada: 0,
    excluirPromocionGeneral: false,
    comentario: "",
  };

  //console.log('Agregar Llanta: obj enviado '+ JSON.stringify(item))
  //console.log('Agregar Llanta: nuevo obj '+JSON.stringify(nuevaLlanta))

  try {
    //console.log(nuevaLlanta.idInventarioInicial)
    const promosDisponibles = await obtenerPromosPorInventario(
      nuevaLlanta.idInventarioInicial,
    );

    nuevaLlanta.promosAplicables = promosDisponibles || [];
    nuevaLlanta.idPromocionSeleccionada = 0;
    nuevaLlanta.promo = null;
    nuevaLlanta.precioConPromo = nuevaLlanta.precioUnitario;
  } catch (error) {
    console.error("Error al consultar promociones:", error);
    nuevaLlanta.promosAplicables = [];
    nuevaLlanta.idPromocionSeleccionada = 0;
    nuevaLlanta.promo = null;
    nuevaLlanta.precioConPromo = nuevaLlanta.precioUnitario;
  }

  cotizacionForm.llantas.push(nuevaLlanta);

  cotizacionForm.llantas.sort((a, b) => {
    const prioridad = (llanta) => {
      const modelo = llanta.modeloMedidas?.toUpperCase() || "";
      if (modelo.includes("BRIDGESTONE")) return 1;
      if (modelo.includes("FIRESTONE")) return 2;
      return 3; // resto de marcas
    };

    const aPrioridad = prioridad(a);
    const bPrioridad = prioridad(b);

    if (aPrioridad !== bPrioridad) {
      return aPrioridad - bPrioridad;
    }

    // Si tienen la misma prioridad, ordenar por precio de mayor a menor
    return (b.precioUnitario || 0) - (a.precioUnitario || 0);
  });

  //console.log('agregarLlanta2: '+ JSON.stringify(cotizacionForm.llantas))
};

// Obtener promociones aplicables a una llanta (por inventario)
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

// Helper reutilizable
const aplicarPromo = (precio, promoIndividual, promoGlobal) => {
  if (promoIndividual && promoIndividual.valor != null) {
    return promoIndividual.tipo
      ? precio * (1 - promoIndividual.valor / 100)
      : Math.max(0, precio - promoIndividual.valor);
  } else if (promoGlobal && promoGlobal.valor != null) {
    return promoGlobal.tipo
      ? precio * (1 - promoGlobal.valor / 100)
      : Math.max(0, precio - promoGlobal.valor);
  }
  return precio;
};

// aplica la promocion
const onCambioPromoLlanta = (llanta) => {
  const idSel = llanta.idPromocionSeleccionada;

  if (!idSel) {
    // Sin promoción
    llanta.promo = null;
    llanta.precioConPromo = llanta.precioUnitario;
    return;
  }

  const promo = (llanta.promosAplicables || []).find(
    (p) => p.idPromocion === idSel,
  );

  llanta.promo = promo || null;

  // Recalculamos precio con la promoción individual (sin mezclar general aún)
  const base = llanta.precioUnitario ?? 0;

  if (promo) {
    llanta.precioConPromo = promo.tipo
      ? base * (1 - promo.valor / 100) // tipo = true → porcentaje
      : Math.max(0, base - promo.valor); // tipo = false → monto fijo
  } else {
    llanta.precioConPromo = base;
  }
};

// aplica promo seleccionada
const onCambioPromoPaquete = (paquete) => {
  const idSel = paquete.idPromocionSeleccionada;

  if (!idSel) {
    paquete.promo = null;
    paquete.precioConPromo = paquete.precioUnitario;
    return;
  }

  const promo = paquete.promosAplicables.find((p) => p.idPromocion === idSel);
  paquete.promo = promo || null;

  const base = paquete.precioUnitario ?? 0;

  if (promo) {
    paquete.precioConPromo = promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor);
  } else {
    paquete.precioConPromo = base;
  }
};

const onCambioPromoServicio = (servicio) => {
  const idSel = servicio.idPromocionSeleccionada;

  if (!idSel) {
    servicio.promo = null;
    servicio.precioConPromo = servicio.precioUnitario;
    return;
  }

  const promo = servicio.promosAplicables.find((p) => p.idPromocion === idSel);
  servicio.promo = promo || null;

  const base = servicio.precioUnitario ?? 0;

  servicio.precioConPromo = promo
    ? promo.tipo
      ? base * (1 - promo.valor / 100)
      : Math.max(0, base - promo.valor)
    : base;
};

const precioFinalItem = (item, promoGlobal) => {
  const base = item.precioUnitario ?? 0;

  // Si tiene promo individual → aplica esa
  // si tiene tipo Promo false es Monto, si es true es Porcentual
  if (item.promo && item.promo.valor != null) {
    return item.promo.tipo
      ? base * (1 - item.promo.valor / 100)
      : Math.max(0, base - item.promo.valor);
  }

  // Si tiene promo general y no está excluido → aplica
  if (
    promoGlobal &&
    promoGlobal.valor != null &&
    !item.excluirPromocionGeneral
  ) {
    return promoGlobal.tipo
      ? base * (1 - promoGlobal.valor / 100)
      : Math.max(0, base - promoGlobal.valor);
  }

  // Si está excluido o sin promo
  return base;
};

watch(
  () => cotizacionForm.paquetes,
  async (nuevosPaquetes) => {
    for (const p of nuevosPaquetes) {
      // Ya configurado antes (evitar repetir)
      if (p.promosAplicables !== undefined) continue;

      // Inicialización
      p.promo = null;
      p.idPromocionSeleccionada = 0;
      p.promosAplicables = [];
      p.precioConPromo = p.precioUnitario;
      p.excluirPromocionGeneral = false;

      // Consultar promociones aplicables
      const promos = await obtenerPromosPorPaquete(p.idPaquete);

      p.promosAplicables = promos || [];
    }
  },
  { deep: true },
);

const cargarFormulario = async (cotizacion = null) => {
  // 🔹 Guardamos lo que el usuario haya escrito
  const observacionesPrevias = cotizacionForm.observaciones || "";

  if (!cotizacion) {
    Object.assign(cotizacionForm, {
      codigo: "",
      clienteNombre: "",
      nombre: "",
      apellidos: "",
      clienteTelefono: "",
      clienteCorreo: "",
      clienteExistente: false,
      paquetes: paquetesDisponibles.value.length
        ? [paquetesDisponibles.value[0]]
        : [],
      paquetesDetalles: {},
      llantas: [],
      serviciosExtras: [],
      mostrarTotal: false,
      fechaCreacion: new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      observaciones: observacionesPrevias, // 🔹 Conservamos lo escrito
    });

    promoGeneral.value = null;
    itemsSelected.value = [];
    paquetesSeleccionados.value = [];

    console.log("🧹 FORM LIMPIO:", JSON.stringify(cotizacionForm)); // 🔹 log claro
    return;
  }

  // Si se carga una cotización existente
  try {
    const codigoStr = String(cotizacion?.codigo ?? "").trim();
    const codigoLimpio = codigoStr.startsWith("COT-")
      ? codigoStr.replace("COT-", "")
      : codigoStr;

    console.log("Codigo Info: "+codigoLimpio)
    const res = await fetch(
      `${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${codigoLimpio}`
    );

    if (!res.ok) {
      console.error("❌ Error HTTP:", res.status, res.statusText);
      mostrarToast("warning", `No se pudo cargar la cotización: ${res.statusText}`);
      return;
    }

    const data = await res.json();
    
    // 🔹 Cargar datos de cliente
    cotizacionForm.codigo = "COT-" + data.idCotizacion;
    cotizacionForm.fechaCreacion = data.fechaCreacion;
    cotizacionForm.clienteNombre = data.clienteNombre;
    cotizacionForm.nombre = data.nombres;
    cotizacionForm.apellidos = data.apPaterno + " " + data.apMaterno;
    cotizacionForm.clienteTelefono = data.telefono;
    cotizacionForm.clienteCorreo = data.correo;
    cotizacionForm.clienteExistente = false;
    cotizacionForm.mostrarTotal = data.mostrarTotal;

    // ===============================
    // 🔹 PAQUETES
    // ===============================
    cotizacionForm.paquetes = await Promise.all(
      data.paquetes.map(async (p) => {
        const base = paquetesDisponibles.value.find(
          (q) => q.idPaquete === p.idPaquete,
        );
        if (!base) return null;

        // 🔹 Determinar si tiene promoción individual
        const promoIndividual = p.idPromocion
          ? {
              idPromocion: p.idPromocion,
              nombre: p.nombrePromocion,
              valor: p.valorPromocion,
              tipo: p.tipoPromocion,
            }
          : null;

        // 🔹 Obtener promociones aplicables desde la API
        const promosAplicables = await obtenerPromosPorPaquete(p.idPaquete);

        // 🔹 Calcular precio con la función estándar
        const precioFinal = precioFinalItem(
          {
            precioUnitario: p.precioUnitario,
            promo: promoIndividual,
            excluirPromocionGeneral: p.excluirPromocionGeneral,
          },
          promoGeneral.value,
        );

        return {
          ...base,
          precioUnitario: p.precioUnitario,
          precioConPromo: precioFinal,

          comentario: p.comentario || "",
          excluirPromocionGeneral: p.excluirPromocionGeneral ?? false,

          promosAplicables,
          promo: promoIndividual,
          idPromocionSeleccionada: promoIndividual
            ? promoIndividual.idPromocion
            : 0,
        };
      }),
    );

    // Registrar idDetalle para edición
    data.paquetes.forEach((p) => {
      cotizacionForm.paquetesDetalles[p.idPaquete] =
        p.idDetalleCotizacionPaquete;
    });

    // ===============================
    // 🔹 LLANTAS
    // ===============================
    cotizacionForm.llantas = await Promise.all(
      data.llantas.map(async (ll) => {
        // 1. Promo individual si existe
        const promoIndividual =
          ll.idPromocion && ll.valorPromocion != null
            ? {
                idPromocion: ll.idPromocion,
                nombre: ll.nombrePromocion,
                valor: ll.valorPromocion,
                tipo: ll.tipoPromocion,
              }
            : null;

        // 2. Obtener promociones aplicables desde API
        const promosAplicables = await obtenerPromosPorInventario(
          ll.idInventarioInicial,
        );

        // 3. Calcular precio con promo
        const precioBase = ll.precioUnitario;
        const precioConPromo = precioFinalItem(
          {
            precioUnitario: precioBase,
            promo: promoIndividual,
            excluirPromocionGeneral: ll.excluirPromocionGeneral,
          },
          promoGeneral.value,
        );

        return {
          idDetalleCotizacionLlanta: ll.idDetalleCotizacionLlanta,
          idLlanta: ll.idLlanta,
          idInventarioInicial: ll.idInventarioInicial,
          idAlmacen: ll.idAlmacen,
          cantidad: ll.cantidad,
          precioUnitario: precioBase,
          modeloMedidas: ll.modeloMedidas,
          ubicacion: ll.ubicacion,

          promosAplicables,
          promo: promoIndividual,
          idPromocionSeleccionada: promoIndividual
            ? promoIndividual.idPromocion
            : 0,

          precioConPromo,
          excluirPromocionGeneral: ll.excluirPromocionGeneral ?? false,
          comentario: ll.comentario || "",
        };
      }),
    );

    // ===============================
    // 🔹 SERVICIOS EXTRAS
    // ===============================
    cotizacionForm.serviciosExtras = await Promise.all(
      data.servicios.map(async (s) => {
        const promoIndividual =
          s.valorPromocion != null
            ? {
                idPromocion: s.idPromocion,
                nombre: s.nombrePromocion,
                valor: s.valorPromocion,
                tipo: s.tipoPromocion,
              }
            : null;

        const promosAplicables = await obtenerPromosGeneralesParaServicio();

        const precioBase = s.precioUnitario ?? 0;

        const precioConPromo = precioFinalItem(
          {
            precioUnitario: precioBase,
            promo: promoIndividual,
            excluirPromocionGeneral: s.excluirPromocionGeneral,
          },
          promoGeneral.value,
        );

        return {
          idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
          nombre: s.descripcion,
          observacion: s.observacion,
          cantidad: s.cantidad,
          precioUnitario: precioBase,

          promosAplicables,
          promo: promoIndividual,
          idPromocionSeleccionada: promoIndividual
            ? promoIndividual.idPromocion
            : 0,

          precioConPromo,
          excluirPromocionGeneral: s.excluirPromocionGeneral ?? false,
          comentario: s.comentario || "",
        };
      }),
    );

    //console.log(data)
  } catch (e) {
    console.error("Error cargando cotización para edición:", e);
    mostrarToast("warning", "No se pudo cargar la cotización");
  }
};


const cargarPromosGenerales = async () => {
  try {
    const res = await fetch(
      `${proxy.$serverIP}api/Promocion/getPromocionesGenerales`,
    );
    if (!res.ok) throw new Error("Error al obtener promociones generales");

    const data = await res.json();
    promosGeneralesDisponibles.value = data;

    if (data.length > 0) {
      //console.log(`Se cargaron ${data.length} promociones generales activas.`);
    } else {
      console.log(" No hay promociones generales activas.");
    }
  } catch (error) {
    console.error("Error al cargar promociones generales:", error);
  }
};

const aplicarPromocionGeneral = async () => {
  const promos = promosGeneralesDisponibles.value;

  if (promos.length === 0) {
    Swal.fire(
      "Sin promociones",
      "No hay promociones generales activas.",
      "info",
    );
    return;
  }

  let html = "<p>Selecciona una promoción general para aplicar:</p>";
  promos.forEach((promo, i) => {
    html += `
            <div style="text-align:left;margin-bottom:8px;">
                <input type="radio" name="promoGeneral" id="promoGeneral_${i}" value="${
      promo.idPromocion
    }" style="margin-right:6px;">
                <label for="promoGeneral_${i}">
                <strong>${promo.nombre}</strong> — ${
      promo.tipo
        ? `Descuento del ${promo.valor}%`
        : `Descuento de $${promo.valor}`
    }
                </label>
            </div>
            `;
  });

  const { value: promoId } = await Swal.fire({
    title: "Promociones generales",
    html,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Aplicar promoción",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const checked = document.querySelector(
        'input[name="promoGeneral"]:checked',
      );
      return checked ? checked.value : null;
    },
  });

  if (!promoId) return;

  const seleccionada = promos.find((p) => p.idPromocion == promoId);
  promoGeneral.value = seleccionada;

  // 🔸 Recalcular precios con la nueva promoción general
  cotizacionForm.llantas.forEach((ll) => {
    ll.precioConPromo = aplicarPromo(
      ll.precioUnitario,
      ll.promo,
      promoGeneral.value,
    );
  });

  cotizacionForm.paquetes.forEach((p) => {
    p.precioConPromo = aplicarPromo(
      p.precioUnitario,
      p.promo,
      promoGeneral.value,
    );
  });

  cotizacionForm.serviciosExtras.forEach((s) => {
    s.precioConPromo = aplicarPromo(
      s.precioUnitario,
      s.promo,
      promoGeneral.value,
    );
  });

  // Forzar reactividad profunda
  await nextTick(() => {
    cotizacionForm.llantas = JSON.parse(
      JSON.stringify(toRaw(cotizacionForm.llantas)),
    );
    cotizacionForm.paquetes = JSON.parse(
      JSON.stringify(toRaw(cotizacionForm.paquetes)),
    );
    cotizacionForm.serviciosExtras = JSON.parse(
      JSON.stringify(toRaw(cotizacionForm.serviciosExtras)),
    );
  });

  // 🔸 Actualización visual inmediata
  Swal.fire({
    icon: "success",
    title: "Promoción aplicada",
    text: `Se aplicó "${seleccionada.nombre}" correctamente.`,
  });
};


// CREAR / EDITAR COTIZACIONES
const guardarCotizacion = async () => {
  try {
    /* ================= VALIDACIONES ================= */

    const llantaInvalida = cotizacionForm.llantas.find(
      (l) =>
        isNaN(Number(l.cantidad)) ||
        Number(l.cantidad) <= 0 ||
        isNaN(Number(l.precioUnitario)) ||
        Number(l.precioUnitario) <= 0
    );

    if (llantaInvalida) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos en llantas",
        text: "Verifica las cantidades y precios de las llantas.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const paqueteInvalido = cotizacionForm.paquetes.find(
      (p) => isNaN(Number(p.precioUnitario)) || Number(p.precioUnitario) <= 0
    );

    if (paqueteInvalido) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos en paquetes",
        text: "Verifica los precios de los paquetes.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const servicioInvalido = cotizacionForm.serviciosExtras.find(
      (s) =>
        isNaN(Number(s.cantidad)) ||
        Number(s.cantidad) <= 0 ||
        isNaN(Number(s.precioUnitario)) ||
        Number(s.precioUnitario) <= 0
    );

    if (servicioInvalido) {
      await Swal.fire({
        icon: "warning",
        title: "Datos inválidos en servicios adicionales",
        text: "Verifica las cantidades y precios de los servicios.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    /* ================= CLIENTE ================= */

    const rawId = cotizacionForm.codigo
      ? Number(cotizacionForm.codigo.replace(/^COT-/, ""))
      : null;

    let clienteEncontrado = null;

    if (cotizacionForm.clienteExistente) {
      clienteEncontrado = clientesDisponibles.value.find(
        (c) => c.nombres === cotizacionForm.clienteExistente
      );
    }

    // ⚠️ IMPORTANTE: NO reconstruir el nombre en editar
    const cliente = clienteEncontrado
      ? {
          idCliente: clienteEncontrado.idCliente,
          nombre: `${clienteEncontrado.nombres} ${clienteEncontrado.apPaterno} ${clienteEncontrado.apMaterno}`.trim(),
          nombres: clienteEncontrado.nombres,
          apellidos: `${clienteEncontrado.apPaterno} ${clienteEncontrado.apMaterno}`.trim(),
          telefono: clienteEncontrado.telefono,
          correo: clienteEncontrado.correo,
          observaciones: cotizacionForm.observaciones || "",
        }
      : {
          idCliente: null,
          nombre: cotizacionForm.clienteNombre || "",
          nombres: cotizacionForm.clienteNombre || "",
          apellidos: cotizacionForm.apellidos || "",
          telefono: cotizacionForm.clienteTelefono || "",
          correo: cotizacionForm.clienteCorreo || "",
          observaciones: cotizacionForm.observaciones || "",
        };

    /* ================= MAPEO ================= */

    const llantas = cotizacionForm.llantas.map((ll) => ({
      idDetalleCotizacionLlanta: ll.idDetalleCotizacionLlanta || null,
      idLlanta: ll.idLlanta,
      idInventarioInicial: ll.idInventarioInicial,
      cantidad: Number(ll.cantidad),
      precioUnitario: Number(ll.precioUnitario),
      idAlmacen: ll.idAlmacen,
      idPromocion: ll.promo?.idPromocion ?? null,
      excluirPromocionGeneral: ll.excluirPromocionGeneral ? 1 : 0,
      comentario: ll.comentario || "",
    }));

    const paquetes = cotizacionForm.paquetes.map((p) => ({
      idDetalleCotizacionPaquete:
        cotizacionForm.paquetesDetalles?.[p.idPaquete] || null,
      idPaquete: p.idPaquete,
      idPromocion: p.promo?.idPromocion ?? null,
      cantidad: p.cantidad ?? 1,
      precioUnitario: Number(p.precioUnitario),
      excluirPromocionGeneral: p.excluirPromocionGeneral ? 1 : 0,
      comentario: p.comentario || "",
    }));

    const serviciosAdicionales = cotizacionForm.serviciosExtras.map((s) => ({
      idDetalleCotizacionServicio: s.idDetalleCotizacionServicio || null,
      idPromocion: s.promo?.idPromocion ?? null,
      descripcionServicio: s.nombre,
      observacion: s.observacion || "",
      cantidad: Number(s.cantidad),
      precioUnitario: Number(s.precioUnitario),
      excluirPromocionGeneral: s.excluirPromocionGeneral ? 1 : 0,
      comentario: s.comentario || "",
    }));

    /* ================= PAYLOAD ================= */

    const nuevaCotizacion = {
      codigo: rawId,
      mostrarTotal: cotizacionForm.mostrarTotal,
      cliente,
      llantas,
      paquetes,
      serviciosAdicionales,
      creadoPor: 1,
      idPromocionGeneral: promoGeneral.value?.idPromocion ?? null,
    };

    console.log("PAYLOAD FINAL:", nuevaCotizacion);

    /* ================= REQUEST ================= */

    const url = cotizacionForm.codigo
      ? `${proxy.$serverIP}api/Cotizacion/editarCotizacion`
      : `${proxy.$serverIP}api/Cotizacion/crearCotizacion`;

    const res = await fetch(url, {
      method: cotizacionForm.codigo ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaCotizacion),
    });

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("RESPUESTA BACKEND:", data);

    mostrarToast("success", "Cotización guardada");

    cargarFormulario();
    closeModal();
    cargarCotizaciones();
    mostrarVistaPrevia({ codigo: data?.codigo?.toString() }, "ver");

  } catch (error) {
    console.error("ERROR guardarCotizacion:", error);
    Swal.fire("Error", "No se pudo guardar la cotización.", "error");
  }
};






const subtotalLlantas = computed(() => {
  return cotizacionForm.llantas.reduce((sum, ll) => {
    const cantidad = ll.cantidad ?? 1;
    return sum + precioFinalItem(ll, promoGeneral.value) * cantidad;
  }, 0);
});

const subtotalPaquete = computed(() => {
  return cotizacionForm.paquetes.reduce((sum, p) => {
    const cantidad = p.cantidad ?? 1;
    return sum + precioFinalItem(p, promoGeneral.value) * cantidad;
  }, 0);
});

const subtotalExtras = computed(() => {
  return cotizacionForm.serviciosExtras.reduce((sum, s) => {
    const cantidad = s.cantidad ?? 1;
    return sum + precioFinalItem(s, promoGeneral.value) * cantidad;
  }, 0);
});

const totalCotizacion = computed(() => {
  return subtotalLlantas.value + subtotalPaquete.value + subtotalExtras.value;
});

/************************************/
/*   BUSQUEDA LLANTAS CON PRECIO    */
/************************************/

/* ====== 1) Constantes/Helpers ====== */
const brandPriority = { bridgestone: 1, firestone: 2 };
const multiwordBrands = ["ngt auto", "general tire"];
const reSplit = /[\s\/\-]+/;
const reNonAN = /[^a-z0-9]/gi;
const collator = new Intl.Collator("es", { sensitivity: "base" });

function extractMarcaFromLlanta(llanta) {
  const t = (llanta || "").toString().trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  const mw = multiwordBrands.find((m) => lower.startsWith(m + " "));

  return (mw ? mw : t.split(/[\s-]+/, 1)[0]).toUpperCase();
}

function parsePrecio(v) {
  if (v == null) return Number.POSITIVE_INFINITY;
  if (typeof v === "number")
    return Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
  const n = Number(
    v
      .toString()
      .replace(/[^\d.,-]/g, "")
      .replace(/\./g, "")
      .replace(",", "."),
  );

  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

/* ====== 2) Prepara ítems una sola vez ====== */
const preparedItems = computed(() =>
  (items.value || []).map((it) => {
    const codigo = (it.codigo ?? "").toString();
    const llanta = (it.llanta ?? "").toString();
    const medida = (it.medida ?? "").toString();
    const rango = (it.rango ?? "").toString();
    const ubic = (it.ubicacion ?? "").toString();

    const text = (
      llanta +
      " " +
      medida +
      " " +
      rango +
      " " +
      ubic
    ).toLowerCase();
    const unido = text.replace(reNonAN, "");

    const marca = extractMarcaFromLlanta(llanta);
    const brandRank = brandPriority[marca.toLowerCase()] ?? 3;
    const idInventarioInicial = (it.idInventarioInicial ?? "").toString();

    return {
      ...it,
      _text: text,
      _unido: unido,
      _marca: marca,
      _brandRank: brandRank,
      _priceNum: parsePrecio(it.precio),
      _code: codigo,
      _idInventarioInicial: idInventarioInicial,
    };
  }),
);

/* ====== 3) Orden base (una sola vez) ====== */
const baseSorted = computed(() => {
  const arr = preparedItems.value.slice();

  arr.sort((a, b) => {
    // 1. Prioridad por marca
    if (a._brandRank !== b._brandRank) return a._brandRank - b._brandRank;

    // 2. Precio DESC (mayor primero)
    if (a._priceNum !== b._priceNum) return b._priceNum - a._priceNum;

    return collator.compare(a._code, b._code);
  });

  return arr;
});

/* ====== 4) Debounce de la búsqueda ====== */
const q = busquedaLlantas; // tu ref existente
const qDebounced = ref("");
let _t; // timer
watch(q, (val) => {
  clearTimeout(_t);
  _t = setTimeout(() => {
    qDebounced.value = (val || "").toLowerCase().trim();
  }, 250); // ajusta 200–300ms
});

/* ====== 5) Filtrado usando el orden base (sin reordenar en cada tecla) ====== */
const itemsFiltrados = computed(() => {
  const term = qDebounced.value;
  let base = baseSorted.value;

  // Filtro por búsqueda de texto
  if (term) {
    const palabras = term.split(reSplit).filter(Boolean);
    base = base.filter((it) => {
      const t = it._text,
        u = it._unido;
      for (let i = 0; i < palabras.length; i++) {
        const p = palabras[i];
        const pn = p.replace(reNonAN, "");
        if (!(t.includes(p) || u.includes(pn))) return false;
      }
      return true;
    });
  }

  // Filtro por almacenes seleccionados
  if (selectedAlmacenes.value.length > 0) {
    base = base.filter((it) => selectedAlmacenes.value.includes(it.ubicacion));
  }

  return base;
});

const toggleTodos = (e) => {
  // Si marca “Todos”, limpiar los filtros
  if (e.target.checked) {
    selectedAlmacenes.value = [];
  }
};

/*************************************/
/*      FUNCION DROPDAWN ALMACENES
    /*************************************/
const almacenes = ref([
  { id: 1, nombre: "Kartisimo" },
  { id: 2, nombre: "Bridgestone" },
  { id: 3, nombre: "Sucursal Sur" },
]);

const selectedAlmacenes = ref([]);
const dropdownOpen = ref(false);

const cargarAlmacenes = async () => {
  try {
    const response = await fetch(`${proxy.$serverIP}api/Almacen/getAlmacen`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json(); // <- aquí parseas el JSON real

    //console.log('Datos recibidos:', data)
    // Aquí mapeamos para que tenga el mismo formato que esperabas
    almacenes.value = data.map((a) => ({
      id: a.idAlmacen,
      nombre: a.nombre,
    }));
  } catch (error) {
    console.error("Error cargando almacenes:", error);
  }
};

/*************************************/
/*      ABRIR/CERRAR MODAL
    /*************************************/
const openModal = () => {
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(modalRef.value, {
      keyboard: false,
    });
  }
  modalInstance.show();
};

const closeModal = () => {
  modalInstance?.hide();
  codigoCotizacionEnEdicion.value = null;
  resetTabla();
  cargarFormulario(); // limpia informacoin
};

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(valor);
};



// Abrir modal para nueva cotización o edición
const abrirModalCotizacion = (cotizacion = null) => {
  if (cotizacion && cotizacion.codigo) {
    tituloModal.value = "Editar Cotización";
  } else {
    tituloModal.value = "Nueva Cotización";

    // Solo limpiar observaciones para nueva cotización
    cotizacionForm.observaciones = "";
  }
  console.log("AbirModalCotizacion "+JSON.stringify(cotizacion));
  cargarFormulario(cotizacion);
  openModal();

  mostrarVista.value = false;
};


const tblHeadersModal = [
  { text: "Llanta", value: "llanta", sortable: true },
  { text: "Rango", value: "rango" },
  { text: "Codigo", value: "codigo" },
  { text: "Medidas", value: "medida", sortable: true },
  { text: "Cantidad", value: "cantidad", sortable: true },
  { text: "Ubicación", value: "ubicacion", sortable: true },
  { text: "Precio", value: "precio", sortable: true },
  { text: "Acciones", value: "acciones", width: 50 },
];

const cotizacionesTransformadas = computed(() => {
  return cotizacionesRealizadas.value
    .filter((c) => {
      const texto = busquedaCotizaciones.value.toLowerCase().trim();
      if (filtroEstatus.value && c.estatus !== filtroEstatus.value)
        return false;
      if (!texto) return true;

      const valores = [
        c.codigo,
        c.fechaCreacion,
        c.cliente?.nombre,
        c.cliente?.telefono,
        c.total?.toString(),
        c.estatus,
        c.nombreLlanta,
        ...(c.paquetes?.map((p) => p.nombre) || []),
      ];

      return valores.some((v) => String(v).toLowerCase().includes(texto));
    })
    .map((c) => ({
      codigo: c.codigo || "—",
      fechaCreacion: c.fechaCreacion || "—",
      cliente: c.cliente?.nombre || "—",
      telefono: c.cliente?.telefono || "—",
      observaciones: c.cliente?.observaciones || "No disponible", // <-- agregado

      paquete: c.paquetes?.length
        ? c.paquetes.map((p) => p.nombre).join(", ")
        : "—",
      nombreLlanta: c.nombreLlanta || "—",
      total: formatoMoneda(c.total || 0),
      estatus: typeof c.estatus === "string" ? c.estatus : "Desconocido",
      acciones: c,
    }));
});

watch(itemsSelected, (seleccionados) => {
  seleccionados.forEach((item) => {
    if (cantidadesPorLlanta.value[item.id] === undefined) {
      cantidadesPorLlanta.value[item.id] = 4;
    }
  });
});

// observar si clienteExistente a cambiado de valor
watch(
  () => cotizacionForm.clienteExistente,
  (nuevoNombre) => {
    const cliente = clientesDisponibles.value.find(
      (c) => c.nombres === nuevoNombre,
    );
    if (cliente) {
      cotizacionForm.clienteNombre =
        cliente.nombres + " " + cliente.apPaterno + " " + cliente.apMaterno;
      cotizacionForm.nombre = cliente.nombres;
      cotizacionForm.apellidos = cliente.apPaterno + " " + cliente.apMaterno;
      cotizacionForm.clienteTelefono = cliente.telefono;
      cotizacionForm.clienteCorreo = cliente.correo;
    } else {
      cotizacionForm.clienteNombre = "";
      cotizacionForm.clienteTelefono = "";
      cotizacionForm.clienteCorreo = "";
    }
  },
);

/*********************************************
 *  WATCHER: recalcular precioConPromo al editar precio unitario
 *********************************************/
watch(
  () =>
    cotizacionForm.llantas.map((ll) => ({
      id: ll.idLlanta,
      precio: ll.precioUnitario,
    })),
  (nuevosValores) => {
    nuevosValores.forEach(({ id, precio }) => {
      const llanta = cotizacionForm.llantas.find((l) => l.idLlanta === id);
      if (!llanta) return;

      // Aplica la misma lógica que tu helper actual
      if (llanta.promo && llanta.promo.valor != null) {
        llanta.precioConPromo = llanta.promo.tipo
          ? precio * (1 - llanta.promo.valor / 100)
          : Math.max(0, precio - llanta.promo.valor);
      } else if (promoGeneral.value && promoGeneral.value.valor != null) {
        llanta.precioConPromo = promoGeneral.value.tipo
          ? precio * (1 - promoGeneral.value.valor / 100)
          : Math.max(0, precio - promoGeneral.value.valor);
      } else {
        llanta.precioConPromo = precio; // sin promoción
      }
    });
  },
  { deep: true },
);

// Paquetes
watch(
  () =>
    cotizacionForm.paquetes.map((p) => ({
      id: p.idPaquete,
      precio: p.precioUnitario,
    })),
  (nuevosValores) => {
    nuevosValores.forEach(({ id, precio }) => {
      const paquete = cotizacionForm.paquetes.find((p) => p.idPaquete === id);
      if (!paquete) return;
      const promo = paquete.promo || promoGeneral.value;
      paquete.precioConPromo = promo
        ? promo.tipo
          ? precio * (1 - promo.valor / 100)
          : Math.max(0, precio - promo.valor)
        : precio;
    });
  },
  { deep: true },
);

// Servicios
watch(
  () =>
    cotizacionForm.serviciosExtras.map((s) => ({
      nombre: s.nombre,
      precio: s.precioUnitario,
    })),
  (nuevosValores) => {
    nuevosValores.forEach(({ nombre, precio }) => {
      const servicio = cotizacionForm.serviciosExtras.find(
        (s) => s.nombre === nombre,
      );
      if (!servicio) return;
      const promo = servicio.promo || promoGeneral.value;
      servicio.precioConPromo = promo
        ? promo.tipo
          ? precio * (1 - promo.valor / 100)
          : Math.max(0, precio - promo.valor)
        : precio;
    });
  },
  { deep: true },
);

/*********************************************
        FUNCIONES PARA MODAL SCREENSHOT Y PDF
    **********************************************/

const mostrarVistaPrevia = async (cotizacion, modo = "ver") => {
  if (modo === "ver") {
    try {
      const res = await fetch(
        `${
          proxy.$serverIP
        }api/Cotizacion/getDetalleCotizacion?id=${cotizacion.codigo.replace(
          "COT-",
          "",
        )}`,
      );
      const data = await res.json();

      // ===============================
      // 🔹 PROMOCIÓN GENERAL
      // ===============================
      const promoGeneral = data.idPromocionGeneral
        ? {
            idPromocion: data.idPromocionGeneral,
            nombre: data.nombrePromocionGeneral,
            valor: data.valorPromocionGeneral,
            tipo: data.tipoPromocionGeneral,
          }
        : null;

      // ===============================
      //   LLANTAS
      // ===============================
      const llantasConPromo = data.llantas.map((ll) => {
        const promoIndividual =
          ll.idPromocion && ll.valorPromocion != null
            ? {
                idPromocion: ll.idPromocion,
                nombre: ll.nombrePromocion,
                valor: ll.valorPromocion,
                tipo: ll.tipoPromocion,
              }
            : null;

        // Si el ítem está excluido, no aplicar ninguna promo
        const aplicaPromo = !ll.excluirPromocionGeneral;
        const precioBase = ll.precioUnitario ?? 0;

        const precioConPromo = aplicaPromo
          ? aplicarPromo(precioBase, promoIndividual, promoGeneral)
          : precioBase;

        // Etiqueta
        const promoLabel = aplicaPromo
          ? promoIndividual
            ? `${promoIndividual.nombre}`
            : promoGeneral
            ? `${promoGeneral.nombre} `
            : ""
          : "(Excluido de promoción)";

        return {
          idLlanta: ll.idLlanta,
          medidas: ll.modeloMedidas,
          cantidad: ll.cantidad,
          precioUnitario: precioBase,
          ubicacion: ll.ubicacion,
          precioConPromo,
          promoLabel,
          total: precioConPromo * ll.cantidad,
          comentario: ll.comentario || "",
        };
      });

      // ===============================
      // 🔹 PAQUETES
      // ===============================
      const paquetes = data.paquetes.map((p) => {
        const promoIndividual =
          p.valorPromocion != null
            ? {
                nombre: p.nombrePromocion,
                valor: p.valorPromocion,
                tipo: p.tipoPromocion,
              }
            : null;

        const aplicaPromo = !p.excluirPromocionGeneral;
        const precioBase = p.precioUnitario ?? 0;

        const precioConPromo = aplicaPromo
          ? aplicarPromo(precioBase, promoIndividual, promoGeneral)
          : precioBase;

        const promoLabel = aplicaPromo
          ? promoIndividual
            ? `${promoIndividual.nombre}`
            : promoGeneral
            ? `${promoGeneral.nombre}`
            : ""
          : "(Excluido de promoción)";

        return {
          idPaquete: p.idPaquete,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precioUnitario: precioBase,
          precio: precioConPromo,
          total: precioConPromo,
          promoLabel,
          comentario: p.comentario || "",
        };
      });

      // ===============================
      // 🔹 SERVICIOS
      // ===============================
      const serviciosAdicionales = data.servicios.map((s) => {
        const promoIndividual =
          s.valorPromocion != null
            ? {
                nombre: s.nombrePromocion,
                valor: s.valorPromocion,
                tipo: s.tipoPromocion,
              }
            : null;

        const aplicaPromo = !s.excluirPromocionGeneral;
        const precioBase = s.precioUnitario ?? 0;

        const precioConPromo = aplicaPromo
          ? aplicarPromo(precioBase, promoIndividual, promoGeneral)
          : precioBase;

        const promoLabel = aplicaPromo
          ? promoIndividual
            ? `${promoIndividual.nombre}`
            : promoGeneral
            ? `${promoGeneral.nombre}`
            : ""
          : "(Excluido de promoción)";

        return {
          nombreServicio: s.descripcion,
          observacion: s.observacion,
          cantidad: s.cantidad,
          precioUnitario: precioBase,
          precioConPromo,
          total: precioConPromo * s.cantidad,
          promoLabel,
          comentario: s.comentario || "",
        };
      });

      // ===============================
      // 🔹 CALCULO DE TOTALES
      // ===============================
      const totalBase =
        llantasConPromo.reduce((s, l) => s + l.precioUnitario * l.cantidad, 0) +
        paquetes.reduce((s, p) => s + p.precioUnitario, 0) +
        serviciosAdicionales.reduce(
          (s, s2) => s + s2.precioUnitario * s2.cantidad,
          0,
        );

      const totalFinal =
        llantasConPromo.reduce((s, l) => s + l.total, 0) +
        paquetes.reduce((s, p) => s + p.total, 0) +
        serviciosAdicionales.reduce((s, s2) => s + s2.total, 0);

      // ===============================
      // 🔹 VISTA FINAL
      // ===============================
      vistaCotizacion.value = {
        codigo: data.idCotizacion,
        fechaCreacion: new Date(data.fechaCreacion).toLocaleDateString(
          "es-MX",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          },
        ),
        cliente: {
          nombre: data.clienteNombre,
          telefono: data.telefono || "Sin teléfono",
          correo: data.correo || "Sin correo",
          fecha: data.fechaCreacion,
          observaciones: data.observaciones || "", // ⚡ AQUI
        },
        llantasSelecionadas: llantasConPromo,
        paquetes,
        serviciosAdicionales,
        total: totalFinal,
        totalBase,
        tienePromocion: totalFinal !== totalBase,
        nombrePromocionGeneral: data.nombrePromocionGeneral,
        valorPromocionGeneral: data.valorPromocionGeneral,
        tipoPromocionGeneral: data.tipoPromocionGeneral,
        estatus: cotizacion.estatus || "Activa",
        mostrarTotal: data.mostrarTotal,
      };

      mostrarVista.value = true;
    } catch (error) {
      console.error("Error al cargar detalle de cotización:", error);
      Swal.fire("Error", "No se pudo cargar la cotización.", "error");
    }
  }
};

const confirmarAccion = async (vistaCotizacion) => {
  // SE AGREGA VALIDACION PORQUE ESTO HACE UN PUT Y ACTUALIZA ESTADO DE UNA COTIZACION, EL CLIENTE PIDIO QUITAR LA CONFIRMACION
  // const result = await Swal.fire({
  //   title: "¿Estás seguro?",
  //   text: "Esta acción no se puede deshacer.",
  //   icon: "warning",
  //   showCancelButton: true,
  //   confirmButtonText: "Sí, continuar",
  //   cancelButtonText: "Cancelar",
  //   confirmButtonColor: "#d33",
  //   cancelButtonColor: "#6c757d",
  //   reverseButtons: true,
  // });

  // if (!result.isConfirmed) return;

  // console.log('confirmar: ' + vistaCotizacion.codigo)
  aprobarCotizacion(vistaCotizacion);
};

// MANDAR A IMPRIMIR

const imprimirCotizacion = () => {
  window.print();
};

// GENERAR PDF

const logoBase64 = ref(null);

const loadLogoBase64 = async () => {
  if (logoBase64.value) return logoBase64.value;
  const response = await fetch("/images/Logo-Kartisimo.png");
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      logoBase64.value = reader.result;
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

pdfMake.vfs = pdfFonts.vfs;



const generarPDF = async () => {
  const logo = await loadLogoBase64();
  const v = vistaCotizacion.value;

  const celdaCentroY = (text, alignment = "left") => ({
    text,
    alignment,
    fontSize: 10,
    margin: [0, 10, 0, 10],
  });

  const formatMoney = (v) =>
  `$${(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const celdaTotalConPromo = ({
    precioUnitario,
    cantidad = 1,
    total,
    promoLabel,
  }) => {
    const tienePromo =
      promoLabel && total < precioUnitario * cantidad;

    return {
      stack: tienePromo
        ? [
            {
              text: formatMoney(precioUnitario * cantidad),
              decoration: "lineThrough",
              color: "#888",
              fontSize: 9,
              alignment: "right",
            },
            {
              text: promoLabel,
              fontSize: 9,
              style: "promoLabel",
              alignment: "right",
              margin: [0, 2, 0, 2],
            },
            {
              text: formatMoney(total),
              color: "green",
              bold: true,
              fontSize: 9,
              alignment: "right",
            },
          ]
        : [
            {
              text: formatMoney(total),
              alignment: "right",
              fontSize: 9,
            },
          ],
      margin: [0, 6, 0, 6],
    };
  };


  // Arma las filas para la tabla, primero llantas, luego paquetes, luego servicios
  const llantasRows = v.llantasSelecionadas.map((ll) => {
    const tienePromo = ll.promoLabel && ll.precioConPromo < ll.precioUnitario;

    return [
      celdaCentroY(String(ll.cantidad), "center"),

      celdaCentroY(ll.medidas),

      celdaCentroY(
        `$${ll.precioUnitario.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`,
        "right",
      ),

      {
        stack: tienePromo
          ? [
              {
                text: `$${(ll.precioUnitario * ll.cantidad).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2 },
                )}`,
                decoration: "lineThrough",
                color: "#888",
                fontSize: 9,
                alignment: "right",
              },
              {
                text: ll.promoLabel,
                fontSize: 9,
                style: "promoLabel",
                alignment: "right",
                margin: [0, 2, 0, 2],
              },
              {
                text: `$${ll.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`,
                color: "green",
                bold: true,
                fontSize: 9,
                alignment: "right",
              },
            ]
          : [
              {
                text: `$${ll.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`,
                alignment: "right",
                fontSize: 9,
              },
            ],
        margin: [0, 6, 0, 6],
      },
    ];
  });

  const paquetesRows = v.paquetes.map((p) => [
    celdaCentroY("1", "center"),

    celdaCentroY(p.nombre),

    celdaCentroY(formatMoney(p.precioUnitario), "right"),

    celdaTotalConPromo({
      precioUnitario: p.precioUnitario,
      cantidad: 1,
      total: p.total,
      promoLabel: p.promoLabel,
    }),
  ]);


  const serviciosRows = v.serviciosAdicionales.map((s) => [
    {
      text: String(s.cantidad),
      alignment: "center",
      fontSize: 9,
      margin: [0, 6, 0, 6],
    },
    {
      text: s.nombreServicio,
      italics: true,
      fontSize: 9,
      margin: [0, 6, 0, 6],
    },
    {
      text: formatMoney(s.precioUnitario),
      alignment: "right",
      fontSize: 9,
      margin: [0, 6, 0, 6],
    },
    celdaTotalConPromo({
      precioUnitario: s.precioUnitario,
      cantidad: s.cantidad,
      total: s.total,
      promoLabel: s.promoLabel,
    }),
  ]);


  const separador = (textoColumna2) => [
    {
      text: "CANT",
      alignment: "center",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
    {
      text: textoColumna2,
      alignment: "center",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
    {
      text: "PRECIO UNITARIO",
      alignment: "center",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
    {
      text: "TOTAL",
      alignment: "center",
      style: "tableHeaderBorder",
      fillColor: "#ededed",
    },
 

  ];

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

  // Definición del PDF
  const docDefinition = {
    pageMargins: [40, 40, 40, 60],
    content: [
      // Logo y encabezado
      {
        columns: [
          {
            width: "*",
            stack: [{ image: logo, width: 130, margin: [0, 0, 0, 10] }],
          },
          {
            width: "auto",
            stack: [],
          },
        ],
      },
      {
        columns: [
          [
            {
              text: "Blvd. Delta 2002 esq. Rio Mayo",
              bold: true,
              fontSize: 9,
            },
            { text: "Col. Valle de Jerez C.P 37538", fontSize: 7 },
            { text: "Tel. 477 330 6060 y 477 390 5090", fontSize: 7 },
            { text: "delta@kartisimo.mx", fontSize: 7 },
          ],
          [
            {
              text: "Blvd. Lopez Mateos 827 esq. Apolo",
              bold: true,
              fontSize: 9,
            },
            { text: "Col. Obrera C.P. 37340", fontSize: 7 },
            { text: "Tel. 477 717 7440 y 477 470 9419", fontSize: 7 },
            { text: "apolo@kartisimo.mx", fontSize: 7 },
          ],
          [
            {
              text: "Blvd. Torres Landa 1901 esq San Jacobo",
              bold: true,
              fontSize: 9,
            },
            { text: "Col. La Pisina C.P. 37440", fontSize: 7 },
            { text: "Tel. 477 390 0290 y 477 461 0028", fontSize: 7 },
            { text: "torreslanda@kartisimo.mx", fontSize: 7 },
          ],
          [
            {
              text: "Blvd. Mariano Escobedo Pte. 2715 esq. San Sebastián",
              bold: true,
              fontSize: 9,
            },
            { text: "Col. La Martinica, C.P. 37500", fontSize: 7 },
            { text: "Tel. 477 763 3285 y 477 763 3284", fontSize: 7 },
          ],
        ],
        columnGap: 20,
        margin: [0, 0, 0, 18],
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#888",
          },
        ],
        margin: [0, 8, 0, 8],
      },
      {
        columns: [
          {
            text: `COT-${v.codigo}`,
            fontSize: 10,
            margin: [0, 0, 10, 6],
          },

          {
            text: [
              { 
                text: "Observaciones: ", 
                bold: true
              },
              cotizacionForm.observaciones || "N/A",
            ],
            fontSize: 10,
            margin: [1, 10, 15, 13], // margen inferior para separar de la tabla
          },

          {
            text: [
              {
                text: "Cliente: ",
                bold: true,
              },
              `${v.cliente.nombre || "N/A"}`,
            ],
            fontSize: 10,
            margin: [0, 0, 10, 6],
          },
          {
            text: [
              {
                text: "Fecha Emisión: ",
                bold: true,
              },
              `${formatearFecha(v.cliente.fecha) || ""}`,
            ],
            fontSize: 10,
            margin: [0, 0, 10, 6],
          },
          {
            text: [
              {
                text: "Teléfono: ",
                bold: true,
              },
              { text: v.cliente.telefono || "N/A", color: "#444" },
            ],
            fontSize: 10,
            margin: [0, 0, 10, 6],
          }
      

        ],
      },
      // Tabla principal
      {
        table: {
          headerRows: 1,
          widths: [40, "*", 90, 90],
          body: [
            [
              {
                text: "CANT",
                style: "tableHeaderBorder",
                alignment: "center",
              },
              {
                text: "MARCA - MODELO - MEDIDA",
                style: "tableHeaderBorder",
                alignment: "center",
              },
              {
                text: "PRECIO UNITARIO",
                style: "tableHeaderBorder",
                alignment: "center",
              },
              {
                text: "TOTAL",
                style: "tableHeaderBorder",
                alignment: "center",
              },
            ],
            ...llantasRows,
            separador("PAQUETE - SERVICIOS"),
            ...paquetesRows,
            ...serviciosRows,
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? "#ededed" : null),
          // hLineWidth: (i, node) => {
          //   // Quita todas las líneas horizontales menos la del encabezado y las divisiones
          //   if (i === 0 || i == 1 || i === node.table.body.length) return 1; // Header y bottom
          //   // Puedes agregar condiciones aquí para las divisiones
          //   return 0;
          // },
          vLineWidth: (i, node) => 0,
        },
        margin: [0, 12, 0, 0],
      },
      {
        text: "Los precios incluyen IVA",
        style: "notaIVA",
        alignment: "right",
        margin: [0, 14, 0, 0],
      },
    ],
    styles: {
      tableHeaderBorder: {
        bold: true,
        fontSize: 10,
        border: [true, true, true, true],
        alignment: "center",
      },
      promoLabel: {
        italics: true,
        fontSize: 9,
        color: "#D92300",
      },
      notaIVA: {
        italics: true,
        fontSize: 9,
      },
    },
  };

  //pdfMake.createPdf(docDefinition).open();

  // usa esta si el problema es download
  pdfMake.createPdf(docDefinition).download(`cotizacion_${v.codigo}.pdf`);
};





</script>

<style>
.cotizacion-table {
  max-width: min(1100px, 95vw);
}

.cotizacion-header {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}
.modal-1000 {
  max-width: 1000px;
  width: 100%;
}

@media print {
  /* Quitar márgenes gigantes */
  @page {
    margin: 8mm;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Ocultar TODO */
  body * {
    visibility: hidden;
  }

  /* Mostrar solo el área a imprimir */
  #area-imprimir,
  #area-imprimir * {
    visibility: visible;
  }

  #area-imprimir {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .modal-body {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
  }

  /* 🔥 CLAVE: desactivar table-responsive */
  .table-responsive {
    overflow: visible !important;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group; /* Permite encabezado correcto */
  }

  tfoot {
    display: table-footer-group;
  }

  /* Botones fuera */
  button,
  .btn,
  .no-imprimir {
    display: none !important;
  }

  .modal,
  .modal-dialog,
  .modal-content {
    position: static !important;
    overflow: visible !important;
  }
}
</style>
