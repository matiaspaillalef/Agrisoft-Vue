<template>
  <!-- Title Page -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
        <ClipboardDocumentListIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Inventario por Bodega</h1>
        <p class="text-slate-500 font-medium font-inter">Vista consolidada del stock por centro de almacenamiento</p>
      </div>
    </div>

    <!-- Resumen global -->
    <div class="hidden md:flex items-center gap-4">
      <div class="text-right">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bodegas</p>
        <p class="text-2xl font-black text-emerald-600">{{ warehouses.length }}</p>
      </div>
      <div class="w-px h-10 bg-slate-200"></div>
      <div class="text-right">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Productos distintos</p>
        <p class="text-2xl font-black text-blue-600">{{ totalUniqueProducts }}</p>
      </div>
    </div>
  </div>

  <!-- Selector de Bodega (tabs) -->
  <div class="mb-6 flex flex-wrap gap-2">
    <button
      v-for="wh in warehouses" :key="wh.id"
      @click="selectWarehouse(wh)"
      :class="[
        'px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border',
        selectedWarehouse?.id === wh.id
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200'
          : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
      ]"
    >
      {{ wh.name }}
      <span :class="[
        'ml-2 px-2 py-0.5 rounded-lg text-[9px]',
        selectedWarehouse?.id === wh.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
      ]">
        {{ getWarehouseStock(wh.id) }}
      </span>
    </button>
  </div>

  <!-- Grid de inventario -->
  <div class="mt-[3px] flex w-full flex-grow flex-col rounded-2xl bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative overflow-hidden">
    <LoadingOverlay :show="loading" />

    <!-- Header de bodega seleccionada -->
    <div v-if="selectedWarehouse" class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
          <BuildingStorefrontIcon class="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 class="text-lg font-black text-slate-800">{{ selectedWarehouse.name }}</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {{ inventarioActual.length }} productos · Stock total: {{ totalStockActual }} unidades
          </p>
        </div>
      </div>
    </div>

    <div v-if="!selectedWarehouse && !loading" class="flex flex-col items-center justify-center py-20 text-slate-400">
      <BuildingStorefrontIcon class="w-16 h-16 mb-4 opacity-30" />
      <p class="text-sm font-bold uppercase tracking-widest">Selecciona una bodega para ver su inventario</p>
    </div>

    <DxDataGrid
      v-if="selectedWarehouse"
      :data-source="inventarioActual"
      key-expr="product_id"
      :show-borders="true"
      :column-auto-width="true"
      :width="'100%'"
      @exporting="onExporting"
      ref="gridRef"
    >
      <DxExport :enabled="true" :allow-export-selected-data="false" />
      <DxColumnFixing :enabled="true" />
      <DxScrolling column-rendering-mode="virtual" />
      <DxPaging :page-size="25" />
      <DxPager :show-page-size-selector="true" :allowed-page-sizes="[25, 50, 100]" :show-info="true"
        info-text="Página {0} de {1} ({2} registros)" />
      <DxSearchPanel :visible="true" placeholder="Buscar producto..." />

      <DxToolbar>
        <DxToolbarItem location="before">
          <template #default>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span class="text-xs font-black text-slate-600 uppercase tracking-widest">
                Inventario — {{ selectedWarehouse?.name }}
              </span>
            </div>
          </template>
        </DxToolbarItem>
        <DxToolbarItem name="exportButton" location="after" />
        <DxToolbarItem name="searchPanel" location="after" />
      </DxToolbar>

      <DxColumn data-field="sku" caption="SKU" css-class="!text-left" :width="120" />
      <DxColumn data-field="name" caption="Producto" css-class="!text-left" />
      <DxColumn data-field="active_ingredient" caption="Comp. Activo" css-class="!text-left" />
      <DxColumn data-field="quantity" caption="Stock" css-class="!text-right" :width="100" alignment="right" />
      <DxColumn data-field="min_stock" caption="Stock Mín." css-class="!text-right" :width="110" alignment="right"
        :cell-template="minStockTemplate" />
      <DxColumn data-field="max_stock" caption="Stock Máx." css-class="!text-right" :width="110" alignment="right" />
      <DxColumn caption="Estado" :calculate-cell-value="calcEstado" :cell-template="estadoCellTemplate"
        css-class="!text-center" :width="130" />
    </DxDataGrid>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import {
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/solid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxSearchPanel,
  DxExport,
  DxColumnFixing,
  DxScrolling,
  DxToolbar,
  DxItem as DxToolbarItem,
} from 'devextreme-vue/data-grid'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import conexionApi from '@/services/conexionApi.js'

/* ============================================================
   STATE
============================================================ */
const loading = ref(false)
const warehouses = ref([])
const allProducts = ref([])
const selectedWarehouse = ref(null)
const gridRef = ref(null)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

