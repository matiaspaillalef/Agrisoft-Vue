<template>
    <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <IdentificationIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Cargos</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de cargos y funciones del personal</p>
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
                <h2 class="text-lg font-bold text-navy-700 dark:text-white hidden md:block">Listado de Cargos</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="addNewRecord"
                    class="group relative overflow-hidden flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 text-sm font-semibold tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Cargo
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
            <DxSearchPanel :visible="true" placeholder="Buscar cargo..." />

            <!-- Sorting by ID descending to show last added at the top -->
            <DxColumn data-field="id" :visible="false" sort-order="desc" />
            <DxColumn data-field="name" caption="Nombre del Cargo" alignment="right" css-class="!text-left" />
            <DxColumn data-field="status" caption="Estado" alignment="right" css-class="!text-left"
                cell-template="statusTemplate" />

            <template #statusTemplate="{ data }">
                <span :class="data.value === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
                    {{ data.value === 1 ? 'Activo' : 'Inactivo' }}
                </span>
            </template>

            <DxColumn type="buttons" width="120">
                <DxButton icon="eye" hint="Ver detalle" @click="viewRecord" />
                <DxButton name="edit" />
                <DxButton name="delete" />
            </DxColumn>

            <DxEditing mode="popup" :allow-updating="true" :allow-deleting="true" :allow-adding="true"
                :use-icons="true">
                <DxPopup title="Configuración de Cargo" :show-title="true" :width="500" :height="400" />
                <DxForm :col-count="1">
                    <DxGroupItem caption="Información del Cargo" :col-count="1">
                        <DxItem data-field="name">
                            <DxLabel text="Nombre del Cargo" />
                            <DxRequiredRule message="El nombre es requerido" />
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
            :hide-on-outside-click="true" :show-title="true" title="Ficha del Cargo" :width="500" :height="400">
            <div class="view-details-container p-6 overflow-y-auto h-full space-y-8 bg-gray-50/50 dark:bg-transparent">
                <!-- Header Info -->
                <div
                    class="flex items-center gap-6 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div
                        class="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-600/20">
                        {{ String(viewRecordData.name || 'P').charAt(0) }}
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
                            class="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span class="w-8 h-[1px] bg-indigo-600/30"></span> Resumen de Función
                        </h3>
                        <div
                            class="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                Este cargo corresponde a la categoría de <span
                                    class="font-bold text-indigo-600">{{ viewRecordData.name }}</span> dentro de la
                                estructura
                                organizacional de la compañía.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DxPopupWidget>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { IdentificationIcon } from '@heroicons/vue/24/solid'
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
    const worksheet = workbook.addWorksheet('Positions');
    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Cargos.xlsx');
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

// CUSTOM STORE LOGIC (POSITIONS)
const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const response = await conexionApi.get(`/management-people/positions/getPositions/${companyID}`)
            const data = response.data.positions || []
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
                status: values.status ?? 1,
                company_id: companyID
            }
            const res = await conexionApi.post('/management-people/positions/createPosition', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al crear cargo')
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
                status: values.status !== undefined ? values.status : row.status
            }
            const res = await conexionApi.post('/management-people/positions/updatePosition', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al actualizar cargo')
            }
            return payload
        } finally {
            loading.value = false
        }
    },
    remove: async (key) => {
        loading.value = true
        try {
            const res = await conexionApi.post('/management-people/positions/deletePosition', { id: key })
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al eliminar cargo')
            }
            return res.data
        } finally {
            loading.value = false
        }
    }
})
</script>

<style scoped>
</style>