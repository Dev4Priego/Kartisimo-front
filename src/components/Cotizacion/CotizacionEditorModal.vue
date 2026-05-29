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
                <div
                  class="card-body"
                  style="font-size: 10pt; color: slategray"
                >
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
                        {{ paquete.nombre }} - $ {{ paquete.precioUnitario }}.00
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
                        <span>{{
                          selectedAlmacenes.length
                            ? selectedAlmacenes.join(", ")
                            : "Elegir almacenes"
                        }}</span>
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
                    <template #item-runflat="runFlat">
                      <div class="text-center">
                        <i
                          v-if="runFlat.runflat === '1'"
                          class="bi bi-check-circle-fill text-success"
                        ></i>
                      </div>
                    </template>

                    <template #item-medida="slotProps">
                      {{ slotProps.medida }} {{ slotProps.rango }}
                      {{ slotProps.runflat === "1" ? "RF" : "" }}
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
                    <div
                      v-if="cotizacionForm.observaciones"
                      class="mb-2 d-flex"
                    >
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
                          <th>Total</th>
                          <th>Promociones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template
                          v-for="item in cotizacionForm.llantas"
                          :key="'llanta-' + item.idLlanta"
                        >
                          <tr>
                            <td>
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
                                  min="0"
                                  class="form-control input-precio-unitario"
                                  :style="{ width: '90px' }"
                                  v-model.number="item.precioUnitario"
                                  placeholder="Precio c/u"
                                  @keydown="irAlSiguientePrecio"
                                />
                              </div>
                            </td>

                            <td>
                              <div
                                v-if="item.promo && item.promo.valor != null"
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
                                  {{
                                    formatoMoneda(
                                      precioFinalItem(item, promoGeneral) *
                                        (item.cantidad ?? 1),
                                    )
                                  }}
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
                              <div class="mb-2 d-flex align-items-center gap-2">
                                <select
                                  class="form-select form-select-sm"
                                  v-model.number="item.idPromocionSeleccionada"
                                  @change="onCambioPromo(item)"
                                  :disabled="item.idPromocionAlVuelo > 0"
                                >
                                  <option
                                    v-if="item.idPromocionAlVuelo > 0"
                                    :value="item.idPromocionSeleccionada"
                                  >
                                    {{ item.promo?.nombre }}
                                    ({{
                                      item.promo.tipo
                                        ? item.promo?.valor + "%"
                                        : "$" + item.promo?.valor
                                    }})
                                  </option>

                                  <option :value="0">Sin promoción</option>

                                  <option
                                    v-for="promo in item.promosAplicables.filter(
                                      (p) => !p.esAlVuelo,
                                    )"
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
                                <button
                                  class="btn btn-sm"
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

                              <button
                                class="btn btn-sm btn-outline-danger"
                                @click="eliminarLlanta(item.idLlanta)"
                                title="Eliminar llanta"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
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
                                  <label class="samll">
                                    Tipo de Promocion
                                  </label>
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
                                  min="0"
                                  class="form-control input-precio-unitario"
                                  :style="{ width: '90px' }"
                                  v-model.number="paq.precioUnitario"
                                  placeholder="Precio c/u"
                                  @keydown="irAlSiguientePrecio"
                                />
                              </div>
                            </td>

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
                              <div class="mb-2 d-flex align-items-center gap-2">
                                <select
                                  class="form-select form-select-sm"
                                  v-model.number="paq.idPromocionSeleccionada"
                                  @change="onCambioPromo(paq)"
                                  :disabled="paq.idPromocionAlVuelo > 0"
                                >
                                  <option
                                    v-if="paq.idPromocionAlVuelo > 0"
                                    :value="paq.idPromocionSeleccionada"
                                  >
                                    {{ paq.promo?.nombre }}
                                    ({{
                                      paq.promo.tipo
                                        ? paq.promo?.valor + "%"
                                        : "$" + paq.promo?.valor
                                    }})
                                  </option>

                                  <option :value="0">Sin promoción</option>

                                  <option
                                    v-for="promo in paq.promosAplicables.filter(
                                      (p) => !p.esAlVuelo,
                                    )"
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

                                <button
                                  type="button"
                                  class="btn btn-sm"
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

                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                @click="eliminarPaquete(paq.idPaquete)"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
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
                                  <label class="samll">
                                    Tipo de Promocion
                                  </label>
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
                                  min="0"
                                  class="form-control input-precio-unitario"
                                  :style="{ width: '90px' }"
                                  v-model.number="extra.precioUnitario"
                                  placeholder="Precio c/u"
                                  @keydown="irAlSiguientePrecio"
                                />
                              </div>
                            </td>

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
                                  {{
                                    formatoMoneda(
                                      precioFinalItem(extra, promoGeneral) *
                                        (extra.cantidad ?? 1),
                                    )
                                  }}
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
                              <div class="mb-2 d-flex align-items-center gap-2">
                                <select
                                  class="form-select form-select-sm"
                                  v-model="extra.idPromocionSeleccionada"
                                  @change="onCambioPromo(extra)"
                                  :disabled="extra.idPromocionAlVuelo > 0"
                                >
                                  <option
                                    v-if="extra.idPromocionAlVuelo > 0"
                                    :value="extra.idPromocionSeleccionada"
                                  >
                                    {{ extra.promo?.nombre }}
                                    ({{
                                      extra.promo.tipo
                                        ? extra.promo?.valor + "%"
                                        : "$" + extra.promo?.valor
                                    }})
                                  </option>

                                  <option :value="0">Sin promoción</option>

                                  <option
                                    v-for="promo in extra.promosAplicables.filter(
                                      (p) => !extra.esAlVuelo,
                                    )"
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
                                <button
                                  class="btn btn-sm"
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
                                  <label class="samll">
                                    Tipo de Promocion
                                  </label>
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
                          <td colspan="2">
                          </td>
                          <td colspan="2">
                            <div class="form-check my-1">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="mostrarTotal"
                                v-model="cotizacionForm.mostrarTotal"
                              />
                              <label class="form-check-label fs-7" for="mostrarTotal">
                                Mostrar total
                              </label>
                            </div>
                          </td>
                          <td class="text-end fs-5 fw-bold">
                            <span v-if="cotizacionForm.mostrarTotal">Total:</span>
                          </td>
                          <td class="fs-5 fw-bold text-end">
                            <span v-if="cotizacionForm.mostrarTotal">{{ formatoMoneda(totalCotizacion) }}</span>
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
              :disabled="!telefonoEsValido || !correoEsValido"
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
import { computed, isRef } from "vue";
import EasyDataTable from "vue3-easy-data-table";
import ClientesFilterOption from "@/components/Cotizacion/ClientesFilterOption.vue";

