<template>
    <div class="container p-4 bs-body">
        <form @submit.prevent="guardarOT()" >
            <div class="row my-3">
                <h2 class="text-start">Nueva Orden de Trabajo</h2>
                <hr>
            </div>
            <div class="row">
                <div class="col-4">
                    <h5>Técnico a cargo</h5>
                </div>
                <div class="col-8">
                    <label class="form-label" for="slcTecnico">Selecciona el técnico *</label>
                    <select class="form-select" name="tecnico" id="slcTecnico">
                        <option value="">-Selecciona-</option>
                        <option value="">Técnico 1</option>
                        <option value="">Técnico 2</option>
                        <option value="">Técnico 3</option>
                    </select>
                </div>
            </div>
            <hr>
            <div class="row my-3">
                <div class="col-4">
                    <h5>Cotización</h5>
                </div>
                <div class="col-8">
                    <label class="form-label" for="slcCotizacion">Selecciona una cotización</label>
                    <select v-model="ordenTrabajoForm.cotSeleccionada" class="form-select" name="cotizacion" id="slcCotizacion" @change="cargarInfoCotizacion();">
                        <option value="">-Selecciona-</option>
                        <option v-for="itm in itmCotizaciones" :key="itm.idCotizacion" :value="itm.idCotizacion">
                            COT-{{itm.idCotizacion}}
                        </option>
                    </select>
                    <!-- <p>El valor de la variable 'productoSeleccionado' es: <strong>{{ ordenTrabajoForm.cotSeleccionada }}</strong></p> -->
                </div>
            </div>
            <hr class="">
            <div class="row">
                <div class="col-4">
                    <h5>Cliente</h5>
                </div>
                <div class="col-8">
                    <div class="row">
                        <div class="col">
                            <div class="mb-3">                                
                                <input v-model="ordenTrabajoForm.cliente.clienteNombre" class="form-control" type="text" placeholder="Nombre Cliente">
                            </div>
                            <div class="mb-3">
                                <input class="form-control" type="text" placeholder="Correo *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.cliente.clienteTelefono" class="form-control" type="text" placeholder="Telefóno *">
                            </div>
                            <div class="mb-3">
                                <label class="form-label" for="formaPago">Metódo de Pago *</label>
                                <select v-model="ordenTrabajoForm.cliente.metodoPago" class="form-select" name="formaPago" id="slcFormaPago">
                                    <option value="">-Selecciona-</option>
                                    <option value="Efectivo">Efectivo</option> 
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                        </div>
                        <div class="col">
                            <div class="mb-3">
                                <label class="form-label">Fecha Alta *</label>
                                <input v-model="ordenTrabajoForm.cliente.fechaAlta" class="form-control" type="date">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Fecha de entrega propuesta *</label>
                                <input v-model="ordenTrabajoForm.cliente.fechaAlta" class="form-control" type="date">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="row mb-3">                
                <div class="col-4">
                    <h5>Vehículo</h5>
                </div>
                <div class="col-8">
                    <div class="row">
                        <div class="col">
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.vehiculo.modelo" class="form-control" type="text" placeholder="Modelo *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.vehiculo.numSerie" class="form-control" type="text" placeholder="Num. Serie *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.vehiculo.kilometraje" class="form-control" type="text" placeholder="Kilometraje *">
                            </div>
                        </div>
                        <div class="col">
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.vehiculo.color" class="form-control" type="text" placeholder="Color *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.vehiculo.placas" class="form-control" type="text" placeholder="Placas">
                            </div>                        
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="row my-3">                
                <div class="col-4">
                    <h5>Facturar</h5>                    
                </div>
                <div class="col-8">
                    <label class="form-label">¿Se desea factura?</label><br>
                    Si
                    <input v-model="boolFactura" class="form-check-input btn-outline-dark mx-2" :value="true" type="radio">
                    No
                    <input v-model="boolFactura" class="form-check-input mx-2" :value="false" type="radio">                    
                </div>
            </div>
            <div class="row my-3">
                <div class="col-4"></div>
                <div v-if="boolFactura == true" class="col-8">
                    <div class="row">
                        <div class="col">                    
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.factura.razonSocial" class="form-control" type="text" placeholder="Razón Social *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.factura.direccion" class="form-control" type="text" placeholder="Dirección *">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Uso CFDI *</label>
                                <select v-model="ordenTrabajoForm.factura.usoCFDI" class="form-select" name="usoCFDI" id="slcUsoCFDI">
                                    <option value="">Selecciona</option>
                                    <option value="">Uso CFDI 1</option>
                                    <option value="">Uso CFDI 2</option>
                                    <option value="">Uso CFDI 3</option>
                                </select>
                            </div>
                        </div>
                        <div class="col">
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.factura.rfc" class="form-control" type="text" placeholder="RFC *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.factura.eMail" class="form-control" type="text" placeholder="E-mail *">
                            </div>
                            <div class="mb-3">
                                <input v-model="ordenTrabajoForm.factura.cp" class=" form-control" type="text" placeholder="C.P. *">
                            </div>
                        </div>
                    </div>
                </div>      
            </div>
            <hr>
            <div class="row">
                <div class="col-4">
                    <h5>Insumos</h5>
                </div>
                <div class="col-8">                    
                    <div class="row" id="tablaInsumos" style="max-height: 400px; overflow-y: auto;">
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
                                <template v-for="(llanta, index) in ordenTrabajoForm.insumo.llanta" :key="index">
                                    <tr>
                                        <td>{{llanta.descripcion}}</td>
                                        <td>{{llanta.cantidad}}</td>
                                        <td>{{llanta.precioUnitario}}</td> <!-- .toFixed(2)-->
                                        <td>{{llanta.subTotal}}</td>
                                        <td>
                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                
                                                title="Eliminar insumo"
                                                type="button"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                                <template v-for="(paquete, index) in ordenTrabajoForm.insumo.paquete" :key="index">
                                    <tr>
                                        <td>{{paquete.descripcion}}</td>
                                        <td>{{paquete.cantidad}}</td>
                                        <td>{{paquete.precioUnitario}}</td> <!-- .toFixed(2)-->
                                        <td>{{paquete.subTotal}}</td>
                                        <td>
                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                
                                                title="Eliminar insumo"
                                                type="button"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-for="(detalle, dIndex) in paquete.detalle" :key="`detalle-${index}-${dIndex}`"
                                        class="table-light"
                                    >
                                        <td class="ps-4">↳ {{ detalle.descripcion }}</td>
                                        <td>{{ detalle.cantidad }}</td>
                                        <td>{{ detalle.precioUnitario }}</td>
                                        <td>{{ detalle.subTotal }}</td>
                                    </tr>
                                </template>
                            </transition-group>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="text-center">
                                        Total:
                                    </td>
                                    <td colspan="2" class="text-start">
                                        <!-- {{ totalInsumos }} -->
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="text-center">
                        <button
                            class="btn btn-sm btn-outline-success"                        
                            title="Agregar"
                            @click="showModal = true"
                            type="button"
                        >
                            <i class="bi bi-plus-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="row my-3">
                <div class="col">                 
                </div>
                <div class="col text-end">
                    <router-link :to="{ name: 'OrdenTrabajo'}">
                        <button 
                            class="btn btn-dark mx-4"
                        >
                            Volver
                        </button>
                    </router-link>
                    <button class="btn btn-primary" type="submit">Guardar</button>
                </div>
            </div>            
        </form>
    </div> 
    <!-- MODAL PARA AGREGAR INSUMOS -->
    <div class="modal" id="modalItems" tabindex="-1" aria-labelledby="modalItemsLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalItemsLabel">Agregar Insumo</h5>
                    <button type="button" class="btn-close" @click="showModal = false" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div v-for="(item, index) in items" :key="index" class="row mb-3">
                        <div class="col-md-4">
                            <input v-model="item.descripcion" class="form-control" placeholder="Descripción" />
                        </div>
                        <div class="col-md-4">
                            <input v-model.number="item.cantidad" type="number" class="form-control" placeholder="Cantidad" />
                        </div>
                        <div class="col-md-4">
                            <input v-model.number="item.precioUnitario" type="number" class="form-control" placeholder="Precio Unitario" />
                        </div>
                    </div>
                    <button class="btn btn-outline-secondary w-100" @click="agregarItem" type="button">
                        <i class="bi bi-plus-circle"></i> Agregar otro ítem
                    </button>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="cerrarModalInsumo" type="button">Cancelar</button>
                    <button class="btn btn-success" @click="finalizarItems" type="button">Finalizar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, onMounted, reactive, computed } from 'vue';

