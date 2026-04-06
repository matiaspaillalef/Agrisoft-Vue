<template>
    <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <UserGroupIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Cuadrillas</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de cuadrillas de trabajo y operarios</p>
            </div>
        </div>
    </div>

    <!-- GRID CONTAINER -->
    <div
        class="custom-grid-container relative mt-[3px] flex w-full flex-grow flex-col items-center justify-start gap-2 rounded-3xl bg-white py-8 shadow-2xl px-2 md:px-10 mb-6 min-h-[500px] border border-gray-100 dark:bg-navy-800 dark:border-white/5">
        <LoadingOverlay :show="loading" />

        <!-- Header Actions Area -->
        <div class="flex w-full justify-between items-center mb-6 gap-4">
            <div class="flex-1 flex items-center">
                <h2 class="text-lg font-bold text-navy-700 dark:text-white hidden md:block">Listado de Cuadrillas</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="addNewRecord"
                    class="group relative overflow-hidden flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 text-sm font-semibold tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Cuadrilla
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
            <DxSearchPanel :visible="true" placeholder="Buscar cuadrilla..." />

            <!-- Sorting by ID descending to show last added at the top -->
            <DxColumn data-field="id" sort-order="desc" alignment="right" css-class="!text-left" />
            <DxColumn data-field="name" caption="Nombre de Cuadrilla" alignment="right" css-class="!text-left" />
            <DxColumn data-field="group" caption="Grupo de Trabajo" alignment="right" css-class="!text-left">
                <DxLookup :data-source="groups" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="workers" caption="Integrantes" alignment="center" cell-template="workersTemplate" />
            <DxColumn data-field="status" caption="Estado" alignment="right" css-class="!text-left"
                cell-template="statusTemplate" />

            <template #workersTemplate="{ data }">
                <div class="flex items-center justify-center gap-1.5">
                    <div class="flex -space-x-2 overflow-hidden py-1" v-if="getWorkersCount(data.value) > 0">
                        <div v-for="n in Math.min(3, getWorkersCount(data.value))" :key="n"
                            class="inline-flex h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="size-3">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                    </div>
                    <span
                        class="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        {{ getWorkersCount(data.value) }}
                    </span>
                </div>
            </template>

            <template #statusTemplate="{ data }">
                <span :class="data.value === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                    {{ data.value === 1 ? 'Activo' : 'Inactivo' }}
                </span>
            </template>

            <DxColumn type="buttons" width="160">
                <DxButton icon="group" hint="Asignar trabajadores" @click="openAssignWorkersModal" />
                <DxButton icon="custom-view" hint="Ver detalle" @click="viewRecord" />
                <DxButton name="edit" />
                <DxButton name="delete" />
            </DxColumn>

            <DxEditing mode="popup" :allow-updating="true" :allow-deleting="true" :allow-adding="true"
                :use-icons="true">
                <DxPopup title="Configuración de Cuadrilla" :show-title="true" :width="500" :height="450" />
                <DxForm :col-count="1">
                    <DxGroupItem caption="Información de la Cuadrilla" :col-count="1">
                        <DxItem data-field="name">
                            <DxLabel text="Nombre" />
                            <DxRequiredRule message="El nombre es requerido" />
                        </DxItem>
                        <DxItem data-field="group" editor-type="dxSelectBox"
                            :editor-options="{ items: groups, valueExpr: 'id', displayExpr: 'name', searchEnabled: true }">
                            <DxLabel text="Grupo de Trabajo" />
                            <DxRequiredRule message="El grupo es requerido" />
                        </DxItem>
                        <DxItem data-field="status" editor-type="dxSelectBox"
                            :editor-options="{ items: [{ id: 1, name: 'Activo' }, { id: 0, name: 'Inactivo' }], valueExpr: 'id', displayExpr: 'name' }">
                            <DxLabel text="Estado" />
                        </DxItem>
                    </DxGroupItem>
                </DxForm>
            </DxEditing>
        </DxDataGrid>

        <!-- View Popup -->
        <DxPopupWidget :visible="isViewPopupVisible" @hiding="isViewPopupVisible = false" :drag-enabled="false"
            :hide-on-outside-click="true" :show-title="true" title="Ficha de Cuadrilla" :width="500" :height="400">
            <div class="view-details-container p-6 overflow-y-auto h-full space-y-8 bg-gray-50/50 dark:bg-transparent">
                <!-- Header Info -->
                <div
                    class="flex items-center gap-6 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div
                        class="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-600/20">
                        {{ String(viewRecordData.name || 'C').charAt(0) }}
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

                <!-- Detalle Grid -->
                <div class="px-2">
                    <div class="detail-section">
                        <h3
                            class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span class="w-8 h-[1px] bg-blue-600/30"></span> Grupo de Trabajo
                        </h3>
                        <div
                            class="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                Esta cuadrilla pertenece al grupo: <span
                                    class="text-blue-600 underline font-bold">{{ getGroupName(viewRecordData.group) }}</span>
                            </p>
                            <p class="text-xs text-gray-400 mt-2">
                                Identificada como <span class="font-bold">{{ viewRecordData.name }}</span>, forma parte
                                de los
                                equipos operativos desplegados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DxPopupWidget>

        <!-- ASSIGN WORKERS POPUP -->
        <DxPopupWidget :visible="isWorkersModalVisible" @hiding="isWorkersModalVisible = false" :drag-enabled="false"
            :hide-on-outside-click="true" :show-title="false" :width="800" :height="700" class="assign-workers-popup">
            <div class="p-0 h-full flex flex-col bg-white overflow-hidden rounded-[32px]">
                <!-- Header Section -->
                <div class="p-8 pb-4 bg-white sticky top-0 z-10 space-y-6">
                    <!-- Title & Close -->
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-xl font-light text-navy-800 tracking-tight leading-none mb-2">
                                Asignar trabajadores a
                            </h2>
                            <span
                                class="text-3xl font-black text-navy-900 tracking-tighter block truncate max-w-[500px]">
                                {{ selectedSquad?.name }}
                            </span>
                        </div>
                        <button @click="isWorkersModalVisible = false"
                            class="p-2 hover:bg-red-50 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-100 flex items-center justify-center w-fit!">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Actions Layer -->
                    <div class="space-y-4">
                        <!-- Top Row: Filter (Left) & Button (Right) -->
                        <div class="flex items-center justify-between gap-4">
                            <!-- Filter Toggle -->
                            <label
                                class="flex items-center gap-3 px-5 py-3.5 bg-gray-50 rounded-lg border border-gray-100/50 hover:bg-gray-100 cursor-pointer transition-all active:scale-95 group">
                                <div class="relative flex items-center">
                                    <input type="checkbox" v-model="showOnlyAssigned" class="peer sr-only">
                                    <div
                                        class="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-300 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-3.5 w-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-300"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <span
                                    class="text-[11px] font-black text-navy-700 uppercase tracking-widest select-none">Ver
                                    asignados</span>
                            </label>

                            <!-- Save Button: w-fit -->
                            <button @click="saveAssignedWorkers"
                                class="flex items-center gap-3 px-10! py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 font-bold text-sm tracking-tight active:scale-95 group shrink-0 w-fit! h-[50px] ">
                                <span>Asignar trabajadores</span>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                        d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>

                        <!-- Bottom Row: Search Box (Full Width) -->
                        <div class="relative group">
                            <input type="text" v-model="workerSearchText"
                                placeholder="Escribe el nombre o RUT para filtrar rápidamente..."
                                class="w-full pl-12 pr-4 pl-10! py-6 my-0! h-[50px] bg-gray-50 border border-gray-100/50 rounded-lg text-sm font-normal focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:bg-white transition-all duration-300 placeholder:text-gray-400 shadow-sm group-hover:shadow-md group-hover:border-blue-200/50">
                            <div
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table Header Labels -->
                <div class="grid grid-cols-[80px_1fr_1fr] px-8 py-4 bg-gray-50/50 border-b border-gray-50">
                    <span
                        class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Sel.</span>
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nombre del
                        Trabajador</span>
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RUT
                        Identificación</span>
                </div>

                <!-- Scrollable List Content -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
                    <div class="space-y-1 pt-4">
                        <div v-for="worker in filteredWorkers" :key="worker.id"
                            @click="toggleWorkerSelection(worker.id)"
                            class="grid grid-cols-[80px_1fr_1fr] px-4 py-4 items-center rounded-2xl transition-all duration-200 cursor-pointer group"
                            :class="isWorkerSelected(worker.id) ? 'bg-blue-50/70' : 'hover:bg-gray-50'">

                            <!-- Custom Checkbox Container -->
                            <div class="flex justify-center" @click.stop>
                                <label class="relative flex items-center cursor-pointer">
                                    <input type="checkbox" :checked="isWorkerSelected(worker.id)"
                                        @change="toggleWorkerSelection(worker.id)" class="peer sr-only">
                                    <div
                                        class="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-300 flex items-center justify-center group-hover:border-blue-300">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            class="h-4 w-4 text-white scale-0 peer-checked:scale-100 transition-transform duration-300"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </label>
                            </div>

                            <!-- Name Column -->
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-blue-600 shadow-sm border border-gray-100 group-hover:border-blue-100 transition-colors">
                                    {{ worker.name.charAt(0) }}
                                </div>
                                <span class="text-[14px] font-bold text-navy-800 truncate"
                                    :class="{ 'text-blue-700': isWorkerSelected(worker.id) }">
                                    {{ worker.name }} {{ worker.lastname }}
                                </span>
                            </div>

                            <!-- RUT Column -->
                            <span class="text-[13px] font-medium text-gray-500 tabular-nums">
                                {{ worker.rut }}
                            </span>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="filteredWorkers.length === 0"
                        class="flex flex-col items-center justify-center py-24 text-gray-300">
                        <div class="w-24 h-24 mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-20" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p class="text-sm font-black uppercase tracking-[0.2em]">Sin resultados encontrados</p>
                    </div>
                </div>
            </div>
        </DxPopupWidget>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { UserGroupIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import {
    DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxPaging, DxScrolling,
    DxColumnFixing, DxSearchPanel, DxHeaderFilter, DxExport, DxPager, DxToolbar, DxItem as DxToolbarItem,
    DxButton, DxFilterRow, DxLookup
} from 'devextreme-vue/data-grid'
import { DxPopup as DxPopupWidget } from 'devextreme-vue/popup'
import { DxItem, DxGroupItem, DxLabel, DxRequiredRule } from 'devextreme-vue/form'
import conexionApi from '@/services/conexionApi.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

const loading = ref(false)
const gridRef = ref(null)
const groups = ref([])
const allWorkers = ref([])

const onExporting = (e) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Squads');
    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Cuadrillas.xlsx');
        });
    });
};

