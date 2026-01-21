import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/DashboardPage.vue'
import AccessDenied from '@/components/AccessDenied.vue'

import Companies from '@/pages/enviroment/CompaniesPage.vue'
import UserCreation from '@/pages/enviroment/UserPage.vue'

import Grounds from '@/pages/production/parameterization/GroundPage.vue'
import Sectors from '@/pages/production/parameterization/SectorPage.vue' 
import Species from '@/pages/production/parameterization/SpeciesPage.vue'
import Varieties from '@/pages/production/parameterization/VarietyPage.vue'

import Warehouses from '@/pages/operations/WarehousesPage.vue'
import Transit from '@/pages/operations/TransitPage.vue'
import Products from '@/pages/operations/ProductsPage.vue'
import Resume from '@/pages/operations/ResumePage.vue'

import PurchaseOrdersPage from '@/pages/operations/procurement/PurchaseOrdersPage.vue'
import PurchaseRequestsPage from '@/pages/operations/procurement/PurchaseRequestPage.vue'
import SuppliersPage from '@/pages/operations/procurement/SuppliersPage.vue'

import PurchaseOrderItemsPage from '@/pages/operations/procurement/orders/[id]/items/PurchaseOrderItemsPage.vue'
import PurchaseReceiptNewPage from '@/pages/operations/procurement/orders/[id]/receipts/new/PurchaseReceiptNewPage.vue'


const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDenied,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true }, // Aplica a todos los hijos
    children: [
      //Dashboard de entrada
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },

      //Páginas cofiguración ambiente
      {
        path: 'dashboard/enviroment/company',
        name: 'Companies',
        component: Companies,
        meta: {
          roles: [1],
        },
      },
      {
        path: 'dashboard/enviroment/user-creation',
        name: 'UserCreation',
        component: UserCreation,
        meta: {
          roles: [1],
        },
      },

      //Páginas producción
      {
        path: 'dashboard/production/parameterization-ground/ground',
        name: 'Grounds',
        component: Grounds,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-ground/sectors-barracks',
        name: 'Sectors',
        component: Sectors,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-ground/species',
        name: 'Species',
        component: Species,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-ground/varieties',
        name: 'Varieties',
        component: Varieties,
        meta: {
          roles: [1, 2],
        },
      },
     

      //Páginas operaciones
      {
        path: 'dashboard/operations/warehouses',
        name: 'Warehouses',
        component: Warehouses,
        meta: {
          roles: [1, 2, 8],
        },
      },
      {
        path: 'dashboard/operations/transit',
        name: 'Transit',
        component: Transit,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/products',
        name: 'Products',
        component: Products,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/resume',
        name: 'Resume',
        component: Resume,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/operations/procurement/purchase-requests',
        name: 'PurchaseRequests',
        component: PurchaseRequestsPage,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/procurement/purchase-orders',
        name: 'PurchaseOrders',
        component: PurchaseOrdersPage,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/procurement/orders/:id/items',
        name: 'PurchaseOrderItems',
        component: PurchaseOrderItemsPage,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/procurement/orders/:id/receipts/new',
        name: 'PurchaseOrderReceiptNew',
        component: PurchaseReceiptNewPage,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/procurement/suppliers',
        name: 'Suppliers',
        component: SuppliersPage,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true'
  const userRol = parseInt(localStorage.getItem('rol'))

  if (to.meta.requiresAuth && !loggedIn) {
    next({ name: 'Login' })
  } else if (to.meta.roles && !to.meta.roles.includes(userRol)) {
    //alert('Acceso denegado: no tienes permisos')
    next({ name: 'AccessDenied' }) //Vista denegada
    //next({ name: 'Dashboard' })
  } else if (to.name === 'Login' && loggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
