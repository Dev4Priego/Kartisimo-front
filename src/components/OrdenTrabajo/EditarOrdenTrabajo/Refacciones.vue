<template>
  <div class="card mb-4 shadow-sm">
    <div
      class="card-header bg-light d-flex justify-content-between align-items-center"
    >
      <div><i class="bi bi-nut-fill me-2"></i>Refacciones</div>
      <button
      v-if="props.estadoOT != 3"
        class="btn btn-sm btn-outline-primary shadow-sm"
        @click="agregarRefaccion()"
      >
        <i class="bi bi-plus me-3"></i>Recibir Refacciones
      </button>
    </div>
    <div class="card-body">
      <div v-if="modalRefacciones" class="row">
        <div class="col-6 mb-2">
          <label for="fechaRefaccion" class="form-label"
            ><i class="bi bi-calendar-event mx-1"></i> Fecha</label
          >
          <input
            id="fechaRefaccion"
            v-model="refaccionForm.fecha"
            type="date"
            class="form-control"
          />
        </div>
        <div class="col-6 mb-2">
          <label for="horaRefaccion" class="form-label"
            ><i class="bi bi-clock-fill mx-1"></i> Hora</label
          >
          <input
            id="horaRefaccion"
            v-model="refaccionForm.hora"
            type="time"
            class="form-control"
          />
        </div>
        <div class="col-10 mb-2">
          <div class="mb-3">
            <!-- <div class="input-group">
              <input
                type="text"
                class="form-control"
                v-model="proveedorNombre"
                readonly
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#modalProveedores"
              >
                Buscar
              </button>
            </div> -->
            <!--            <select
              v-model="refaccionForm.id_proveedor"
              class="form-select"
              placeholder="Selecciona el proveedor"
              @blur="validate('id_proveedor',1)"
                :class="{ 'input-error': errores['id_proveedor'] }"
             >
             <option disabled :value="null">-Selecciona-</option>
             <option
                v-for="itm in proveedores"
                :key="itm.id_proveedor"
                :value="itm.id_proveedor"
              >
                {{ itm.nombreproveedor }}
              </option>
            </select>
            -->
            <label for="ProveedoresExistentes" class="mb-1 form-label">
              <i class="bi bi-building mx-1"></i> Proveedores
            </label>
            <ProveedoresFiltro
              v-model="mostrarTabla"
              @seleccionar-cliente="manejarProveedor"
            />
            <small v-if="errores['id_proveedor']" class="error-msg">
              {{ errores["id_proveedor"] }}
            </small>
          </div>
        </div>
        <div class="col-2 mb-2">
          <div class="mb-3">
            <label for="CantidadRefacciones" class="mb-1 form-label">
              <i class="bi bi-wrench mx-1"></i>Num. Refacciones
            </label>
            <input
              ref="num_refacciones"
              type="number"
              class="form-control"
              v-model="refaccionForm.numRefacciones"
              min="1"
             
            />
          </div>
        </div>
        <template v-for="(refaccion, index) in refaccionForm.refacciones" :key="refaccion.id">
         
          <div class="row mb-2">
            <div class="col-md-4">
              <label for="textoRefaccion" class="form-label">
                <i class="bi bi-exclamation-triangle-fill mx-1"></i>
                Detalle de la Refacción
              </label>
              <textarea
                id="textoRefaccion"
                v-model="refaccion.refaccion"
                class="form-control"
                rows="2"
                @input="validacionesNuevaRefaccion()"
                @blur="validacionesNuevaRefaccion()"
                :class="{ 'input-error': errores[`refaccion_${index}`] }"
                maxlength="500"
              >
              </textarea>
              <small v-if="errores[`refaccion_${index}`]" class="error-msg">
                {{ errores[`refaccion_${index}`] }}
              </small>
            </div>
            <div class="col-md-2">
              <label class="form-label">
                <i class="bi bi-123 mx-1"></i>
                Cantidad
              </label>
              <input
                v-model="refaccion.cantidad"
                type="number"
                step="0.01"
                min="0.01"
                class="form-control"
                placeholder="1"
                @input="validacionesNuevaRefaccion()"
                @blur="validacionesNuevaRefaccion()"
                :class="{ 'input-error': errores[`cantidad_${index}`] }"
              />
              <small v-if="errores[`cantidad_${index}`]" class="error-msg">
                {{ errores[`cantidad_${index}`] }}
              </small>
            </div>
            <div class="col-md-2">
              <label for="montoRefaccion" class="form-label">
                <i class="bi bi-cash-coin mx-1"></i>
                Total
              </label>
              <input
                id="montoRefaccion"
                v-model="refaccion.monto"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0.00"
                @input="validacionesNuevaRefaccion()"
                @blur="validacionesNuevaRefaccion()"
                :class="{ 'input-error': errores[`monto_${index}`] }"
              />
              <small v-if="errores[`monto_${index}`]" class="error-msg">
                {{ errores[`monto_${index}`] }}
              </small>
            </div>
            <div class="col-md-4">
              <label class="form-label">
                <i class="bi bi-link-45deg mx-1"></i>
                Vincular a
              </label>
              <select v-model="refaccion.vinculoInsumo" class="form-select">
                <option
                  v-for="opcion in insumosVinculables"
                  :key="opcion.value"
                  :value="opcion.value"
                >
                  {{ opcion.label }}
                </option>
              </select>
            </div>
          </div>
        </template>
        <div class="row mb-2">
          <!-- Número de Factura -->
          <div class="col-md-6">
            <label for="facturaInput" class="form-label">
              <i class="bi bi-receipt mx-1"></i>
              Número de Factura
            </label>
            <input
              id="facturaInput"
              v-model="refaccionForm.numero_factura"
              type="text"
              class="form-control"
              maxlength="50"
              @input="validate('numero_factura', 1)"
              @blur="validate('numero_factura', 1)"
              :class="{ 'input-error': errores['numero_factura'] }"
              placeholder="Ej. F-45879"
            />
            <small v-if="errores['numero_factura']" class="error-msg">
              {{ errores["numero_factura"] }}
            </small>
          </div>
        </div>
        <div v-if="formValida" class="row my-3">
          <div class="col text-end">
            <div class="error-msg d-flex justify-content-end mb-2">
              <table>
                <tbody>
                  <tr v-for="valor in listaErrores" :key="valor">
                    <td>{{ valor }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-12 my-2">
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-sm btn-secondary shadow-sm me-3"
              @click="modalRefacciones = false"
            >
              <i class="bi bi-x-circle-fill me-2"></i> Cerrar
            </button>
            <button
              class="btn btn-sm btn-primary shadow-sm"
              @click="validar_formulario_nueva()"
            >
              <i class="bi bi-save-fill me-2"></i> Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL EDITAR OT-->

      <div v-if="modalEditarRefacciones" class="row">
        <div class="col-6 mb-2">
          <label for="fechaRefaccion" class="form-label"
            ><i class="bi bi-calendar-event mx-1"></i> Fecha</label
          >
          <input
            id="fechaRefaccion"
            v-model="editarRefaccionForm.fecha"
            type="date"
            class="form-control"
          />
        </div>
        <div class="col-6 mb-2">
          <label for="horaRefaccion" class="form-label"
            ><i class="bi bi-clock-fill mx-1"></i> Hora</label
          >
          <input
            id="horaRefaccion"
            v-model="editarRefaccionForm.hora"
            type="time"
            class="form-control"
          />
        </div>
        <div class="col-12 mb-2">
          <div class="mb-3">
            <label class="form-label">
              <i class="bi bi-building mx-1"></i>
              Proveedor
            </label>

            <select
              v-model="editarRefaccionForm.id_proveedor"
              class="form-select"
              placeholder="Selecciona el proveedor"
              @blur="validate('id_proveedor', 2)"
              :class="{ 'input-error': errores['id_proveedor'] }"
            >
              <option
                v-for="itm in proveedores"
                :key="itm.id_proveedor"
                :value="itm.id_proveedor"
              >
                {{ itm.nombreproveedor }}
              </option>
            </select>
            <small v-if="errores['id_proveedor']" class="error-msg">
              {{ errores["id_proveedor"] }}
            </small>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-md-4">
            <label for="textoRefaccion" class="form-label">
              <i class="bi bi-exclamation-triangle-fill mx-1"></i>
              Detalle de la Refacción
            </label>
            <textarea
              id="textoRefaccion"
              v-model="editarRefaccionForm.refaccion"
              class="form-control"
              rows="2"
              @input="validate('refaccion', 2)"
              @blur="validate('refaccion', 2)"
              :class="{ 'input-error': errores['refaccion'] }"
              maxlength="500"
            >
            </textarea>
            <small v-if="errores['refaccion']" class="error-msg">
              {{ errores["refaccion"] }}
            </small>
          </div>
          <div class="col-md-2">
            <label class="form-label">
              <i class="bi bi-123 mx-1"></i>
              Cantidad
            </label>
            <input
              v-model="editarRefaccionForm.cantidad"
              type="number"
              step="0.01"
              min="0.01"
              class="form-control"
              placeholder="1"
              @input="validate('cantidad', 2)"
              @blur="validate('cantidad', 2)"
              :class="{ 'input-error': errores['cantidad'] }"
            />
            <small v-if="errores['cantidad']" class="error-msg">
              {{ errores["cantidad"] }}
            </small>
          </div>
          <div class="col-md-2">
            <label for="montoRefaccion" class="form-label">
              <i class="bi bi-cash-coin mx-1"></i>
              Total
            </label>
            <input
              id="montoRefaccion"
              v-model="editarRefaccionForm.monto"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="0.00"
              @input="validate('monto', 2)"
              @blur="validate('monto', 2)"
              :class="{ 'input-error': errores['monto'] }"
            />
            <small v-if="errores['monto']" class="error-msg">
              {{ errores["monto"] }}
            </small>
          </div>
          <div class="col-md-4">
            <label class="form-label">
              <i class="bi bi-link-45deg mx-1"></i>
              Vincular a
            </label>
            <select v-model="editarRefaccionForm.vinculoInsumo" class="form-select">
              <option
                v-for="opcion in insumosVinculables"
                :key="opcion.value"
                :value="opcion.value"
              >
                {{ opcion.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="row mb-2">
          <!-- Número de Factura -->
          <div class="col-md-6">
            <label for="facturaInput" class="form-label">
              <i class="bi bi-receipt mx-1"></i>
              Número de Factura
            </label>
            <input
              id="facturaInput"
              v-model="editarRefaccionForm.nota_factura"
              type="text"
              class="form-control"
              maxlength="50"
              @input="validate('nota_factura', 2)"
              @blur="validate('nota_factura', 2)"
              :class="{ 'input-error': errores['nota_factura'] }"
              placeholder="Ej. F-45879"
            />
            <small v-if="errores['nota_factura']" class="error-msg">
              {{ errores["nota_factura"] }}
            </small>
          </div>
        </div>
        <div v-if="formValida" class="row my-3">
          <div class="col text-end">
            <div class="error-msg d-flex justify-content-end mb-2">
              <table>
                <tbody>
                  <tr v-for="valor in listaErrores" :key="valor">
                    <td>{{ valor }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-12 my-2">
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-sm btn-secondary shadow-sm me-3"
              @click="modalEditarRefacciones = false"
            >
              <i class="bi bi-x-circle-fill me-2"></i> Cerrar
            </button>
            <button
              class="btn btn-sm btn-primary shadow-sm"
              @click="validar_formulario_editar()"
            >
              <i class="bi bi-save-fill me-2"></i> Guardar
            </button>
          </div>
        </div>
      </div>

      <div v-if="Refacciones.length === 0" class="text-muted">
        No hay refacciones en esta orden de trabajo.
      </div>
      <div v-else>
        <table class="table table-sm" style="font-size: 10pt">
          <thead>
            <tr>
              <th scope="col">Proveedor</th>
              <th scope="col">Refacción</th>
              <th scope="col">Insumo vinculado</th>
              <th scope="col">Cant.</th>
              <th scope="col">Precio unit.</th>
              <th scope="col">Total</th>
              <th scope="col">Factura/Nota</th>
              <th scope="col">Fecha/hora</th>
              <th scope="col" v-if="props.estadoOT != 3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in Refacciones" :key="i.idRefacciones">
              <td>{{ i.nombreProveedor }}</td>
              <td>{{ i.refaccion }}</td>
              <td>{{ i.insumoVinculado || "Ninguna" }}</td>
              <td style="text-align: right">
                {{ formatNumber(i.cantidad) }}
              </td>
              <td style="text-align: right">
                {{ "$" + formatNumber(i.precioUnitarioRefaccion) }}
              </td>
              <td style="text-align: left">
                {{ "$" + formatNumber(i.monto_refaccion) }}
              </td>
              <td>{{ i.nota_Factura }}</td>
              <td>{{ formatearFecha(i.fecha) }}</td>
              <td  v-if="props.estadoOT != 3">
                <button
                  class="btn btn-sm btn-outline-warning me-1"
                  @click="getEditarRefaccionOT(i)"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger ms-2"
                  @click="EliminarRefaccion(i)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="font-size: 11pt">
                <strong>Total:</strong>
              </td>
              <td style="text-align: right; font-size: 11pt">
                <strong>${{ formatNumber(totalMonto) }}</strong>
              </td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!--Modal Proveedores-->
    <div
      class="modal fade"
      id="modalProveedores"
      tabindex="-1"
      ref="modalProveedoresRef"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Buscar proveedor</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body">
            <!-- Buscador -->
            <input
              v-model="busqueda"
              @input="buscarProveedores"
              type="text"
              class="form-control mb-3"
              placeholder="Buscar proveedor..."
            />

            <!-- Lista -->
            <div
              class="list-group mb-3"
              style="max-height: 350px; overflow-y: auto"
            >
              <button
                v-for="proveedor in proveedores"
                :key="proveedor.id_proveedor"
                class="list-group-item list-group-item-action"
                data-bs-dismiss="modal"
                @click="seleccionarProveedor(proveedor)"
              >
                {{ proveedor.nombreproveedor }}
              </button>

              <div
                v-if="!proveedores || proveedores.length === 0"
                class="text-muted p-2"
              >
                Sin resultados
              </div>
            </div>

            <!-- Paginación -->
            <nav v-if="lastPage > 1">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="cambiarPagina(currentPage - 1)"
                  >
                    Anterior
                  </button>
                </li>

                <li
                  v-for="page in lastPage"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="cambiarPagina(page)">
                    {{ page }}
                  </button>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === lastPage }"
                >
                  <button
                    class="page-link"
                    @click="cambiarPagina(currentPage + 1)"
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, getCurrentInstance, reactive, computed, watch } from "vue";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
defineExpose({});
import ProveedoresFiltro from "./Paquete/ProveedoresFiltro.vue";
import Swal from "sweetalert2";
import FormularioOT from "../FormularioOT.vue";

const modalAgregarRefaccion = ref(false);
const { proxy } = getCurrentInstance();
const Refacciones = ref([]);
const modalRefacciones = ref(false);
const modalEditarRefacciones = ref(false);
let contadorID = 0
const refaccionForm = reactive({
  fecha: "",
  hora: "",
  numRefacciones: 1,
  refacciones: [
    {
      id: contadorID++,
      refaccion: "",
      cantidad: 1,
      monto: 0,
      vinculoInsumo: "",
    },
  ],
  proveedor: null,
  id_proveedor: null,
  numero_factura: "",
});
const editarRefaccionForm = ref({
  fecha: "",
  hora: "",
  refaccion: "",
  cantidad: 1,
  monto: 0.0,
  proveedor: null,
  id_proveedor: null,
  nota_factura: "",
  usuario: "",
  nombreProveedor: "",
  idRefacciones: null,
  vinculoInsumo: "",
});
const props = defineProps({
  otId: Number,
  usuario: Number,
  estadoOT: Number,
  insumos: {
    type: Object, 
    default: () => ({
      llantas: [],
      paquetes: [],
      adicionales: [],
    }),
  },
});
const emit = defineEmits(["refaccion-guardada"]);

/// Proveedores
const proveedores = ref([]);
const busqueda = ref("");
const currentPage = ref(1);
const lastPage = ref(1);
const proveedorNombre = ref("");
const modalProveedores = ref(null);
const totalMonto = ref(0);
const mostrarTabla = ref(false);
const userData = JSON.parse(localStorage.getItem("userSession") || "null");

const getAuthToken = () => {
  return userData?.token || "";
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const cargarProveedoresPag = async (options = {}) => {
  proveedores.value = [];
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...authHeaders(),
    };

    const url =
      proxy.$serverIP +
      "api/Proveedores/proveedorespag?page=" +
      currentPage.value +
      "&search=" +
      encodeURIComponent(busqueda.value);

    const res = await fetch(url, options);
    const text = await res.text();

    //console.log("RESPUESTA RAW:", text);

    if (!res.ok) throw new Error("Error en la respuesta");

    const response = JSON.parse(text);

    proveedores.value = response.data ?? [];
    currentPage.value = response.current_page ?? 1;
    lastPage.value = response.last_page ?? 1;
  } catch (error) {
    console.error("Error al cargar los proveedores:", error);
  }
};

const cargarProveedores = async (options = {}) => {
  proveedores.value = [];
  try {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...authHeaders(),
    };
    const url = proxy.$serverIP + "api/Proveedores/proveedores";

    const res = await fetch(url, options);
    const text = await res.text();

    if (!res.ok) throw new Error("Error en la respuesta");

    const response = JSON.parse(text);
    proveedores.value = response ?? [];
  } catch (error) {
    console.error("Error al cargar los proveedores:", error);
  }
};

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return "";

  return Number(value).toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const seleccionarProveedor = (proveedor) => {
  refaccionForm.id_proveedor = proveedor.id_proveedor;
  editarRefaccionForm.value.id_proveedor = proveedor.id_proveedor;
  proveedorNombre.value = proveedor.nombreproveedor;
  editarRefaccionForm.value.nombreProveedor = proveedor.nombreproveedor;

  if (document.activeElement) {
    document.activeElement.blur();
  }

  const modal = bootstrap.Modal.getInstance(modalProveedores.value);

  if (modal) modal.hide();
};
const num_refacciones = ref(null);
const manejarProveedor = (proveedor) => {
  refaccionForm.id_proveedor = proveedor.id_proveedor;
  refaccionForm.proveedor = proveedor.nombreproveedor;
  proveedorNombre.value = proveedor.nombreproveedor;
  mostrarTabla.value = false;
  num_refacciones.value.focus();
};
const buscarProveedores = () => {
  currentPage.value = 1;
  cargarProveedores();
};

