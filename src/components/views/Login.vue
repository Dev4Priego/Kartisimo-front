<template>
    <div class="container-fluid p-0 min-vh-100 d-flex flex-column">
        <!-- Header -->
        <header class="bg-danger text-white py-3 text-center">
        <h1 class="mb-0">Kartisimo</h1>
        </header>

        <!-- Contenido principal -->
        <div class="flex-grow-1 d-flex align-items-center justify-content-center">
            <div class="container">
                <div class="row align-items-center justify-content-center min-vh-75">
                    <!-- Imagen -->
                    <div class="col-md-6 d-none d-md-block">
                        <img
                            src="/src/assets/login/imagenLogin.webp"
                            alt="Imagen de bienvenida"
                            class="img-fluid rounded shadow w-100"
                            style="max-height: 450px; object-fit: cover;"
                        />
                    </div>

                    <!-- Formulario de login -->
                    <div class="col-md-6">
                        <div class="p-4 border rounded shadow-sm bg-white mx-md-5">
                            <h2 class="mb-4 text-center">Iniciar sesión</h2>
                            <form @submit.prevent="handleLogin">
                                <div class="mb-3">
                                    <label class="form-label">Usuario</label>
                                    <input
                                        v-model="usuario"
                                        type="text"
                                        class="form-control"
                                        required
                                    />
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Contraseña</label>
                                    <input
                                        v-model="contrasenia"
                                        type="password"
                                        class="form-control"
                                        required
                                    />
                                </div>
                                <button class="btn btn-danger w-100" type="submit">
                                    Entrar
                                </button>
                            </form>
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

const { proxy } = getCurrentInstance()
const router = useRouter()
const usuario = ref('')
const contrasenia = ref('')

async function  handleLogin() {
  // Validación ficticia, aquí va tu lógica o petición a API
    try {

        const response = await fetch(proxy.$serverIP + "api/Usuario/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario.value,
                password: contrasenia.value
            })
        });

        const result = await response.json();

        if (result.success) {
            router.push('/content/inventario') // Redirige si es correcto
        } else {
            alert(result.error || 'Credenciales incorrectas')
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error)
        alert('Error de conexión con el servidor')
    }
}
</script>