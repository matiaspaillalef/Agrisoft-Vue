<template>
  <!-- Title -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <CubeIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Productos</h1>
        <p class="text-slate-500 font-medium font-inter">Administración centralizada de productos, SKUs y stock global
        </p>
      </div>
    </div>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative overflow-hidden">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'" @editing-start="onEditingStart" @saving="onSaving" @exporting="onExporting">
      <DxExport :enabled="true" :allow-export-selected-data="false" />
      <!-- Panel adaptable -->
      <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
      <DxColumnFixing :enabled="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <DxPaging :page-size="15" />
      <DxSearchPanel :visible="true" placeholder="Filtrar registros..." />
      <DxToolbar>
        <DxToolbarItem v-if="canEdit" name="addRowButton" location="after" />
        <DxToolbarItem name="exportButton" location="after" />
        <DxToolbarItem name="searchPanel" location="after" />
      </DxToolbar>

      <DxColumn data-field="sku" caption="SKU" css-class="!text-left" />
      <DxColumn data-field="name" caption="Nombre" css-class="!text-left" />
      <DxColumn data-field="active_ingredient" caption="Comp. Activo" css-class="!text-left" />
      <DxColumn data-field="composition" caption="Composición" css-class="!text-left" />
      <DxColumn data-field="objective" caption="Objetivo / Justificación" css-class="!text-left" />
      <DxColumn data-field="description" caption="Descripción" css-class="!text-left" :visible="false" />
      <DxColumn caption="Stock global" :calculate-cell-value="calculateTotalStock" css-class="!text-left" />
      <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-center" />
      <DxColumn type="buttons" width="140" :buttons="customButtons" />
      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
        :texts="{
          confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?',
        }">
        <DxPopup title="Gestión de Productos" :show-title="true" :width="750" :height="480"
          :toolbar-items="popupToolbar" />

        <DxForm :col-count="2" :label-location="'top'">
          <DxItem data-field="name" caption="Nombre del Producto" :editor-options="{ readOnly: !canEdit }"
            :width="'100%'" />
          <DxItem data-field="sku" caption="SKU / Código" :editor-options="{ readOnly: !canEdit }" />

          <DxItem data-field="active_ingredient" caption="Ingrediente Activo"
            :editor-options="{ readOnly: !canEdit }" />
          <DxItem data-field="composition" caption="Composición" :editor-options="{ readOnly: !canEdit }" />

          <DxItem data-field="objective" caption="Objetivo / Justificación del Uso" editor-type="dxTextArea"
            :col-span="2"
            :editor-options="{ height: 80, readOnly: !canEdit, placeholder: 'Describa el objetivo técnico o justificación para este producto...' }" />

          <DxItem data-field="description" caption="Descripción Adicional / Notas" editor-type="dxTextArea"
            :col-span="2"
            :editor-options="{ height: 80, readOnly: !canEdit, placeholder: 'Notas adicionales, recomendaciones de almacenamiento, etc.' }" />

          <DxItem data-field="__usersDirty" :visible="false" />
        </DxForm>
      </DxEditing>


    </DxDataGrid>
  </div>

  <!-- Modal de solo lectura Modernizado -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[100] px-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModals"></div>

    <div
      class="bg-white dark:bg-navy-700 rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden transform transition-all border border-slate-100">
      <!-- HEADER -->
      <div class="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <BeakerIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">Detalles del Producto</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ficha Técnica y Stock</p>
          </div>
        </div>
        <button @click="closeModals" class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 w-fit!">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- CONTENT -->
      <div class="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div class="grid grid-cols-2 gap-8">
          <!-- Info Al Principal -->
          <div class="col-span-full bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
            <h3 class="text-2xl font-black text-blue-900 mb-1">{{ selectedItem?.name }}</h3>
            <div class="flex items-center gap-2">
              <span
                class="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg tracking-wider uppercase">SKU:
                {{ selectedItem?.sku }}</span>
              <span
                class="px-3 py-1 bg-white text-blue-600 border border-blue-100 text-[10px] font-black rounded-lg tracking-wider uppercase">{{ calculateTotalStock(selectedItem) }}
                UNIDADES TOTAL</span>
            </div>
          </div>

          <!-- Campos Técnicos -->
          <div class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ingrediente
                Activo</label>
              <div class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100/50">
                {{ selectedItem?.active_ingredient || 'No especificado' }}
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Composición</label>
              <div class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100/50">
                {{ selectedItem?.composition || 'N/A' }}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo /
                Justificación</label>
              <div
                class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100/50 italic text-sm">
                "{{ selectedItem?.objective || 'Sin objetivo definido' }}"
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción
                General</label>
              <div
                class="px-4 py-3 bg-slate-50 rounded-2xl font-medium text-slate-500 border border-slate-100/50 text-sm">
                {{ selectedItem?.description || 'Sin comentarios adicionales.' }}
              </div>
            </div>
          </div>

          <!-- STOCK POR BODEGA -->
          <div class="col-span-full">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <IdentificationIcon class="w-4 h-4 text-emerald-600" />
              </div>
              <h4 class="text-xs font-black text-slate-700 uppercase tracking-widest">Disponibilidad por Bodega</h4>
            </div>

            <div v-if="selectedItem?.warehouses?.length"
              class="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
              <table class="min-w-full divide-y divide-slate-100">
                <thead class="bg-slate-50/80">
                  <tr>
                    <th class="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Bodega / Almacén</th>
                    <th class="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Stock Disponible</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="(product, index) in selectedItem?.warehouses" :key="index"
                    class="hover:bg-blue-50/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full"
                          :class="product.quantity > 0 ? 'bg-emerald-500' : 'bg-rose-400'"></div>
                        <span class="text-sm font-bold text-slate-700">{{ product.warehouse_name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="px-3 py-1 bg-slate-50 rounded-lg text-sm font-black"
                        :class="product.quantity > 0 ? 'text-emerald-700' : 'text-rose-500'">
                        {{ product.quantity }} <small
                          class="text-[10px] ml-1">{{ product.quantity === 1 ? 'UNIDAD' : 'UNIDADES' }}</small>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin stock en bodegas vinculadas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3 px-8">
        <button @click="closeModals"
          class="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          Cerrar Vista
        </button>
      </div>
    </div>
  </div>

  <!-- ===================== MODAL TRAZABILIDAD ===================== -->
  <div v-if="showTraceModal" class="fixed inset-0 flex items-center justify-center z-[110] px-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showTraceModal = false"></div>
    <div
      class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">

      <!-- HEADER -->
      <div class="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <MapPinIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">Trazabilidad del Producto</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              SKU: {{ selectedTraceProduct?.sku }} &nbsp;·&nbsp; {{ selectedTraceProduct?.name }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Excel -->
          <button @click="onTraceExportExcel"
            class="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" /> Excel
          </button>
          <!-- PDF -->
          <button @click="onTracePrintPDF"
            class="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5">
            <DocumentArrowDownIcon class="w-3.5 h-3.5" /> PDF
          </button>
          <button @click="showTraceModal = false"
            class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 w-fit!">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="flex items-center gap-8 px-8 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total movimientos</p>
          <p class="text-xl font-black text-slate-800">{{ traceMovements.length }}</p>
        </div>
        <div class="w-px h-8 bg-slate-100"></div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos</p>
          <p class="text-xl font-black text-emerald-600">
            {{ traceMovements.filter(m => ['ingreso','ingreso_transito','recepcion_compra'].includes(m.movement_type)).length }}
          </p>
        </div>
        <div class="w-px h-8 bg-slate-100"></div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Egresos</p>
          <p class="text-xl font-black text-rose-600">
            {{ traceMovements.filter(m => ['egreso','egreso_transito','rebaja','cancelacion'].includes(m.movement_type)).length }}
          </p>
        </div>
        <div class="w-px h-8 bg-slate-100"></div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Último movimiento</p>
          <p class="text-xs font-bold text-slate-600">{{ traceMovements[0]?.created_at_fmt || '—' }}</p>
        </div>
      </div>

      <!-- Grid -->
      <div class="p-6 flex-grow overflow-hidden relative">
        <LoadingOverlay :show="traceLoading" />

        <div v-if="!traceLoading && traceMovements.length === 0"
          class="flex flex-col items-center justify-center py-16 text-slate-400">
          <MapPinIcon class="w-12 h-12 mb-3 opacity-20" />
          <p class="text-sm font-bold uppercase tracking-widest">Sin movimientos registrados</p>
          <p class="text-xs mt-1 text-slate-300">Los movimientos se generan automáticamente con tránsitos y ajustes de stock</p>
        </div>

        <DxDataGrid
          v-else
          ref="traceGridRef"
          :data-source="traceMovements"
          key-expr="id"
          :show-borders="true"
          :column-auto-width="true"
          :width="'100%'"
          :height="380"
        >
          <DxColumnFixing :enabled="true" />
          <DxScrolling column-rendering-mode="virtual" />
          <DxPaging :page-size="20" />
          <DxSearchPanel :visible="true" placeholder="Buscar movimiento..." />
          <DxToolbar>
            <DxToolbarItem name="searchPanel" location="after" />
          </DxToolbar>
          <DxColumn data-field="created_at_fmt" caption="Fecha / Hora" :width="150" css-class="!text-left" />
          <DxColumn data-field="movement_type" caption="Tipo" :width="170"
            :cell-template="traceBadgeTemplate" css-class="!text-left" />
          <DxColumn caption="Bodega / Ruta" :calculate-cell-value="traceRouteValue" css-class="!text-left" />
          <DxColumn data-field="quantity" caption="Cantidad" alignment="right" :width="90" />
          <DxColumn data-field="stock_before" caption="Stock antes" alignment="right" :width="100" />
          <DxColumn data-field="stock_after" caption="Stock después" alignment="right" :width="110" />
          <DxColumn data-field="user_name" caption="Responsable" css-class="!text-left" />
          <DxColumn data-field="reference_code" caption="Referencia" css-class="!text-left" :width="140" />
          <DxColumn data-field="notes" caption="Notas" css-class="!text-left" />
        </DxDataGrid>
      </div>

      <!-- FOOTER -->
      <div class="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3 px-8 flex-shrink-0">
        <button @click="showTraceModal = false"
          class="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          Cerrar
        </button>
      </div>
    </div>
  </div>

</template>


<script setup>
import { ref, computed } from 'vue'
import {
  CubeIcon, BeakerIcon, XMarkIcon, IdentificationIcon, MapPinIcon,
  ArrowDownTrayIcon, DocumentArrowDownIcon
} from '@heroicons/vue/24/solid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import CustomStore from 'devextreme/data/custom_store'

import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  DxPopup,
  DxForm,
  DxItem,
  DxSearchPanel,
  DxSelection,
  DxFilterRow,
  DxExport,
  DxColumnChooser,
  DxColumnFixing,
  DxScrolling,
  DxToolbar,
  DxItem as DxToolbarItem
} from 'devextreme-vue/data-grid'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { loadMessages, locale } from 'devextreme/localization'

import conexionApi from '@/services/conexionApi.js'
import { formatDate, formatDateHrs, statusCellTemplate } from '@/utils/herlpers'

/* ======================
   STATE
====================== */
const loading = ref(false)
const stockModalVisible = ref(false)
const selectedProduct = ref(null)
const warehousesStock = ref([])
const mainGridRef = ref(null)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0
const canEdit = [1, 8].includes(userRol)

const showViewModal = ref(false)
const selectedItem = ref(null)

function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

function closeModals() {
  showViewModal.value = false
}

/* ======================
   DATA SOURCE PRODUCTS
====================== */
const dataSource = new CustomStore({
  key: 'id',

  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/products/' + companyID)
      return (data.products || []).map(p => ({
        ...p,
        description: p.description ?? ''
      }))
    } finally {
      loading.value = false
    }
  },

  insert: async (values) => {
    loading.value = true
    try {
      await conexionApi.post('/products', {
        ...values,
        company_id: companyID
      })
    } finally {
      loading.value = false
    }
  },

  update: async (key, values) => {
    loading.value = true
    try {
      await conexionApi.put(`/products/${key}`, values)
    } finally {
      loading.value = false
    }
  },

  remove: async (key) => {
    loading.value = true
    try {
      await conexionApi.delete(`/products/${key}`)
    } finally {
      loading.value = false
    }
  }
})


