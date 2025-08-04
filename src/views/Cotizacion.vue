<template>
    <div class="container-fluid mp-4 p-4">
        <div class="row mx-4">
            <h2>Cotizaciones</h2>
        </div>
        <div class="row mt-4 mx-4">
            
            <div class="col d-flex align-items-center">
                <input
                    class="form-control"
                    placeholder="Buscar por código, cliente, fecha..."
                    v-model="busquedaCotizaciones"
                />
            </div>

            <div class="col d-flex align-items-center">
                <label for="select" class="form-label m-2">Estatus: </label>
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
        <div class="row mx-4">
            <table class="table table-hover table-sm">
                <caption><strong>Lista de cotizaciones</strong></caption>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <!-- <th>Paquete</th> -->
                        <!-- <th>Total</th> -->
                        <th>Llanta</th>
                        <th>Estatus</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in cotizacionesTransformadas" :key="item.codigo">
                        <td>{{ item.codigo }} </td>
                        <td>{{ item.fechaCreacion }}</td>
                        <td>{{ item.cliente }}</td>
                        <td>{{ item.telefono }}</td>
                        <!-- <td>{{ item.paquete }}</td> -->
                        <!-- <td>{{ item.total }}</td> -->
                        <td>{{ item.nombreLlanta }}</td>
                        <td>{{ item.estatus }}</td>
                        <td>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-info" @click="mostrarVistaPrevia(item.acciones, 'ver')" title="Ver">
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button v-if="item.estatus != 'Realizada'" class="btn btn-sm btn-outline-warning" @click="abrirModalCotizacion(item.acciones)" title="Editar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button
                                    v-if="item.estatus != 'Cancelada'"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="cancelarCotizacion(item.acciones)"
                                    title="Cancelar"
                                >
                                    <i class="bi bi-x-circle"></i>
                                </button>

                                <button
                                    v-if="item.estatus === 'Cancelada'"
                                    class="btn btn-sm btn-outline-success"
                                    @click="reactivarCotizacion(item.acciones)"
                                    title="Reactivar"
                                >
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>

                                <button
                                    v-if="item.estatus === 'Creada'"
                                    class="btn btn-sm btn-outline-primary"
                                    @click="aprobarCotizacion(item.acciones)"
                                    title="Aprobar"
                                >
                                    <i class="bi bi-check-circle"></i>
                                </button>

                                <button
                                    v-if="item.estatus === 'Aprobada'"
                                    class="btn btn-sm btn-outline-secondary"
                                    @click="finalizarCotizacion(item.acciones)"
                                    title="Finalizar"
                                >
                                    <i class="bi bi-flag"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
         
        <!-- MODAL PARA SCREENSHOT Y DESCARGA DE PDF -->
        <div v-if="mostrarVista" class="modal fade show d-block" tabindex="-1" :style="{ background: 'rgba(0,0,0,0.5)' }">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content p-4">
                    <div class="modal-header">
                        <h4 class="modal-title">Vista Previa de Cotización</h4>
                        <button type="button" class="btn-close" @click="mostrarVista = false"></button>
                    </div>
                    <div ref="pdfContent" class="modal-body bg-white p-4" :style="{ fontSize: '14px' }">
                        <!-- Encabezado con direcciones y logo -->
                        <div class="row my-3">
                            <div class="col">
                                <img class="float-start" src="/images/Logo-Kartisimo.png" alt="Logo" :style="{ maxWidth: '250px' }" />
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
                            <div class="col">
                                <strong><small>Blvd. Mariano Escobedo Pte. 2715</small></strong><br>
                                <small>La Martinica, C.P. 37500</small><br>
                                <small>Tel. 477 763 3285</small>
                            </div>
                        </div>

                        <!-- Información del cliente -->
                        <div class="mb-4" v-if="vistaCotizacion.cliente.nombre">
                            <span class="mx-2"><strong>Fecha emisión: </strong> {{ vistaCotizacion.fechaCreacion }} </span>
                            <span class="mx-2"><strong>No. Cotización: </strong> {{ vistaCotizacion.codigo }} </span>
                            <span class="mx-2"><strong>Cliente:</strong> {{ vistaCotizacion.cliente.nombre }}</span>
                            <span class="mx-2"><strong>Teléfono:</strong> {{ vistaCotizacion.cliente.telefono }}</span>
                        </div>

                        <div class="mt-4">
                            <table class="table table-bordered table-sm">
                                <thead class="table-light">
                                    <tr>                                        
                                        <th>CANT</th>
                                        <th>MEDIDA - MARCA - MODELO - RANGO</th>
                                        <th>PRECIO UNITARIO</th>
                                        <th>TOTAL</th>
                                    </tr>
                                    </thead>
                                <tbody>
                                    <tr>
                                        <td class="text-center" colspan="5" >LLANTAS</td>
                                    </tr>
                                    <!-- Llantas -->
                                    <tr v-for="(llanta, i) in vistaCotizacion.llantasSelecionadas" :key="'ll-' + i">
                                        <td class="text-center">{{ llanta.cantidad }}</td>
                                        <td>
                                            {{ llanta.medidas }}
                                            <!-- <span
                                                v-if="llanta.ubicacion != 'Kartisimo' || llanta.ubicacion != 'Martinica'"
                                                class="badge bg-warning text-dark ms-2"
                                            >
                                                Sobre pedido
                                            </span> -->
                                        </td>
                                        <td class="text-end">
                                            {{ llanta.precioUnitario.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}
                                        </td>
                                        <td class="text-end">
                                            {{ (llanta.total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}
                                        </td>

                                    </tr>
                                    <tr>
                                        <td class="text-center" colspan="5">PAQUETE</td>
                                    </tr>
                                    <!-- Paquetes seleccionados -->
                                    <tr
                                        v-for="(paquete, i) in vistaCotizacion.paquetes"
                                        :key="'paq-' + i"
                                    >
                                        <td class="text-center">1</td>
                                        <td>{{ paquete.nombre.toUpperCase() }}, {{paquete.descripcion.toUpperCase()}}</td>
                                        <td class="text-end">{{ (paquete.precio).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                                        <td class="text-end">{{ (paquete.precio).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                                    </tr>                                   
                                    <tr>
                                        <td class="text-center" colspan="5">SERVICIOS EXTRAS</td>
                                    </tr>
                                    <!-- Servicios adicionales -->
                                    <tr
                                        v-for="(servicio, i) in vistaCotizacion.serviciosAdicionales"
                                        :key="'serv-' + i"
                                    >
                                        <td class="text-center">{{ servicio.cantidad }}</td>
                                        <td>{{ servicio.nombreServicio }} {{ servicio.observacion }}</td>
                                        <td class="text-end">{{ servicio.precioUnitario.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                                        <td class="text-end">{{ (servicio.precioUnitario * servicio.cantidad).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                                    </tr>

                                    <!-- Total -->
                                    <tr v-if="vistaCotizacion.mostrarTotal" class="fw-bold">
                                        <td colspan="3" class="text-center">Total:</td>
                                        <td>{{ vistaCotizacion.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) }}</td>
                                    </tr>

                                </tbody>
                            </table>
                            <p class="mt-2 fst-italic text-end">Los precios incluyen IVA</p>
                        </div>
                        
                        <div class="row text-center">
                            <div class="col">
                                <!-- Botón PDF -->
                                <div class="mt-4">
                                    <button class="btn btn-outline-danger w-100">Enviar por correo</button>
                                </div>
                            </div>
                            <div class="col">
                                <!-- Botón PDF -->
                                <div class="mt-4">
                                    <button class="btn btn-outline-primary w-100">Imprimir</button>
                                </div>
                            </div>
                            <div class="col">
                                <!-- Botón PDF -->
                                <div class="mt-4">
                                    <button class="btn btn-outline-secondary w-100" @click="generarPDF">Descargar PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- MODAL PARA CRREAR/EDITAR COTIZACION -->
        <div class="modal fade" ref="modalRef" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-scrollable modal-lg">
                <div class="modal-content" :style="{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }">
                
                    <div class="modal-header">
                        <div class="row modal-title align-items-center text-center">
                            <h3>Nueva cotizacion</h3>
                        </div>
                        <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body" :style="{ overflowY: 'auto' }">                                                  
                        <!-- Seccion informacion cliente -->
                        <div class="row m-2">
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
                        <!-- Seccion seleccion de llantas -->
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
                                <div style="max-height: 400px; overflow-y: auto;">
                                    <EasyDataTable
                                        :headers="tblHeadersModal"
                                        :items="itemsFiltrados"
                                        :rows-per-page="25"
                                        show-index
                                    >
                                        <!-- TEMPLATE PARA ADAPTAR LA INFORMACION A LA ORGANIZACION medida - marca - modelo - rango -->
                                        <template #item-medida="slotProps">
                                            {{ slotProps.medida }} {{ slotProps.rango }}
                                        </template>
                                        <template #item-acciones="slotProps">
                                            <button
                                                v-if="!cotizacionForm.llantas.some(ll => ll.idLlanta === slotProps.id)"
                                                type="button"
                                                class="btn btn-success btn-sm d-flex align-items-center gap-1"
                                                @click="agregarLlanta(slotProps)"
                                                :title="cotizacionForm.llantas.some(ll => ll.idLlanta === slotProps.id) ? 'Llanta ya agregada' : 'Agregar llanta'"
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
                            <div class="d-flex gap-3 mb-3">
                                <div class="col-3">
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
                                <div class="col-3">
                                    <input 
                                        class="form-control" 
                                        placeholder="Observaciones" 
                                        v-model="nuevaObservacion"
                                    />
                                </div>
                                <div class="col-3">                                    
                                    <input 
                                        class="form-control" 
                                        type="number" 
                                        min="0" 
                                        placeholder="Precio unitario" 
                                        v-model="nuevoPrecio" 
                                    />
                                </div>
                                <button class="btn btn-success" @click="agregarServicioExtra">
                                    Agregar
                                </button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col border ">
                                <div class="row  justify-content-center">
                                    <div class="col-12 p-4 rounded-3">
                                        <div class="row mb-3 d-flex">
                                            <div class="col text-start">
                                                <img src="/images/Logo-Kartisimo.png" alt="Logo" :style="{ maxWidth: '250px' }" />                                
                                            </div>
                                        </div>
                                        <div class="row my-3 d-flex justify-content-between">
                                            <div class="col">
                                                <small><strong>Blvd. Delta 2002 esq. Rio Mayo</strong></small><br>
                                                <small>Col. Valle de Jerez C.P. 37538</small><br>
                                                <small>Tel. 477 330 6060 y 477 390 5090</small><br>
                                                <small>delta@kartisimo.mx</small><br>
                                            </div>
                                            <div class="col">
                                                <small><strong>Blvd. Lopez Mateos 827 esq. Apolo</strong></small><br>
                                                <small>Col. Obrera C.P. 37340</small><br>
                                                <small>Tel. 477 717 7440 y 477 470 9419</small><br>
                                                <small>apolo@kartisimo.mx</small><br>
                                            </div>
                                            <div class="col">
                                                <small><strong>Blvd. Torres Landa 1901 esq San Jacobo</strong></small><br>
                                                <small>Col. La Pisina C.P. 37440</small><br>
                                                <small>Tel. 477 390 0290 y 477 461 0028</small><br>
                                                <small>torreslanda@kartisimo.mx</small><br>
                                            </div>
                                            <div class="col">
                                                <small><strong>Blvd. Mariano Escobedo Pte. 2715</strong></small><br>
                                                <small>La Martinica, C.P. 37500</small><br>
                                                <small>Tel. 477 763 3285</small>                                                
                                            </div>
                                        </div>

                                        <div class="mb-2 d-flex">
                                            <p class="mx-2"><strong>Cliente: </strong>{{ cotizacionForm.clienteNombre || '---' }}</p>
                                            <p class="mx-2"><strong>Teléfono: </strong>{{ cotizacionForm.clienteTelefono || '---' }}</p>
                                        </div>

                                        <table class="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>MEDIDA - MARCA - MODELO - RANGO</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio Unitario</th>
                                                    <th style="width: 120px; text-align: right;">Total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- Llantas -->
                                                <tr v-for="item in cotizacionForm.llantas" :key="'llanta-' + item.id">
                                                    
                                                    <td>
                                                        {{ item.modeloMedidas }}
                                                        <span v-if="item.ubicacion != 'Kartisimo' || item.ubicacion != 'Martinica'" class="badge bg-warning text-dark ms-2">Sobre pedido</span>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            class="form-control"
                                                            :style="{ width: '70px' }"
                                                            v-model.number="item.cantidad"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            min="0"
                                                            class="form-control"
                                                            :style="{ width: '90px' }"
                                                            v-model.number="item.precioUnitario"
                                                            placeholder="Precio c/u"
                                                        />
                                                    </td>
                                                    <td style="width: 120px; text-align: right;">
                                                        {{ formatoMoneda((item.precioUnitario || 0) * (item.cantidad ?? 4)) }}
                                                    </td>
                                                    <td>
                                                        <button
                                                            class="btn btn-sm btn-outline-danger"
                                                            @click="eliminarLlanta(item.idLlanta)"
                                                            title="Eliminar llanta"
                                                        >
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <!-- Paquetes -->
                                                <tr v-for="(p, index) in cotizacionForm.paquetes" :key="'paquete-' + index">
                                                    <td>{{ p.nombre.toUpperCase() }}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            class="form-control"
                                                            :style="{ width: '70px' }"
                                                            :value="1"
                                                            disabled
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            min="0"
                                                            class="form-control"
                                                            :style="{ width: '90px' }"
                                                            v-model.number="p.precioUnitario"
                                                            placeholder="Precio"
                                                        />
                                                    </td>
                                                    <td style="width: 120px; text-align: right;">
                                                        {{ formatoMoneda(p.precioUnitario || 0) }}
                                                    </td>
                                                    <td>
                                                        <button
                                                            class="btn btn-sm btn-outline-danger"
                                                            @click="eliminarPaquete(p.idPaquete)"
                                                            title="Eliminar paquete"
                                                        >
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <!-- Servicios adicionales -->
                                                <tr v-for="(extra, i) in cotizacionForm.serviciosExtras" :key="'servicio-' + i">
                                                    <td>{{ extra.nombre }} {{ extra.observacion }}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            class="form-control"
                                                            :style="{ width: '70px' }"
                                                            v-model.number="extra.cantidad"
                                                            placeholder="1"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            min="0"
                                                            class="form-control"
                                                            :style="{ width: '90px' }"
                                                            v-model.number="extra.precioUnitario"
                                                            placeholder="Precio c/u"
                                                        />
                                                    </td>
                                                    <td style="width: 120px; text-align: right;">
                                                        {{ formatoMoneda(extra.precioUnitario * (extra.cantidad || 1)) }}
                                                    </td>
                                                    <td>
                                                        <button
                                                            class="btn btn-sm btn-outline-danger"
                                                            @click="eliminarServicioExtra(extra.idDetalleCotizacionServicio ?? i)"
                                                            title="Eliminar servicio"
                                                        >
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr v-if="mostrarTotalEnVista">
                                                    <td colspan="4" class="text-end fs-5 fw-bold">Total</td>
                                                    <td colspan="2" class="fs-5 fw-bold">{{ formatoMoneda(totalCotizacion) }}</td>
                                                </tr>
                                            </tfoot>
                                        </table>                                        
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
    import html2pdf from 'html2pdf.js'; //TODO: eliminar esta libreria del proyecto

    const { proxy } = getCurrentInstance()    
    const modalRef = ref(null);
    let modalInstance = null;
    const paquetesDisponibles = ref([]);
    const clientesDisponibles = ref([]);
    const items = ref([]);
    const nuevoServicio = ref('');
    const nuevoPrecio = ref('');
    const nuevaCantidad = ref(1);
    const nuevaObservacion = ref('');
    const busquedaLlantas = ref('');
    const busquedaCotizaciones = ref('');
    const cotizacionesRealizadas = ref([]);
    const vistaCotizacion = ref({});
    const mostrarVista = ref(false);
    const mostrarTotalEnVista = ref(false); // TODO: correjir este apartado o buscar otra forma de implementarlo
    const codigoCotizacionEnEdicion = ref(null); // null = creación nueva
    const filtroEstatus = ref('');

    const itemsSelected = ref([]);
    const paquetesSeleccionados = ref([]);

    const cotizacionForm = reactive({
        codigo: '',                   // ← Para saber si es edición
        clienteNombre: '',
        clienteTelefono: '',
        clienteCorreo: '',
        clienteExistente: '',
        paquetes: [],
        paquetesDetalles: {},
        llantas: [],
        serviciosExtras: [],
        mostrarTotal: false,
        fechaCreacion: ''
    });

    const preciosLlantas = reactive({});


    /***********************************
     *  FUNCIONES PARA TABLA COTIZACION
    ***********************************/

    const cancelarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 4, // se puede obtimizar mas los estatus y usar una sola funcion para las 4 operaciones
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
    
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(async res => {
            if (!res.ok) {
                let errorText = await res.text();
                throw new Error(`Error HTTP ${res.status}: ${errorText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Cotización actualizada:", data);
            cargarCotizaciones();
        })
        .catch(error => {
            // Aquí capturas cualquier error de la API o de red
            console.error("Error en la petición:", error.message);
        });
    };

    const reactivarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 1,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(async res => {
            if (!res.ok) {
                let errorText = await res.text();
                throw new Error(`Error HTTP ${res.status}: ${errorText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Cotización actualizada:", data);
            cargarCotizaciones();
        })
        .catch(error => {
            // Aquí capturas cualquier error de la API o de red
            console.error("Error en la petición:", error.message);
        });
    };

    const aprobarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 2,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(async res => {
            if (!res.ok) {
                let errorText = await res.text();
                throw new Error(`Error HTTP ${res.status}: ${errorText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Cotización actualizada:", data);
            cargarCotizaciones();
        })
        .catch(error => {
            // Aquí capturas cualquier error de la API o de red
            console.error("Error en la petición:", error.message);
        });
    };

    const finalizarCotizacion = (cotizacion) => {
        
        const json = {
            idCotizacion: parseInt(cotizacion.codigo.replace('COT-', ''), 10),
            idEstadoCotizacion: 3,
            idUsuario: 1 //TODO: cambiar por el usercurrent, falta desarrollar los usuarios
        }
        fetch(`${proxy.$serverIP}api/Cotizacion/editarEstado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(async res => {
            if (!res.ok) {
                let errorText = await res.text();
                throw new Error(`Error HTTP ${res.status}: ${errorText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Cotización actualizada:", data);
            cargarCotizaciones();
        })
        .catch(error => {
            // Aquí capturas cualquier error de la API o de red
            console.error("Error en la petición:", error.message);
        });
    };

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
            
            // Limpia precios anteriores
            Object.keys(preciosLlantas).forEach(key => delete preciosLlantas[key]);
            const llantaArray = []
            data.map(llanta => {
                const nombreCompleto = `${llanta.nombreMarca} ${llanta.modelo}`.trim();
                const sobrePedido = llanta.nombreAlmacen.toLowerCase().includes('proveedor');
                preciosLlantas[llanta.idLlanta] = parseFloat(llanta.precio);

                const obj = {
                    id: llanta.idLlanta,
                    codigo: llanta.codigo,
                    llanta: nombreCompleto,
                    medida: llanta.medidas,
                    rango: llanta.rango, // campo para colocar en cotizacionForm como el cliente la solicita medida - marca - modelo - rango
                    cantidad: llanta.cantidad,
                    ubicacion: llanta.nombreAlmacen,
                    precio: parseFloat(llanta.precio) || 0,
                    sobrePedido,
                };

                llantaArray.push(obj);
            });
            items.value = llantaArray
            return items
            
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
                fechaCreacion: new Date(c.fechaCreacion).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                cliente: {
                    nombre: c.clienteNombre,
                    telefono: c.telefono,
                    correo: c.correo
                },
                paquetes: c.nombresPaquetes === 'Ninguno' ? [] : c.nombresPaquetes.split(', ').map(nombre => ({ nombre })),
                llantasSelecionadas: [],
                serviciosAdicionales: [],
                total: c.total,
                estatus: c.estado,
                nombreLlanta: c.nombreLlanta,
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

    /*********************************************
        FUNCIONES PARA MODAL CREACION/EDICION
    **********************************************/
    
    // Elimina paquete del arreglo
    const eliminarPaquete = (idPaquete) => {
        // Elimina el paquete del arreglo
        cotizacionForm.paquetes = cotizacionForm.paquetes.filter(p => p.idPaquete !== idPaquete);

        // Limpia el detalle asociado (si existe)
        if (cotizacionForm.paquetesDetalles && cotizacionForm.paquetesDetalles[idPaquete]) {
            delete cotizacionForm.paquetesDetalles[idPaquete];
        }
    };

    // Paquetes
    // Relaciona el objeto de los checkbox con el objeto que se guarda/edita, eliminando o agregando a cotizacion
    watch(() => cotizacionForm.paquetes, (nuevosSeleccionados) => {
        
        const actuales = nuevosSeleccionados.map(p => p.idPaquete);

        // Elimina de paquetesDetalles los que ya no estén seleccionados
        Object.keys(cotizacionForm.paquetesDetalles).forEach(idPaquete => {
            if (!actuales.includes(Number(idPaquete))) {
                delete cotizacionForm.paquetesDetalles[idPaquete];
            }
        });
    });

    // Paquetes: colocarlo por default cuando de carge el componente
    // Si no hay paquete seleccionado y ya se cargaron los paquetes, pon el primero como default
    watch(paquetesDisponibles, (nuevoValor) => {
            // Solo aplica si es una nueva cotización (no edición)
            if (!cotizacionForm.codigo && nuevoValor.length && cotizacionForm.paquetes.length === 0) {
                cotizacionForm.paquetes = [nuevoValor[0]];
            }
        },
        { immediate: true }
    );

    // Agrega Servicio Adicionales al arreglo CotizacionesForm
    const agregarServicioExtra = () => {
        if (nuevoServicio.value && nuevoPrecio.value && nuevaObservacion.value && nuevaCantidad.value > 0) {
            cotizacionForm.serviciosExtras.push({
                idDetalleCotizacionServicio: null,
                nombre: (nuevoServicio.value).toUpperCase(),
                observacion: (nuevaObservacion.value).toUpperCase(),
                cantidad: parseInt(nuevaCantidad.value),
                precioUnitario: parseFloat(nuevoPrecio.value)
            });
            nuevoServicio.value = '';
            nuevoPrecio.value = '';
            nuevaCantidad.value = 1;
            nuevaObservacion.value = '';
        }
    };

    // Elimina ServicioAdicional del arreglo
    const eliminarServicioExtra = (id) => {
        // Si el idDetalleCotizacionServicio es nulo, usa el índice (i) como respaldo
        cotizacionForm.serviciosExtras = cotizacionForm.serviciosExtras.filter(
            (s, i) => (s.idDetalleCotizacionServicio ?? i) !== id
        );
    };

    // Elimina la llanta del arreglo
    // Opcional: elimina también su cantidad para limpiar el objeto
    const eliminarLlanta = (idLlanta) => {
        cotizacionForm.llantas = cotizacionForm.llantas.filter(ll => ll.idLlanta !== idLlanta);
    };

    // Agrega la llanta al arreglo
    const agregarLlanta = (item) => {
        if (cotizacionForm.llantas.length >= 6) {
            alert('Solo puedes agregar hasta 6 llantas diferentes por cotización.');
            return;
        }
        const yaExiste = cotizacionForm.llantas.some(ll => ll.idLlanta === item.id);
        if (!yaExiste) {
            cotizacionForm.llantas.push({
                idDetalleCotizacionLlanta: null,
                idLlanta: item.id,
                cantidad: 4, // o el campo que manejes
                precioUnitario: item.precio || 0,
                modeloMedidas: item.medida + ' ' +item.llanta+ ' ' + item.rango,
                ubicacion: item.ubicacion, 
            });
            
            //console.log('agregarLlanta: '+ JSON.stringify(cotizacionForm.llantas))
        }
        else
        {
            console.log("agregarLLanta: ya existe esa llanta")    
        }
    }

    // carga de informacion y limpia la informacion, modal creacion/edicion
    const cargarFormulario = async (cotizacion = null) => {
        if (!cotizacion) {
            // Si no hay cotización, limpiamos
            Object.assign(cotizacionForm, {
                codigo: '',
                clienteNombre: '',
                clienteTelefono: '',
                clienteCorreo: '',
                clienteExistente: '',
                paquetes: paquetesDisponibles.value.length ? [paquetesDisponibles.value[0]] : [],
                paquetesDetalles: {},
                llantas: [],
                paquetesDetalles: {},
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

            // PAQUETES
            cotizacionForm.paquetes = data.paquetes
            .map(p => {
                const base = paquetesDisponibles.value.find(q => q.idPaquete === p.idPaquete);
                if (!base) return null;
                return {
                    ...base,
                    precioUnitario: p.precioUnitario   
                };
            })
            .filter(Boolean);

            data.paquetes.forEach(p => {
                cotizacionForm.paquetesDetalles[p.idPaquete] = p.idDetalleCotizacionPaquete;
            });
            //console.log('cargarFormulario: ' + JSON.stringify(cotizacionForm.paquetes))

            // LLANTAS
            cotizacionForm.llantas = data.llantas.map(ll => ({
                ...ll
            }));
            //console.log('cargarFormulario: ' + JSON.stringify(cotizacionForm.llantas))


            data.llantas.forEach(ll => {
                preciosLlantas[ll.idLlanta] = parseFloat(ll.precioUnitario);
            });

            // SERVICIOS EXTRAS
            cotizacionForm.serviciosExtras = data.servicios.map(s => ({
                idDetalleCotizacionServicio: s.idDetalleCotizacionServicio,
                nombre: s.descripcion,
                observacion: s.observacion,
                cantidad: s.cantidad,
                precioUnitario: s.precioUnitario
            }));
            //console.log('cargarFromulario: ServiciosAdicionales '+JSON.stringify(cotizacionForm.serviciosExtras))

            cotizacionForm.mostrarTotal = mostrarTotalEnVista.value;

        } catch (e) {
            console.error('Error cargando cotización para edición:', e);
            alert('No se pudo cargar la cotización');
        }
    };

    // CREAR/EDITAR COTIZACIONES
    const guardarCotizacion = async () => {

        const rawId = cotizacionForm.codigo
        ? Number(cotizacionForm.codigo.replace(/^COT-/, ''))
        : null; // null para nueva

        // Determina el cliente
        let cliente = null;
        if (cotizacionForm.clienteExistente) {
            cliente = clientesDisponibles.value.find(c => c.nombres === cotizacionForm.clienteExistente);
        }

        // Mapear llantas al formato esperado
        const llantas = cotizacionForm.llantas.map(ll => ({
            idDetalleCotizacionLlanta: ll.idDetalleCotizacionLlanta || null, // null si nuevo
            idLlanta: ll.idLlanta,
            cantidad: ll.cantidad,
            precioUnitario: ll.precioUnitario//preciosLlantas[item.idLlanta]
        }));

        // Paquetes
        const paquetes = cotizacionForm.paquetes.map(p => ({
            idDetalleCotizacionPaquete: cotizacionForm.paquetesDetalles[p.idPaquete] || null,
            idPaquete: p.idPaquete,
            cantidad: p.cantidad ?? 1, // o el valor que requieras
            precioUnitario: p.precioUnitario
        }));
        //console.log('GuardarCotizacion: Paquetes' + JSON.stringify(paquetes) + JSON.stringify(cotizacionForm.paquetes))

        // Servicios
        const serviciosAdicionales = cotizacionForm.serviciosExtras.map(s => ({
            idDetalleCotizacionServicio: s.idDetalleCotizacionServicio || null,
            descripcionServicio: s.nombre,
            observacion: s.observacion,
            cantidad: s.cantidad,
            precioUnitario: s.precioUnitario
        }));
        //console.log('GuardarCotizacion: ServiciosAdicionales'+ JSON.stringify(serviciosAdicionales) + JSON.stringify(cotizacionForm.serviciosExtras))

        cliente = cliente ? {
            idCliente: cliente.idCliente,
            nombre: cliente.nombres + ' ' + cliente.apPaterno + ' ' + cliente.apMaterno,
            telefono: cliente.telefono,
            correo: cliente.correo
        } : {
            idCliente: null,
            nombre: cotizacionForm.clienteNombre,
            telefono: cotizacionForm.clienteTelefono,
            correo: cotizacionForm.clienteCorreo
        }
        
        const nuevaCotizacion = {
            codigo: rawId,
            mostrarTotal: cotizacionForm.mostrarTotal,
            total: totalCotizacion.value,
            creadoPor: 1,
            cliente,
            llantas,
            paquetes,
            serviciosAdicionales,
        }


        // Decide si POST o PUT
        const url = cotizacionForm.codigo
            ? `${proxy.$serverIP}api/Cotizacion/editarCotizacion`
            : `${proxy.$serverIP}api/Cotizacion/crearCotizacion`;

        await fetch(url, {
            method: cotizacionForm.codigo ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCotizacion)
        })
        .then(res => res.json())
        .then(data => {
            const obj ={
                codigo: data.codigo.toString()
            }
            //console.log("Cotización guardada:", obj);
            cargarFormulario();   // Limpia formulario
            closeModal();         // Cierra modal
            cargarCotizaciones(); // Actualiza la info de la tabla cotizaciones
            mostrarVistaPrevia(obj, 'ver');
        });
        //console.log('guardarCotizacion: '+JSON.stringify(nuevaCotizacion))
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

    
    // Filtra variable itms en modal creacion filtra si se escribe con o sin espacio
    const itemsFiltrados = computed(() => {
        if (!busquedaLlantas.value) return items.value;

        const busquedaOriginal = busquedaLlantas.value.toLowerCase();

        // Dividimos por espacios, guiones, slashes (y quitamos vacíos)
        const palabrasClave = busquedaOriginal
            .split(/[\s\/\-]+/)
            .filter(p => p.length > 0);

        // Búsqueda todo junto sin símbolos ni espacios
        const busquedaUnida = busquedaOriginal.replace(/[^a-z0-9]/gi, '');

        return items.value.filter(item => {
            // Unimos todos los campos del item
            const textoItem = `
            ${item.codigo}
            ${item.llanta}
            ${item.medida}
            ${item.rango}
            ${item.ubicacion}
            `.toLowerCase();

            const textoUnido = textoItem.replace(/[^a-z0-9]/gi, '');

            // Coincidencia parcial: basta que cada palabra esté parcialmente incluida
            const coincidePorPalabras = palabrasClave.every(palabra =>
            textoItem.includes(palabra)
            );

            // Coincidencia parcial por texto completo unido (para búsquedas todo junto)
            const coincideTodoJunto = textoUnido.includes(busquedaUnida);

            return coincidePorPalabras || coincideTodoJunto;
        });
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
        cargarFormulario();
    };

    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(valor);
    };

    const abrirModalCotizacion = (cotizacion = null) => {
        //console.log(cotizacion)
        cargarFormulario(cotizacion);
        openModal();
    };


    const tblHeadersModal = [
        { text:"Llanta", value: "llanta", sortable: true},
        { text:"Codigo", value: "codigo"},
        { text:"Medidas", value: "medida", sortable: true},
        { text:"Cantidad", value: "cantidad", sortable: true},
        { text:"Ubicación", value: "ubicacion"},
        { text:"Precio", value: "precio", sortable: true},        
        { text:"Acciones", value: "acciones", width: 50 }
    ]


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
                    c.nombreLlanta, 
                    ...(c.paquetes?.map(p => p.nombre) || [])
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
                nombreLlanta: c.nombreLlanta || '—',
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

    

    /*********************************************
        FUNCIONES PARA MODAL SCREENSHOT Y PDF
    **********************************************/
    // Vista Final para el Cliente
    const mostrarVistaPrevia = async (cotizacion, modo = 'ver') => {
        if (modo === 'ver') {
            try {
                const res = await fetch(`${proxy.$serverIP}api/Cotizacion/getDetalleCotizacion?id=${cotizacion.codigo.replace('COT-', '')}`);
                const data = await res.json();

                //console.log(JSON.stringify(data));
                vistaCotizacion.value = {
                    codigo: 'COT-' + data.idCotizacion,
                    fechaCreacion: new Date(data.fechaCreacion).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
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
                        ubicacion: llanta.ubicacion, 
                        cantidad: llanta.cantidad,
                        precioUnitario: llanta.precioUnitario,
                        total: (llanta.precioUnitario * llanta.cantidad)
                    })),
                    paquetes: data.paquetes.map(p => ({
                        idPaquete: p.idPaquete,
                        nombre: p.nombre,
                        precio: p.precioUnitario,
                        total: p.precioUnitario,
                        descripcion: p.descripcion
                    })),
                    serviciosAdicionales: data.servicios.map(s => ({
                        nombreServicio: s.descripcion,
                        observacion: s.observacion,
                        cantidad: s.cantidad,
                        precioUnitario: s.precioUnitario,
                        total: (s.precioUnitario * s.cantidad)
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

    // GENERAR PDF

    const logoBase64 = ref(null);

    const loadLogoBase64 = async () => {
        if (logoBase64.value) return logoBase64.value;
        const response = await fetch('/images/Logo-Kartisimo.png');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
            logoBase64.value = reader.result;
            resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    };

    const generarPDF = async () => {
        const pdfMakeModule = await import("pdfmake/build/pdfmake");
        const pdfFonts = await import("pdfmake/build/vfs_fonts");
        const pdfMake = pdfMakeModule.default;
        pdfMake.vfs = pdfFonts.pdfMake.vfs;

        const logo = await loadLogoBase64();
        const v = vistaCotizacion.value;

        // Arma las filas para la tabla, primero llantas, luego paquetes, luego servicios
        const llantasRows = v.llantasSelecionadas.map(ll => [
            { text: String(ll.cantidad), alignment: 'center', fontSize: 11 },
            { text: `${ll.medidas}`, fontSize: 11 },
            { text: `$${ll.precioUnitario?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, alignment: 'right', fontSize: 11 },
            { text: `$${ll.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, alignment: 'right', fontSize: 11 }
        ]);

        const paquetesRows = v.paquetes.map(p => [
            { text: '1', alignment: 'center', fontSize: 11 },
            { text: p.nombre, italics: true, fontSize: 11 },
            { text: `$${p.precio?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, alignment: 'right', fontSize: 11 },
            { text: `$${p.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, alignment: 'right', fontSize: 11 }
        ]);

        const serviciosRows = v.serviciosAdicionales.map(s => [
            { text: String(s.cantidad), alignment: 'center', fontSize: 11 },
            { text: s.nombreServicio, italics: true, fontSize: 11 },
            { text: `$${s.precioUnitario?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, alignment: 'right', fontSize: 11 },
            { text: `$${s.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, alignment: 'right', fontSize: 11 }
        ]);

        // Definición del PDF
        const docDefinition = {
            pageMargins: [40, 40, 40, 60],
            content: [
                // Logo y encabezado
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { image: logo, width: 130, margin: [0, 0, 0, 10] }
                            ]
                        },
                        {
                            width: 'auto',
                            stack: [
                                { text: 'Kartisimo Bajio S.A. de C.V.', bold: true, fontSize: 14, alignment: 'right', margin: [0, 0, 0, 10] },
                            ]
                        }
                    ]
                },
                {
                    columns: [
                        [
                            { text: 'Blvd. Delta 2002 esq. Rio Mayo', bold: true, fontSize: 10 },
                            { text: 'Col. Valle de Jerez C.P 37538', fontSize: 9 },
                            { text: 'Tel. 477 330 6060 y 477 390 5090', fontSize: 9 },
                            { text: 'delta@kartisimo.mx', fontSize: 9 }
                        ],
                        [
                            { text: 'Blvd. Lopez Mateos 827 esq. Apolo', bold: true, fontSize: 10 },
                            { text: 'Col. Obrera C.P. 37340', fontSize: 9 },
                            { text: 'Tel. 477 717 7440 y 477 470 9419', fontSize: 9 },
                            { text: 'apolo@kartisimo.mx', fontSize: 9 }
                        ],
                        [
                            { text: 'Blvd. Torres Landa 1901 esq San Jacobo', bold: true, fontSize: 10 },
                            { text: 'Col. La Pisina C.P. 37440', fontSize: 9 },
                            { text: 'Tel. 477 390 0290 y 477 461 0028', fontSize: 9 },
                            { text: 'torreslanda@kartisimo.mx', fontSize: 9 }
                        ]
                    ],
                    columnGap: 20,
                    margin: [0, 0, 0, 18]
                },
                { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#888' } ], margin: [0, 8, 0, 8] },
                {
                    columns: [
                        { text: `No. Cotizacion: ${v.codigo || ''}`, fontSize: 11, margin: [0, 0, 10, 6], bold: true },
                        { text: `Cliente: ${v.cliente.nombre || ''}`, fontSize: 11, margin: [0, 0, 10, 6] },
                        { text: `Teléfono: ${v.cliente.telefono || ''}`, fontSize: 11, margin: [0, 0, 10, 6] },
                    ]
                },
                // Tabla principal 
                {
                    table: {
                        headerRows: 1,
                        widths: [ 40, '*', 90, 90 ],
                        body: [
                            [
                                { text: 'CANT', alignment: 'center', style: 'tableHeaderBorder'},
                                { text: 'MARCA - MODELO - MEDIDA' },
                                { text: 'PRECIO UNITARIO', style: 'tableHeaderBorder', alignment: 'center' },
                                { text: 'TOTAL', style: 'tableHeaderBorder', alignment: 'center' }
                            ],
                            ...llantasRows,
                            ...paquetesRows,
                            ...serviciosRows
                        ]
                    },
                    layout: {
                        fillColor: (rowIndex) => rowIndex === 0 ? '#ededed' : null,
                        hLineWidth: (i, node) => {
                            // Quita todas las líneas horizontales menos la del encabezado y las divisiones
                            if (i === 0 || i == 1 || i === node.table.body.length) return 1; // Header y bottom
                            // Puedes agregar condiciones aquí para las divisiones
                            return 0;
                        },
                        vLineWidth: (i, node) => 0,
                        // fillColor: (rowIndex) => rowIndex === 0 ? '#ededed' : null,
                        // hLineWidth: (i, node) => {
                        //     // Quita todas las líneas horizontales menos la del encabezado y las divisiones
                        //     if (i === 0 || i == 1 || i === node.table.body.length) return 1; // Header y bottom
                        //     // Puedes agregar condiciones aquí para las divisiones
                        //     return 0;
                        // },
                        // vLineWidth: (i, node) => 0,
                        // hLineColor: (i, node) => '#222',
                        // vLineColor: (i, node) => '#222',
                        // paddingLeft: (i, node) => 7,
                        // paddingRight: (i, node) => 7,
                        // paddingTop: (i, node) => 4,
                        // paddingBottom: (i, node) => 4
                    },
                    margin: [0, 12, 0, 0]
                },
                {
                    text: 'Los precios incluyen IVA',
                    style: 'notaIVA',
                    alignment: 'right',
                    margin: [0, 14, 0, 0]
                }
            ],
            styles: {
                tableHeaderBorder: {
                    bold: true,
                    fontSize: 11,
                    border: [true, true, true, true], // bordes en todas las direcciones
                    alignment: 'center'
                },
                notaIVA: {
                    italics: true,
                    fontSize: 10
                }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };



</script>