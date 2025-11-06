import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Inventario from '@/views/Inventario.vue'
import MainLayout from '@/MainLayout.vue'
import Inicio from '@/views/Inicio.vue'
import Cotizacion from '@/views/Cotizacion.vue'
import OrdenTrabajo from '@/views/OrdenTrabajo.vue'
import FormularioOT from '@/components/OrdenTrabajo/FormularioOT.vue'
import Promocion from '@/views/Promocion.vue'
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
                path: 'OrdenTrabajo',
                name:'OrdenTrabajo',
                component: OrdenTrabajo
            },
            {
                
                path:'FormularioOT',
                name:'formOT',
                component: FormularioOT
                      
            },
            {
                path: 'Promocion',
                name:'Promocion',
                component: Promocion
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router