const cambiarPagina = (page) => {
  if (page < 1 || page > lastPage.value) return;
  currentPage.value = page;
  cargarProveedores();
};

const errores = reactive({});
const formValida = ref(false);

const listaErrores = computed(() => Object.values(errores));

const textoCorto = (valor, max = 72) => {
  const texto = String(valor || "").trim();
  return texto.length > max ? `${texto.slice(0, max)}...` : texto;
};

const insumosVinculables = computed(() => {
  const insumos = props.insumos || {};
  const opciones = [{ value: "", label: "Ninguna" }];

  (insumos.llantas || [])
    .filter((item) => !item.eliminado && Number(item.idDetalleOTLlanta || 0) > 0)
    .forEach((item) => {
      opciones.push({
        value: `Llanta:${item.idDetalleOTLlanta}`,
        label: `Llanta - ${textoCorto(item.descripcion || item.detalle)}`,
      });
    });

  (insumos.paquetes || [])
    .filter((item) => !item.eliminado && Number(item.idDetalleOTPaquete || 0) > 0)
    .forEach((item) => {
      opciones.push({
        value: `Paquete:${item.idDetalleOTPaquete}`,
        label: `Paquete - ${textoCorto(item.nombre || item.descripcion)}`,
      });
    });

  (insumos.adicionales || [])
    .filter((item) => !item.eliminado && Number(item.idDetalleOTServicio || 0) > 0)
    .forEach((item) => {
      opciones.push({
        value: `Servicio:${item.idDetalleOTServicio}`,
        label: `Servicio - ${textoCorto(item.descripcion || item.descripcionServicio)}`,
      });
    });

  return opciones;
});

