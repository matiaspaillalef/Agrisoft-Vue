<template>
  <!-- =========================
       TÍTULO
  ========================== -->
  <div class="max-w-11/12 mx-auto mb-6 pl-2 md:pl-5">
    <h1 class="text-2xl font-light text-navy-700 dark:text-white">
      Solicitudes de Compra
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Solicitudes internas previas a la creación de una orden de compra.
    </p>
  </div>
  <div class="mt-[3px] max-w-11/12 mx-auto rounded-2xl bg-white dark:!bg-navy-800 py-6 px-2 md:px-10 shadow-xl relative">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="dxGrid" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :column-hiding-enabled="true">
      <DxColumnFixing :enabled="true" />
      <DxHeaderFilter :visible="true" :allow-search="true" />
      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxPaging :page-size="15" />
      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
        :texts="{
          confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?',
        }">
        <DxPopup title="Solicitud de Compra" :show-title="true" :width="520" :height="300" />

        <DxForm :col-count="1">
          <DxItem data-field="justification" caption="Justificación" editor-type="dxTextArea" :editor-options="{
            height: 140,
            placeholder: 'Explique el motivo de la compra'
          }">
            <DxRequiredRule message="La justificación es obligatoria" />
          </DxItem>
          <DxItem data-field="requester" caption="Solicitante" :visible="true" />
        </DxForm>
      </DxEditing>
      <DxColumn data-field="tracking_code" caption="#Código de solicitud" :allow-editing="false"
        :css-class="'text-left!'" alignment="right"/>
      <DxColumn data-field="requester" caption="Solicitante" :allow-editing="false" :css-class="'text-left!'" alignment="right"/>
      <DxColumn data-field="justification" caption="Justificación" :allow-editing="true" :css-class="'text-left!'"
        :visible="false" alignment="right"/>
      <DxColumn data-field="status" caption="Estado" :allow-editing="false" :css-class="'text-left!'"
        :cell-template="statusTextCellTemplate" alignment="right"/>

      <DxColumn data-field="created_at" caption="Fecha" data-type="date" format="dd/MM/yyyy" :allow-editing="false"
        :css-class="'text-left!'" alignment="right"/>
      <DxColumn type="buttons" :buttons="customButtons" />
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
        Detalles de la solicitud
        <span class="font-bold rounded-sm">
          {{ selectedItem?.tracking_code }}
        </span>
      </h2>

      <div class="space-y-2">
        <p class="text-sm">
          <strong>Solicitante:</strong>
          {{ selectedItem?.requester }}
        </p>
        <p class="text-sm">
          <strong>Estado:</strong>
          {{ formatStatusText(selectedItem?.status) }}
        </p>

        <p class="text-sm">
          <strong>Fecha:</strong>
          {{ formatDateHrs(selectedItem?.created_at) }}
        </p>
        <p class="text-sm">
          <strong>Justificación:</strong>
          {{ selectedItem?.justification }}
        </p>


      </div>

      <p class="text-sm bg-amber-200 text-amber-800 p-3 rounded-lg mt-3" v-if="selectedItem?.status === 'APPROVED'">
        <strong>Aprobado por:</strong> {{ selectedItem.approver_name }}<br>
        <strong>Fecha de aprobación:</strong> {{ formatDateHrs(selectedItem.approved_at) }}<br>
        <span v-if="selectedItem.purchase_order_code"
          v-html="`<strong>Orden de compra creada:</strong> #${selectedItem.purchase_order_code}`"></span>

      </p>

      <!-- Botón cerrar -->
      <button @click="closeModals" class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
        Cerrar
      </button>
    </div>
  </div>

  <div v-if="showCreateOCModal" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="fixed inset-0 bg-black/30" @click="cerrarModalOC"></div>

    <div class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl p-6 max-w-md w-full z-10">
      <h2 class="text-xl mb-4">
        Crear Orden de Compra
      </h2>

      <p class="text-sm mb-3">
        <strong>Solicitud:</strong>
        {{ selectedRequestForOC?.tracking_code }}
      </p>

      <DxSelectBox :items="suppliers" v-model="selectedSupplier" value-expr="id"
        :display-expr="item => item ? `${item.name} (${item.rut})` : ''" placeholder="Seleccione proveedor" />

      <button @click="confirmarCrearOC" class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
        Crear Orden
      </button>
    </div>
  </div>

</template>

<script setup>
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
  DxColumnFixing,
  DxHeaderFilter,
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import DxSelectBox from 'devextreme-vue/select-box'
import DxTextArea from 'devextreme-vue/text-area';
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'
import { ref, onMounted } from 'vue'
import { formatDate, formatDateHrs, formatStatusText, statusTextCellTemplate } from '@/utils/herlpers'

// Simulación de usuario logueado
const userId = localStorage.getItem('userId') || '1'
const companyId = localStorage.getItem('userIdCompany') || '1'
const userRole = Number(localStorage.getItem('rol') || 0)
const currentUser = userId
const FullName = localStorage.getItem('userName') + ' ' + localStorage.getItem('userLastName')

const loading = ref(false)
const dxGrid = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)

const showCreateOCModal = ref(false)
const selectedRequestForOC = ref(null)
const selectedSupplier = ref(null)
const suppliers = ref([])

