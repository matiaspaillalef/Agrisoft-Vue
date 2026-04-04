<template>
    <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <ClockIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Turnos</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de horarios y turnos de trabajo semanales</p>
            </div>
        </div>
    </div>

    <!-- GRID CONTAINER -->
    <div
        class="custom-grid-container relative mt-[3px] flex w-full flex-grow flex-col items-center justify-start gap-2 rounded-3xl bg-white py-8 shadow-2xl px-2 md:px-10 mb-6 min-h-[500px] border border-gray-100 dark:bg-navy-800 dark:border-white/5">

        <!-- Header Actions Area -->
        <div class="flex w-full justify-between items-center mb-6 gap-4">
            <div class="flex-1 flex items-center">
                <h2 class="text-lg font-bold text-navy-700 dark:text-white hidden md:block">Listado de Turnos</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="addNewRecord"
                    class="group relative overflow-hidden flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 text-sm font-semibold tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Turno
                    <span
                        class="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full hover:translate-y-0 transition-transform duration-300"></span>
                </button>
            </div>
        </div>

        <DxDataGrid :ref="el => gridRef = el" :data-source="dataSource" :show-borders="false"
            v-model:selected-row-keys="selectedRowKeys" class="custom-grid overflow-hidden w-full"
            :column-auto-width="true" @exporting="onExporting" :load-panel="{ enabled: false }"
            :allow-column-reordering="true" :allow-column-resizing="true" key-expr="id">

            <DxExport :enabled="true" :allow-export-selected-data="false" />

            <DxToolbar>
                <DxToolbarItem name="exportButton" location="after" :visible="hasData" />
                <DxToolbarItem name="searchPanel" location="after" />
            </DxToolbar>

            <DxFilterRow :visible="false" />
            <DxHeaderFilter :visible="true" :allow-search="true" />
            <DxScrolling mode="standard" column-rendering-mode="virtual" />
            <DxPaging :enabled="true" :page-size="15" />
            <DxPager :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50]" :show-info="true" />

            <DxColumnFixing :enabled="true" />
            <DxSearchPanel :visible="true" placeholder="Buscar turno..." />

            <DxColumn data-field="id" sort-order="desc" alignment="right" css-class="!text-left" width="80"
                :visible="false" />
            <DxColumn data-field="name" caption="Nombre del Turno" alignment="right" css-class="!text-left" />

            <!-- Hidden columns for other days to ensure they participate in the editing state -->
            <DxColumn data-field="monday_opening_time" caption="Lun (I)" alignment="center" cell-template="timeTemplate"
                :visible="false" />
            <DxColumn data-field="monday_closing_time" caption="Lun (S)" alignment="center" cell-template="timeTemplate"
                :visible="false" />
            <DxColumn data-field="tuesday_opening_time" :visible="false" />
            <DxColumn data-field="tuesday_closing_time" :visible="false" />
            <DxColumn data-field="wednesday_opening_time" :visible="false" />
            <DxColumn data-field="wednesday_closing_time" :visible="false" />
            <DxColumn data-field="thursday_opening_time" :visible="false" />
            <DxColumn data-field="thursday_closing_time" :visible="false" />
            <DxColumn data-field="friday_opening_time" :visible="false" />
            <DxColumn data-field="friday_closing_time" :visible="false" />
            <DxColumn data-field="saturday_opening_time" :visible="false" />
            <DxColumn data-field="saturday_closing_time" :visible="false" />
            <DxColumn data-field="sunday_opening_time" :visible="false" />
            <DxColumn data-field="sunday_closing_time" :visible="false" />

            <DxColumn data-field="status" caption="Estado" alignment="right" css-class="!text-left"
                cell-template="statusTemplate" width="100" />

            <template #timeTemplate="{ data }">
                <span class="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {{ data.value ? String(data.value).substring(0, 5) : '-' }}
                </span>
            </template>

            <template #statusTemplate="{ data }">
                <span :class="data.value === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                    {{ data.value === 1 ? 'Activo' : 'Inactivo' }}
                </span>
            </template>

            <DxColumn type="buttons" width="120">
                <DxButton icon="custom-view" hint="Ver detalle" @click="viewRecord" />
                <DxButton name="edit" />
                <DxButton name="delete" />
            </DxColumn>

            <DxEditing mode="popup" :allow-updating="true" :allow-deleting="true" :allow-adding="true"
                :use-icons="true">
                <DxPopup title="Configuración de Turno" :show-title="true" :width="800" :height="700" />
                <DxForm :col-count="2">
                    <DxGroupItem caption="Información General" :col-count="2" :col-span="2">
                        <DxItem data-field="name" :col-span="1">
                            <DxLabel text="Nombre del Turno" />
                            <DxRequiredRule message="El nombre es requerido" />
                        </DxItem>
                        <DxItem data-field="status" editor-type="dxSelectBox" :col-span="1"
                            :editor-options="{ items: [{ id: 1, name: 'Activo' }, { id: 0, name: 'Inactivo' }], valueExpr: 'id', displayExpr: 'name' }">
                            <DxLabel text="Estado" />
                        </DxItem>
                    </DxGroupItem>

                    <DxGroupItem caption="Horarios Semanales" :col-count="2" :col-span="2">
                        <!-- Lunes -->
                        <DxGroupItem caption="Lunes" :col-count="2">
                            <DxItem data-field="monday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="monday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                        <!-- Martes -->
                        <DxGroupItem caption="Martes" :col-count="2">
                            <DxItem data-field="tuesday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="tuesday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                        <!-- Miércoles -->
                        <DxGroupItem caption="Miércoles" :col-count="2">
                            <DxItem data-field="wednesday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="wednesday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                        <!-- Jueves -->
                        <DxGroupItem caption="Jueves" :col-count="2">
                            <DxItem data-field="thursday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="thursday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                        <!-- Viernes -->
                        <DxGroupItem caption="Viernes" :col-count="2">
                            <DxItem data-field="friday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="friday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                        <!-- Sábado -->
                        <DxGroupItem caption="Sábado" :col-count="2">
                            <DxItem data-field="saturday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="saturday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                        <!-- Domingo -->
                        <DxGroupItem caption="Domingo" :col-count="2" :col-span="2">
                            <DxItem data-field="sunday_opening_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Entrada" />
                            </DxItem>
                            <DxItem data-field="sunday_closing_time" editor-type="dxDateBox"
                                :editor-options="{ type: 'time', displayFormat: 'HH:mm', pickerType: 'list' }">
                                <DxLabel text="Salida" />
                            </DxItem>
                        </DxGroupItem>
                    </DxGroupItem>
                </DxForm>
            </DxEditing>
        </DxDataGrid>

        <!-- View Popup -->
        <DxPopupWidget :visible="isViewPopupVisible" @hiding="isViewPopupVisible = false" :drag-enabled="false"
            :hide-on-outside-click="true" :show-title="true" title="Ficha del Turno" :width="700" :height="600">
            <div class="view-details-container p-6 overflow-y-auto h-full space-y-8 bg-gray-50/50 dark:bg-transparent">
                <!-- Header Info -->
                <div
                    class="flex items-center gap-6 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div
                        class="w-20 h-20 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-600/20">
                        {{ String(viewRecordData.name || 'T').charAt(0) }}
                    </div>
                    <div class="flex flex-col">
                        <h2 class="text-2xl font-black text-navy-700 dark:text-white">{{ viewRecordData.name }}</h2>
                        <span class="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">ID:
                            {{ viewRecordData.id }}</span>
                        <div class="mt-3">
                            <span
                                :class="viewRecordData.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {{ viewRecordData.status === 1 ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Horarios Detalle -->
                <div class="grid grid-cols-2 gap-4 px-2">
                    <div v-for="day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']"
                        :key="day"
                        class="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-2">
                        <h4
                            class="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-2">
                            {{ day.charAt(0).toUpperCase() + day.slice(1) }}
                        </h4>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-500 font-medium">Entrada:</span>
                            <span
                                class="text-navy-700 font-bold">{{ viewRecordData[day + '_opening_time'] ? String(viewRecordData[day + '_opening_time']).substring(0, 5) : 'No definida' }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-500 font-medium">Salida:</span>
                            <span
                                class="text-navy-700 font-bold">{{ viewRecordData[day + '_closing_time'] ? String(viewRecordData[day + '_closing_time']).substring(0, 5) : 'No definida' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </DxPopupWidget>

        <!-- Standalone Custom Loader -->
        <Transition name="fade-loader">
            <div v-if="loading"
                class="absolute inset-0 z-[2000] flex items-center justify-center bg-white/20 dark:bg-navy-900/10 backdrop-blur-[2px] rounded-3xl overflow-hidden">
                <div
                    class="custom-loader-wrapper p-10 bg-white/95 dark:bg-navy-800/95 backdrop-blur-2xl rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.2)] border border-white/20 flex flex-col items-center justify-center min-w-[240px]">
                    <div class="custom-spinner-box relative w-20 h-20 flex items-center justify-center">
                        <div
                            class="spinner-ring outer absolute inset-0 border-[4px] border-transparent border-t-blue-500 rounded-full">
                        </div>
                        <div
                            class="spinner-ring inner absolute inset-[6px] border-[4px] border-transparent border-b-blue-400 rounded-full opacity-60">
                        </div>
                        <div
                            class="spinner-logo bg-gradient-to-br from-blue-600 to-blue-400 p-2.5 rounded-xl rotate-12 animate-pulse shadow-lg ring-4 ring-blue-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div class="spinner-text-group mt-6 flex flex-col items-center">
                        <span
                            class="spinner-main-text font-bold text-navy-700 dark:text-white text-xl tracking-tight leading-none">Procesando</span>
                        <span
                            class="spinner-sub-text text-blue-500 text-[11px] font-black uppercase tracking-[0.4em] mt-2.5 animate-pulse leading-none">Agrisoft</span>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ClockIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import {
    DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxPaging, DxScrolling,
    DxColumnFixing, DxSearchPanel, DxHeaderFilter, DxExport, DxPager, DxToolbar, DxItem as DxToolbarItem,
    DxButton, DxFilterRow
} from 'devextreme-vue/data-grid'
import { DxPopup as DxPopupWidget } from 'devextreme-vue/popup'
import { DxItem, DxGroupItem, DxLabel, DxRequiredRule } from 'devextreme-vue/form'
import conexionApi from '@/services/conexionApi.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

const loading = ref(false)
const gridRef = ref(null)

const onExporting = (e) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Shifts');
    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Turnos.xlsx');
        });
    });
};

