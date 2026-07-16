<template>
    <div class="container-fluid p-4">
        <div class="row mx-4">
            <h2><i class="bi bi-journal-bookmark-fill me-2"></i> Catálogos</h2>
        </div>
        <div>
            <ul class="nav nav-tabs mt-4">
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: tabActiva === 'marcas' }" @click="tabActiva = 'marcas'">Marcas</button>
                </li>
                <!-- <li class="nav-item">
                    <button class="nav-link" :class="{ active: tabActiva === 'proveedores' }" @click="tabActiva = 'proveedores'">Proveedores</button>
                </li> -->
            </ul>
            <div class="border border-top-0 p-3">
                <KeepAlive>
                    <CatalogoMarcas v-if="tabActiva === 'marcas'" />
                    <CatalogoProveedores v-else-if="tabActiva === 'proveedores'" />
                </KeepAlive>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import CatalogoMarcas from '@/components/Catalogos/CatMarcas.vue';

const tabActiva = ref('marcas');

</script>
