<template>
  <!-- =========================
       TÍTULO
  ========================== -->
  <div class="max-w-11/12 mx-auto mb-6 pl-2 md:pl-5 flex items-start justify-between">
    <div>
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">
        Órdenes de Compra
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Órdenes generadas a partir de solicitudes aprobadas.
      </p>
    </div>

    <!-- Botón ayuda -->
    <button class="text-gray-400 hover:text-navy-600 transition max-w-fit" @click="showHelp = true"
      title="¿Qué hace cada acción?">
      <InformationCircleIcon class="w-6 h-6" />
    </button>
  </div>

  <div class="mt-[3px] max-w-11/12 mx-auto rounded-2xl bg-white dark:!bg-navy-800 py-6 px-2 md:px-10 shadow-xl">
    <DxDataGrid ref="dxGrid" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true">
      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxHeaderFilter :visible="true" :allow-search="true" />
      <DxPaging :page-size="15" />

      <!-- =========================
           EDICIÓN
      ========================== -->
      <DxEditing mode="popup" :allow-adding="false" :allow-updating="false" :allow-deleting="false" :use-icons="true">
        <DxPopup title="Orden de Compra" :show-title="true" :width="450" :height="320" />

        <DxForm :col-count="1">
          <!-- SOLICITUD -->
          <DxItem data-field="request_id" caption="Solicitud Aprobada" editor-type="dxSelectBox"
            :editor-options="approvedRequestsEditorOptions">
            <DxRequiredRule message="Debe seleccionar una solicitud" />
          </DxItem>

          <!-- PROVEEDOR -->
          <DxItem data-field="supplier_id" caption="Proveedor" editor-type="dxSelectBox"
            :editor-options="suppliersEditorOptions">
            <DxRequiredRule message="Debe seleccionar un proveedor" />
          </DxItem>
        </DxForm>
      </DxEditing>

      <!-- =========================
           COLUMNAS
      ========================== -->
      <DxColumn data-field="order_code" caption="#Orden de Compra" alignment="right" css-class="!text-left" />
      <DxColumn data-field="tracking_code" caption="Solicitud" alignment="right" css-class="!text-left" />
      <DxColumn data-field="supplier_name" caption="Proveedor" alignment="right" css-class="!text-left" />
      <DxColumn data-field="supplier_rut" caption="RUT Proveedor" alignment="right" css-class="!text-left" :visible="false" />
      <DxColumn data-field="status" caption="Estado" :cell-template="statusTextCellTemplate" alignment="right"
        css-class="!text-left" />
      <DxColumn data-field="created_at" caption="Fecha" data-type="date" format="dd/MM/yyyy" alignment="right"
        css-class="!text-left" />

      <DxColumn type="buttons" :buttons="customButtons" />
    </DxDataGrid>
  </div>
  <!-- MODAL VER OC + ITEMS -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="fixed inset-0 bg-black/30" @click="closeModals"></div>

    <div class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl p-6 max-w-3xl w-full z-10 overflow-y-auto max-h-[80vh]">
      <h2 class="text-xl mb-4 flex justify-between items-center">
        Orden de Compra <span class="font-bold bg-gray-200 p-1 rounded-sm">#{{ selectedItem?.order_code }}</span>
      </h2>

      <p class="text-sm mb-2"><strong>Solicitud:</strong> {{ selectedItem?.tracking_code }}</p>
      <p class="text-sm mb-2"><strong>Solicitante:</strong> {{ selectedItem?.requester_name }}</p>

      <p class="text-sm mb-2"><strong>Creador:</strong> {{ selectedItem?.created_by_name }}</p>
      <p class="text-sm mb-2"><strong>Fecha de creación:</strong> {{ formatDateHrs(selectedItem?.created_at) }}</p>
      <p class="text-sm mb-2"><strong>Proveedor:</strong> {{ selectedItem?.supplier_name }} ({{
        selectedItem?.supplier_rut }})</p>

      <p class="text-sm mb-4"><strong>Estado:</strong> {{ formatStatusText(selectedItem?.status) }}</p>

      <!-- GRID DE ITEMS -->
      <div v-if="modalItemsDataSource?.length > 0">
        <DxDataGrid ref="modalGrid" :data-source="modalItemsDataSource" key-expr="id" :show-borders="true"
          :column-auto-width="true">
          <DxColumn data-field="product_name" caption="Producto" alignment="right" css-class="!text-left" />
          <DxColumn data-field="quantity" caption="Cantidad" data-type="number" alignment="right"
            css-class="!text-left" />
          <DxColumn data-field="price" caption="Precio" data-type="number"
            :format="{ type: 'currency', currency: 'USD', precision: 0, formatter: priceFormatter }" alignment="right"
            css-class="!text-left" />
          <DxColumn data-field="received_quantity" caption="Recibido" data-type="number" alignment="right"
            css-class="!text-left" />
          <DxColumn type="buttons">
            <DxEditing allow-updating allow-deleting />
          </DxColumn>
          <DxEditing mode="popup" :allow-adding="false" :allow-updating="false" :allow-deleting="false"
            :use-icons="true">
            <DxPopup title="Editar Item" :width="400" :height="300" />
          </DxEditing>
        </DxDataGrid>
      </div>

      <button @click="closeModals" class="mt-4 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg">
        Cerrar
      </button>
    </div>
  </div>

  <DxPopup v-model:visible="showHelp" title="Acciones disponibles" :width="420" :height="auto" :show-close-button="true"
    :drag-enabled="false">
    <div class="space-y-3 text-sm">

      <div class="flex items-center gap-3">
        <EyeIcon class="w-5 h-5 text-gray-600" />
        <span><b>Ver</b>: Visualiza el detalle de la orden</span>
      </div>

      <div class="flex items-center gap-3">
        <ArchiveBoxArrowDownIcon class="w-5 h-5 text-yellow-600" />
        <span><b>Ver ítems</b>: Agregar o editar productos</span>
      </div>

      <div class="flex items-center gap-3">
        <DocumentCheckIcon class="w-5 h-5 text-blue-600" />
        <span><b>Aprobar</b>: Aprueba la orden (estado DRAFT)</span>
      </div>

      <div class="flex items-center gap-3">
        <DocumentArrowDownIcon class="w-5 h-5 text-green-600" />
        <span><b>Generar PDF</b>: Descarga la OC en PDF</span>
      </div>

      <div class="flex items-center gap-3">
        <XCircleIcon class="w-5 h-5 text-red-600" />
        <span><b>Cancelar</b>: Cancela la orden</span>
      </div>

    </div>
  </DxPopup>


