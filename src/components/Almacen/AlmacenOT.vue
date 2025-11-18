<template>
  <div class="container mt-4">
    <h2 class="mb-4">Gestión de Almacenes</h2>

    <AlmacenForm
      :formData="form"
      :isEditing="isEditing"
      :sucursales="sucursales"
      @onSaved="handleSaved"
      @onCancel="cancelEdit"
    />

    <AlmacenTable
      :almacenes="almacenes"
      :sucursales="sucursales"
      @onEdit="editAlmacen"
      @onDelete="deleteAlmacen"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2' 

import AlmacenForm from '@/components/Almacen/AlmacenForm.vue'
import AlmacenTable from '@/components/Almacen/AlmacenTable.vue'

const { proxy } = getCurrentInstance()

const API_ALMACENES =`${proxy.$serverIP}api/Almacen`
const API_SUCURSALES =`${proxy.$serverIP}api/Sucursales/getSucursales`

const almacenes = ref([])
const sucursales = ref([])

const form = ref({
  idAlmacen: null,
  nombre: '',
  descripcion: '',
  idSucursal: null,
  sysCreadoPor: 1
})
const isEditing = ref(false)

onMounted(() => {
  fetchSucursales()
  fetchAlmacenes()
})

async function fetchAlmacenes() {
  try {
    const res = await axios.get(API_ALMACENES)
    almacenes.value = res.data
  } catch (error) {
    console.error('Error al obtener almacenes:', error)
    Swal.fire('Error', 'Error al cargar almacenes.', 'error')
  }
}

async function fetchSucursales() {
  try {
    const res = await axios.get(API_SUCURSALES)
    sucursales.value = res.data
  } catch (error) {
    console.error('Error al obtener sucursales:', error)
    Swal.fire('Error', 'Error al cargar sucursales.', 'error')
  }
}

function editAlmacen(almacen) {
  form.value = {
    idAlmacen: almacen.idAlmacen,
    nombre: almacen.nombre,
    descripcion: almacen.descripcion,
    idSucursal: almacen.idSucursal,
    sysCreadoPor: 1
  }
  isEditing.value = true
}

async function deleteAlmacen(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Este almacén será eliminado.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    await axios.delete(`${API_ALMACENES}/${id}`)
    await fetchAlmacenes()
    Swal.fire('Eliminado', 'El almacén ha sido eliminado con éxito.', 'success')
  } catch (error) {
    console.error('Error al eliminar:', error)
    Swal.fire('Error', 'No se pudo eliminar el almacén.', 'error')
  }
}

function cancelEdit() {
  resetForm()
}

function handleSaved() {
  fetchAlmacenes()
  resetForm()

  Swal.fire({
    title: 'Guardado',
    text: isEditing.value ? 'Almacén actualizado correctamente.' : 'Almacén creado exitosamente.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  })
}

function resetForm() {
  form.value = {
    idAlmacen: null,
    nombre: '',
    descripcion: '',
    idSucursal: null,
    sysCreadoPor: 1
  }
  isEditing.value = false
}
</script>

<style scoped>
h2 {
  color: #d43535;
}
</style>
