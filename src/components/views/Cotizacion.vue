<template>
    <div class="container-fluid mp-4 p-4">
        <div class="row">
            <h2>Cotizaciones</h2>
        </div>
        <div class="row mt-4">
            
            <div class="col d-flex align-items-center">
                <input
                    class="form-control"
                    placeholder="Buscar por código, cliente, fecha..."
                    v-model="busquedaCotizaciones"
                />
            </div>

            <div class="col d-flex align-items-center">
                <label for="select" class="form-label m-2">Selecciona</label>
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
                <button  class="btn btn-primary" @click="openModal">
                    Nueva cotizacion
                </button>
            </div>                                   
        </div>
        <div class="row">
            <table class="table table-hover table-sm">
                <caption><strong>Lista de cotizaciones</strong></caption>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Paquete</th>
                        <th>Total</th>
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
                        <td>{{ item.paquete }}</td>
                        <td>{{ item.total }}</td>
                        <td>{{ item.estatus }}</td>
                        <td>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-info" @click="mostrarVistaPrevia(item.acciones, 'ver')">
                                    Ver
                                </button>

                                <button class="btn btn-sm btn-outline-warning" @click="abrirModalCotizacion(item.acciones)">
                                    Editar
                                </button>

                                <button
                                    v-if="item.estatus != 'Cancelada'"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="cancelarCotizacion(item.acciones)"
                                >
                                    Cancelar
                                </button>

                                <button
                                    v-if="item.estatus === 'Cancelada'"
                                    class="btn btn-sm btn-outline-success"
                                    @click="reactivarCotizacion(item.acciones)"
                                >
                                    Reactivar
                                </button>

                                <button
                                    v-if="item.estatus === 'Creada'"
                                    class="btn btn-sm btn-outline-primary"
                                    @click="aprobarCotizacion(item.acciones)"
                                >
                                    Aprobar
                                </button>

                                <button
                                    v-if="item.estatus === 'Aprobada'"
                                    class="btn btn-sm btn-outline-secondary"
                                    @click="finalizarCotizacion(item.acciones)"
                                >
                                    Finalizar
                                </button>

                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
         
        <!-- MODAL PARA SCREENSHOT Y DESCARGA DE PDF -->
        <div v-if="mostrarVista" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content p-4">
                    <div class="modal-header">
                        <h4 class="modal-title">Vista Previa de Cotización</h4>
                        <button type="button" class="btn-close" @click="mostrarVista = false"></button>
                    </div>
                    <div ref="pdfContent" class="modal-body bg-white p-4" style="font-size: 14px;">
                        <!-- Encabezado con direcciones y logo -->
                        <div class="row">
                            <div class="col">
                                <img class="float-start" src="/images/Logo-Kartisimo.png" alt="Logo" style="max-width: 250px;" />
                                <p class="mt-2 float-end">
                                    <strong>Kartisimo Bajio S.A. de C.V.</strong>
                                </p>
                            </div>
                        </div>
                        <div class="row border-bottom pb-3 mb-4">
                            <div class="col">
                                <small>
                                    <strong>Blvd. Delta 2002 esq. Rio Mayo</strong><br>
                                    Col. Valle de Jerez C.P 37538<br>
                                    Tel. 477 330 6060 y 477 390 5090<br>
                                    delta@kartisimo.mx
                                </small><br>
                            </div>
                            <div class="col">
                                <small>
                                    <strong>Blvd. Lopez Mateos 827 esq. Apolo</strong><br>
                                    Col. Obrera C.P. 37340<br>
                                    Tel. 477 717 7440 y 477 470 9419<br>
                                    apolo@kartisimo.mx
                                </small>
                            </div>
                            <div class="col">
                                <small>
                                    <strong>Blvd. Torres Landa 1901 esq San Jacobo</strong><br>
                                    Col. La Pisina C.P. 37440<br>
                                    Tel. 477 390 0290 y 477 461 0028<br>
                                    torreslanda@kartisimo.mx<br>
                                </small>
                            </div>
                        </div>

                        <!-- Información del cliente -->
                        <div class="mb-4" v-if="vistaCotizacion.cliente.nombre">
                            <span class="mx-2"><strong>No. Cotizacion: </strong> {{ vistaCotizacion.codigo }} </span>
                            <span class="mx-2"><strong>Cliente:</strong> {{ vistaCotizacion.cliente.nombre }}</span>
                            <span class="mx-2"><strong>Teléfono:</strong> {{ vistaCotizacion.cliente.telefono }}</span>
                        </div>

                        <div class="mt-4">
                            <table class="table table-bordered table-sm">
                                <thead class="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Subtotal</th>
                                    </tr>
                                    </thead>
                                <tbody>
                                    <!-- Paquetes seleccionados -->
                                    <tr
                                        v-for="(paquete, i) in vistaCotizacion.paquetes"
                                        :key="'paq-' + i"
                                    >
                                        <td>{{ paquete.nombre }}</td>
                                        <td class="text-center">1</td>
                                        <td>${{ paquete.precio.toFixed(2) }}</td>
                                        <td>${{ paquete.precio.toFixed(2) }}</td>
                                    </tr>

                                    <!-- Llantas -->
                                    <tr v-for="(llanta, i) in vistaCotizacion.llantasSelecionadas" :key="'ll-' + i">
                                        <td>
                                        {{ llanta.marca }} {{ llanta.modelo }} — {{ llanta.medidas }}
                                        <span
                                            v-if="llanta.almacenOrigen == 'Almacen Foraneo'"
                                            class="badge bg-warning text-dark ms-2"
                                        >
                                            Sobre pedido
                                        </span>
                                        </td>
                                        <td class="text-center">{{ llanta.cantidad }}</td>
                                        <td>${{ llanta.precioUnitario.toFixed(2) }}</td>
                                        <td>${{ llanta.total.toFixed(2) }}</td>
                                    </tr>

                                    <!-- Servicios adicionales -->
                                    <tr
                                        v-for="(servicio, i) in vistaCotizacion.serviciosAdicionales"
                                        :key="'serv-' + i"
                                    >
                                        <td>{{ servicio.nombreServicio }}</td>
                                        <td class="text-center">{{ servicio.cantidad }}</td>
                                        <td>${{ servicio.precioUnitario.toFixed(2) }}</td>
                                        <td>${{ (servicio.precioUnitario * servicio.cantidad).toFixed(2) }}</td>
                                    </tr>

                                    <!-- Total -->
                                    <tr v-if="vistaCotizacion.mostrarTotal" class="fw-bold">
                                        <td colspan="3" class="text-center">Total:</td>
                                        <td>${{ vistaCotizacion.total.toFixed(2) }}</td>
                                    </tr>

                                </tbody>
                            </table>
                            <p class="mt-2 fst-italic text-end">Los precios incluyen IVA</p>
                        </div>

                        <!-- Botón PDF -->
                        <div class="text-end mt-4">
                            <button class="btn btn-outline-secondary" @click="generarPDF">Descargar PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- MODAL PARA CRREAR NUEVA COTIZACION -->
        <div class="modal fade" ref="modalRef" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-scrollable modal-lg">
                <div class="modal-content" style="max-height: 90vh; display: flex; flex-direction: column;">
                
                    <div class="modal-header">
                        <div class="row modal-title align-items-center text-center">
                            <h3>Nueva cotizacion</h3>
                        </div>
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>

                    <div class="modal-body" style="overflow-y: auto;">                                                  
                        <div class="row m-4">
                            <!-- Input de cliente nuevo -->
                            <div class="col d-flex flex-column">
                                <div class="row m-2">
                                    <label for="clienteNuevo" class="mb-1">Cliente Nuevo:</label>
                                    <input 
                                        id="clienteNuevo" 
                                        v-model="cotizacionForm.clienteNombre" 
                                        class="form-control" 
                                        type="text" 
                                        placeholder="Ej. Nombre Apellido"
                                    >
                                </div>
                                <div class="row m-2">
                                    <label for="numTelefono">Num. Telefono:</label>
                                    <input
                                        id="numTelefono"
                                        v-model="cotizacionForm.clienteTelefono" 
                                        type="text" 
                                        class="form-control" 
                                        placeholder="Ej. XXX-XXX-XXXX"
                                    >
                                </div>
                                <div class="row m-2">
                                    <label for="correoCliente">Correo:</label>
                                    <input
                                        id="correoCliente"
                                        v-model="cotizacionForm.clienteCorreo" 
                                        type="email" 
                                        class="form-control" 
                                        placeholder="Ej. ejemplo@correo.com"
                                    >
                                </div>
                            </div>

                            <!-- Select de cliente existente -->
                            <div class="col d-flex flex-column">
                                <div class="row m-2">
                                    <label for="clienteExistente" class="mb-1">Cliente Existente</label>
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
                                        <div class="form-check m-4">
                                            <input class="form-check-input" type="checkbox" id="mostrarTotal" v-model="mostrarTotalEnVista">
                                            <label class="form-check-label" for="mostrarTotal">
                                                Mostrar total en la vista previa
                                            </label>
                                        </div>
                                    </div>                                      
                                    <div class="col">
                                        <div v-for="(paquete, i) in paquetesDisponibles" :key="i" class="form-check m-4">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                :id="'paquete-' + i"
                                                :value="paquete" 
                                                v-model="cotizacionForm.paquetes"
                                            >
                                            <label class="form-check-label" :for="'paquete-' + i">
                                                {{ paquete.nombre }} - ${{ paquete.precioUnitario }}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>                                
                        </div>                            

                        <div class="row m-4">
                            <div class="col">
                                <label for="" class="m-2">Selecciona las llantas deseadas:</label>
                                <div class="row m-2">
                                    <input
                                        v-model="busquedaLlantas"
                                        class="form-control"
                                        placeholder="Buscar por nombre o medida..."
                                    />
                                </div>
                                <EasyDataTable
                                    v-model:items-selected="itemsSelected"
                                    :headers="tblHeadersModal"
                                    :items="itemsFiltrados"
                                    :rows-per-page="10"
                                    show-index
                                    show-select
                                >
                                </EasyDataTable>
                            </div>
                        </div>

                        <div class="row mt-3 mx-3">
                            <h5>Agregar servicio adicional</h5>
                            <div class="d-flex gap-3 mb-3">
                                <input 
                                    class="form-control" 
                                    placeholder="Nombre del servicio" 
                                    v-model="nuevoServicio" 
                                />
                                <input 
                                    class="form-control" 
                                    type="number" 
                                    min="1" 
                                    placeholder="Cantidad" 
                                    v-model="nuevaCantidad"
                                />
                                <input 
                                    class="form-control" 
                                    type="number" 
                                    min="0" 
                                    placeholder="Precio unitario" 
                                    v-model="nuevoPrecio" 
                                />
                                <button class="btn btn-success" @click="agregarServicioExtra">
                                    Agregar
                                </button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col border m-4">
                                <div class="row m-5 justify-content-center">
                                    <div class="col-10 p-4 rounded-3">
                                        <div class="mb-3 d-flex ">
                                            <img src="/images/Logo-Kartisimo.png" alt="Logo Kartisimo" />
                                            <p>Kartisimo Bajio S. A. de CV</p>
                                        </div>
                                        <div class="my-3 d-flex justify-content-between">
                                            <div>
                                                <small>Blvd. Delta 2002 esq. Rio Mayo</small><br>
                                                <small>Col. Valle de Jerez C.P 37538</small><br>
                                                <small>Tel. 477 330 6060 y 477 390 5090</small><br>
                                                <small>delta@kartisimo.mx</small><br>
                                            </div>
                                            <div>
                                                <small>Blvd. Lopez Mateos 827 esq. Apolo</small><br>
                                                <small>Col. Obrera C.P. 37340</small><br>
                                                <small>Tel. 477 717 7440 y 477 470 9419</small><br>
                                                <small>apolo@kartisimo.mx</small><br>
                                            </div>
                                            <div>
                                                <small>Blvd. Torres Landa 1901 esq San Jacobo</small><br>
                                                <small>Col. La Pisina C.P. 37440</small><br>
                                                <small>Tel. 477 390 0290 y 477 461 0028</small><br>
                                                <small>torreslanda@kartisimo.mx</small><br>
                                            </div>
                                        </div>

                                        <div class="mb-2 d-flex">
                                            <p class="mx-2"><strong>Cliente: </strong>{{ cotizacionForm.clienteNombre || '---' }}</p>
                                            <p class="mx-2"><strong>Teléfono: </strong>{{ cotizacionForm.clienteTelefono || '---' }}</p>
                                        </div>

                                        <div class="mb-3">
                                            <h5 class="border-bottom pb-1">Paquetes seleccionados</h5>
                                            <div v-if="cotizacionForm.paquetes.length">
                                                <div 
                                                    v-for="(p, index) in cotizacionForm.paquetes" 
                                                    :key="index" 
                                                    class="d-flex justify-content-between"
                                                >
                                                    <p><strong>{{ p.nombre }}</strong></p>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        class="form-control d-inline-block"
                                                        style="width: 90px; height: 30px;"
                                                        v-model.number="p.precioUnitario"
                                                        placeholder="Precio"
                                                    />
                                                </div>
                                            </div>
                                            <p class="text-muted" v-else>No se seleccionaron paquetes</p>
                                        </div>

                                        <div class="mb-3">
                                            <h5 class="border-bottom pb-1">Llantas Seleccionadas</h5>
                                            <ul class="list-unstyled">
                                                <li class="d-flex justify-content-between" v-for="item in cotizacionForm.llantas" :key="item.id">
                                                    <div>
                                                        <input
                                                            type="number"
                                                            min="4"
                                                            class="form-control d-inline-block ms-3"
                                                            style="width: 60px; height: 30px;"
                                                            v-model.number="cotizacionForm.cantidadesPorLlanta[item.id]"
                                                            placeholder="4"
                                                        />
                                                        <span class="mx-3">
                                                            {{ item.fila2 }} {{ item.fila1 }}
                                                            <span v-if="item.sobrePedido" class="badge bg-warning text-dark ms-2">
                                                                Sobre pedido
                                                            </span>
                                                        </span>                                                               
                                                    </div>  
                                                    <div>
                                                        <p class="float-end">
                                                            <input 
                                                                type="number"
                                                                class="form-control d-inline-block"
                                                                style="width: 90px; height: 30px;"
                                                                v-model.number="preciosLlantas[item.id]"
                                                                placeholder="Precio c/u"
                                                            /> 
                                                            · {{ formatoMoneda((preciosLlantas[item.id] || 0) * (cantidadesPorLlanta[item.id] ?? 4))  }}
                                                        </p>
                                                    </div>
                                                </li>
                                            </ul>
                                            <p class="float-end">{{ formatoMoneda(subtotalLlantas) }}</p>
                                        </div>

                                        <div class="pt-4">
                                            <h5 class="border-bottom pb-1">Servicios Adicionales</h5>
                                            <ul class="list-unstyled">
                                                <li class="d-flex justify-content-between" v-for="(extra, i) in cotizacionForm.serviciosExtras" :key="i">
                                                    <div class="d-flex ">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            class="form-control mx-3"
                                                            style="width: 60px; height: 30px;"
                                                            v-model.number="extra.cantidad"
                                                            placeholder="1"
                                                        />
                                                        <span class="align-content-center">{{ extra.nombre }}</span>                                                            
                                                    </div>
                                                    <div class="float-end">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            class="form-control d-inline-block me-2"
                                                            style="width: 90px; height: 30px;"
                                                            v-model.number="extra.precioUnitario"
                                                            placeholder="Precio c/u"
                                                        />
                                                        <span>
                                                            {{ (extra.precioUnitario * (extra.cantidad || 1)).toFixed(2) }}
                                                        </span>

                                                        <button class="btn btn-sm btn-outline-danger ms-2" @click="eliminarServicioExtra(i)">
                                                            ✕
                                                        </button>
                                                    </div> 
                                                </li>
                                            </ul>
                                            <p class="float-end">{{ formatoMoneda(subtotalExtras)  }}</p>
                                        </div>

                                        <div class="text-end pt-5">
                                            <hr>
                                            <p v-if="mostrarTotalEnVista" class="fs-5"><strong>Total:</strong> {{ formatoMoneda(totalCotizacion) }}</p>
                                        </div>                                        
                                    </div>
                                </div>                                
                            </div>                                
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
                        <button type="button" class="btn btn-primary" @click="guardarCotizacion">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>    
