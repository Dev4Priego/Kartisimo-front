<template>
<div 
  @focusin="emit('update:modelValue', true)"
  @focusout="handleFocusOut"
>
  <input 
    v-model="busquedaClientes" 
    type="text" 
    placeholder="Buscar cliente..." 
    class="form-select mb-3"
  />

  <div style="max-height: 150px; overflow-y: scroll;">
    <table v-if="modelValue">
      <thead>
        <tr>
          <th style="width: 40%;">Nombre</th>
          <th style="width: 20%;">Email</th>
          <th style="width: 20%;">Teléfono</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="cliente in clientesFiltrados" 
          :key="cliente.idCliente"
          style="cursor:pointer"
          @click="seleccionarCliente(cliente)"
        >
          <td>{{ cliente?.nombreCompleto || "(SIN NOMBRE)" }}</td>
          <td>{{ cliente?.correo || "(SIN CORREO)" }}</td>
          <td>{{ formatearTelefono(cliente?.telefono) || "(SIN NUMERO)" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script setup>
import { getCurrentInstance , ref, onMounted, computed, watch } from 'vue';

const clientes = ref([]);
const busquedaClientes = ref('');
const { proxy } = getCurrentInstance();



const emit = defineEmits([
  'update:modelValue',
  'seleccionar-cliente',

]);
const props = defineProps({
	modelValue: { // mostrar tabla o quitar
		type: [Boolean],
		default: false
	}
})

const getClientes = async ()=>{
    try{
        const res = await fetch(proxy.$serverIP +"api/Cliente/getClientes")
        if(!res.ok) throw new Error("Error en la busqueda")
          const data = await res.json();
			clientes.value= data.map(cliente => ({
				...cliente,
				nombreCompleto : `${cliente.nombres} ${cliente.apPaterno} ${cliente.apMaterno}`
			}));
        console.log("Clientes:" , clientes.value)
    }catch (e){
        console.error(e);
    }
}

onMounted(()=>{
    getClientes();
});

const formatearTelefono = (telefono) => {
	if (!telefono) return '';
    const digitos = telefono.replace(/\D/g, '');
    if (digitos.length !== 10) return telefono;
    return `${digitos.slice(0,3)} ${digitos.slice(3,6)} ${digitos.slice(6)}`;
  }

const handleFocusOut = () => {
  setTimeout(() => {
    emit('update:modelValue', false);
  }, 150);
};
// Computed para filtrar clientes
const clientesFiltrados = computed(() => {
  if (!busquedaClientes.value) return clientes.value;
  const busqueda = busquedaClientes.value.toLowerCase();

  return clientes.value.filter(c => {
    const nombre = c?.nombreCompleto?.toLowerCase() ?? '';
    const numero = c?.telefono?.toLowerCase() ?? '';   // ajusta al campo real de tu API
    const correo = c?.correo?.toLowerCase() ?? '';   // ajusta al campo real de tu API

    return (
      nombre.includes(busqueda) ||
      numero.includes(busqueda) ||
      correo.includes(busqueda)
    );
  });
});
const seleccionarCliente = (c) => {
  // Emitimos el id para el v-model
  

  // Emitimos todos los datos del cliente
  emit('seleccionar-cliente', {
	idCliente:c.idCliente,
    nombres: c.nombres,
    apPaterno: c.apPaterno,
    apMaterno: c.apMaterno,
    correo: c.correo,
    telefono: c.telefono
  });

  // Emitimos bandera para ocultar la tabla
 emit('update:modelValue', false)
};
</script>
