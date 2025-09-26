<template>
  <div class="promo-form-container">
    <h2>Registrar Promoción</h2>

    <form @submit.prevent="handleSubmit" class="promo-form">
      <div class="form-group">
        <label>ID del Producto</label>
        <input v-model="form.productoId" type="number" required />
      </div>

      <div class="form-group">
        <label>Tipo de Promoción</label>
        <input v-model="form.tipo" type="text" required />
      </div>

      <div class="form-group">
        <label>Valor (%) o Monto</label>
        <input v-model="form.valor" type="number" step="0.01" required />
      </div>

      <div class="form-group">
        <label>Fecha de Inicio</label>
        <input v-model="form.fecha_inicio" type="date" required />
      </div>

      <div class="form-group">
        <label>Fecha de Fin</label>
        <input v-model="form.fecha_fin" type="date" required />
      </div>

      <div class="form-group">
        <label>Descripción (opcional)</label>
        <textarea v-model="form.descripcion" rows="3"></textarea>
      </div>

      <div class="form-group checkbox">
        <label>
          <input v-model="form.activo" type="checkbox" />
          Activo
        </label>
      </div>

      <button type="submit" class="submit-btn">Guardar</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'PromocionesOT',
  data() {
    return {
      form: {
        productoId: null,
        tipo: '',
        valor: null,
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        activo: false
      }
    }
  },
  methods: {
    handleSubmit() {
      console.log('Formulario enviado:', this.form)
      this.resetForm()
    },
    resetForm() {
      this.form = {
        productoId: null,
        tipo: '',
        valor: null,
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        activo: false
      }
    }
  }
}
</script>

<style scoped>
.promo-form-container {
  max-width: 500px;
  margin: 30px auto;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #fdfdfd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-family: sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.promo-form .form-group {
  margin-bottom: 15px;
}

.promo-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #444;
}

.promo-form input,
.promo-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.promo-form .checkbox label {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  background-color: #1e88e5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.submit-btn:hover {
  background-color: #1565c0;
}
</style>
