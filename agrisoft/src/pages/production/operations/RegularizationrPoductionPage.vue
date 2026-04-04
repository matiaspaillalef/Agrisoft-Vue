<template>
    <div class="mb-6 flex justify-between items-center w-full">
        <div class="flex flex-col">
            <h1 class="text-2xl font-light text-navy-700 dark:text-white">Regularización de Producción</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Revisión y ajuste masivo de registros productivos
            </p>
        </div>
    </div>

    <div class="w-full mb-3">
        <!-- Filtros dinámicos Rediseñados -->
        <div
            class="bg-white dark:bg-navy-800 p-8 rounded-3xl shadow-xl mb-8 border border-gray-100 dark:border-white/5">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="(field, key) in filterFields" :key="key"
                    class="group flex flex-col gap-3 p-0 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-navy-900/40">
                    <div class="flex items-center justify-between pointer-events-none">
                        <label :for="'check-' + key"
                            class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 pointer-events-auto cursor-pointer select-none flex-1">
                            <input type="checkbox" :id="'check-' + key" v-model="field.enabled"
                                class="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer basis-[16px] m-0!" />
                            <span class="flex-1 text-left">{{ field.label }}</span>
                        </label>
                        <span v-if="field.enabled" class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    </div>

                    <div
                        class="relative group-hover:transform group-hover:translate-y-[-2px] transition-all duration-300">
                        <template v-if="field.type === 'date'">
                            <input type="date" v-model="field.value" :disabled="!field.enabled"
                                class="h-12 w-full rounded-1.5xl! border bg-gray-50/50 p-4 text-sm outline-none border-gray-200 dark:bg-navy-900 dark:border-white/10 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm m-0! rounded-[8px]" />
                        </template>
                        <template v-else>
                            <select v-model="field.value" :disabled="!field.enabled"
                                class="h-12 w-full rounded-1.5xl! border bg-gray-50/50 p-4 text-sm outline-none border-gray-200 dark:bg-navy-900 dark:border-white/10 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm appearance-none m-0! leading-none rounded-[8px]">
                                <option value="">Seleccione una opción</option>
                                <option v-for="opt in options[key]" :key="opt.id" :value="opt.id">
                                    {{ opt.name || opt.rut || opt.worker || opt.species_name }}
                                </option>
                            </select>
                            <div v-if="field.type !== 'date'"
                                class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <div class="mt-6 flex justify-start">
                <button @click="applyFilters"
                    class="group relative overflow-hidden px-10! py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 font-normal text-sm tracking-wide flex items-center gap-2 w-fit!">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:rotate-12"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtrar Resultados
                    <span
                        class="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full hover:translate-y-0 transition-transform duration-300"></span>
                </button>
            </div>
        </div>

        <!-- Acciones Masivas -->
        <div v-if="hasSelection"
            class="bg-blue-50 dark:bg-navy-900/50 p-6 rounded-2xl border border-blue-100 dark:border-white/10 mb-6 transition-all duration-500 animate-in fade-in slide-in-from-top-4 shadow-sm">
            <h3 class="text-sm font-bold text-blue-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                Acciones para {{ selectedRowKeys.length }} registros seleccionados
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Actualización Masiva</label>
                    <div class="flex flex-col gap-3">
                        <select v-model="bulkUpdateData.quality"
                            class="h-10 rounded-xl border bg-white dark:bg-navy-800 text-sm p-2 outline-none border-gray-200 dark:border-white/10">
                            <option value="">Cambiar Calidad...</option>
                            <option v-for="q in options.quality" :key="q.id" :value="q.id">{{ q.name }}</option>
                        </select>
                        <button @click="handleBulkUpdate"
                            class="w-full h-10 bg-navy-700 text-white rounded-xl hover:bg-navy-800 text-sm font-medium transition-all">
                            Aplicar Cambios
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Zona de Peligro</label>
                    <button @click="handleBulkDelete"
                        class="w-full h-10 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-medium transition-all flex items-center justify-center gap-2">
                        Eliminar seleccionados
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- GRID CONTAINER -->
    <div class="custom-grid-container relative mt-[3px] flex w-full flex-grow flex-col items-center justify-around gap-2 rounded-2xl bg-white py-6 shadow-xl px-2 md:px-10 mb-6 min-h-[400px]">
        <DxDataGrid :ref="el => gridRef = el" :data-source="dataSource" :show-borders="true"
            v-model:selected-row-keys="selectedRowKeys" class="custom-grid overflow-hidden w-full" :column-auto-width="true"
            @exporting="onExporting"
            @editor-preparing="onEditorPreparing"
            :load-panel="{ enabled: false }"
            :allow-column-reordering="true" :allow-column-resizing="true" key-expr="id">
            
            <DxExport :enabled="true" :allow-export-selected-data="true" />

            <DxToolbar>
                <DxToolbarItem name="exportButton" location="after" :visible="hasData" />
                <DxToolbarItem name="searchPanel" location="after" />
            </DxToolbar>

            <DxFilterRow :visible="true" />
            <DxHeaderFilter :visible="true" :allow-search="true" />
            <DxScrolling mode="standard" column-rendering-mode="virtual" />
            <DxPaging :enabled="true" :page-size="15" />
            <DxPager :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50]" :show-info="true" />
            <DxSelection mode="multiple" show-check-boxes-mode="always" width="40" />
            <DxColumnFixing :enabled="true" />
            <DxSearchPanel :visible="true" placeholder="Buscar registros..." />

            <DxColumn data-field="harvest_date" caption="Fecha" data-type="date" format="dd-MM-yyyy" />
            <DxColumn data-field="harvest_time" caption="Hora" alignment="center" />

            <DxColumn data-field="ground" caption="Campo" alignment="right" css-class="!text-left">
                <DxLookup :data-source="groundsList" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="worker" caption="Trabajador" alignment="right" css-class="!text-left" :set-cell-value="setWorkerValue">
                <DxLookup :data-source="workersList" value-expr="id" :display-expr="getWorkerName" />
            </DxColumn>
            <DxColumn data-field="worker_rut" caption="RUT" alignment="right" css-class="!text-left" :set-cell-value="setWorkerRutValue">
                <DxLookup :data-source="workersList" value-expr="id" display-expr="rut" />
            </DxColumn>
            <DxColumn data-field="specie" caption="Especie" alignment="right" css-class="!text-left" :set-cell-value="setSpecieValue">
                <DxLookup :data-source="speciesList" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="variety" caption="Variedad" alignment="right" css-class="!text-left">
                <DxLookup :data-source="varietiesList" value-expr="id" display-expr="name" />
            </DxColumn>

            <DxColumn data-field="kg_boxes" caption="Kg Cajas" data-type="number" alignment="right" css-class="!text-left" />
            <DxColumn data-field="boxes" caption="Cajas" data-type="number" alignment="right" css-class="!text-left" />

            <DxColumn type="buttons" width="60" :buttons="['edit', 'delete']" />

            <DxEditing mode="popup" :allow-updating="true" :allow-deleting="true" :use-icons="true">
                <DxPopup title="Editar Registro de Cosecha" :show-title="true" :width="700" :height="500" />
                <DxForm>
                    <DxItem data-field="harvest_date" :is-required="true" />
                    <DxItem data-field="harvest_time" caption="Hora" :is-required="true" />
                    <DxItem data-field="ground" caption="Campo" :is-required="true" />
                    <DxItem data-field="worker" caption="Trabajador" :is-required="true" />
                    <DxItem data-field="worker_rut" caption="RUT" :is-required="true" />
                    <DxItem data-field="specie" caption="Especie" :is-required="true" />
                    <DxItem data-field="variety" caption="Variedad" :is-required="true" />
                    <DxItem data-field="kg_boxes" :is-required="true" />
                    <DxItem data-field="boxes" :is-required="true" />
                </DxForm>
            </DxEditing>
        </DxDataGrid>

        <!-- Standalone Custom Loader (Manual Overlay for absolute reliability) -->
        <Transition name="fade-loader">
            <div v-if="loading" class="absolute inset-0 z-[2000] flex items-center justify-center bg-white/20 dark:bg-navy-900/10 backdrop-blur-[2px] rounded-3xl overflow-hidden">
                <div class="custom-loader-wrapper p-10 bg-white/95 dark:bg-navy-800/95 backdrop-blur-2xl rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.2)] border border-white/20 flex flex-col items-center justify-center min-w-[240px]">
                    <div class="custom-spinner-box relative w-20 h-20 flex items-center justify-center">
                        <div class="spinner-ring outer absolute inset-0 border-[4px] border-transparent border-t-blue-500 rounded-full"></div>
                        <div class="spinner-ring inner absolute inset-[6px] border-[4px] border-transparent border-b-blue-400 rounded-full opacity-60"></div>
                        <div class="spinner-logo bg-gradient-to-br from-blue-600 to-blue-400 p-2.5 rounded-xl rotate-12 animate-pulse shadow-lg ring-4 ring-blue-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <div class="spinner-text-group mt-6 flex flex-col items-center">
                        <span class="spinner-main-text font-bold text-navy-700 dark:text-white text-xl tracking-tight leading-none">Procesando</span>
                        <span class="spinner-sub-text text-blue-500 text-[11px] font-black uppercase tracking-[0.4em] mt-2.5 animate-pulse leading-none">Agrisoft</span>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, shallowRef } from 'vue'
