<template>
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
          <div class="d-flex justify-content-end">
            <div v-if="loggeduser" class="card bg-light shadow-sm mx-4 my-2">
              <div class="card-body" style="font-size: 10pt; color: slategray">
                <i class="bi bi-person me-2"></i>
                <strong>Usuario: </strong>{{ loggeduser.nombre }}<br />

                <i class="bi bi-envelope me-2"></i>
                <strong>Correo: </strong>{{ loggeduser.correo || "Sin correo"
                }}<br />

                <i class="bi bi-building-fill me-2"></i>
                <strong>Sucursal: </strong>
                {{ sucursales?.[loggeduser.id_sucursal - 1] || "N/A" }}
              </div>
            </div>
          </div>

          <div class="card shadow-sm mx-4 my-3">
            <div class="card-header" style="font-size: 14pt">
              <i class="bi bi-person-fill me-2"></i> Datos del cliente
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-12 col-lg-6">
                  <label for="clienteExistente" class="mb-1 form-label"
                    ><i class="bi bi-search"></i> Buscar cliente
                    existente</label
                  >

                  <ClientesFilterOption
                    v-model="mostrarTabla"
                    @seleccionar-cliente="manejarCliente"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-6 col-lg-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input
                    id="nombre"
                    v-model="cotizacionForm.nombre"
                    class="form-control mb-3"
                    type="text"
                    placeholder="Ej. Nombre"
                    @change="ajustaNombre()"
                  />
                </div>
                <div class="col-6 col-lg-3">
                  <label for="apellido" class="form-label">Apellidos</label>
                  <input
                    id="apellido"
                    v-model="cotizacionForm.apellidos"
                    class="form-control mb-3"
                    type="text"
                    placeholder="Ej. Apellido"
                    @change="ajustaNombre()"
                  />
                </div>
                <div class="col-6 col-lg-3">
                  <label for="numTelefono" class="form-label"
                    ><i class="bi bi-telephone-fill"></i> Teléfono(s)</label
                  >

                  <input
                    id="numTelefono"
                    v-model="telefonoFormateado"
                    type="text"
                    class="form-control"
                    placeholder="XXX XXX XXXX"
                    :class="{ 'is-invalid': !telefonoEsValido }"
                  />

                  <div class="invalid-feedback">
                    El teléfono debe tener al menos 10 dígitos
                  </div>
                </div>
                <div class="col-6 col-lg-3">
                  <label for="correoCliente" class="form-label"
                    ><i class="bi bi-envelope-fill"></i> Correo</label
                  >
                  <input
                    id="correoCliente"
                    v-model="cotizacionForm.clienteCorreo"
                    type="email"
                    class="form-control"
                    placeholder="ejemplo@correo.com"
                    :class="{ 'is-invalid': !correoEsValido }"
                  />
                  <div class="invalid-feedback">capture un correo válido</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mx-4 my-4">
            <div class="card-body">
              <div class="row">
                <div class="col-12 col-lg-6">
                  <div
                    v-for="paquete in paquetesDisponibles"
                    :key="paquete.idPaquete"
                    class="form-check mx-3 my-2"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'paquete-' + paquete.idPaquete"
                      :value="paquete.idPaquete"
                      v-model="paquetesSeleccionados"
                    />
                    <label
                      class="form-check-label"
                      :for="'paquete-' + paquete.idPaquete"
                    >
                      {{ paquete.nombre }} -
                      {{ formatoMoneda(paquete.precioUnitario) }}
                    </label>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <label for="ObservacionCliente" class="form-label mt-2"
                    ><i class="bi bi-sticky-fill"></i> Observaciones</label
                  >
                  <textarea
                    id="ObservacionCliente"
                    v-model="cotizacionForm.observaciones"
                    class="form-control mb-2"
                    rows="2"
                    maxlength="255"
                    placeholder="Notas adicionales de la cotización"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="row m-4">
            <div class="col">
              <h5>Seleccionar las llantas deseadas</h5>
              <div class="row m-2 mt-3">
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
                      <span>{{ selectedAlmacenesLabel }}</span>
                      <i class="bi bi-caret-down-fill"></i>
                    </button>

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
                          :value="alm.id"
                          v-model="selectedAlmacenes"
                          @change="onAlmacenesChanged"
                        />
                        <label class="form-check-label" :for="'alm-' + alm.id">
                          {{ alm.nombre }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <EasyDataTable
                  :headers="tblHeadersModal"
                  :items="itemsOrdenados"
                  :rows-per-page="100"
                  show-index
                  :table-height="400"
                  :header-item-class-name="getModalHeaderItemClassName"
                  :body-item-class-name="getModalBodyItemClassName"
                  @update:sort-by="ordenarPor"
                >
                  <template #item-runflat="runFlat">
                    <div class="text-center">
                      <i
                        v-if="Number(runFlat.runflat) === 1"
                        class="bi bi-check-circle-fill text-success"
                      ></i>
                    </div>
                  </template>

                  

                  <template #item-medida="slotProps">
                    {{ slotProps.medida }}
                    {{ Number(slotProps.runflat) === 1 ? "RF" : "" }}
                  </template>

                  <template #item-costo="slotProps">
                    {{ formatoMoneda(slotProps.costo || 0) }}
                  </template>

                  <template #item-precio="slotProps">
                    {{ formatoMoneda(slotProps.precio || 0) }}
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
                          (ll) =>
                            ll.idLlanta === slotProps.id ||
                            ll.modeloMedidas === slotProps.modeloMedidas,
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

              <div
                class="d-flex justify-content-end align-items-center mt-3"
                style="font-size: 9pt"
              >
                <div class="mx-2">
                  <table>
                    <tbody>
                      <tr>
                        <td style="white-space: nowrap">
                          Renglones por página:
                        </td>
                        <td>
                          <select
                            class="form-control"
                            style="font-size: 9pt"
                            v-model="rowsPerPage"
                            @change="onRowsChange"
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mx-2">
                  <strong>Página {{ page }}:</strong>
                  {{ paginaInicio }}-{{ paginaFin }} de {{ totalRows }}
                </div>

                <div class="mx-2">
                  <button
                    class="btn btn-outline-dark btn-sm me-2"
                    @click="prevPage"
                    :disabled="page <= 1 || llantasLoading"
                    type="button"
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>

                  <button
                    class="btn btn-outline-dark btn-sm"
                    @click="nextPage"
                    :disabled="page >= totalPages || llantasLoading"
                    type="button"
                  >
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="row mt-3 mx-3">
            <h5>Agregar servicio adicional</h5>
            <div class="d-flex gap-3 my-3">
              <div class="col">
                <select
                  class="form-select form-select-sm"
                  v-model="NuevoConceptoTrabajo"
                >
                  <option :value="0">-- Seleccione concepto --</option>
                  <option
                    v-for="c in conceptoOT"
                    :key="c.idConceptoOrdenTrabajo"
                    :value="c.idConceptoOrdenTrabajo"
                  >
                    {{ c.nombre }}
                  </option>
                </select>
              </div>
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
              <button
                class="btn btn-primary position-relative shadow"
                style="width: 130px"
                @click="agregarServicioExtra"
              >
                <i class="bi bi-plus-lg position-absolute start-0 ms-2"></i>
                &nbsp;Agregar
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
                        ><strong>Blvd. Delta 2002 esq. Rio Mayo</strong></small
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

                  <div class="row mb-2 d-flex">
                    <div class="col-2">
                      {{
                        cotizacionForm.codigo
                          ? "C" + cotizacionForm.codigo
                          : "(Por definir)"
                      }}
                    </div>
                    <div class="col-3">
                      <strong>Fecha de emisión: </strong>
                      {{
                        cotizacionForm.fechaCreacion
                          ? new Date(
                              cotizacionForm.fechaCreacion,
                            ).toLocaleString("es-MX", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "N/A"
                      }}
                    </div>
                    <div class="col-3">
                      <strong>Cliente: </strong>
                      {{ cotizacionForm.clienteNombre || "N/A" }}
                    </div>
                    <div class="col-2">
                      <strong>Teléfono(s): </strong>
                      {{ telefonoFormateado || "N/A" }}
                    </div>
                    <div class="col-2">
                      <strong>Correo: </strong>
                      {{ cotizacionForm.clienteCorreo || "N/A" }}
                    </div>
                  </div>
                  <div v-if="cotizacionForm.observaciones" class="mb-2 d-flex">
                    <span class="mx-2">
                      <strong>Observaciones</strong>
                      {{ cotizacionForm.observaciones || "N/A" }}
                    </span>
                  </div>
                  <table class="table align-middle">
                    <thead>
                      <tr>
                        <th>Concepto de trabajo</th>
                        <th>Descripción</th>
                        <th style="text-align: center">Cantidad</th>
                        <th>Precio Unitario</th>
                        <!--
                          <th>Costo</th>
                        -->
                        <th>Total</th>
                        <th class="text-center">Promociones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template
                        v-for="item in cotizacionForm.llantas"
                        :key="'llanta-' + item.idLlanta"
                      >
                        <tr>
                          <td class="z-3">
                            <select
                              class="form-select form-select-sm"
                              v-model="item.idConceptoTrabajo"
                            >
                              <option :value="0">
                                -- Seleccione concepto --
                              </option>

                              <option
                                v-for="c in conceptoOT"
                                :key="c.idConceptoOrdenTrabajo"
                                :value="c.idConceptoOrdenTrabajo"
                              >
                                {{ c.nombre }}
                              </option>
                            </select>
                          </td>
                          <td
                            :class="[
                              item.mostrarEditor ? 'bg-light' : '',
                              'editor-cell',
                            ]"
                          >
                            <div v-if="!item.mostrarEditor">
                              {{ item.modeloMedidas }}
                              <span class="badge bg-warning text-dark ms-2">
                                {{ item.ubicacion }}
                              </span>
                              <i
                                class="bi bi-pencil-square mx-2 text-warning"
                                style="cursor: pointer"
                                role="button"
                                tabindex="0"
                                title="Editar datos de la llanta"
                                @click="cambiarEstadoEditor(item)"
                              ></i>
                              <div class="mt-1">
                                <input
                                  type="text"
                                  v-model="item.comentario"
                                  class="form-control form-control-sm"
                                  placeholder="Agregar comentario..."
                                />
                              </div>
                            </div>
                            <div
                              v-else
                              class="container-fluid"
                              :key="'editar_llanta+' + item.idLlanta"
                            >
                              <!-- TABLA -->
                              <div class="row">
                                <table class="w-100">
                                  <thead>
                                    <tr>
                                      <th>Medida</th>
                                      <th>Marca</th>
                                      <th>Modelo</th>
                                      <th>Rango</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    <tr>
                                      <td>
                                        <input
                                          type="text"
                                          name="medida"
                                          v-model="item.medida"
                                          class="form-control"
                                        />
                                      </td>

                                      <td>
                                        <select
                                          v-model.number="item.idMarca"
                                          name="selector_marca"
                                          class="form-select"
                                        >
                                          <option :value="null" disabled>
                                            -- Seleccionar marca --
                                          </option>
                                          <option
                                            v-for="marca in MarcasLlantas"
                                            :key="marca.idMarca"
                                            :value="marca.idMarca"
                                          >
                                            {{ marca.nombre }}
                                          </option>
                                        </select>
                                        <!-- <input
                                          type="text"
                                          name="marca"
                                          v-model="item.marca"
                                          class="form-control"
                                        /> -->
                                      </td>

                                      <td>
                                        <input
                                          type="text"
                                          name="modelo"
                                          v-model="item.modelo"
                                          class="form-control"
                                        />
                                      </td>

                                      <td>
                                        <input
                                          type="text"
                                          name="rango"
                                          v-model="item.rango"
                                          class="form-control"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <!-- BOTONES -->
                              <div class="edit-actions mt-3">
                                <button
                                  type="button"
                                  class="btn btn-outline-secondary edit-action-btn"
                                  aria-label="Cancelar edición"
                                  title="Cancelar edición"
                                  @click="cambiarEstadoEditor(item)"
                                >
                                  <i class="bi bi-x-lg me-1"></i> Cancelar
                                </button>

                                <button
                                  type="button"
                                  class="btn btn-success edit-action-btn"
                                  aria-label="Guardar edición"
                                  title="Guardar edición"
                                  :disabled="item.guardandoEditor"
                                  @click="editarDatosLlanta(item)"
                                >
                                  <span
                                    v-if="item.guardandoEditor"
                                    class="spinner-border spinner-border-sm me-2"
                                  ></span>
                                  <i v-else class="bi bi-save-fill me-2"></i>
                                  {{
                                    item.guardandoEditor
                                      ? "Guardando..."
                                      : "Guardar"
                                  }}
                                </button>
                              </div>
                            </div>
                          </td>

                          <td class="text-center">
                            <input
                              type="number"
                              min="1"
                              class="form-control mx-auto"
                              :style="{ width: '70px' }"
                              v-model.number="item.cantidad"
                            />
                          </td>

                          <td>
                            <div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                class="form-control input-precio-unitario sin-flechas"
                                :style="{ width: '90px' }"
                                v-model.number="item.precioUnitario"
                                placeholder="Precio c/u"
                                @keydown="irAlSiguientePrecio"
                              />
                            </div>
                          </td>
                          <!--
                            <td class="text-nowrap">
                              {{ formatoMoneda(item.costo || 0) }}
                            </td>
                          -->

                          <td>
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
                                {{ formatoMoneda(item.precioConPromo) }}
                              </span>
                            </div>

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
                                {{ formatoMoneda(AplicarPromo(item)) }}
                              </span>
                            </div>

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

                            <div v-else>
                              {{
                                formatoMoneda(
                                  (item.precioUnitario || 0) *
                                    (item.cantidad ?? 1),
                                )
                              }}
                            </div>
                          </td>

                          <td>
                            <div
                              class="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-center"
                            >
                              <button
                                type="button"
                                class="btn btn-sm"
                                :class="
                                  item.idPromocionSeleccionada === 0
                                    ? 'btn-light'
                                    : 'btn-outline-light text-dark'
                                "
                                @click="
                                  item.idPromocionSeleccionada = 0;
                                  item.idPromocionAlVuelo = 0;
                                  onCambioPromo(item);
                                "
                              >
                                Sin promoción
                              </button>

                              <button
                                v-for="promo in item.promosAplicables.filter(
                                  (p) => !p.esAlVuelo,
                                )"
                                :key="promo.idPromocion"
                                type="button"
                                class="btn btn-sm"
                                :class="
                                  item.idPromocionSeleccionada ===
                                  promo.idPromocion
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                                "
                                @click="
                                  item.idPromocionSeleccionada =
                                    promo.idPromocion;
                                  onCambioPromo(item);
                                "
                                :disabled="item.idPromocionAlVuelo > 0"
                              >
                                {{ promo.nombre }}
                                {{
                                  promo.tipo
                                    ? promo.valor + "%"
                                    : "$" + promo.valor
                                }}
                              </button>
                              <button
                                class="btn btn-sm btn-outline-success"
                                :class="
                                  buscarPromocionAplicada(item)
                                    ? 'btn-outline-danger'
                                    : 'btn-outline-primary'
                                "
                                @click="togglePromoAlVuelo(item)"
                                :disabled="
                                  item.idPromocionSeleccionada > 0 &&
                                  !buscarPromocionAplicada(item)
                                "
                              >
                                <i
                                  :class="
                                    buscarPromocionAplicada(item)
                                      ? 'bi bi-x-lg'
                                      : 'bi bi-plus-lg'
                                  "
                                ></i>
                              </button>
                            </div>
                            <div
                              class="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-center"
                            >
                              <button
                                class="btn btn-sm btn-outline-danger"
                                @click="eliminarLlanta(item.idLlanta)"
                                title="Eliminar llanta"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr
                          v-if="item.mostrarEditorPromo"
                          :key="'editor-' + item.idLlanta"
                        >
                          <td
                            colspan="6"
                            class="bg-light justify-content-end align-items-end"
                          >
                            <div
                              class="d-flex gap-2 justify-content-end align-items-center"
                            >
                              <div>
                                <label class="small">Nombre</label>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  v-model="PromocionesVuelo.nombre"
                                />
                              </div>

                              <div>
                                <label class="small">Tipo</label>
                                <select
                                  class="form-select form-select-sm"
                                  v-model="PromocionesVuelo.tipo"
                                >
                                  <option :value="false">Monto</option>
                                  <option :value="true">Porcentaje</option>
                                </select>
                              </div>

                              <div>
                                <label class="small">Valor</label>
                                <input
                                  type="number"
                                  min="0"
                                  class="form-control form-control-sm"
                                  v-model.number="PromocionesVuelo.valor"
                                />
                              </div>
                              <div>
                                <label class="samll"> Tipo de Promocion </label>
                                <div
                                  calss=" d-flex align-items-center justify-content-center "
                                >
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcTienda"
                                      >Tienda</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcTienda"
                                      value="0"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                      checked
                                    />
                                  </div>
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcPromo"
                                      >Promocion</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcPromo"
                                      value="1"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                    />
                                  </div>
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcPromo"
                                      >Cupón</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcCupon"
                                      value="2"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                    />
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                class="btn btn-success btn-sm"
                                @click="guardarPromoAlVuelo(item)"
                              >
                                Agregar
                              </button>

                              <button
                                type="button"
                                class="btn btn-secondary btn-sm"
                                @click="item.mostrarEditorPromo = false"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      </template>

                      <template
                        v-for="(paq, j) in cotizacionForm.paquetes || []"
                        :key="'paq-' + j"
                      >
                        <tr>
                          <td></td>

                          <td>
                            {{ paq.nombre }}
                            <div class="mt-1">
                              <input
                                type="text"
                                v-model="paq.comentario"
                                class="form-control form-control-sm"
                                placeholder="Agregar comentario..."
                              />
                            </div>
                          </td>
                          <td class="text-center">
                            <input
                              type="number"
                              min="1"
                              class="form-control mx-auto"
                              :style="{ width: '70px' }"
                              v-model.number="paq.cantidad"
                            />
                          </td>

                          <td>
                            <div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                class="form-control input-precio-unitario"
                                :style="{ width: '90px' }"
                                v-model.number="paq.precioUnitario"
                                placeholder="Precio c/u"
                                @keydown="irAlSiguientePrecio"
                              />
                            </div>
                          </td>
                          <!--
                            <td class="text-nowrap">
                              {{ formatoMoneda(paq.costo || 0) }}
                            </td>
                          -->

                          <td>
                            <div v-if="paq.promo && paq.promo.valor != null">
                              <span
                                class="text-decoration-line-through text-muted small"
                              >
                                {{
                                  formatoMoneda(
                                    (paq.precioUnitario || 0) *
                                      (paq.cantidad ?? 1),
                                  )
                                }}
                                <span>
                                  <small class="badge bg-danger mt-1">
                                    {{ paq.promo.nombre }}
                                  </small>
                                </span>
                              </span>
                              <br />
                              <span class="text-success fw-bold">
                                {{ formatoMoneda(paq.precioConPromo) }}
                              </span>
                            </div>

                            <div v-else>
                              {{
                                formatoMoneda(
                                  (paq.precioUnitario || 0) *
                                    (paq.cantidad ?? 1),
                                )
                              }}
                            </div>
                          </td>

                          <td>
                            <div
                              class="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-center"
                            >
                              <button
                                type="button"
                                class="btn btn-sm"
                                :class="
                                  paq.idPromocionSeleccionada === 0
                                    ? 'btn-light'
                                    : 'btn-outline-light text-dark'
                                "
                                @click="
                                  paq.idPromocionSeleccionada = 0;
                                  paq.idPromocionAlVuelo = 0;
                                  onCambioPromo(paq);
                                "
                              >
                                Sin promoción
                              </button>

                              <button
                                v-for="promo in paq.promosAplicables.filter(
                                  (p) => !p.esAlVuelo,
                                )"
                                :key="promo.idPromocion"
                                type="button"
                                class="btn btn-sm"
                                :class="
                                  paq.idPromocionSeleccionada ===
                                  promo.idPromocion
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                                "
                                @click="
                                  paq.idPromocionSeleccionada =
                                    promo.idPromocion;
                                  onCambioPromo(paq);
                                "
                                :disabled="paq.idPromocionAlVuelo > 0"
                              >
                                {{ promo.nombre }}
                                {{
                                  promo.tipo
                                    ? promo.valor + "%"
                                    : "$" + promo.valor
                                }}
                              </button>
                              <button
                                class="btn btn-sm btn-outline-success"
                                :class="
                                  buscarPromocionAplicada(paq)
                                    ? 'btn-outline-danger'
                                    : 'btn-outline-primary'
                                "
                                @click="togglePromoAlVuelo(paq)"
                                :disabled="
                                  paq.idPromocionSeleccionada > 0 &&
                                  !buscarPromocionAplicada(paq)
                                "
                              >
                                <i
                                  :class="
                                    buscarPromocionAplicada(paq)
                                      ? 'bi bi-x-lg'
                                      : 'bi bi-plus-lg'
                                  "
                                ></i>
                              </button>
                            </div>
                            <div
                              class="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-center"
                            >
                              <button
                                class="btn btn-sm btn-outline-danger"
                                @click="eliminarPaquete(paq.idPaquete)"
                                title="Eliminar paquete"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr
                          v-if="paq.mostrarEditorPromo"
                          :key="'editor-' + paq.idPaquete"
                        >
                          <td
                            colspan="6"
                            class="bg-light justify-content-end align-items-end"
                          >
                            <div
                              class="d-flex gap-2 justify-content-end align-items-center"
                            >
                              <div>
                                <label class="small">Nombre</label>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  v-model="PromocionesVuelo.nombre"
                                />
                              </div>

                              <div>
                                <label class="small">Tipo</label>
                                <select
                                  class="form-select form-select-sm"
                                  v-model="PromocionesVuelo.tipo"
                                >
                                  <option :value="false">Monto</option>
                                  <option :value="true">Porcentaje</option>
                                </select>
                              </div>

                              <div>
                                <label class="small">Valor</label>
                                <input
                                  type="number"
                                  min="0"
                                  class="form-control form-control-sm"
                                  v-model.number="PromocionesVuelo.valor"
                                />
                              </div>
                              <div>
                                <label class="samll"> Tipo de Promocion </label>
                                <div
                                  calss=" d-flex align-items-center justify-content-center "
                                >
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcTienda"
                                      >Tienda</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcTienda"
                                      value="0"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                      checked
                                    />
                                  </div>
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcPromo"
                                      >Promocion</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcPromo"
                                      value="1"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                    />
                                  </div>
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcPromo"
                                      >Cupón</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcCupon"
                                      value="2"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                    />
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                class="btn btn-success btn-sm"
                                @click="guardarPromoAlVuelo(paq)"
                              >
                                Agregar
                              </button>

                              <button
                                type="button"
                                class="btn btn-secondary btn-sm"
                                @click="paq.mostrarEditorPromo = false"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>

                        <tr
                          v-for="(det, k) in paq.detalle"
                          :key="'det-' + paq.idPaquete + '-' + k"
                        >
                          <td>
                            <select
                              class="form-select form-select-sm"
                              v-model="det.idConceptoTrabajo"
                            >
                              <option :value="0">
                                -- Seleccione concepto --
                              </option>
                              <option
                                v-for="c in conceptoOT"
                                :key="c.idConceptoOrdenTrabajo"
                                :value="c.idConceptoOrdenTrabajo"
                              >
                                {{ c.nombre }}
                              </option>
                            </select>
                          </td>
                          <td class="ps-4">
                            ↳ <span class="ms-2">{{ det.nombre }}</span>
                          </td>
                          <td class="text-center">
                            <input
                              type="number"
                              min="1"
                              class="form-control mx-auto"
                              :style="{ width: '70px' }"
                              v-model.number="det.cantidad"
                            />
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </template>

                      <template
                        v-for="(extra, i) in cotizacionForm.serviciosExtras"
                        :key="'servicio-' + i"
                      >
                        <tr>
                          <td>
                            <select
                              class="form-select form-select-sm"
                              v-model="extra.idConceptoTrabajo"
                            >
                              <option :value="0">
                                -- Seleccione concepto --
                              </option>

                              <option
                                v-for="c in conceptoOT"
                                :key="c.idConceptoOrdenTrabajo"
                                :value="c.idConceptoOrdenTrabajo"
                              >
                                {{ c.nombre }}
                              </option>
                            </select>
                          </td>
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

                          <td class="text-center">
                            <input
                              type="number"
                              min="1"
                              class="form-control mx-auto"
                              :style="{ width: '70px' }"
                              v-model.number="extra.cantidad"
                              placeholder="1"
                            />
                          </td>

                          <td>
                            <div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                class="form-control input-precio-unitario"
                                :style="{ width: '90px' }"
                                v-model.number="extra.precioUnitario"
                                placeholder="Precio c/u"
                                @keydown="irAlSiguientePrecio"
                              />
                            </div>
                          </td>

                          <!--
                            <td class="text-nowrap">
                              {{ formatoMoneda(extra.costo || 0) }}
                            </td>
                          -->

                          <td>
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
                                {{ formatoMoneda(extra.precioConPromo) }}
                              </span>
                            </div>

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
                                {{ formatoMoneda(AplicarPromo(extra)) }}
                              </span>
                            </div>

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
                              class="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-center"
                            >
                              <button
                                type="button"
                                class="btn btn-sm"
                                :class="
                                  extra.idPromocionSeleccionada === 0
                                    ? 'btn-light'
                                    : 'btn-outline-light text-dark'
                                "
                                @click="
                                  extra.idPromocionSeleccionada = 0;
                                  extra.idPromocionAlVuelo = 0;
                                  onCambioPromo(extra);
                                "
                              >
                                Sin promoción
                              </button>

                              <button
                                v-for="promo in extra.promosAplicables.filter(
                                  (p) => !p.esAlVuelo,
                                )"
                                :key="promo.idPromocion"
                                type="button"
                                class="btn btn-sm"
                                :class="
                                  extra.idPromocionSeleccionada ===
                                  promo.idPromocion
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                                "
                                @click="
                                  extra.idPromocionSeleccionada =
                                    promo.idPromocion;
                                  onCambioPromo(extra);
                                "
                                :disabled="extra.idPromocionAlVuelo > 0"
                              >
                                {{ promo.nombre }}
                                {{
                                  promo.tipo
                                    ? promo.valor + "%"
                                    : "$" + promo.valor
                                }}
                              </button>
                              <button
                                class="btn btn-sm btn-outline-success"
                                :class="
                                  buscarPromocionAplicada(extra)
                                    ? 'btn-outline-danger'
                                    : 'btn-outline-primary'
                                "
                                @click="togglePromoAlVuelo(extra)"
                                :disabled="
                                  extra.idPromocionSeleccionada > 0 &&
                                  !buscarPromocionAplicada(extra)
                                "
                              >
                                <i
                                  :class="
                                    buscarPromocionAplicada(extra)
                                      ? 'bi bi-x-lg'
                                      : 'bi bi-plus-lg'
                                  "
                                ></i>
                              </button>
                            </div>
                            <div
                              class="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-center"
                            >
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
                            </div>
                          </td>
                        </tr>
                        <tr
                          v-if="extra.mostrarEditorPromo"
                          :key="'editor-' + extra.idLlanta"
                        >
                          <td
                            colspan="6"
                            class="bg-light justify-content-end align-items-end"
                          >
                            <div
                              class="d-flex gap-2 justify-content-end align-items-center"
                            >
                              <div>
                                <label class="small">Nombre</label>
                                <input
                                  type="text"
                                  class="form-control form-control-sm"
                                  v-model="PromocionesVuelo.nombre"
                                />
                              </div>

                              <div>
                                <label class="small">Tipo</label>
                                <select
                                  class="form-select form-select-sm"
                                  v-model="PromocionesVuelo.tipo"
                                >
                                  <option :value="false">Monto</option>
                                  <option :value="true">Porcentaje</option>
                                </select>
                              </div>

                              <div>
                                <label class="small">Valor</label>
                                <input
                                  type="number"
                                  min="0"
                                  class="form-control form-control-sm"
                                  v-model.number="PromocionesVuelo.valor"
                                />
                              </div>
                              <div>
                                <label class="samll"> Tipo de Promocion </label>
                                <div
                                  calss=" d-flex align-items-center justify-content-center "
                                >
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcTienda"
                                      >Tienda</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcTienda"
                                      value="0"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                      checked
                                    />
                                  </div>
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcPromo"
                                      >Promocion</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcPromo"
                                      value="1"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                    />
                                  </div>
                                  <div class="form-checK float-start mx-2">
                                    <label
                                      class="form-check-label mx-2"
                                      for="opcPromo"
                                      >Cupón</label
                                    >
                                    <input
                                      class="form-check-input me-2"
                                      type="radio"
                                      name="opcPromocion"
                                      id="opcCupon"
                                      value="2"
                                      v-model="PromocionesVuelo.tipoPromocion"
                                    />
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                class="btn btn-success btn-sm"
                                @click="guardarPromoAlVuelo(extra)"
                              >
                                Agregar
                              </button>

                              <button
                                type="button"
                                class="btn btn-secondary btn-sm"
                                @click="extra.mostrarEditorPromo = false"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"></td>
                        <td colspan="2">
                          <div class="form-check my-1">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="mostrarTotal"
                              v-model="cotizacionForm.mostrarTotal"
                            />
                            <label
                              class="form-check-label fs-7"
                              for="mostrarTotal"
                            >
                              Mostrar total
                            </label>
                          </div>
                        </td>
                        <td class="text-end fs-5 fw-bold">
                          <span v-if="cotizacionForm.mostrarTotal">Total:</span>
                        </td>
                        <td class="fs-5 fw-bold text-end">
                          <span v-if="cotizacionForm.mostrarTotal">{{
                            formatoMoneda(totalCotizacion)
                          }}</span>
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
          <button
            type="button"
            class="btn btn-secondary position-relative shadow mx-3"
            style="width: 140px"
            @click="closeModal"
          >
            <i class="bi-x-circle-fill position-absolute start-0 ms-2"></i>
            Cerrar
          </button>
          <button
            type="button"
            class="btn btn-success position-relative shadow mx-3"
            style="width: 140px"
            @click="guardarCotizacion"
            :disabled="guardando || !telefonoEsValido || !correoEsValido"
          >
            <i class="bi-save-fill position-absolute start-0 ms-2"></i>
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import EasyDataTable from "vue3-easy-data-table";
import ClientesFilterOption from "@/components/Cotizacion/ClientesFilterOption.vue";
import { useCotizacionEditor } from "@/composables/cotizacion/useCotizacionEditor";

