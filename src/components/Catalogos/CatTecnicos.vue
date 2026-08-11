<template>
    <div class="row">
        <div class="col-12">
            <TablaDatos
                title="Técnicos"
                :headers="headers"
                :items="tecnicos"
                :loading="loading"
                show-create
                create-label="Nuevo técnico"
                :actions="acciones"
                @create="nuevoTecnico"
                @action="handleTableAction"
                >

                <template #item-sysFechaEditado="{ item }">
                    <span class="text-nowrap">
                        {{ formatearFechaHora(item.sysFechaEditado) }}
                    </span>
                </template>

                <template #item-activo="{ item }">
                    {{ item.activo === 1 ? 'Activo' : 'Inactivo' }}
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
        <div class="modal-dialog modal-xl modal-dialog-centered modal-700">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">{{ editandoTecnico ? 'Editar técnico' : 'Nuevo técnico' }}</h3>
                </div>
                <div class="modal-body p-4">
                    <div class="row align-items-start">
                        <div class="col-md-12">
                            <label class="form-label">Empleado *</label>
                            <select 
                                class="form-select"
                                items
                                v-model="datosTecnico.idContpaq"
                                minlength="0"
                                maxlength="250"
                                @change="cambiaEmpleadoContpaq"
                            >
                                <option
                                v-for="itm in empleadosContpaq"
                                :key="itm.idEmpleado"
                                :value="itm.idEmpleado"
                                >
                                {{ itm.codigoEmpleado }} - {{ itm.nombreLargo }} ({{ itm.puesto }})
                                </option>
                            </select>
                        </div>
                        <div class="col-md-4 mt-2">
                            <label class="form-label">Nombre(s) *</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosTecnico.nombres"
                                minlength="3"
                                maxlength="150"
                                required
                            />
                        </div>
                        <div class="col-md-4 mt-2">
                            <label class="form-label">Ap. Paterno</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosTecnico.apePaterno"
                                minlength="0"
                                maxlength="50"
                            />
                        </div>
                        <div class="col-md-4 mt-2">
                            <label class="form-label">Ap. Materno</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosTecnico.apeMaterno"
                                minlength="0"
                                maxlength="50"
                            />
                        </div>
                        <div class="col-md-3 mt-2">
                            <label class="form-label">Sucursal *</label>
                            <select 
                                class="form-select"
                                items
                                v-model="datosTecnico.sucursal"
                                minlength="0"
                                maxlength="250"
                            >
                                <option
                                v-for="itm in sucursales"
                                :key="itm.idSucursal"
                                :value="itm.idSucursal"
                                >
                                {{ itm.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-3 mt-2">
                            <label class="form-label">Puesto *</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosTecnico.puesto"
                                minlength="0"
                                maxlength="100"
                            />
                        </div>
                        <div class="col-md-3 mt-2">
                            <label class="form-label">Teléfono</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosTecnico.telefono"
                                minlength="0"
                                maxlength="50"
                            />
                        </div>
                        <div class="col-md-3 mt-2">
                            <label class="form-label">Correo</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="datosTecnico.correo"
                                minlength="0"
                                maxlength="100"
                            />
                        </div>
                        
                        <div v-if="editandoTecnico" class="col-md-4 mt-2 me-2">
                            <div class="form-check">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input"
                                    v-model="datosTecnico.activo"
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
                    <button class="btn btn-success ms-2" :disabled="datosTecnico.nombres == '' || datosTecnico.sucursal == null || datosTecnico.puesto == ''" @click="editandoTecnico ? modificarTecnico(datosTecnico) : insertarTecnico(datosTecnico)">Aceptar</button>
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

const tecnicos = ref([]);
const empleadosContpaq = ref([]);
const datosTecnico = ref({idEmpleado: null, nombres: '', apePaterno: '', apeMaterno: '', puesto: '', telefono: '', correo: '', sucursal: null, idContpaq: null, activo: 1});
const editandoTecnico = ref(false);
const dialogoNuevo = ref(false);
const sucursales = ref([]);
const loading = ref(false);
const { proxy } = getCurrentInstance();

const data45= JSON.parse(localStorage.getItem('userSession')); 
const idUsuarioSession = data45?.usuario?.idUsuario;

const headers = [
    { text: "Nombre", value: "nombre", sortable: true },
    { text: "Puesto", value: "puesto", sortable: true },
    { text: "Teléfono", value: "telefono", sortable: true },
    { text: "Correo", value: "correo", sortable: true },
    { text: "Sucursal", value: "sucursal", sortable: true },
    { text: "Estado", value: "activo", sortable: true },
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
  if (action === "edit") editarTecnico(item);
  if (action === "delete") borrarTecnico(item);
};

const cargarTecnicos = async () => {
	loading.value = true;
	try {
		const res = await fetch(`${proxy.$serverIP}api/Empleado/Empleados?activos=0`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const data = await res.json();
        console.log(data);
		return data.map(u => ({
            ...u,
            nombre: [
                u.nombres,
                u.apePaterno,
                u.apeMaterno
            ].filter(Boolean).join(' ')
        }));
	} catch (error) {
		console.error("Error al cargar empleados: ", error);
	} finally {
		loading.value = false;
	}
};

const cargarSucursales = async () => {
	loading.value = true;
	try {
		const res = await fetch(`${proxy.$serverIP}api/Sucursales/getSucursales?activas=true`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const data = await res.json();
        console.log(data);
		return data;
	} catch (error) {
		console.error("Error al cargar sucursales: ", error);
	} finally {
		loading.value = false;
	}
};

const cargarEmpleadosContpaq = async () => {
	loading.value = true;
	try {
		const res = await fetch(`${proxy.$serverIP}api/Contpaq/Empleados`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const data = await res.json();
        console.log(data);
		return data;
	} catch (error) {
		console.error("Error al cargar empleados de ContPAQ: ", error);
	} finally {
		loading.value = false;
	}
};

const cambiaEmpleadoContpaq = () => {
    const empleado = empleadosContpaq.value.find(
        itm => itm.idEmpleado === datosTecnico.value.idContpaq
    );
    if (!empleado) return;
    datosTecnico.value.nombres = empleado.nombre ?? '';
    datosTecnico.value.apePaterno = empleado.apellidoPaterno ?? '';
    datosTecnico.value.apeMaterno = empleado.apellidoMaterno ?? '';
    datosTecnico.value.puesto = empleado.puesto ?? '';
}

const nuevoTecnico = () => {
    datosTecnico.value = {idEmpleado: null, nombres: '', apePaterno: '', apeMaterno: '', puesto: '', telefono: '', correo: '', sucursal: null, idContpaq: null, activo: 1};
    editandoTecnico.value = false;
    dialogoNuevo.value = true;
}

const editarTecnico = (tecnico) => {
    datosTecnico.value = {idEmpleado: tecnico.idEmpleado, idContpaq: tecnico.idContpaq, nombres: tecnico.nombres, apePaterno: tecnico.apePaterno, apeMaterno: tecnico.apeMaterno, puesto: tecnico.puesto, telefono: tecnico.telefono, correo: tecnico.correo, sucursal: tecnico.idSucursal, activo: tecnico.activo};
    editandoTecnico.value = true;
    dialogoNuevo.value = true;
}

const insertarTecnico = async (nuevo) => {
    try {
        const response = await fetch(`${proxy.$serverIP}api/Empleado/insertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombres: nuevo.nombres,
                apPaterno: nuevo.apePaterno,
                apMaterno: nuevo.apeMaterno,
                idSucursal: nuevo.sucursal,
                puesto: nuevo.puesto,
                telefono: nuevo.telefono,
                correo: nuevo.correo,
                idContpaq: nuevo.idContpaq,
                activo: 1,
                usuario: idUsuarioSession
            }),
        });

        if (!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        mostrarToast("success", "Técnico insertado correctamente.");
        dialogoNuevo.value = false;
        tecnicos.value = await cargarTecnicos();
    }
    catch(err) {
        console.log(err);
        mostrarToast("error", "Ocurrió un error al intentar insertar la marca: " + err.message);
    }
}

const modificarTecnico = async (editar) => {
    try {
        const response = await fetch(`${proxy.$serverIP}api/Empleado/editar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idEmpleado: editar.idEmpleado,
                nombres: editar.nombres,
                apPaterno: editar.apePaterno,
                apMaterno: editar.apeMaterno,
                puesto: editar.puesto,
                telefono: editar.telefono,
                correo: editar.correo,
                idSucursal: editar.sucursal,
                idContpaq: editar.idContpaq,
                activo: editar.activo,
                usuario: idUsuarioSession
            }),
        });

        if (!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        mostrarToast("success", "Técnico editado correctamente.");
        dialogoNuevo.value = false;
        tecnicos.value = await cargarTecnicos();
    }
    catch(err) {
        console.log(err);
        mostrarToast("error", "Ocurrió un error al intentar editar al técnico: " + err.message);
    }
}

const borrarTecnico = async (tecnico) => {
	const result = await Swal.fire({
		title: 'Eliminar técnico',
		text: `¿Desea eliminar al técnico seleccionado ${'(' + tecnico.nombres + ' ' + tecnico.apePaterno + ' ' + tecnico.apeMaterno + ')?'} Esta acción no se puede deshacer.`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Eliminar',
		cancelButtonText: 'Cancelar'
	});
	if (result.isConfirmed) {
		try {
			const response = await fetch(`${proxy.$serverIP}api/Empleado/borrar`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: tecnico.idEmpleado,
					usuario: idUsuarioSession
				}),
			});

			if (!response.ok)
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			mostrarToast("success", "Técnico borrado correctamente.");
			tecnicos.value = await cargarTecnicos();
		}
		catch(err) {
			console.log(err);
			mostrarToast("error", "Ocurrió un error al intentar borrar al técnico: " + err.message);
		}
	}
}

onMounted( async() => {
    tecnicos.value = await cargarTecnicos();
    sucursales.value = await cargarSucursales();
    empleadosContpaq.value = await cargarEmpleadosContpaq();
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
