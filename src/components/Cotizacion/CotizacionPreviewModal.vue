<template>


    <div
      v-if="mostrarVista"
      class="modal fade show d-block"
      tabindex="-1"
      :style="{ background: 'rgba(0,0,0,0.5)' }"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-1000">
        <div class="modal-content p-4">
          <div class="modal-header no-imprimir">
            <h4 class="modal-title">Vista Previa de Cotización</h4>
            <button
              type="button"
              class="btn-close"
              @click="cerrar"
            ></button>
          </div>
          <div
            id="area-imprimir"
            ref="pdfContent"
            class="modal-body bg-white p-4 fs-6 print-area"
            :style="{ fontSize: '14px' }"
          >
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
            <div class="row border-bottom pb-3 mb-4 direcciones">
              <div class="col-3">
                <small>
                  <strong>Blvd. Delta 2002 <br />esq. Rio Mayo</strong><br />
                  Col. Valle de Jerez C.P 37538<br />
                  Tel. 477 330 6060 y<br />
                  477 390 5090<br />
                  delta@kartisimo.mx </small
                ><br />
              </div>
              <div class="col-3">
                <small>
                  <strong>Blvd. Lopez Mateos 827<br />esq. Apolo</strong><br />
                  Col. Obrera C.P. 37340<br />
                  Tel. 477 717 7440 y<br />
                  477 470 9419<br />
                  apolo@kartisimo.mx
                </small>
              </div>
              <div class="col-3">
                <small>
                  <strong
                    >Blvd. Torres Landa 1901<br />
                    esq. San Jacobo</strong
                  ><br />
                  Col. La Piscina C.P. 37440<br />
                  Tel. 477 390 0290 y<br />
                  477 461 0028<br />
                  torreslanda@kartisimo.mx<br />
                </small>
              </div>
              <div class="col-3">
                <small>
                  <strong
                    >Blvd. Mariano Escobedo Pte. 2715 esq. San Sebastián</strong
                  ><br />
                  Col. La Martinica, C.P. 37500<br />
                  Tel. 477 763 3285 y<br />
                  477 763 3284
                </small>
              </div>
            </div>

            <div class="mb-4 cotizacion-header-cliente">
              <div class="row">
                <div class="col-2">
                  <span class="me-2">
                    {{ "C" + vistaCotizacion.codigo || "N/A" }}
                  </span>
                </div>
                <div class="col-5">
                  <span>
                    <strong>Fecha emisión: </strong>
                    {{ vistaCotizacion.fechaCreacion || "N/A" }}
                  </span>
                </div>
                <div class="col-5">
                  <span class="me-2">
                    <strong>Cliente: </strong>
                    {{ vistaCotizacion.cliente?.nombre || "N/A" }}
                  </span>
                </div>
              </div>
              <div class="row">
                <div class="col-2"></div>

                <div class="col-5">
                  <span class="me-2">
                    <strong>Teléfono: </strong>
                    {{ telefonoFormateado || "N/A" }}
                  </span>
                </div>
                <div class="col-5">
                  <span class="me-2">
                    <strong>Correo: </strong>
                    {{ vistaCotizacion.cliente?.correo || "N/A" }}
                  </span>
                </div>
                <div class="col mt-1">
                  <span>
                    <strong>Observaciones: </strong>
                    {{ vistaCotizacion.observaciones || "N/A" }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="table-responsive mx-auto mt-3 cotizacion-header"
              v-if="(vistaCotizacion.llantasSelecionadas && vistaCotizacion.llantasSelecionadas.length > 0) "
            >
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
                    <th>MEDIDA - MARCA - MODELO - RANGO</th>
                    <th class="text-end">PRECIO UNIT.</th>
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
                      <small v-if="llanta.comentario" class="badge bg-secondary mt-1">{{
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
                <thead class="table-light">
                  <tr>
                    <th class="text-center">CANT</th>
                    <th>SERVICIO</th>
                    <th class="text-end">PRECIO UNIT.</th>
                    <th class="text-end">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(paquete, index) in vistaCotizacion.paquetes"
                    :key="'paq-' + index" class="tr-servicios"
                  >
                    <td class="text-center">{{paquete.cantidad}}</td>
                    <td>
                      {{ paquete.nombre.toUpperCase() }},
                      {{ paquete.descripcion.toUpperCase() }}
                      <br />
                      <small class="badge bg-secondary mt-1">{{
                        paquete.comentario
                      }}</small>
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
                            (paquete.precioUnitario * paquete.cantidad ?? 1).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                          <small class="badge bg-danger mt-1 text-wrap">{{
                            paquete.promoLabel
                          }}</small>
                        </span>
                        <br />
                        <span class="text-success fw-bold d-block">{{
                          (paquete.total ?? 1).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}</span>
                      </div>
                      <div v-else>
                        {{
                          (paquete.precioUnitario * paquete.cantidad ?? 1).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        }}
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-for="(
                      servicio, i
                    ) in vistaCotizacion.serviciosAdicionales"
                    :key="'serv-' + i" class="tr-servicios"
                  >
                    <td class="text-center">{{ servicio.cantidad }}</td>
                    <td>
                      {{ servicio.nombreServicio }} {{ servicio.observacion }}
                      <br />
                      <small class="badge bg-secondary mt-1">{{
                        servicio.comentario
                      }}</small>
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
                            (servicio.precioUnitario * servicio.cantidad).toLocaleString("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            })
                          }}
                          <small class="badge bg-danger mt-1 text-wrap">{{
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
                </tbody>
              </table>
            </div>

            <div
              v-if="vistaCotizacion.mostrarTotal"
              class="table-responsive mt-3 cotizacion-header"
            >
              <table
                class="table table-bordered table-sm align-middle"
                style="table-layout: fixed"
              >
                <colgroup>
                  <col />
                  <col style="width: 120px" />
                </colgroup>
                <tbody>
                  <tr class="fw-bold">
                    <td class="text-center">Total:</td>
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

            <div class="d-flex w-100 mt-3 justify-content-end">
              <span class="nota-iva">Los precios incluyen IVA.</span>
            </div>

            <div class="row no-imprimir">
              <div class="col">
                <EnviarCorreoModal :cotizacion="vistaCotizacion" />
              </div>

              <div class="col">
                <div class="mt-4">
                  <button
                    class="btn btn-primary position-relative shadow-lg w-100 btn-sm py-2 rounded"
                    @click="imprimirCotizacion"
                  >
                    <i
                      class="bi-printer-fill position-absolute start-0 ms-2"
                    ></i>
                    Imprimir
                  </button>
                </div>
              </div>

              <div class="col">
                <div class="mt-4">
                  <button
                    class="btn btn-primary position-relative shadow w-100 btn-sm py-2 rounded"
                    @click="generarPDF"
                  >
                    <i
                      class="bi-file-pdf-fill position-absolute start-0 ms-2"
                    ></i>
                    Descargar PDF
                  </button>
                </div>
              </div>

              <div class="col">
                <div class="mt-4">
                  <button
                    class="btn btn-primary position-relative shadow w-100 btn-sm py-2 rounded"
                    @click="abrirModalCotizacion(vistaCotizacion)"
                  >
                    <i
                      class="bi-pencil-fill position-absolute start-0 ms-2"
                    ></i>
                    Editar
                  </button>
                </div>
              </div>

              <div class="col">
                <div class="mt-4">
                  <button
                    class="btn btn-success position-relative shadow w-100 btn-sm py-2 rounded"
                    @click="confirmarAccion(vistaCotizacion)"
                  >
                    <i
                      class="bi-forward-fill position-absolute start-0 ms-2"
                    ></i>
                    Generar OT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import EnviarCorreoModal from "@/components/EnviarCorreo/EnviarCorreoModal.vue";
import { useCotizacionPreview } from "@/composables/cotizacion/useCotizacionPreview";

const emit = defineEmits(["edit", "status-change"]);
const {
  abrir,
  cerrar,
  cotizacion: vistaCotizacion,
  descargar: generarPDF,
  generarOrdenTrabajo: confirmarAccion,
  imprimir: imprimirCotizacion,
  telefonoFormateado,
  visible: mostrarVista,
} = useCotizacionPreview({
  onEstadoActualizado: () => emit("status-change"),
});

const abrirModalCotizacion = (cotizacion = null) => {
  emit("edit", cotizacion);
  cerrar();
};

defineExpose({ abrir, cerrar });
</script>
