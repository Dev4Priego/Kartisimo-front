<template>
	<div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0">Cargando reporte...</p>
      </div>

      <div v-else-if="error" class="text-center py-5 text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="fw-semibold mt-2 mb-0">{{ error }}</p>
      </div>

	  <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>OT</th>
              <th>Sucursal</th>
              <th>Fecha Alta</th>
              <th>Fecha Entrega</th>
              <th>Metodo Pago</th>
              <th >Precio subtotal</th>
              <th >Costo total</th>
              <th >Total Descuento</th>
             
              <th >Precio Total</th>


              <th >Rentabilidad</th>
            </tr>
          </thead>
          <tbody>
            
			
            <tr v-if="reporteFiltrado.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                No hay ordenes entregadas para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
</template>
<script setup></script>