const selectedRowKeys = ref([])
const hasData = ref(false)
const companyID = Number(localStorage.getItem('userIdCompany')) || 0

// POPUP VIEW STATE
const isViewPopupVisible = ref(false)
const viewRecordData = ref({})

const viewRecord = (e) => {
    viewRecordData.value = { ...e.row.data };
    isViewPopupVisible.value = true;
}

const addNewRecord = () => {
    gridRef.value.instance.addRow()
}

// Support function for time formatting to HH:mm:ss for backend
const formatTimeToISO = (time) => {
    if (!time) return null;
    if (typeof time === 'string') return time;
    const date = new Date(time);
    return date.toTimeString().split(' ')[0]; // HH:mm:ss
}

// CUSTOM STORE LOGIC (SHIFTS)
const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const response = await conexionApi.get(`/management-people/shifts/getShifts/${companyID}`)
            const data = response.data.shifts || []
            hasData.value = data.length > 0
            return data
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {
        loading.value = true
        try {
            const payload = {
                name: values.name,
                monday_opening_time: formatTimeToISO(values.monday_opening_time),
                monday_closing_time: formatTimeToISO(values.monday_closing_time),
                tuesday_opening_time: formatTimeToISO(values.tuesday_opening_time),
                tuesday_closing_time: formatTimeToISO(values.tuesday_closing_time),
                wednesday_opening_time: formatTimeToISO(values.wednesday_opening_time),
                wednesday_closing_time: formatTimeToISO(values.wednesday_closing_time),
                thursday_opening_time: formatTimeToISO(values.thursday_opening_time),
                thursday_closing_time: formatTimeToISO(values.thursday_closing_time),
                friday_opening_time: formatTimeToISO(values.friday_opening_time),
                friday_closing_time: formatTimeToISO(values.friday_closing_time),
                saturday_opening_time: formatTimeToISO(values.saturday_opening_time),
                saturday_closing_time: formatTimeToISO(values.saturday_closing_time),
                sunday_opening_time: formatTimeToISO(values.sunday_opening_time),
                sunday_closing_time: formatTimeToISO(values.sunday_closing_time),
                status: values.status ?? 1,
                id_company: companyID
            }
            const res = await conexionApi.post('/management-people/shifts/createShift', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al crear turno')
            }
            return res.data
        } finally {
            loading.value = false
        }
    },
    update: async (key, values) => {
        loading.value = true
        try {
            const row = gridRef.value.instance.getVisibleRows().find(r => r.key === key)?.data || {}
            const payload = {
                id: key,
                name: values.name !== undefined ? values.name : row.name,
                monday_opening_time: formatTimeToISO(values.monday_opening_time !== undefined ? values.monday_opening_time : row.monday_opening_time),
                monday_closing_time: formatTimeToISO(values.monday_closing_time !== undefined ? values.monday_closing_time : row.monday_closing_time),
                tuesday_opening_time: formatTimeToISO(values.tuesday_opening_time !== undefined ? values.tuesday_opening_time : row.tuesday_opening_time),
                tuesday_closing_time: formatTimeToISO(values.tuesday_closing_time !== undefined ? values.tuesday_closing_time : row.tuesday_closing_time),
                wednesday_opening_time: formatTimeToISO(values.wednesday_opening_time !== undefined ? values.wednesday_opening_time : row.wednesday_opening_time),
                wednesday_closing_time: formatTimeToISO(values.wednesday_closing_time !== undefined ? values.wednesday_closing_time : row.wednesday_closing_time),
                thursday_opening_time: formatTimeToISO(values.thursday_opening_time !== undefined ? values.thursday_opening_time : row.thursday_opening_time),
                thursday_closing_time: formatTimeToISO(values.thursday_closing_time !== undefined ? values.thursday_closing_time : row.thursday_closing_time),
                friday_opening_time: formatTimeToISO(values.friday_opening_time !== undefined ? values.friday_opening_time : row.friday_opening_time),
                friday_closing_time: formatTimeToISO(values.friday_closing_time !== undefined ? values.friday_closing_time : row.friday_closing_time),
                saturday_opening_time: formatTimeToISO(values.saturday_opening_time !== undefined ? values.saturday_opening_time : row.saturday_opening_time),
                saturday_closing_time: formatTimeToISO(values.saturday_closing_time !== undefined ? values.saturday_closing_time : row.saturday_closing_time),
                sunday_opening_time: formatTimeToISO(values.sunday_opening_time !== undefined ? values.sunday_opening_time : row.sunday_opening_time),
                sunday_closing_time: formatTimeToISO(values.sunday_closing_time !== undefined ? values.sunday_closing_time : row.sunday_closing_time),
                status: values.status !== undefined ? values.status : row.status,
                id_company: companyID
            }
            const res = await conexionApi.post('/management-people/shifts/updateShift', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al actualizar turno')
            }
            return payload
        } finally {
            loading.value = false
        }
    },
    remove: async (key) => {
        loading.value = true
        try {
            const res = await conexionApi.post('/management-people/shifts/deleteShift', { id: key })
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al eliminar turno')
            }
            return res.data
        } finally {
            loading.value = false
        }
    }
})
</script>

<style scoped>
:deep(.dx-datagrid-export-button) {
    background-color: #10b981 !important;
    color: white !important;
    border-radius: 12px !important;
    border: none !important;
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2) !important;
    transition: all 0.2s ease !important;
    padding: 0px 12px !important;
    height: 42px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
}

.fade-loader-enter-active,
.fade-loader-leave-active {
    transition: opacity 0.3s ease;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
    opacity: 0;
}

.spinner-ring.outer {
    border-top-color: #3b82f6 !important;
    animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring.inner {
    border-bottom-color: #60a5fa !important;
    animation: spin-reverse 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes spin-reverse {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(-360deg);
    }
}
</style>