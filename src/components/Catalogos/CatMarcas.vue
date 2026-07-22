<template>
    <div class="row">
        <div class="col-12">
            <TablaDatos
                title="Marcas"
                :headers="headers"
                :items="marcas"
                :loading="loading"
                show-create
                create-label="Nueva marca"
                :actions="acciones"
                @create="abrirModalNueva"
                @action="handleTableAction"
                >

                <template #item-llantas="{ item }">
                    <span class="d-block text-end me-3">{{ item.llantas }}</span>
                </template>

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
        v-if="dialogoLlantas"
        class="modal fade show d-block"
        tabindex="-1"
        :style="{ background: 'rgba(0,0,0,0.5)' }"
    >
        <div class="modal-dialog modal-xl modal-dialog-centered modal-700">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Llantas de la marca {{ marcaSel.nombre }}</h3>
                </div>
                <div class="modal-body p-4">
                    <input
                        v-model="busquedaLlantas"
                        type="text"
                        class="form-control mb-3"
                        placeholder="Buscar por codigo, modelo, medida o rango"
                    />

                    <div class="tabla-llantas-contenedor">
                    <table class="tabla_datos">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Medida</th>
                                <th>Rango</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="ll in llantasFiltradas" :key="ll.idLlanta || ll.codigo">
                                <td>{{ ll.codigo }}</td>
                                <td>{{ ll.marca }}</td>
                                <td>{{ ll.modelo }}</td>
                                <td>{{ ll.medida }} {{ ll.runflat == 1 ? 'RUNFLAT' : '' }}</td>
                                <td>{{ ll.rango }}</td>
                            </tr>
                            <tr v-if="llantasFiltradas.length === 0">
                                <td colspan="5" class="text-center text-muted py-4">
                                    No hay llantas para mostrar.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="cerrarDialogoLlantas">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <div
        v-if="dialogoNueva"
        class="modal fade show d-block"
        tabindex="-1"
        :style="{ background: 'rgba(0,0,0,0.5)' }"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-500">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">{{ editarMarca ? "Editar marca" : "Nueva marca" }}</h3>
                </div>
                <div class="modal-body p-3">
                    <div class="row align-items-start">
                        <div class="col-md-4">
                            <label class="form-label">Nombre *</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="marca.nombre"
                                minlength="3"
                                maxlength="50"
                                required
                            />
                        </div>
                        <div class="col-md-8">
                            <label class="form-label">Descripción</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="marca.descripcion"
                                minlength="0"
                                maxlength="250"
                            />
                        </div>
                        <div class="col-md-12 mt-2">
                            <label class="form-label">Notas</label>
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="marca.notas"
                                minlength="0"
                                maxlength="250"
                            />
                        </div>
                        <div v-if="editandoMarca" class="col-md-4 mt-2 me-2">
                            <div class="form-check">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input"
                                    v-model="marca.activo"
                                    :true-value="1"
                                    :false-value="0"
                                />
                                <label class="form-check-label"> Activo</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="dialogoNueva = false">Cancelar</button>
                    <button class="btn btn-success ms-2" :disabled="marca.nombre == ''" @click="editandoMarca ? modificarMarca(marca) : insertarMarca(marca)">Aceptar</button>
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

const marcas = ref([]);
const llantas = ref([]);
const busquedaLlantas = ref("");
const dialogoLlantas = ref(false);
const dialogoNueva = ref(false);
const editandoMarca = ref(false);
const marcaSel = ref({id: null, nombre: ''})
const loading = ref(false);
const loadingLlantas = ref(false);
const marca = ref({ id: null, nombre: '', descripcion: '', activo: 1, notas: '' });
const { proxy } = getCurrentInstance();

const data45= JSON.parse(localStorage.getItem('userSession')); 
const idUsuarioSession = data45?.usuario?.idUsuario;

const headers = [
    { text: "ID", value: "idMarca", sortable: true },
    { text: "Marca", value: "nombre", sortable: true },
    { text: "Descripción", value: "descripcion", sortable: false },
    { text: "Estado", value: "activo", sortable: false },
    { text: "Llantas", value: "llantas", sortable: true },
    { text: "Notas", value: "notas", sortable: false },
    { text: "Última edición", value: "sysFechaEditado", sortable: true },
    { text: "Editado por", value: "editor", sortable: true }
];

const acciones = [
  {
    key: "view",
    icon: "bi-eye",
    class: "btn-outline-info",
    title: "Ver llantas",
  },
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
    disabled: (item) => item.llantas > 0,
  },
];