/* ======================
   HELPERS
====================== */
const calculateTotalStock = (row) => {
  if (!Array.isArray(row.warehouses)) return 0
  return row.warehouses.reduce(
    (sum, w) => sum + Number(w.quantity || 0),
    0
  )
}

/* ======================
   OPEN MODAL
====================== */
const openStockModal = async (e) => {
  loading.value = true
  try {
    selectedProduct.value = e.row.data

    const { data } = await conexionApi.get(
      `/warehouses/getWarehouses/${companyID}`
    )

    warehousesStock.value = data.warehouses.map(w => {
      const existing = selectedProduct.value.warehouses
        .find(ws => ws.warehouse_id === w.id)

      return {
        warehouse_id: w.id,
        warehouse_name: w.name,
        quantity: existing?.quantity || 0,
        min_stock: existing?.min_stock || null,
        max_stock: existing?.max_stock || null
      }
    })

    stockModalVisible.value = true
  } finally {
    loading.value = false
  }
}

/* ======================
   SAVE STOCK
 ====================== */
const saveStock = async () => {
  loading.value = true
  try {
    for (const row of warehousesStock.value) {
      await conexionApi.post('/products/stock', {
        product_id: selectedProduct.value.id,
        warehouse_id: row.warehouse_id,
        company_id: companyID,
        quantity: row.quantity,
        min_stock: row.min_stock,
        max_stock: row.max_stock
      })
    }

    stockModalVisible.value = false
    mainGridRef.value?.instance.refresh()
  } finally {
    loading.value = false
  }
}