const { proxy } = getCurrentInstance() 
const boolFactura = ref(false);
const itmCotizaciones = ref([])
const ordenTrabajoForm = reactive({
    cotSeleccionada: 0,
    cliente:{
        clienteNombre:'',
        clienteTelefono:'',
        fechaAlta: new Date().toISOString().split('T')[0],
        metodoPago:''
    },
    vehiculo:{
        modelo:'',
        numSerie:'',
        kilometraje:'',
        color:'',
        placas:''
    },
    factura:{
        razonSocial:'',
        direccion:'',
        rfc: '',
        eMail:'',
        cp: '',
        usoCFDI: ''
    },
    insumo:{
        llanta:[],
        paquete:[],
        adicional:[]
    }    
})

/*
 * FUNCIONES PARA MODAL "AGREGAR INSUMOS"
 */
const showModal = ref(false)
let modalInstance = null

const items = ref([
    { 
        descripcion: '', 
        cantidad: null, 
        precioUnitario: null, 
        get subTotal() {
            if (this.cantidad != null && this.precioUnitario != null) {
                return (this.cantidad * this.precioUnitario).toFixed(2);
            }
            return '';
        } 
    }
])

const agregarItem = () => {
    items.value.push({ 
        descripcion: '', 
        cantidad: null, 
        precioUnitario: null, 
        get subTotal() {
            if (this.cantidad != null && this.precioUnitario != null) {
                return (this.cantidad * this.precioUnitario).toFixed(2);
            }
            return '';
        } 
    })
}

