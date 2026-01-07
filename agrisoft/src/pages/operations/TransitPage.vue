<template>
  <!-- Title Page -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Gestión de Tránsitos</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Administra y controla los tránsitos de manera eficiente.</p>
    </div>
  </div>

  <div
    class="relative mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl bg-white dark:bg-[#2b4775] py-6 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2 px-2 md:px-10 max-w-11/12 mx-auto">

    <div class="datagrid-container">
      <DxDataGrid :data-source="dataSource" :show-borders="true" :column-hiding-enabled="true" :width="'100%'"
        @content-ready="onContentReady" @init-new-row="onInitNewRow" :default-sorting="{ column: 'date', desc: true }"
        @onRowRemoving="customizeDeletePopup" @editor-preparing="onEditorPreparing">
        <!--<DxColumnChooser :enabled="true" mode="select" />-->
        <DxColumnFixing :enabled="true" />
        <DxScrolling column-rendering-mode="virtual" />
        <DxSearchPanel :visible="true" placeholder="Buscar..." highlight-case-sensitive />
        <DxPaging :page-size="15" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50, 100]" :show-info="true"
          :show-navigation-buttons="true" info-text="Página {0} de {1} ({2} registros)" />

        <DxEditing :allow-updating="true" :allow-adding="true" :allow-deleting="true" mode="popup" :use-icons="true"
          :texts="{ confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?' }">
          <DxPopup :show-title="true" :width="700" :height="525" title="Editar tránsito" />
          <DxForm>
            <DxItem data-field="responsible_name" editor-type="dxTextBox"
              :editor-options="{ readOnly: currentUser.role != 1 }" />
            <DxItem data-field="id" :visible="false" />
            <DxItem data-field="id_transito" />
            <DxItem data-field="status" editor-type="dxSelectBox"
              :editor-options="{ dataSource: transitStatus, valueExpr: 'id', displayExpr: 'name' }" />
            <DxSimpleItem data-field="date" editor-type="dxDateBox" />

            <DxItem data-field="origin_name" editor-type="dxSelectBox" :editor-options="{
              dataSource: () => originWarehouses.value,
              valueExpr: 'name',
              displayExpr: 'name',
              placeholder: 'Seleccione origen'
            }" />

            <DxItem data-field="destiny_name" editor-type="dxSelectBox" :editor-options="{
              dataSource: () => bodegas.value,
              valueExpr: 'name',
              displayExpr: 'name',
              placeholder: 'Seleccione destino'
            }" />
            <!--<DxItem data-field="products" editor-type="dxTextArea" :editor-options="{ height: 90 }" />-->

            <DxSelectBox
  :data-source="availableProducts"
  display-expr="display"
  value-expr="id"
  placeholder="Buscar producto por SKU, nombre o componente activo"
  search-enabled
  search-mode="contains"
  @value-changed="onProductSelected"
