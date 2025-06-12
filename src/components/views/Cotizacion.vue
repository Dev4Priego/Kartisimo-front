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
                                        <option value="Juan Pérez">Juan Pérez</option>
                                        <option value="María Gómez">María Gómez</option>
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
                                        <div v-for="(paquete, i) in paquetesDisponibles" :key="i" class="form-check">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                :id="'paquete-' + i"
                                                :value="paquete" 
                                                v-model="paquetesSeleccionados"
                                            >
                                            <label class="form-check-label" :for="'paquete-' + i">
                                                {{ paquete.nombre }} - ${{ paquete.precio }}
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
                                    show-index
                                    show-select
                                />
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
                                                        v-model.number="p.precio"
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
                                                            <span v-if="item.fila3 === 'Almacen Foraneo'" class="badge bg-warning text-dark ms-2">
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
                                                            · ${{ (preciosLlantas[item.id] || 0) * (cantidadesPorLlanta[item.id] ?? 4) }}
                                                        </p>
                                                    </div>
                                                </li>
                                            </ul>
                                            <p class="float-end">${{ subtotalLlantas.toFixed(2) }}</p>
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
                                                            ${{ (extra.precio * (extra.cantidad || 1)).toFixed(2) }}
                                                        </span>

                                                        <button class="btn btn-sm btn-outline-danger ms-2" @click="eliminarServicioExtra(i)">
                                                            ✕
                                                        </button>
                                                    </div> 
                                                </li>
                                            </ul>
                                            <p class="float-end">${{ subtotalExtras.toFixed(2) }}</p>
                                        </div>

                                        <div class="text-end pt-5">
                                            <hr>
                                            <p v-if="mostrarTotalEnVista" class="fs-5"><strong>Total:</strong> ${{ totalCotizacion.toFixed(2) }}</p>
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
                                        v-for="(paquete, i) in vistaCotizacion.servicios?.paquetes"
                                        :key="'paq-' + i"
                                    >
                                        <td>Paquete: {{ paquete.nombre }}</td>
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
                                        <td class="text-center">{{ servicio.Cantidad }}</td>
                                        <td>${{ servicio.precioUnitario.toFixed(2) }}</td>
                                        <td>${{ (servicio.precioUnitario * servicio.Cantidad).toFixed(2) }}</td>
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
    </div>    
</template>

