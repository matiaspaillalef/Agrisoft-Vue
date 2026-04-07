<template>
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
        <PresentationChartLineIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Resumen Operativo</h1>
        <p class="text-slate-500 font-medium font-inter">
          {{ userRoleId === 10 ? 'Seguimiento de aplicaciones y labores de campo' : (userRoleId === 11 ? 'Listado de aplicaciones y estados diarios' : 'Alertas de stock, órdenes pendientes y logística') }}
        </p>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <template v-if="userRoleId === 11">
      <!-- Role 11: Aplicador Stats -->
      <!-- Overdue -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-rose-50 rounded-2xl text-rose-600">
          <ExclamationTriangleIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Atrasadas</p>
          <h3 class="text-2xl font-black text-slate-800">{{ overdueFieldOrdersCount }}</h3>
          <p class="text-[10px] text-rose-600 font-bold mt-1">Requiere atención urgente</p>
        </div>
      </div>

      <!-- Pending -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-orange-50 rounded-2xl text-orange-600">
          <ClockIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Por Aplicar</p>
          <h3 class="text-2xl font-black text-slate-800">{{ pendingFieldOrdersCount }}</h3>
          <p class="text-[10px] text-orange-600 font-bold mt-1">Tareas pendientes totales</p>
        </div>
      </div>

      <!-- Completed -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
          <ClipboardDocumentCheckIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aplicadas</p>
          <h3 class="text-2xl font-black text-slate-800">{{ appliedFieldOrdersCount }}</h3>
          <p class="text-[10px] text-emerald-600 font-bold mt-1">Gestionadas este periodo</p>
        </div>
      </div>
    </template>

    <template v-else-if="userRoleId === 10">
      <!-- Role 10: Agronomo Stats -->
      <!-- Stat Card 1: Pending Applications -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-orange-50 rounded-2xl text-orange-600">
          <ClockIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Órdenes Pendientes</p>
          <h3 class="text-2xl font-black text-slate-800">{{ pendingFieldOrdersCount }}</h3>
          <p class="text-[10px] text-orange-600 font-bold mt-1">Por aplicar o completar</p>
        </div>
      </div>

      <!-- Stat Card 2: Applied Orders -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-blue-50 rounded-2xl text-blue-600">
          <BeakerIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Órdenes Aplicadas</p>
          <h3 class="text-2xl font-black text-slate-800">{{ appliedFieldOrdersCount }}</h3>
          <p class="text-[10px] text-blue-600 font-bold mt-1">Total aplicadas este periodo</p>
        </div>
      </div>

      <!-- Stat Card 3: Total Programmed -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
          <ClipboardDocumentCheckIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Órdenes Cerradas</p>
          <h3 class="text-2xl font-black text-slate-800">{{ closedFieldOrdersCount }}</h3>
          <p class="text-[10px] text-emerald-600 font-bold mt-1">Validadas y archivadas</p>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Original Stat Cards (Role 7, 8, etc.) -->
      <!-- Stat Card 1: Low Stock -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-amber-50 rounded-2xl text-amber-600">
          <ExclamationTriangleIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Alertas de Stock</p>
          <h3 class="text-2xl font-black text-slate-800">{{ lowStockCount }}</h3>
          <p class="text-[10px] text-amber-600 font-bold mt-1">Bajo el mínimo crítico</p>
        </div>
      </div>

      <!-- Stat Card 2: Pending Orders -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-blue-50 rounded-2xl text-blue-600">
          <ShoppingCartIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">OC Pendientes</p>
          <h3 class="text-2xl font-black text-slate-800">{{ pendingOrdersCount }}</h3>
          <p class="text-[10px] text-blue-600 font-bold mt-1">Por recibir o aprobar</p>
        </div>
      </div>

      <!-- Stat Card 3: Recent Receipts -->
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
          <TruckIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ingresos Recientes</p>
          <h3 class="text-2xl font-black text-slate-800">{{ recentReceivedCount }}</h3>
          <p class="text-[10px] text-emerald-600 font-bold mt-1">Total recibidas</p>
        </div>
      </div>
    </template>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <template v-if="[10, 11].includes(userRoleId)">
      <!-- Role 10 & 11: Field Book Activity -->
      <div class="col-span-full bg-white rounded-[2.5rem] shadow-xl p-8 relative min-h-[500px] border border-slate-50">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div :class="userRoleId === 11 ? 'bg-indigo-500' : 'bg-orange-500'" class="w-2 h-8 rounded-full"></div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">
              {{ userRoleId === 11 ? 'Mis Labores Pendientes' : 'Actividad Reciente del Libro de Campo' }}
            </h2>
          </div>
          <router-link to="/dashboard/operations/field-book/book"
            class="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <ArrowTopRightOnSquareIcon class="w-5 h-5" />
          </router-link>
        </div>

        <LoadingOverlay :show="loadingFieldOrders" />

        <DxDataGrid :data-source="computedFieldOrders" :show-borders="false" class="custom-grid w-full"
          :column-auto-width="true" :no-data-text="'No hay órdenes de aplicación registradas'">
          <DxScrolling mode="virtual" />
          <DxColumn data-field="order_number" caption="#Orden" width="100"
            css-class="font-black text-blue-600 !text-left" />
          <DxColumn data-field="ground_name" caption="Campo" css-class="!text-left" />
          <DxColumn data-field="specie_name" caption="Especie" css-class="!text-left" />
          <DxColumn data-field="task_name" caption="Tarea" css-class="!text-left" />
          <DxColumn data-field="status" caption="Estado" cell-template="fieldStatusTemplate" width="140" />
          <DxColumn data-field="issue_date" caption="Fecha Plan" data-type="date" format="dd/MM/yyyy" width="120" />
          <DxColumn v-if="userRoleId === 11" caption="Acciones" cell-template="actionsTemplate" width="120"
            alignment="center" />

          <template #fieldStatusTemplate="{ data }">
            <span :class="getFieldStatusClass(data.value)"
              class="px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider block text-center">
              {{ formatFieldStatusText(data.value) }}
            </span>
          </template>

          <template #actionsTemplate="{ data }">
            <button v-if="['GENERATED', 'PARTIAL'].includes(data.value.status)" @click="goToApply(data.value)"
              class="w-full bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-100">
              <CheckCircleIcon class="w-4 h-4" />
              Aplicar
            </button>
          </template>
        </DxDataGrid>
      </div>
    </template>

    <template v-else>
      <!-- Original Grids (Role 7, 8, etc.) -->
      <!-- Stock Alerts Grid -->
      <div class="bg-white rounded-[2.5rem] shadow-xl p-8 relative min-h-[500px] border border-slate-50">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-2 h-8 bg-amber-500 rounded-full"></div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Críticos de Bodega</h2>
          </div>
          <router-link to="/dashboard/operations/products"
            class="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all">
            <ArrowTopRightOnSquareIcon class="w-5 h-5" />
          </router-link>
        </div>

        <LoadingOverlay :show="loadingStock" />

        <DxDataGrid :data-source="lowStockData" :show-borders="false" class="custom-grid w-full"
          :column-auto-width="true" :no-data-text="'No hay alertas de stock'">
          <DxScrolling mode="virtual" />
          <DxColumn data-field="sku" caption="SKU" width="90" css-class="font-mono text-slate-400 !text-left" />
          <DxColumn data-field="name" caption="Producto" css-class="!text-left" />
          <DxColumn data-field="warehouse_name" caption="Bodega" css-class="!text-left" />
          <DxColumn data-field="quantity" caption="Stock" width="80" alignment="right" cell-template="stockTemplate" />
          <DxColumn data-field="min_stock" caption="Min" width="80" alignment="right" css-class="text-slate-400" />

          <template #stockTemplate="{ data }">
            <span class="font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">{{ data.value }}</span>
          </template>
        </DxDataGrid>
      </div>

      <!-- Active Orders Grid -->
      <div class="bg-white rounded-[2.5rem] shadow-xl p-8 relative min-h-[500px] border border-slate-50">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Órdenes Activas</h2>
          </div>
          <router-link to="/dashboard/operations/procurement/purchase-orders"
            class="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
            <ArrowTopRightOnSquareIcon class="w-5 h-5" />
          </router-link>
        </div>

        <LoadingOverlay :show="loadingOrders" />

        <DxDataGrid :data-source="activeOrdersData" :show-borders="false" class="custom-grid w-full"
          :column-auto-width="true" :no-data-text="'No hay órdenes de compra activas'">
          <DxScrolling mode="virtual" />
          <DxColumn data-field="order_code" caption="#Orden" width="100"
            css-class="font-black text-blue-600 !text-left" />
          <DxColumn data-field="supplier_name" caption="Proveedor" css-class="!text-left" />
          <DxColumn data-field="status" caption="Estado" cell-template="statusTemplate" width="140" />
          <DxColumn data-field="created_at" caption="Fecha" data-type="date" format="dd/MM/yyyy" width="100" />

          <template #statusTemplate="{ data }">
            <span :class="getStatusClass(data.value)"
              class="px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider block text-center">
              {{ formatStatusText(data.value) }}
            </span>
          </template>
        </DxDataGrid>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  PresentationChartLineIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/solid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { DxDataGrid, DxColumn, DxScrolling } from 'devextreme-vue/data-grid'
