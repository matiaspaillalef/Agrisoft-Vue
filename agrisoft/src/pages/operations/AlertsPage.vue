<template>
    <div class="alerts-page px-0 pb-12">
        <!-- Title Page -->
        <div
            class="mb-8 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-500 hover:shadow-md animate-fade-in mx-4 md:mx-0">
            <div class="flex items-center gap-6">
                <div class="p-5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-xl shadow-rose-200">
                    <BellIcon class="w-10 h-10 text-white animate-ring" />
                </div>
                <div>
                    <h1 class="text-4xl font-black text-slate-800 tracking-tight">Centro de Alertas</h1>
                    <p class="text-slate-500 font-bold text-lg mt-1">Administración centralizada de notificaciones
                        críticas</p>
                </div>
            </div>

            <!-- Stats (Sin botón, solo info) -->
            <div class="hidden md:flex gap-10 items-center border-l border-slate-100 pl-10">
                <div class="text-right">
                    <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Recibidas</p>
                    <p class="text-3xl font-black text-slate-800">{{ alerts.length }}</p>
                </div>
                <div class="h-12 w-px bg-slate-100"></div>
                <div class="text-right">
                    <p class="text-xs font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Por atender</p>
                    <div class="flex items-center justify-end gap-3 text-3xl font-black text-rose-600">
                        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        {{alerts.filter(a => a.is_read == 0).length}}
                    </div>
                </div>
                <div class="h-12 w-px bg-slate-100"></div>
                <div class="text-right">
                    <p class="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Atendidas</p>
                    <p class="text-3xl font-black text-emerald-600">{{alerts.filter(a => a.is_read == 1).length}}</p>
                </div>
            </div>
        </div>

        <!-- DataGrid Container Premium -->
        <div
            class="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-50 animate-slide-up relative mx-4 md:mx-0 pb-16">
            <LoadingOverlay :show="loading" />

            <!-- Grid Header Actions 
            <div class="flex items-center justify-between mb-10 px-2">
                <h2 class="text-2xl font-black text-slate-800 tracking-tight">Listado de Alertas</h2>
                <button @click="openAddPopup"
                    class="flex items-center gap-3 bg-[#007aff] hover:bg-[#0066ee] text-white px-10 py-4 px-5 rounded-[1.2rem] text-[14px] font-black transition-all shadow-xl shadow-blue-100 active:scale-95 group w-fit!">
                    <PlusIcon class="w-6 h-6 stroke-[3px] group-hover:rotate-90 transition-transform" />
                    Nueva Alerta
                </button>
            </div>-->

            <DxDataGrid ref="gridRef" :data-source="filteredAlerts" key-expr="id" :show-borders="false"
                :column-auto-width="true" :row-alternation-enabled="false" :hover-state-enabled="true"
                class="custom-grid" @saving="onSaving" @exporting="onExporting" :load-panel="{ enabled: false }">
                <DxPaging :page-size="20" />
                <DxPager :show-page-size-selector="true" :allowed-page-sizes="[10, 20, 50]" :show-info="true"
                    :visible="true" position="bottom" />

                <!-- Toolbar estilo Premium -->
                <DxToolbar class="mb-8!">
                    <DxToolbarItem location="before" v-if="isAdmin">
                        <template #default>
                            <div class="w-[300px]">
                                <DxSelectBox :items="users" display-expr="fullName" value-expr="id"
                                    v-model="selectedUser" placeholder="Usuario..."
                                    class="custom-selectbox-toolbar text-base font-normal shadow-sm"
                                    :search-enabled="true" />
                            </div>
                        </template>
                    </DxToolbarItem>

                    <DxToolbarItem location="after">
                        <template #default>
                            <div class="flex items-center gap-4">
                                <!-- Buscador estilo Circular Wide -->
                                <div class="relative group">
                                    <div
                                        class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                        <MagnifyingGlassIcon />
                                    </div>
                                    <input type="text" v-model="searchQuery" placeholder="Buscar alerta..."
                                        class="w-[250px] min-w-[250px] bg-slate-50/50 border border-slate-100 rounded-2xl pl-14! pr-4 text-sm font-normal text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-inner">
                                </div>
                            </div>
                        </template>
                    </DxToolbarItem>

                    <DxToolbarItem name="exportButton" location="after" />
                </DxToolbar>

                <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true"
                    :use-icons="true">
                    <DxGridPopup title="Formulario de Alerta" :show-title="true" :width="700" :height="'auto'"
                        :shading="true" position="center" />
                    <DxForm :col-count="2">
                        <DxItem data-field="user_id"
                            :editor-options="{ dataSource: users, displayExpr: 'fullName', valueExpr: 'id', searchEnabled: true }"
                            editor-type="dxSelectBox" caption="Usuario Asignado" :col-span="2" />
                        <DxItem data-field="type" caption="Tipo de Alerta" />
                        <DxItem data-field="title" caption="Asunto" />
                        <DxItem data-field="description" editor-type="dxTextArea" :editor-options="{ height: 120 }"
                            caption="Descripción" :col-span="2" />
                        <DxItem data-field="is_read" editor-type="dxCheckBox" caption="Atendida (Leída)" />
                    </DxForm>
                </DxEditing>

                <DxColumn data-field="id" caption="#" :width="80" :alignment="'center'"
                    css-class="font-mono text-slate-400" />

                <DxColumn data-field="created_at" caption="Registro" :data-type="'datetime'" format="dd/MM HH:mm"
                    :sort-order="'desc'" :width="130" alignment="right" css-class="!text-left" />

                <DxColumn data-field="type" caption="Tipo" :width="200" cell-template="typeCellTemplate"
                    alignment="right" css-class="!text-left" />
                <template #typeCellTemplate="{ data }" alignment="right" css-class="!text-left">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500 shadow-sm animate-pulse"></span>
                        <span
                            class="uppercase text-[11px] font-black tracking-wider text-slate-500">{{ getAlertLabel(data.value) }}</span>
                    </div>
                </template>

                <DxColumn data-field="title" caption="Notificación" cell-template="titleCellTemplate" alignment="right"
                    css-class="!text-left" />
                <template #titleCellTemplate="{ data }" alignment="right" css-class="!text-left">
                    <div class="flex flex-col py-1">
                        <span class="text-sm font-black text-slate-800 leading-tight">{{ data.data.title }}</span>
                        <span
                            class="text-[11px] font-medium text-slate-400 truncate max-w-[250px]">{{ data.data.description }}</span>
                    </div>
                </template>

                <DxColumn data-field="user_id" caption="Responsable" cell-template="userCellTemplate" alignment="right"
                    css-class="!text-left" />
                <template #userCellTemplate="{ data }" alignment="right" css-class="!text-left">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                            {{ getUserInitials(data.data) }}
                        </div>
                        <span class="text-sm font-bold text-slate-600">
                            {{ data.data.user_name || getUserFullName(data.value) }}
                        </span>
                    </div>
                </template>

                <DxColumn data-field="is_read" caption="Estado" cell-template="statusCellTemplate" :width="110"
                    alignment="right" css-class="!text-left" />
                <template #statusCellTemplate="{ data }">
                    <!-- Comprobación numérica flexible para is_read (0 o 1) -->
                    <div class="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border"
                        :class="data.value == 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 font-black animate-slide-up'">
                        <div v-if="data.value == 0" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                        <span class="text-[10px] font-black uppercase tracking-wider">
                            {{ data.value == 1 ? 'Atendida' : 'Crítica' }}
                        </span>
                    </div>
                </template>



                <DxColumn type="buttons" :width="140" :buttons="alertsButtons" />
            </DxDataGrid>
        </div>

        <!-- POPUP DE VISUALIZACIÓN MODO LECTURA -->
        <DxPopup v-model:visible="viewModalVisible" :show-title="true" title="Detalles de la Notificación" :width="650"
            :height="500" :shading="true" class="view-alert-popup" position="center">
            <template #content>
                <div class="px-6 py-4 flex flex-col h-full bg-white rounded-b-3xl" v-if="selectedAlert">
                    <div class="flex items-start gap-6 mb-6">
                        <div class="p-5 bg-navy-900 rounded-[2rem] shadow-2xl shadow-navy-100 flex-shrink-0">
                            <BellIcon class="w-8 h-8 text-white" />
                        </div>
                        <div class="flex-1 text-left">
                            <h2 class="text-xl font-black text-slate-800 leading-tight mb-2 uppercase tracking-wide">
                                {{ selectedAlert.title || 'Sin Título' }}
                            </h2>
                            <div class="flex items-center gap-3">
                                <span
                                    class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    {{ selectedAlert.type || 'Tipo No Definido' }}
                                </span>
                                <span class="text-slate-400 font-bold text-xs">
                                    {{ formatDateTime(selectedAlert.created_at) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        class="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex-grow mb-6 overflow-y-auto text-left">
                        <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Mensaje
                            Detallado</p>
                        <div class="whitespace-pre-wrap leading-relaxed text-slate-600 font-medium text-sm">
                            {{ selectedAlert.description || 'No hay descripción disponible para esta notificación.' }}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsable
                                Atribución</p>
                            <p class="text-sm font-bold text-navy-900">{{ getUserFullName(selectedAlert.user_id) }}</p>
                        </div>
                        <div class="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-right">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de
                                Lectura</p>
                            <div class="flex items-center justify-end gap-2 text-sm font-black"
                                :class="selectedAlert.is_read ? 'text-emerald-600' : 'text-rose-600'">
                                <span v-if="!selectedAlert.is_read"
                                    class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                {{ selectedAlert.is_read ? 'ATENDIDA' : 'CRÍTICA / PENDIENTE' }}
                            </div>
                        </div>
                    </div>

                    <button @click="viewModalVisible = false"
                        class="w-full bg-navy-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-navy-100 flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                        Entendido, Cerrar
                    </button>
                </div>
                <div v-else class="flex flex-col items-center justify-center h-full gap-4 text-slate-400 p-10">
                    <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p class="text-sm font-bold animate-pulse">Cargando detalles de la alerta...</p>
                </div>
            </template>
        </DxPopup>

    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { BellIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import {
    DxDataGrid,
    DxColumn,
    DxEditing,
    DxPopup as DxGridPopup,
    DxForm,
    DxItem,
    DxButton,
    DxPager,
    DxPaging,
    DxScrolling,
    DxToolbar,
    DxItem as DxToolbarItem
} from 'devextreme-vue/data-grid'
import DxPopup from 'devextreme-vue/popup'
import DxSelectBox from 'devextreme-vue/select-box'
import DxTextArea from 'devextreme-vue/text-area'
import DxCheckBox from 'devextreme-vue/check-box'
import conexionApi from '@/services/conexionApi'
import { alertsUpdateTrigger, notifyAlertsChange } from '@/services/alertsState.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import notify from 'devextreme/ui/notify'
import { confirm } from 'devextreme/ui/dialog'

const loading = ref(true)
const gridRef = ref(null)
const alerts = ref([])
const users = ref([])
const selectedUser = ref(null)
const searchQuery = ref('')
const companyID = localStorage.getItem('userIdCompany')

// Obtener datos del usuario actual
const currentUserId = Number(localStorage.getItem('userId') || 0)
const rolId = Number(localStorage.getItem('rol') || 0)

// Admin/SuperAdmin (1 y 2) pueden ver a todos, otros solo sus alertas
const isAdmin = computed(() => [1, 2].includes(rolId))

// Estado Modal Visualización
const viewModalVisible = ref(false)
const selectedAlert = ref(null)

// Sincronización global con el Header
watch(alertsUpdateTrigger, () => {
    loadAlerts()
})

/* =====================
   DATA FETCHING
===================== */
const loadUsers = async () => {
    if (!isAdmin.value) return
    try {
        const { data } = await conexionApi.get(`/configuracion/usuarios/${companyID}`)
        const mappedUsers = data.usuarios.map(u => ({
            ...u,
            fullName: `${u.name} ${u.lastname}`
        }))

        // Opción segura basada en número para "Mostrar Todas"
        users.value = [
            { id: 0, fullName: 'MOSTRAR TODAS LAS ALERTAS' },
            ...mappedUsers
        ]
    } catch (error) {
        console.error('Error cargando usuarios:', error)
    }
}

const loadAlerts = async () => {
    if (selectedUser.value === null || selectedUser.value === undefined) return

    loading.value = true
    try {
        if (selectedUser.value === 0) {
            // Usuario 0 es el comodín para cargar todo de la empresa
            const { data } = await conexionApi.get(`/alerts/company/${companyID}`)
            alerts.value = data.alerts || []
        } else {
            // Carga alertas de un usuario específico
            const { data } = await conexionApi.get(`/alerts/user/${selectedUser.value}`)
            alerts.value = data.alerts || []
        }
    } catch (error) {
        console.error('Error cargando alertas:', error)
        alerts.value = []
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    if (isAdmin.value) {
        await loadUsers()
        selectedUser.value = 0 // Establece 'Mostrar Todas' por defecto
    } else {
        selectedUser.value = currentUserId
    }

    await loadAlerts()
})

watch(selectedUser, () => {
    loadAlerts()
})

/* =====================
   COMPUTED
===================== */
const filteredAlerts = computed(() => {
    if (!searchQuery.value) return alerts.value

    const q = searchQuery.value.toLowerCase()
    return alerts.value.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.id?.toString().includes(q) ||
        a.type?.toLowerCase().includes(q)
    )
})

/* =====================
   GRID UTILS
===================== */
const getUserFullName = (userId) => {
    const user = users.value.find(u => u.id == userId)
    return user ? user.fullName : 'Aviso General'
}

const getUserInitials = (alertObjOrId) => {
    if (alertObjOrId && alertObjOrId.user_name) {
        const parts = alertObjOrId.user_name.split(' ')
        return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
    }
    const user = users.value.find(u => u.id == (alertObjOrId?.user_id || alertObjOrId))
    if (!user) return 'AG'
    return `${user.name[0]}${user.lastname[0]}`
}

const markAsRead = async (alertId) => {
    try {
        const targetUserId = selectedUser.value === 0 ? currentUserId : selectedUser.value
        await conexionApi.put(`/alerts/${alertId}/read`, { user_id: targetUserId })
        notify('Notificación Atendida', 'success', 1500)
        notifyAlertsChange()
        loadAlerts()
    } catch (error) {
        console.error('Error al marcar como leída:', error)
        notify('No se pudo marcar la alerta como atendida.', 'error', 2000)
    }
}

const getAlertLabel = (type) => {
    const labels = {
        'task_assigned': 'TAREA ASIGNADA',
        'admin_generated': 'ORDEN ADMIN',
        'purchase_request': 'SOLICITUD COMPRA',
        'nuevo_transito': 'NUEVO TRÁNSITO'
    }
    return labels[type] || type?.toUpperCase() || 'GENERAL'
}

const openViewModal = (data) => {
    selectedAlert.value = data
    viewModalVisible.value = true
}

const alertsButtons = [
    {
        hint: 'Detalles',
        icon: 'custom-view',
        onClick: e => openViewModal(e.row.data)
    },
    {
        hint: 'Atender Alerta',
        icon: 'custom-check',
        visible: e => !e.row.data.is_read,
        onClick: e => markAsRead(e.row.data.id)
    },
    {
        name: 'edit',
        icon: 'edit',
        hint: 'Editar'
    },
    {
        name: 'delete',
        icon: 'trash',
        hint: 'Eliminar'
    }
]

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    try {
        return new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateStr))
    } catch (e) {
        return dateStr
    }
}

