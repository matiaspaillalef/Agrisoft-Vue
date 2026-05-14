import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/DashboardPage.vue'
import AccessDenied from '@/components/AccessDenied.vue'

import Companies from '@/pages/enviroment/CompaniesPage.vue'
import UserCreation from '@/pages/enviroment/UserPage.vue'
import Roles from '@/pages/enviroment/RolePage.vue'

import Grounds from '@/pages/production/parameterization/GroundPage.vue'
import Sectors from '@/pages/production/parameterization/SectorPage.vue'
import Species from '@/pages/production/parameterization/SpeciesPage.vue'
import Varieties from '@/pages/production/parameterization/VarietyPage.vue'
import Quality from '@/pages/production/parameterization/QualityPage.vue'
import SectorAttr from '@/pages/production/parameterization/SectorAttrPage.vue'
import Scales from '@/pages/production/parameterization/ScalePage.vue'

import Contractors from '@/pages/people-management/ContractorsPage.vue'
import Positions from '@/pages/people-management/PositionsPage.vue'
import Groups from '@/pages/people-management/GroupsPage.vue'
import Squads from '@/pages/people-management/SquadsPage.vue'
import Shifts from '@/pages/people-management/ShiftsPage.vue'
import Workers from '@/pages/people-management/WorkersPage.vue'

import Warehouses from '@/pages/operations/WarehousesPage.vue'
import WarehouseInventory from '@/pages/operations/WarehouseInventoryPage.vue'
import Transit from '@/pages/operations/TransitPage.vue'
import Products from '@/pages/operations/ProductsPage.vue'
import Resume from '@/pages/operations/ResumePage.vue'
import Season from '@/pages/production/parameterization/SeasonPage.vue'
import HarvestFormat from '@/pages/production/parameterization/HarvestFormatPage.vue'
import TypeCollection from '@/pages/production/parameterization/TypeCollectionPage.vue'
import Deals from '@/pages/production/parameterization/DealsPage.vue'
import Exporters from '@/pages/production/parameterization/ExportersPage.vue'
import RegularizationProduction from '@/pages/production/operations/RegularizationrPoductionPage.vue'
import ManualUploadPage from '@/pages/production/operations/ManualUploadPage.vue'
import CreateQrPage from '@/pages/production/operations/CreateQrPage.vue'

import PurchaseOrdersPage from '@/pages/operations/procurement/PurchaseOrdersPage.vue'
import PurchaseRequestsPage from '@/pages/operations/procurement/PurchaseRequestPage.vue'
import SuppliersPage from '@/pages/operations/procurement/SuppliersPage.vue'
import TemporaryApproversPage from '@/pages/operations/procurement/TemporaryApproversPage.vue'
import AlertsPage from '@/pages/operations/AlertsPage.vue'
import FieldBookPage from '@/pages/operations/FieldBookPage.vue'
import ForgotPassword from '@/pages/ForgotPassword.vue'
import ResetPassword from '@/pages/ResetPassword.vue'
import SupportTicketsPage from '@/pages/support/SupportTicketsPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'


import ProductionReportsPage from '@/pages/reports/ProductionReportsPage.vue'
import ProductionReportsTotalsPage from '@/pages/reports/ProductionReportsTotalsPage.vue'
import MonthlyWorkerProductionPage from '@/pages/reports/MonthlyWorkerProductionPage.vue'

import PurchaseOrderItemsPage from '@/pages/operations/procurement/orders/[id]/items/PurchaseOrderItemsPage.vue'
import PurchaseReceiptNewPage from '@/pages/operations/procurement/orders/[id]/receipts/new/PurchaseReceiptNewPage.vue'
import DirectReceiptNewPage from '@/pages/operations/procurement/receipts/DirectReceiptNewPage.vue'


