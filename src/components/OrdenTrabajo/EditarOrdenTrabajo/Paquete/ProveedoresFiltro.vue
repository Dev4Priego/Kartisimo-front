<template>

    <input
      v-model="busquedaProveedor"
      type="text"
      placeholder="Buscar proveedor..."
      class="form-control mb-3"
      @focus="emit('update:modelValue', true)"
      @focusout="handleFocusOut"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="selectActiveIndex"
      @keydown.esc.prevent="emit('update:modelValue', false)"
      @keydown.tab.prevent="selectActiveIndex"
    />

    <div style="position: relative;">
      <div
        v-if="modelValue"
        class="position-absolute w-100 bg-white border rounded shadow-sm"
        style="z-index: 2500; top: calc(100% + 0.25rem); left: 0; max-height: 250px; overflow-y: auto;"
      >
        <table class="table table-sm mb-0" style="width: 100%; font-size: 12px;" @focus="emit('update:modelValue', true)">
          <thead>
            <tr>
              <th style="width: 100%">Nombre</th>
            </tr>
          </thead>
        <tbody>
          <tr
            v-for="(proveedor, index) in proveedoresFiltrados"
            :key="proveedor.id_proveedor"
            :class="{ 'table-active': index === activeIndex }"
            :ref="el => { if (el) elementosRefs[index] = el }"
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
import { getCurrentInstance, ref, onMounted, computed, watch , nextTick  } from "vue";

const Proveedores = ref([]);
const busquedaProveedor = ref("");
const currentPage = ref(0);
const lastPage = ref(0);
const { proxy } = getCurrentInstance();
let activeIndex = ref(-1)// Nada seleccionado
const emit = defineEmits(["update:modelValue", "seleccionar-cliente"]);
const elementosRefs = ref([]);
const props = defineProps({
  modelValue: {
    // mostrar tabla o quitar
    type: [Boolean],
    default: false,
  },
});
// 3. Función central para ajustar el scroll
const ajustarScroll = async () => {
  // Esperamos a que Vue actualice el DOM con la nueva clase '.is-active'
  await nextTick();
  
  const elementoActivo = elementosRefs.value[activeIndex.value];
  
  if (elementoActivo) {
    // scrollIntoView mueve el contenedor para que el elemento sea visible
    elementoActivo.scrollIntoView({
      behavior: 'smooth', // Animación suave (puedes usar 'auto' para que sea instantáneo)
      block: 'nearest'    // Lo mueve solo lo necesario si se sale del contenedor
    });
  }
};


const moveDown = ()=>{
  if(activeIndex.value < proveedoresFiltrados.value.length -1 ){
    activeIndex.value++;
    ajustarScroll();
  }
}

const moveUp = ()=>{
  if(activeIndex.value > 0 ){
    activeIndex.value--;
    ajustarScroll();
  }
}

const selectActiveIndex= () =>{
  //SI el ususario se posa sobre un indice activo y preciona enter o tab, se disparara el evento para seleccionar el usuario
  if(activeIndex.value >=0 && activeIndex.value < proveedoresFiltrados.value.length){
    seleccionarCliente(proveedoresFiltrados.value[activeIndex.value]);
  }
}

const cargarProveedores= async () => {
 try{
	const res = await fetch(proxy.$serverIP + "api/Proveedores/proveedores");
	if (!res.ok) throw new Error("Error al obtener los proveedores.");
	const data = await res.json();
  const proveedoresRespuesta = Array.isArray(data)
    ? data
    : data?.data ?? data?.proveedores ?? [];
  Proveedores.value = Array.isArray(proveedoresRespuesta)
    ? proveedoresRespuesta
    : [];
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
<style scoped>
.tr-active:hover{
  background-color: rgb(22, 22, 22) ;
  transition: background-color 0.2s ease;
}
</style>