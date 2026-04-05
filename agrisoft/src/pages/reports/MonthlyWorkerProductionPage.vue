<template>
    <div class="reports-page px-0 pb-12">
        <!-- Title Section -->
        <div
            class="mb-8 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-500 hover:shadow-md animate-fade-in mx-4 md:mx-0">
            <div class="flex items-center gap-6">
                <div class="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                    <CalendarDaysIcon class="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">Producción Mensual por Cosechero</h1>
                    <p class="text-slate-500 font-medium font-inter">Seguimiento de rendimiento agrupado por mes y año
                    </p>
                </div>
            </div>

            <!-- Total Kilos Stats -->
            <div v-if="reportData.length > 0"
                class="hidden lg:flex gap-10 items-center border-l border-slate-100 pl-10">
                <div class="text-right">
                    <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Registros</p>
                    <p class="text-3xl font-black text-slate-800">{{ reportData.length }}</p>
                </div>
                <div class="h-12 w-px bg-slate-100"></div>
                <div class="text-right">
                    <p class="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Total Kilos</p>
                    <p class="text-3xl font-black text-blue-600">
                        {{ totalKilos.toLocaleString('es-CL', { minimumFractionDigits: 2 }) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Filters Panel -->
        <div
            class="mx-4 md:mx-0 mb-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-50 relative overflow-hidden">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <AdjustmentsHorizontalIcon class="w-6 h-6 text-indigo-600" />
                    <h2 class="text-xl font-black text-slate-800 uppercase tracking-tight">Panel de Filtros</h2>
                </div>
                <button @click="showFilters = !showFilters"
                    class="px-6 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 w-fit! hidden">
                    {{ showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
                </button>
            </div>

            <div v-show="showFilters" class="space-y-8 animate-fade-in">
                <!-- Basic Month/Year Selectors -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar
                            mes</label>
                        <DxSelectBox v-model:value="filters.month" :items="monthOptions" display-expr="name"
                            value-expr="id" placeholder="Seleccione un mes..." class="custom-selectbox-reports" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar
                            año</label>
                        <DxSelectBox v-model:value="filters.year" :items="yearOptions"
                            placeholder="Seleccione un año..." class="custom-selectbox-reports" />
                    </div>
                    <div
                        class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 self-end h-[55px] hidden">
                        <span class="text-xs font-black text-indigo-600 uppercase tracking-widest">Filtrar por
                            totales</span>
                        <DxCheckBox v-model:value="filters.totals" :on-value="1" :off-value="0" />
                    </div>
                </div>

                <!-- Dimension Filters -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                    <div v-for="(field, key) in filterFields" :key="key" class="flex flex-col gap-3">
                        <div class="flex items-center gap-2 mb-1">
                            <DxCheckBox v-model:value="field.checked" class="scale-90" />
                            <span
                                class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ field.label }}</span>
                        </div>

                        <DxSelectBox :items="options[key]" :display-expr="key === 'worker' ? 'fullName' : 'name'"
                            value-expr="id" v-model:value="filters[key]" :disabled="!field.checked"
                            :search-enabled="true" placeholder="Elija una opción..." class="custom-selectbox-reports"
                            :show-clear-button="true" />
                    </div>
                </div>

                <div class="flex items-center justify-end pt-4">
                    <button @click="handleFilterResults" :disabled="loading"
                        class="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 w-fit!">
                        <MagnifyingGlassIcon class="w-5 h-5 text-white stroke-[3px]" />
                        FILTRAR RESULTADOS
                    </button>
                </div>
            </div>
        </div>

        <!-- Main DataGrid Container -->
        <div
            class="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-50 animate-slide-up relative mx-4 md:mx-0 pb-16">
            <div v-if="reportData.length === 0 && !loading"
                class="flex flex-col items-center justify-center py-20 text-slate-400">
                <InboxIcon class="w-16 h-16 opacity-20 mb-4" />
                <p class="font-bold text-lg">No hay resultados para mostrar</p>
                <p class="text-sm">Inicia una búsqueda aplicando los filtros superiores</p>
            </div>

            <DxDataGrid v-else ref="gridRef" :key="gridKey" :data-source="reportData" key-expr="id"
                :show-borders="false" :column-auto-width="true" :row-alternation-enabled="false"
                :hover-state-enabled="true" class="custom-grid-reports" @exporting="onExporting"
                :load-panel="{ enabled: false }">
                <DxScrolling mode="virtual" />
                <DxPaging :page-size="20" />
                <DxPager :show-page-size-selector="true" :allowed-page-sizes="[10, 20, 50]" :show-info="true" />
                <DxHeaderFilter :visible="true" />

                <DxToolbar>
                    <DxToolbarItem location="after" template="exportButton" />
                </DxToolbar>

                <template #exportButton>
                    <div class="flex items-center gap-3">
                        <button @click="handleExportClick" v-if="reportData.length > 0"
                            class="flex items-center gap-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border border-emerald-100 shadow-sm active:scale-95 group">
                            <ArrowDownTrayIcon class="w-4 h-4 group-hover:bounce" />
                            EXPORTAR EXCEL
                        </button>
                    </div>
                </template>

                <DxExport :enabled="true" />

                <DxColumn v-if="filters.totals !== 1" data-field="harvest_date" caption="Fecha Cosecha" alignment="left"
                    css-class="!text-left" />

                <DxColumn data-field="ground" caption="Campo" alignment="left" css-class="!text-left">
                    <DxLookup :data-source="options.ground" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn data-field="worker" caption="Cosechero" alignment="left" css-class="!text-left">
                    <DxLookup :data-source="options.worker" value-expr="id" display-expr="fullName" />
                </DxColumn>

                <DxColumn data-field="worker_rut" caption="RUT" alignment="left" css-class="!text-left" />

                <DxColumn data-field="specie" caption="Especie" alignment="left" css-class="!text-left">
                    <DxLookup :data-source="options.specie" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn data-field="kg_boxes" caption="Total Kilos" :data-type="'number'" format="#,##0.00"
                    alignment="right" css-class="!text-right font-black text-indigo-600" />
            </DxDataGrid>

            <LoadingOverlay :show="loading" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
    CalendarDaysIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    InboxIcon,
    ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import {
    DxDataGrid, DxColumn, DxPaging, DxPager, DxLookup, DxScrolling, DxToolbar, DxItem as DxToolbarItem, DxHeaderFilter, DxExport
} from 'devextreme-vue/data-grid'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxCheckBox } from 'devextreme-vue/check-box'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import conexionApi from '@/services/conexionApi'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import notify from 'devextreme/ui/notify'

/* =====================
   STATE & REFS
===================== */
const loading = ref(false)
const showFilters = ref(true)
const reportData = ref([])
const gridRef = ref(null)
const companyID = localStorage.getItem('userIdCompany')

// Generation of Month and Year options
const monthOptions = [
    { id: 1, name: 'Enero' }, { id: 2, name: 'Febrero' }, { id: 3, name: 'Marzo' },
    { id: 4, name: 'Abril' }, { id: 5, name: 'Mayo' }, { id: 6, name: 'Junio' },
    { id: 7, name: 'Julio' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Septiembre' },
    { id: 10, name: 'Octubre' }, { id: 11, name: 'Noviembre' }, { id: 12, name: 'Diciembre' }
]

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i)

const filters = reactive({
    month: currentMonth,
    year: currentYear,
    totals: 1,
    ground: null,
    worker: null,
    worker_rut: null,
    specie: null
})

const filterFields = reactive({
    ground: { label: 'Campo', checked: false },
    worker: { label: 'Cosechero', checked: false },
    worker_rut: { label: 'RUT Cosechero', checked: false },
    specie: { label: 'Especie', checked: false }
})

const options = reactive({
    ground: [],
    worker: [],
    specie: []
})

const gridKey = computed(() => {
    return `monthly-report-${filters.totals}-${filters.month}-${filters.year}`
})

/* =====================
   COMPUTED
===================== */
const totalKilos = computed(() => {
    if (!Array.isArray(reportData.value)) return 0
    return reportData.value.reduce((acc, item) => acc + (Number(item.kg_boxes) || 0), 0)
})

/* =====================
   METHODS
===================== */
const fetchDataLookups = async () => {
    try {
        const [grounds, workers, species] = await Promise.all([
            conexionApi.get(`/configuracion/production/getGround/${companyID}`),
            conexionApi.get(`/management-people/workers/getWorkers/${companyID}`),
            conexionApi.get(`/configuracion/production/getSpecies/${companyID}`)
        ])

        const getArray = (res, key) => {
            const data = res.data?.[key] || res.data
            return Array.isArray(data) ? data : []
        }

        options.ground = getArray(grounds, 'grounds')
        options.worker = getArray(workers, 'workers').map(w => ({ id: w.id, fullName: `${w.name} ${w.lastname}`, rut: w.rut }))
        options.specie = getArray(species, 'species')

    } catch (error) {
        console.error('Error fetching lookups:', error)
    }
}

const handleFilterResults = async () => {
    loading.value = true
    try {
        const payload = {
            totals: filters.totals,
            month: filters.month,
            year: filters.year
        }

        // Only include filters that are checked
        Object.keys(filterFields).forEach(key => {
            if (filterFields[key].checked) {
                payload[key] = filters[key] || ''
            }
        })

        const { data } = await conexionApi.post(`/configuracion/production/filterResultsMonthly/${companyID}`, payload)

        const results = data.results || data
        if (Array.isArray(results)) {
            reportData.value = results.map((item, index) => ({
                ...item,
                id: item.id || `monthly-${index}-${Date.now()}`
            }))
        } else {
            reportData.value = []
        }

        if (reportData.value.length === 0) {
            notify('No hay datos registrados para esta selección', 'warning', 2500)
        } else {
            notify('Reporte generado', 'success', 1500)
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            reportData.value = []
            notify('No se encontraron registros para los filtros seleccionados', 'warning', 2500)
        } else {
            console.error('Monthly Filter error:', error)
            notify('No se pudo establecer conexión con el servidor', 'error', 3000)
        }
    } finally {
        loading.value = false
    }
}

const handleExportClick = () => {
    if (gridRef.value) {
        onExporting({ component: gridRef.value.instance })
    }
}

const onExporting = (e) => {
    loading.value = true
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Produccion-Mensual')

    exportDataGrid({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
        customizeCell: ({ gridCell, excelCell }) => {
            if (gridCell.rowType === 'header') {
                excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
                excelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
            }
        }
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `ProduccionM_Mensual_${filters.month}_${filters.year}.xlsx`)
            loading.value = false
        })
    })
}

onMounted(async () => {
    loading.value = true
    await fetchDataLookups()
    loading.value = false
})
</script>

<style scoped>
.reports-page {
    animation: fadeIn 0.8s ease-out;
}

.custom-grid-reports :deep(.dx-datagrid-headers) {
    background-color: transparent !important;
    padding-bottom: 20px !important;
}

.custom-grid-reports :deep(.dx-datagrid-text-content) {
    color: #94a3b8 !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    font-size: 11px !important;
}

.custom-grid-reports :deep(.dx-row:not(.dx-header-row)) {
    transition: all 0.3s ease;
}

.custom-grid-reports :deep(.dx-data-row:hover) {
    background-color: #f8fafc !important;
    transform: translateY(-2px);
}

.custom-selectbox-reports :deep(.dx-texteditor-container) {
    border-radius: 1rem !important;
    background-color: white;
    border: 1px solid #f1f5f9;
}

.custom-selectbox-reports :deep(.dx-texteditor-input) {
    font-weight: 700;
    color: #1e293b;
    font-size: 13px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
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

.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
    animation: slideUp 0.6s ease-out;
}
</style>