/>
            <!-- Productos -->
            <DxItem item-type="simple" caption="Productos" :col-span="2">
              <template #default>
                <DxDataGrid ref="productsGridRef" :data-source="filteredProducts" key-expr="id" height="320"
                  :show-borders="true"
                  :editing="{ allowUpdating: true, mode: 'cell', allowAdding: false, allowDeleting: false }">
                  <DxSearchPanel :visible="true" placeholder="Buscar producto..." />

                  <DxColumn data-field="sku" caption="SKU" css-class="!text-left" />
                  <DxColumn data-field="name" caption="Nombre" css-class="!text-left" />
                  <DxColumn data-field="active_ingredient" caption="Componente activo" css-class="!text-left" />
                  <DxColumn data-field="quantity" caption="Stock" css-class="!text-left" allowEditing="false" />

                  <DxColumn data-field="move_quantity" caption="Cantidad a mover" css-class="!text-left"
                    editor-type="dxNumberBox" :editor-options="{
                      min: 0,
                      showSpinButtons: true,
                      onValueChanged: (e, rowData) => {
                        // Validar que no exceda stock
                        if (e.value > rowData.data.quantity) {
                          e.component.option('value', rowData.data.quantity)
                        }
                      }
                    }" />
                </DxDataGrid>


              </template>
            </DxItem>
          </DxForm>
        </DxEditing>

        <!-- Columnas -->
        <DxColumn data-field="id_transito" caption="# Tránsito" :cell-template="trackingCellTemplate"
          css-class="!text-left" :editor-options="{ readOnly: currentUser.role != 1 }" />
        <DxColumn data-field="origin_name" caption="Origen" :cell-template="BodegaCellTemplate"
          css-class="!text-left" />
        <DxColumn data-field="destiny_name" caption="Destino" :cell-template="BodegaCellTemplate"
          css-class="!text-left" />
        <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-left" />
        <DxColumn data-field="responsible_name" caption="Responsable" css-class="!text-left" />
        <DxColumn data-field="date" caption="Fecha" data-type="date" format="dd/MM/yyyy" css-class="!text-left" />
        <DxColumn type="buttons" width="140" :buttons="customButtons" />
      </DxDataGrid>
    </div>
  </div>

  <!-- Modal de detalle -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="fixed inset-0 bg-[#ffffff66] backdrop-blur-sm" @click="closeModals"></div>
    <div
      class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-lg mx-auto">
      <h2 class="text-xl mb-4">Detalles del tránsito <span class="font-bold bg-gray-200 p-1 rounded-sm">{{
        selectedItem?.id_transito }}</span></h2>
      <p class="text-sm"><strong>Ruta:</strong> {{ selectedItem?.origin_name }} → {{ selectedItem?.destiny_name }}</p>
      <p class="text-sm"><strong>Estado:</strong> {{ formatStatus(selectedItem?.status) }}</p>
      <p class="text-sm"><strong>Responsable:</strong> {{ selectedItem?.responsible_name }}</p>
      <p class="text-sm mb-4"><strong>Fecha:</strong> {{ formatDate(selectedItem?.date) }}</p>

      <div class="max-h-44 overflow-y-auto rounded-md shadow-md">
        <table class="min-w-full table-auto border-collapse">
          <thead class="bg-blue-950 text-white text-left text-[12px] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th class="px-6 py-2">Producto</th>
              <th class="px-6 py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white text-gray-700 text-[12px]">
            <tr v-for="(product, index) in selectedItem?.products" :key="index" class="hover:bg-blue-50">
              <td class="px-6 py-2 font-medium">{{ product.Name }}</td>
              <td class="px-6 py-2">{{ product.Quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button @click="closeModals"
        class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid, DxColumn, DxSearchPanel, DxPager, DxPaging, DxColumnFixing, DxScrolling,
  DxEditing, DxForm, DxItem
} from 'devextreme-vue/data-grid'
import { DxSimpleItem } from 'devextreme-vue/form'
import { DxPopup } from 'devextreme-vue/popup'
import { ref, onMounted } from 'vue'
import conexionApi from '@/services/conexionApi.js'

// --- Datos ---
const companyID = Number(localStorage.getItem('userIdCompany') || 0)
const currentUser = {
  id: Number(localStorage.getItem('userId') || 0),
  name: `${localStorage.getItem('userName') || ''} ${localStorage.getItem('userLastname') || ''}`,
  role: Number(localStorage.getItem('rol') || 0),
}

// Obtener bodegas asignadas al usuario desde localStorage
const userWarehouses = ref(JSON.parse(localStorage.getItem('userWarehouses') || '[]'))
const bodegas = ref([])
const originWarehouses = ref([])
const showViewModal = ref(false)
const selectedItem = ref(null)

// --- Productos ---
const allProducts = ref([])          // Todos los productos
const filteredProducts = ref([])     // Productos filtrados por bodega
const selectedOrigin = ref('')       // Bodega de origen seleccionada
const availableProducts = ref([])        // productos filtrados por bodega y no seleccionados
const selectedProducts = ref([]) // productos agregados al tránsito

onMounted(async () => {
  // --- Bodegas ---
  try {
    const { data } = await conexionApi.get(`/warehouses/getWarehouses/${companyID}`)
    if (data.code === 'OK') {
      let allBodegas = data.warehouses.map(b => ({ id: b.id, name: b.name }))
      bodegas.value = allBodegas

      if ([7, 8, 9].includes(currentUser.role)) {
        const origins = allBodegas.filter(b =>
          userWarehouses.value.some(uw => uw.id === b.id)
        )
        originWarehouses.value = origins
        localStorage.setItem('userOriginWarehouses', JSON.stringify(origins))
      }
    }
  } catch (err) {
    console.error('Error cargando bodegas:', err)
  }

  // --- Productos ---
  try {
    const res = await conexionApi.get(`/products/${companyID}`)
    if (res.data.code === 'OK') {
      console.log('Productos cargados:', res.data.products)
      allProducts.value = res.data.products.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        active_ingredient: p.active_ingredient,
        warehouses: p.warehouses,
        quantity: 0
      }))
    }
  } catch (err) {
    console.error('Error al cargar productos:', err)
  }
})

