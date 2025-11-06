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
            <hr>
            <div class="row">
                <div class="col">
                    <div class="row">
                        <div class="col">
                            <h5 class="text-center">Vehículo</h5>
                            <div class="row">
                                <div class="col">
                                    <div class="mb-3">
                                        <input
                                            v-model="serieInput"
                                            @input="onSerieInput"
                                            @change="onSerieSeleccionada"
                                            list="vehiculos"
                                            placeholder="Num. Serie *"
                                            class="form-control"
                                        />

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
                                    <div class="mb-3">
                                        <input v-model="ordenTrabajoForm.vehiculo.modelo" class="form-control" type="text" placeholder="Modelo *">
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
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col">
                            <div class="row">
                                <h5 class="text-center">Cliente</h5>
                                <div class="col">
                                    <!-- Nombre -->
                                    <div class="mb-3">
                                        <input 
                                            v-model="ordenTrabajoForm.cliente.clienteNombre" 
                                            class="form-control" 
                                            type="text" 
                                            placeholder="Nombre Cliente"
                                            list="clientes"
                                            @input="onClienteInput($event.target.value)"
                                            @change="onClienteSeleccionadoByValue($event.target.value)"
                                        >
                                    </div>

                                    <!-- Teléfono -->
                                    <div class="mb-3">
                                        <input 
                                            v-model="ordenTrabajoForm.cliente.clienteTelefono" 
                                            class="form-control" 
                                            type="text" 
                                            placeholder="Teléfono *"
                                            list="clientes"
                                            @input="onClienteInput($event.target.value)"
                                            @change="onClienteSeleccionadoByValue($event.target.value)"
                                        >
                                    </div>

                                    <!-- Correo -->
                                    <div class="mb-3">
                                        <input 
                                            v-model="ordenTrabajoForm.cliente.clienteCorreo" 
                                            class="form-control" 
                                            type="text" 
                                            placeholder="Correo *"
                                            list="clientes"
                                            @input="onClienteInput($event.target.value)"
                                            @change="onClienteSeleccionadoByValue($event.target.value)"
                                        >
                                    </div>

                                    <!-- Método de pago -->
                                    <div class="mb-3">
                                        <label class="form-label" for="formaPago">Método de Pago *</label>
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
                                        <input v-model="ordenTrabajoForm.cliente.fechaEntrega" class="form-control" type="date">
                                    </div>
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
                        {{ (c.nombres || '') + ' ' + (c.apPaterno || '') + ' ' + (c.apMaterno || '') }}
                        <span v-if="c.telefono"> - {{ c.telefono }}</span>
                        <span v-if="c.correo"> - {{ c.correo }}</span>
                    </option>
                </datalist>
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
            <div class="row my-3">                
                <div class="col-4">
                    <h5>Desechar Llantas</h5>                    
                </div>
                <div class="col-8">
                    <label class="form-label">¿Se desea desechar llantas antiguas?</label><br>
                    Si
                    <input v-model="boolFactura" class="form-check-input btn-outline-dark mx-2" :value="true" type="radio">
                    No
                    <input v-model="boolFactura" class="form-check-input mx-2" :value="false" type="radio">                    
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
                                        <td>{{llanta.precioUnitario.toFixed(2)}}</td> <!-- .toFixed(2)-->
                                        <td>{{llanta.subTotal}}</td>
                                        <td>
                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                @click="eliminarInsumo('llanta', index)"
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
                                                @click="eliminarInsumo('paquete', index)"
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
                                <template v-for="(ad, index) in ordenTrabajoForm.insumo.adicional" :key="index">
                                    <tr>
                                        <td>{{ad.descripcion}}</td>
                                        <td>{{ad.cantidad}}</td>
                                        <td>{{ad.precioUnitario.toFixed(2)}}</td> <!-- .toFixed(2)-->
                                        <td>{{ad.subTotal}}</td>
                                        <td>
                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                @click="eliminarInsumo('adicional', index)"
                                                title="Eliminar insumo"
                                                type="button"
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                            </transition-group>
                            <tfoot>                            
                                <!-- <tr>
                                    <td colspan="3" class="text-center">
                                        Total:
                                    </td>
                                    <td colspan="2" class="text-start">
                                         {{ totalInsumos }} 
                                    </td>
                                </tr> -->
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
                    <button class="btn btn-success" @click="agregarServicioAdicional" type="button">Finalizar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, onMounted, reactive, nextTick } from 'vue';
