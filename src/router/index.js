import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Inventario from '@/views/Inventario.vue'
import MainLayout from '@/MainLayout.vue'
import Inicio from '@/views/Inicio.vue'
import Cotizacion from '@/views/Cotizacion.vue'
import OrdenTrabajo from '@/views/OrdenTrabajo.vue'
import FormularioOT from '@/components/OrdenTrabajo/FormularioOT.vue'
import Promocion from '@/views/Promocion.vue'
import AlmacenOT from '@/components/Almacen/AlmacenOT.vue'
import TablaCargarLlantas from '@/components/Cotizacion/TablaCargarLlantas.vue' // agregado solo para desarrollo de componente dinamico, eliminar despues
const routes = [
    { 
        path: '/', 
        component: Login 
    },
    {
        path: '/content',
        component: MainLayout,
        meta: { requiereAuth: true },
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
                path:'FormularioOT/:idCotizacion?',
                name:'formOT',
                component: FormularioOT,
                props: true                      
            },
            {
                path: 'Promocion',
                name:'Promocion',
                component: Promocion
            },
            {
                path:'Almacen',
                name:'almacen',
                component: TablaCargarLlantas
            }
        ]
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userSession = sessionStorage.getItem('userSession')

  // Si la ruta requiere auth y no hay sesión
  if (to.matched.some(route => route.meta.requiereAuth) && !userSession) {
    next('/') // login
  }
  // Si ya está logueado, no dejar volver al login
  else if (to.path === '/' && userSession) {
    next('/content/inventario')
  }
  else {
    next()
  }
})

export default router