const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
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
          roles: [1, 2, 7, 8, 10, 11],
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
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/enviroment/role-creation',
        name: 'Roles',
        component: Roles,
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
      {
        path: 'dashboard/production/parameterization-ground/sector-attributes',
        name: 'SectorAttr',
        component: SectorAttr,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/quality',
        name: 'Quality',
        component: Quality,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/season',
        name: 'Season',
        component: Season,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/harvest-format',
        name: 'HarvestFormat',
        component: HarvestFormat,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/type-collection',
        name: 'TypeCollection',
        component: TypeCollection,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/deals',
        name: 'Deals',
        component: Deals,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/scale',
        name: 'Scales',
        component: Scales,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/parameterization-production/exporters',
        name: 'Exporters',
        component: Exporters,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/operations/regularization-production',
        name: 'RegularizationProduction',
        component: RegularizationProduction,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/operations/manual-upload',
        name: 'ManualUpload',
        component: ManualUploadPage,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/production/operations/create-qr',
        name: 'CreateQr',
        component: CreateQrPage,
        meta: {
          roles: [1, 2],
        },
      },
      //Management People
      {
        path: 'dashboard/people-management/contractors',
        name: 'Contractors',
        component: Contractors,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/people-management/positions',
        name: 'Positions',
        component: Positions,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/people-management/groups',
        name: 'Groups',
        component: Groups,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/people-management/squads',
        name: 'Squads',
        component: Squads,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/people-management/shifts',
        name: 'Shifts',
        component: Shifts,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/people-management/workers',
        name: 'Workers',
        component: Workers,
        meta: {
          roles: [1, 2],
        },
      },

      //Páginas de reportes
      {
        path: 'dashboard/reports/production-report',
        name: 'ProductionReports',
        component: ProductionReportsPage,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/reports/total-production-report',
        name: 'ProductionReportsTotals',
        component: ProductionReportsTotalsPage,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/reports/monthly-workers-production',
        name: 'MonthlyWorkerProduction',
        component: MonthlyWorkerProductionPage,
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
        path: 'dashboard/operations/warehouse-inventory',
        name: 'WarehouseInventory',
        component: WarehouseInventory,
        meta: {
          roles: [1, 2, 7, 8],
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
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/purchase-requests',
        name: 'PurchaseRequests',
        component: PurchaseRequestsPage,
        meta: {
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/purchase-orders',
        name: 'PurchaseOrders',
        component: PurchaseOrdersPage,
        meta: {
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/orders/:id/items',
        name: 'PurchaseOrderItems',
        component: PurchaseOrderItemsPage,
        meta: {
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/orders/:id/receipts/new',
        name: 'PurchaseOrderReceiptNew',
        component: PurchaseReceiptNewPage,
        meta: {
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/suppliers',
        name: 'Suppliers',
        component: SuppliersPage,
        meta: {
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/receipts/direct/new',
        name: 'DirectReceiptNew',
        component: DirectReceiptNewPage,
        meta: {
          roles: [1, 2, 7, 8],
        },
      },
      {
        path: 'dashboard/operations/procurement/temporary-approvers',
        name: 'TemporaryApprovers',
        component: TemporaryApproversPage,
        meta: {
          roles: [1, 2, 7, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/procurement/product-config',
        name: 'ProductConfig',
        component: () => import('@/pages/operations/procurement/ProductConfigPage.vue'),
        meta: {
          title: 'Configuración de Productos',
          requiresAuth: true,
          roles: [1, 2, 10],
        },
      },
      {
        path: 'dashboard/operations/alerts',
        name: 'Alerts',
        component: AlertsPage,
        meta: {
          roles: [1, 2],
        },
      },
      {
        path: 'dashboard/operations/field-book/book',
        name: 'FieldBook',
        component: FieldBookPage,
        meta: {
          title: 'Libro de Campo',
          requiresAuth: true,
          roles: [1, 2, 8, 10, 11],
        },
      },
      {
        path: 'dashboard/operations/field-book/config',
        name: 'FieldBookConfig',
        component: () => import('@/pages/operations/FieldBookConfigPage.vue'),
        meta: {
          title: 'Configuración Libro de Campo',
          requiresAuth: true,
          roles: [1, 2, 10],
        },
      },
      {
        path: 'dashboard/support/tickets',
        name: 'SupportTickets',
        component: SupportTicketsPage,
        meta: {
          title: 'Soporte y Consultas',
          requiresAuth: true,
          roles: [1, 2],
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: { requiresAuth: false },
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
  } else if (to.name === 'Dashboard') {
    if ([7, 8, 10].includes(userRol)) {
      next({ name: 'Resume' })
    } else if (userRol === 11) {
      next({ name: 'FieldBook' })
    } else {
      next()
    }
  } else if (to.meta.roles && !to.meta.roles.includes(userRol)) {
    next({ name: 'AccessDenied' })
  } else if (to.name === 'Login' && loggedIn) {
    if ([7, 8, 10].includes(userRol)) {
      next({ name: 'Resume' })
    } else if (userRol === 11) {
      next({ name: 'FieldBook' })
    } else {
      next({ name: 'Dashboard' })
    }
  } else {
    next()
  }
})

export default router
