<template>
  <div
    class="d-flex align-items-center justify-content-between py-2 border-bottom"
  >
    <div>
      <input
        type="checkbox"
        class="form-check-input me-2"
        :checked="tarea.completada"
        @change="$emit('toggle')"
      />
      <span :class="{ 'text-decoration-line-through text-muted': tarea.completada }">
        {{ tarea.descripcionServicio }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tarea: { type: Object, required: true }
})
</script>
