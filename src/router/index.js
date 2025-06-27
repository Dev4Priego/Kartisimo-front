import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/views/Login.vue'
import Inventario from '@/components/views/Inventario.vue'
import MainLayout from '@/components/MainLayout.vue'
import Inicio from '@/components/views/Inicio.vue'
import Cotizacion from '@/components/views/Cotizacion.vue'
import Cotizacion_V2 from '@/components/views/Cotizacion_V2.vue'
import Cotizacion_v3 from '@/components/views/Cotizacion_v3.vue'
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
            },
            {
                path:'cotizacion_v2',
                name:'cotizacion_v2',
                component: Cotizacion_V2
            },
            {
                path:'cotizacion_v3',
                name:'cotizacion_v3',
                component: Cotizacion_v3
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router