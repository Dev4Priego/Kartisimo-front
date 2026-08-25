<template>
    <div class="row">
        <div class="col-12">
            <TablaDatos
                title="Conceptos de trabajo"
                :headers="headers"
                :items="conceptos"
                :loading="loading"
                show-create
                create-label="Nuevo concepto"
                :actions="acciones"
                @create="nuevoConcepto"
                @action="handleTableAction"
                >

                <template #item-sysFechaEditado="{ item }">
                    <span class="text-nowrap">
                        {{ formatearFechaHora(item.sysFechaEditado) }}
                    </span>
                </template>

                <template #item-comision="{ item }">
                    <span class="d-block text-end me-2">
                        {{ item.comision ?? '(N/A)' }}
                    </span>
                </template>
            </TablaDatos>
        </div>
    </div>

    <div
        v-if="dialogoNuevo"
        class="modal fade show d-block"
        tabindex="-1"
        :style="{ background: 'rgba(0,0,0,0.5)' }"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-700">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">{{ editandoSucursal ? 'Editar sucursal' : 'Nueva sucursal' }}</h3>
                </div>
                <div class="modal-body p-4">
                    <div class="row align-items-end">
                        <div class="col-md-8">
                            <label class="form-label">Nombre *</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosSucursal.nombre"
                                minlength="3"
                                maxlength="150"
                                required
                            />
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Prefijo *</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosSucursal.prefijo"
                                minlength="0"
                                maxlength="10"
                                required
                            />
                        </div>
                        <div v-if="editandoSucursal" class="col-md-4 mt-2">
                            <label class="form-label">Consecutivo Cotización *</label>
                            <input 
                                type="number" 
                                class="form-control"
                                v-model="datosSucursal.consecutivoCotizacion"
                                required
                            />
                        </div>
                        <div v-if="editandoSucursal" class="col-md-4 mt-2">
                            <label class="form-label">Consecutivo OT *</label>
                            <input 
                                type="number" 
                                class="form-control"
                                v-model="datosSucursal.consecutivoOT"
                                required
                            />
                        </div>
                        <div v-if="editandoSucursal" class="col-md-4 mt-2 align-self-bottom">
                            <div class="form-check">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input"
                                    v-model="datosSucursal.activo"
                                    :true-value="1"
                                    :false-value="0"
                                />
                                <label class="form-check-label"> Activo</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="dialogoNuevo = false">Cancelar</button>
                    <button class="btn btn-success ms-2" :disabled="datosSucursal.nombre == '' || datosSucursal.prefijo == ''" @click="editandoSucursal ? modificarSucursal(datosSucursal) : insertarSucursal(datosSucursal)">Aceptar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, getCurrentInstance } from "vue";
import { formatearFechaHora, mostrarToast } from "../common/funciones.js";
import Swal from 'sweetalert2'
import TablaDatos from "../common/TablaDatos.vue";
import { _tr_align } from "pdfmake/build/pdfmake.js";

const conceptos = ref([]);
const datosSucursal = ref({id: null, nombre: '', prefijo: '', consecutivoCotizacion: 1, consecutivoOT: 1, activo: 1});
const editandoSucursal = ref(false);
const dialogoNuevo = ref(false);
const loading = ref(false);
const { proxy } = getCurrentInstance();

const data45= JSON.parse(localStorage.getItem('userSession')); 
const idUsuarioSession = data45?.usuario?.idUsuario;

const headers = [
    { text: "Nombre", value: "nombre", sortable: true },
    { text: "Comisión", value: "comision", sortable: true },
    { text: "Última edición", value: "sysFechaEditado", sortable: true },
    { text: "Editado por", value: "editor", sortable: true }
];

const acciones = [
  {
    key: "edit",
    icon: "bi-pencil-square",
    class: "btn-outline-warning",
    title: "Editar",
  },
  {
    key: "delete",
    icon: "bi-trash",
    class: "btn-outline-danger",
    title: "Eliminar",
  },
];

const handleTableAction = (action, item) => {
  if (action === "edit") editarSucursal(item);
  if (action === "delete") borrarSucursal(item);
};