</template>

<script setup>
import { ref, onMounted, shallowRef, computed } from 'vue'
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  //DxPopup,
  DxForm,
  DxItem,
  DxSearchPanel,
  DxPaging,
  DxHeaderFilter
} from 'devextreme-vue/data-grid'
import { useRouter } from 'vue-router'
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'
import { formatDateHrs, formatStatusText, statusTextCellTemplate } from '@/utils/herlpers'
import { priceFormatter } from '@/utils/herlpers'
import { InformationCircleIcon, EyeIcon, DocumentCheckIcon, XCircleIcon, ArchiveBoxArrowDownIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import DxPopup from 'devextreme-vue/popup'
import { Document } from 'postcss'

const companyId = localStorage.getItem('userIdCompany') || '1'
const userRole = Number(localStorage.getItem('rol') || '0')

const dxGrid = ref(null)
const showViewModal = ref(false)
const showHelp = ref(false)
const showNewProductPopup = ref(false)
const selectedItem = ref(null)
const modalItemsDataSource = ref(null)

const approvedRequests = ref([])
const suppliers = ref([])

const router = useRouter()

const haveProducts = ref(false)


/* =========================
   EDITOR OPTIONS (CLAVE)
========================== */
const approvedRequestsEditorOptions = ref({
  items: [],
  valueExpr: 'id',
  displayExpr: 'tracking_code',
  searchEnabled: true,
  searchExpr: ['tracking_code'],
  searchMode: 'contains',
  showClearButton: true,
  placeholder: 'Seleccione una solicitud'
})

const suppliersEditorOptions = ref({
  items: [],
  valueExpr: 'id',
  displayExpr: item => {
    if (!item) return ''
    return `${item.name} (${item.rut})`
  },
  searchEnabled: true,
  searchExpr: ['name', 'rut'],
  searchMode: 'contains',
  showClearButton: true,
  placeholder: 'Seleccione proveedor'
})

/* =========================
   LOAD DATA
========================== */
onMounted(async () => {
  const [req, sup] = await Promise.all([
    conexionApi.get('/purchase-requests', {
      params: {
        company_id: Number(companyId),
        status: 'APPROVED'
      }
    }),
    conexionApi.get('/suppliers', {
      params: {
        company_id: Number(companyId)
      }
    })
  ])

  approvedRequests.value = req.data.requests || []
  suppliers.value = sup.data.suppliers || []

  approvedRequestsEditorOptions.value.items = approvedRequests.value
  suppliersEditorOptions.value.items = suppliers.value

})

/* =========================
   DATA SOURCE
========================== */
const dataSource = new CustomStore({
  key: 'id',


  load: async () => {
    const { data } = await conexionApi.get('/purchase-orders', {
      params: { company_id: companyId }
    })

    return data.orders
  },
  /*
    insert: async values => {
      const { data } = await conexionApi.post(
        `/purchase-orders/from-request/${values.request_id}`,
        { supplier_id: values.supplier_id }
      )
  
      dxGrid.value?.instance.refresh()
      return data
    }
      */
})

async function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
  await loadModalItems(data.id) // <- carga los items de la OC
}

