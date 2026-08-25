<template>
  <div @focusin="abrirSelector" @focusout="handleFocusOut">
    <input
      v-model="busquedaClientes"
      type="text"
      placeholder="Buscar cliente..."
      class="form-select mb-3"
    />

    <div style="max-height: 150px; overflow-y: auto">
      <div v-if="modelValue && cargando" class="py-2 text-muted">
        Cargando clientes...
      </div>
      <table v-else-if="modelValue">
        <thead>
          <tr>
            <th style="width: 40%">Nombre</th>
            <th style="width: 20%">Email</th>
            <th style="width: 20%">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cliente in clientesFiltrados"
            :key="cliente.idCliente"
            style="cursor: pointer"
            @click="seleccionarCliente(cliente)"
          >
            <td>{{ cliente.nombreCompleto || "(SIN NOMBRE)" }}</td>
            <td>{{ cliente.correo || "(SIN CORREO)" }}</td>
            <td>{{ formatearTelefono(cliente.telefono) || "(SIN NUMERO)" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from "vue";
import { createCotizacionApi } from "@/services/cotizacionApi";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "seleccionar-cliente"]);
const { proxy } = getCurrentInstance();
const api = createCotizacionApi(proxy.$serverIP);

const clientes = ref([]);
const cargando = ref(false);
const clientesCargados = ref(false);
const busquedaClientes = ref("");

const cargarClientes = async () => {
  if (clientesCargados.value || cargando.value) return;

  cargando.value = true;
  try {
    const data = await api.listarClientes();
    clientes.value = (data || []).map((cliente) => ({
      ...cliente,
      nombreCompleto:
        `${cliente.nombres || ""} ${cliente.apPaterno || ""} ${cliente.apMaterno || ""}`.trim(),
    }));
    clientesCargados.value = true;
  } catch (error) {
    console.error("Error al cargar clientes:", error);
  } finally {
    cargando.value = false;
  }
};

const abrirSelector = () => {
  emit("update:modelValue", true);
  void cargarClientes();
};

const formatearTelefono = (telefono) => {
  if (!telefono) return "";
  const digitos = String(telefono).replace(/\D/g, "");
  if (digitos.length !== 10) return telefono;
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
};

const handleFocusOut = () => {
  setTimeout(() => emit("update:modelValue", false), 150);
};

const clientesFiltrados = computed(() => {
  const busqueda = busquedaClientes.value.trim().toLowerCase();
  if (!busqueda) return clientes.value.slice(0, 50);

  return clientes.value
    .filter((cliente) => {
      const nombre = cliente.nombreCompleto?.toLowerCase() ?? "";
      const numero = String(cliente.telefono || "").toLowerCase();
      const correo = cliente.correo?.toLowerCase() ?? "";
      return (
        nombre.includes(busqueda) ||
        numero.includes(busqueda) ||
        correo.includes(busqueda)
      );
    })
    .slice(0, 50);
});

const seleccionarCliente = (cliente) => {
  emit("seleccionar-cliente", {
    idCliente: cliente.idCliente,
    nombres: cliente.nombres,
    apPaterno: cliente.apPaterno,
    apMaterno: cliente.apMaterno,
    correo: cliente.correo,
    telefono: cliente.telefono,
  });
  emit("update:modelValue", false);
};
</script>