const cargarConceptos = async () => {
	loading.value = true;
	try {
		const res = await fetch(`${proxy.$serverIP}api/ConceptoTrabajo`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const data = await res.json();
        console.log(data);
		return data;
	} catch (error) {
		console.error("Error al cargar los conceptos de trabajo: ", error);
	} finally {
		loading.value = false;
	}
};

const nuevaSucursal = () => {
    datosSucursal.value = {id: null, nombre: '', prefijo: '', consecutivoCotizacion: 1, consecutivoOT: 1, activo: 1};
    editandoSucursal.value = false;
    dialogoNuevo.value = true;
}

const editarSucursal = (sucursal) => {
    datosSucursal.value = {id: sucursal.idSucursal, nombre: sucursal.nombre, prefijo: sucursal.prefijo, consecutivoCotizacion: sucursal.consecutivoCotizacion, consecutivoOT: sucursal.consecutivoOrdenTrabajo, activo: sucursal.activo};
    editandoSucursal.value = true;
    dialogoNuevo.value = true;
}

const insertarSucursal = async (nuevo) => {
    try {
        const response = await fetch(`${proxy.$serverIP}api/Sucursales/insertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nuevo.nombre,
                prefijo: nuevo.prefijo,
                activo: 1,
                usuario: idUsuarioSession
            }),
        });

        if (!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        mostrarToast("success", "Sucursal insertada correctamente.");
        dialogoNuevo.value = false;
        sucursales.value = await cargarSucursales();
    }
    catch(err) {
        console.log(err);
        mostrarToast("error", "Ocurrió un error al intentar insertar la sucursal: " + err.message);
    }
}

const modificarSucursal = async (editar) => {
    try {
        const response = await fetch(`${proxy.$serverIP}api/Sucursales/editar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idSucursal: editar.id,
                nombre: editar.nombre,
                prefijo: editar.prefijo,
                consecutivoCotizacion: editar.consecutivoCotizacion,
                consecutivoOrdenTrabajo: editar.consecutivoOT,
                activo: editar.activo,
                sysEditadoPor: idUsuarioSession
            }),
        });

        if (!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        mostrarToast("success", "Sucursal editada correctamente.");
        dialogoNuevo.value = false;
        sucursales.value = await cargarSucursales();
    }
    catch(err) {
        console.log(err);
        mostrarToast("error", "Ocurrió un error al intentar editar la sucursal: " + err.message);
    }
}

const borrarSucursal = async (sucursal) => {
	const result = await Swal.fire({
		title: 'Eliminar sucursal',
		text: `¿Desea eliminar a la sucursal seleccionada ${'(' + sucursal.nombre + ')?'} Esta acción no se puede deshacer.`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Eliminar',
		cancelButtonText: 'Cancelar'
	});
	if (result.isConfirmed) {
		try {
			const response = await fetch(`${proxy.$serverIP}api/Sucursales/borrar`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: sucursal.idSucursal,
					usuario: idUsuarioSession
				}),
			});

			if (!response.ok)
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			mostrarToast("success", "Sucursal borrada correctamente.");
			sucursales.value = await cargarSucursales();
		}
		catch(err) {
			console.log(err);
			mostrarToast("error", "Ocurrió un error al intentar borrar la sucursal: " + err.message);
		}
	}
}

onMounted( async() => {
    conceptos.value = await cargarConceptos();
});

</script>

<style>
.tabla_datos {
    border-collapse: collapse;
    width: 100%;
    font-size: 11pt;
}

.tabla_datos td {
    padding: 6px 8px;
    border-style: solid;
    border-color: #ccc;
    border-width: 1px 0px;
}

.tabla_datos th {
    padding: 6px 8px;
    border-style: solid;
    border-color: #ccc;
    border-width: 1px 0px;
    background-color: #eee;
}

.tabla-llantas-contenedor {
    max-height: 55vh;
    overflow: auto;
}

.tabla-llantas-contenedor thead th {
    position: sticky;
    top: 0;
    z-index: 1;
}
</style>
