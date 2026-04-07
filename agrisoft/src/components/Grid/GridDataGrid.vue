<template>
  <div class="datagrid-container">
    <DxDataGrid :data-source="dataSource" :show-borders="true" :column-hiding-enabled="true" :width="'100%'"
      @content-ready="onContentReady" @init-new-row="onInitNewRow" :default-sorting="{ column: 'Date', desc: true }"
      @onRowRemoving="customizeDeletePopup" @editor-preparing="onEditorPreparing">
      <!-- Panel adaptable -->
      <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
      <DxColumnFixing :enabled="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <!-- Buscador -->
      <DxSearchPanel v-if="buscador" :visible="true" :highlight-case-sensitive="true" placeholder="Buscar..."
        width="100%" />

      <!-- Paginación -->
      <DxPaging v-if="paginacion" :page-size="15" :page-index="0" />

      <!-- Botones personalizados: Ver, Editar, Eliminar
      <DxColumn type="buttons" width="150" :buttons="customButtons" />
  -->

      <DxEditing :allow-updating="true" :allow-adding="true" :allow-deleting="true" mode="popup" :use-icons="true"
        :texts="{
          confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?',
        }">
        <DxPopup :show-title="true" :width="700" :height="525" title="Editar registro" />
        <DxForm>
          <DxItem data-field="Responsible" editor-type="dxTextBox" :editor-options="{
            readOnly: currentUser.role === 8
          }" />

          <DxItem data-field="ResponsibleUserId" :visible="false" />

          <DxItem data-field="TrackingNumber" />
          <DxItem data-field="Status" :label="{ text: 'Estado del tránsito' }" editor-type="dxSelectBox"
            :editor-options="{
              dataSource: transitStatus,
              valueExpr: 'id',
              displayExpr: 'name'
            }" />
          <DxSimpleItem data-field="Date" editor-type="dxDateBox" />
          <DxItem data-field="Origen" editor-type="dxSelectBox" :editor-options="{
            dataSource: bodegas,
            valueExpr: 'id',
            displayExpr: 'name',
            placeholder: 'Seleccione origen',
          }" />

          <DxItem data-field="Destino" editor-type="dxSelectBox" :editor-options="{
            dataSource: bodegas,
            valueExpr: 'id',
            displayExpr: 'name',
            placeholder: 'Seleccione destino',
          }" />

          <DxColumn data-field="WarehouseFrom" :visible="false" />
          <DxColumn data-field="WarehouseTo" :visible="false" />


          <DxItem data-field="Product" editor-type="dxTextArea" editor-options="{ height: 90 }" />
        </DxForm>
      </DxEditing>

      <DxColumn data-field="TrackingNumber" caption="# Tránsito" :cell-template="trackingCellTemplate"
        css-class="!text-left" :allow-editing="false" />
      </*DxColumn data-field="Route" caption="Ruta" css-class="!text-left" :hiding-priority="0 as any" * />
      <!---<DxColumn caption="Ruta" :calculate-display-value="routeDisplay" />

      <DxColumn data-field="Route" caption="Ruta" :calculate-display-value="routeDisplay" css-class="!text-left"
        :hiding-priority="0 as any" /> -->

      <DxColumn data-field="Origen" caption="Origen" :cell-template="BodegaCellTemplate" css-class="!text-left" />
      <DxColumn data-field="Destino" caption="Destino" :cell-template="BodegaCellTemplate" css-class="!text-left" />

      <DxColumn data-field="Status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-left" />
      <DxColumn data-field="Responsible" caption="Responsable" css-class="!text-left" :hiding-priority="3 as any" />
      <DxColumn data-field="Date" caption="Fecha" data-type="date" format="dd/MM/yyyy" css-class="!text-left"
        :hiding-priority="1 as any" />
      <DxColumn data-field="Product" caption="Productos" :visible="false" />


      <DxColumn type="buttons" width="140" :buttons="customButtons" />
      <DxPager v-if="paginacion" :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50, 100]"
        :show-info="true" :show-navigation-buttons="true" info-text="Página {0} de {1} ({2} registros)" />

    </DxDataGrid>


    <!-- Modal de solo lectura con Tailwind -->
    <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
      <!-- Fondo oscuro -->
      <div class="fixed inset-0 bg-[#0000003d] bg-opacity-50" @click="closeModals"></div>

      <!-- Contenedor del modal -->
      <div
        class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-full md:max-w-lg mx-auto">
        <h2 class="text-xl mb-4">
          Detalles del tránsito
          <span class="font-bold bg-gray-200 p-1 rounded-sm">
            {{ selectedItem?.TrackingNumber }}
          </span>
        </h2>

        <div class="space-y-2">
          <p class="text-sm">
            <strong>Ruta:</strong>
            {{ selectedItem?.Origen }} → {{ selectedItem?.Destino }}
          </p>

          <p class="text-sm flex gap-1">
            <strong>Estado:</strong>
            <span class="flex items-center gap-[5px]">
              <span :class="[
                'w-[10px] h-[10px] rounded-full animate-pulse',
                {
                  'bg-green-400': selectedItem?.Status === 2,
                  'bg-orange-400': selectedItem?.Status === 1,
                  'bg-black': ![1, 2].includes(selectedItem?.Status),
                },
              ]"></span>
              {{ formatStatus(selectedItem?.Status) }}
            </span>
          </p>

          <p class="text-sm">
            <strong>Responsable:</strong> {{ selectedItem?.Responsible }}
          </p>

          <p class="text-sm mb-4">
            <strong>Fecha:</strong> {{ formatDate(selectedItem?.Date) }}
          </p>

          <!-- Tabla de productos -->
          <div class="max-h-44 overflow-y-auto rounded-md shadow-md">
            <table class="min-w-full table-auto border-collapse">
              <thead class="bg-blue-950 text-white text-left text-[12px] uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th class="px-6 py-2">Producto</th>
                  <th class="px-6 py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white text-gray-700 text-[12px]">
                <tr v-for="(product, index) in selectedItem?.Product" :key="index" class="hover:bg-blue-50 transition">
                  <td class="px-6 py-2 font-medium">{{ product.Name }}</td>
                  <td class="px-6 py-2">{{ product.Quantity }}</td>
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

  </div>
</template>

<script setup lang="ts">
import {
  DxDataGrid,
  DxColumn,
  DxSearchPanel,
  DxPager,
  DxPaging,
  DxColumnChooser,
  DxColumnFixing,
  DxScrolling,
  DxEditing,
  DxForm,
  type DxDataGridTypes,
} from 'devextreme-vue/data-grid'

import { DxPopup } from 'devextreme-vue/popup'
import { DxSimpleItem, DxItem } from 'devextreme-vue/form'
import type { ValueChangedEvent } from 'devextreme/ui/select_box';

import { loadMessages, locale } from 'devextreme/localization'
import { ref } from 'vue'
import type { GridColumn } from '@/types/grid'

const props = defineProps<{
  dataSource: any
  columns: GridColumn[]
  columnChooser?: boolean
  buscador?: boolean
  paginacion?: boolean
  templates?: Record<string, Function>
  showAddButton?: boolean
  modalId?: string
}>()

let collapsed = false
const onContentReady = (e: DxDataGridTypes.ContentReadyEvent) => {
  if (!collapsed) {
    collapsed = true
  }
}

function onInitNewRow(e: any) {

  e.data.TrackingNumber = `TRK-${Date.now()}`
  e.data.Date = new Date()
  e.data.Status = 1
  e.data.Products = []
  e.data.Origen = ''
  e.data.Destino = ''

  //Responsable según rol
  if (currentUser.role === 8) {
    e.data.Responsible = currentUser.name
    e.data.ResponsibleUserId = currentUser.id
  }
}


function getTemplate(name: string): Function | undefined {
  return props.templates?.[name]
}

function closeModals() {
  showViewModal.value = false
}

function formatStatus(status: number) {
  switch (status) {
    case 1: return 'En tránsito'
    case 2: return 'Entregado'
    default: return 'Desconocido'
  }
}

function formatDate(date: Date | string) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

function routeDisplay(rowData: any) {

  const start = rowData?.Route?.Start
  const end = rowData?.Route?.End

  if (!start && !end) return ''
  if (start && !end) return start
  if (!start && end) return end

  return `${start} → ${end}`
}

// --- Modal de ver registro ---
const showViewModal = ref(false)
const selectedItem = ref<any>(null)

function verRegistro(data: any) {
  selectedItem.value = data
  showViewModal.value = true
}

// Templates personalizados
function quantityCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1 icon-grid"> <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /> </svg>`
  cellElement.innerHTML = `<span class="inline-flex items-center">${icon}${cellInfo.data.Quantity}</span>`
}

function trackingCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const trackingNumber = cellInfo.data.TrackingNumber
  if (!trackingNumber) return
  cellElement.innerHTML = `<span class="inline-flex items-center bg-gray-200 px-1 py-1 rounded-sm font-bold dark:text-blue-950 text-[11px]">${trackingNumber}</span>`
}

function routeCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const route = cellInfo.data.Route
  if (!route) return
  const start = `<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="inline w-4 h-4 mr-1 icon-grid icon-start"> <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /> </svg>${route.Start}</span>`
  const end = `<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" class="inline w-4 h-4 mr-1 icon-grid icon-end"> <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /> </svg>${route.End}</span>`
  cellElement.innerHTML = `${start}<br/>${end}`
}

function statusCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const statusMap: Record<number, string> = {
    1: 'En tránsito',
    2: 'Entregado',
    3: 'Cancelado',
  }
  let colorClass = ''
  switch (cellInfo.data.Status) {
    case 1:
      colorClass = 'status-en-transito'
      break
    case 2:
      colorClass = 'status-entregado'
      break
    case 3:
      colorClass = 'status-cancelado'
      break
    default:
      colorClass = ''
  }
  const status = statusMap[cellInfo.data.Status] || 'Desconocido'
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1 icon-grid"> <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /> </svg>`
  cellElement.innerHTML = `<span class="inline-flex items-center ${colorClass}">${icon}${status}</span>`
}

function BodegaCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const field = cellInfo.column.dataField // "Origen" | "Destino"
  const value = cellInfo.data[field]

  let label = 'Sin bodega'

  // 🟢 CASO 1: viene del backend → array [{ id, name }]
  if (Array.isArray(value) && value.length > 0) {
    label = value[0].name || 'Sin bodega'
  }

  // 🟢 CASO 2: creado desde el popup → id (number)
  else if (typeof value === 'number') {
    const found = bodegas.find(b => b.id === value)
    if (found) label = found.name
  }

  const icon = `
    <svg xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-4 h-4 icon-grid">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>
  `

  if (field === 'Origen') {
    // Origen → icono derecha
    cellElement.innerHTML = `
      <span class="inline-flex items-center gap-1">
        ${label}
        ${icon}
      </span>
    `
  } else {
    // Destino → icono izquierda
    cellElement.innerHTML = `
      <span class="inline-flex items-center gap-1">
        ${icon}
        ${label}
      </span>
    `
  }
}

function customizeDeletePopup(e: any) {
  const popupInstance = e.component.getInstance(); // el popup de confirmación
  popupInstance.option('wrapperAttr', { class: 'dx-swatch-agrisoft-scheme' });
}


//Usuario automatico al agregar
const userSession = {
  userId: Number(localStorage.getItem('userId') || '0'),
  userName: localStorage.getItem('userName') || '',
  userLastname: localStorage.getItem('userLastname') || '',
  rol: Number(localStorage.getItem('rol') || '0'),
}

const currentUser = {
  id: userSession.userId,
  name: ` ${userSession.userName} ${userSession.userLastname}`,
  role: userSession.rol,
}


function onEditorPreparing(e: any) {
  // Solo cuando se crea una fila nueva
  if (e.parentType !== 'dataRow') return
  if (e.dataField !== 'Responsible') return

  // Solo rol usuario normal
  if (currentUser.role === 8) {
    e.editorOptions.readOnly = true
    e.editorOptions.value = currentUser.name
  }
}

// --- Botones personalizados ---
const customButtons = [
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: (e: any) => verRegistro(e.row.data),
  },
  'edit' as any,
  'delete' as any,
]





const bodegas = [
  { id: 1, name: 'Bodega Central' },
  { id: 2, name: 'Bodega Norte' },
  { id: 3, name: 'Bodega Sur' },
]


const transitStatus = [
  { id: 1, name: 'En tránsito' },
  { id: 2, name: 'Entregado' },
  { id: 3, name: 'Cancelado' },
]

const productsCatalog = [
  { id: 1, name: 'Caja Manzanas' },
  { id: 2, name: 'Saco Papas' },
  { id: 3, name: 'Palet Naranjas' },
]


</script>