const props = defineProps({
  ctx: {
    type: Object,
    required: true,
  },
});

const getContextValue = (key) => {
  const value = props.ctx[key];
  return isRef(value) ? value.value : value;
};

const setContextValue = (key, nextValue) => {
  const value = props.ctx[key];

  if (isRef(value)) {
    value.value = nextValue;
    return;
  }

  props.ctx[key] = nextValue;
};

const modalRef = computed({
  get: () => getContextValue("modalRef"),
  set: (nextValue) => setContextValue("modalRef", nextValue),
});

const paquetesDisponibles = computed({
  get: () => getContextValue("paquetesDisponibles"),
  set: (nextValue) => setContextValue("paquetesDisponibles", nextValue),
});

const items = computed({
  get: () => getContextValue("items"),
  set: (nextValue) => setContextValue("items", nextValue),
});

const nuevoServicio = computed({
  get: () => getContextValue("nuevoServicio"),
  set: (nextValue) => setContextValue("nuevoServicio", nextValue),
});

const NuevoConceptoTrabajo = computed({
  get: () => getContextValue("NuevoConceptoTrabajo"),
  set: (nextValue) => setContextValue("NuevoConceptoTrabajo", nextValue),
});

const nuevoPrecio = computed({
  get: () => getContextValue("nuevoPrecio"),
  set: (nextValue) => setContextValue("nuevoPrecio", nextValue),
});

const nuevaCantidad = computed({
  get: () => getContextValue("nuevaCantidad"),
  set: (nextValue) => setContextValue("nuevaCantidad", nextValue),
});

const busquedaLlantas = computed({
  get: () => getContextValue("busquedaLlantas"),
  set: (nextValue) => setContextValue("busquedaLlantas", nextValue),
});

const conceptoOT = computed({
  get: () => getContextValue("conceptoOT"),
  set: (nextValue) => setContextValue("conceptoOT", nextValue),
});

const mostrarTabla = computed({
  get: () => getContextValue("mostrarTabla"),
  set: (nextValue) => setContextValue("mostrarTabla", nextValue),
});

const selectedAlmacenes = computed({
  get: () => getContextValue("selectedAlmacenes"),
  set: (nextValue) => setContextValue("selectedAlmacenes", nextValue),
});

const dropdownOpen = computed({
  get: () => getContextValue("dropdownOpen"),
  set: (nextValue) => setContextValue("dropdownOpen", nextValue),
});

const loggeduser = computed({
  get: () => getContextValue("loggeduser"),
  set: (nextValue) => setContextValue("loggeduser", nextValue),
});

const sucursales = computed({
  get: () => getContextValue("sucursales"),
  set: (nextValue) => setContextValue("sucursales", nextValue),
});

const tituloModal = computed({
  get: () => getContextValue("tituloModal"),
  set: (nextValue) => setContextValue("tituloModal", nextValue),
});

const paquetesSeleccionados = computed({
  get: () => getContextValue("paquetesSeleccionados"),
  set: (nextValue) => setContextValue("paquetesSeleccionados", nextValue),
});

const sortBy = computed({
  get: () => getContextValue("sortBy"),
  set: (nextValue) => setContextValue("sortBy", nextValue),
});

const sortType = computed({
  get: () => getContextValue("sortType"),
  set: (nextValue) => setContextValue("sortType", nextValue),
});

const tableKey = computed({
  get: () => getContextValue("tableKey"),
  set: (nextValue) => setContextValue("tableKey", nextValue),
});

