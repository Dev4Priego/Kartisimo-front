<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
            <i class="bi bi-nut-fill me-2"></i>Refacciones
        </div>
        <button class="btn btn-sm btn-outline-primary  shadow-sm" @click="agregarRefaccion()">
          <i class="bi bi-plus me-3"></i>Recibir Refacciones
        </button>
    </div>
    <div class="card-body">
      <div v-if="modalRefacciones" class="row">
        <div class="col-6 mb-2">
            <label for="fechaRefaccion" class="form-label"><i class="bi bi-calendar-event mx-1"></i> Fecha</label>
            <input
                id="fechaRefaccion"
                v-model="refaccionForm.fecha"
                type="date"
                class="form-control"
            />
        </div>
        <div class="col-6 mb-2">
            <label for="horaRefaccion" class="form-label"><i class="bi bi-clock-fill mx-1"></i> Hora</label>
            <input
                id="horaRefaccion"
                v-model="refaccionForm.hora"
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
            <select
              v-model="refaccionForm.id_proveedor"
              class="form-select"
              placeholder="Selecciona el proveedor"
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
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-md-8">
            <label for="textoRefaccion" class="form-label">
              <i class="bi bi-exclamation-triangle-fill mx-1"></i>
              Detalle de la Refacción
            </label>
            <textarea 
              id="textoRefaccion" 
              v-model="refaccionForm.refaccion" 
              class="form-control" 
              rows="2"
              maxlength="500">
            </textarea>
          </div>
          <div class="col-md-4">
            <label for="montoRefaccion" class="form-label">
              <i class="bi bi-cash-coin mx-1"></i>
              Monto
            </label>
            <input
              id="montoRefaccion"
              v-model="refaccionForm.monto"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="0.00"
            />
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
              v-model="refaccionForm.numero_factura"
              type="text"
              class="form-control"
              maxlength="50"
              placeholder="Ej. F-45879"
            />
          </div>
        </div>

        <div class="col-12 my-2">
            <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-secondary shadow-sm me-3" @click="modalRefacciones = false">
                    <i class="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button class="btn btn-sm btn-primary shadow-sm" @click="guardarRefaccion()" :disabled="refaccionForm.id_proveedor === null">
                    <i class="bi bi-save-fill me-2"></i> Guardar
                </button>
            </div>
        </div>
      </div>


      <!-- MODAL EDITAR OT-->
       
      <div v-if="modalEditarRefacciones" class="row">
        <div class="col-6 mb-2">
            <label for="fechaRefaccion" class="form-label"><i class="bi bi-calendar-event mx-1"></i> Fecha</label>
            <input
                id="fechaRefaccion"
                v-model="editarRefaccionForm.fecha"
                type="date"
                class="form-control"
            />
        </div>
        <div class="col-6 mb-2">
            <label for="horaRefaccion" class="form-label"><i class="bi bi-clock-fill mx-1"></i> Hora</label>
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
             >
             <option
                v-for="itm in proveedores"
                :key="itm.id_proveedor"
                :value="itm.id_proveedor"
              >
                {{ itm.nombreproveedor }}
              </option>
            </select>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-md-8">
            <label for="textoRefaccion" class="form-label">
              <i class="bi bi-exclamation-triangle-fill mx-1"></i>
              Detalle de la Refacción
            </label>
            <textarea 
              id="textoRefaccion" 
              v-model="editarRefaccionForm.refaccion" 
              class="form-control" 
              rows="2"
              maxlength="500">
            </textarea>
          </div>
          <div class="col-md-4">
            <label for="montoRefaccion" class="form-label">
              <i class="bi bi-cash-coin mx-1"></i>
              Monto
            </label>
            <input
              id="montoRefaccion"
              v-model="editarRefaccionForm.monto"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="0.00"
            />
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
              placeholder="Ej. F-45879"
            />
          </div>
        </div>

        <div class="col-12 my-2">
            <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-secondary shadow-sm me-3" @click="modalEditarRefacciones = false">
                    <i class="bi bi-x-circle-fill me-2"></i> Cerrar
                </button>
                <button class="btn btn-sm btn-primary shadow-sm" @click="editarRefaccionOT()">
                    <i class="bi bi-save-fill me-2"></i> Guardar
                </button>
            </div>
        </div>
      </div>

      <div v-if="Refacciones.length === 0" class="text-muted">
        No hay refacciones en esta orden de trabajo.
      </div>
      <div v-else>
        <table class="table table-sm" style="font-size: 10pt;">
          <thead>
              <tr>
              <th scope="col">Proveedor</th>
              <th scope="col">Refacción</th>
              <th scope="col">Monto</th>
              <th scope="col">Factura/Nota</th>
              <th scope="col">Fecha/hora</th>
              <th scope="col"> </th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="i in Refacciones" :key="i.idRefacciones">
                  <td>{{ i.nombreProveedor }}</td>
                  <td>{{ i.refaccion }}</td>
                  <td style="text-align: right;">{{'$' + formatNumber(i.monto_refaccion) }}</td>
                  <td>{{ i.nota_Factura }}</td>
                  <td>{{ formatearFecha(i.fecha) }}</td>
                  <td><button
                    class="btn btn-sm btn-outline-warning"
                    @click="getEditarRefaccionOT(i)"
                    >
                    <i class="bi bi-pencil-square"></i>
                  </button></td>
              </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="font-size: 11pt;"><strong>Total:</strong></td>
              <td style="text-align: right; font-size: 11pt;"><strong>${{ formatNumber(totalMonto) }}</strong></td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    
  </div>

  <!--Modal Proveedores-->
  <div class="modal fade" id="modalProveedores" tabindex="-1" ref="modalProveedoresRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">Buscar proveedor</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
          <div class="list-group mb-3" style="max-height: 350px; overflow-y: auto;">
            <button
              v-for="proveedor in proveedores"
              :key="proveedor.id_proveedor"
              class="list-group-item list-group-item-action"
              data-bs-dismiss="modal"
              @click="seleccionarProveedor(proveedor)"
            >
              {{ proveedor.nombreproveedor }}
            </button>

            <div v-if="!proveedores || proveedores.length === 0" class="text-muted p-2">
              Sin resultados
            </div>
          </div>

          <!-- Paginación -->
          <nav v-if="lastPage > 1">
            <ul class="pagination justify-content-center">

              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="cambiarPagina(currentPage - 1)">
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

              <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <button class="page-link" @click="cambiarPagina(currentPage + 1)">
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
import { onMounted, ref, getCurrentInstance, watch } from 'vue';
import { Modal } from 'bootstrap';
import axios from 'axios';
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
defineExpose({})