const dataSource = new CustomStore({
  key: 'id',

  /* =========================
     LOAD
  ========================== */
  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/purchase-requests', {
        params: { company_id: companyId }
      })
      return data.requests
    } finally {
      loading.value = false
    }
  },

  /* =========================
     INSERT
  ========================== */
  insert: async values => {
    const payload = {
      justification: values.justification,
      user_id: Number(userId),
      company_id: Number(companyId)
    }

    const { data } = await conexionApi.post('/purchase-requests', payload)
    return {
      id: data.id,
      ...payload,
      status: 'REQUESTED',
      created_at: new Date()
    }
  },

  /* =========================
     UPDATE
  ========================== */
  update: async (id, values) => {
    await conexionApi.put(
      `/purchase-requests/${id}`,
      { justification: values.justification }, // <- body
      { params: { company_id: companyId } }    // <- query param
    )
  },

  /* =========================
     DELETE
  ========================== */
  remove: async id => {
    await conexionApi.delete(`/purchase-requests/${id}`, {
      params: { company_id: companyId }
    })
  }
})

onMounted(async () => {
  const { data } = await conexionApi.get('/suppliers', {
    params: { company_id: companyId }
  })
  suppliers.value = data.suppliers
})

function abrirModalCrearOC(request) {
  selectedRequestForOC.value = request
  selectedSupplier.value = null
  showCreateOCModal.value = true
}

function cerrarModalOC() {
  showCreateOCModal.value = false
}

async function confirmarCrearOC() {
  if (!selectedSupplier.value) {
    alert('Debe seleccionar un proveedor')
    return
  }

  try {
    const { data } = await conexionApi.post(
      `/purchase-orders/from-request/${selectedRequestForOC.value.id}`,
      {
        supplier_id: selectedSupplier.value,
        company_id: companyId,
        user_id: userId
      }
    )

    // 🔹 Guardar el ID de la OC en el objeto de la solicitud
    selectedItem.value = {
      ...selectedRequestForOC.value,      // copia los datos de la solicitud
      purchase_order_id: data.id,         // agrega el ID de la OC
      purchase_order_code: data.code || data.id // opcional: código
    }

    showCreateOCModal.value = false
    dxGrid.value?.instance.refresh()

    alert(`Orden de compra creada correctamente (ID: ${data.id})`)
  } catch (err) {
    alert(err.response?.data?.mensaje || 'Error al crear la orden')
  }
}


function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

function closeModals() {
  showViewModal.value = false
}

async function aprobarSolicitud(request) {
  if (!confirm(`¿Quieres aprobar la solicitud #${request.tracking_code}?`)) return

  try {
    const { data } = await conexionApi.put(
      `/purchase-requests/${request.id}/approve`,
      {
        user_id: userId,
        company_id: companyId
      }
    )

    // 🔄 Actualizar objeto local (opcional pero recomendado)
    Object.assign(request, {
      status: 'APPROVED',
      approved_by: userId,
      approver_name: data.approver_name,
      approved_at: data.approved_at
    })

    dxGrid.value?.instance.refresh()

    alert(`Solicitud #${request.tracking_code} aprobada por ${data.approver_name}`)
  } catch (err) {
    console.error(err)
    alert('Error al aprobar la solicitud')
  }
}

async function rechazarSolicitud(request) {
  if (!confirm(`¿Quieres rechazar la solicitud #${request.tracking_code}?`)) return

  try {
    await conexionApi.put(`/purchase-requests/${request.id}/reject`, {}, {
      params: { company_id: companyId }
    })

    request.status = 'REJECTED'

    dxGrid.value?.instance.refresh()

    alert(`Solicitud #${request.tracking_code} rechazada`)
  } catch (err) {
    console.error(err)
    alert('Error al rechazar la solicitud')
  }
}


// --- Botones personalizados ---
const customButtons = [

  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: (e) => verRegistro(e.row.data),
  },
  {
    hint: 'Editar',
    icon: 'edit',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 9) && status === 'REQUESTED'
    },
    onClick: (e) => e.component.editRow(e.row.rowIndex)
  },
  {
    hint: 'Eliminar',
    icon: 'trash',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 2) && e.row.data.has_purchase_order !== 1
    },
    onClick: (e) => {
      e.component.deleteRow(e.row.rowIndex)
    },
  },
  {
    hint: 'Aprobar',
    icon: 'custom-check',
    cssClass: 'w-[25px]! h-[25px]! bg-green-400 rounded-full animate-pulse p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 9) && status === 'REQUESTED'
    },
    onClick: (e) => aprobarSolicitud(e.row.data)
  },
  {
    hint: 'Rechazar',
    icon: 'custom-cancel',
    cssClass: 'w-[25px]! h-[25px]! bg-red-400 rounded-full animate-pulse p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 2) && e.row.data.has_purchase_order !== 1
    },
    onClick: (e) => rechazarSolicitud(e.row.data)
  },
  {
    hint: 'Crear Orden de Compra',
    icon: 'custom-plus',
    cssClass: 'w-[25px]! h-[25px]! bg-blue-400 rounded-full animate-pulse p-[4px]!',
    visible: (e) => e.row.data.status === 'APPROVED' && e.row.data.has_purchase_order !== 1,
    onClick: (e) => abrirModalCrearOC(e.row.data)
  }
]

</script>
