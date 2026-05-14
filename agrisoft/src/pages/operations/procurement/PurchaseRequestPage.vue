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
      <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true"
        :column-auto-width="true" :column-hiding-enabled="true" :load-panel="{ enabled: false }" class="modern-grid"
        @init-new-row="onInitNewRow" @editor-preparing="onEditorPreparing">
        <DxColumnFixing :enabled="true" />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxSearchPanel :visible="true" placeholder="Buscar solicitudes..." />
        <DxPaging :page-size="15" />

        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
          :texts="{ confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?' }">
          <DxPopup title="Nueva Solicitud" :width="600" :height="450" />
          <DxForm :col-count="1">
            <DxItem data-field="requester_id" caption="Persona Solicitante" editor-type="dxSelectBox" :editor-options="{
              items: users,
              displayExpr: 'fullName',
              valueExpr: 'id',
              searchEnabled: true,
              placeholder: 'Seleccionar solicitante...',
              readOnly: ![1, 2].includes(userRole)
            }">
              <DxRequiredRule message="El solicitante es obligatorio" />
            </DxItem>

            <DxItem data-field="justification" caption="Justificación" editor-type="dxTextArea" :editor-options="{
              height: 120,
              placeholder: 'Explique brevemente la necesidad de esta compra...'
            }">
              <DxRequiredRule message="La justificación es obligatoria" />
            </DxItem>
          </DxForm>
        </DxEditing>

        <DxColumn data-field="requester_id" caption="Solicitante" alignment="right" css-class="!text-left font-bold">
          <DxLookup :data-source="users" display-expr="fullName" value-expr="id" />
        </DxColumn>

        <DxColumn data-field="justification" :visible="false" caption="Justificación" />

        <DxColumn data-field="tracking_code" caption="Código" :allow-editing="false" alignment="right"
          css-class="!font-black text-blue-600 dark:text-blue-400 !text-left" />

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

        <!-- Rejection block -->
        <div v-if="selectedItem?.status === 'REJECTED' && selectedItem?.rejection_reason"
          class="bg-red-50 dark:bg-red-900/20 rounded-[1.5rem] p-6 border border-red-100 dark:border-red-900/30 space-y-3">
          <h4
            class="text-red-800 dark:text-red-400 font-black flex items-center gap-2 text-xs uppercase tracking-widest">
            <InformationCircleIcon class="w-5 h-5" />
            Motivo de Rechazo
          </h4>
          <div class="text-sm text-red-700 dark:text-red-300/80">
            <p class="italic">"{{ selectedItem.rejection_reason }}"</p>
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
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-[480px] z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in zoom-in duration-300">
      <div class="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
        <div class="relative z-10">
          <h2 class="text-2xl font-black tracking-tight mb-1 text-white!">Generar Orden de Compra</h2>
          <p class="text-blue-100/80 text-[10px] font-black uppercase tracking-widest">
            SOLICITUD #{{ selectedRequestForOC?.tracking_code }}
          </p>
        </div>
        <ShoppingCartIcon
          class="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
      </div>

      <div class="p-8 text-left!">
        <div class="mb-10 text-left!">
          <DxSelectBox v-model:value="selectedSupplier" :items="suppliers" display-expr="fullName" value-expr="id"
            :search-enabled="true" placeholder="Buscar proveedor..."
            class="premium-selectbox h-14 !rounded-2xl !border-slate-100 !bg-slate-50/50" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Condición de Pago</label>
            <DxSelectBox v-model:value="newOrderPaymentCondition" :items="['Contado', 'Crédito']"
              class="premium-selectbox h-12 !rounded-2xl !border-slate-100 !bg-slate-50/50" />
          </div>
          <div class="space-y-2 flex flex-col justify-end">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Impuesto IVA</label>
            <div @click="newOrderIncludeIva = !newOrderIncludeIva" 
              :class="`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${newOrderIncludeIva ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50/50 border-slate-100'}`">
              <div :class="`w-10 h-5 rounded-full relative transition-all ${newOrderIncludeIva ? 'bg-blue-600' : 'bg-slate-300'}`">
                <div :class="`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${newOrderIncludeIva ? 'translate-x-5' : 'translate-x-0'}`"></div>
              </div>
              <span class="text-[10px] font-bold text-slate-600">{{ newOrderIncludeIva ? '19%' : 'Exenta' }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Condiciones Especiales</label>
          <textarea v-model="newOrderSpecialConditions" rows="3" placeholder="Acuerdos especiales, despacho..."
            class="w-full rounded-2xl border-slate-100 bg-slate-50/50 dark:bg-navy-900/50 p-4 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none border dark:border-navy-700"></textarea>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="confirmarCrearOC"
            class="w-full py-4.5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all uppercase">
            Confirmar y Generar OC
          </button>
          <button @click="cerrarModalOC"
            class="w-full py-4.5 bg-white text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-50 hover:text-slate-600 active:scale-95 transition-all uppercase">
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

const mainGridRef = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)