const onEditingStart = async (e) => {
  const product = e.data

  if (!product?.id) {
    warehousesStock.value = []
    return
  }

  const { data } = await conexionApi.get(
    `/warehouses/getWarehouses/${companyID}`
  )

  warehousesStock.value = data.warehouses.map(w => {
    const existing = product.warehouses?.find(
      pw => pw.warehouse_id === w.id
    )

    return {
      warehouse_id: w.id,
      warehouse_name: w.name,
      quantity: existing?.quantity ?? 0
    }
  })
}
const onSaving = async (e) => {
  if (!e.changes.length) return

  const change = e.changes[0]

  // 👉 SOLO PRODUCTO
  if (change.type === 'insert') {
    await conexionApi.post('/products', {
      ...change.data,
      company_id: companyID
    })
  }

  if (change.type === 'update') {
    await conexionApi.put(`/products/${change.key}`, change.data)
  }

  if (change.type === 'remove') {
    await conexionApi.delete(`/products/${change.key}`)
  }

  e.cancel = true
  mainGridRef.value?.instance.refresh()
}


function traceBadgeTemplate(cellElement, cellInfo) {
  const meta = traceTypeMeta(cellInfo.value)
  cellElement.innerHTML = `
    <span class="inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${meta.cls}">
      ${meta.label}
    </span>`
}