<script setup>
    import { ref, watch, computed } from 'vue';
    import EasyDataTable from "vue3-easy-data-table";
    import html2pdf from 'html2pdf.js';

    const llantas = ref([]);
    const clienteExistente = ref('')
    const modalRef = ref(null);
    let modalInstance = null;

    
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
    const cotizacionesRealizadas = ref([
        {
            codigo: "COT-00001",
            fechaCreacion: "05/06/2025, 10:00 a.m.",
            cliente: {
                nombre: "Luis Ramírez",
                correo: "luis@example.com",
                telefono: "477-123-4567"
            },
            servicios: {
                paquete: "Servicio completo",
                precio: 1200
            },
            llantasSelecionadas: [
                {
                    id: 66,
                    marca: "MULTIHAWK",
                    modelo: "",
                    medidas: "175/70 R13 80J",
                    almacenOrigen: "Almacen Local",
                    cantidad: 2,
                    precioUnitario: 1300,
                    total: 2600
                }
            ],
            serviciosAdicionales: [
                {
                    nombreServicio: "Balanceo",
                    precioUnitario: 100,
                    Cantidad: 2
                }
            ],
            total: 4300, // 1200 + 2600 + 200
            estatus: 'Activa',
            mostrarTotal: true
        },
        {
            codigo: "COT-00002",
            fechaCreacion: "05/06/2025, 12:30 p.m.",
            cliente: {
                nombre: "Ana Torres",
                correo: "ana.torres@example.com",
                telefono: "477-456-7890"
            },
            servicios: {
                paquete: "Paquete básico",
                precio: 800
            },
            llantasSelecionadas: [
                {
                    id: 69,
                    marca: "CV-200",
                    modelo: "100P",
                    medidas: "185/00 R14 100P",
                    almacenOrigen: "Almacen Foraneo",
                    cantidad: 4,
                    precioUnitario: 1500,
                    total: 6000
                }
            ],
            serviciosAdicionales: [
                {
                    nombreServicio: "Alineación",
                    precioUnitario: 150,
                    Cantidad: 1
                }
            ],
            total: 6950, // 800 + 6000 + 150
            estatus: 'Activa',
            mostrarTotal: false
        },
        {
            codigo: "COT-00003",
            fechaCreacion: "06/06/2025, 08:45 a.m.",
            cliente: {
                nombre: "Carlos Mendoza",
                correo: "c.mendoza@example.com",
                telefono: "477-222-3333"
            },
            servicios: {
                paquete: "Paquete premium",
                precio: 1500
            },
            llantasSelecionadas: [
                {
                    id: 98,
                    marca: "ECOPIA",
                    modelo: "EP 422",
                    medidas: "195/55 R16 80J",
                    almacenOrigen: "Almacen Local",
                    cantidad: 2,
                    precioUnitario: 1600,
                    total: 3200
                }
            ],
            serviciosAdicionales: [],
            total: 4700, // 1500 + 3200
            estatus: 'Cancelada',
            mostrarTotal: true
        },
        {
            codigo: "COT-00004",
            fechaCreacion: "07/06/2025, 09:10 a.m.",
            cliente: {
                nombre: "David Ortega",
                correo: "david.ortega@example.com",
                telefono: "477-555-6666"
            },
            servicios: {
                paquete: "Mantenimiento preventivo",
                precio: 950
            },
            llantasSelecionadas: [],
            serviciosAdicionales: [
                {
                    nombreServicio: "Cambio de aceite",
                    precioUnitario: 400,
                    Cantidad: 1
                },
                {
                    nombreServicio: "Revisión general",
                    precioUnitario: 550,
                    Cantidad: 1
                }
            ],
            total: 1900, // 950 + 400 + 550
            estatus: 'Activa',
            mostrarTotal: false
        }
    ]);



    const vistaCotizacion = ref({});
    const mostrarVista = ref(false);
    const codigoCotizacionEnEdicion = ref(null); // null = creación nueva
    const mostrarTotalEnVista = ref(true); // TODO: correjir este apartado o buscar otra forma de implementarlo
    const filtroEstatus = ref('');




    const cotizacionesTransformadas = computed(() => {
    return cotizacionesRealizadas.value
        .filter(c => {
            // Filtro por estatus
            if (filtroEstatus.value && c.estatus !== filtroEstatus.value) return false;

            // Filtro por búsqueda global
            const texto = busquedaCotizaciones.value.toLowerCase().trim();
            if (!texto) return true;

            const valores = [
                c.codigo,
                c.fechaCreacion,
                c.cliente?.nombre,
                c.cliente?.telefono,
                c.servicios?.paquete,
                c.total?.toString(),
                c.estatus
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
            paquete: c.servicios?.paquete || '—',
            total: `$${(c.total || 0).toFixed(2)}`,
            estatus: typeof c.estatus === 'string' ? c.estatus : 'Desconocido',
            acciones: c
        }));
    });




    // const tablaHeaders = [
    //     { text: 'Código', value: 'codigo' },
    //     { text: 'Fecha', value: 'fechaCreacion' },
    //     { text: 'Cliente', value: 'cliente' },
    //     { text: 'Teléfono', value: 'telefono' },
    //     { text: 'Paquete', value: 'paquete' },
    //     { text: 'Total', value: 'total' },
    //     { text: 'Estatus', value: 'estatus' },
    //     { text: 'Acciones', value: 'acciones', sortable: false }
    // ];


    const tblHeadersModal = [
        { text:"Llanta", value: "fila1"},
        { text:"Medidas", value: "fila2"},
        { text:"Observacion", value: "fila3", width:200},
        { text:"Precio", value: "fila4", width:100},
    ]

    //#ffd100 se requiere tener un identificador para que la libreria lo reconozca y entienda que son diferentes
    // const items = ref([
    //     { id: 1, fila1: "Michelin Primacy 4", fila2: "175/85 R14 J80", fila3: "Almacen Local", fila4: 1500 },
    //     { id: 2, fila1: "Goodyear Assurance", fila2: "100/65 R14 J80", fila3: "Almacen Local", fila4: 1400 },
    //     { id: 3, fila1: "Bridgestone Ecopia", fila2: "160/70 R14 J80", fila3: "Almacen Foraneo", fila4: 1350 },
    //     { id: 4, fila1: "Pirelli Cinturato P1", fila2: "150/40 R14 J80", fila3: "Almacen Foraneo", fila4: 1250 },
    //     { id: 5, fila1: "Continental TrueContact", fila2: "150/40 R14 J80", fila3: "Almacen Foraneo", fila4: 1250 }
    // ])

    const items = ref([
        {
            id: 66,
            fila1: "MULTIHAWK",
            fila2: "175/70 R13 80J",
            fila3: "Almacen Local",
            fila4: 1300,
        },
        {
            id: 67,
            fila1: "FIREHAWK 900",
            fila2: "175/65 R14 80J",
            fila3: "Almacen Local",
            fila4: 1350,
        },
        {
            id: 69,
            fila1: "CV-200 100P",
            fila2: "185/00 R14 100P",
            fila3: "Almacen Foraneo",
            fila4: 1500,
        },
        {
            id: 78,
            fila1: "FIREHAWK GTV 82V",
            fila2: "185/55 R15 82V",
            fila3: "Almacen Local",
            fila4: 1450,
        },
        {
            id: 91,
            fila1: "FIREHAWK INDY 500",
            fila2: "235/60 R15 98S",
            fila3: "Almacen Foraneo",
            fila4: 1800,
        },
        {
            id: 98,
            fila1: "ECOPIA EP 422",
            fila2: "195/55 R16 80J",
            fila3: "Almacen Local",
            fila4: 1600,
        }
    ]);


    const paquetesDisponibles = [
        { nombre: "Servicio completo", precio: 1200 },
        { nombre: "Servicio regular", precio: 800 },
        { nombre: "Servicio mínimo", precio: 500 }
    ];


    const preciosLlantas = {
        66: 1300, // MULTIHAWK
        67: 1350, // FIREHAWK 900
        69: 1500, // CV-200 100P
        78: 1450, // FIREHAWK GTV 82V
        91: 1800, // FIREHAWK INDY 500
        98: 1600  // ECOPIA EP 422
    };



    watch(itemsSelected, (seleccionados) => {
        seleccionados.forEach(item => {
            if (cantidadesPorLlanta.value[item.id] === undefined) {
                cantidadesPorLlanta.value[item.id] = 4;
            }
        });
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

        const hayPaquetes = paquetesSeleccionados.value.length > 0;
        const hayLlantas = itemsSelected.value.length > 0;
        const hayServiciosExtras = serviciosExtras.value.length > 0;

        if (!hayPaquetes && !hayLlantas && !hayServiciosExtras) {
            alert('Debes seleccionar al menos un paquete, una llanta o un servicio adicional.');
            return;
        }

        const timestamp = new Date();
        const fechaCreacion = timestamp.toLocaleString();
        const esEdicion = codigoCotizacionEnEdicion.value !== null;

        const cotizacionActualizada = {
            codigo: esEdicion ? codigoCotizacionEnEdicion.value : 'COT-' + timestamp.getTime(),
            fechaCreacion: esEdicion
                ? cotizacionesRealizadas.value.find(c => c.codigo === codigoCotizacionEnEdicion.value)?.fechaCreacion || fechaCreacion
                : fechaCreacion,
            cliente: {
                nombre: clienteNombre.value || 'Sin nombre',
                correo: clienteCorreo.value || 'Sin correo',
                telefono: clienteTelefono.value || 'Sin teléfono'
            },
            servicios: {
                paquetes: [...paquetesSeleccionados.value],
                precio: subtotalPaquete.value
            },
            llantasSelecionadas: itemsSelected.value.map(item => {
                const cantidad = cantidadesPorLlanta.value[item.id] ?? 4;
                const precioUnitario = preciosLlantas[item.id] || item.precioUnitario || 0;
                return {
                    id: item.id,
                    marca: item.fila1?.split(" ")[0] || item.marca,
                    modelo: item.fila1?.split(" ").slice(1).join(" ") || item.modelo,
                    medidas: item.fila2 || item.medidas,
                    almacenOrigen: item.fila3 || item.almacenOrigen,
                    cantidad,
                    precioUnitario,
                    total: cantidad * precioUnitario
                };
            }),
            serviciosAdicionales: serviciosExtras.value.map(s => ({
                nombreServicio: s.nombre,
                precioUnitario: s.precio,
                Cantidad: s.cantidad
            })),
            total: totalCotizacion.value,
            estatus: esEdicion 
                ? cotizacionesRealizadas.value.find(c => c.codigo === codigoCotizacionEnEdicion.value)?.estatus || 'Activa' 
                : 'Activa',
            mostrarTotal: mostrarTotalEnVista.value
        };

        if (esEdicion) {
            const index = cotizacionesRealizadas.value.findIndex(c => c.codigo === codigoCotizacionEnEdicion.value);
            if (index !== -1) {
                cotizacionesRealizadas.value[index] = cotizacionActualizada;
            }
        } else {
            cotizacionesRealizadas.value.push(cotizacionActualizada);
        }

        closeModal();
        limpiarFormulario();
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

    const mostrarVistaPrevia = (cotizacion, modo = 'ver') => {
        if (modo === 'editar') {
            codigoCotizacionEnEdicion.value = cotizacion.codigo;
            clienteNombre.value = cotizacion.cliente.nombre;
            clienteTelefono.value = cotizacion.cliente.telefono;
            clienteCorreo.value = cotizacion.cliente.correo;
            paquetesSeleccionados.value = cotizacion.servicios.paquetes || [];

            // Buscar coincidencia exacta entre llantas
            itemsSelected.value = cotizacion.llantasSelecionadas.map((llanta, index) => {
                const nombreCompleto = (llanta.marca + ' ' + llanta.modelo).toLowerCase().trim();
                const coincidencia = items.value.find(item =>
                    item.fila1.toLowerCase().trim() === nombreCompleto &&
                    item.fila2.toLowerCase().trim() === llanta.medidas.toLowerCase().trim()
                );
                return coincidencia ? coincidencia : { ...llanta, id: index + 1000 };
            });

            // Asignar cantidades correctas
            cantidadesPorLlanta.value = {};

            cotizacion.llantasSelecionadas.forEach(llanta => {
                const id = items.value.find(i => {
                    const nombreCompleto = i.fila1.toLowerCase().trim();
                    const modeloCompleto = (llanta.marca + ' ' + llanta.modelo).toLowerCase().trim();
                    return nombreCompleto === modeloCompleto && i.fila2 === llanta.medidas;
                })?.id;

                if (id !== undefined) {
                    cantidadesPorLlanta.value[id] = llanta.cantidad;
                    preciosLlantas[id] = llanta.precioUnitario;
                }
            });

            serviciosExtras.value = cotizacion.serviciosAdicionales.map(s => ({
                nombre: s.nombreServicio,
                precio: s.precioUnitario,
                cantidad: s.Cantidad
            }));

            mostrarTotalEnVista.value = cotizacion.mostrarTotal ?? true;

            openModal();
        } else {
            vistaCotizacion.value = cotizacion;
            mostrarVista.value = true; 
        }
    };


    const pdfContent = ref(null);

    const generarPDF = () => {
        const element = pdfContent.value;
        html2pdf().from(element).set({
            margin: 1,
            filename: 'cotizacion.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).save();
    };

    const subtotalPaquete = computed(() => {
        return paquetesSeleccionados.value.reduce((sum, p) => sum + p.precio, 0);
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



    const catalogoClientes ={
        "Juan Pérez":{
            nombre: "Juan Perez",
            telefono: "477-128-5555",
            correo: "ejemplpo@correo.com"
        },
        "María Gómez": {
            nombre: "María Gómez",
            telefono: "477-765-4321",
            correo: "maria@mail.com"
        }
    }


    // observar si clienteExistente a cambiado de valor 
    watch(clienteExistente, (nuevo) => {
        if (catalogoClientes[nuevo]) {
            const c = catalogoClientes[nuevo];
            clienteNombre.value = c.nombre;
            clienteTelefono.value = c.telefono;
            clienteCorreo.value = c.correo;
        } else {
            // Limpiar si no hay coincidencia
            clienteNombre.value = '';
            clienteTelefono.value = '';
            clienteCorreo.value = '';
        }
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