const obtenerVinculo = (valor) => {
  if (!valor) {
    return {
      tipoInsumoVinculado: null,
      idDetalleInsumoVinculado: null,
    };
  }

  const [tipo, id] = String(valor).split(":");
  const idDetalle = Number(id || 0);

  if (!tipo || idDetalle <= 0) {
    return {
      tipoInsumoVinculado: null,
      idDetalleInsumoVinculado: null,
    };
  }

  return {
    tipoInsumoVinculado: tipo,
    idDetalleInsumoVinculado: idDetalle,
  };
};

const crearVinculo = (tipo, idDetalle) => {
  if (!tipo || !idDetalle) return "";
  return `${tipo}:${idDetalle}`;
};

const getValor = (path, tipo) => {
  const origen = tipo == 1 ? refaccionForm : editarRefaccionForm.value;

  return path.split(".").reduce((obj, key) => obj?.[key], origen);
};

watch(
  () => refaccionForm.numRefacciones,
  (NuevaCantidad, cantidadAnterior)=>{
    const diff = NuevaCantidad - cantidadAnterior;
    if ( diff > 0){ // AGREGAR
      for(let i = 0; i < diff; i++){
        refaccionForm.refacciones.push({
          id:contadorID++,
          refaccion: "",
          cantidad: 1,
          monto:0,
          vinculoInsumo: "",
        })
      }
    }else if(diff < 0){
      refaccionForm.refacciones.splice(NuevaCantidad, Math.abs(diff))
    }
  }
)