const selectedRowKeys = ref([])
const hasData = ref(false)
const companyID = Number(localStorage.getItem('userIdCompany')) || 0

// POPUP VIEW STATE
const isViewPopupVisible = ref(false)
const viewRecordData = ref({})

// ASSIGN WORKERS STATE
const isWorkersModalVisible = ref(false)
const selectedSquad = ref(null)
const workerSearchText = ref('')
const showOnlyAssigned = ref(false)
const tempSelectedWorkerIds = ref([])

const viewRecord = (e) => {
    viewRecordData.value = { ...e.row.data };
    isViewPopupVisible.value = true;
}

const addNewRecord = () => {
    gridRef.value.instance.addRow()
}

const fetchGroups = async () => {
    try {
        const response = await conexionApi.get(`/management-people/groups/getGroups/${companyID}`)
        groups.value = response.data.groups || []
    } catch (error) {
        console.error('Error fetching groups:', error)
    }
}

const fetchWorkers = async () => {
    try {
        const response = await conexionApi.get(`/management-people/workers/getWorkers/${companyID}`)
        allWorkers.value = response.data.workers || []
    } catch (error) {
        console.error('Error fetching workers:', error)
    }
}

const getGroupName = (groupId) => {
    const group = groups.value.find(g => g.id === groupId)
    return group ? group.name : 'Sin Grupo'
}

