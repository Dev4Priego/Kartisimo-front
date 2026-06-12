<template>

    <input
      v-model="busquedaProveedor"
      type="text"
      placeholder="Buscar proveedor..."
      class="form-control mb-3"
      @focusin="emit('update:modelValue', true)"
      @focusout="handleFocusOut"
    />

    <div style="position: relative;">
      <div
        v-if="modelValue"
        class="position-absolute w-100 bg-white border rounded shadow-sm"
        style="z-index: 2500; top: calc(100% + 0.25rem); left: 0; max-height: 250px; overflow-y: auto;"
      >
        <table class="table table-sm mb-0" style="width: 100%; font-size: 12px;">
          <thead>
            <tr>
              <th style="width: 100%">Nombre</th>
            </tr>
          </thead>
        <tbody>
          <tr
            v-for="proveedor in proveedoresFiltrados"
            :key="proveedor.id_proveedor"
            style="cursor: pointer"
            @click="seleccionarCliente(proveedor)"
          >
            <td class="my-5">{{ proveedor.nombreproveedor || "(SIN NOMBRE)" }}</td>
           
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, onMounted, computed, watch } from "vue";

const Proveedores = ref([]);
const busquedaProveedor = ref("");
const currentPage = ref(0);
const lastPage = ref(0);
const { proxy } = getCurrentInstance();

const emit = defineEmits(["update:modelValue", "seleccionar-cliente"]);
const props = defineProps({
  modelValue: {
    // mostrar tabla o quitar
    type: [Boolean],
    default: false,
  },
});


const cargarProveedores= async () => {
 try{
	const res = await fetch(proxy.$serverIP + "api/Proveedores/proveedores");
	if (!res.ok) throw new Error("Error al obtener los proveedores.");
	const data = await res.json();
	Proveedores.value= data;
 }catch (error){
	console.error("Error al cargar el proveedor:", error)
 }
};

onMounted(() => {
  cargarProveedores();
});

const handleFocusOut = () => {
  setTimeout(() => {
    emit("update:modelValue", false);
  }, 150);
};
// Computed para filtrar clientes
const proveedoresFiltrados = computed(() => {
  if (!busquedaProveedor.value) return Proveedores.value;
  const busqueda = busquedaProveedor.value.toLowerCase();

  return Proveedores.value.filter((p) => {
    const nombre = p.nombreproveedor?.toLowerCase() ?? "";

    return nombre.includes(busqueda);
  });
});
const seleccionarCliente = (proveedor) => {
  // Emitimos todos los datos del proveedor
  emit("seleccionar-cliente", proveedor);

  // Emitimos bandera para ocultar la tabla
  emit("update:modelValue", false);

  // Limpiar búsqueda
  busquedaProveedor.value = proveedor.nombreproveedor;
  
};
</script>
