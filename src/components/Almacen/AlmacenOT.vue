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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AlmacenForm from '@/components/Almacen/AlmacenForm.vue'
import AlmacenTable from '@/components/Almacen/AlmacenTable.vue'

const API_ALMACENES = 'https://localhost:7172/api/Almacen'
const API_SUCURSALES = 'https://localhost:7172/api/Sucursales/getSucursales'

const almacenes = ref([])
const sucursales = ref([])

const form = ref({
  idAlmacen: null,
  nombre: '',
  descripcion: '',
  idSucursal: null,  // Cambiado a null para que sea consistente con el tipo
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
    console.log('Almacenes API response:', res.data)
    almacenes.value = res.data
  } catch (error) {
    console.error('Error al obtener almacenes:', error)
    alert('Error al cargar almacenes.')
  }
}

async function fetchSucursales() {
  try {
    const res = await axios.get(API_SUCURSALES)
    console.log('Sucursales API response:', res.data)
    sucursales.value = res.data
  } catch (error) {
    console.error('Error al obtener sucursales:', error)
    alert('Error al cargar sucursales.')
  }
}

function editAlmacen(almacen) {
  // Para evitar pasar propiedades extras o anidadas, mapea solo las necesarias
  form.value = {
    idAlmacen: almacen.idAlmacen,
    nombre: almacen.nombre,
    descripcion: almacen.descripcion,
    idSucursal: almacen.idSucursal,
    sysCreadoPor: 1 // O quien sea el usuario logueado
  }
  isEditing.value = true
}

async function deleteAlmacen(id) {
  if (!confirm('¿Estás seguro que deseas eliminar este almacén?')) return

  try {
    await axios.delete(`${API_ALMACENES}/${id}`)
    await fetchAlmacenes()
  } catch (error) {
    console.error('Error al eliminar:', error)
    alert('No se pudo eliminar el almacén.')
  }
}

function cancelEdit() {
  resetForm()
}

function handleSaved() {
  fetchAlmacenes()
  resetForm()
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
