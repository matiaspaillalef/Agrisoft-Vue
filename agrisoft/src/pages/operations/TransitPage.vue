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


    <!-- GRID -->
    <GridDataGrid :data-source="dataSource" :columns="columns" :templates="cellTemplates" :buscador="true"
      :paginacion="true" :column-chooser="false" />
    <!-- MODAL VER DETALLES -->
    <div v-if="showDetailsModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="fixed inset-0 bg-[#0000003d] bg-opacity-50" @click="closeModals"></div>
      <div
        class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-lg mx-auto">
        <h2 class="text-xl mb-4">Detalles del tránsito <span class="font-bold bg-gray-200 p-1 rounded-sm">{{
          selectedItem?.TrackingNumber }}</span></h2>
        <div class="space-y-2">
          <p class="text-sm">
            <strong>Ruta:</strong> {{ routeLabel(selectedItem?.Route) }}
          </p>
          <p class="text-sm flex gap-1">
            <strong>Estado:</strong>
            <span class="flex items-center gap-[5px]">
              <span :class="[
                `statusPoint-${selectedItem?.Status}`,
                'w-[10px] h-[10px] rounded-full animate-pulse',
                {
                  'bg-green-400': selectedItem?.Status === 2,
                  'bg-orange-400': selectedItem?.Status === 1,
                  'bg-black': ![1, 2].includes(selectedItem?.Status)
                }
              ]"></span>
              {{ formatStatus(selectedItem?.Status) }}
            </span>
          </p>
          <p class="text-sm"><strong>Responsable:</strong> {{ selectedItem?.Responsible }}</p>
          <p class="text-sm mb-4"><strong>Fecha:</strong> {{ formatDate(selectedItem?.Date) }}</p>

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
        <button @click="closeModals"
          class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">Cerrar</button>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import GridDataGrid from '@/components/Grid/GridDataGrid.vue'
import DataSource from 'devextreme/data/data_source'
import ArrayStore from 'devextreme/data/array_store'
import { ref, reactive } from 'vue'
//Funciones globales
import { formatDate, formatStatus } from '@/utils/herlpers'
import type { GridColumn } from '@/types/grid'


const selectedItem = ref<any>(null)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const addNewItemModal = ref(false)
const isEditing = ref(false)

const newItem = reactive({
  trackingNumber: '',
  route: '',
  status: 1,
  responsible: '',
  date: ''
})



function openDetails(item: any) {
  selectedItem.value = item
  showDetailsModal.value = true
}

function closeModals() {
  showDetailsModal.value = false
  showDeleteModal.value = false
  addNewItemModal.value = false
}

// Templates personalizados
function quantityCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1 icon-grid"> <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /> </svg>`
  cellElement.innerHTML = `<span class="inline-flex items-center">${icon}${cellInfo.data.Quantity}</span>`
}

