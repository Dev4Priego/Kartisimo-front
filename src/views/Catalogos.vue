<template>
    <div class="container-fluid p-4">
        <div class="row mx-4">
            <h2><i class="bi bi-journal-bookmark-fill me-2"></i> Catálogos</h2>
        </div>
        <div>
            <ul class="nav nav-tabs mt-4">
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: tabActiva === 'sucursales' }" @click="tabActiva = 'sucursales'">Sucursales</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: tabActiva === 'marcas' }" @click="tabActiva = 'marcas'">Marcas</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" :class="{ active: tabActiva === 'tecnicos' }" @click="tabActiva = 'tecnicos'">Técnicos</button>
                </li>
            </ul>
            <div class="border border-top-0 p-3">
                <KeepAlive>
                    <CatalogoSucursales v-if="tabActiva === 'sucursales'" />
                    <CatalogoMarcas v-else-if="tabActiva === 'marcas'" />
                    <CatalogoTecnicos v-else-if="tabActiva === 'tecnicos'" />
                </KeepAlive>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import CatalogoMarcas from '@/components/Catalogos/CatMarcas.vue';
import CatalogoTecnicos from '@/components/Catalogos/CatTecnicos.vue';
import CatalogoSucursales from '@/components/Catalogos/CatSucursales.vue';

const tabActiva = ref('sucursales');

</script>
