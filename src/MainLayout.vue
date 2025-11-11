<template>
    
    <div>
        <!-- Header -->
        <header class="bg-danger text-white py-3 px-4 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
                <button
                    class="btn btn-light me-3"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#sidebar"
                    aria-controls="sidebar"
                >
                    ☰
                </button>
                <!-- <img src="../public/images/Logo-Kartisimo2.png" style="width: 120px; height: 30px;"> -->
                <h5>Kartisimo</h5>
            </div>
        </header>

        <!-- Sidebar (offcanvas Bootstrap) -->
        <div
            class="offcanvas offcanvas-start text-bg-dark"
            tabindex="-1"
            id="sidebar"
            aria-labelledby="sidebarLabel"
            ref="sidebarRef"
        >
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="sidebarLabel">Menú</h5>
                <button
                    type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="offcanvas"
                    aria-label="Cerrar"
                >
                </button>
            </div>
            <div class="offcanvas-body">
                <ul class="nav flex-column">
                    <li class="nav-item mb-2">
                        <button 
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas" 
                            @click.prevent="irA('/content/inicio')"
                        >
                            Inicio
                        </button>
                    </li>
                    <li class="nav-item mb-2">
                        <button 
                            class="nav-link text-white"                     
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/inventario')" 
                        >
                            Inventario
                        </button>
                    </li>
                    
                    <li class="nav-item mb-2">
                        <button 
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/cotizacion')" 
                        >
                            Cotizacion
                        </button>
                    </li>              
                    
                    <li class="nav-item mb-2">
                        <button
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/OrdenTrabajo')"
                        >
                            Orden de Trabajo
                        </button>
                    </li>
                    
                    <li class="nav-item mb-2">
                        <button
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/Promocion')"
                        >
                            Promocion
                        </button>
                    </li>

                    <li class="nav-item mb-2">
                        <button
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/Almacenes')"
                        >
                            Almacen
                        </button >
                    </li>
                </ul>
            </div>
        </div>

        <!-- Contenido -->
        <div>
            <router-view />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// #d43535
const router = useRouter()
const sidebarRef = ref(null)

const irA = (ruta) => {
  router.push(ruta)
}
</script>

<style scoped>

</style>