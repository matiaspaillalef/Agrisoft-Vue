<template>
  <!-- Title -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Productos</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Administra productos y stock por bodega
      </p>
    </div>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto">
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'" @editing-start="onEditingStart" @saving="onSaving">
      <!-- LOADER -->
      <DxLoadPanel v-model:visible="loading" :enabled="true" :showPane="true" :indicator-src="logoGif"
        shading-color="transparent" :height="'100%'" :width="'100%'" class="custom-loadpanel" />
      <!-- Panel adaptable -->
      <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
      <DxColumnFixing :enabled="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxPaging :page-size="15" />

      <DxColumn data-field="sku" caption="SKU" css-class="!text-left" />
      <DxColumn data-field="name" caption="Nombre" css-class="!text-left" />
      <DxColumn data-field="description" caption="Descripción" css-class="!text-left" />
      <DxColumn data-field="active_ingredient" caption="Componente activo" css-class="!text-left" />

      <DxColumn caption="Stock global" :calculate-cell-value="calculateTotalStock" css-class="!text-left" />
      <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center" />
      <DxColumn type="buttons" width="140" :buttons="customButtons" />
      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
        :texts="{
          confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?',
        }">
        <DxPopup title="Gestión de Productos" :show-title="true" :width="600" :height="300"
          :toolbar-items="popupToolbar" />

        <DxForm>
          <DxItem data-field="name" caption="Nombre" :editor-options="{ readOnly: !canEdit }" />

          <DxItem data-field="sku" caption="SKU" :editor-options="{ readOnly: !canEdit }" />
          <DxItem data-field="active_ingredient" caption="Componente activo" :editor-options="{ readOnly: !canEdit }" />
          <DxItem data-field="description" caption="Descripción" :editor-options="{ readOnly: !canEdit }" />
          <DxItem data-field="__usersDirty" :visible="false" />
        </DxForm>
      </DxEditing>


    </DxDataGrid>
  </div>

  <!-- Modal de solo lectura con Tailwind -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
    <!-- Fondo oscuro -->
    <div class="fixed inset-0 bg-[#0000003d] bg-opacity-50" @click="closeModals"></div>

    <!-- Contenedor del modal -->
    <div
      class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-lg mx-auto">
      <h2 class="text-xl mb-4">
        Detalles del producto
        <span class="font-bold rounded-sm">
          {{ selectedItem?.name }}
        </span>
      </h2>

      <div class="space-y-2">
        <p class="text-sm">
          <strong>SKU:</strong>
          {{ selectedItem?.sku }}
        </p>

        <p class="text-sm">
          <strong>Componente Activo:</strong> {{ selectedItem?.active_ingredient }}
        </p>

        <p class="text-sm">
          <strong>Descripción:</strong> {{ selectedItem?.description || 'N/A' }}
        </p>

        <p class="text-sm">
          <strong>Stock Global:</strong> {{ calculateTotalStock(selectedItem) }}
        </p>

        <p class="text-sm">
          <strong>Creación:</strong> {{ formatDate(selectedItem?.created_at) || 'N/A' }}
        </p>

        <p class="text-sm mb-4">
          <strong>Última Actualización:</strong> {{ formatDateHrs(selectedItem?.updated_at) || 'N/A' }}
        </p>

        <!-- Tabla de productos -->
      
        <div v-if="selectedItem?.warehouses?.length" class="max-h-44 overflow-y-auto rounded-md shadow-md">
          <table class="min-w-full table-auto border-collapse">
            <thead class="bg-blue-950 text-white text-left text-[12px] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th class="px-6 py-2">Bodega</th>
                <th class="px-6 py-2">Cantidad</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white text-gray-700 text-[12px]">
              <tr v-for="(product, index) in selectedItem?.warehouses" :key="index" class="hover:bg-blue-50 transition">
                <td class="px-6 py-2 font-medium">{{ product.warehouse_name }}</td>
                <td class="px-6 py-2">{{ product.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Botón cerrar -->
      <button @click="closeModals" class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
        Cerrar
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
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
  DxLoadPanel
} from 'devextreme-vue/data-grid'
import { loadMessages, locale } from 'devextreme/localization'

import conexionApi from '@/services/conexionApi.js'
import { formatDate, formatDateHrs, statusCellTemplate } from '@/utils/herlpers'

import logoGif from '@/assets/img/agrisoft_logo.png'

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
    const { data } = await conexionApi.get('/products/' + companyID)
    return data.products.map(p => ({
      ...p,
      description: p.description ?? ''
    }))
  },

  insert: async (values) => {
    await conexionApi.post('/products', {
      ...values,
      company_id: companyID
    })
  },

  update: async (key, values) => {
    await conexionApi.put(`/products/${key}`, values)
  },

  remove: async (key) => {
    await conexionApi.delete(`/products/${key}`)
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
}

/* ======================
   SAVE STOCK
====================== */
const saveStock = async () => {
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

</script>