import conexionApi from '@/services/conexionApi'
import { formatStatusText } from '@/utils/herlpers'
import FieldBookService from '@/api/field-book.service'

const loadingStock = ref(false)
const loadingOrders = ref(false)
const loadingFieldOrders = ref(false)

const lowStockData = ref([])
const activeOrdersData = ref([])
const fieldOrdersData = ref([])
const recentReceivedCount = ref(0)

const companyID = localStorage.getItem('userIdCompany') || '1'
const userRoleId = Number(localStorage.getItem('rol'))
const userId = localStorage.getItem('userId')

const lowStockCount = computed(() => lowStockData.value.length)
const pendingOrdersCount = computed(() => activeOrdersData.value.length)

// Field Book Specific Stats
const pendingFieldOrdersCount = computed(() => {
  const data = userRoleId === 11
    ? fieldOrdersData.value.filter(o => Number(o.applicator_id) === Number(userId))
    : fieldOrdersData.value
  return data.filter(o => ['GENERATED', 'PARTIAL'].includes(o.status)).length
})

const appliedFieldOrdersCount = computed(() => {
  const data = userRoleId === 11
    ? fieldOrdersData.value.filter(o => Number(o.applicator_id) === Number(userId))
    : fieldOrdersData.value
  return data.filter(o => o.status === 'APPLIED').length
})

