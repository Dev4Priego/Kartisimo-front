<template>
  <div
    class="modal fade show"
    tabindex="-1"
    style="display: block"
    :style="{ background: 'rgba(0,0,0,0.5)' }"
    v-if="modelValue"
    @click="handleBackdropClick"
  >
    <div
      class="modal-dialog modal-centered modal-dialog-scrollable modal-xl"
      style="max-width: 95vw"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Vista previa Insumos</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <div class="modal-body p-5">
          <!-- PAQUETES -->
          <div class="row mb-4">
            <div class="col">
              <div class="border rounded shadow-sm p-4 text-start">
                <div class="col text-start my-2">
                  <div
                    v-for="(paquete, i) in paqueteDisponibles"
                    :key="i"
                    class="form-check-inline"
                  >
                    <input
                      class="form-check-input mx-2"
                      type="checkbox"
                      :value="paquete.idPaquete"
                      v-model="paqueteSeleccionados"
                      @change="onTogglePaquete(paquete)"
                    />
                    <label class="form-check-label" :for="'paquete-' + i">
                      {{ paquete.nombre }} - ${{ paquete.precioUnitario }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- LLANTAS -->
          <div class="row mb-4">
            <div class="col text-start my-2">
              <h5>Seleccionar las llantas deseadas</h5>
              <!-- Filtros -->
              <div class="row">
                <div class="col-9">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Buscar (modelo, marca, medidas...)"
                    v-model="search"
                    @input="onSearch"
                  />
                </div>
                <div class="col-3">
                  <div class="position-relative">
                    <button
                      type="button"
                      class="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                      @click="dropdownOpen = !dropdownOpen"
                    >
                      <span>{{ "Elegir almacenes" }}</span>
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
                      <!-- Filtro por almacén -->

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
                <!-- Buscar -->
              </div>
            </div>

            <!-- TABLA LLANTAS CON CONTENEDOR -->
            <div class="row my-3">
              <div class="col">
                <div class="table-responsive">
                  <table
                    class="table table-sm table-hover align-middle mb-0"
                    style="font-size: 9pt"
                  >
                    <thead class="table-light" style="font-size: 9pt">
                      <tr>
                        <th class="text-start">Llanta</th>
                        <th>Rango</th>
                        <th>Runflat</th>
                        <th>Código</th>
                        <th>Medidas</th>
                        <th class="text-center">Cantidad</th>
                        <th>Ubicación</th>
                        <th class="text-end">Precio</th>
                        <th class="text-end"></th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="(item, index) in items" :key="index">
                        <td class="text-start">
                          {{ item.marca }} {{ item.modelo }}
                        </td>
                        <td>{{ item.rango }}</td>
                        <td class="text-center">
                          <i
                            v-if="item.runflat == 1"
                            class="bi bi-check-circle-fill text-success"
                          ></i>
                        </td>
                        <td class="text-start">{{ item.codigo }}</td>
                        <td class="text-start">
                          {{ item.medida }} {{ item.runflat == 1 ? "RF" : "" }}
                        </td>
                        <td class="text-center">
                          {{ item.cantidad }}
                        </td>
                        <td>{{ item.ubicacion }}</td>
                        <td class="text-end">${{ item.precio }}</td>
                        <td class="text-end">
                          <button
                            v-if="
                              !llantas.some(
                                (ll) => ll.idLlanta === item.idLlanta,
                              )
                            "
                            type="button"
                            class="btn btn-success btn-sm"
                            @click="agregarLlanta(item.objLlanta)"
                          >
                            <i class="bi bi-plus"></i>
                          </button>

                          <span v-else class="text-muted small">
                            Agregada
                          </span>
                        </td>
                      </tr>

                      <tr v-if="items.length === 0">
                        <td colspan="9" class="text-center py-4 text-muted">
                          No hay datos disponibles
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div
              class="d-flex justify-content-end align-items-center mt-3"
              style="font-size: 9pt"
            >
              <!-- Selector de filas por página -->
              <div class="mx-2">
                <table>
                  <tbody>
                    <tr>
                      <td style="white-space: nowrap">Renglones por página:</td>
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

              <!-- Total -->
              <div class="mx-2">
                <strong>Página {{ page }}:</strong>
                {{ rowsPerPage * (page - 1) + 1 }}-{{
                  rowsPerPage * page < totalRows
                    ? rowsPerPage * page
                    : totalRows
                }}
                de {{ totalRows }}
              </div>

              <!-- Controles -->
              <div class="mx-2">
                <button
                  class="btn btn-outline-dark btn-sm me-2"
                  @click="prevPage"
                  :disabled="page <= 1"
                  type="button"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>

                <button
                  class="btn btn-outline-dark btn-sm btn-border-radius-sm"
                  @click="nextPage"
                  :disabled="page >= totalPages"
                  type="button"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
          <hr />
          <div class="mt-4">
            <ModalAdicional
              v-model:adicionales="adicionales"
              :conceptoOT="conceptoOT"
            />
          </div>
          <hr />
          <!-- TABLA RESUMEN DE PRODUCTOS Y SERVICIOS -->
          <div class="mt-4">
            <h4 class="mb-3">Resumen de productos y servicios</h4>

            <div class="table-responsive">
              <table class="table fixed-header-table">
                <thead>
                  <tr>
                    <th>Concepto trabajo</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>P/U</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- LLANTAS -->
                  <template v-for="(ll, i) in llantas || []" :key="'ll-' + i">
                    <tr>
                      <td>
                        <select
                          class="form-select form-select-sm"
                          v-model="ll.idConceptoTrabajo"
                        >
                          <!-- Default -->
                          <option :value="0">-- Seleccione concepto --</option>

                          <option
                            v-for="c in conceptoOT"
                            :key="c.idConceptoOrdenTrabajo"
                            :value="c.idConceptoOrdenTrabajo"
                          >
                            {{ c.nombre }}
                          </option>
                        </select>
                      </td>
                      <td>{{ ll.medida }} {{ ll.marca }} {{ ll.modelo }}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          class="form-control form-control-sm"
                          v-model.number="ll.cantidad"
                          @input="recalcularSubtotal(ll)"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          class="form-control form-control-sm input-precio-unitario"
                          v-model.number="ll.precioUnitario"
                          @input="recalcularSubtotal(ll)"
                          @keydown="irAlSiguientePrecio"
                        />
                      </td>

                      <td>
                        <div
                          v-if="
                            (ll.idPromocion != null && ll.idPromocion !== 0) ||
                            (ll.idPromocionVuelo != null &&
                              ll.idPromocionVuelo !== 0)
                          "
                        >
                          <span class="text-decoration-line-through text-muted">
                            {{
                              (ll.cantidad * ll.precioUnitario).toLocaleString(
                                "es-MX",
                                { style: "currency", currency: "MXN" },
                              )
                            }}
                          </span>
                          <br />
                          <span>
                            <small class="badge bg-danger mt-1">
                              {{ ll.promo?.nombre || "Promocion Aplicada" }}
                            </small>
                          </span>
                          <br />
                          <span class="text-success fw-bold mx-2">
                            {{
                              Number(ll.subTotal).toLocaleString("es-MX", {
                                style: "currency",
                                currency: "MXN",
                              })
                            }}
                          </span>
                        </div>
                        <div v-else>
                          {{
                            Number(
                              ll.cantidad * ll.precioUnitario,
                            ).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </div>
                      </td>
                      <!-- Acciones -->
                      <td>
                        <div class="mb-2 d-flex align-items-center gap-2">
                          <select
                            class="form-select form-select-sm"
                            v-model="ll.idPromocionSeleccionada"
                            @change="onPromoChange(ll)"
                            :disabled="ll.idPromocionVuelo > 0"
                          >
                            <option
                              v-if="ll.idPromocionVuelo > 0"
                              :value="ll.idPromocionVuelo"
                            >
                              {{ ll.promo?.nombre || "Promocion Aplicada" }}
                            </option>
                            <!-- Default -->
                            <option :value="0">-- Sin promoción --</option>
                            <!-- Promociones disponibles -->
                            <option
                              v-for="promo in ll.promosDisponibles"
                              :key="promo.idPromocion"
                              :value="promo.idPromocion"
                            >
                              {{ promo.nombre }}
                            </option>
                          </select>

                          <button
                            type="button"
                            class="btn btn-sm"
                            :class="
                              buscarPromocionAplicada(ll)
                                ? 'btn-outline-danger'
                                : 'btn-outline-primary'
                            "
                            @click="togglePromoAlVuelo(ll)"
                            :disabled="
                              ll.idPromocionSeleccionada > 0 &&
                              !buscarPromocionAplicada(ll)
                            "
                          >
                            <i
                              :class="
                                buscarPromocionAplicada(ll)
                                  ? 'bi bi-x-lg'
                                  : 'bi bi-plus-lg'
                              "
                            ></i>
                          </button>
                        </div>

                        <button
                          type="button"
                          class="btn btn-danger btn-sm mt-1"
                          @click="borrarInsumo(ll)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr
                      v-if="ll.mostrarEditorPromo"
                      :key="'editor-' + ll.idLlanta"
                    >
                      <!--- Se Valida con una variable global, si esta en true, significa que el usuario va a crear una promocion nueva--->
                      <td
                        colspan="6"
                        class="bg-light justify-content-end align-items-end"
                      >
                        <div
                          class="d-flex gap-2 justify-content-end align-items-center"
                        >
                          <!-- Nombre -->
                          <div>
                            <label class="small">Nombre</label>
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              v-model="PromocionesVuelo.nombre"
                            />
                          </div>

                          <!-- Tipo -->
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

                          <!-- Valor -->
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

                          <!-- Guardar -->
                          <button
                            type="button"
                            class="btn btn-success btn-sm"
                            @click="guardarPromoAlVuelo(ll)"
                          >
                            Agregar
                          </button>

                          <!-- Cancelar -->
                          <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            @click="ll.mostrarEditorPromo = false"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <!-- PAQUETES + DETALLES -->
                  <template
                    v-for="(paq, j) in paquetes || []"
                    :key="'paq-' + j"
                  >
                    <!-- FILA DEL PAQUETE -->
                    <tr>
                      <td></td>

                      <td>{{ paq.descripcion }}</td>
                      <td>{{ paq.cantidad }}</td>

                      <td>
                        {{
                          Number(paq.precioUnitario).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </td>

                      <td>
                        <div
                          v-if="
                            (paq.idPromocion && paq.idPromocion !== 0) ||
                            (paq.idPromocionVuelo != null &&
                              paq.idPromocionVuelo !== 0)
                          "
                        >
                          <span class="text-decoration-line-through text-muted">
                            {{
                              (
                                paq.cantidad * paq.precioUnitario
                              ).toLocaleString("es-MX", {
                                style: "currency",
                                currency: "MXN",
                              })
                            }}
                          </span>
                          <br />
                          <span>
                            <small class="badge bg-danger mt-1">
                              {{ paq.promo?.nombre || "Promocion Aplicada" }}
                            </small>
                          </span>
                          <br />
                          <span class="text-success fw-bold mx-2">
                            {{
                              Number(paq.subTotal).toLocaleString("es-MX", {
                                style: "currency",
                                currency: "MXN",
                              })
                            }}
                          </span>
                        </div>
                        <div v-else>
                          {{
                            Number(
                              paq.cantidad * paq.precioUnitario,
                            ).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                        </div>
                      </td>

                      <td>
                        <div class="mb-2 d-flex align-items-center gap-2">
                          <select
                            class="form-select form-select-sm"
                            v-model="paq.idPromocionSeleccionada"
                            @change="onPromoChange(paq)"
                            :disabled="paq.idPromocionVuelo > 0"
                          >
                            <option
                              v-if="paq.idPromocionVuelo > 0"
                              :value="paq.idPromocionVuelo"
                            >
                              {{
                                paq.promo?.nombre || "Promocion Vuelo APlicada"
                              }}
                            </option>
                            <option :value="0">-- Sin promoción --</option>
                            <option
                              v-for="promo in paq.promosDisponibles"
                              :key="promo.idPromocion"
                              :value="promo.idPromocion"
                            >
                              {{ promo?.nombre || "Promocion Aplicada" }}
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
                          class="btn btn-danger btn-sm mt-1"
                          @click="borrarPaquete(paq)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr
                      v-if="paq.mostrarEditorPromo"
                      :key="'editor-' + paq.idPaquete"
                    >
                      <!--- Se Valida con una variable global, si esta en true, significa que el usuario va a crear una promocion nueva--->
                      <td
                        colspan="6"
                        class="bg-light justify-content-end align-items-end"
                      >
                        <div
                          class="d-flex gap-2 justify-content-end align-items-center"
                        >
                          <!-- Nombre -->
                          <div>
                            <label class="small">Nombre</label>
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              v-model="PromocionesVuelo.nombre"
                            />
                          </div>

                          <!-- Tipo -->
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

                          <!-- Valor -->
                          <div>
                            <label class="small">Valor</label>
                            <input
                              type="number"
                              min="0"
                              class="form-control form-control-sm"
                              v-model.number="PromocionesVuelo.valor"
                            />
                          </div>
                          <!-- Radios -->
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

                          <!-- Guardar -->
                          <button
                            type="button"
                            class="btn btn-success btn-sm"
                            @click="guardarPromoAlVuelo(paq)"
                          >
                            Agregar
                          </button>

                          <!-- Cancelar -->
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

                    <!-- FILAS DE DETALLE DEL PAQUETE -->
                    <tr
                      v-for="(det, k) in paq.detalle || []"
                      :key="'det-' + paq.idPaquete + '-' + k"
                    >
                      <td>
                        <select
                          class="form-select form-select-sm"
                          v-model="det.idConceptoTrabajo"
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
                      </td>
                      <td class="ps-4">↳ {{ det.descripcion }}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          class="form-control form-control-sm"
                          v-model.number="det.cantidad"
                          @input="recalcularSubtotal(det)"
                        />
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </template>
                  <!--Separar los paquetes con los servicios adicionales  para una mejor vista-->
                  <tr v-if="adicionales.length > 0">
                    <td colspan="6">
                      <h4>Servicios Adicionales</h4>
                    </td>
                  </tr>
                  <!--SERVICIOS ADICIONALES-->
                  <template
                    v-for="(ad, i) in adicionales || []"
                    :key="'ad-' + i"
                  >
                    <tr>
                      <td>
                        <select
                          class="form-select form-select-sm"
                          v-model="ad.idConceptoTrabajo"
                        >
                          <!-- Default -->
                          <option :value="0">-- Seleccione concepto --</option>

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
                        <strong>
                          {{ ad.descripcion }}
                        </strong>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          class="form-control form-control-sm"
                          v-model.number="ad.cantidad"
                          @input="recalcularSubtotal(ad)"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          class="form-control form-control-sm input-precio-unitario"
                          v-model.number="ad.precioUnitario"
                          @input="recalcularSubtotal(ad)"
                          @keydown="irAlSiguientePrecio"
                        />
                      </td>

                      <td>
                        <div
                          v-if="
                            (ad.idPromocion != null && ad.idPromocion !== 0) ||
                            (ad.idPromocionVuelo != null &&
                              ad.idPromocionVuelo !== 0)
                          "
                        >
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
                      <!-- Acciones -->
                      <td>
                        <div class="mb-2 d-flex align-items-center gap-2">
                          <select
                            class="form-select form-select-sm"
                            v-model="ad.idPromocionSeleccionada"
                            @change="onPromoChange(ad)"
                            :disabled="ad.idPromocionVuelo > 0"
                          >
                            <option
                              v-if="ad.idPromocionVuelo > 0"
                              :value="ad.idPromocionVuelo"
                            >
                              {{ ad.promo?.nombre || "Promocion Aplicada" }}
                            </option>
                            <!-- Default -->
                            <option :value="0">-- Sin promoción --</option>

                            <!-- Promociones disponibles -->
                            <option
                              v-for="promo in ad.promosDisponibles"
                              :key="promo.idPromocion"
                              :value="promo.idPromocion"
                            >
                              {{ promo?.nombre || "Promocion Aplicada" }}
                            </option>
                          </select>

                          <button
                            type="button"
                            class="btn btn-sm"
                            :class="
                              buscarPromocionAplicada(ad)
                                ? 'btn-outline-danger'
                                : 'btn-outline-primary'
                            "
                            @click="togglePromoAlVuelo(ad)"
                            :disabled="
                              ad.idPromocionSeleccionada > 0 &&
                              !buscarPromocionAplicada(ad)
                            "
                          >
                            <i
                              :class="
                                buscarPromocionAplicada(ad)
                                  ? 'bi bi-x-lg'
                                  : 'bi bi-plus-lg'
                              "
                            ></i>
                          </button>
                        </div>

                        <button
                          type="button"
                          class="btn btn-danger btn-sm mt-1"
                          @click="borrarAdicional(ad)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr
                      v-if="ad.mostrarEditorPromo"
                      :key="'editor-' + ad.idAdicional"
                    >
                      <!--- Se Valida con una variable global, si esta en true, significa que el usuario va a crear una promocion nueva--->
                      <td
                        colspan="6"
                        class="bg-light justify-content-end align-items-end"
                      >
                        <div
                          class="d-flex gap-2 justify-content-end align-items-center"
                        >
                          <!-- Nombre -->
                          <div>
                            <label class="small">Nombre</label>
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              v-model="PromocionesVuelo.nombre"
                            />
                          </div>

                          <!-- Tipo -->
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

                          <!-- Valor -->
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

                          <!-- Guardar -->
                          <button
                            type="button"
                            class="btn btn-success btn-sm"
                            @click="guardarPromoAlVuelo(ad)"
                          >
                            Agregar
                          </button>

                          <!-- Cancelar -->
                          <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            @click="ad.mostrarEditorPromo = false"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <!--Total de insumos-->
                  <tr>
                    <td colspan="5" class="text-end fs-5 fw-bold">
                      <h4>Total:</h4>
                    </td>
                    <td class="fs-5 fw-bold text-end">
                      <h4>
                        {{
                          Number(totales.total).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </h4>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary position-relative mx-4"
            style="width: 130px"
            @click="close"
          >
            <i class="bi bi-x-circle-fill position-absolute start-0 ms-2"></i>
            &nbsp;Cerrar
          </button>
          <button
            type="button"
            class="btn btn-success position-relative"
            style="width: 130px"
            @click="guardarInsumo"
          >
            <i class="bi bi-save-fill position-absolute start-0 ms-2"></i>
            &nbsp;Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  defineProps,
  defineEmits,
  watch,
  onMounted,
  ref,
  getCurrentInstance,
  computed,
} from "vue";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import ModalAdicional from "./ModalAdicional.vue";
import { reactive } from "vue";
const { proxy } = getCurrentInstance();

const llantas = ref([]);
const paquetes = ref([]);
const adicionales = ref([]);

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: "Modal" },
  insumos: Object,
});

const emit = defineEmits(["update:modelValue", "update:insumos"]);

//const mostrarModalAdicional = ref(false);

// observar si hay cambios en prpos.insumo, si hay cambios copiar el arreglo y establecer el del componente
const inicializado = ref(false);

watch(
  () => props.insumos,
  (nuevo) => {
    llantas.value = [...(nuevo.llanta || [])];
    paquetes.value = [...(nuevo.paquete || [])];
    adicionales.value = [...(nuevo.adicional || [])];
    console.log("INSUMOS MODAL:", nuevo);
  },
  { immediate: true }
);

const close = () => emit("update:modelValue", false);

// Estados
const items = ref([]);
const totalRows = ref(0);
const page = ref(1);
const rowsPerPage = ref(20);
const loading = ref(false);
const search = ref("");

const almacenes = ref([]);
const selectedAlmacenes = ref([]);
const dropdownOpen = ref(false);

const conceptoOT = ref([]);

const paqueteDisponibles = ref([]);
const paqueteSeleccionados = ref([]);

//Array de las Promociones Vuelo
const PromocionesVuelo = reactive({
  nombre: "",
  tipo: false,
  valor: 0,
  tipoPromocion: null,
});

// Si existe idPromocion, Busca la promo en ll.promosDisponibles, Copia los datos importantes al item, recalcula Subtotal
const onPromoChange = (item) => {
  console.log("ITEM EN PROMOCHANGE:", item);
  const idSel = item.idPromocionSeleccionada; // normal
  const idVuelo = item.idPromocionVuelo; // vuelo

  // Si no hay ninguna promoción
  if (!idSel && !idVuelo) {
    item.promo = {
      idPromocion: 0,
      valor: 0,
      tipo: false,
      nombre: "",
    };

    item.precioConPromo = item.precioUnitario;
    item.isVuelo = null;
    item.idPromocion = 0; // Reset idPromocion for normal promos
    recalcularSubtotal(item);
    return;
  }

  // Buscamos la promoción correspondiente
  const promo = (item.promosAplicables || []).find(
    (p) => p.idPromocion === idSel || p.idPromocion === idVuelo,
  );

  item.promo = promo || null;
  item.isVuelo = !!idVuelo;

  // Set idPromocion for normal promos to enable display
  if (idSel && !idVuelo) {
    item.idPromocion = idSel;
  } else if (idVuelo) {
    item.idPromocion = 0; // For al vuelo, keep as 0
  }

  // Calcular precio con la promo
  recalcularSubtotal(item);
};
const obtenerPromoSeleccionada = (item) => {
  const allPromos = [
    ...(item.promosDisponibles || []),
    ...(item.promosAplicables || []),
  ];
  return allPromos.find(
    (p) => p.idPromocion === item.idPromocionSeleccionada // <-- usar idSel
  );
};
const precioFinalItem = (item , promo) => {
  console.log("PrecioFinalItem Item [INFO]: ", item )
  const base = item.precioUnitario * item.cantidad;
 
  console.log("PrecioFinalItem PROMO [INFO]: ", promo )
  if (!promo) return base;

  const res =promo.tipo
    ? base * (1 - promo.valor / 100)
    : Math.max(0, base - promo.valor);
  console.log("PrecioFinalItem RES [INFO]: ", res )
  return res;
  };

const recalcularSubtotal = (item) => {
  // Resolver promo actual según selección
  let promo = null;
  if (item.idPromocionVuelo) {
    promo = { ...item.promo }; 
  } else if (item.idPromocionSeleccionada) {
    promo = obtenerPromoSeleccionada(item);
  }
  // Si no hay promo válida, resetear
  if (!promo) {
    promo = {
      idPromocion: 0,
      valor: 0,
      tipo: false,
      nombre: "",
    };
  }
  // Actualizar siempre item.promo con la promo vigente
  item.promo = promo;
  item.esAlVuelo = !!item.idPromocionVuelo;
  // Calcular precio final con la promo vigente
  const precioFinal = precioFinalItem(item, promo);
  item.precioConPromo = precioFinal;
  item.subTotal = precioFinal.toFixed(2);
};


const borrarInsumo = (insumo) => {
  insumo.eliminado = true;

  llantas.value = llantas.value.filter((x) => x.idLlanta !== insumo.idLlanta);

  mostrarToast("success", "Insumo eliminado");
};

const borrarPaquete = (paquete) => {
  paquete.eliminado = true;

  paquetes.value = paquetes.value.filter(
    (x) => x.idPaquete !== paquete.idPaquete,
  );

  mostrarToast("success", "Paquete eliminado");
};

const borrarAdicional = (adicional) => {
  adicional.eliminado = true;
  //console.log(adicional.tempId);
  adicionales.value = adicionales.value.filter((x) => {
    if (adicional.tempId) {
      return x.tempId !== adicional.tempId;
    }
    return (
      x.idDetalleCotizacionServicio !== adicional.idDetalleCotizacionServicio
    );
  });

  mostrarToast("success", "Servicio eliminado");
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

// --- Seleccionar TODOS ---
const toggleTodos = () => {
  selectedAlmacenes.value = [];
  cargarLlantas();
};

// --- Cambio individual de almacén ---
const onAlmacenesChanged = () => {
  cargarLlantas();
};

// Total de páginas
const totalPages = computed(() =>
  Math.ceil(totalRows.value / rowsPerPage.value),
);

// Cargar datos paginados
const cargarLlantas = async () => {
  loading.value = true;

  try {
    // Aplicar filtro por Almacen
    const almacenesCsv =
      selectedAlmacenes.value.length > 0
        ? selectedAlmacenes.value.join(",")
        : ""; // "8,5,10"

    const url =
      `${proxy.$serverIP}api/Llanta/getLlantaPrecio-Paginado?page=${page.value}` +
      `&pageSize=${rowsPerPage.value}` +
      `&search=${encodeURIComponent(search.value || "")}` +
      `&idAlmacenes=${encodeURIComponent(almacenesCsv)}`;

    const res = await fetch(url);
    const data = await res.json();

    totalRows.value = Number(data.totalRows || 0);

    items.value = data.items
      .filter((l) => !l.eliminado)
      .map((l) => ({
        codigo: l.codigo,
        modelo: l.modelo,
        marca: l.nombreMarca,
        medida: l.medidas,
        runflat: l.runflat,
        rango: l.rango,
        precio: Number(l.precio),
        ubicacion: l.nombreAlmacen,
        cantidad: Number(l.cantidad),
        eliminado: l.eliminado,

        idLlanta: l.idLlanta,
        idInventarioInicial: l.idInventarioInicial,
        idAlmacen: l.idAlmacen,
        objLlanta: l,
      }));
  } finally {
    loading.value = false;
  }
};

// Botón "Anterior"
const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    cargarLlantas();
  }
};

// Botón "Siguiente"
const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
    cargarLlantas();
  }
};

// Cambio en rowsPerPage
const onRowsChange = () => {
  page.value = 1;
  cargarLlantas();
};

// Watchers
watch(search, () => {
  page.value = 1;
  cargarLlantas();
});

// Cerrar con ESC
const handleEsc = (event) => {
  if (event.key === "Escape") close();
};

watch(
  () => props.modelValue,
  (v) => {
    if (v) document.addEventListener("keydown", handleEsc);
    else document.removeEventListener("keydown", handleEsc);
  },
);

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

const agregarLlanta = async (itm) => {
  if (llantas.value.length >= 6) {
    mostrarToast("warning", "No puedes agregar más de 6 llantas");
    return;
  }

  const yaExiste = llantas.value.some(
    (l) => l.idInventarioInicial === itm.idInventarioInicial,
  );

  if (yaExiste) {
    mostrarToast("warning", "Esta llanta ya fue agregada");
    return;
  }

  const nuevaLlanta = {
    idDetalleOTLlanta: 0,
    idLlanta: itm.idLlanta,
    idAlmacen: itm.idAlmacen,
    idPromocion: 0,
    idPromocionVuelo: 0,
    idPromocionSeleccionada: 0,
    idConceptoTrabajo: 1,
    idInventarioInicial: itm.idInventarioInicial,

    descripcion: `${itm.medidas} ${itm.nombreMarca} ${itm.modelo}`,
    medida: itm.medidas,
    modelo: itm.modelo,
    marca: itm.nombreMarca,
    ubicacion: itm.ubicacion,

    cantidad: 4,
    precioUnitario: Math.trunc(itm.precio || 0),
    subTotal: (4 * Math.trunc(itm.precio || 0)).toFixed(2),

    promosDisponibles: [],
    promosAplicables: [],
    // valores históricos

    promo: {
      idPromocion: 0,
      valor: 0,
      tipo: false,
      nombre: "",
    },
    //  activo por defecto → botón rojo
    activo: true,
  };

  try {
    const promos = await obtenerPromosPorInventario(itm.idInventarioInicial);

    nuevaLlanta.promosDisponibles = promos || [];
  } catch (error) {
    console.error("Error al cargar promociones", error);
    nuevaLlanta.promosDisponibles = [];
  }

  // agregar
  llantas.value.push(nuevaLlanta);

  // ordenar
  llantas.value.sort((a, b) => {
    const prioridad = (llanta) => {
      const marca = llanta.marca?.toUpperCase() || "";
      if (marca.includes("BRIDGESTONE")) return 1;
      if (marca.includes("FIRESTONE")) return 2;
      return 3;
    };

    const pa = prioridad(a);
    const pb = prioridad(b);

    if (pa !== pb) return pa - pb;
    return (b.precioUnitario || 0) - (a.precioUnitario || 0);
  });
};

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

const cargarConcpetoTrabajo = async () => {
  try {
    const response = await fetch(`${proxy.$serverIP}api/ConceptoTrabajo/get`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    conceptoOT.value = data.map((a) => ({
      idConceptoOrdenTrabajo: a.idConcetoOrdenTrabajo,
      nombre: a.nombre,
    }));

    // console.log('Datos recibidos:', conceptoOT.value)
  } catch (error) {
    console.error("Error cargando ConceptoTrabajo:", error);
  }
};

const cargarPaquetes = async () => {
  try {
    const response = await fetch(`${proxy.$serverIP}api/Paquetes/getPaquete`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    paqueteDisponibles.value = data.map((p) => ({
      idPaquete: p.idPaquete,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precioUnitario: p.precioUnitario,

      // MISMO NOMBRE que usas después
      detalle: (p.detalle || []).map((d) => ({
        idDesglosePaquete: d.idDesglosePaquete,
        idConceptoTrabajo: d.idConceptoTrabajo,
        nombre: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      })),
    }));
    // console.log(paqueteDisponibles)
  } catch (error) {
    console.error("Error cargando paquetes:", error);
  }
};

// si hay cambios en el arreglo de paquetes, marca los checboxes de los paquetes que existan en el arreglo
watch(
  () => paquetes.value,
  (nuevoValor) => {
    if (!Array.isArray(nuevoValor)) return;

    paqueteSeleccionados.value = nuevoValor.map((p) => p.idPaquete);
  },
  { immediate: true, deep: true },
);

//watch para recalcular el total cada vez que cambie el arreglo de paquetes, o las promociones seleccionadas dentro de cada paquete, llanta o adicional
const totales = computed(() => {
  const insumosMapeados = mapearInsumosParaPadre();
  console.log("INSUMOS:", insumosMapeados);
  return calcularTotalesDesdeInsumos(insumosMapeados);
});
// agregar o quitar a el arreglo paquetes, conforme checbox
const onTogglePaquete = async (paqueteBase) => {
  const existe = paquetes.value.some(
    (p) => p.idPaquete === paqueteBase.idPaquete,
  );

  //  QUITAR
  if (existe) {
    paquetes.value = paquetes.value.filter(
      (p) => p.idPaquete !== paqueteBase.idPaquete,
    );
    return;
  }

  // AGREGAR
  const promosDisponibles =
    (await obtenerPromosPorPaquete(paqueteBase.idPaquete)) || [];

  paquetes.value.push({
    idDetalleOTPaquete: 0,
    idPaquete: paqueteBase.idPaquete,
    idPromocion: 0,
    idConceptoTrabajo: 0,
    idPromocionVuelo: 0,
    idPromocionSeleccionada: 0,
    descripcion: paqueteBase.nombre,
    cantidad: 1,
    precioUnitario: paqueteBase.precioUnitario,
    promo:{
      idPromocion:0,
      valor:0,
      tipo:false,
      nombre:""
    },
    subTotal: (
      1 *
      precioFinalItem({
        precioUnitario: paqueteBase.precioUnitario,
        idPromocion: 0,
        valorPromocion: null,
        tipoPromocion: null,
      })
    ).toFixed(2),

    detalle: (paqueteBase.detalle || []).map((det) => ({
      idDesglosePaquete: det.idDesglosePaquete,
      idConceptoTrabajo: det.idConceptoTrabajo,
      descripcion: det.nombre,
      cantidad: det.cantidad,
      precioUnitario: 0,
      subTotal: 0,
    })),

    promosDisponibles,
    promosAplicables: [],
    nombrePromocion: null,
    valorPromocion: null,
    tipoPromocion: null,
  });
};

const mapearInsumosParaPadre = () => {
  return {
    llanta: llantas.value.map((l) => ({
      idDetalleOTLlanta: l.idDetalleOTLlanta,
      idLlanta: l.idLlanta,
      idAlmacen: l.idAlmacen,
      idPromocion: l.esAlVuelo ? 0 : l.idPromocionSeleccionada,
      idPromocionVuelo: l.idPromocionVuelo || 0,
      idPromocionSeleccionada: l.idPromocionSeleccionada || 0,
      esAlVuelo: !!l.idPromocionVuelo,
      idConceptoTrabajo: l.idConceptoTrabajo,
      idInventarioInicial: l.idInventarioInicial,

      descripcion: l.descripcion,
      medida: l.medida,
      modelo: l.modelo,
      marca: l.marca,
      ubicacion: l.ubicacion,

      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
      precioConPromo: l.precioConPromo,
      subTotal: l.subTotal,
      promosDisponibles: l.promosDisponibles,
      promo: l.promo || [],
    })),

    paquete: paquetes.value.map((p) => ({
      idDetalleOTPaquete: p.idDetalleOTPaquete,
      idPaquete: p.idPaquete,
      idPromocion: p.esAlVuelo ? 0 : p.idPromocionSeleccionada,
      idPromocionSeleccionada: p.idPromocionSeleccionada || 0,
      idPromocionVuelo: p.idPromocionVuelo || 0,
      esAlVuelo: !!p.idPromocionVuelo,
      idConceptoOrdenTrabajo: p.idConceptoTrabajo,

      descripcion: p.descripcion,
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario,
      precioConPromo: p.precioConPromo,
      subTotal: p.subTotal,

      detalle: p.detalle.map((d) => ({
        idDesglosePaquete: d.idDesglosePaquete,
        idConceptoTrabajo: d.idConceptoTrabajo,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subTotal: d.subtotal,
      })),

      promosDisponibles: p.promosDisponibles,

      promo: p.promo || [],
    })),

    adicional: adicionales.value.map((a) => ({
      idDetalleOTServicio: a.idDetalleOTServicio,
      idDetalleCotizacionServicio: a.idDetalleCotizacionServicio,
      idPromocion: a.esAlVuelo ? 0 : a.idPromocionSeleccionada,
      idPromocionSeleccionada: a.idPromocionSeleccionada || 0,
      idPromocionVuelo: a.idPromocionVuelo || 0,
      esAlVuelo: !!a.idPromocionVuelo,
      idConceptoTrabajo: a.idConceptoTrabajo,

      descripcion: a.descripcion,
      observacion: a.observacion,
      comentario: a.comentario,

      cantidad: a.cantidad,
      precioUnitario: a.precioUnitario,
      precioConPromo: a.precioConPromo,
      subTotal: a.subTotal,

      promosDisponibles: a.promosDisponibles,

      promo: a.promo || null,
    })),
  };
};

const guardarInsumo = () => {
  const insumosMapeados = mapearInsumosParaPadre();
  const totales = calcularTotalesDesdeInsumos(insumosMapeados);
  emit("update:insumos", {
    insumo: insumosMapeados,
    totales,
  });

  emit("update:modelValue", false);
};

// Mounted
onMounted(() => {
  if (props.modelValue) document.addEventListener("keydown", handleEsc);
  cargarLlantas();
  cargarAlmacenes();
  cargarConcpetoTrabajo();
  cargarPaquetes();

  console.log("DEBUG Props: ",props.insumos) 
  
});

const calcularTotalesDesdeInsumos = (insumos) => {
  const totalLlantas = insumos.llanta.reduce(
    (acc, i) => acc + Number(i.subTotal || 0),
    0,
  );

  const totalPaquetes = insumos.paquete.reduce(
    (acc, i) => acc + Number(i.subTotal || 0),
    0,
  );

  const totalAdicionales = insumos.adicional.reduce(
    (acc, i) => acc + Number(i.subTotal || 0),
    0,
  );

  const subtotal = totalLlantas + totalPaquetes + totalAdicionales;
  const descuento = 0; // si luego manejas descuentos globales
  const iva = (subtotal - descuento) * 0.16;
  const total = subtotal - descuento;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    descuento: Number(descuento.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};
const buscarPromocionAplicada = (item) => {
  return item.idPromocionVuelo > 0;
};
const togglePromoAlVuelo = (item) => {
  const aplicado = item.idPromocionVuelo > 0;

  if (aplicado) {
    // Quitar promo al vuelo
    recalcularSubtotal(item);
    item.idPromocionVuelo = 0;
    item.idPromocionSeleccionada = 0;
    item.promo = null;
    item.esAlVuelo = false;
    item.precioConPromo = item.precioUnitario;
    item.subTotal = (item.cantidad || 0) * item.precioUnitario;
    return;
  }

  item.mostrarEditorPromo = !item.mostrarEditorPromo;
};

const guardarPromoAlVuelo = async (itemPromoActual) => {
  const item = itemPromoActual;
  if (!item) return;

  item.promosAplicables = item.promosAplicables || [];

  if (!PromocionesVuelo.nombre || !PromocionesVuelo.valor) {
    Swal.fire("Error", "Completa todos los campos.", "warning");
    return;
  }

  const nuevaPromo = {
    idPromocion: 0,
    nombre: PromocionesVuelo.nombre,
    tipo: PromocionesVuelo.tipo,
    valor: PromocionesVuelo.valor,
    tipopromo: PromocionesVuelo?.tipoPromocion || 1,
    esAlVuelo: true,
  };

  const url = `${proxy.$serverIP}api/promocionVuelo/CrearPromoVuelo`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nombre: nuevaPromo.nombre,
        Tipo: nuevaPromo.tipo,
        Valor: nuevaPromo.valor,
        TipoPromo: nuevaPromo.tipopromo,
      }),
    });

    if (!res.ok)
      throw new Error(`Error al guardar promoción al vuelo (${res.status})`);

    const data = await res.json();
    nuevaPromo.idPromocion = data.idPromoVuelo;
    item.promosAplicables.push(nuevaPromo);
     // Inicializar promo si está null
    if (!item.promo) {
      item.promo = {};
    }

    // la promo al vuelo debe reflejarse en estos campos
    item.promo.idPromocion = nuevaPromo.idPromocion;
    item.promo.valor = nuevaPromo.valor;
    item.promo.tipo = nuevaPromo.tipo;
    item.promo.nombre = nuevaPromo.nombre;

    item.idPromocionVuelo = nuevaPromo.idPromocion;
    item.idPromocionSeleccionada = nuevaPromo.idPromocion;
    item.idPromocion = 0; // promocion normal = 0
    item.esAlVuelo = true;

    recalcularSubtotal(item);
    item.mostrarEditorPromo = false;

    PromocionesVuelo.nombre = "";
    PromocionesVuelo.valor = 0;
    PromocionesVuelo.tipo = false;
    PromocionesVuelo.tipoPromocion = 0;
  } catch (error) {
    console.error("Error al guardar promoción al vuelo:", error);
    Swal.fire("Error", "No se pudo guardar la promoción al vuelo.", "error");
  }
};
</script>

<style>
.fixed-header-table {
  max-height: 400px; /* altura del scroll */
  overflow-y: auto;
}

.fixed-header-table table thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: white; /* evita que se vea transparente */
}
</style>