function validate(path, tipo) {
  formValida.value = false;
  const value = (getValor(path, tipo) ?? "").toString();

  const rules = {
    id_proveedor: () =>
      !value.trim() ? "Debe seleccionar un proveedor." : null,

    refaccion: () =>
      !value.trim() ? "Se requiere la descripción de la refacción." : null,

    numero_factura: () =>
      !value.trim() && tipo == 1 ? "Número de factura obligatorio." : null,

    nota_factura: () =>
      !value.trim() && tipo == 2 ? "Número de factura obligatorio." : null,

    monto: () => {
      if (value === "") return "Monto obligatorio.";

      const num = Number(value);

      if (isNaN(num)) return "El monto debe ser un número.";
      if (num < 0) return "El monto debe ser igual o mayor a cero.";
      return null;
    },

    cantidad: () => {
      if (value === "") return "Cantidad obligatoria.";

      const num = Number(value);

      if (isNaN(num)) return "La cantidad debe ser un número.";
      if (num <= 0) return "La cantidad debe ser mayor a cero.";
      return null;
    },
  };

  const error = rules[path] ? rules[path]() : null;

  if (error) errores[path] = error;
  else delete errores[path];
}

function validar_formulario_nueva() {
  validacionesNuevaRefaccion();
  formValida.value = Object.keys(errores).length > 0;
  if (!formValida.value) {
    console.log("Guardar: ");
    guardarRefaccion();
  }
}