import CustomStore from 'devextreme/data/custom_store'
import {
    DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxItem, DxPaging, DxScrolling,
    DxColumnFixing, DxSearchPanel, DxHeaderFilter, DxSelection, DxExport, DxPager, DxToolbar, DxItem as DxToolbarItem,
    DxLookup
} from 'devextreme-vue/data-grid'
import DxLoadPanel from 'devextreme-vue/load-panel'
import conexionApi from '@/services/conexionApi.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

const loading = ref(false)
const gridRef = ref(null)

const onExporting = (e) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Produccion');

    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Regularizacion_Produccion.xlsx');
        });
    });
};
const selectedRowKeys = ref([])
const hasSelection = computed(() => selectedRowKeys.value.length > 0)
const hasData = ref(false)
const currentData = ref([])

const getWorkerName = (item) => {
    if (!item) return "";
    return `${item.name || ''} ${item.lastname || ''}`.trim();
}

const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow' && e.dataField === 'variety') {
        const specieId = e.row.data.specie;
        e.editorOptions.dataSource = {
            store: varietiesList.value,
            filter: specieId ? ['species_id', '=', Number(specieId)] : null
        };
    }
}

const setSpecieValue = (newData, value) => {
    newData.specie = value;
    newData.variety = null;
}

const setWorkerValue = (newData, value) => {
    newData.worker = value;
    const worker = workersList.value.find(w => Number(w.id) === Number(value));
    if (worker) {
        newData.worker_rut = worker.id; // Syncing IDs
    }
}

