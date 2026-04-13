<template>
  <!-- Page Header -->
  <div
    class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
    <div class="flex items-center gap-6">
      <div
        class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
        <ClipboardDocumentListIcon class="w-10 h-10 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Solicitudes de Compra</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">Gestión de requerimientos y
          suministros internos</p>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div
    class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in slide-in-from-bottom-4 duration-700">


    <div class="p-8">
      <DxDataGrid ref="dxGrid" :data-source="dataSource" key-expr="id" :show-borders="false" :column-auto-width="true"
        :column-hiding-enabled="true" :load-panel="{ enabled: false }" class="modern-grid">
        <DxColumnFixing :enabled="true" />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxSearchPanel :visible="true" placeholder="Buscar solicitudes..." />
        <DxPaging :page-size="15" />

        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
          :texts="{ confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?' }">
          <DxPopup title="Nueva Solicitud" :width="600" :height="400" />
          <DxForm :col-count="1">
            <DxItem data-field="justification" caption="Justificación" editor-type="dxTextArea" :editor-options="{
              height: 120,
              placeholder: 'Explique brevemente la necesidad de esta compra...'
            }">
              <DxRequiredRule message="La justificación es obligatoria" />
            </DxItem>
            <DxItem data-field="requester" caption="Solicitante" :visible="true" />
          </DxForm>
        </DxEditing>

        <DxColumn data-field="tracking_code" caption="Código" :allow-editing="false" alignment="right"
          css-class="!font-black text-blue-600 dark:text-blue-400 !text-left" />

        <DxColumn data-field="requester" caption="Solicitante" :allow-editing="false" alignment="right"
          css-class="!text-left font-bold" />

        <DxColumn data-field="status" caption="Estado" :allow-editing="false" :cell-template="statusTextCellTemplate"
          alignment="right" css-class="!text-left" />

        <DxColumn data-field="created_at" caption="Fecha Solicitud" data-type="date" format="dd/MM/yyyy"
          :allow-editing="false" alignment="right" css-class="text-slate-500 !text-left" />

        <DxColumn type="buttons" :buttons="customButtons" />
      </DxDataGrid>
    </div>
  </div>

  <!-- MODAL VER DETALLE (PREMIUM) -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModals"></div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-100 dark:border-navy-700 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
      <!-- Header -->
      <div
        class="p-8 bg-slate-50/50 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700 flex justify-between items-start">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <ClipboardDocumentListIcon class="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Detalle de Solicitud</h2>
            <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Folio: <span
                class="text-blue-600">#{{ selectedItem?.tracking_code }}</span></p>
          </div>
        </div>

        <div v-if="selectedItem?.status"
          :class="`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusMeta(selectedItem.status).bgColor} ${getStatusMeta(selectedItem.status).textColor} border-slate-100 dark:border-navy-600 shadow-sm`">
          <span
            :class="`w-2.5 h-2.5 rounded-full animate-pulse ${getStatusMeta(selectedItem.status).pulseColor}`"></span>
          <span class="font-bold text-xs uppercase tracking-widest">{{ getStatusMeta(selectedItem.status).text }}</span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-8 space-y-6">
        <div class="space-y-4">
          <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
            Información de Origen
          </h3>

          <div
            class="bg-slate-50 dark:bg-navy-900/50 rounded-2xl p-6 space-y-4 border border-slate-100 dark:border-navy-700">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 font-medium">Solicitante:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedItem?.requester }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 font-medium">Fecha Emisión:</span>
              <span
                class="font-bold text-slate-800 dark:text-slate-200">{{ formatDateHrs(selectedItem?.created_at) }}</span>
            </div>
            <div class="pt-4 border-t border-slate-200/60 dark:border-navy-700">
              <span class="text-slate-500 text-xs uppercase tracking-widest block mb-2 font-black">Justificación:</span>
              <p
                class="text-slate-700 dark:text-slate-300 text-sm italic leading-relaxed bg-white dark:bg-navy-800 p-4 rounded-xl border border-slate-100 dark:border-navy-700 shadow-inner">
                "{{ selectedItem?.justification }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Approval block -->
        <div v-if="selectedItem?.status === 'APPROVED'"
          class="bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem] p-6 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
          <h4
            class="text-emerald-800 dark:text-emerald-400 font-black flex items-center gap-2 text-xs uppercase tracking-widest">
            <InformationCircleIcon class="w-5 h-5" />
            Control de Aprobación
          </h4>
          <div class="grid grid-cols-1 gap-1 text-sm text-emerald-700 dark:text-emerald-300/80">
            <p><strong>Aprobador:</strong> {{ selectedItem.approver_name }}</p>
            <p><strong>Fecha:</strong> {{ formatDateHrs(selectedItem.approved_at) }}</p>
            <div v-if="selectedItem.purchase_order_code"
              class="mt-3 p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex justify-between items-center">
              <span class="font-bold">Orden de Compra Asociada:</span>
              <span
                class="font-black text-emerald-900 dark:text-emerald-200">#{{ selectedItem.purchase_order_code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-6 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-navy-700 flex justify-end">
        <button @click="closeModals"
          class="px-10 py-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL CREAR OC (PREMIUM RE-DESIGN) -->
  <div v-if="showCreateOCModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="cerrarModalOC"></div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-md z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in zoom-in duration-300">
      <div class="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-2xl font-black tracking-tight mb-2">Generar Orden de Compra</h2>
          <p class="text-blue-100 text-sm font-medium">Vinculando solicitud <span
              class="text-white font-black">#{{ selectedRequestForOC?.tracking_code }}</span></p>
        </div>
        <ShoppingCartIcon class="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      <div class="p-8 space-y-6">
        <div>
          <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Proveedor
            Asignado</label>
          <DxSelectBox :items="suppliers" v-model="selectedSupplier" value-expr="id"
            :display-expr="item => item ? `${item.name} (${item.rut})` : ''"
            placeholder="Buscar y seleccionar proveedor..." class="premium-select" search-enabled="true" />
        </div>

        <div class="flex flex-col gap-3">
          <button @click="confirmarCrearOC"
            class="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 active:scale-95">
            <DocumentCheckIcon class="w-5 h-5" />
            Confirmar y Generar OC
          </button>
          <button @click="cerrarModalOC"
            class="w-full bg-slate-50 dark:bg-navy-700 text-slate-500 dark:text-slate-400 font-bold py-3 rounded-2xl hover:bg-slate-100 transition-all">
            Cancelar
          </button>
        </div>
      </div>
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
import { ClipboardDocumentListIcon, InformationCircleIcon } from '@heroicons/vue/24/solid'
import DxSelectBox from 'devextreme-vue/select-box'
import DxTextArea from 'devextreme-vue/text-area';
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'
import { ref, onMounted } from 'vue'
import { formatDate, formatDateHrs, formatStatusText, statusTextCellTemplate, getStatusMeta } from '@/utils/herlpers'

// Simulación de usuario logueado
const userId = localStorage.getItem('userId') || '1'
const companyId = localStorage.getItem('userIdCompany') || '1'
const userRole = Number(localStorage.getItem('rol') || 0)
const currentUser = userId
const FullName = localStorage.getItem('userName') + ' ' + localStorage.getItem('userLastName')

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
    try {
      const { data } = await conexionApi.get('/purchase-requests', {
        params: { company_id: companyId }
      })
      return data.requests
    } finally {
      //
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
