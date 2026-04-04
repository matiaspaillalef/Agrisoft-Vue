<template>
    <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <BriefcaseIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Contratistas</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de socios externos y contratistas para servicios agrícolas</p>
            </div>
        </div>
    </div>

    <!-- GRID CONTAINER -->
    <div
        class="custom-grid-container relative mt-[3px] flex w-full flex-grow flex-col items-center justify-start gap-2 rounded-3xl bg-white py-8 shadow-2xl px-2 md:px-10 mb-6 min-h-[500px] border border-gray-100 dark:bg-navy-800 dark:border-white/5">

        <!-- Header Actions Area -->
        <div class="flex w-full justify-between items-center mb-6 gap-4">
            <div class="flex-1 flex items-center">
                <h2 class="text-lg font-bold text-navy-700 dark:text-white hidden md:block">Listado de Contratistas</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="addNewRecord"
                    class="group relative overflow-hidden flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 text-sm font-semibold tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Contratista
                    <span
                        class="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full hover:translate-y-0 transition-transform duration-300"></span>
                </button>
            </div>
        </div>

        <DxDataGrid :ref="el => gridRef = el" :data-source="dataSource" :show-borders="false"
            v-model:selected-row-keys="selectedRowKeys" class="custom-grid overflow-hidden w-full"
            :column-auto-width="true" @exporting="onExporting" :load-panel="{ enabled: false }" :allow-column-reordering="true"
            :allow-column-resizing="true" key-expr="id">

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
            <DxSearchPanel :visible="true" placeholder="Buscar contratista..." />

            <DxColumn data-field="id" :visible="false" sort-order="desc" />
            <DxColumn data-field="rut" caption="RUT" alignment="left" />
            <DxColumn data-field="name" caption="Nombre" alignment="left" />
            <DxColumn data-field="lastname" caption="Apellido" alignment="left" />
            <DxColumn data-field="email" caption="Correo" alignment="left" />
            <DxColumn data-field="phone" caption="Teléfono" alignment="left" />
            <DxColumn data-field="giro" caption="Giro" alignment="left" :visible="false" />
            <DxColumn data-field="state" caption="Región" alignment="left">
                <DxLookup :data-source="chileanRegions" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="city" caption="Ciudad" alignment="left" />
            <DxColumn data-field="status" caption="Estado" alignment="center" cell-template="statusTemplate" />

            <template #statusTemplate="{ data }">
                <span :class="data.value === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">
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
                <DxPopup title="Configuración de Contratista" :show-title="true" :width="850" :height="700" />
                <DxForm :col-count="2">
                    <DxGroupItem caption="Información General" :col-span="2" :col-count="2">
                        <DxItem data-field="rut">
                            <DxRequiredRule message="El RUT es requerido" />
                        </DxItem>
                        <DxItem data-field="name" caption="Nombre">
                            <DxRequiredRule message="El nombre es requerido" />
                        </DxItem>
                        <DxItem data-field="lastname" caption="Apellido">
                            <DxRequiredRule message="El apellido es requerido" />
                        </DxItem>
                        <DxItem data-field="giro" />
                    </DxGroupItem>

                    <DxGroupItem caption="Contacto y Ubicación" :col-span="2" :col-count="2">
                        <DxItem data-field="email">
                            <DxEmailRule message="Email inválido" />
                        </DxItem>
                        <DxItem data-field="phone" caption="Teléfono" />
                        <DxItem data-field="state" editor-type="dxSelectBox"
                            :editor-options="{ items: chileanRegions, valueExpr: 'id', displayExpr: 'name', placeholder: 'Selecciona una región' }">
                            <DxLabel text="Región" />
                        </DxItem>
                        <DxItem data-field="city" caption="Ciudad" />
                        <DxItem data-field="address">
                            <DxLabel text="Dirección" />
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
            :hide-on-outside-click="true" :show-title="true" title="Ficha del Contratista" :width="700"
            :height="600">
            <div class="view-details-container p-6 overflow-y-auto h-full space-y-8 bg-gray-50/50 dark:bg-transparent">
                <!-- Header Info -->
                <div class="flex items-center gap-6 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div class="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-600/20">
                        {{ String(viewRecordData.name || 'C').charAt(0) }}
                    </div>
                    <div class="flex flex-col">
                        <h2 class="text-2xl font-black text-navy-700 dark:text-white">{{ viewRecordData.name }} {{ viewRecordData.lastname }}</h2>
                        <span class="text-sm text-gray-400 font-bold tracking-widest uppercase mt-1">RUT: {{ viewRecordData.rut }}</span>
                        <div class="mt-3">
                             <span :class="viewRecordData.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {{ viewRecordData.status === 1 ? 'Activo' : 'Inactivo' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Detalle Grid -->
                <div class="grid grid-cols-2 gap-8 px-2">
                    <div class="detail-section">
                        <h3 class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span class="w-8 h-[1px] bg-blue-600/30"></span> Identificación
                        </h3>
                        <div class="space-y-4">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Giro Comercial</span>
                                <span class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ viewRecordData.giro || 'No especificado' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3 class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span class="w-8 h-[1px] bg-blue-600/30"></span> Contacto
                        </h3>
                        <div class="space-y-4">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Email</span>
                                <span class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ viewRecordData.email || 'N/A' }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Teléfono</span>
                                <span class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ viewRecordData.phone || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section col-span-2">
                        <h3 class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span class="w-8 h-[1px] bg-blue-600/30"></span> Ubicación
                        </h3>
                        <div class="grid grid-cols-3 gap-4">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Región</span>
                                <span class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ resolveRegionName(viewRecordData.state) }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Ciudad</span>
                                <span class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ viewRecordData.city || 'N/A' }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Dirección</span>
                                <span class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ viewRecordData.address || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DxPopupWidget>

        <!-- Loading Overlay -->
        <LoadingOverlay :show="loading" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { BriefcaseIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import {
    DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxPaging, DxScrolling,
    DxColumnFixing, DxSearchPanel, DxHeaderFilter, DxExport, DxPager, DxToolbar, DxItem as DxToolbarItem,
    DxLookup, DxButton, DxFilterRow
} from 'devextreme-vue/data-grid'
import { DxPopup as DxPopupWidget } from 'devextreme-vue/popup'
import { DxItem, DxGroupItem, DxLabel, DxRequiredRule, DxEmailRule } from 'devextreme-vue/form'
import conexionApi from '@/services/conexionApi.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

const loading = ref(false)
const gridRef = ref(null)

const onExporting = (e) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Contractors');
    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Contratistas.xlsx');
        });
    });
};