const eliminarInsumo = (index) => {
    const contenedor = document.querySelector('#tablaInsumos');
    const scrollTop = contenedor.scrollTop;
    
    ordenTrabajoForm.insumo.splice(index, 1);

    nextTick(() => {
        contenedor.scrollTop = scrollTop;
    });
}

const limpiarModalInsumo = () => {
    // Limpiar
    items.value = [
        { 
            descripcion: '', 
            cantidad: null, 
            precioUnitario: null, 
            get subTotal() {
                if (this.cantidad != null && this.precioUnitario != null) {
                    return (this.cantidad * this.precioUnitario).toFixed(2);
                }
                return '';
            }  
        }
    ]
}

const finalizarItems = () => {
    const insumosValidos = items.value.filter(item =>
        item.descripcion.trim() !== '' &&
        item.cantidad != null && item.cantidad > 0 &&
        item.precioUnitario != null && item.precioUnitario > 0
    )

    ordenTrabajoForm.insumo.push(...insumosValidos)

    limpiarModalInsumo()

    showModal.value = false
}

const cerrarModalInsumo = () => {
  showModal.value = false;
  limpiarModalInsumo();
};

// Abrir o cerrar el modal al cambiar showModal
watch(showModal, (val) => {
  if (modalInstance) {
    val ? modalInstance.show() : modalInstance.hide()
  }
})

/*************************************************/

const cargarCotizacionesAprobadasOrRealizadas = async () => {
    try {
        const res = await fetch(proxy.$serverIP + 'api/Cotizacion/getCotizacionIdAprobadaOrRealizada');
        if (!res.ok) throw new Error('Error en la respuesta');
        const data = await res.json();
        itmCotizaciones.value = data
    } catch (e) {
        console.error('Error al cargar paquetes:', e);
    }
};

onMounted(() => {
    /* MODAL INSUMOS*/
    const modalEl = document.getElementById('modalItems')
    modalInstance = new bootstrap.Modal(modalEl, {
        backdrop: 'true', // se cierre al hacer clic afuera
        keyboard: false
    })

    // Escuchar cuando se cierre manualmente para actualizar showModal
    modalEl.addEventListener('hidden.bs.modal', () => {
        showModal.value = false
    })
    /******************/

    cargarCotizacionesAprobadasOrRealizadas();
})