const closedFieldOrdersCount = computed(() => {
  const data = userRoleId === 11
    ? fieldOrdersData.value.filter(o => Number(o.applicator_id) === Number(userId))
    : fieldOrdersData.value
  return data.filter(o => o.status === 'CLOSED').length
})

// Role 11 Specific: Overdue Tasks
const overdueFieldOrdersCount = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0)
  const data = userRoleId === 11
    ? fieldOrdersData.value.filter(o => Number(o.applicator_id) === Number(userId))
    : fieldOrdersData.value
  return data.filter(o => {
    const isPending = ['GENERATED', 'PARTIAL'].includes(o.status)
    const orderDate = new Date(o.issue_date).setHours(0, 0, 0, 0)
    return isPending && orderDate < today
  }).length
})

const computedFieldOrders = computed(() => {
  if (userRoleId === 11) {
    return fieldOrdersData.value.filter(o => Number(o.applicator_id) === Number(userId))
  }
  return fieldOrdersData.value
})

const fetchDashboardData = async () => {
  if ([7, 8].includes(userRoleId)) {
    fetchLogisticsData()
  } else if ([10, 11].includes(userRoleId)) {
    fetchFieldBookData()
  } else {
    // If Admin/Operations, maybe show everything? For now show logistics
    fetchLogisticsData()
  }
}