function traceRouteValue(rowData) {
  const origin  = rowData.origin_warehouse_name  || ''
  const destiny = rowData.destiny_warehouse_name || ''
  if (origin && destiny) return `${origin} → ${destiny}`
  return origin || destiny || '—'
}

// --- Botones personalizados ---
const customButtons = [
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: (e) => verRegistro(e.row.data),
  },
  {
    hint: 'Trazabilidad',
    icon: 'custom-truck',
    onClick: (e) => openTraceModal(e.row.data),
  },
  'edit',
  'delete',
]

const onExporting = (e) => {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Productos')

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
    customizeCell: ({ gridCell, excelCell }) => {
      // Mapeo automático de status en el excel
      if (gridCell.rowType === 'data' && gridCell.column.dataField === 'status') {
        excelCell.value = Number(gridCell.value) === 1 ? 'Activo' : 'Inactivo';
      }
    }
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      // Nombre dinámico con fecha y hora
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.getHours().toString().padStart(2, '0') + '-' +
        now.getMinutes().toString().padStart(2, '0');

      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `productos_${dateStr}_${timeStr}.xlsx`);
    })
  })
}

/* ======================
   TRAZABILIDAD
====================== */
const showTraceModal = ref(false)
const traceLoading = ref(false)
const selectedTraceProduct = ref(null)
const traceMovements = ref([])
const traceGridRef = ref(null)

