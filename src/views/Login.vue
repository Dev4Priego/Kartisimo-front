<template>
  <div class="container-fluid p-0 min-vh-100 d-flex flex-column bg-light">

    <!-- Header (más sobrio) -->
    <header class="bg-danger bg-opacity-90 text-white py-2 text-center shadow-sm">
      <h1 class="h4 mb-0 fw-semibold">Kartisimo</h1>
    </header>

    <!-- Contenido -->
    <div class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="container">
        <div class="row align-items-center justify-content-center">

          <!-- Imagen -->
          <!-- <div class="col-md-6 d-none d-md-block">
            <div class="position-relative">
              <img
                :src="imagenLogin"
                alt="Imagen de bienvenida"
                class="img-fluid rounded-4 shadow-sm w-100"
                style="max-height: 420px; object-fit: cover;"
              />
              <div
                class="position-absolute top-0 start-0 w-100 h-100 rounded-4"
                style="background: rgba(0,0,0,.15);"
              ></div>
            </div>
          </div> -->

          <!-- Login -->
          <div class="col-md-6">
            <div class="p-4 p-md-5 bg-white rounded-4 shadow-sm mx-md-4">

              <h2 class="h4 mb-1 text-center fw-semibold">
                Iniciar sesión
              </h2>
              <p class="text-muted text-center mb-4">
                Acceso al sistema
              </p>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label">Usuario</label>
                  <input
                    v-model="usuario"
                    type="text"
                    class="form-control"
                    placeholder="Ingrese su usuario"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label class="form-label">Contraseña</label>
                  <input
                    v-model="contrasenia"
                    type="password"
                    class="form-control"
                    placeholder="Ingrese su contraseña"
                    required
                  />
                </div>

                <button
                  class="btn btn-danger w-100 py-2"
                  type="submit"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Entrar
                </button>
              </form>

              <p v-if="errorMsg" class="text-danger text-center mt-3 mb-0">
                {{ errorMsg }}
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
// import imagenLogin from '@/assets/imagenLogin.webp'

const { proxy } = getCurrentInstance()
const router = useRouter()

const usuario = ref('')
const contrasenia = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin () {
  errorMsg.value = ''
  loading.value = true

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
      errorMsg.value = result.error || 'Credenciales incorrectas'
    }
  } catch (error) {
    errorMsg.value = 'Error de conexión con el servidor'
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