const cargarInfoCotizacion = async () => {
    const res = await fetch(proxy.$serverIP + 'api/Cotizacion/getDetalleCotizacion?id='+ordenTrabajoForm.cotSeleccionada);
    if (!res.ok) throw new Error('Error en la respuesta');
    const data = await res.json();
    console.log(JSON.stringify(data))
    ordenTrabajoForm.cliente.clienteNombre = data.clienteNombre;
    ordenTrabajoForm.cliente.clienteTelefono = data.telefono;

    ordenTrabajoForm.insumo = {
        llanta: data.llantas.map((llanta) => ({
            descripcion: llanta.modeloMedidas,
            cantidad: llanta.cantidad,
            precioUnitario: llanta.precioUnitario,
            subTotal: (llanta.cantidad * llanta.precioUnitario).toFixed(2)
        })),
        paquete: data.paquetes.map((paquete) => ({
            descripcion: paquete.nombre,
            cantidad: 1,
            precioUnitario: paquete.precioUnitario,
            subTotal: (1 * paquete.precioUnitario).toFixed(2),
            detalle: paquete.detallePaquete.map((detalle) => ({
                descripcion:detalle.nombre,
                cantidad: 1,
                precioUnitario: 0,
                subTotal: 0
            }))
        }))   
    };
    console.log(JSON.stringify(ordenTrabajoForm.insumo))
}


const guardarOT = () => {

    let factura = {}

    if(boolFactura){
        factura = {
            razonSocial: ordenTrabajoForm.factura.razonSocial,
            direccion: ordenTrabajoForm.factura.direccion,
            rfc: ordenTrabajoForm.factura.rfc,
            eMail: ordenTrabajoForm.factura.eMail,
            cp: ordenTrabajoForm.factura.cp,
            usoCFDI: ordenTrabajoForm.factura.usoCFDI
        }
    }

    const objSeend = {
        nombreCliente: ordenTrabajoForm.cliente.clienteNombre,
        telefono: ordenTrabajoForm.cliente.clienteTelefono,
        motodoPago: ordenTrabajoForm.cliente.metodoPago,
        fechaAlta: ordenTrabajoForm.cliente.fechaAlta,
        vehiculo:{
            modelo: ordenTrabajoForm.vehiculo.modelo,
            numSerie: ordenTrabajoForm.vehiculo.numSerie,
            kilometraje: ordenTrabajoForm.vehiculo.kilometraje,
            color: ordenTrabajoForm.vehiculo.color, 
            placas: ordenTrabajoForm.vehiculo.placas
        },
        factura: factura,
        insumos: ordenTrabajoForm.insumo
    }

    console.log(JSON.stringify('GUARDAR OT: '+ JSON.stringify(objSeend)))
    // fetch(`${proxy.$serverIP}api/Cotizacion/editarCotizacion`, {
    //     method: cotizacionForm.codigo ? 'PUT' : 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(nuevaCotizacion)
    // })
    // .then(res => res.json())
    // .then(data => {
    //     console.log("OT guardada:", data);
    //     limpiarOrdenTrabajoForm();   // Limpia formulario
    // });
}

const limpiarOrdenTrabajoForm = () => {
  ordenTrabajoForm.cotSeleccionada = 0;

  ordenTrabajoForm.cliente.clienteNombre = '';
  ordenTrabajoForm.cliente.clienteTelefono = '';
  ordenTrabajoForm.cliente.fechaAlta = new Date().toISOString().split('T')[0];
  ordenTrabajoForm.cliente.metodoPago = '';

  ordenTrabajoForm.vehiculo.modelo = '';
  ordenTrabajoForm.vehiculo.numSerie = '';
  ordenTrabajoForm.vehiculo.kilometraje = '';
  ordenTrabajoForm.vehiculo.color = '';
  ordenTrabajoForm.vehiculo.placas = '';

  ordenTrabajoForm.factura.razonSocial = '';
  ordenTrabajoForm.factura.direccion = '';
  ordenTrabajoForm.factura.rfc = '';
  ordenTrabajoForm.factura.eMail = '';
  ordenTrabajoForm.factura.cp = '';
  ordenTrabajoForm.factura.usoCFDI = '';
}

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>