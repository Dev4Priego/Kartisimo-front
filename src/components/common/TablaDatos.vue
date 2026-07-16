<template>
  <section class="tabla-datos">
    <div
      v-if="title || subtitle || searchable || showCreate || hasToolbar"
      class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3"
    >
      <div v-if="title || subtitle">
        <h5 v-if="title" class="mb-0">{{ title }}</h5>
        <small v-if="subtitle" class="text-muted">{{ subtitle }}</small>
      </div>

      <div class="d-flex flex-wrap align-items-end gap-2 ms-auto">
        <slot name="filters" />

        <div v-if="searchable" class="input-group tabla-datos__search">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchText"
            type="text"
            class="form-control"
            :placeholder="searchPlaceholder"
          />
        </div>

        <slot name="toolbar" />

        <button
          v-if="showCreate"
          type="button"
          class="btn btn-primary shadow-sm align-self-end"
          @click="$emit('create')"
        >
          <i class="bi bi-plus-lg me-2"></i>
          {{ createLabel }}
        </button>

        
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 mb-0 text-muted">{{ loadingText }}</p>
    </div>

    <EasyDataTable
      v-else
      :headers="normalizedHeaders"
      :items="filteredItems"
      :rows-per-page="rowsPerPage"
      rows-per-page-message="Elementos por página: "
      :rows-items="rowsItems"
      :show-index="showIndex"
      :border="border"
      :alternating="alternating"
      :buttons-pagination="buttonsPagination"
      :table-class-name="tableClassName"
      :empty-message="emptyText"
      class="tabla-datos__table"
    >
      <template
        v-for="header in slottedHeaders"
        :key="header.value"
        #[`item-${header.value}`]="slotProps"
      >
        <slot :name="`item-${header.value}`" v-bind="getCellSlotProps(slotProps)" />
      </template>

      <template #item-acciones="slotProps">
        <slot name="item-acciones" v-bind="getCellSlotProps(slotProps)">
          <div class="d-flex gap-1 justify-content-center">
            <button
              v-for="action in visibleActions(getSlotItem(slotProps))"
              :key="action.key"
              type="button"
              :class="['btn btn-sm', action.class || 'btn-outline-secondary']"
              :title="action.title || action.label"
              :aria-label="action.title || action.label"
              :disabled="isActionDisabled(action, getSlotItem(slotProps))"
              @click="$emit('action', action.key, getSlotItem(slotProps))"
            >
              <i v-if="action.icon" :class="['bi', action.icon]"></i>
              <span v-else>{{ action.label }}</span>
            </button>
          </div>
        </slot>
      </template>
    </EasyDataTable>
  </section>
</template>

<script setup>
import { computed, ref, useSlots, watch } from "vue";
import EasyDataTable from "vue3-easy-data-table";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: "Cargando registros...",
  },
  emptyText: {
    type: String,
    default: "No hay registros para mostrar.",
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  searchPlaceholder: {
    type: String,
    default: "Buscar",
  },
  searchFields: {
    type: Array,
    default: () => [],
  },
  rowsPerPage: {
    type: Number,
    default: 20,
  },
  rowsItems: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
  showIndex: {
    type: Boolean,
    default: false,
  },
  border: {
    type: Boolean,
    default: true,
  },
  alternating: {
    type: Boolean,
    default: true,
  },
  buttonsPagination: {
    type: Boolean,
    default: true,
  },
  tableClassName: {
    type: String,
    default: "table table-hover align-middle mb-3",
  },
  showCreate: {
    type: Boolean,
    default: false,
  },
  createLabel: {
    type: String,
    default: "Nuevo",
  },
  actions: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["action", "create"]);

const slots = useSlots();
const searchText = ref("");

const hasToolbar = computed(() => Boolean(slots.toolbar || slots.filters));

const normalizedHeaders = computed(() => {
  const hasActionsHeader = props.headers.some(
    (header) => header.value === "acciones",
  );

  if (!props.actions.length || hasActionsHeader) return props.headers;

  return [
    ...props.headers,
    {
      text: "Acciones",
      value: "acciones",
      sortable: false,
    },
  ];
});

const slottedHeaders = computed(() =>
  normalizedHeaders.value.filter((header) =>
    Boolean(header.value && slots[`item-${header.value}`]),
  ),
);

const searchableFields = computed(() => {
  if (props.searchFields.length) return props.searchFields;

  return props.headers
    .filter((header) => header.value && header.value !== "acciones")
    .map((header) => header.value);
});

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const filteredItems = computed(() => {
  const query = normalizeText(searchText.value);

  if (!props.searchable || !query) return props.items;

  return props.items.filter((item) =>
    searchableFields.value.some((field) =>
      normalizeText(item?.[field]).includes(query),
    ),
  );
});

const visibleActions = (item) =>
  props.actions.filter((action) => {
    if (typeof action.visible === "function") return action.visible(item);
    if (typeof action.visible === "boolean") return action.visible;
    return true;
  });

const isActionDisabled = (action, item) => {
  if (typeof action.disabled === "function") return action.disabled(item);
  if (typeof action.disabled === "boolean") return action.disabled;
  return false;
};

const getSlotItem = (slotProps) => slotProps?.item ?? slotProps;

const getCellSlotProps = (slotProps) => {
  const item = getSlotItem(slotProps);

  return {
    ...slotProps,
    item,
  };
};

watch(
  () => props.items,
  () => {
    searchText.value = "";
  },
);
</script>

<style scoped>
.tabla-datos__search {
  min-width: min(320px, 100%);
}

.tabla-datos__table {
  width: 100%;
  --easy-table-header-font-size: 11pt;
  --easy-table-body-row-font-size: 10pt;
  --easy-table-footer-height: 40px;
}

</style>
