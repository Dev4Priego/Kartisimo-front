<template>
  <TablaDatos
    title="Vehículos"
    :headers="headers"
    :items="vehiculos"
    :loading="loading"
    show-create
    create-label="Nuevo vehículo"
    :actions="acciones"
    @create="abrirNuevo"
    @action="manejarAccion"
  >
    <template #item-kilometraje="{ item }">
      <span class="text-nowrap">{{ formatearKilometraje(item.kilometraje) }} km</span>
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
          <h3 class="modal-title">{{ editando ? 'Editar vehículo' : 'Nuevo vehículo' }}</h3>
          <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrarModal"></button>
        </div>

        <div class="modal-body p-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Serie (17 caracteres) *</label>
              <input
                :value="vehiculo.serie"
                class="form-control text-uppercase"
                minlength="17"
                maxlength="17"
                required
                @input="vehiculo.serie = $event.target.value.replace(/\s/g, '').toUpperCase()"
              />
              <small :class="vehiculo.serie.length === 17 ? 'text-success' : 'text-muted'">
                {{ vehiculo.serie.length }}/17
              </small>
            </div>
            <div class="col-md-3">
              <label class="form-label">Marca *</label>
              <input v-model.trim="vehiculo.marca" class="form-control" maxlength="100" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Modelo *</label>
              <input v-model.trim="vehiculo.modelo" class="form-control" maxlength="100" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Año *</label>
              <input
                v-model.number="vehiculo.anio"
                type="number"
                class="form-control"
                min="1900"
                :max="anioMaximo"
                required
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Color</label>
              <input v-model.trim="vehiculo.color" class="form-control" maxlength="100" />
            </div>
            <div class="col-md-3">
              <label class="form-label">Placas</label>
              <input
                :value="vehiculo.placas"
                class="form-control text-uppercase"
                maxlength="30"
                @input="vehiculo.placas = $event.target.value.toUpperCase()"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Kilometraje</label>
              <input v-model.number="vehiculo.kilometraje" type="number" class="form-control" min="0" step="1" />
            </div>
            <div class="col-12">
              <label class="form-label">Notas</label>
              <textarea v-model.trim="vehiculo.notas" class="form-control" rows="3" maxlength="300"></textarea>
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
const anioMaximo = new Date().getFullYear() + 1;

const modeloVacio = () => ({
  idVehiculo: 0,
  marca: '',
  modelo: '',
  color: '',
  serie: '',
  anio: new Date().getFullYear(),
  placas: '',
  notas: '',
  kilometraje: 0,
});

const vehiculos = ref([]);
const vehiculo = ref(modeloVacio());
const loading = ref(false);
const guardando = ref(false);
const modalAbierto = ref(false);
const editando = ref(false);

const headers = [
  { text: 'ID', value: 'idVehiculo', sortable: true },
  { text: 'Serie', value: 'serie', sortable: true },
  { text: 'Marca', value: 'marca', sortable: true },
  { text: 'Modelo', value: 'modelo', sortable: true },
  { text: 'Año', value: 'anio', sortable: true },
  { text: 'Color', value: 'color', sortable: true },
  { text: 'Placas', value: 'placas', sortable: true },
  { text: 'Kilometraje', value: 'kilometraje', sortable: true },
  { text: 'Notas', value: 'notas', sortable: false },
  { text: 'Última edición', value: 'sysFechaEditado', sortable: true },
  { text: 'Editado por', value: 'editor', sortable: true },
];

const acciones = [
  { key: 'edit', icon: 'bi-pencil-square', class: 'btn-outline-warning', title: 'Editar' },
  { key: 'delete', icon: 'bi-trash', class: 'btn-outline-danger', title: 'Eliminar' },
];

const formularioValido = computed(() => vehiculo.value.serie.trim().length === 17
  && vehiculo.value.marca.trim().length > 0
  && vehiculo.value.modelo.trim().length > 0
  && Number(vehiculo.value.anio) >= 1900
  && Number(vehiculo.value.anio) <= anioMaximo
  && Number(vehiculo.value.kilometraje) >= 0
  && Boolean(idUsuario));

const formatearKilometraje = (valor) => Number(valor || 0).toLocaleString('es-MX', {
  maximumFractionDigits: 0,
});

const obtenerError = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || `Error ${response.status}: ${response.statusText}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
};

const cargarVehiculos = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${proxy.$serverIP}api/Vehiculo/catalogo`);
    if (!response.ok) throw new Error(await obtenerError(response));
    vehiculos.value = await response.json();
  } catch (error) {
    mostrarToast('error', `No se pudieron cargar los vehículos: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const abrirNuevo = () => {
  vehiculo.value = modeloVacio();
  editando.value = false;
  modalAbierto.value = true;
};

const abrirEdicion = (item) => {
  vehiculo.value = {
    idVehiculo: item.idVehiculo,
    marca: item.marca || '',
    modelo: item.modelo || '',
    color: item.color || '',
    serie: item.serie || '',
    anio: item.anio,
    placas: item.placas || '',
    notas: item.notas || '',
    kilometraje: item.kilometraje || 0,
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
    const response = await fetch(`${proxy.$serverIP}api/Vehiculo/${editando.value ? 'editar' : 'insertar'}`, {
      method: editando.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehiculo.value, usuario: idUsuario }),
    });
    if (!response.ok) throw new Error(await obtenerError(response));

    mostrarToast('success', `Vehículo ${editando.value ? 'editado' : 'insertado'} correctamente.`);
    modalAbierto.value = false;
    await cargarVehiculos();
  } catch (error) {
    mostrarToast('error', error.message);
  } finally {
    guardando.value = false;
  }
};

const borrar = async (item) => {
  const resultado = await Swal.fire({
    title: 'Eliminar vehículo',
    text: `¿Desea eliminar el vehículo con serie ${item.serie}? Su historial permanecerá relacionado.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });
  if (!resultado.isConfirmed) return;

  try {
    const response = await fetch(`${proxy.$serverIP}api/Vehiculo/borrar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.idVehiculo, usuario: idUsuario }),
    });
    if (!response.ok) throw new Error(await obtenerError(response));

    mostrarToast('success', 'Vehículo eliminado correctamente.');
    await cargarVehiculos();
  } catch (error) {
    mostrarToast('error', error.message);
  }
};

const manejarAccion = (accion, item) => {
  if (accion === 'edit') abrirEdicion(item);
  if (accion === 'delete') borrar(item);
};

onMounted(cargarVehiculos);
</script>

<style scoped>
.modal { background: rgba(0, 0, 0, 0.25); }
.modal-dialog { z-index: 1056; }
</style>