async function openTraceModal(data) {
  selectedTraceProduct.value = data
  showTraceModal.value = true
  traceLoading.value = true
  try {
    const { data: res } = await conexionApi.get(
      `/products/${data.id}/movements?companyID=${companyID}`
    )
    traceMovements.value = (res.movements || []).map(m => ({
      ...m,
      created_at_fmt: new Date(m.created_at).toLocaleString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }))
  } catch (e) {
    console.error(e)
    traceMovements.value = []
  } finally {
    traceLoading.value = false
  }
}

function traceTypeMeta(type) {
  const map = {
    ingreso:          { label: 'Ingreso manual',      cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '+' },
    egreso:           { label: 'Egreso manual',       cls: 'bg-red-100    text-red-700    border-red-200',     icon: '-' },
    ajuste:           { label: 'Ajuste inventario',   cls: 'bg-sky-100    text-sky-700    border-sky-200',     icon: '≈' },
    rebaja:           { label: 'Rebaja / consumo',    cls: 'bg-orange-100 text-orange-700 border-orange-200', icon: '↓' },
    egreso_transito:  { label: 'Salida tránsito',    cls: 'bg-violet-100 text-violet-700 border-violet-200', icon: '→' },
    ingreso_transito: { label: 'Entrada tránsito',   cls: 'bg-teal-100   text-teal-700   border-teal-200',   icon: '←' },
    cancelacion:      { label: 'Cancelación',         cls: 'bg-rose-100   text-rose-700   border-rose-200',   icon: '✕' },
    recepcion_compra: { label: 'Recepción de compra', cls: 'bg-blue-100   text-blue-700   border-blue-200',   icon: '📦' },
  }
  return map[type] || { label: type, cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: '·' }
}

function onTraceExportExcel() {
  const { exportDataGrid } = window.__dx_excel_exporter || {}
  if (!traceGridRef.value) return
  import('devextreme/excel_exporter').then(({ exportDataGrid: exportFn }) => {
    import('exceljs').then(({ Workbook }) => {
      import('file-saver').then(({ saveAs }) => {
        const workbook = new Workbook()
        const ws = workbook.addWorksheet('Trazabilidad')
        exportFn({
          component: traceGridRef.value.instance,
          worksheet: ws,
          autoFilterEnabled: true,
          customizeCell: ({ gridCell, excelCell }) => {
            if (gridCell.rowType === 'header') {
              excelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
              excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
            }
          }
        }).then(() => {
          workbook.xlsx.writeBuffer().then(buffer => {
            const date = new Date().toISOString().split('T')[0]
            const sku  = (selectedTraceProduct.value?.sku || 'producto').replace(/\s+/g, '_').toLowerCase()
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }),
              `trazabilidad_${sku}_${date}.xlsx`)
          })
        })
      })
    })
  })
}