const emit = defineEmits(["saved"]);

const tblHeadersModal = [
  { text: "Llanta", value: "llanta", sortable: true },
  { text: "Código", value: "codigo", sortable: true },
  { text: "Rango Carga", value: "rangoCarga", sortable: true },
  { text: "Rango Velocidad", value: "rangoVelocidad", sortable: true },
  { text: "Run Flat", value: "runflat", sortable: true },
  { text: "Medidas", value: "medida", sortable: true },
  { text: "Cantidad", value: "cantidad", sortable: true },
  { text: "Ubicación", value: "ubicacion", sortable: true },
  { text: "Costo", value: "costo", sortable: true },
  { text: "Precio", value: "precio", sortable: true },
  { text: "Acciones", value: "acciones", sortable: false },
];

const {
  AplicarPromo,
  NuevoConceptoTrabajo,
  PromocionesVuelo,
  abrir,
  ajustaNombre,
  agregarLlanta,
  agregarServicioExtra,
  almacenes,
  buscarPromocionAplicada,
  busquedaLlantas,
  closeModal,
  conceptoOT,
  correoEsValido,
  cotizacionForm,
  dropdownOpen,
  editarDatosLlanta,
  eliminarLlanta,
  eliminarPaquete,
  eliminarServicioExtra,
  formatoMoneda,
  guardarCotizacion,
  guardarPromoAlVuelo,
  guardando,
  iconoOrden,
  irAlSiguientePrecio,
  itemsOrdenados,
  llantasLoading,
  loggeduser,
  manejarCliente,
  MarcasLlantas,
  modalRef,
  mostrarTabla,
  nextPage,
  nuevaCantidad,
  nuevoPrecio,
  nuevoServicio,
  onAlmacenesChanged,
  onCambioPromo,
  onRowsChange,
  ordenarPor,
  paquetesDisponibles,
  paquetesSeleccionados,
  page,
  paginaFin,
  paginaInicio,
  prevPage,
  promoGeneral,
  rowsPerPage,
  selectedAlmacenes,
  selectedAlmacenesLabel,
  sucursales,
  telefonoEsValido,
  telefonoFormateado,
  tituloModal,
  togglePromoAlVuelo,
  toggleTodos,
  totalCotizacion,
  totalPages,
  totalRows,
} = useCotizacionEditor({
  onGuardado: (cotizacion) => emit("saved", cotizacion),
});

