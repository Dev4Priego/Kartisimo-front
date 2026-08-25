import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Inventario from '@/views/Inventario.vue'
import MainLayout from '@/MainLayout.vue'
import Inicio from '@/views/Inicio.vue'
import Cotizacion from '@/views/Cotizacion.vue'
import OrdenTrabajo from '@/views/OrdenTrabajo/OrdenTrabajo.vue'
import FormularioOT from '@/components/OrdenTrabajo/FormularioOT.vue'
import Promocion from '@/views/Promocion.vue'
import Catalogos from '@/views/Catalogos.vue'
import AlmacenOT from '@/components/Almacen/AlmacenOT.vue'
import OrdenTrabajoPreview from '@/views/OrdenTrabajo/OrdenTrabajoPreview.vue'
import OrdenTrabajoEdit from '@/views/OrdenTrabajo/OrdenTrabajoEdit.vue'
import OrdenTrabajoLayout from '@/views/OrdenTrabajo/OrdenTrabajoLayout.vue'
import ReportesRentabilidad from '@/views/Reportes/RentabilidadOrdenTrabajo.vue'
import { clearSession, isSessionValid } from '@/services/auth'
import ComisionesTecnicos from '@/views/Reportes/ComisionesTecnicos.vue'
import RefaccionesProveedores from '@/views/Reportes/RefaccionesProveedores.vue'

const routes = [
  {
    path: "/",
    component: Login,
  },
  {
    path: "/content",
    component: MainLayout,
    meta: { requiereAuth: true },
    children: [
      {
        path: "inventario",
        name: "Inventario",
        component: Inventario,
      },
      {
        path: "inicio",
        name: "Inicio",
        component: Inicio,
      },
      {
        path: "cotizacion",
        name: "cotizacion",
        component: Cotizacion,
      },

      {
        path: "orden-trabajo",
        component: OrdenTrabajoLayout,
        children: [
          {
            path: "",
            name: "orden-trabajo-list",
            component: OrdenTrabajo,
          },
          {
            path: "nueva/:idCotizacion?/:idOrdenTrabajo?",
            name: "orden-trabajo-form",
            component: FormularioOT,
            props: true,
          },
          {
            path: ":id",
            name: "orden-trabajo-preview",
            component: OrdenTrabajoPreview,
          },
          {
            path: ":id/work",
            name: "orden-trabajo-work",
            component: OrdenTrabajoEdit,
          },
        ],
      },

      // {
      //     path: 'orden-trabajo', //path: 'OrdenTrabajo',
      //     name:'OrdenTrabajo',
      //     component: OrdenTrabajo
      // },
      // {
      //     path:'FormularioOT/:idCotizacion?',
      //     name:'formOT',
      //     component: FormularioOT,
      //     props: true
      // },
      {
        path: "Promocion",
        name: "Promocion",
        component: Promocion,
      },
      {
        path: "Catalogos",
        name: "Catalogos",
        component: Catalogos,
      },
      {
        path: "reportes/rentabilidad",
        name: "Reportes",
        component: ReportesRentabilidad,
      },
      {
        path: "reportes/comisiones",
        name: "Comisiones",
        component: ComisionesTecnicos,
      },
      {
        path: "reportes/refacciones",
        name: "RefaccionesProveedores",
        component: RefaccionesProveedores,
      },
    ],
  },
];

const router = createRouter({
    history: createWebHistory(),
    scrollBehavior(to, from, savedPosition) {
    // Si vienes de atrás/adelante del navegador
    if (savedPosition) {
      return savedPosition
    }

    // Siempre ir al top al cambiar de ruta
    return { top: 0 }
  },
    routes
})

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(route => route.meta.requiereAuth)
    const hasValidSession = isSessionValid()

    // Si la ruta requiere auth y no hay sesión válida
    if (requiresAuth && !hasValidSession) {
        clearSession()
        next('/') // login
    }
    // Si ya está logueado, no dejar volver al login
    else if (to.path === '/' && hasValidSession) {
        next('/content/orden-trabajo')
    }
    else {
        if (to.path === '/' && !hasValidSession) {
            clearSession()
        }
        next()
    }
})

export default router