async function onTracePrintPDF() {
  const prod = selectedTraceProduct.value
  const movements = traceMovements.value

  // ── Cargar jsPDF dinámicamente ────────────────────────────
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')

  // ── Logo de la empresa (base64) ────────────────────────────
  let logoBase64 = null
  try {
    const { data } = await conexionApi.get(`/configuracion/empresas/getEmpresa/${companyID}`)
    const logoUrl = data?.company?.logo
    if (logoUrl) {
      logoBase64 = await new Promise((res) => {
        const img = new Image(); img.crossOrigin = 'anonymous'
        img.onload = () => {
          const c = document.createElement('canvas')
          c.width = img.naturalWidth; c.height = img.naturalHeight
          c.getContext('2d').drawImage(img, 0, 0)
          res(c.toDataURL('image/png'))
        }
        img.onerror = () => res(null)
        img.src = logoUrl
      })
    }
  } catch (_) { /* sin logo */ }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW  = doc.internal.pageSize.getWidth()
  const pageH  = doc.internal.pageSize.getHeight()
  const now    = new Date()
  const dateStr = now.toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' })
  const timeStr = now.toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' })

  // ══════════════════════════════════════════════════
  //  HEADER — fondo blanco + barra lateral azul
  // ══════════════════════════════════════════════════
  // Fondo suave
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, pageW, 42, 'F')

  // Barra de acento izquierda
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 5, 42, 'F')

  // Línea divisoria inferior del header
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(0, 42, pageW, 42)

  // Etiqueta tipo "chip"
  doc.setFillColor(219, 234, 254)
  doc.roundedRect(10, 7, 40, 6, 1.5, 1.5, 'F')
  doc.setTextColor(29, 78, 216)
  doc.setFontSize(6.5); doc.setFont('helvetica', 'bold')
  doc.text('TRAZABILIDAD DE PRODUCTO', 14, 11.5)

  // Título principal
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text(prod?.name || '—', 10, 22)

  // Subtítulo SKU
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`SKU: ${prod?.sku}   ·   Generado el ${dateStr} a las ${timeStr}`, 10, 29)

  // Línea separadora interna
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)
  doc.line(10, 33, pageW - 10, 33)

  // Componente activo si existe
  if (prod?.active_ingredient) {
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(100,116,139)
    doc.text(`Comp. activo: `, 10, 39)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(30,41,59)
    doc.text(prod.active_ingredient, 36, 39)
  }

  // ── Logo empresa (esquina superior derecha) ────────────────
  if (logoBase64) {
    try {
      const logoH = 20, logoW = 35
      doc.addImage(logoBase64, 'PNG', pageW - logoW - 10, 11, logoW, logoH)
    } catch (_) {}
  } else {
    // Fallback: texto "AGRISOFT" como marca
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
    doc.text('AGRISOFT', pageW - 24, 19)
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184)
    doc.text('Sistema de Gestión Agrícola', pageW - 34, 24)
  }

  // ══════════════════════════════════════════════════
  //  KPI CARDS
  // ══════════════════════════════════════════════════
  const ingresos = movements.filter(m => ['ingreso','ingreso_transito','recepcion_compra'].includes(m.movement_type)).length
  const egresos  = movements.filter(m => ['egreso','egreso_transito','rebaja','cancelacion'].includes(m.movement_type)).length
  const total    = movements.length

  const kpis = [
    { label: 'TOTAL MOVIMIENTOS', value: total,    fill: [241,245,249], text: [30,41,59],     accent: [100,116,139] },
    { label: 'INGRESOS',          value: ingresos, fill: [240,253,244], text: [5,150,105],    accent: [5,150,105] },
    { label: 'EGRESOS',           value: egresos,  fill: [255,241,242], text: [225,29,72],    accent: [225,29,72] },
    { label: 'ÚLTIMO MOVIMIENTO', value: movements[0]?.created_at_fmt?.split(',')[0] || '—',
      fill: [239,246,255], text: [37,99,235], accent: [37,99,235], small: true },
  ]

  let kx = 10
  kpis.forEach(k => {
    const kw = 58
    doc.setFillColor(...k.fill)
    doc.roundedRect(kx, 46, kw, 14, 2, 2, 'F')
    doc.setFontSize(5.5); doc.setFont('helvetica','bold'); doc.setTextColor(...k.accent)
    doc.text(k.label, kx + 3, 51)
    doc.setFontSize(k.small ? 8 : 11); doc.setFont('helvetica','bold'); doc.setTextColor(...k.text)
    doc.text(String(k.value), kx + 3, 58)
    kx += kw + 3
  })

  // ══════════════════════════════════════════════════
  //  TABLA DE MOVIMIENTOS
  // ══════════════════════════════════════════════════
  const typeLabels = {
    ingreso: 'Ingreso manual',  egreso: 'Egreso manual',
    ajuste: 'Ajuste inventario', rebaja: 'Rebaja/consumo',
    egreso_transito: 'Salida tránsito', ingreso_transito: 'Entrada tránsito',
    cancelacion: 'Cancelación',  recepcion_compra: 'Recepción compra',
  }
  const typeColors = {
    ingreso: [209,250,229], egreso: [254,226,226], ajuste: [224,242,254],
    rebaja: [255,237,213],  egreso_transito: [237,233,254],
    ingreso_transito: [204,251,241], cancelacion: [255,228,230],
    recepcion_compra: [219,234,254],
  }

  doc.autoTable({
    startY: 64,
    head: [['Fecha / Hora','Tipo de movimiento','Bodega / Ruta','Cant.','Antes','Después','Responsable','Referencia','Notas']],
    body: movements.map(m => {
      const origin  = m.origin_warehouse_name  || '—'
      const destiny = m.destiny_warehouse_name || '—'
      return [
        m.created_at_fmt,
        typeLabels[m.movement_type] || m.movement_type,
        m.destiny_warehouse_name ? `${origin} → ${destiny}` : origin,
        m.quantity ?? '—',
        m.stock_before ?? '—',
        m.stock_after  ?? '—',
        m.user_name    || '—',
        m.reference_code || '—',
        m.notes         || '—',
      ]
    }),
    styles: {
      fontSize: 7, cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineColor: [241, 245, 249], lineWidth: 0.25,
      font: 'helvetica', textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 41, 59], textColor: [255, 255, 255],
      fontStyle: 'bold', fontSize: 6.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 1) {
        const c = typeColors[movements[data.row.index]?.movement_type]
        if (c) data.cell.styles.fillColor = c
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize  = 6.5
      }
    },
    margin: { left: 10, right: 10 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3,
  })

  // ══════════════════════════════════════════════════
  //  FOOTER en cada página
  // ══════════════════════════════════════════════════
  const n = doc.internal.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    doc.setPage(i)
    // Línea footer
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3)
    doc.line(10, pageH - 9, pageW - 10, pageH - 9)
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184)
    doc.text('Agrisoft — Sistema de Gestión Agrícola', 10, pageH - 5)
    doc.text(`Página ${i} de ${n}`, pageW - 20, pageH - 5)
    // Acento azul lateral en páginas siguientes
    if (i > 1) {
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 5, pageH, 'F')
    }
  }

  // ── Descarga ───────────────────────────────────────────────
  const fileDateStr = now.toISOString().split('T')[0]
  const skuSlug = (prod?.sku || 'producto').replace(/\s+/g,'_').toLowerCase()
  doc.save(`trazabilidad_${skuSlug}_${fileDateStr}.pdf`)
}

</script>

<style scoped>
:deep(.dx-datagrid-export-button) {
  background-color: #10b981 !important;
  color: white !important;
  border-radius: 12px !important;
  border: none !important;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2) !important;
  transition: all 0.2s ease !important;
  padding: 0px 12px !important;
  height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
}

:deep(.dx-datagrid-export-button:hover) {
  background-color: #059669 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3) !important;
}
</style>