/* ============================================================
   COMPUTED
============================================================ */
const inventarioActual = computed(() => {
  if (!selectedWarehouse.value) return []

  const wh = selectedWarehouse.value
  return allProducts.value
    .filter(p => p.warehouses?.some(w => w.warehouse_id === wh.id))
    .map(p => {
      const whData = p.warehouses.find(w => w.warehouse_id === wh.id)
      return {
        product_id: p.id,
        sku: p.sku,
        name: p.name,
        active_ingredient: p.active_ingredient || '—',
        quantity: whData?.quantity ?? 0,
        min_stock: whData?.min_stock ?? null,
        max_stock: whData?.max_stock ?? null,
      }
    })
    .sort((a, b) => b.quantity - a.quantity)
})

const totalStockActual = computed(() =>
  inventarioActual.value.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
)

const totalUniqueProducts = computed(() => {
  const ids = new Set()
  allProducts.value.forEach(p =>
    p.warehouses?.forEach(w => ids.add(p.id))
  )
  return ids.size
})

/* ============================================================
   HELPERS
============================================================ */
function getWarehouseStock(warehouseId) {
  let total = 0
  allProducts.value.forEach(p => {
    const found = p.warehouses?.find(w => w.warehouse_id === warehouseId)
    if (found) total += Number(found.quantity || 0)
  })
  return total
}

function selectWarehouse(wh) {
  selectedWarehouse.value = wh
}

function calcEstado(rowData) {
  const { quantity, min_stock } = rowData
  if (min_stock === null || min_stock === undefined) return 'normal'
  if (quantity === 0) return 'sinstock'
  if (quantity <= min_stock) return 'bajo'
  return 'normal'
}

/* ============================================================
   CELL TEMPLATES
============================================================ */
function minStockTemplate(cellElement, cellInfo) {
  const val = cellInfo.value
  const qty = cellInfo.data.quantity
  if (val === null || val === undefined) {
    cellElement.innerHTML = `<span class="text-slate-300 text-xs">—</span>`
    return
  }
  const color = qty <= val ? 'text-red-600 font-black' : 'text-slate-600'
  cellElement.innerHTML = `<span class="${color}">${val}</span>`
}

function estadoCellTemplate(cellElement, cellInfo) {
  const estado = cellInfo.value
  const map = {
    sinstock: { label: 'Sin stock', cls: 'bg-red-100 text-red-700 border-red-200' },
    bajo: { label: 'Stock bajo', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    normal: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }
  const { label, cls } = map[estado] || map.normal
  cellElement.innerHTML = `
    <span class="inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${cls}">
      ${label}
    </span>`
}

/* ============================================================
   CARGA DE DATOS
============================================================ */
async function loadData() {
  loading.value = true
  try {
    const [whRes, prodRes] = await Promise.all([
      conexionApi.get(`/warehouses/getWarehouses/${companyID}`),
      conexionApi.get(`/products/${companyID}`),
    ])

    if (whRes.data.code === 'OK') {
      warehouses.value = whRes.data.warehouses.map(w => ({ id: w.id, name: w.name }))
      if (warehouses.value.length) selectedWarehouse.value = warehouses.value[0]
    }

    if (prodRes.data.code === 'OK') {
      allProducts.value = prodRes.data.products
    }
  } catch (err) {
    console.error('Error cargando inventario:', err)
  } finally {
    loading.value = false
  }
}

loadData()

/* ============================================================
   EXPORTAR A EXCEL
============================================================ */
function onExporting(e) {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet(`Inventario - ${selectedWarehouse.value?.name || 'Bodega'}`)

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
    customizeCell: ({ gridCell, excelCell }) => {
      if (gridCell.rowType === 'header') {
        excelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }
        excelCell.alignment = { horizontal: 'center' }
      }
      if (gridCell.rowType === 'data') {
        excelCell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        }
        // Colorear fila según estado
        if (gridCell.column.caption === 'Estado') {
          excelCell.value =
            gridCell.value === 'sinstock' ? 'Sin stock' :
            gridCell.value === 'bajo' ? 'Stock bajo' : 'Disponible'
        }
        if (gridCell.column.dataField === 'quantity') {
          const qty = gridCell.data?.quantity
          const min = gridCell.data?.min_stock
          if (qty === 0) {
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }
            excelCell.font = { bold: true, color: { argb: 'FFDC2626' } }
          } else if (min !== null && qty <= min) {
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }
            excelCell.font = { bold: true, color: { argb: 'FFEA580C' } }
          }
        }
      }
    }
  }).then(() => {
    workbook.xlsx.writeBuffer().then(buffer => {
      const now = new Date()
      const date = now.toISOString().split('T')[0]
      const whName = (selectedWarehouse.value?.name || 'bodega').replace(/\s+/g, '_').toLowerCase()
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        `inventario_${whName}_${date}.xlsx`
      )
    })
  })
}
</script>

<style scoped>
:deep(.dx-datagrid-export-button) {
  background-color: #059669 !important;
  color: white !important;
  border-radius: 12px !important;
  border: none !important;
  box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2) !important;
  transition: all 0.2s ease !important;
  padding: 0px 12px !important;
  height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.dx-datagrid-export-button:hover) {
  background-color: #047857 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3) !important;
}
</style>