import Swal from 'sweetalert2'
const { proxy } = getCurrentInstance() 
const boolFactura = ref(false);
const itmCotizaciones = ref([])
const ordenTrabajoForm = reactive({
    cotSeleccionada: 0,
    cliente:{
        id_cliente: null,
        clienteNombre:'',
        apPaterno:'',
        apMaterno: '',
        rfc:'',
        clienteTelefono:'',
        clienteCorreo:'',
        fechaAlta: new Date().toISOString().split('T')[0],
        metodoPago:''
    },
    vehiculo:{
        id_vehiculo: null,
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


/**********************************/
// FUNCION MODAL AGRGAR INSUMO ADICIONAL
/**********************************/
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

const agregarServicioAdicional = () => {
    const insumosValidos = items.value.filter(item =>
        item.descripcion.trim() !== '' &&
        item.cantidad != null && item.cantidad > 0 &&
        item.precioUnitario != null && item.precioUnitario > 0
    )

    ordenTrabajoForm.insumo.adicional.push(...insumosValidos)

    limpiarModalInsumo()

    showModal.value = false
}

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


/********************************/
// FUNCIONES PRINCIPALES
/********************************/

/***************/
// FUNCIONES buscar y rellenar vehiculo

const serieInput = ref("")
const sugerencias = ref([])

let debounceTimer = null

const onSerieInput = () => {
    clearTimeout(debounceTimer)

    const value = serieInput.value.trim()
    if (!value.length) {
        sugerencias.value = []
        return
    }

    debounceTimer = setTimeout(() => {
        buscarSugerencias(value)
    }, 300)
}

const buscarSugerencias = async (serie) => {
    try {
        const res = await fetch(`${proxy.$serverIP}api/Vehiculo/bySerie?strSerie=${encodeURIComponent(serie)}`)
        if (!res.ok) throw new Error("Error en la API")

        const data = await res.json()
        sugerencias.value = data
    } catch (err) {
        console.error("Error al obtener sugerencias:", err)
        sugerencias.value = []
    }
}

const onSerieSeleccionada = () => {
    // buscar coincidencia exacta en sugerencias
    const seleccionado = sugerencias.value.find(s => s.serie === serieInput.value)
    console.log(seleccionado)
    if (seleccionado) {
        ordenTrabajoForm.vehiculo = {
            id_vehiculo: seleccionado.id_vehiculo,
            modelo: seleccionado.modelo,
            color: seleccionado.color,
            placas: seleccionado.placas,
            kilometraje: seleccionado.kilometraje?? ""
        }
    } else {
        ordenTrabajoForm.vehiculo = {
            id_vehiculo: null,
            modelo: "",
            color: "",
            placas:"",
            kilometraje: ""
        }
    }
}

/***************/
// FUNCIONES buscar y rellenar cliente

const sugerenciasClientes = ref([]);
import { toRaw } from "vue";

// Disparar búsqueda por cualquier input
function onClienteInput(valor) {
    clearTimeout(debounceTimer);
    if (!valor || valor.length < 2) {
        sugerenciasClientes.value = [];
        return;
    }
    debounceTimer = setTimeout(() => {
        buscarSugerenciasCliente(valor);
    }, 300);
    
    console.log("SUGERENCIAS CLIENTE:", JSON.stringify(toRaw(sugerenciasClientes.value)));
}

const buscarSugerenciasCliente = async (texto) => {
    try {
        const res = await fetch(`${proxy.$serverIP}api/Cliente/sugerenciaCliente?texto=${encodeURIComponent(texto)}`);
        if (res.ok) {
            sugerenciasClientes.value = await res.json();
        }
    } catch (err) {
        console.error("Error al buscar clientes:", err);
    }
}

function onClienteSeleccionado(cliente) {
    ordenTrabajoForm.cliente.id_cliente = cliente.idCliente || null;
    ordenTrabajoForm.cliente.clienteNombre = cliente.nombres || '';
    ordenTrabajoForm.cliente.apPaterno = cliente.apPaterno || '';
    ordenTrabajoForm.cliente.apMaterno = cliente.apMaterno || '';
    ordenTrabajoForm.cliente.rfc = cliente.rfc || '';
    ordenTrabajoForm.cliente.clienteTelefono = cliente.telefono || '';
    ordenTrabajoForm.cliente.clienteCorreo = cliente.correo || '';
}

function onClienteSeleccionadoByValue(valor) {
    if (!valor) return;

    const normalizado = valor.trim().toLowerCase();

    const cliente = sugerenciasClientes.value.find(c => {
        const nombreCompleto = [c.nombres, c.apPaterno, c.apMaterno]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

        return (
            nombreCompleto === normalizado ||
            (c.telefono && c.telefono.toLowerCase() === normalizado) ||
            (c.correo && c.correo.toLowerCase() === normalizado)
        );
    });

    if (cliente) {
        onClienteSeleccionado(cliente);
    }
}



/***************************/
// FUNCIONES INSUMOS
const eliminarInsumo = (tipo, index) => {
    const contenedor = document.querySelector('#tablaInsumos')
    const scrollTop = contenedor.scrollTop

    if (ordenTrabajoForm.insumo[tipo]) {
        ordenTrabajoForm.insumo[tipo].splice(index, 1)
    }

    nextTick(() => {
        contenedor.scrollTop = scrollTop
    })
}

const validarYMostrarPreview = () => {
    const errores = []

    // Cliente
    if (!ordenTrabajoForm.cliente.clienteNombre) errores.push('El nombre del cliente es obligatorio.')
    if (!ordenTrabajoForm.cliente.clienteTelefono || !/^\d{10}$/.test(ordenTrabajoForm.cliente.clienteTelefono)) errores.push('El teléfono debe tener 10 dígitos.')
    if (!ordenTrabajoForm.cliente.metodoPago) errores.push('El método de pago es obligatorio.')
    if (!ordenTrabajoForm.cliente.fechaAlta) errores.push('La fecha de alta es obligatoria.')

    // Vehículo
    if (!ordenTrabajoForm.vehiculo.numSerie) errores.push('El número de serie es obligatorio.')
    if (!ordenTrabajoForm.vehiculo.modelo) errores.push('El modelo del vehículo es obligatorio.')
    if (!ordenTrabajoForm.vehiculo.kilometraje || isNaN(ordenTrabajoForm.vehiculo.kilometraje)) errores.push('El kilometraje es obligatorio y debe ser numérico.')
    if (!ordenTrabajoForm.vehiculo.color) errores.push('El color del vehículo es obligatorio.')

    // Factura (si aplica)
    if (boolFactura.value) {
        if (!ordenTrabajoForm.factura.razonSocial) errores.push('La razón social es obligatoria.')
        if (!ordenTrabajoForm.factura.direccion) errores.push('La dirección es obligatoria.')
        if (!ordenTrabajoForm.factura.rfc || !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(ordenTrabajoForm.factura.rfc)) errores.push('El RFC no tiene un formato válido.')
        if (!ordenTrabajoForm.factura.eMail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(ordenTrabajoForm.factura.eMail)) errores.push('El correo de la factura no es válido.')
        if (!ordenTrabajoForm.factura.cp || !/^\d{5}$/.test(ordenTrabajoForm.factura.cp)) errores.push('El código postal debe tener 5 dígitos.')
        if (!ordenTrabajoForm.factura.usoCFDI) errores.push('El uso de CFDI es obligatorio.')
    }

    if (errores.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Errores de validación',
            html: `<ul style="text-align:left">${errores.map(e => `<li>${e}</li>`).join('')}</ul>`
        })
        return false
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
            ${ordenTrabajoForm.insumo.llanta.map(i => `
            <tr>
                <td>${i.descripcion}</td>
                <td style="text-align:center">${i.cantidad}</td>
                <td style="text-align:right">$${i.precioUnitario.toFixed(2)}</td>
                <td style="text-align:right">$${i.subTotal}</td>
            </tr>
            `).join('')}
            ${ordenTrabajoForm.insumo.paquete.map(p => `
            <tr style="font-weight:bold; background:#fafafa;">
                <td>${p.descripcion}</td>
                <td style="text-align:center">${p.cantidad}</td>
                <td style="text-align:right">$${p.precioUnitario.toFixed(2)}</td>
                <td style="text-align:right">$${p.subTotal}</td>
            </tr>
            ${p.detalle.map(d => `
                <tr style="color:#555;">
                <td style="padding-left:20px;">↳ ${d.descripcion}</td>
                <td style="text-align:center">${d.cantidad}</td>
                <td style="text-align:right">$${d.precioUnitario.toFixed(2)}</td>
                <td style="text-align:right">$${d.subTotal}</td>
                </tr>
            `).join('')}
            `).join('')}
        </tbody>
        </table>
    `

    // 🔹 Confirmación con SweetAlert
    Swal.fire({
        title: 'Confirmar datos',
        html: `
            <div style="font-family:Arial, sans-serif; font-size:14px; color:#333; max-height:400px; overflow-y:auto;">

                <!-- Cliente -->
                <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Cliente</h3>
                <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
                    <tr><td style="padding:4px 8px; font-weight:bold;">Nombre:</td><td>${ordenTrabajoForm.cliente.clienteNombre}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Teléfono:</td><td>${ordenTrabajoForm.cliente.clienteTelefono}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Método de pago:</td><td>${ordenTrabajoForm.cliente.metodoPago}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Fecha alta:</td><td>${ordenTrabajoForm.cliente.fechaAlta}</td></tr>
                </table><br>

                <!-- Vehículo -->
                <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Vehículo</h3>
                <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
                    <tr><td style="padding:4px 8px; font-weight:bold;">Num. Serie:</td><td>${ordenTrabajoForm.vehiculo.numSerie}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Modelo:</td><td>${ordenTrabajoForm.vehiculo.modelo}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Kilometraje:</td><td>${ordenTrabajoForm.vehiculo.kilometraje}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Color:</td><td>${ordenTrabajoForm.vehiculo.color}</td></tr>
                    <tr><td style="padding:4px 8px; font-weight:bold;">Placas:</td><td>${ordenTrabajoForm.vehiculo.placas}</td></tr>
                </table>

                <!-- Factura -->
                ${boolFactura.value ? `
                <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Factura</h3>
                <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
                <tr><td style="padding:4px 8px; font-weight:bold;">Razón social:</td><td>${ordenTrabajoForm.factura.razonSocial}</td></tr>
                <tr><td style="padding:4px 8px; font-weight:bold;">RFC:</td><td>${ordenTrabajoForm.factura.rfc}</td></tr>
                <tr><td style="padding:4px 8px; font-weight:bold;">Email:</td><td>${ordenTrabajoForm.factura.eMail}</td></tr>
                <tr><td style="padding:4px 8px; font-weight:bold;">CP:</td><td>${ordenTrabajoForm.factura.cp}</td></tr>
                <tr><td style="padding:4px 8px; font-weight:bold;">Uso CFDI:</td><td>${ordenTrabajoForm.factura.usoCFDI}</td></tr>
                </table>
                ` : ''}

                <!-- Insumos -->
                <h3 style="margin:10px 0; color:#444; border-bottom:2px solid #eee; padding-bottom:4px;">Insumos</h3>
                ${insumosHTML}

            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar y enviar',
        cancelButtonText: 'Cancelar',
        width: '700px'
    }).then(result => {
        if (result.isConfirmed) {
            console.log('Datos válidos y confirmados ✅', ordenTrabajoForm)
            Swal.fire('Enviado', 'La información fue enviada correctamente.', 'success')
        }
    })

    return true
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

    if(validarYMostrarPreview(objSeend)){
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
}



/*************************************************/
// FUNCIONES PARA LA CARGA DE INFORMACION
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
        })),
        adicional:[]  
    };
    console.log(JSON.stringify(ordenTrabajoForm.insumo))
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