function validar_formulario_editar() {
  validaciones(2);
  formValida.value = Object.keys(errores).length > 0;
  if (!formValida.value) {
    console.log("Guardar: ");
    editarRefaccionOT();
  }
}

function validaciones(tipo) {
  const campos = [
    "id_proveedor",
    "refaccion",
    "cantidad",
    "monto",
    "numero_factura",
    "nota_factura",
  ];

  // limpiar errores
  Object.keys(errores).forEach((k) => delete errores[k]);

  campos.forEach((campo) => {
    const origen = tipo == 1 ? refaccionForm : editarRefaccionForm.value;
    const valor = campo.split(".").reduce((o, k) => o?.[k], origen);
    console.log(` Campo: ${campo} →`, valor);
    validate(campo, tipo);
  });
  return true;
}

function validacionesNuevaRefaccion() {
  Object.keys(errores).forEach((k) => delete errores[k]);

  validate("id_proveedor", 1);
  validate("numero_factura", 1);

  if (!refaccionForm.refacciones.length) {
    errores.refacciones = "Debe capturar al menos una refacción.";
  }

  refaccionForm.refacciones.forEach((item, index) => {
    const descripcion = (item.refaccion ?? "").toString().trim();
    const cantidad = Number(item.cantidad);
    const monto = Number(item.monto);

    if (!descripcion) {
      errores[`refaccion_${index}`] = `La refacción ${index + 1} requiere descripción.`;
    }

    if (item.monto === "" || Number.isNaN(monto) || monto < 0) {
      errores[`monto_${index}`] = `La refacción ${index + 1} requiere un monto válido.`;
    }

    if (item.cantidad === "" || Number.isNaN(cantidad) || cantidad <= 0) {
      errores[`cantidad_${index}`] = `La refacción ${index + 1} requiere una cantidad mayor a cero.`;
    }
  });
}