defineExpose({
  abrir,
  cerrar: closeModal,
});
const cambiarEstadoEditor = (item) => {
  if (!item.mostrarEditor) {
    item._datosOriginales = {
      idMarca: item.idMarca,
      marca: item.marca,
      medida: item.medida,
      modelo: item.modelo,
      rango: item.rango,
    };
    item.mostrarEditor = true;
    return;
  }

  if (item._datosOriginales) {
    Object.assign(item, item._datosOriginales);
    delete item._datosOriginales;
  }
  item.mostrarEditor = false;
};
</script>
<style>
.edit_container {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  animation: deslizarDerecha 0.35s ease-out both;
}

.editor-cell {
  overflow: hidden;
  vertical-align: top;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.edit-action-btn {
  width: 6.5rem;
  height: 2.5rem;
  padding: 1;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;

  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.edit-action-btn:hover,
.edit-action-btn:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.6rem rgb(0 0 0 / 18%);
}

.edit-row {
  width: 100%;
  padding: 0;
  margin: 0;
}

.edit-table-wrapper {
  flex: 1;
  min-width: 0;
  padding: 0;
  margin: 0;
  border-right: 8px solid transparent;
}

.edit_container table,
.edit_container th,
.edit_container td {
  outline: 0;
  padding: 0;
  margin: 0;
}

.edit_container table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.edit_container input {
  width: 100%;
  min-height: 10px;
  border-radius: 0;

  margin: 0;
}

.buttons-container-edit {
  display: flex;
  flex-direction: row;
  width: 145px;
  min-width: 145px;
  margin: 0;
  padding: 0;
  gap: 0;
  overflow: visible;
  justify-content: end;

  align-self: stretch;
}

/* Ambos botones */
.buttons-container-edit button {
  position: relative;
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  min-height: 76px;
  height: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.5rem;

  cursor: pointer;
  outline: none;
  transition: transform 0.2s ease, filter 0.2s ease;
}
.cancel-edit-btn {
  background-color: #666;
  clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
  margin-right: -8px !important;
  z-index: 1;
}

.cancel-edit-btn:hover,
.cancel-edit-btn:focus-visible {
  transform: scaleX(1.3);
  transform-origin: left center;
  z-index: 10;
  filter: brightness(0.89);
}

.send-edit-btn {
  background-color: rgb(0, 132, 255);

  clip-path: polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%);

  z-index: 2;
}
.send-edit-btn:hover,
.send-edit-btn:focus-visible {
  transform: scaleX(1.25);
  transform-origin: right center;
  z-index: 10;
  filter: brightness(0.89);
}

.buttons-container-edit i {
  position: relative;
  z-index: 5;
}
@keyframes deslizarDerecha {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
