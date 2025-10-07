<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5>{{ isEditing ? 'Editar Almacén' : 'Nuevo Almacén' }}</h5>
      <form @submit.prevent="handleSubmit">
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
          <select v-model="form.idSucursal" class="form-select" required>
            <option disabled value="">Seleccione una sucursal</option>
            <option
              v-for="sucursal in sucursales"
              :key="sucursal.idSucursal"
              :value="sucursal.idSucursal"
            >
              {{ sucursal.nombre }}
            </option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary me-2">
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </button>
        <button v-if="isEditing" type="button" class="btn btn-secondary" @click="cancelEdit">
          Cancelar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    required: true
  },
  sucursales: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['onSaved', 'onCancel'])

// Creamos un objeto reactivo para el formulario inicializando con los datos que llegan por props
const form = reactive({
  idAlmacen: props.formData.idAlmacen || 0,
  nombre: props.formData.nombre || '',
  descripcion: props.formData.descripcion || '',
  idSucursal: props.formData.idSucursal || '',
  sysCreadoPor: props.formData.sysCreadoPor || 1,
})

// Cuando props.formData cambie, actualizamos el form reactivo
watch(
  () => props.formData,
  (newForm) => {
    form.idAlmacen = newForm.idAlmacen || 0
    form.nombre = newForm.nombre || ''
    form.descripcion = newForm.descripcion || ''
    form.idSucursal = newForm.idSucursal || ''
    form.sysCreadoPor = newForm.sysCreadoPor || 1
  },
  { deep: true }
)

// Función para obtener el nombre de la sucursal por su ID
function getNombreSucursal(idSucursal) {
  const sucursal = props.sucursales.find(s => s.idSucursal === idSucursal)
  return sucursal ? sucursal.nombre : ''
}

async function handleSubmit() {
  const payload = {
    idAlmacen: form.idAlmacen || 0,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    idSucursal: Number(form.idSucursal),
    sysCreadoPor: form.sysCreadoPor,
    nombreSucursal: getNombreSucursal(Number(form.idSucursal))
  }

  try {
    if (props.isEditing) {
      await axios.put(`https://localhost:7172/api/Almacen/${form.idAlmacen}`, payload)
      alert('Almacén actualizado correctamente.')
    } else {
      await axios.post('https://localhost:7172/api/Almacen', payload)
      alert('Almacén creado correctamente.')
    }

    emit('onSaved')
  } catch (error) {
    console.error('Error al guardar:', error.response?.data || error.message || error)
    alert('Error al guardar el almacén.')
  }
}

function cancelEdit() {
  emit('onCancel')
}
</script>
