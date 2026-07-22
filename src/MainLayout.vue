<template>
    
    <div>
        <!-- Header -->
        <header
        class="bg-danger text-white py-3 px-4 d-flex align-items-center justify-content-between header-fixed"
        >
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

                <h5 class="mb-0">Kartisimo</h5>
            </div>

            <!-- Botón cerrar sesión -->
            <button class="btn btn-light" @click="cerrarSesion">
                <i class="bi bi-box-arrow-right me-2"></i>
                Cerrar sesión
            </button>
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
                    <!-- <li class="nav-item mb-2">
                        <button 
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas" 
                            @click.prevent="irA('/content/inicio')"
                        ><i class="bi bi-house-door-fill me-2"></i>
                            Inicio
                        </button>
                    </li> -->
                    <li class="nav-item mb-2">
                        <button 
                            class="nav-link text-white"                     
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/inventario')" 
                        ><i class="bi bi-box-seam-fill me-2"></i>
                            Inventario
                        </button>
                    </li>
                    
                    <li class="nav-item mb-2">
                        <button 
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/cotizacion')" 
                        ><i class="bi bi-file-ruled-fill me-2"></i>
                            Cotizaciones
                        </button>
                    </li>              
                    
                    <li class="nav-item mb-2">
                        <button
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/orden-trabajo')"
                        ><i class="bi bi-wrench-adjustable me-2"></i>
                            Órdenes de Trabajo
                        </button>
                    </li>
                    
                    <li class="nav-item mb-2">
                        <button
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/Promocion')"
                        ><i class="bi bi-currency-dollar me-2"></i>
                            Promociones
                        </button>
                    </li>

                    <li class="nav-item mb-2">
                        <button
                            class="nav-link text-white"
                            data-bs-dismiss="offcanvas"
                            @click.prevent="irA('/content/Catalogos')"
                        ><i class="bi bi-journal-bookmark-fill me-2"></i>
                            Catálogos
                        </button >
                    </li>
                </ul>
            </div>
        </div>

        <!-- Contenido -->
        <div class="contenido">
            <router-view :key="$route.fullPath" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { clearSession } from '@/services/auth'
// #d43535
const router = useRouter()
const sidebarRef = ref(null)

const irA = (ruta) => {

    // Limpia backdrop y locks del body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.removeAttribute('style');

    // Elimina backdrops externos
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.querySelectorAll('.offcanvas-backdrop').forEach(el => el.remove());
    router.push(ruta)
}

const cerrarSesion = () => {
    // Limpia sesión
    clearSession();

    // Redirige al login
    router.replace('/')
}
</script>

<style scoped>
.header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1050; /* encima del contenido */
}

.contenido {
    margin-top: 70px;
}

</style>
