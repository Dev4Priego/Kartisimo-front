import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/views/Login.vue'
import Inventario from '@/components/views/Inventario.vue'
import MainLayout from '@/components/MainLayout.vue'
import Inicio from '@/components/views/Inicio.vue'
import Cotizacion from '@/components/views/Cotizacion.vue'

const routes = [
    { 
        path: '/', 
        component: Login 
    },
    {
        path: '/content',
        component: MainLayout,
        children: [
            {
                path: 'inventario',
                name: 'Inventario',
                component: Inventario
            },
            {
                path: 'inicio',
                name: 'Inicio',
                component: Inicio 
            },
            {
                path: 'cotizacion',
                name:'cotizacion',
                component: Cotizacion
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router