onMounted(() => {
  if (props.otId) {
    cargarRefacciones(props.otId);
    cargarProveedores();
  }
});

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

const cargarRefacciones = async (ot, options = {}) => {
  Refacciones.value = [];
  try {
    options.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      ...options.headers,
      ...authHeaders(),
    };
    console.log("TOKEN EN REFACCION:", userData?.token);
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/getRefaccionesPorOT?idOT=${ot}`,
      options,
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    const response = await res.json();
    Refacciones.value = response.data;
    totalMonto.value = Refacciones.value.reduce((total, r) => {
      return total + Number(r.monto_refaccion);
    }, 0);
  } catch (error) {
    console.error("Error al cargar los refacciones:", error);
  }
};

const agregarRefaccion = () => {
  const ahora = new Date();
  refaccionForm.fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  refaccionForm.hora = ahora.toTimeString().slice(0, 5);
  refaccionForm.id_proveedor = null;
  refaccionForm.refacciones = [
    {
      id: contadorID++,
      refaccion: "",
      cantidad: 1,
      monto: 0,
      vinculoInsumo: "",
    },
  ];
  refaccionForm.numero_factura = "";
  refaccionForm.numRefacciones = 1;
  Object.keys(errores).forEach((k) => delete errores[k]);
  modalEditarRefacciones.value = false;
  modalRefacciones.value = !modalRefacciones.value;
};

const guardarRefaccion = async () => {
  const idOT = props.otId;
  const refacciones = refaccionForm.refacciones.map((item) => ({
    refaccion: item.refaccion,
    cantidad: Number(Number(item.cantidad || 1).toFixed(2)),
    monto: Number(Number(item.monto || 0).toFixed(2)),
    ...obtenerVinculo(item.vinculoInsumo),
  }));

  const payload = {
    usuario: props.usuario,
    fecha: refaccionForm.fecha + "T" + refaccionForm.hora,
    idOrdenTrabajo: idOT,
    refaccion: refacciones[0]?.refaccion ?? "",
    cantidad: refacciones[0]?.cantidad ?? 1,
    monto: refacciones[0]?.monto ?? 0,
    id_proveedor: refaccionForm.id_proveedor,
    nota_factura: refaccionForm.numero_factura,
    ...obtenerVinculo(refaccionForm.refacciones[0]?.vinculoInsumo),
    refacciones,
  };
  console.log(payload);
  try {
    const response = await axios.post(
      proxy.$serverIP + "api/Proveedores/agregarRefaccion",
      payload,
      { headers: authHeaders() },
    );
    await cargarRefacciones(idOT);
    limpiarFormulario();
    modalRefacciones.value = !modalRefacciones.value;
    emit("refaccion-guardada");
  } catch (error) {
    console.error("Error al crear el refacciones:", error);
  }
};

const getEditarRefaccionOT = (ot) => {
  console.log(ot);
  const idOT = props.otId;
  const [fecha, hora] = ot.fecha.split("T");
  editarRefaccionForm.value.idRefacciones = ot.idRefacciones;
  editarRefaccionForm.value.id_proveedor = ot.id_proveedor;
  editarRefaccionForm.value.nombreProveedor = ot.nombreProveedor;
  editarRefaccionForm.value.usuario = props.usuario;
  editarRefaccionForm.value.fecha = fecha;
  editarRefaccionForm.value.hora = hora.substring(0, 5);
  editarRefaccionForm.value.idOrdenTrabajo = ot.idOrdenTrabajo;
  editarRefaccionForm.value.refaccion = ot.refaccion;
  editarRefaccionForm.value.cantidad = ot.cantidad || 1;
  editarRefaccionForm.value.monto = ot.monto_refaccion;
  editarRefaccionForm.value.nota_factura = ot.nota_Factura;
  editarRefaccionForm.value.vinculoInsumo = crearVinculo(
    ot.tipoInsumoVinculado,
    ot.idDetalleInsumoVinculado,
  );
  Object.keys(errores).forEach((k) => delete errores[k]);
  modalRefacciones.value = false;
  modalEditarRefacciones.value = !modalEditarRefacciones.value;
};

const EliminarRefaccion = async (ot) => {
  const idOT = props.otId;

  try {
    const res = await fetch(
      `${proxy.$serverIP}api/OrdenTrabajo/eliminarRefaccionOT/${ot.idRefacciones}/${ot.idOrdenTrabajo}`,
      {
        method: "PUT",
        headers: authHeaders(),
      },
    );

    if (!res.ok) {
      throw new Error("Error al eliminar la refacción en la OT");
    }

    await cargarRefacciones(idOT);
    mostrarToast("success", "Refacción eliminada correctamente");
  } catch (e) {
    console.error("Error en el fetch al eliminar refacción en la OT:", e);
    mostrarToast("warning", "Error al eliminar refacción.");
  }
};

const editarRefaccionOT = async () => {
  const idOT = props.otId;
  const idRefacciones = editarRefaccionForm.value.idRefacciones;
  const payload = {
    usuario: props.usuario,
    fecha:
      editarRefaccionForm.value.fecha + "T" + editarRefaccionForm.value.hora,
    idOrdenTrabajo: editarRefaccionForm.value.idOrdenTrabajo,
    idRefacciones: editarRefaccionForm.value.idRefacciones,
    refaccion: editarRefaccionForm.value.refaccion,
    cantidad: Number(Number(editarRefaccionForm.value.cantidad || 1).toFixed(2)),
    monto: parseFloat(editarRefaccionForm.value.monto).toFixed(2),
    id_proveedor: editarRefaccionForm.value.id_proveedor,
    nota_factura: editarRefaccionForm.value.nota_factura,
    ...obtenerVinculo(editarRefaccionForm.value.vinculoInsumo),
  };
  console.log(payload);
  try {
    const response = await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/editarRefaccionOT/${idRefacciones}`,
      payload,
      { headers: authHeaders() },
    );
    await cargarRefacciones(idOT);
    limpiarFormulario();
    modalEditarRefacciones.value = !modalEditarRefacciones.value;
    emit("refaccion-guardada");
  } catch (error) {
    console.error("Error al crear el refacciones:", error);
  }
};
const limpiarFormulario = () => {
  editarRefaccionForm.value = {
    fecha: "",
    hora: "",
    refaccion: "",
    cantidad: 1,
    monto: 0.0,
    id_proveedor: null,
    nota_factura: "",
    usuario: "",
    nombreProveedor: "",
    idRefacciones: null,
    vinculoInsumo: "",
  };
  proveedorNombre.value = "";
  Object.assign(refaccionForm, {
    fecha: "",
    hora: "",
    numRefacciones: 1,
    refacciones: [
      {
        id: contadorID++,
        refaccion: "",
        cantidad: 1,
        monto: 0,
        vinculoInsumo: "",
      },
    ],
    proveedor: null,
    id_proveedor: null,
    numero_factura: "",
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
</script>

<style>
.error-msg {
  color: red;
  font-size: 12px;
}
</style>