const onUpdateSortBy = computed({
  get: () => getContextValue("onUpdateSortBy"),
  set: (nextValue) => setContextValue("onUpdateSortBy", nextValue),
});

const onUpdateSortType = computed({
  get: () => getContextValue("onUpdateSortType"),
  set: (nextValue) => setContextValue("onUpdateSortType", nextValue),
});

const promoGeneral = computed({
  get: () => getContextValue("promoGeneral"),
  set: (nextValue) => setContextValue("promoGeneral", nextValue),
});

const cotizacionForm = computed({
  get: () => getContextValue("cotizacionForm"),
  set: (nextValue) => setContextValue("cotizacionForm", nextValue),
});

const PromocionesVuelo = computed({
  get: () => getContextValue("PromocionesVuelo"),
  set: (nextValue) => setContextValue("PromocionesVuelo", nextValue),
});

const telefonoFormateado = computed({
  get: () => getContextValue("telefonoFormateado"),
  set: (nextValue) => setContextValue("telefonoFormateado", nextValue),
});

const telefonoEsValido = computed({
  get: () => getContextValue("telefonoEsValido"),
  set: (nextValue) => setContextValue("telefonoEsValido", nextValue),
});

const correoEsValido = computed({
  get: () => getContextValue("correoEsValido"),
  set: (nextValue) => setContextValue("correoEsValido", nextValue),
});

const ajustaNombre = computed({
  get: () => getContextValue("ajustaNombre"),
  set: (nextValue) => setContextValue("ajustaNombre", nextValue),
});

const irAlSiguientePrecio = computed({
  get: () => getContextValue("irAlSiguientePrecio"),
  set: (nextValue) => setContextValue("irAlSiguientePrecio", nextValue),
});

const eliminarPaquete = computed({
  get: () => getContextValue("eliminarPaquete"),
  set: (nextValue) => setContextValue("eliminarPaquete", nextValue),
});

const agregarServicioExtra = computed({
  get: () => getContextValue("agregarServicioExtra"),
  set: (nextValue) => setContextValue("agregarServicioExtra", nextValue),
});

const eliminarServicioExtra = computed({
  get: () => getContextValue("eliminarServicioExtra"),
  set: (nextValue) => setContextValue("eliminarServicioExtra", nextValue),
});

const eliminarLlanta = computed({
  get: () => getContextValue("eliminarLlanta"),
  set: (nextValue) => setContextValue("eliminarLlanta", nextValue),
});

const agregarLlanta = computed({
  get: () => getContextValue("agregarLlanta"),
  set: (nextValue) => setContextValue("agregarLlanta", nextValue),
});

const onCambioPromo = computed({
  get: () => getContextValue("onCambioPromo"),
  set: (nextValue) => setContextValue("onCambioPromo", nextValue),
});

const precioFinalItem = computed({
  get: () => getContextValue("precioFinalItem"),
  set: (nextValue) => setContextValue("precioFinalItem", nextValue),
});

const guardarCotizacion = computed({
  get: () => getContextValue("guardarCotizacion"),
  set: (nextValue) => setContextValue("guardarCotizacion", nextValue),
});

const totalCotizacion = computed({
  get: () => getContextValue("totalCotizacion"),
  set: (nextValue) => setContextValue("totalCotizacion", nextValue),
});

const itemsFiltrados = computed({
  get: () => getContextValue("itemsFiltrados"),
  set: (nextValue) => setContextValue("itemsFiltrados", nextValue),
});

const toggleTodos = computed({
  get: () => getContextValue("toggleTodos"),
  set: (nextValue) => setContextValue("toggleTodos", nextValue),
});

const almacenes = computed({
  get: () => getContextValue("almacenes"),
  set: (nextValue) => setContextValue("almacenes", nextValue),
});

const closeModal = computed({
  get: () => getContextValue("closeModal"),
  set: (nextValue) => setContextValue("closeModal", nextValue),
});

const formatoMoneda = computed({
  get: () => getContextValue("formatoMoneda"),
  set: (nextValue) => setContextValue("formatoMoneda", nextValue),
});

const tblHeadersModal = computed({
  get: () => getContextValue("tblHeadersModal"),
  set: (nextValue) => setContextValue("tblHeadersModal", nextValue),
});

const manejarCliente = computed({
  get: () => getContextValue("manejarCliente"),
  set: (nextValue) => setContextValue("manejarCliente", nextValue),
});

const buscarPromocionAplicada = computed({
  get: () => getContextValue("buscarPromocionAplicada"),
  set: (nextValue) => setContextValue("buscarPromocionAplicada", nextValue),
});

const togglePromoAlVuelo = computed({
  get: () => getContextValue("togglePromoAlVuelo"),
  set: (nextValue) => setContextValue("togglePromoAlVuelo", nextValue),
});

const guardarPromoAlVuelo = computed({
  get: () => getContextValue("guardarPromoAlVuelo"),
  set: (nextValue) => setContextValue("guardarPromoAlVuelo", nextValue),
});
</script>
