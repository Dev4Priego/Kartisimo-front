<template>
  <div class="card">
    <div class="card-body">
      <h5>Lista de Almacenes</h5>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Sucursal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="almacen in almacenes" :key="almacen.idAlmacen">
            <td>{{ almacen.idAlmacen }}</td>
            <td>{{ almacen.nombre }}</td>
            <td>{{ almacen.descripcion }}</td>
            <td>{{ getNombreSucursal(almacen.idSucursal) }}</td>
            <td>
              <button class="btn btn-sm btn-warning me-2" @click="abrirModal(almacen)">Editar</button>
              <button class="btn btn-sm btn-danger" @click="eliminar(almacen.idAlmacen)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="almacenes.length === 0">
            <td colspan="5" class="text-center">No hay almacenes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal fade" tabindex="-1" ref="modal" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Almacén</h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardar">
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input v-model="form.nombre" type="text" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea v-model="form.descripcion" class="form-control" rows="3" required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Sucursal</label>
                <select v-model.number="form.idSucursal" class="form-select" required>
                  <option disabled value="">Seleccione una sucursal</option>
                  <option v-for="s in sucursales" :key="s.idSucursal" :value="s.idSucursal">
                    {{ s.nombre }}
                  </option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary">Guardar</button>
              <button type="button" class="btn btn-secondary ms-2" @click="cerrarModal">Cancelar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'
import Swal from 'sweetalert2'

// Props
const props = defineProps({
  almacenes: Array,
  sucursales: Array
})

// Emit events
const emit = defineEmits(['actualizarLista'])

// Modal reference and instance
const modal = ref(null)
let modalInstance = null

// Reactive form
const form = reactive({
  idAlmacen: null,
  nombre: '',
  descripcion: '',
  idSucursal: null
})

// Get sucursal name by id
function getNombreSucursal(idSucursal) {
  if (!idSucursal) return "(Ninguna asignada)"
  const sucursal = props.sucursales.find(s => s.idSucursal === idSucursal)
  return sucursal ? sucursal.nombre : "Desconocida"
}

// Open modal and load data
function abrirModal(almacen) {
  form.idAlmacen = almacen.idAlmacen
  form.nombre = almacen.nombre
  form.descripcion = almacen.descripcion
  form.idSucursal = almacen.idSucursal
  modalInstance.show()
}

// Close modal and clear form
function cerrarModal() {
  modalInstance.hide()
  limpiarFormulario()
}

// Clear form fields
function limpiarFormulario() {
  form.idAlmacen = null
  form.nombre = ''
  form.descripcion = ''
  form.idSucursal = null
}

async function guardar() {
  try {
    const payload = {
      idAlmacen: form.idAlmacen,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      idSucursal: Number(form.idSucursal),
      nombreSucursal: getNombreSucursal(form.idSucursal)
    }

    await axios.put(`https://localhost:7172/api/Almacen/${form.idAlmacen}`, payload)

    await Swal.fire({
      icon: 'success',
      title: 'Almacén actualizado',
      text: 'El almacén se actualizó correctamente.',
      timer: 2000,
      showConfirmButton: false
    })

    cerrarModal()
    emit('actualizarLista')
    window.location.reload()
  } catch (error) {
    console.error('Error al guardar:', error.response?.data || error.message)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar el almacén.'
    })
  }
}

const currentUserId = 1

async function eliminar(idAlmacen) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`https://localhost:7172/api/Almacen/${idAlmacen}`, {
        data: { sysBorradoPor: currentUserId }
      })

      await Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El almacén fue eliminado correctamente.',
        timer: 2000,
        showConfirmButton: false
      })

      emit('actualizarLista')
      window.location.reload()
    } catch (error) {
      console.error('Error al eliminar:', error.response?.data || error.message)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el almacén.'
      })
    }
  }
}

// Initialize modal on mount
onMounted(() => {
  modalInstance = new bootstrap.Modal(modal.value)
})
</script>

<style scoped>
.table td, .table th {
  vertical-align: middle;
}
</style>