const setWorkerRutValue = (newData, value) => {
    newData.worker = value;
     newData.worker_rut = value; // Syncing IDs
}

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

// Referencias individuales para mejor reactividad en Lookups
const groundsList = ref([])
const sectorsList = ref([])
const qualitiesList = ref([])
const workersList = ref([])
const varietiesList = ref([])
const speciesList = ref([])

// DataSources calculados para DxLookup
const groundsDS = computed(() => ({ store: groundsList.value }))
const workersDS = computed(() => ({ store: workersList.value }))
const qualitiesDS = computed(() => ({ store: qualitiesList.value }))
const varietiesDS = computed(() => ({ store: varietiesList.value }))
const speciesDS = computed(() => ({ store: speciesList.value }))

// Opciones para los filtros (agrupadas para el v-for de filtros)
const options = computed(() => ({
    ground: groundsList.value,
    sector: sectorsList.value,
    worker_rut: workersList.value,
    quality: qualitiesList.value,
    variety: varietiesList.value,
    specie: speciesList.value,
    batch: Array.from({ length: 50 }, (_, i) => i + 1).map(b => ({ id: b, name: b.toString() }))
}))

// Definición de campos de filtro
const filterFields = ref({
    ground: { label: 'Campo', enabled: false, value: '', type: 'select' },
    sector: { label: 'Sector', enabled: false, value: '', type: 'select' },
    worker_rut: { label: 'RUT Cosechero', enabled: false, value: '', type: 'select' },
    quality: { label: 'Calidad', enabled: false, value: '', type: 'select' },
    variety: { label: 'Variedad', enabled: false, value: '', type: 'select' },
    harvest_date: { label: 'Fecha Cosecha', enabled: false, value: '', type: 'date' }
})

const bulkUpdateData = ref({
    quality: ''
})

onMounted(async () => {
    try {
        const [grounds, sectors, qualities, workers, varieties, species] = await Promise.all([
            conexionApi.get(`/configuracion/production/getGround/${companyID}`),
            conexionApi.get(`/configuracion/production/getSectorsBarracks/${companyID}`),
            conexionApi.get(`/configuracion/production/getQuality/${companyID}`),
            conexionApi.get(`/management-people/workers/getWorkers/${companyID}`),
            conexionApi.get(`/configuracion/production/getVarieties/${companyID}`),
            conexionApi.get(`/configuracion/production/getSpecies/${companyID}`)
        ])

        groundsList.value = grounds.data.grounds || []
        sectorsList.value = sectors.data.sectors || []
        qualitiesList.value = qualities.data.qualities || []
        workersList.value = Array.isArray(workers.data.workers) ? workers.data.workers : (workers.data.workers || [])
        varietiesList.value = varieties.data.varieties || []
        speciesList.value = species.data.species || []

    } catch (e) {
        console.error('Error cargando opciones de filtro', e)
    }
})