const onExporting = (e) => {
    loading.value = true
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Alertas')

    exportDataGrid({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
        customizeCell: ({ gridCell, excelCell }) => {
            if (gridCell.rowType === 'header') {
                excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF112D6E' } }
                excelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
            }
        }
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Alertas.xlsx')
            loading.value = false
        })
    })
}

/* =====================
   CRUD HANDLERS
===================== */
const onSaving = async (e) => {
    e.cancel = true // Manejo manual
    const change = e.changes[0]
    if (!change) return

    try {
        if (change.type === 'insert') {
            const payload = {
                ...change.data,
                user_id: change.data.user_id || selectedUser.value,
                type: change.data.type || 'Informativo',
                created_at: new Date().toISOString()
            }
            await conexionApi.post('/alerts', payload)
            notify('Alerta Registrada', 'success', 2000)
        }
        else if (change.type === 'remove') {
            const result = await confirm('¿Estás seguro que deseas eliminar esta alerta permanentemente?', 'Eliminar Alerta')
            if (result) {
                await conexionApi.delete(`/alerts/${change.key}`)
                notify('Eliminado', 'success', 2000)
            } else {
                return
            }
        }
        else if (change.type === 'update') {
            // Si solo cambia is_read
            if (Object.keys(change.data).length === 1 && 'is_read' in change.data) {
                await conexionApi.put(`/alerts/${change.key}/read`, { user_id: selectedUser.value })
            } else {
                // Enviar actualización general (Requiere que el backend lo soporte o usar POST con ID)
                // Por ahora simulamos actualización exitosa si el backend no tiene PUT genérico
                await conexionApi.put(`/alerts/${change.key}`, change.data)
            }
            notify('Actualizado', 'success', 1500)
        }

        gridRef.value?.instance.cancelEditData()
        loadAlerts()
    } catch (error) {
        console.error('Error CRUD alertas:', error)
        notify(error.response?.data?.mensaje || 'No se pudo completar la operación en el servidor.', 'error', 4000)
    }
}

