<template>
  <div class="clientes-filter-option" @focusin="abrirSelector" @focusout="handleFocusOut">
    <input
      ref="buscadorRef"
      v-model="busquedaClientes"
      type="text"
      placeholder="Buscar cliente..."
      class="form-select mb-3"
      role="combobox"
      aria-label="Buscar cliente"
      aria-autocomplete="list"
      :aria-expanded="modelValue"
      @keydown.down.prevent="moverSeleccion(1)"
      @keydown.up.prevent="moverSeleccion(-1)"
      @keydown.enter.prevent="seleccionarConTeclado"
      @keydown.tab="seleccionarConTeclado"
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
            v-for="(cliente, index) in clientesFiltrados"
            :key="cliente.idCliente"
            style="cursor: pointer"
            :class="{ 'table-primary': index === indiceActivo }"
            :aria-selected="index === indiceActivo"
            @mouseenter="indiceActivo = index"
            @mousedown.prevent="seleccionarCliente(cliente)"
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
import { computed, getCurrentInstance, nextTick, ref, watch } from "vue";
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
const indiceActivo = ref(-1);
const buscadorRef = ref(null);

const cargarClientes = async () => {
  if (clientesCargados.value || cargando.value) return;

  cargando.value = true;
  try {
    const data = await api.listarClientes();
    clientes.value = (data || []).map((cliente) => {
      const normalizado = normalizarCliente(cliente);
      return {
        ...cliente,
        ...normalizado,
        nombreCompleto:
          `${normalizado.nombres} ${normalizado.apPaterno} ${normalizado.apMaterno}`.trim(),
      };
    });
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

watch([busquedaClientes, clientesFiltrados], () => {
  indiceActivo.value = clientesFiltrados.value.length ? 0 : -1;
});

const moverSeleccion = (direccion) => {
  if (!clientesFiltrados.value.length) return;

  emit("update:modelValue", true);
  const ultimoIndice = clientesFiltrados.value.length - 1;
  if (indiceActivo.value < 0) {
    indiceActivo.value = direccion > 0 ? 0 : ultimoIndice;
  } else {
    indiceActivo.value = Math.min(
      ultimoIndice,
      Math.max(0, indiceActivo.value + direccion),
    );
  }

  void nextTick(() => {
    const filas = buscadorRef.value
      ?.closest(".clientes-filter-option")
      ?.querySelectorAll("tbody tr");
    filas?.[indiceActivo.value]?.scrollIntoView({ block: "nearest" });
  });
};

const normalizarCliente = (cliente) => ({
  idCliente: Number(cliente.idCliente ?? cliente.id_cliente ?? 0),
  nombres: cliente.nombres ?? cliente.nombre ?? "",
  apPaterno: cliente.apPaterno ?? cliente.ap_paterno ?? "",
  apMaterno: cliente.apMaterno ?? cliente.ap_materno ?? "",
  rfc: cliente.rfc ?? "",
  correo: cliente.correo ?? cliente.email ?? "",
  telefono: cliente.telefono ?? "",
  observaciones: cliente.observaciones ?? "",
});

const seleccionarCliente = (cliente) => {
  if (!cliente) return;
  emit("seleccionar-cliente", normalizarCliente(cliente));
  busquedaClientes.value = "";
  indiceActivo.value = -1;
  emit("update:modelValue", false);
};

const seleccionarConTeclado = (event) => {
  if (event?.shiftKey) return;
  if (!clientesFiltrados.value.length) return;
  const indice = indiceActivo.value >= 0 ? indiceActivo.value : 0;
  seleccionarCliente(clientesFiltrados.value[indice]);
};
</script>