const handleTableAction = (action, item) => {
  if (action === "view") mostrarLlantas(item);
  if (action === "edit") editarMarca(item);
  if (action === "delete") borrarMarca(item);
};

const cargarMarcas = async () => {
	loading.value = true;
	try {
		const res = await fetch(`${proxy.$serverIP}api/Marcas/MarcasLlantas?inactivas=true`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const data = await res.json();
        console.log(data);
		return data;
	} catch (error) {
		console.error("Error al cargar marcas: ", error);
	} finally {
		loading.value = false;
	}
};

const cargarLlantas = async (marca) => {
	loadingLlantas.value = true;
	try {
		const res = await fetch(`${proxy.$serverIP}api/Marcas/LlantasPorMarca?marca=${marca}`);
		if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
		const data = await res.json();
        console.log(data);
		return data;
	} catch (error) {
		console.error("Error al cargar llantas por marca: ", error);
	} finally {
		loadingLlantas.value = false;
	}
};

const abrirModalNueva = () => {
    marca.value = { id: null, nombre: '', descripcion: '', activo: 1, notas: '' };
    dialogoNueva.value = true;
    editandoMarca.value = false;
}

const editarMarca = (editar) => {
    marca.value = { id: editar.idMarca, nombre: editar.nombre, descripcion: editar.descripcion, activo: editar.activo, notas: editar.notas }
    editandoMarca.value = true;
    dialogoNueva.value = true;
}

const insertarMarca = async (nueva) => {
    try {
        const response = await fetch(`${proxy.$serverIP}api/Marcas/insertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nueva.nombre,
                descripcion: nueva.descripcion,
                activo: 1,
                notas: nueva.notas,
                usuario: idUsuarioSession
            }),
        });

        if (!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        mostrarToast("success", "Marca insertada correctamente.");
        dialogoNueva.value = false;
        marcas.value = await cargarMarcas();
    }
    catch(err) {
        console.log(err);
        mostrarToast("error", "Ocurrió un error al intentar insertar la marca: " + err.message);
    }
}

const modificarMarca = async (editar) => {
    try {
        const response = await fetch(`${proxy.$serverIP}api/Marcas/editar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editar.id,
                nombre: editar.nombre,
                descripcion: editar.descripcion,
                activo: editar.activo,
                notas: editar.notas,
                usuario: idUsuarioSession
            }),
        });

        if (!response.ok)
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        mostrarToast("success", "Marca editada correctamente.");
        dialogoNueva.value = false;
        marcas.value = await cargarMarcas();
    }
    catch(err) {
        console.log(err);
        mostrarToast("error", "Ocurrió un error al intentar editar la marca: " + err.message);
    }
}

const borrarMarca = async (marca) => {
	const result = await Swal.fire({
		title: 'Eliminar marca',
		text: `¿Desea eliminar la marca seleccionada (${marca.nombre})?`,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Eliminar',
		cancelButtonText: 'Cancelar'
	});
	if (result.isConfirmed) {
		try {
			const response = await fetch(`${proxy.$serverIP}api/Marcas/borrar`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: marca.idMarca,
					usuario: idUsuarioSession
				}),
			});

			if (!response.ok)
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			mostrarToast("success", "Marca borrada correctamente.");
			marcas.value = await cargarMarcas();
		}
		catch(err) {
			console.log(err);
			mostrarToast("error", "Ocurrió un error al intentar borrar la marca: " + err.message);
		}
	}
}

const mostrarLlantas = async(item) => {
    marcaSel.value.id = item.idMarca;
    marcaSel.value.nombre = item.nombre;
    busquedaLlantas.value = "";
    console.log(item);
    console.log(marcaSel.value);
    llantas.value = await cargarLlantas(item.idMarca) || [];
    dialogoLlantas.value = true;
}

const cerrarDialogoLlantas = () => {
    dialogoLlantas.value = false;
    busquedaLlantas.value = "";
}

const llantasFiltradas = computed(() => {
    const texto = busquedaLlantas.value.trim().toLowerCase();
    if (!texto) return llantas.value;

    return llantas.value.filter((ll) => {
        const contenido = [
            ll.codigo,
            ll.marca,
            ll.modelo,
            ll.medida,
            ll.rango,
            ll.runflat == 1 ? "runflat" : "",
        ].join(" ").toLowerCase();

        return contenido.includes(texto);
    });
});

onMounted( async() => {
    marcas.value = await cargarMarcas();
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