const modalAgregarRefaccion = ref(false);
const { proxy } = getCurrentInstance();
const Refacciones = ref([]);
const modalRefacciones = ref(false);
const modalEditarRefacciones =ref(false)
const refaccionForm = ref({ fecha: '', hora: '', refaccion: '', monto: 0, proveedor: null, id_proveedor: null, numero_factura: ''});
const editarRefaccionForm = ref({ fecha: '', hora: '', refaccion: '', monto: 0.0, proveedor: null, id_proveedor: null, nota_factura: '', usuario: '', nombreProveedor: '', idRefacciones: null});
const props = defineProps({
  otId: Number,
  usuario: Number
});

/// Proveedores
const proveedores = ref([]);
const busqueda = ref('');
const currentPage = ref(1);
const lastPage = ref(1);
const proveedorNombre = ref('')
const modalProveedores = ref(null)
const totalMonto = ref(0)

const cargarProveedoresPag = async () => {
  proveedores.value = [];
  try {
    const url =
      proxy.$serverIP +
      "api/Proveedores/proveedorespag?page=" +
      currentPage.value +
      "&search=" +
      encodeURIComponent(busqueda.value);

    const res = await fetch(url);
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

const cargarProveedores = async () => {
  proveedores.value = [];
  try {
    const url =
      proxy.$serverIP +
      "api/Proveedores/proveedores";

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) throw new Error("Error en la respuesta");

    const response = JSON.parse(text);
    proveedores.value = response ?? [];

  } catch (error) {
    console.error("Error al cargar los proveedores:", error);
  }
}

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '';

  return Number(value).toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

const seleccionarProveedor = (proveedor) => {
  refaccionForm.value.id_proveedor = proveedor.id_proveedor
  editarRefaccionForm.value.id_proveedor = proveedor.id_proveedor
  proveedorNombre.value = proveedor.nombreproveedor;
  editarRefaccionForm.value.nombreProveedor = proveedor.nombreproveedor

  if (document.activeElement) {
    document.activeElement.blur()
  }

  const modal = bootstrap.Modal.getInstance(modalProveedores.value)

  if (modal) modal.hide()
}

const buscarProveedores = () => {
  currentPage.value = 1
  cargarProveedores()
}

const cambiarPagina = (page) => {
  if (page < 1 || page > lastPage.value) return
  currentPage.value = page
  cargarProveedores()
}


onMounted(() => {
  if (props.otId) {
     cargarRefacciones(props.otId)
     cargarProveedores()
   }
})

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

const cargarRefacciones =  async(ot) => {
  Refacciones.value = [];
  try {
    const res = await fetch(
      proxy.$serverIP +
        "api/OrdenTrabajo/getRefaccionesPorOT?idOT=" + ot
    );
    if (!res.ok) throw new Error("Error en la respuesta");
    const response = await res.json();
    Refacciones.value = response.data;
    totalMonto.value = Refacciones.value.reduce((total, r) => {
      return total + Number(r.monto_refaccion)
    }, 0)
  } catch (error) {
    console.error("Error al cargar los refacciones:", error);
  }
};

const agregarRefaccion = () => {
  const ahora = new Date();
  refaccionForm.value.fecha = ahora.toISOString().slice(0, 10); // YYYY-MM-DD
  refaccionForm.value.hora = ahora.toTimeString().slice(0, 5);
  refaccionForm.value.refaccion = "";
  refaccionForm.monto = parseFloat(refaccionForm.monto).toFixed(2)
  modalEditarRefacciones.value = false;
  modalRefacciones.value = !modalRefacciones.value;
}

const guardarRefaccion = async () => {
  const idOT = props.otId;
  const payload = {
    usuario: props.usuario,
    fecha: refaccionForm.value.fecha + 'T' + refaccionForm.value.hora,
    idOrdenTrabajo: idOT,
    refaccion: refaccionForm.value.refaccion,
    monto: parseFloat(refaccionForm.value.monto).toFixed(2),
    id_proveedor: refaccionForm.value.id_proveedor,
    nota_factura: refaccionForm.value.numero_factura
  };
  console.log(payload);
  try {
    
    const response = await axios.post(
       proxy.$serverIP + 'api/Proveedores/agregarRefaccion',
      payload
    );
    cargarRefacciones(idOT);
    limpiarFormulario();
    modalRefacciones.value = !modalRefacciones.value;
  } catch (error) {
    console.error("Error al crear el refacciones:", error);
  }
};

const getEditarRefaccionOT = (ot) => {
  console.log(ot)
  const idOT = props.otId;
  const [fecha, hora] = ot.fecha.split('T')
  editarRefaccionForm.value.idRefacciones = ot.idRefacciones;
  editarRefaccionForm.value.id_proveedor = ot.id_proveedor;
  editarRefaccionForm.value.nombreProveedor = ot.nombreProveedor
  editarRefaccionForm.value.usuario = props.usuario;
  editarRefaccionForm.value.fecha = fecha;
  editarRefaccionForm.value.hora = hora.substring(0,5);
  editarRefaccionForm.value.idOrdenTrabajo = ot.idOrdenTrabajo;
  editarRefaccionForm.value.refaccion = ot.refaccion;
  editarRefaccionForm.value.monto = ot.monto_refaccion;
  editarRefaccionForm.value.nota_factura = ot.nota_Factura;
  modalRefacciones.value = false;
  modalEditarRefacciones.value = !modalEditarRefacciones.value
};

const editarRefaccionOT = async() => {
  const idOT = props.otId;
  const idRefacciones = editarRefaccionForm.value.idRefacciones;
  const payload = {
    usuario: props.usuario,
    fecha:  editarRefaccionForm.value.fecha + 'T' +  editarRefaccionForm.value.hora,
    idOrdenTrabajo: editarRefaccionForm.value.idOrdenTrabajo,
    idRefacciones: editarRefaccionForm.value.idRefacciones,
    refaccion: editarRefaccionForm.value.refaccion,
    monto: parseFloat(editarRefaccionForm.value.monto).toFixed(2),
    id_proveedor:  editarRefaccionForm.value.id_proveedor,
    nota_factura: editarRefaccionForm.value.nota_factura
  };
  console.log(payload);
  try {
    
   const response = await axios.put(
      `${proxy.$serverIP}api/OrdenTrabajo/editarRefaccionOT/${idRefacciones}`,
      payload
    );
    cargarRefacciones(idOT);
    limpiarFormulario()
    modalEditarRefacciones.value = !modalEditarRefacciones.value
  } catch (error) {
    console.error("Error al crear el refacciones:", error);
  }
};
const limpiarFormulario = () => {
  editarRefaccionForm.value = {
    fecha: '',
    hora: '',
    refaccion: '',
    monto: 0.0,
    id_proveedor: null,
    nota_factura: '',
    usuario: '',
    nombreProveedor: '',
    idRefacciones: null
  }
  proveedorNombre.value = '';
  refaccionForm.value = { fecha: '', hora: '', refaccion: '', monto: 0, id_proveedor: null, numero_factura: ''};
}
</script>