function closeModals() {
  showViewModal.value = false
}

function irAPurchaseOrderItems(order) {
  router.push(`/dashboard/operations/procurement/orders/${order.id}/items`)
}
/* =========================
   BUTTONS
========================== */

const customButtons = [
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: e => verRegistro(e.row.data)
  },
  {
    hint: 'Ver ítems',
    icon: 'box',
    cssClass: 'w-[25px]! h-[25px]! bg-yellow-400 rounded-full  p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 2) && status === 'DRAFT'
    },
    onClick: e => irAPurchaseOrderItems(e.row.data)
  },
  {
    hint: 'Aprobar',
    icon: 'custom-check',
    cssClass: 'w-[25px]! h-[25px]! bg-blue-400 rounded-full p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      const haveProducts = e.row.data.have_products
      return (userRole === 1 || userRole === 2) && status === 'DRAFT' && haveProducts > 0
    },
    onClick: async e => {
      try {
        const order = e.row.data
        await conexionApi.put(`/purchase-orders/${order.id}/approve`, {
          user_id: Number(localStorage.getItem('userId')),
          company_id: Number(localStorage.getItem('userIdCompany'))
        })
        dxGrid.value?.instance.refresh()
        alert('Orden aprobada correctamente ✅')
      } catch (err) {
        console.error('Error al aprobar la orden:', err)
        alert('Error al aprobar la orden 😬')
      }
    }
  },
  {
    hint: 'Descargar OC',
    icon: 'send',
    cssClass: 'w-[25px]! h-[25px]! bg-green-400 rounded-full p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 2) && status === 'APPROVED'
    },
    onClick: async (e) => {
      try {
        const order = e.row.data

        // Llamada al backend para generar PDF
        const response = await conexionApi.put(
          `/purchase-orders/${order.id}/send`,
          {
            user_id: Number(localStorage.getItem('userId')),
            company_id: Number(localStorage.getItem('userIdCompany'))
          },
          { responseType: 'blob' } // <- muy importante
        )

        // Crear Blob y link temporal para descargar automáticamente
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `OC-${order.order_code}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        dxGrid.value?.instance.refresh()
        //alert('Orden enviada y PDF descargado ✅')
      } catch (err) {
        console.error('Error al enviar la orden:', err)
      }
    }
  },
  {
    hint: 'Cancelar',
    icon: 'custom-cancel-2',
    cssClass: 'w-[25px]! h-[25px]! bg-red-400 rounded-full   p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (
        (userRole === 1 || userRole === 2) &&
        (status === 'DRAFT' || status === 'APPROVED')
      )
    },
    onClick: async (e) => {
      const order = e.row.data

      const ok = confirm(
        `¿Seguro que deseas cancelar la OC ${order.order_code}?\nEsta acción no se puede deshacer.`
      )
      if (!ok) return

      try {
        await conexionApi.put(`/purchase-orders/${order.id}/cancel`, {
          user_id: Number(localStorage.getItem('userId')),
          company_id: Number(localStorage.getItem('userIdCompany'))
        })

        dxGrid.value?.instance.refresh()
        alert('Orden cancelada correctamente ❌')
      } catch (err) {
        console.error('Error al cancelar la orden:', err)
        alert('No se pudo cancelar la orden 😬')
      }
    }
  },
  {
    hint: 'Registrar recepción',
    icon: 'custom-box',
    cssClass: 'w-[25px]! h-[25px]! bg-indigo-400 rounded-full p-[4px]!',
    visible: (e) => {
      return (
        (userRole === 1 || userRole === 2) &&
        ['APPROVED', 'PARTIAL_RECEIVED'].includes(e.row.data.status)
      )
    },
    onClick: e => {
      router.push(
        `/dashboard/operations/procurement/orders/${e.row.data.id}/receipts/new`
      )
    }
  }

]



async function loadModalItems(orderId) {
  const { data } = await conexionApi.get(`/purchase-orders/${orderId}/items`)
  // agregamos product_name para mostrar en grid
  modalItemsDataSource.value = data.items.map(item => ({
    ...item,
    product_name: item.product_name || item.name

  }))
}

</script>