</template>

<script setup>
    import { ref, watch, computed, onMounted, getCurrentInstance, reactive } from 'vue';
    import EasyDataTable from "vue3-easy-data-table";
    import html2pdf from 'html2pdf.js';

    const { proxy } = getCurrentInstance()    
    const modalRef = ref(null);
    let modalInstance = null;
    const paquetesDisponibles = ref([]);
    const clientesDisponibles = ref([]);
    const items = ref([]);
    const nuevoServicio = ref('');
    const nuevoPrecio = ref('');
    const nuevaCantidad = ref(1);
    const busquedaLlantas = ref('');
    const busquedaCotizaciones = ref('');
    const cotizacionesRealizadas = ref([]);
    const vistaCotizacion = ref({});
    const mostrarVista = ref(false);
    const codigoCotizacionEnEdicion = ref(null); // null = creación nueva
    const mostrarTotalEnVista = ref(false); // TODO: correjir este apartado o buscar otra forma de implementarlo
    const filtroEstatus = ref('');

    const itemsSelected = ref([]);
    const paquetesSeleccionados = ref([]);
    const cantidadesPorLlanta = ref({});

    const cotizacionForm = reactive({
        codigo: '',                   // ← Para saber si es edición
        clienteNombre: '',
        clienteTelefono: '',
        clienteCorreo: '',
        clienteExistente: '',
        paquetes: [],
        llantas: [],
        cantidadesPorLlanta: {},
        serviciosExtras: [],
        mostrarTotal: false,
        fechaCreacion: ''
    });


    // Función para cargar paquetes
    const cargarPaquetes = async () => {
        try {
            const res = await fetch(proxy.$serverIP + 'api/Paquetes/getPaquete');
            if (!res.ok) throw new Error('Error en la respuesta');
            const data = await res.json();
            paquetesDisponibles.value = data;
        } catch (e) {
            console.error('Error al cargar paquetes:', e);
        }
    };

    // Función para cargar clientes
    const cargarClientes = async () => {
        try {
            const res = await fetch(proxy.$serverIP + 'api/Cliente/getClientes');
            if (!res.ok) throw new Error('Error al obtener clientes');
            const data = await res.json();
            clientesDisponibles.value = data;
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    // Función para cargar llantas
    const cargarLlantas = async () => {
        try {
            const res = await fetch(proxy.$serverIP + 'api/Llanta/getLlantaPrecio');
            if (!res.ok) throw new Error('Error al obtener llantas');
            const data = await res.json();

            items.value = data.map(llanta => {
                const medida = `${llanta.anchura}/${llanta.perfil} R${llanta.rin} ${llanta.carga}${llanta.velocidad}`;
                const nombreCompleto = `${llanta.nombreMarca} ${llanta.modelo}`.trim();
                const sobrePedido = llanta.nombreAlmacen.toLowerCase().includes('proveedor');
                preciosLlantas[llanta.idLlanta] = parseFloat(llanta.precio); // para cálculos

                return {
                    id: llanta.idLlanta,
                    fila1: nombreCompleto,
                    fila2: medida,
                    fila3: llanta.nombreAlmacen,
                    fila4: parseFloat(llanta.precio)|| 0,
                    sobrePedido
                };
            });
        } catch (error) {
            console.error('Error al cargar llantas:', error);
        }
    };

    // Función para cargar cotizaciones
    const cargarCotizaciones = async () => {
        try {
            const res = await fetch(proxy.$serverIP + 'api/Cotizacion/resumenCotizaciones');
            if (!res.ok) throw new Error('Error al obtener cotizaciones');
            const data = await res.json();

            cotizacionesRealizadas.value = data.map((c, i) => ({
                codigo: 'COT-' + String(c.idCotizacion).padStart(5, '0'), // Ej: COT-00001
                fechaCreacion: new Date(c.fechaCreacion).toLocaleString('es-MX'),
                cliente: {
                    nombre: c.clienteNombre,
                    telefono: c.telefono,
                    correo: c.correo
                },
                paquetes: c.nombresPaquetes === 'Ninguno' ? [] : c.nombresPaquetes.split(', ').map(nombre => ({ nombre })),
                llantasSelecionadas: [], // ← puedes llenarlo después si hay detalle
                serviciosAdicionales: [],
                total: c.total,
                estatus: c.estado,
                mostrarTotal: false
            }));
        } catch (error) {
            console.error('Error al cargar cotizaciones:', error);
        }
    };

    onMounted(async () => {
        await cargarPaquetes();
        await cargarClientes();
        await cargarLlantas();
        await cargarCotizaciones();
    });
    /***************************
        FUNCIONES PARA MODAL CREACION
    ***************************/

    const cargarFormulario = async (cotizacion = null) => {
        if (!cotizacion) {
            // Si no hay cotización, limpiamos
            Object.assign(cotizacionForm, {
                codigo: '',
                clienteNombre: '',
                clienteTelefono: '',
                clienteCorreo: '',
                clienteExistente: '',
                paquetes: [],
                llantas: [],
                cantidadesPorLlanta: {},
                serviciosExtras: [],
                mostrarTotal: false,
                fechaCreacion: ''
            });
            itemsSelected.value = [];
            paquetesSeleccionados.value = [];
            mostrarTotalEnVista.value = false;
            return;
        }

        try {
            const res = await fetch(`${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${cotizacion.codigo.replace('COT-', '')}`);
            const data = await res.json();

            cotizacionForm.codigo = 'COT-' + data.idCotizacion;
            cotizacionForm.fechaCreacion = data.fechaCreacion;
            cotizacionForm.clienteNombre = data.clienteNombre;
            cotizacionForm.clienteTelefono = data.telefono;
            cotizacionForm.clienteCorreo = data.correo;
            cotizacionForm.clienteExistente = ''; // si deseas autocompletar, podrías buscar coincidencia

            cotizacionForm.paquetes = data.paquetes.map(p => ({
                idDetalleCotizacionPaquete: p.idDetalleCotizacionPaquete,
                idPaquete: p.idPaquete,
                nombre: p.nombre,
                precioUnitario: p.precioUnitario
            }));

            cotizacionForm.llantas = data.llantas.map(ll => ({
                ...ll,
                id: ll.idLlanta,
                fila1: ll.modelo,
                fila2: ll.modeloMedidas.replace(`${ll.modelo} — `, ''),
                fila3: '',
                fila4: ll.precioUnitario,
            }));

            // cantidades y precios por llanta
            cotizacionForm.cantidadesPorLlanta = {};
            data.llantas.forEach(ll => {
                cotizacionForm.cantidadesPorLlanta[ll.idLlanta] = ll.cantidad;
                preciosLlantas[ll.idLlanta] = ll.precioUnitario;
            });

            cotizacionForm.serviciosExtras = data.servicios.map(s => ({
                idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
                nombre: s.descripcion,
                cantidad: s.cantidad,
                precioUnitario: s.precioUnitario
            }));
            console.log(' ServiciosExtras:   ' +JSON.stringify(cotizacionForm.serviciosExtras + 'DataServicios: '+ JSON.stringify(data)))

            cotizacionForm.mostrarTotal = false;
            mostrarTotalEnVista.value = false;

        } catch (e) {
            console.error('Error cargando cotización para edición:', e);
            alert('No se pudo cargar la cotización');
        }
    };

    const guardarCotizacion = () => {

        const rawId = cotizacionForm.codigo
        ? Number(cotizacionForm.codigo.replace(/^COT-/, ''))
        : null; // null para nueva

        // Mapear llantas al formato esperado
        const llantas = cotizacionForm.llantas.map(item => ({
            idDetalleCotizacionLlanta: item.idDetalleCotizacionLlanta || null, // null si nuevo
            idLlanta: item.idLlanta,
            cantidad: cotizacionForm.cantidadesPorLlanta[item.idLlanta], // asegúrate que la llave es idLlanta
            precioUnitario: preciosLlantas[item.idLlanta]
        }));

        // Paquetes
        const paquetes = cotizacionForm.paquetes.map(p => ({
            idDetalleCotizacionPaquete: p.idDetalleCotizacionPaquete|| null,
            idPaquete: p.idPaquete,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario
        }));
        //console.log(JSON.stringify(paquetes) + JSON.stringify(cotizacionForm.paquetes))
        // Servicios
        const serviciosAdicionales = cotizacionForm.serviciosExtras.map(s => ({
            idDetalleCotizacionServicio: s.idDetalleCotizacionServicio || null,
            descripcionServicio: s.nombre,
            cantidad: s.cantidad,
            precioUnitario: s.precioUnitario
        }));
        console.log(JSON.stringify(serviciosAdicionales) + JSON.stringify(cotizacionForm.serviciosExtras))
        const nuevaCotizacion = {
            codigo: rawId,
            llantas,
            paquetes,
            serviciosAdicionales,
            mostrarTotal: cotizacionForm.mostrarTotal,
            total: totalCotizacion.value,
        };

        // Decide si POST o PUT
        const url = cotizacionForm.codigo
            ? `${proxy.$serverIP}api/Cotizacion/editarCotizacion`
            : `${proxy.$serverIP}api/Cotizacion/crearCotizacion`;

        fetch(url, {
            method: cotizacionForm.codigo ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCotizacion)
        })
        .then(res => res.json())
        .then(data => console.log("Cotización guardada:", data));

        console.log(JSON.stringify(nuevaCotizacion))
        closeModal();
        cargarFormulario(); // limpia
    };

    const agregarServicioExtra = () => {
        if (nuevoServicio.value && nuevoPrecio.value && nuevaCantidad.value > 0) {
            cotizacionForm.serviciosExtras.push({
                idDetalleCotizacionServicio: null,         // o algún id temporal si lo necesitas
                nombre: nuevoServicio.value,
                cantidad: parseInt(nuevaCantidad.value),
                precioUnitario: parseFloat(nuevoPrecio.value)
            });
            nuevoServicio.value = '';
            nuevoPrecio.value = '';
            nuevaCantidad.value = 1;
        }
    };

    const eliminarServicioExtra = (index) => {
        cotizacionForm.serviciosExtras.splice(index, 1);
    };

    const calcularTotalVista = (data) => {
        const totalLlantas = data.llantas.reduce((sum, l) => sum + (l.precioUnitario * l.cantidad), 0);
        const totalPaquetes = data.paquetes.reduce((sum, p) => sum + p.precioUnitario, 0);
        const totalServicios = data.servicios.reduce((sum, s) => sum + (s.precioUnitario * s.cantidad), 0);
        return totalLlantas + totalPaquetes + totalServicios;
    };

    const subtotalPaquete = computed(() => {
        return paquetesSeleccionados.value.reduce((sum, p) => sum + p.precioUnitario, 0);
    });

    const subtotalLlantas = computed(() => {
        return itemsSelected.value.reduce((sum, item) => {
            const cantidad = cantidadesPorLlanta.value[item.id] ?? 4; // ← por defecto 4
            return sum + ((preciosLlantas[item.id] || 0) * cantidad);
        }, 0);
    });

    const subtotalExtras = computed(() => {
        return cotizacionForm.serviciosExtras.reduce((sum, item) => {
            const cantidad = item.cantidad || 1;
            return sum + (item.precioUnitario * cantidad);
        }, 0);
    });

    const totalCotizacion = computed(() => {
        return subtotalPaquete.value + subtotalLlantas.value + subtotalExtras.value;
    });

    const itemsFiltrados = computed(() => {
        if (!busquedaLlantas.value) return items.value;

        const texto = busquedaLlantas.value.toLowerCase();

        return items.value.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(texto)
            )
        );
    });

    const openModal = () => {
        if (!modalInstance) {
            modalInstance = new bootstrap.Modal(modalRef.value);
        }
        modalInstance.show();
    };

    const closeModal = () => {
        modalInstance?.hide();
        codigoCotizacionEnEdicion.value = null;
    };

    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(valor);
    };

    const abrirModalCotizacion = (cotizacion = null) => {
        console.log(cotizacion)
        cargarFormulario(cotizacion);
        openModal();
    };

    // contenido local para demostracion
    // TODO: ELIMINAR CUANDO SE TENGAN DATOS REALES Y DESARROLLADO EL BACKEND

    const tblHeadersModal = [
        { text:"Llanta", value: "fila1"},
        { text:"Medidas", value: "fila2"},
        { text:"Ubicación", value: "fila3", width:200},
        { text:"Precio", value: "fila4", width:100},
    ]

    let preciosLlantas = {
        66: 1300, // MULTIHAWK
        67: 1350, // FIREHAWK 900
        69: 1500, // CV-200 100P
        78: 1450, // FIREHAWK GTV 82V
        91: 1800, // FIREHAWK INDY 500
        98: 1600  // ECOPIA EP 422
    };

    const cotizacionesTransformadas = computed(() => {
        return cotizacionesRealizadas.value
            .filter(c => {
                const texto = busquedaCotizaciones.value.toLowerCase().trim();
                if (filtroEstatus.value && c.estatus !== filtroEstatus.value) return false;
                if (!texto) return true;

                const valores = [
                    c.codigo,
                    c.fechaCreacion,
                    c.cliente?.nombre,
                    c.cliente?.telefono,
                    c.total?.toString(),
                    c.estatus,
                    ...(c.paquetes?.map(p => p.nombre) || []) // para búsqueda por nombre de paquetes
                ];

                return valores.some(v =>
                    String(v).toLowerCase().includes(texto)
                );
            })
            .map(c => ({
                codigo: c.codigo || '—',
                fechaCreacion: c.fechaCreacion || '—',
                cliente: c.cliente?.nombre || '—',
                telefono: c.cliente?.telefono || '—',
                paquete: c.paquetes?.length
                    ? c.paquetes.map(p => p.nombre).join(', ')
                    : '—',
                total: formatoMoneda(c.total || 0),
                estatus: typeof c.estatus === 'string' ? c.estatus : 'Desconocido',
                acciones: c
            }));
    });

    watch(itemsSelected, (seleccionados) => {
        seleccionados.forEach(item => {
            if (cantidadesPorLlanta.value[item.id] === undefined) {
                cantidadesPorLlanta.value[item.id] = 4;
            }
        });
    });

    // observar si clienteExistente a cambiado de valor 
   watch(() => cotizacionForm.clienteExistente, (nuevoNombre) => {
        const cliente = clientesDisponibles.value.find(c => c.nombres === nuevoNombre);
        if (cliente) {
            cotizacionForm.clienteNombre = cliente.nombres + ' ' + cliente.apPaterno + ' ' + cliente.apMaterno;
            cotizacionForm.clienteTelefono = cliente.telefono;
            cotizacionForm.clienteCorreo = cliente.correo;
        } else {
            cotizacionForm.clienteNombre = '';
            cotizacionForm.clienteTelefono = '';
            cotizacionForm.clienteCorreo = '';
        }
    });

    

    //boton ver
    const mostrarVistaPrevia = async (cotizacion, modo = 'ver') => {
        if (modo === 'ver') {
            try {
                const res = await fetch(`${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${cotizacion.codigo.replace('COT-', '')}`);
                const data = await res.json();

                vistaCotizacion.value = {
                    codigo: 'COT-' + data.idCotizacion,
                    fechaCreacion: new Date(data.fechaCreacion).toLocaleString(),
                    cliente: {
                        nombre: data.clienteNombre,
                        telefono: data.telefono || 'Sin teléfono',
                        correo: data.correo || 'Sin correo'
                    },
                    llantasSelecionadas: data.llantas.map(llanta => ({
                        idllanta: llanta.idLlanta,
                        marca: llanta.modelo.split(' ')[0],
                        modelo: llanta.modelo.split(' ').slice(1).join(' '),
                        medidas: llanta.modeloMedidas.replace(llanta.modelo + ' — ', ''),
                        almacenOrigen: '', // opcional
                        cantidad: llanta.cantidad,
                        precioUnitario: llanta.precioUnitario,
                        total: llanta.precioUnitario * llanta.cantidad
                    })),
                    paquetes: data.paquetes.map(p => ({
                        idPaquete: p.idPaquete,
                        nombre: p.nombre,
                        precio: p.precioUnitario
                    })),
                    serviciosAdicionales: data.servicios.map(s => ({
                        nombreServicio: s.descripcion,
                        cantidad: s.cantidad,
                        precioUnitario: s.precioUnitario
                    })),
                    total: calcularTotalVista(data),
                    estatus: cotizacion.estatus || 'Activa',
                    mostrarTotal: false
                };

                mostrarVista.value = true;
            } catch (error) {
                console.error("Error al cargar detalle de cotización:", error);
                alert("Error al cargar cotización");
            }
        }
    };

    const cancelarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 4,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        console.log(JSON.stringify(json))
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(res => res.json())
        .then(data  => {
            console.log("Cotización actualizada:", data)
            cargarCotizaciones()
        });
    };

    const reactivarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 1,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        console.log(JSON.stringify(json))
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(res => res.json())
        .then(data  => {
            console.log("Cotización actualizada:", data)
            cargarCotizaciones()
        });
    };

    const aprobarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 2,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        console.log(JSON.stringify(json))
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(res => res.json())
        .then(data  => {
            console.log("Cotización actualizada:", data)
            cargarCotizaciones()
        });
    };

    const finalizarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 3,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        console.log(JSON.stringify(json))
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(res => res.json())
        .then(data  => {
            console.log("Cotización actualizada:", data)
            cargarCotizaciones()
        });
    };
</script>