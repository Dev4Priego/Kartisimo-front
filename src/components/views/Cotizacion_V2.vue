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
                    <option value="Activa">Activos</option>
                    <option value="Cancelada">Cancelados</option>
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

                                <button class="btn btn-sm btn-outline-warning" @click="mostrarVistaPrevia(item.acciones, 'editar')">
                                    Editar
                                </button>

                                <button
                                    v-if="item.estatus === 'Activa'"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="cancelarCotizacion(item.acciones)"
                                >
                                    Cancelar
                                </button>

                                <button
                                    v-else-if="item.estatus === 'Cancelada'"
                                    class="btn btn-sm btn-outline-success"
                                    @click="reactivarCotizacion(item.acciones)"
                                >
                                    Reactivar
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
                                        v-model="clienteNombre" 
                                        class="form-control" 
                                        type="text" 
                                        placeholder="Ej. Nombre Apellido"
                                    >
                                </div>
                                <div class="row m-2">
                                    <label for="numTelefono">Num. Telefono:</label>
                                    <input
                                        id="numTelefono"
                                        v-model="clienteTelefono" 
                                        type="text" 
                                        class="form-control" 
                                        placeholder="Ej. XXX-XXX-XXXX"
                                    >
                                </div>
                                <div class="row m-2">
                                    <label for="correoCliente">Correo:</label>
                                    <input
                                        id="correoCliente"
                                        v-model="clienteCorreo" 
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
                                        v-model="clienteExistente"
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
                                                v-model="paquetesSeleccionados"
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
                                            <p class="mx-2"><strong>Cliente: </strong>{{ clienteNombre || '---' }}</p>
                                            <p class="mx-2"><strong>Teléfono: </strong>{{ clienteTelefono || '---' }}</p>
                                        </div>

                                        <div class="mb-3">
                                            <h5 class="border-bottom pb-1">Paquetes seleccionados</h5>
                                            <div v-if="paquetesSeleccionados.length">
                                                <div 
                                                    v-for="(p, index) in paquetesSeleccionados" 
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
                                                <li class="d-flex justify-content-between" v-for="item in itemsSelected" :key="item.id">
                                                    <div>
                                                        <input
                                                            type="number"
                                                            min="4"
                                                            class="form-control d-inline-block ms-3"
                                                            style="width: 60px; height: 30px;"
                                                            v-model.number="cantidadesPorLlanta[item.id]"
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
                                                <li class="d-flex justify-content-between" v-for="(extra, i) in serviciosExtras" :key="i">
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
                                                            v-model.number="extra.precio"
                                                            placeholder="Precio c/u"
                                                        />
                                                        <span>
                                                            {{ (extra.precio * (extra.cantidad || 1)).toFixed(2) }}
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
    import { ref, watch, computed, onMounted, getCurrentInstance } from 'vue';
    import EasyDataTable from "vue3-easy-data-table";
    import html2pdf from 'html2pdf.js';

    const { proxy } = getCurrentInstance()    
    const modalRef = ref(null);
    let modalInstance = null;
    
    const paquetesDisponibles = ref([]);
    const clientesDisponibles = ref([]);
    const clienteExistente = ref('');
    const items = ref([]);

    onMounted(async () => {
        try {
            const res = await fetch(proxy.$serverIP + 'api/Paquetes/getPaquete');
            if (!res.ok) throw new Error('Error en la respuesta');
            const data = await res.json();
            paquetesDisponibles.value = data;
        } catch (e) {
            console.error('Error al cargar paquetes:', e);
        }

        try {
            const resClientes = await fetch(proxy.$serverIP + 'api/Cliente/getClientes');
            if (!resClientes.ok) throw new Error('Error al obtener clientes');
            const dataClientes = await resClientes.json();
            clientesDisponibles.value = dataClientes;
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }

        try {
            const resLlantas = await fetch(proxy.$serverIP + 'api/Llanta/getLlantaPrecio');
            if (!resLlantas.ok) throw new Error('Error al obtener llantas');
            const dataLlantas = await resLlantas.json();

            items.value = dataLlantas.map(llanta => {
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

        try {
            const resCotizaciones = await fetch(proxy.$serverIP + 'api/Cotizacion/resumenCotizaciones');
            if (!resCotizaciones.ok) throw new Error('Error al obtener cotizaciones');
            const dataCotizaciones = await resCotizaciones.json();

            cotizacionesRealizadas.value = dataCotizaciones.map((c, i) => ({
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
    }); 
    
    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(valor);
    };

    // contenido local para demostracion
    // TODO: ELIMINAR CUANDO SE TENGAN DATOS REALES Y DESARROLLADO EL BACKEND

    const itemsSelected = ref([]);
    const clienteNombre = ref('');
    const clienteTelefono = ref('');
    const clienteCorreo = ref('');
    const paquetesSeleccionados = ref([]);
    const serviciosExtras = ref([]);
    const nuevoServicio = ref('');
    const nuevoPrecio = ref('');
    const cantidadesPorLlanta = ref({});
    const nuevaCantidad = ref(1);
    const busquedaLlantas = ref('');
    const busquedaCotizaciones = ref('');
    const cotizacionesRealizadas = ref([]);

    const vistaCotizacion = ref({});
    const mostrarVista = ref(false);
    const codigoCotizacionEnEdicion = ref(null); // null = creación nueva
    const mostrarTotalEnVista = ref(false); // TODO: correjir este apartado o buscar otra forma de implementarlo
    const filtroEstatus = ref('');

    

    const tblHeadersModal = [
        { text:"Llanta", value: "fila1"},
        { text:"Medidas", value: "fila2"},
        { text:"Ubicación", value: "fila3", width:200},
        { text:"Precio", value: "fila4", width:100},
    ]

    const preciosLlantas = {
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
    watch(clienteExistente, (nuevoNombre) => {
        const cliente = clientesDisponibles.value.find(c => c.nombres === nuevoNombre);
        if (cliente) {
            clienteNombre.value = cliente.nombres + ' ' +cliente.apPaterno + ' ' + cliente.apMaterno;
            clienteTelefono.value = cliente.telefono;
            clienteCorreo.value = cliente.correo;
        } else {
            clienteNombre.value = '';
            clienteTelefono.value = '';
            clienteCorreo.value = '';
        }
    });

    const agregarServicioExtra = () => {
        if (nuevoServicio.value && nuevoPrecio.value && nuevaCantidad.value > 0) {
            serviciosExtras.value.push({
                nombre: nuevoServicio.value,
                precio: parseFloat(nuevoPrecio.value),
                cantidad: parseInt(nuevaCantidad.value)
            });
            nuevoServicio.value = '';
            nuevoPrecio.value = '';
            nuevaCantidad.value = 1;
        }
    };

    const eliminarServicioExtra = (index) => {
        serviciosExtras.value.splice(index, 1);
    };

    const guardarCotizacion = () => {

        let clienteSeleccionado = clientesDisponibles.value.find(
            c => (c.nombres + ' ' + c.apPaterno + ' ' + c.apMaterno).trim() === clienteNombre.value.trim()
        );

        if (!clienteSeleccionado) {
            clienteSeleccionado = {
                idCliente: 1,
                nombres: clienteNombre.value || 'Cliente',
                apPaterno: 'Genérico',
                apMaterno: '',
                telefono: clienteTelefono.value || 'Sin teléfono',
                correo: clienteCorreo.value || 'Sin correo'
            };
        } else {
            // Si se selecciona, usamos su info o lo que el usuario ingresó
            clienteSeleccionado.telefono = clienteSeleccionado.telefono || clienteTelefono.value || 'Sin teléfono';
            clienteSeleccionado.correo = clienteSeleccionado.correo || clienteCorreo.value || 'Sin correo';
        }

        const cliente = {
            idCliente: clienteSeleccionado.idCliente,
            nombres: clienteSeleccionado.nombres,
            apPaterno: clienteSeleccionado.apPaterno,
            apMaterno: clienteSeleccionado.apMaterno,
            telefono: clienteSeleccionado.telefono,
            correo: clienteSeleccionado.correo
        };

        if (cliente.idCliente === 1 && !clienteCorreo.value.trim() && !clienteTelefono.value.trim()) {
            alert("Debes ingresar al menos un número de teléfono o un correo electrónico para el cliente genérico.");
            return;
        }

        const hayPaquetes = paquetesSeleccionados.value.length > 0;
        const hayLlantas = itemsSelected.value.length > 0;
        const hayServiciosExtras = serviciosExtras.value.length > 0;

        if (!hayPaquetes && !hayLlantas && !hayServiciosExtras) {
            alert('Debes seleccionar al menos un paquete, una llanta o un servicio adicional.');
            return;
        }

        const timestamp = new Date();
        const fechaCreacion = new Date().toISOString(); 
        const esEdicion = codigoCotizacionEnEdicion.value !== null;

        const cotizacionActualizada = {
            codigo: esEdicion ? codigoCotizacionEnEdicion.value : 'COT-' + timestamp.getTime(),
            fechaCreacion: esEdicion
                ? cotizacionesRealizadas.value.find(c => c.codigo === codigoCotizacionEnEdicion.value)?.fechaCreacion || fechaCreacion
                : fechaCreacion,
            telefono: cliente.telefono,
            correo: cliente.correo,
            cliente: cliente,
            paquete: paquetesSeleccionados.value.map(p => ({
                idPaquete: p.idPaquete,
                nombre: p.nombre,
                descripcion:p.descripcion,
                precioUnitario: p.precioUnitario
            })),
            serviciosAdicionales: serviciosExtras.value.map(s => ({
                nombreServicio: s.nombre,
                precioUnitario: s.precio,
                cantidad: s.cantidad
            })),
            llanta: itemsSelected.value.map(item => {
                const cantidad = cantidadesPorLlanta.value[item.id] ?? 4;
                const precioUnitario = preciosLlantas[item.id] || item.precioUnitario || 0;
                return {
                    idllanta: item.id,
                    marca: item.fila1?.split(" ")[0] || item.marca,
                    modelo: item.fila1?.split(" ").slice(1).join(" ") || item.modelo,
                    medidas: item.fila2 || item.medidas,
                    almacenOrigen: item.fila3 || item.almacenOrigen,
                    cantidad,
                    precioUnitario,
                    total: cantidad * precioUnitario
                };
            }),
            total: totalCotizacion.value,
            estatus: esEdicion 
                ? cotizacionesRealizadas.value.find(c => c.codigo === codigoCotizacionEnEdicion.value)?.estatus || 'Activa' 
                : 'Activa',
            mostrarTotal: mostrarTotalEnVista.value
        };

        if (esEdicion) {
            fetch(`${proxy.$serverIP}api/Cotizacion/editarCotizacion`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cotizacionActualizada)
            })
            .then(res => res.json())
            .then(data => console.log("Editada:", data));
        } else {
            fetch(`${proxy.$serverIP}api/Cotizacion/crearCotizacion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cotizacionActualizada)
            })
            .then(res => res.json())
            .then(data => console.log("Creada:", data));
        }

        closeModal();
        limpiarFormulario();
    };


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

        if (modo === 'editar') {
            try {
                const res = await fetch(`${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${cotizacion.codigo.replace('COT-', '')}`);
                const data = await res.json();

                codigoCotizacionEnEdicion.value = 'COT-' + data.idCotizacion;
                clienteNombre.value = data.clienteNombre;
                clienteTelefono.value = data.telefono || '';
                clienteCorreo.value = data.correo || '';

                paquetesSeleccionados.value = data.paquetes.map(p => ({
                    idPaquete: p.idPaquete,
                    nombre: p.nombre,
                    descripcion: '',
                    precioUnitario: p.precioUnitario
                }));

                itemsSelected.value = data.llantas.map((llanta, index) => ({
                    id: llanta.idLlanta,
                    fila1: llanta.modelo,
                    fila2: llanta.modeloMedidas.replace(llanta.modelo + ' — ', ''),
                    fila3: '', // puedes mapear almacenOrigen si lo necesitas
                    fila4: llanta.precioUnitario,
                }));

                cantidadesPorLlanta.value = {};
                preciosLlantas = {}; // ← reinicia precios

                data.llantas.forEach(l => {
                    cantidadesPorLlanta.value[l.idLlanta] = l.cantidad;
                    preciosLlantas[l.idLlanta] = l.precioUnitario;
                });

                serviciosExtras.value = data.servicios.map(s => ({
                    nombre: s.descripcion,
                    cantidad: s.cantidad,
                    precio: s.precioUnitario
                }));

                mostrarTotalEnVista.value = false;
                openModal();
            } catch (error) {
                console.error("Error al cargar cotización para editar:", error);
                alert("Error al cargar datos para edición");
            }
        }
    };

    const cancelarCotizacion = (cotizacion) => {
        const index = cotizacionesRealizadas.value.findIndex(c => c.codigo === cotizacion.codigo);
        if (index !== -1) {
            cotizacionesRealizadas.value[index].estatus = 'Cancelada';
        }
    };

    const reactivarCotizacion = (cotizacion) => {
        const index = cotizacionesRealizadas.value.findIndex(c => c.codigo === cotizacion.codigo);
        if (index !== -1) {
            cotizacionesRealizadas.value[index].estatus = 'Activa';
        }
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
        return serviciosExtras.value.reduce((sum, item) => {
            const cantidad = item.cantidad || 1;
            return sum + (item.precio * cantidad);
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

    const limpiarFormulario = () => {
        clienteNombre.value = '';
        clienteCorreo.value = '';
        clienteTelefono.value = '';
        clienteExistente.value = '';
        paquetesSeleccionados.value = [];
        itemsSelected.value = [];
        cantidadesPorLlanta.value = {};
        serviciosExtras.value = [];
        nuevoServicio.value = '';
        nuevaCantidad.value = 1;
        nuevoPrecio.value = '';
    };

</script>