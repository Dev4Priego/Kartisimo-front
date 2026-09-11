<template>
  <TablaDatos
    title="Clientes"
    :headers="headers"
    :items="clientes"
    :loading="loading"
    show-create
    create-label="Nuevo cliente"
    :actions="acciones"
    @create="abrirNuevo"
    @action="manejarAccion"
  >
    <template #item-activo="{ item }">
      <span :class="['badge', item.activo === 1 ? 'text-bg-success' : 'text-bg-secondary']">
        {{ item.activo === 1 ? 'Activo' : 'Inactivo' }}
      </span>
    </template>
    <template #item-sysFechaEditado="{ item }">
      <span class="text-nowrap">{{ formatearFechaHora(item.sysFechaEditado) }}</span>
    </template>
  </TablaDatos>

  <div v-if="modalAbierto" class="modal fade show d-block" tabindex="-1" aria-modal="true">
    <div class="modal-backdrop fade show"></div>
    <div class="modal-dialog modal-lg modal-dialog-centered position-relative">
      <form class="modal-content" @submit.prevent="guardar">
        <div class="modal-header">
          <h3 class="modal-title">{{ editando ? 'Editar cliente' : 'Nuevo cliente' }}</h3>
          <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrarModal"></button>
        </div>

        <div class="modal-body p-4">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Nombre(s) *</label>
              <input v-model.trim="cliente.nombres" class="form-control" maxlength="300" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Apellido paterno</label>
              <input v-model.trim="cliente.apPaterno" class="form-control" maxlength="100" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Apellido materno</label>
              <input v-model.trim="cliente.apMaterno" class="form-control" maxlength="100" />
            </div>
            <div class="col-md-4">
              <label class="form-label">RFC</label>
              <input
                :value="cliente.rfc"
                class="form-control text-uppercase"
                maxlength="26"
                @input="cliente.rfc = $event.target.value.toUpperCase()"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
              <input v-model.trim="cliente.telefono" class="form-control" maxlength="200" inputmode="tel" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Correo</label>
              <input v-model.trim="cliente.correo" type="email" class="form-control" maxlength="200" />
            </div>
            <div class="col-12">
              <label class="form-label">Observaciones</label>
              <textarea v-model.trim="cliente.observaciones" class="form-control" rows="3" maxlength="500"></textarea>
            </div>
            <div v-if="editando" class="col-12">
              <div class="form-check">
                <input
                  id="cliente-activo"
                  v-model="cliente.activo"
                  class="form-check-input"
                  type="checkbox"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="cliente-activo">Activo</label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="guardando" @click="cerrarModal">Cancelar</button>
          <button type="submit" class="btn btn-success" :disabled="!formularioValido || guardando">
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import TablaDatos from '../common/TablaDatos.vue';
import { formatearFechaHora, mostrarToast } from '../common/funciones.js';

const { proxy } = getCurrentInstance();
const sesion = JSON.parse(localStorage.getItem('userSession') || 'null');
const idUsuario = sesion?.usuario?.idUsuario;

const modeloVacio = () => ({
  idCliente: 0,
  nombres: '',
  apPaterno: '',
  apMaterno: '',
  rfc: '',
  telefono: '',
  correo: '',
  observaciones: '',
  activo: 1,
});

const clientes = ref([]);
const cliente = ref(modeloVacio());
const loading = ref(false);
const guardando = ref(false);
const modalAbierto = ref(false);
const editando = ref(false);

const headers = [
  { text: 'ID', value: 'idCliente', sortable: true },
  { text: 'Cliente', value: 'nombreCompleto', sortable: true },
  { text: 'RFC', value: 'rfc', sortable: true },
  { text: 'Teléfono', value: 'telefono', sortable: true },
  { text: 'Correo', value: 'correo', sortable: true },
  //{ text: 'Estado', value: 'activo', sortable: true },
  { text: 'Observaciones', value: 'observaciones', sortable: false },
  { text: 'Última edición', value: 'sysFechaEditado', sortable: true },
  { text: 'Editado por', value: 'editor', sortable: true },
];

const acciones = [
  { key: 'edit', icon: 'bi-pencil-square', class: 'btn-outline-warning', title: 'Editar' },
  { key: 'delete', icon: 'bi-trash', class: 'btn-outline-danger', title: 'Eliminar' },
];

const formularioValido = computed(() => {
  const correo = cliente.value.correo.trim();
  return cliente.value.nombres.trim().length > 0
    && (!correo || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    && Boolean(idUsuario);
});

const obtenerError = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || `Error ${response.status}: ${response.statusText}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
};

const cargarClientes = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${proxy.$serverIP}api/Cliente/catalogo?inactivos=true`);
    if (!response.ok) throw new Error(await obtenerError(response));
    const data = await response.json();
    clientes.value = data.map((item) => ({
      ...item,
      nombreCompleto: [item.nombres, item.apPaterno, item.apMaterno].filter(Boolean).join(' '),
    }));
  } catch (error) {
    mostrarToast('error', `No se pudieron cargar los clientes: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const abrirNuevo = () => {
  cliente.value = modeloVacio();
  editando.value = false;
  modalAbierto.value = true;
};

const abrirEdicion = (item) => {
  cliente.value = {
    idCliente: item.idCliente,
    nombres: item.nombres || '',
    apPaterno: item.apPaterno || '',
    apMaterno: item.apMaterno || '',
    rfc: item.rfc || '',
    telefono: item.telefono || '',
    correo: item.correo || '',
    observaciones: item.observaciones || '',
    activo: item.activo,
  };
  editando.value = true;
  modalAbierto.value = true;
};

const cerrarModal = () => {
  if (!guardando.value) modalAbierto.value = false;
};

const guardar = async () => {
  if (!formularioValido.value || guardando.value) return;
  guardando.value = true;

  try {
    const response = await fetch(`${proxy.$serverIP}api/Cliente/${editando.value ? 'editar' : 'insertar'}`, {
      method: editando.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cliente.value, usuario: idUsuario }),
    });
    if (!response.ok) throw new Error(await obtenerError(response));

    mostrarToast('success', `Cliente ${editando.value ? 'editado' : 'insertado'} correctamente.`);
    modalAbierto.value = false;
    await cargarClientes();
  } catch (error) {
    mostrarToast('error', error.message);
  } finally {
    guardando.value = false;
  }
};

const borrar = async (item) => {
  const resultado = await Swal.fire({
    title: 'Eliminar cliente',
    text: `¿Desea eliminar a ${item.nombreCompleto}? Su historial permanecerá relacionado.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });
  if (!resultado.isConfirmed) return;

  try {
    const response = await fetch(`${proxy.$serverIP}api/Cliente/borrar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.idCliente, usuario: idUsuario }),
    });
    if (!response.ok) throw new Error(await obtenerError(response));

    mostrarToast('success', 'Cliente eliminado correctamente.');
    await cargarClientes();
  } catch (error) {
    mostrarToast('error', error.message);
  }
};

const manejarAccion = (accion, item) => {
  if (accion === 'edit') abrirEdicion(item);
  if (accion === 'delete') borrar(item);
};

onMounted(cargarClientes);
</script>

<style scoped>
.modal { background: rgba(0, 0, 0, 0.25); }
.modal-dialog { z-index: 1056; }
</style>