</script>

<style scoped>
.custom-grid :deep(.dx-datagrid-headers) {
    background-color: transparent !important;
    padding-bottom: 20px !important;
}

.custom-grid :deep(.dx-datagrid-text-content) {
    color: #94a3b8 !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    font-size: 11px !important;
}

.custom-grid :deep(.dx-row:not(.dx-header-row)) {
    transition: all 0.3s ease;
}

.custom-grid :deep(.dx-data-row:hover) {
    background-color: #f8fafc !important;
    transform: translateX(4px);
}

.custom-selectbox :deep(.dx-texteditor-container) {
    border-radius: 1rem !important;
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
    padding: 4px;
}

.custom-selectbox :deep(.dx-texteditor-input) {
    font-weight: 700;
    color: #1e293b;
}

:deep(.custom-add-btn) {
    background-color: #0f172a !important;
    /* slate-900 */
    color: white !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2) !important;
    transition: all 0.2s ease;
}

:deep(.custom-add-btn:hover) {
    transform: scale(1.05);
    background-color: #1e293b !important;
}

@keyframes ring {
    0% {
        transform: rotate(0);
    }

    10% {
        transform: rotate(15deg);
    }

    20% {
        transform: rotate(-15deg);
    }

    30% {
        transform: rotate(10deg);
    }

    40% {
        transform: rotate(-10deg);
    }

    50% {
        transform: rotate(5deg);
    }

    100% {
        transform: rotate(0);
    }
}

.animate-ring {
    animation: ring 2s infinite ease-in-out;
}

@keyframes bounce-subtle {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-3px);
    }
}

.animate-bounce-subtle {
    animation: bounce-subtle 2s infinite ease-in-out;
}

.animate-fade-in {
    animation: fadeIn 0.8s ease-out;
}

.animate-slide-down {
    animation: slideDown 0.6s ease-out;
}

.animate-slide-up {
    animation: slideUp 0.6s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
