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
</template>


<script setup>
import { ref, computed } from 'vue'
import {
  CubeIcon, BeakerIcon, XMarkIcon, IdentificationIcon
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


// --- Botones personalizados ---
const customButtons = [
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: (e) => verRegistro(e.row.data),
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
