<template>
<div class="container-fluid p-4">
	<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
		<div>
			<h1 class="mb-1">
				<i class="bi bi-cash-coin"></i>
				Comisiones
			</h1>
			<p>
				Reporte de comisiones de cada tecnico.
			</p>
		</div>
		<button class="btn btn-outline-primary" type="button" @click="cargarReporte">
			<i class="bi bi-arrow-clockwise me-2"></i>
        Actualizar
		</button>
	</div>
	<div class="bg-white rounded shadow-sm p-3 mb-3">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-lg-5">
          <label class="form-label fw-semibold">Buscar</label>
          <input
            v-model.trim="busqueda"
            class="form-control"
            type="text"
            placeholder="Nombre del Tecnico"
          />
        </div>
        
       
      </div>
    </div>

	<div class="bg-white rounded shadow-sm">
		<Tabla/>
	</div>
</div>
</template>
<script setup>
import Tabla from '@/components/Reportes/Tabla.vue';
</script>