// --- Funciones ---
function formatStatus(status) {
  switch (status) {
    case 1: case '1': return 'Creada'
    case 2: case '2': return 'En tránsito'
    case 3: case '3': return 'Entregado'
    case 0: case '0': return 'Cancelado'
    default: return 'Desconocido'
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

function onContentReady() { }

function onInitNewRow(e) {
  e.data.id_transito = `TRK-${Date.now()}`
  e.data.date = new Date()
  e.data.status = 1
  e.data.products = []
  e.data.origin_name = ''
  e.data.destiny_name = ''

  if ([7, 8, 9].includes(currentUser.role)) {
    const origin = JSON.parse(localStorage.getItem('userOriginWarehouses') || '[]')
    if (origin.length === 1) e.data.origin_name = origin[0].name
  }

  if (currentUser.role === 8) e.data.responsible_name = currentUser.name
}

function onEditorPreparing(e) {
  // Responsable bloqueado
  if (e.dataField === 'responsible_name' && currentUser.role === 8) {
    e.editorOptions.readOnly = true
    e.editorOptions.value = currentUser.name
  }

  // Origen
  if (e.dataField === 'origin_name') {
    e.editorOptions.dataSource = originWarehouses.value
    e.editorOptions.onValueChanged = (ev) => {
      selectedOrigin.value = ev.value || ''

      // Filtrar productos por bodega seleccionada
      filteredProducts.value = allProducts.value
        .filter(p => p.warehouses.some(w => w.warehouse_name === selectedOrigin.value))
        .map(p => ({
          ...p,
          quantity: p.warehouses.find(w => w.warehouse_name === selectedOrigin.value)?.quantity || 0
        }))
    }
  }

  // Destino
  if (e.dataField === 'destiny_name') {
    e.editorOptions.dataSource = bodegas.value
  }
}

function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

function closeModals() {
  showViewModal.value = false
}

function customizeDeletePopup(e) {
  e.component.getInstance()?.option('wrapperAttr', { class: 'dx-swatch-agrisoft-scheme' });
}

// --- Templates ---
function trackingCellTemplate(cellElement, cellInfo) {
  const trackingNumber = cellInfo.data.id_transito || ''
  cellElement.innerHTML = `<span class="inline-flex items-center bg-gray-200 px-3 py-1 rounded-sm font-bold">${trackingNumber}</span>`
}

function statusCellTemplate(cellElement, cellInfo) {
  const status = cellInfo.data.status
  let color = ''
  if (status == 1) color = 'bg-orange-400'
  else if (status == 2) color = 'bg-green-400'
  else color = 'bg-gray-400'
  cellElement.innerHTML = `<span class="inline-flex items-center ${color} px-2 py-1 rounded-full text-white">${formatStatus(status)}</span>`
}

function BodegaCellTemplate(cellElement, cellInfo) {
  const value = cellInfo.data[cellInfo.column.dataField] || 'Sin bodega'
  cellElement.innerHTML = `<span class="inline-flex items-center">${value}</span>`
}

// --- Custom Buttons ---
const customButtons = [
  { hint: 'Ver', icon: 'custom-view', onClick: (e) => verRegistro(e.row.data) },
  'edit',
  'delete',
]

function buildDisplay(p) {
  return `${p.sku} - ${p.name} (${p.active_ingredient})`
}

// --- Estados ---
const transitStatus = [
  { id: 0, name: 'Cancelado' },
  { id: 1, name: 'Creada' },
  { id: 2, name: 'En tránsito' },
  { id: 3, name: 'Entregado' },
]

// --- DataGrid principal ---
const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    try {
      const { data } = await conexionApi.get(`/transits/${companyID}`)
      if (data.code === 'OK') {
        return data.transits.map(t => ({
          id: t.id,
          id_transito: t.id_transito,
          origin_name: t.origin_name,
          destiny_name: t.destiny_name,
          status: t.status,
          responsible_name: t.responsible_name + ' ' + t.responsible_lastname,
          date: new Date(t.date),
          products: t.products.map(p => ({ Name: p.name, Quantity: p.quantity })),
        }))
      }
      return []
    } catch (err) {
      console.error('Error cargando tránsitos:', err)
      return []
    }
  },
  insert: async (values) => { try { await conexionApi.post(`/transits`, { ...values, company_id: companyID }) } catch (err) { console.error(err) } },
  update: async (key, values) => { try { await conexionApi.put(`/transits/${key}`, values) } catch (err) { console.error(err) } },
  remove: async (key) => { try { await conexionApi.delete(`/transits/${key}`) } catch (err) { console.error(err) } },
})

// Bodega de origen seleccionada

// Cuando se selecciona origen, filtramos productos
function onOriginChanged(originName) {
  selectedOrigin.value = originName || ''
  filteredProducts.value = allProducts.value
    .filter(p => p.warehouses.some(w => w.warehouse_name === selectedOrigin.value))
    .map(p => ({
      ...p,
      quantity: p.warehouses.find(w => w.warehouse_name === selectedOrigin.value)?.quantity || 0,
      move_quantity: 0   // Inicialmente 0
    }))
}

</script>