function trackingCellTemplate(cellElement: HTMLElement, cellInfo: any) {
  const trackingNumber = cellInfo.data.TrackingNumber
  if (!trackingNumber) return
  cellElement.innerHTML = `<span class="inline-flex items-center bg-gray-200 px-3 py-1 rounded-sm font-bold dark:text-blue-950">${trackingNumber}</span>`
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

function routeLabel(route: any) {
  if (!route) return ''
  return `${route.Start} → ${route.End}`
}

// Columnas del grid
const columns: GridColumn[] = [
  { dataField: 'TrackingNumber', caption: '# Tracking', cssClass: '!text-left', cellTemplate: 'tracking' },
  { dataField: 'Route', caption: 'Ruta', cssClass: '!text-left', cellTemplate: 'route', hidingPriority: 0 },
  { dataField: 'Status', caption: 'Estado', cssClass: '!text-left', cellTemplate: 'status' },
  {
    dataField: 'Date',
    caption: 'Fecha',
    dataType: 'date',
    format: 'dd/MM/yyyy',
    cssClass: '!text-left',
    hidingPriority: 1
  },
  { dataField: 'Responsible', caption: 'Responsable', cssClass: '!text-left', hidingPriority: 3 },
  //{ dataField: 'Actions', caption: 'Acciones', cssClass: '!text-left', cellTemplate: 'actions' },
]

// Data
const rawData = [
  {
    id: 1,
    Product: [
      { Name: 'Laptop Dell', Quantity: 10 },
      { Name: 'Mouse Logitech', Quantity: 5 },
      { Name: 'Teclado Logitech', Quantity: 7 }
    ],
    TrackingNumber: 'TRK-12345',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 3, name: 'Bodega Sur' }
    ],
    Status: 1,
    Date: new Date(2025, 1, 5),
    Responsible: 'Juan Pérez',
  },
  {
    id: 2,
    Product: [{ Name: 'iPhone 14', Quantity: 5 }],
    TrackingNumber: 'TRK-98765',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 1, 6),
    Responsible: 'María López',
  },
  {
    id: 3,
    Product: [{ Name: 'iPhone 14', Quantity: 9 }],
    TrackingNumber: 'TRK-98766',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 3,
    Date: new Date(2024, 1, 7),
    Responsible: 'Carlos Díaz',
  },
  {
    id: 4,
    Product: [{ Name: 'Monitor Samsung', Quantity: 2 }],
    TrackingNumber: 'TRK-00001',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2024, 3, 10),
    Responsible: 'Luis Romero',
  },
  {
    id: 5,
    Product: [{ Name: 'Teclado Logitech', Quantity: 7 }],
    TrackingNumber: 'TRK-00002',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 3, 11),
    Responsible: 'Ana Ruiz',
  },
  {
    id: 6,
    Product: [{ Name: 'Laptop Dell', Quantity: 10 }],
    TrackingNumber: 'TRK-12345',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2025, 1, 5),
    Responsible: 'Juan Pérez',
  },
  {
    id: 7,
    Product: [{ Name: 'iPhone 14', Quantity: 5 }],
    TrackingNumber: 'TRK-98765',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 1, 6),
    Responsible: 'María López',
  },
  {
    id: 8,
    Product: [{ Name: 'iPhone 14', Quantity: 9 }],
    TrackingNumber: 'TRK-98766',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 3,
    Date: new Date(2024, 1, 7),
    Responsible: 'Carlos Díaz',
  },
  {
    id: 9,
    Product: [{ Name: 'Monitor Samsung', Quantity: 2 }],
    TrackingNumber: 'TRK-00001',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2024, 3, 10),
    Responsible: 'Luis Romero',
  },
  {
    id: 10,
    Product: [{ Name: 'Teclado Logitech', Quantity: 7 }],
    TrackingNumber: 'TRK-00002',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 3, 11),
    Responsible: 'Ana Ruiz',
  },
  {
    id: 11,
    Product: [{ Name: 'Laptop Dell', Quantity: 10 }],
    TrackingNumber: 'TRK-12345',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2025, 1, 5),
    Responsible: 'Juan Pérez',
  },
  {
    id: 12,
    Product: [{ Name: 'iPhone 14', Quantity: 5 }],
    TrackingNumber: 'TRK-98765',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 1, 6),
    Responsible: 'María López',
  },
  {
    id: 13,
    Product: [{ Name: 'iPhone 14', Quantity: 9 }],
    TrackingNumber: 'TRK-98766',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 3,
    Date: new Date(2024, 1, 7),
    Responsible: 'Carlos Díaz',
  },
  {
    id: 14,
    Product: [{ Name: 'Monitor Samsung', Quantity: 2 }],
    TrackingNumber: 'TRK-00001',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2024, 3, 10),
    Responsible: 'Luis Romero',
  },
  {
    id: 15,
    Product: [{ Name: 'Teclado Logitech', Quantity: 7 }],
    TrackingNumber: 'TRK-00002',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 3, 11),
    Responsible: 'Ana Ruiz',
  },
  {
    id: 16,
    Product: [{ Name: 'Laptop Dell', Quantity: 10 }],
    TrackingNumber: 'TRK-12345',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2025, 1, 5),
    Responsible: 'Juan Pérez',
  },
  {
    id: 17,
    Product: [{ Name: 'iPhone 14', Quantity: 5 }],
    TrackingNumber: 'TRK-98765',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 1, 6),
    Responsible: 'María López',
  },
  {
    id: 18,
    Product: [{ Name: 'iPhone 14', Quantity: 9 }],
    TrackingNumber: 'TRK-98766',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 3,
    Date: new Date(2024, 1, 7),
    Responsible: 'Carlos Díaz',
  },
  {
    id: 19,
    Product: [{ Name: 'Monitor Samsung', Quantity: 2 }],
    TrackingNumber: 'TRK-00001',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2024, 3, 10),
    Responsible: 'Luis Romero',
  },
  {
    id: 20,
    Product: [{ Name: 'Teclado Logitech', Quantity: 7 }],
    TrackingNumber: 'TRK-00002',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 3, 11),
    Responsible: 'Ana Ruiz',
  },
  {
    id: 21,
    Product: [{ Name: 'Laptop Dell', Quantity: 10 }],
    TrackingNumber: 'TRK-12345',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2025, 1, 5),
    Responsible: 'Juan Pérez',
  },
  {
    id: 22,
    Product: [{ Name: 'iPhone 14', Quantity: 5 }],
    TrackingNumber: 'TRK-98765',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 1, 6),
    Responsible: 'María López',
  },
  {
    id: 23,
    Product: [{ Name: 'iPhone 14', Quantity: 9 }],
    TrackingNumber: 'TRK-98766',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 3,
    Date: new Date(2024, 1, 7),
    Responsible: 'Carlos Díaz',
  },
  {
    id: 24,
    Product: [{ Name: 'Monitor Samsung', Quantity: 2 }],
    TrackingNumber: 'TRK-00001',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 1,
    Date: new Date(2024, 3, 10),
    Responsible: 'Luis Romero',
  },
  {
    id: 25,
    Product: [{ Name: 'Teclado Logitech', Quantity: 7 }],
    TrackingNumber: 'TRK-00002',
    Origen: [
      { id: 1, name: 'Bodega Central' }
    ],
    Destino: [
      { id: 2, name: 'Bodega Norte' }
    ],
    Status: 2,
    Date: new Date(2024, 3, 11),
    Responsible: 'Ana Ruiz',
  },
]


const dataSource = new DataSource({
  store: new ArrayStore({
    data: rawData,
    key: 'id',
  }),
})

// Templates a pasar al grid
const cellTemplates = {
  quantity: quantityCellTemplate,
  route: routeCellTemplate,
  status: statusCellTemplate,
  tracking: trackingCellTemplate,
  //actions: actionsCellTemplate,
}
</script>