const getWorkersCount = (workers) => {
    if (!workers) return 0
    try {
        const arr = typeof workers === 'string' ? JSON.parse(workers) : workers
        return Array.isArray(arr) ? arr.length : 0
    } catch (e) {
        return 0
    }
}

// ASSIGN WORKERS LOGIC
const openAssignWorkersModal = (e) => {
    selectedSquad.value = { ...e.row.data }
    const workers = selectedSquad.value.workers
    try {
        tempSelectedWorkerIds.value = typeof workers === 'string' ? JSON.parse(workers) : (Array.isArray(workers) ? workers : [])
    } catch (err) {
        tempSelectedWorkerIds.value = []
    }
    workerSearchText.value = ''
    showOnlyAssigned.value = false
    isWorkersModalVisible.value = true
}

const filteredWorkers = computed(() => {
    return allWorkers.value.filter(worker => {
        const fullName = `${worker.name} ${worker.lastname}`.toLowerCase()
        const matchSearch = fullName.includes(workerSearchText.value.toLowerCase()) || worker.rut.includes(workerSearchText.value)
        const matchAssigned = showOnlyAssigned.value ? tempSelectedWorkerIds.value.includes(worker.id) : true
        return matchSearch && matchAssigned
    })
})

const isWorkerSelected = (id) => tempSelectedWorkerIds.value.includes(id)