const applyFilters = () => {
    const activeFilters = Object.keys(filterFields.value).reduce((acc, key) => {
        if (filterFields.value[key].enabled && filterFields.value[key].value) {
            acc[key] = filterFields.value[key].value
        }
        return acc;
    }, {})



    gridRef.value.instance.refresh()
}

const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        const activeFilters = Object.keys(filterFields.value).reduce((acc, key) => {
            if (filterFields.value[key].enabled && filterFields.value[key].value) {
                acc[key] = filterFields.value[key].value
            }
            return acc;
        }, {})

        try {
            let results = []
            if (Object.keys(activeFilters).length > 0) {
                const response = await conexionApi.post(`/configuracion/production/filterRegularizationResults/${companyID}`, activeFilters)
                results = response.data.results || []
            } else {
                const response = await conexionApi.get(`/configuracion/production/getRegularizationProduction/${companyID}`)
                results = Array.isArray(response.data) ? response.data : (response.data?.data || [])
            }

            // El mapeo se maneja ahora vía Lookups en el grid para permitir edición fluida
            const mappedData = results.map(item => ({
                ...item,
                worker_rut: item.worker // Aseguramos que el campo RUT tenga el ID para el lookup
            }))

            currentData.value = mappedData
            hasData.value = mappedData.length > 0
            return mappedData
        } finally {
            loading.value = false
        }
    },
    update: async (key, values) => {
        // Para edición individual, podemos usar el endpoint genérico o adaptarlo
        const currentData = gridRef.value.instance.getVisibleRows().find(r => r.key === key)?.data || {}
        const payload = { ...currentData, ...values, id: key, company_id: companyID, source: 1 }
        await conexionApi.post('/configuracion/production/updateRegularizationProduction', payload)
        return payload
    },
    remove: async (key) => {
        await conexionApi.post('/configuracion/production/deleteRegularizationProduction', { id: key })
    }
})

const handleBulkUpdate = async () => {
    if (!bulkUpdateData.value.quality) return
    loading.value = true

    const activeFilters = Object.keys(filterFields.value).reduce((acc, key) => {
        if (filterFields.value[key].enabled && filterFields.value[key].value) {
            acc[key] = filterFields.value[key].value
        }
        return acc;
    }, {})

    try {
        // Estructura requerida por router.post('/configuracion/production/updateRegularizationResults/:companyID')
        await conexionApi.post(`/configuracion/production/updateRegularizationResults/${companyID}`, {
            filtrosIds: activeFilters,
            updates: {
                quality: bulkUpdateData.value.quality,
                ids: selectedRowKeys.value
            }
        })
        selectedRowKeys.value = []
        gridRef.value.instance.refresh()
    } finally {
        loading.value = false
    }
}

const handleBulkDelete = async () => {
    if (!confirm('¿Está seguro de eliminar los registros seleccionados?')) return
    loading.value = true

    const activeFilters = Object.keys(filterFields.value).reduce((acc, key) => {
        if (filterFields.value[key].enabled && filterFields.value[key].value) {
            acc[key] = filterFields.value[key].value
        }
        return acc;
    }, {})

    try {
        await conexionApi.post(`/configuracion/production/deleteRegularizationResults/${companyID}`, {
            filtrosIds: activeFilters,
            deletes: {
                ids: selectedRowKeys.value
            }
        })
        selectedRowKeys.value = []
        gridRef.value.instance.refresh()
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
:deep(.dx-datagrid-export-button) {
    background-color: #10b981 !important; /* emerald-500 */
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

:deep(.dx-datagrid-export-button .dx-button-content) {
    background-color: transparent !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

:deep(.dx-datagrid-export-button .dx-icon) {
    color: white !important;
    font-size: 20px !important;
    margin: 0 !important;
}

:deep(.dx-datagrid-export-button .dx-button-text) {
    color: white !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    text-transform: none !important;
}

:deep(.dx-datagrid-export-button:hover) {
    background-color: #059669 !important; /* emerald-600 */
    transform: translateY(-1px) !important;
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3) !important;
}

:deep(.dx-datagrid-export-button.dx-state-focused) {
    background-color: #047857 !important;
}

/* fade transition for the loader */
.fade-loader-enter-active,
.fade-loader-leave-active {
    transition: opacity 0.3s ease;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
    opacity: 0;
}

/* Standalone Custom Loader Styles */
.custom-loader-wrapper {
    z-index: 2147483647 !important;
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
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1) rotate(12deg); }
    50% { opacity: 0.7; transform: scale(0.95) rotate(12deg); }
}
</style>