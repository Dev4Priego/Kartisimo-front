<template>
    <div>
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="fw-bold">Promocion</h3>
            </div>

            <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                    <button
                        class="nav-link"
                        :class="{ active: activeTab === 'promocion' }"
                        @click="activeTab = 'promocion'"
                    >
                        Promocion
                    </button>
                </li>
                <li class="nav-item">
                    <button
                        class="nav-link"
                        :class="{ active: activeTab === 'crearPromocion' }"
                        @click="activeTab = 'crearPromocion'"
                    >
                        Crear
                    </button>
                </li>
            </ul>

            <transition name="fade" mode="out-in">
                <div key="promocion" v-if="activeTab === 'promocion'">
                    <ver-promocion/>
                </div>
                <div key="crearPromocion" v-else>
                    <crear-promocion @promocion-creada="activeTab = 'promocion'" />
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import CrearPromocion from './CrearPromocion.vue';
import VerPromocion from './VerPromocion.vue';

const activeTab = ref('promocion')
</script>