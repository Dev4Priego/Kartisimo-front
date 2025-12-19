<template>

  <div class="container-fluid p-0 min-vh-100 d-flex flex-column bg-light">

    <!-- Header -->
    <header class="bg-danger text-white py-2 text-center shadow-sm">
      <h1 class="h5 mb-0 fw-semibold">Kartisimo</h1>
    </header>

    <!-- Contenido -->
    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-sm-10 col-md-6 col-lg-4">

            <!-- Card Login -->
            <div class="bg-white rounded-5 shadow-lg p-4 p-md-5">

              <h2 class="h4 text-center fw-semibold mb-1">
                Iniciar sesión
              </h2>
              <p class="text-muted text-center mb-4">
                Acceso al sistema
              </p>

              <form @submit.prevent="handleLogin">

                <!-- Usuario -->
                <div class="mb-3">
                  <label class="form-label">Usuario</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="bi bi-person"></i>
                    </span>
                    <input
                      v-model.trim="usuario"
                      type="text"
                      class="form-control"
                      placeholder="Ingrese su usuario"
                      required
                      autofocus
                    />
                  </div>
                </div>

                <!-- Contraseña -->
                <div class="mb-4">
                  <label class="form-label">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model.trim="contrasenia"
                      class="form-control"
                      placeholder="Ingrese su contraseña"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showPassword = !showPassword"
                      tabindex="-1"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Botón -->
                <button
                  class="btn btn-danger w-100 py-2 fw-semibold"
                  type="submit"
                  :disabled="loading || !usuario || !contrasenia"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ loading ? 'Verificando...' : 'Entrar' }}
                </button>
              </form>

              <!-- Error -->
              <div
                v-if="errorMsg"
                class="alert alert-danger text-center mt-3 py-2"
              >
                {{ errorMsg }}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>


import { ref, watch, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const usuario = ref('')
const contrasenia = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

// Limpia error cuando el usuario escribe
watch([usuario, contrasenia], () => {
  errorMsg.value = ''
})

async function handleLogin () {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await fetch(
      proxy.$serverIP + 'api/Usuario/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario: usuario.value,
          password: contrasenia.value
        })
      }
    )

    const result = await response.json()

    if (result.success) {
      router.push('/content/inventario')
    } else {
      errorMsg.value = result.error || 'Usuario o contraseña incorrectos'
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