const fetchLogisticsData = async () => {
  loadingStock.value = true
  loadingOrders.value = true

  try {
    const productsRes = await conexionApi.get(`/products/${companyID}`)
    const products = productsRes.data.products || []

    const alerts = []
    products.forEach(p => {
      if (p.warehouses && Array.isArray(p.warehouses)) {
        p.warehouses.forEach(w => {
          const qty = Number(w.quantity || 0)
          const min = Number(w.min_stock || 0)
          if (min > 0 && qty <= min) {
            alerts.push({ sku: p.sku, name: p.name, warehouse_name: w.warehouse_name, quantity: qty, min_stock: min })
          }
        })
      }
    })
    lowStockData.value = alerts

    const ordersRes = await conexionApi.get('/purchase-orders', { params: { company_id: companyID } })
    const orders = ordersRes.data.orders || []
    activeOrdersData.value = orders.filter(o => ['DRAFT', 'APPROVED', 'PARTIAL_RECEIVED'].includes(o.status))
    recentReceivedCount.value = orders.filter(o => o.status === 'RECEIVED').length

  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
  } finally {
    loadingStock.value = false
    loadingOrders.value = false
  }
}

const fetchFieldBookData = async () => {
  loadingFieldOrders.value = true
  try {
    const res = await FieldBookService.getOrders(companyID)
    fieldOrdersData.value = res.data.orders || []
    console.log('FIELD ORDERS DATA SAMPLE:', fieldOrdersData.value[0])
  } catch (error) {
    console.error('Error fetching field book summary:', error)
  } finally {
    loadingFieldOrders.value = false
  }
}

const goToApply = (order) => {
  router.push({
    path: '/dashboard/operations/field-book/book',
    query: { order_id: order.id }
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'DRAFT': return 'bg-slate-100 text-slate-500'
    case 'APPROVED': return 'bg-blue-50 text-blue-600 border border-blue-100'
    case 'PARTIAL_RECEIVED': return 'bg-amber-50 text-amber-600 border border-amber-100'
    case 'RECEIVED': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    case 'CANCELLED': return 'bg-rose-50 text-rose-600 border border-rose-100'
    default: return 'bg-gray-100 text-gray-500'
  }
}

const getFieldStatusClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-slate-100 text-slate-500'
    case 'GENERATED': return 'bg-blue-100 text-blue-600'
    case 'PARTIAL': return 'bg-orange-100 text-orange-600'
    case 'APPLIED': return 'bg-indigo-100 text-indigo-600 font-black'
    case 'CLOSED': return 'bg-emerald-100 text-emerald-600'
    default: return 'bg-gray-100 text-gray-400'
  }
}

const formatFieldStatusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Borrador'
    case 'GENERATED': return 'Pendiente'
    case 'PARTIAL': return 'Parcial'
    case 'APPLIED': return 'Aplicada'
    case 'CLOSED': return 'Cerrada'
    default: return status
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.custom-grid :deep(.dx-datagrid-headers) {
  background: transparent !important;
  border-bottom: 2px solid #f1f5f9 !important;
}

.custom-grid :deep(.dx-datagrid-headers .dx-datagrid-text-content) {
  color: #94a3b8 !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  font-size: 10px !important;
}

.custom-grid :deep(.dx-data-row) {
  height: 60px !important;
}

.custom-grid :deep(.dx-datagrid-rowsview .dx-row > td) {
  padding: 1rem !important;
  font-weight: 600 !important;
  color: #334155 !important;
  font-size: 13px !important;
}
</style>