const toggleWorkerSelection = (id) => {
    const index = tempSelectedWorkerIds.value.indexOf(id)
    if (index === -1) {
        tempSelectedWorkerIds.value.push(id)
    } else {
        tempSelectedWorkerIds.value.splice(index, 1)
    }
}

const saveAssignedWorkers = async () => {
    loading.value = true
    try {
        const payload = {
            id: selectedSquad.value.id,
            name: selectedSquad.value.name,
            group: selectedSquad.value.group,
            status: selectedSquad.value.status,
            workers: tempSelectedWorkerIds.value,
            company_id: companyID
        }
        const res = await conexionApi.post('/management-people/squads/updateSquad', payload)
        if (res.data && res.data.code === 'OK') {
            isWorkersModalVisible.value = false
            gridRef.value.instance.refresh()
        } else {
            throw new Error(res.data.mensaje || 'Error al asignar trabajadores')
        }
    } catch (err) {
        console.error(err)
        alert(err.message)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchGroups()
    fetchWorkers()
})

// CUSTOM STORE LOGIC (SQUADS)
const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const response = await conexionApi.get(`/management-people/squads/getSquads/${companyID}`)
            const data = response.data.squads || []
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
                group: values.group,
                status: values.status ?? 1,
                idCompany: companyID
            }
            const res = await conexionApi.post('/management-people/squads/createSquad', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al crear cuadrilla')
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
                group: values.group !== undefined ? values.group : row.group,
                status: values.status !== undefined ? values.status : row.status,
                workers: row.workers ? (typeof row.workers === 'string' ? JSON.parse(row.workers) : row.workers) : [],
                company_id: companyID
            }
            const res = await conexionApi.post('/management-people/squads/updateSquad', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al actualizar cuadrilla')
            }
            return payload
        } finally {
            loading.value = false
        }
    },
    remove: async (key) => {
        loading.value = true
        try {
            const res = await conexionApi.post('/management-people/squads/deleteSquad', { id: key })
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al eliminar cuadrilla')
            }
            return res.data
        } finally {
            loading.value = false
        }
    }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

:deep(.assign-workers-popup .dx-popup-content) {
    padding: 0 !important;
    border-radius: 24px !important;
    overflow: hidden !important;
}
</style>