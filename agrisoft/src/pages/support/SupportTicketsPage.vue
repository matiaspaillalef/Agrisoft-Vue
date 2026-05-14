<template>
  <!-- Title -->
  <div
    class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-6">
      <div class="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-200/50">
        <LifebuoyIcon class="w-10 h-10 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Soporte y Consultas</h1>
        <p class="text-slate-500 dark:text-gray-400 font-medium font-inter">Gestione sus solicitudes de asistencia y
          consultas técnicas</p>
      </div>
    </div>

    <div class="flex gap-3">
      <button v-if="userRol === 1" @click="showConfig = true"
        class="flex items-center gap-3 bg-white dark:bg-navy-900 text-slate-700 dark:text-white px-6 py-3.5 rounded-2xl border border-slate-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-all active:scale-95 text-sm font-bold">
        <Cog6ToothIcon class="w-5 h-5 text-slate-400" />
        Configuración
      </button>
      <button v-if="userRol === 2 || userRol === 1" @click="openNewTicketModal"
        class="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-200/50 transition-all active:scale-95 text-sm font-black whitespace-nowrap">
        <PlusIcon class="w-5 h-5" />
        Nueva Solicitud
      </button>
    </div>
  </div>

  <!-- Stats Dashboard (Solo Superadmin) -->
  <div v-if="userRol === 1" class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
    <div class="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><TicketIcon class="w-6 h-6" /></div>
        <span class="text-2xl font-black text-slate-800 dark:text-white">{{ supportStats.total || 0 }}</span>
      </div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tickets Totales</span>
    </div>

    <div class="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col gap-2 border-l-4 border-l-green-500">
      <div class="flex items-center justify-between">
        <div class="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><CheckCircleIcon class="w-6 h-6" /></div>
        <span class="text-2xl font-black text-slate-800 dark:text-white">{{ supportStats.closed || 0 }}</span>
      </div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Contestados</span>
    </div>

    <div class="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col gap-2 border-l-4 border-l-red-500">
      <div class="flex items-center justify-between">
        <div class="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl"><ChatBubbleLeftEllipsisIcon class="w-6 h-6" /></div>
        <span class="text-2xl font-black text-slate-800 dark:text-white">{{ supportStats.to_answer || 0 }}</span>
      </div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Por Contestar</span>
    </div>

    <div class="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><WrenchScrewdriverIcon class="w-6 h-6" /></div>
        <span class="text-2xl font-black text-slate-800 dark:text-white">{{ supportStats.soporte || 0 }}</span>
      </div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Soporte</span>
    </div>

    <div class="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><BanknotesIcon class="w-6 h-6" /></div>
        <span class="text-2xl font-black text-slate-800 dark:text-white">{{ supportStats.comercial || 0 }}</span>
      </div>
      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Comercial</span>
    </div>
  </div>

  <div
    class="mt-2 max-w-full mx-auto rounded-[2.5rem] bg-white dark:bg-navy-800 p-8 shadow-xl border border-slate-50 dark:border-navy-700 text-[13px]! text-initial!">
    <DxDataGrid ref="gridRef" :data-source="dataSource" key-expr="id" :show-borders="false" :column-auto-width="true"
      :load-panel="{ enabled: false }">
      <DxSearchPanel :visible="true" placeholder="Buscar ticket..." />
      <DxHeaderFilter :visible="true" />
      <DxPaging :page-size="10" />

      <DxColumn data-field="id" caption="#ID" width="70" alignment="center" :allow-filtering="false"
        :allow-sorting="false" />
      <DxColumn data-field="subject" caption="Asunto" min-width="200" :cell-template="subjectTemplate"
        css-class="!text-left" alignment="right" />
      <DxColumn data-field="category" caption="Categoría" width="120" :cell-template="categoryTemplate"
        css-class="!text-left" alignment="right" />
      <DxColumn data-field="urgency" caption="Urgencia" width="100" :cell-template="urgencyTemplate"
        css-class="!text-left" alignment="right" />
      <DxColumn data-field="status" caption="Estado" width="120" :cell-template="statusTemplate" css-class="!text-left"
        alignment="right" />
      <DxColumn v-if="userRol === 1" data-field="company_name" caption="Empresa" css-class="!text-left"
        alignment="right" />
      <DxColumn data-field="created_at" caption="Fecha" data-type="date" format="dd/MM/yyyy HH:mm" width="150"
        css-class="!text-left" alignment="right" />
      <DxColumn type="buttons" :buttons="customButtons" width="100" />
    </DxDataGrid>
  </div>

  <!-- Modal Detalle de Ticket / Chat -->
  <div v-if="showDetail" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="fixed inset-0 bg-navy-900/60 backdrop-blur-sm" @click="closeDetail"></div>
    <div
      class="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden flex flex-col h-[90vh]">
      <!-- Header del Modal -->
      <div
        class="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center bg-gray-50 dark:bg-navy-800">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span
              class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-200">
              #{{ selectedTicket?.id }}
            </span>
            <h2 class="text-xl font-bold text-navy-700 dark:text-white">{{ selectedTicket?.subject }}</h2>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Abierto por {{ selectedTicket?.user_name }} {{ selectedTicket?.user_lastname }} •
            {{ selectedTicket?.company_name }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <select v-if="userRol === 1" v-model="selectedTicket.status" @change="updateTicketStatus"
            class="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-500">
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En Proceso</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <button @click="closeDetail" class="text-gray-400 hover:text-navy-600 transition w-fit!">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo del Chat -->
      <div
        class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-navy-700">
        <!-- Descripción Inicial -->
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-slate-100! dark:bg-navy-800 flex items-center justify-center shrink-0">
            <UserIcon class="w-6 h-6 text-navy-600 dark:text-navy-400" />
          </div>
          <div class="flex-1">
            <div
              class="bg-gray-50 dark:bg-navy-800 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-navy-700">
              <p class="text-sm text-navy-700 dark:text-gray-200 whitespace-pre-wrap">{{ selectedTicket?.description }}
              </p>
            </div>
            <span class="text-[10px] text-gray-400 mt-1 ml-1">{{ formatDateHrs(selectedTicket?.created_at) }}</span>
          </div>
        </div>

        <div v-for="msg in messages" :key="msg.id" class="flex gap-4"
          :class="{ 'flex-row-reverse': msg.id_user === userId }">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            :class="msg.id_user === userId ? 'bg-navy-600' : 'bg-gray-200 dark:bg-navy-700'">
            <UserIcon v-if="msg.id_user !== userId" class="w-6 h-6 text-gray-500 dark:text-gray-400" />
            <span v-else class="text-white text-xs font-bold">{{ msg.user_name[0] }}</span>
          </div>
          <div class="flex-1 max-w-[80%]" :class="{ 'text-right': msg.id_user === userId }">
            <div class="inline-block p-4 rounded-2xl border"
              :class="msg.id_user === userId ?
                'bg-slate-800 text-white border-navy-500 rounded-tr-none' :
                'bg-white dark:bg-navy-850 text-navy-700 dark:text-gray-200 border-gray-100 dark:border-navy-700 rounded-tl-none'">
              <p class="text-sm whitespace-pre-wrap">{{ msg.message }}</p>
            </div>
            <div class="mt-1 flex items-center gap-2" :class="{ 'justify-end': msg.id_user === userId }">
              <span class="text-[10px] text-gray-400">{{ msg.user_name }} • {{ formatDateHrs(msg.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input de Chat -->
      <div class="p-4 bg-gray-50 dark:bg-navy-800 border-t border-gray-100 dark:border-navy-700">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <textarea v-model="newMessage" placeholder="Escriba su respuesta..."
            class="flex-1 bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none min-h-[44px]"
            rows="1" @keydown.enter.exact.prevent="sendMessage"></textarea>
          <button type="submit" :disabled="!newMessage.trim()"
            class="bg-navy-600 hover:bg-navy-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-md w-fit!">
            <PaperAirplaneIcon class="w-5 h-5 -rotate-45" />
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal Nuevo Ticket -->
  <div v-if="showNewTicket" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" @click="showNewTicket = false"></div>
    <div class="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-gray-100 dark:border-navy-700">
      <div class="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center">
        <h2 class="text-xl font-bold text-navy-700 dark:text-white">
          {{ isEditing ? 'Editar Ticket de Soporte' : 'Nueva Solicitud de Soporte' }}
        </h2>
        <button @click="showNewTicket = false" class="text-gray-400 hover:text-navy-600 transition w-fit!">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      <form @submit.prevent="createTicket" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto</label>
          <input v-model="newTicket.subject" required type="text"
            class="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            placeholder="Ej: Problema al cargar facturas">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <select v-model="newTicket.category" required
              class="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
              <option value="soporte">Soporte Técnico</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgencia</label>
            <select v-model="newTicket.urgency" required
              class="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
          <textarea v-model="newTicket.description" required
            class="w-full bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 h-32 resize-none"
            placeholder="Describa su problema en detalle..."></textarea>
        </div>
        <button type="submit" :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-blue-200/50 transition active:scale-95 disabled:opacity-50">
          {{ loading ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Enviar Solicitud') }}
        </button>
      </form>
    </div>
  </div>

  <!-- Modal Configuración (Solo Superadmin) -->
  <div v-if="showConfig" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" @click="showConfig = false"></div>
    <div class="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center">
        <h2 class="text-xl font-bold text-navy-700 dark:text-white">Configuración de Notificaciones</h2>
        <button @click="showConfig = false" class="text-gray-400 hover:text-navy-600 transition">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      <div class="p-6 space-y-6">
        <p class="text-sm text-gray-500 dark:text-gray-400 italic">
          Seleccione los superadministradores que recibirán notificaciones por email para cada categoría.
        </p>

        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
          <div v-for="cat in ['soporte', 'comercial']" :key="cat" class="bg-gray-50 dark:bg-navy-800 p-4 rounded-2xl">
            <h3
              class="text-sm font-bold uppercase tracking-wider text-navy-600 dark:text-navy-300 mb-3 flex items-center gap-2">
              <EnvelopeIcon class="w-4 h-4" />
              Notificar {{ cat }} a:
            </h3>
            <div class="space-y-2">
              <div v-for="user in superAdminsList" :key="user.id"
                class="flex items-center justify-between bg-white dark:bg-navy-900 p-3 rounded-xl border border-gray-100 dark:border-navy-700 shadow-sm">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-gray-100 dark:bg-navy-700 flex items-center justify-center text-xs font-bold text-navy-600 dark:text-navy-300">
                    {{ user.name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-navy-700 dark:text-white">{{ user.name }} {{ user.lastname }}</p>
                    <p class="text-xs text-gray-400">{{ user.mail }}</p>
                  </div>
                </div>
                <input type="checkbox" :checked="isNotified(user.id, cat)" @change="toggleNotification(user.id, cat)"
                  class="w-5 h-5 rounded border-gray-300 text-navy-600 focus:ring-navy-500 cursor-pointer">
              </div>
            </div>
          </div>
        </div>

        <button @click="saveConfig" :disabled="loading"
          class="w-full bg-navy-600 hover:bg-navy-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50">
          {{ loading ? 'Guardando...' : 'Guardar Configuración' }}
        </button>
      </div>
    </div>
  </div>

  <LoadingOverlay v-if="loading" />
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import {
  DxDataGrid,
  DxColumn,
  DxSearchPanel,
  DxPaging,
  DxHeaderFilter
} from 'devextreme-vue/data-grid'
import { LifebuoyIcon, TicketIcon, PlusIcon, XMarkIcon, UserIcon, PaperAirplaneIcon, Cog6ToothIcon, EnvelopeIcon, InformationCircleIcon, CheckCircleIcon, ChatBubbleLeftEllipsisIcon, WrenchScrewdriverIcon, BanknotesIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import conexionApi from '@/services/conexionApi'
import { formatDateHrs } from '@/utils/herlpers'
import CustomStore from 'devextreme/data/custom_store'
import notify from 'devextreme/ui/notify'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const gridRef = ref(null)

const userId = Number(localStorage.getItem('userId'))
const userRol = Number(localStorage.getItem('rol'))
const loading = ref(false)

const showDetail = ref(false)
const showNewTicket = ref(false)
const showConfig = ref(false)
const isEditing = ref(false)

const selectedTicket = ref(null)
const messages = ref([])
const newMessage = ref('')

const superAdminsList = ref([])
const notificationConfig = ref([])
const supportStats = ref({})

const newTicket = ref({
  subject: '',
  category: 'soporte',
  urgency: 'baja',
  description: ''
})

/* =========================
   CARGA DE DATOS
========================== */
const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    try {
      const { data } = await conexionApi.get('/support/tickets')
      if (userRol === 1) loadStats()
      return data.tickets || []
    } catch (err) {
      console.error(err)
      return []
    }
  }
})

onMounted(async () => {
  if (userRol === 1) {
    await loadConfig()
    await loadSuperAdmins()
  }
})

async function loadConfig() {
  const { data } = await conexionApi.get('/support/config/notified-admins')
  notificationConfig.value = data.configs || []
}

async function loadSuperAdmins() {
  try {
    const { data } = await conexionApi.get('/support/config/superadmins')
    superAdminsList.value = data.superadmins || []
  } catch (err) {
    console.error(err)
  }
}

async function loadStats() {
  try {
    const { data } = await conexionApi.get('/support/stats')
    supportStats.value = data.stats || {}
  } catch (err) {
    console.error(err)
  }
}

/* =========================
   ACCIONES TICKET
========================== */
function openNewTicketModal() {
  isEditing.value = false
  newTicket.value = { subject: '', category: 'soporte', urgency: 'baja', description: '' }
  showNewTicket.value = true
}

function openEditTicketModal(ticket) {
  isEditing.value = true
  selectedTicket.value = ticket
  newTicket.value = { ...ticket }
  showNewTicket.value = true
}

async function createTicket() {
  loading.value = true
  try {
    if (isEditing.value) {
      await conexionApi.patch(`/support/tickets/${selectedTicket.value.id}`, newTicket.value)
      notify({ message: 'Ticket actualizado', type: 'success' })
    } else {
      await conexionApi.post('/support/tickets', newTicket.value)
      notify({ message: 'Ticket creado con éxito', type: 'success' })
    }
    
    showNewTicket.value = false
    gridRef.value.instance.refresh()

    // Reset form
    newTicket.value = {
      subject: '',
      category: 'soporte',
      urgency: 'baja',
      description: ''
    }
  } catch (err) {
    console.error(err)
    notify({ message: 'Error al crear el ticket', type: 'error', displayTime: 3000, position: 'top center' })
  } finally {
    loading.value = false
  }
}

async function viewTicket(ticket) {
  selectedTicket.value = { ...ticket }
  const { data } = await conexionApi.get(`/support/tickets/${ticket.id}`)
  messages.value = data.messages || []
  showDetail.value = true
  scrollChatToBottom()

  // Refrescar grid y notificaciones globales
  gridRef.value?.instance.refresh()
  window.dispatchEvent(new CustomEvent('update-unread-support'))
}

function closeDetail() {
  showDetail.value = false
  selectedTicket.value = null
  messages.value = []
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  const msg = newMessage.value
  newMessage.value = ''

  try {
    await conexionApi.post(`/support/tickets/${selectedTicket.value.id}/messages`, {
      message: msg
    })
    const { data: detailData } = await conexionApi.get(`/support/tickets/${selectedTicket.value.id}`)
    messages.value = detailData.messages || []
    scrollChatToBottom()

    // Refrescar grid y notificaciones globales
    gridRef.value?.instance.refresh()
    window.dispatchEvent(new CustomEvent('update-unread-support'))
    notify({ message: 'Mensaje enviado', type: 'success', displayTime: 1500, position: 'top center' })
  } catch (err) {
    console.error(err)
    notify({ message: 'No se pudo enviar el mensaje', type: 'error' })
  }
}

async function updateTicketStatus() {
  try {
    await conexionApi.patch(`/support/tickets/${selectedTicket.value.id}`, {
      status: selectedTicket.value.status
    })
    gridRef.value?.instance.refresh()
    notify({ message: 'Estado actualizado', type: 'info', displayTime: 2000, position: 'top center' })
  } catch (err) {
    notify({ message: 'Error al actualizar estado', type: 'error', displayTime: 2000, position: 'top center' })
  }
}

function scrollChatToBottom() {
  nextTick(() => {
    const container = document.querySelector('.scrollbar-thin')
    if (container) container.scrollTop = container.scrollHeight
  })
}

/* =========================
   CONFIGURACIÓN
========================== */
function isNotified(adminId, category) {
  return notificationConfig.value.some(c => c.id_user === adminId && c.category === category)
}

function toggleNotification(adminId, category) {
  const index = notificationConfig.value.findIndex(c => c.id_user === adminId && c.category === category)
  if (index > -1) {
    notificationConfig.value.splice(index, 1)
  } else {
    notificationConfig.value.push({ id_user: adminId, category, notification_order: 1 })
  }
}

async function saveConfig() {
  loading.value = true
  try {
    await conexionApi.post('/support/config/notified-admins', { configs: notificationConfig.value })
    notify({ message: 'Configuración guardada', type: 'success', displayTime: 3000, position: 'top center' })
    showConfig.value = false
  } catch (err) {
    console.error(err)
    notify({ message: 'Error al guardar configuración', type: 'error', displayTime: 3000, position: 'top center' })
  } finally {
    loading.value = false
  }
}

/* =========================
   TEMPLATES Y BOTONES
========================== */
const categoryTemplate = (el, info) => {
  const val = info.value
  const style = val === 'soporte' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  el.innerHTML = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style}">${val}</span>`
}

const urgencyTemplate = (el, info) => {
  const val = info.value
  let style = 'bg-gray-100 text-gray-700'
  if (val === 'alta') style = 'bg-red-100 text-red-700'
  if (val === 'media') style = 'bg-yellow-100 text-yellow-700'
  el.innerHTML = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style}">${val}</span>`
}

const statusTemplate = (el, info) => {
  const val = info.value
  let style = 'bg-green-100 text-green-700'
  if (val === 'en_proceso') style = 'bg-blue-100 text-blue-700'
  if (val === 'cerrado') style = 'bg-gray-100 text-gray-600'
  el.innerHTML = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style}">${val.replace('_', ' ')}</span>`
}

const subjectTemplate = (el, info) => {
  const data = info.data
  const isUnread = (userRol === 1 && data.has_unread_superadmin) || (userRol === 2 && data.has_unread_admin)

  el.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="${isUnread ? 'font-bold text-navy-800' : 'text-navy-600'}">${info.value}</span>
      ${isUnread ? '<span class="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-md uppercase animate-pulse">Nuevo</span>' : ''}
    </div>
  `
}

async function deleteTicket(ticket) {
  const ok = confirm(`¿Estás seguro que deseas eliminar el ticket #${ticket.id}?`)
  if (!ok) return
  
  loading.value = true
  try {
    await conexionApi.delete(`/support/tickets/${ticket.id}`)
    notify({ message: 'Ticket eliminado', type: 'success' })
    gridRef.value.instance.refresh()
    if (userRol === 1) loadStats()
  } catch (err) {
    console.error(err)
    notify({ message: 'No se pudo eliminar el ticket', type: 'error' })
  } finally {
    loading.value = false
  }
}

const customButtons = [
  {
    hint: 'Ver conversación',
    icon: 'custom-comment',
    onClick: e => viewTicket(e.row.data)
  },
  {
    hint: 'Editar',
    icon: 'edit',
    visible: e => userRol === 1 || e.row.data.id_user === userId,
    onClick: e => openEditTicketModal(e.row.data)
  },
  {
    hint: 'Eliminar',
    icon: 'trash',
    visible: e => userRol === 1 || e.row.data.id_user === userId,
    onClick: e => deleteTicket(e.row.data)
  }
]
</script>

<style scoped>
.support-grid {
  height: 100%;
}

:deep(.dx-datagrid) {
  background-color: transparent !important;
}

:deep(.dx-datagrid-headers) {
  background-color: transparent !important;
  color: #1b254b !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.dark :deep(.dx-datagrid-headers) {
  color: #ffffff !important;
}

:deep(.dx-header-filter) {
  color: #1b254b !important;
}

.dark :deep(.dx-header-filter) {
  color: #ffffff !important;
}

:deep(.dx-datagrid-content .dx-datagrid-table .dx-row > td) {
  padding: 12px 5px !important;
  font-size: 13px;
  color: #2b3674;
  font-weight: normal;
}

.dark :deep(.dx-datagrid-content .dx-datagrid-table .dx-row > td) {
  color: white;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #1b254b;
}
</style>