const showCreateOCModal = ref(false)
const selectedRequestForOC = ref(null)
const selectedSupplier = ref(null)
const newOrderIncludeIva = ref(true)
const newOrderPaymentCondition = ref('Contado')
const newOrderSpecialConditions = ref('')
const suppliers = ref([])
const users = ref([])

function onInitNewRow(e) {
  e.data.requester_id = Number(localStorage.getItem('userId'))
}

function onEditorPreparing(e) {
  if (e.dataField === 'requester_id' && e.parentType === 'dataRow') {
    // Forzamos la carga de datos y configuración aquí para evitar el "Sin datos"
    e.editorOptions.items = users.value
    e.editorOptions.displayExpr = 'fullName'
    e.editorOptions.valueExpr = 'id'
    e.editorOptions.searchEnabled = true

    if (e.row.isNewRow && !e.value) {
      e.editorOptions.value = Number(localStorage.getItem('userId'))
    }
  }
}

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
      user_id: values.requester_id || Number(userId),
      company_id: Number(companyId)
    }

    const { data } = await conexionApi.post('/purchase-requests', payload)

    // Buscar el nombre para la UI optimista
    const user = users.value.find(u => u.id === payload.user_id)

    return {
      id: data.id,
      ...payload,
      requester: user ? user.fullName : '',
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
  try {
    const [suppliersRes, usersRes, rolesRes] = await Promise.all([
      conexionApi.get('/suppliers', { params: { company_id: companyId } }),
      conexionApi.get('/configuracion/usuarios/getUsuarios'),
      conexionApi.get('/configuracion/usuarios/getRoles')
    ])

    const allRoles = rolesRes.data.roles || []
    suppliers.value = (suppliersRes.data.suppliers || []).map(s => ({
      ...s,
      fullName: `${s.name} (${s.rut || 'Sin RUT'})`
    }))
    
    users.value = (usersRes.data.usuarios || [])
      .filter(u => u.id_company === Number(companyId))
      .map(u => {
        const rol = allRoles.find(r => r.id_rol === u.id_rol)
        return {
          id: u.id,
          fullName: `${u.name} ${u.lastname} (${rol ? rol.descripcion : 'S/R'})`
        }
      })

    console.log('Catálogo de usuarios con roles cargado:', users.value.length, 'registros');
  } catch (err) {
    console.error('Error cargando catálogos:', err)
  }
})

function abrirModalCrearOC(request) {
  selectedRequestForOC.value = request
  selectedSupplier.value = null
  newOrderIncludeIva.value = true
  newOrderPaymentCondition.value = 'Contado'
  newOrderSpecialConditions.value = ''
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
        user_id: userId,
        include_iva: newOrderIncludeIva.value ? 1 : 0,
        payment_condition: newOrderPaymentCondition.value,
        special_conditions: newOrderSpecialConditions.value
      }
    )

    // 🔹 Guardar el ID de la OC en el objeto de la solicitud
    selectedItem.value = {
      ...selectedRequestForOC.value,
      purchase_order_id: data.purchase_order_id,
      purchase_order_code: data.order_code
    }

    showCreateOCModal.value = false
    mainGridRef.value?.instance.refresh()

    alert(`Orden de compra creada correctamente (ID: ${data.purchase_order_id} - Código: ${data.order_code})`)
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

    mainGridRef.value?.instance.refresh()

    alert(`Solicitud #${request.tracking_code} aprobada por ${data.approver_name}`)
  } catch (err) {
    console.error(err)
    alert('Error al aprobar la solicitud')
  }
}

async function rechazarSolicitud(request) {
  const reason = prompt(`¿Motivo del rechazo para la solicitud #${request.tracking_code}?`)
  if (reason === null) return // Cancelado

  try {
    await conexionApi.put(`/purchase-requests/${request.id}/reject`, {
      company_id: companyId,
      rejection_reason: reason
    })

    request.status = 'REJECTED'
    request.rejection_reason = reason

    mainGridRef.value?.instance.refresh()

    alert(`Solicitud #${request.tracking_code} rechazada`)
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.mensaje || 'Error al rechazar la solicitud')
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
      return (userRole === 1 || userRole === 2 || userRole === 9) && status === 'REQUESTED'
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