const selectedRowKeys = ref([])
const hasData = ref(false)
const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const chileanRegions = [
    { id: "XV", name: "Arica y Parinacota" },
    { id: "I", name: "Tarapacá" },
    { id: "II", name: "Antofagasta" },
    { id: "III", name: "Atacama" },
    { id: "IV", name: "Coquimbo" },
    { id: "V", name: "Valparaíso" },
    { id: "RM", name: "Metropolitana de Santiago" },
    { id: "VI", name: "Libertador G.B. O'Higgins" },
    { id: "VII", name: "Maule" },
    { id: "XVI", name: "Ñuble" },
    { id: "VIII", name: "Biobío" },
    { id: "IX", name: "La Araucanía" },
    { id: "XIV", name: "Los Ríos" },
    { id: "X", name: "Los Lagos" },
    { id: "XI", name: "Aysén del G.C. Ibañez del Campo" },
    { id: "XII", name: "Magallanes y Antártica Chilena" }
]

// POPUP VIEW STATE
const isViewPopupVisible = ref(false)
const viewRecordData = ref({})

const viewRecord = (e) => {
    viewRecordData.value = { ...e.row.data };
    isViewPopupVisible.value = true;
}

const resolveRegionName = (id) => chileanRegions.find(r => r.id === id)?.name || id || 'N/A'

const addNewRecord = () => {
    gridRef.value.instance.addRow()
}

// CUSTOM STORE LOGIC (CONTRACTORS)
const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const response = await conexionApi.get(`/management-people/contractors/getContractors/${companyID}`)
            const data = response.data.contractors || response.data || []
            hasData.value = data.length > 0
            return data
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {
        loading.value = true
        try {
            // Siguiendo la estructura solicitada por el usuario
            const payload = {
                ...values,
                idCompany: companyID,
                status: values.status ?? 1
            }
            const res = await conexionApi.post('/management-people/contractors/createContractor', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al crear contratista')
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
            const payload = { ...row, ...values, id: key }
            const res = await conexionApi.post('/management-people/contractors/updateContractor', payload)
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al actualizar contratista')
            }
            return payload
        } finally {
            loading.value = false
        }
    },
    remove: async (key) => {
        loading.value = true
        try {
            const res = await conexionApi.post('/management-people/contractors/deleteContractor', { id: key })
            if (res.data && res.data.code === 'ERROR') {
                throw new Error(res.data.mensaje || 'Error al eliminar contratista')
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