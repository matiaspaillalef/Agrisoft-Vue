<template>
    <div class="reports-page px-0 pb-12">
        <!-- Title Section -->
        <div
            class="mb-8 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-500 hover:shadow-md animate-fade-in mx-4 md:mx-0">
            <div class="flex items-center gap-6">
                <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <PresentationChartLineIcon class="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">Reportes de Producción</h1>
                    <p class="text-slate-500 font-medium font-inter">Análisis detallado y auditoría de cosecha en tiempo
                        real</p>
                </div>
            </div>

            <!-- General Stats Banner -->
            <div v-if="reportData.length > 0"
                class="hidden lg:flex gap-10 items-center border-l border-slate-100 pl-10">
                <div class="text-right">
                    <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Registros</p>
                    <p class="text-3xl font-black text-slate-800">{{ reportData.length }}</p>
                </div>
                <div class="h-12 w-px bg-slate-100"></div>
                <div class="text-right">
                    <p class="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Total Kilos</p>
                    <p class="text-3xl font-black text-blue-600">
                        {{ totalKilos.toLocaleString('es-CL', { minimumFractionDigits: 2 }) }}
                    </p>
                </div>
                <div class="h-12 w-px bg-slate-100"></div>
                <div class="text-right">
                    <p class="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Total Cajas</p>
                    <p class="text-3xl font-black text-emerald-600">
                        {{ totalBoxes.toLocaleString('es-CL', { minimumFractionDigits: 2 }) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Filters Panel -->
        <div
            class="mx-4 md:mx-0 mb-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-50 relative overflow-hidden">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <AdjustmentsHorizontalIcon class="w-6 h-6 text-blue-600" />
                    <h2 class="text-xl font-black text-slate-800 uppercase tracking-tight">Panel de Filtros</h2>
                </div>
                <button @click="showFilters = !showFilters"
                    class="px-6 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 w-fit!">
                    {{ showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
                </button>
            </div>

            <div v-show="showFilters" class="space-y-8 animate-fade-in">
                <!-- Basic Date Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha
                            Desde</label>
                        <DxDateBox v-model="filters.from" type="date" display-format="dd/MM/yyyy"
                            class="custom-datebox" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha
                            Hasta</label>
                        <DxDateBox v-model="filters.to" type="date" display-format="dd/MM/yyyy"
                            class="custom-datebox" />
                    </div>
                    <!-- Select All Trigger -->
                    <div class="flex items-end pb-1.5 focus-within:scale-105">
                        <DxCheckBox :value="isAllSelected" @value-changed="toggleSelectAll"
                            text="Seleccionar todos los campos" class="text-sm font-bold text-slate-600" />
                    </div>
                </div>

                <!-- Advanced Multi-Filters -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div v-for="(field, key) in filterFields" :key="key" class="flex flex-col gap-3 transition-all">
                        <div class="flex items-center gap-2 mb-1">
                            <DxCheckBox v-model:value="field.checked" class="scale-90" />
                            <span
                                class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ field.label }}</span>
                        </div>

                        <DxSelectBox v-if="field.type === 'select'" :items="options[key]" display-expr="name"
                            value-expr="id" v-model:value="filters[key]" :disabled="!field.checked"
                            :search-enabled="true" placeholder="Elija una opción..." class="custom-selectbox-reports"
                            :show-clear-button="true" />
                    </div>
                </div>

                <!-- Totals Toggle Logic -->
                <div class="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <div
                        class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 hidden">
                        <span class="text-xs font-black text-indigo-600 uppercase tracking-widest">Filtrar por
                            totales</span>
                        <DxCheckBox v-model:value="filters.totals" :on-value="1" :off-value="0" />
                    </div>

                    <button @click="handleFilterResults" :disabled="loading"
                        class="ml-auto flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 w-fit!">
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
                <DxScrolling mode="standard" />
                <DxPaging :page-size="40" />
                <DxPager :show-page-size-selector="true" :allowed-page-sizes="[20, 40, 100]" :show-info="true" :show-navigation-buttons="true" />
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

                <!-- Dynamic Columns based on React logic -->
                <DxColumn data-field="harvest_date" caption="Fecha Cosecha" :data-type="'date'" format="dd-MM-yyyy"
                    alignment="right" css-class="!text-left" />
                <DxColumn :visible="!filters.totals" data-field="harvest_time" caption="Hora" alignment="right"
                    css-class="!text-left" :width="80" />

                <DxColumn :visible="filterFields.ground.checked" data-field="ground" caption="Campo" alignment="right"
                    css-class="!text-left">
                    <DxLookup :data-source="options.ground" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.sector.checked" data-field="sector" caption="Sector" alignment="right"
                    css-class="!text-left">
                    <DxLookup :data-source="options.sector" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.specie.checked" data-field="specie" caption="Especie" alignment="right"
                    css-class="!text-left">
                    <DxLookup :data-source="options.specie" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.variety.checked" data-field="variety" caption="Variedad"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.variety" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.quality.checked" data-field="quality" caption="Calidad"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.quality" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.squad.checked" data-field="squad" caption="Cuadrilla" alignment="right"
                    css-class="!text-left">
                    <DxLookup :data-source="options.squad" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.worker.checked" data-field="worker" caption="Cosechero"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.worker" value-expr="id" display-expr="fullName" />
                </DxColumn>

                <DxColumn :visible="filterFields.harvest_format.checked" data-field="harvest_format" caption="Formato"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.harvest_format" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.contractor.checked" data-field="contractor" caption="Contratista"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.contractor" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.weigher_rut.checked" data-field="weigher_rut" caption="Pesador"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.weigher_rut" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.season.checked" data-field="season" caption="Temporada"
                    alignment="right" css-class="!text-left">
                    <DxLookup :data-source="options.season" value-expr="id" display-expr="name" />
                </DxColumn>

                <DxColumn :visible="filterFields.batch.checked" data-field="batch" caption="Lote" alignment="right"
                    css-class="!text-left" />

                <DxColumn data-field="boxes" caption="Cajas" :data-type="'number'" alignment="right"
                    css-class="!text-left" />
                <DxColumn data-field="kg_boxes" caption="Kg/Caja" :data-type="'number'" alignment="right"
                    css-class="!text-left" />
                <DxColumn caption="Total Kilos"
                    :calculate-cell-value="row => (Number(row.boxes || 0) * Number(row.kg_boxes || 0)).toFixed(2)"
                    alignment="right" :width="100" />

                <DxColumn type="buttons" width="50" caption="">
                    <DxButton icon="eye" @click="viewDetails" />
                </DxColumn>
            </DxDataGrid>

            <LoadingOverlay :show="loading" />
        </div>

        <!-- Details View Popup -->
        <DxPopup v-model:visible="detailModalVisible" :show-title="true" title="Ficha Técnica de Cosecha" :width="700"
            :height="600" :shading="true" position="center">
            <template #content>
                <div class="px-8 py-6 flex flex-col h-full overflow-y-auto bg-white" v-if="selectedRow">
                    <div class="flex items-start gap-8 mb-10 pb-8 border-b border-slate-50">
                        <div class="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 flex-shrink-0">
                            <ClipboardDocumentCheckIcon class="w-10 h-10 text-white" />
                        </div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">
                                {{ lookupName('worker', selectedRow.worker) }}
                            </h3>
                            <div class="flex items-center gap-4 mt-2">
                                <span
                                    class="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    {{ formatDate(selectedRow.harvest_date) }}
                                </span>
                                <span
                                    class="text-slate-400 font-bold text-sm">{{ selectedRow.harvest_time || '--:--' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-8 mb-10">
                        <div class="space-y-6">
                            <DetailItem title="Campo" :value="lookupName('ground', selectedRow.ground)" />
                            <DetailItem title="Sector" :value="lookupName('sector', selectedRow.sector)" />
                            <DetailItem title="Cuadrilla" :value="lookupName('squad', selectedRow.squad)" />
                            <DetailItem title="Contratista" :value="lookupName('contractor', selectedRow.contractor)" />
                        </div>
                        <div class="space-y-6">
                            <DetailItem title="Especie" :value="lookupName('specie', selectedRow.specie)" />
                            <DetailItem title="Variedad" :value="lookupName('variety', selectedRow.variety)" />
                            <DetailItem title="Calidad" :value="lookupName('quality', selectedRow.quality)" />
                            <DetailItem title="Formato"
                                :value="lookupName('harvest_format', selectedRow.harvest_format)" />
                        </div>
                    </div>

                    <div
                        class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Cajas</p>
                            <p class="text-2xl font-black text-slate-800">{{ selectedRow.boxes }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Kg Caja</p>
                            <p class="text-2xl font-black text-slate-800">{{ selectedRow.kg_boxes }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Lote</p>
                            <p class="text-2xl font-black text-slate-800">{{ selectedRow.batch || '-' }}</p>
                        </div>
                    </div>
                </div>
            </template>
        </DxPopup>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
    PresentationChartLineIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    InboxIcon,
    ClipboardDocumentCheckIcon,
    ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import {
    DxDataGrid, DxColumn, DxPaging, DxPager, DxLookup, DxScrolling, DxToolbar, DxItem as DxToolbarItem, DxHeaderFilter, DxExport
} from 'devextreme-vue/data-grid'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxDateBox } from 'devextreme-vue/date-box'
import { DxCheckBox } from 'devextreme-vue/check-box'
import { DxPopup } from 'devextreme-vue/popup'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import conexionApi from '@/services/conexionApi'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import notify from 'devextreme/ui/notify'

// Components
import DetailItem from '@/components/DetailItem.vue' // Supusimos que este existe o lo creamos

/* =====================
   STATE & REFS
===================== */
const loading = ref(false)
const showFilters = ref(true)
const reportData = ref([])
const gridRef = ref(null)
const companyID = localStorage.getItem('userIdCompany')

const filters = reactive({
    from: null,
    to: null,
    totals: 1,
    ground: null,
    sector: null,
    squad: null,
    worker: null,
    specie: null,
    quality: null,
    variety: null,
    harvest_format: null,
    contractor: null,
    weigher_rut: null,
    season: null,
    batch: null
})

const filterFields = reactive({
    ground: { label: 'Campo', type: 'select', checked: false },
    sector: { label: 'Sector', type: 'select', checked: false },
    squad: { label: 'Cuadrilla', type: 'select', checked: false },
    worker: { label: 'Cosechero', type: 'select', checked: false },
    specie: { label: 'Especie', type: 'select', checked: false },
    quality: { label: 'Calidad', type: 'select', checked: false },
    variety: { label: 'Variedad', type: 'select', checked: false },
    harvest_format: { label: 'Formato Cosecha', type: 'select', checked: false },
    contractor: { label: 'Contratista', type: 'select', checked: false },
    weigher_rut: { label: 'Pesador', type: 'select', checked: false },
    season: { label: 'Temporada', type: 'select', checked: false },
    batch: { label: 'Lote', type: 'select', checked: false }
})

const options = reactive({
    ground: [],
    sector: [],
    squad: [],
    worker: [],
    specie: [],
    quality: [],
    variety: [],
    harvest_format: [],
    contractor: [],
    weigher_rut: [],
    season: [],
    batch: Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Lote ${i + 1}` }))
})

const detailModalVisible = ref(false)
const selectedRow = ref(null)

const gridKey = computed(() => {
    // Generar una clave única basada en qué filtros están activados para forzar el re-renderizado del grid
    const colStatus = Object.entries(filterFields)
        .map(([key, val]) => `${key}:${val.checked}`)
        .join('|')
    return `${colStatus}|totals:${filters.totals}`
})

/* =====================
   COMPUTED
===================== */
const totalKilos = computed(() => {
    if (!Array.isArray(reportData.value)) return 0
    return reportData.value.reduce((acc, item) => acc + (Number(item.kg_boxes) || 0), 0)
})

const totalBoxes = computed(() => {
    if (!Array.isArray(reportData.value)) return 0
    return reportData.value.reduce((acc, item) => acc + (Number(item.boxes) || 0), 0)
})

const isAllSelected = computed(() => {
    return Object.values(filterFields).every(f => f.checked)
})

/* =====================
   METHODS
===================== */
const toggleSelectAll = (e) => {
    const newVal = e.value
    Object.keys(filterFields).forEach(key => {
        filterFields[key].checked = newVal
    })
}

const fetchDataLookups = async () => {
    try {
        const [grounds, sectors, squads, workers, species, qualities, varieties, formats, contractors, users, seasons, shifts] = await Promise.all([
            conexionApi.get(`/configuracion/production/getGround/${companyID}`),
            conexionApi.get(`/configuracion/production/getSectorsBarracks/${companyID}`),
            conexionApi.get(`/management-people/squads/getSquads/${companyID}`),
            conexionApi.get(`/management-people/workers/getWorkers/${companyID}`),
            conexionApi.get(`/configuracion/production/getSpecies/${companyID}`),
            conexionApi.get(`/configuracion/production/getQuality/${companyID}`),
            conexionApi.get(`/configuracion/production/getVarieties/${companyID}`),
            conexionApi.get(`/configuracion/production/getHarvestFormat/${companyID}`),
            conexionApi.get(`/management-people/contractors/getContractors/${companyID}`),
            conexionApi.get(`/configuracion/usuarios/${companyID}`),
            conexionApi.get(`/configuracion/production/getSeasons/${companyID}`),
            conexionApi.get(`/management-people/shifts/getShifts/${companyID}`)
        ])

        const getArray = (res, key) => {
            const data = res.data?.[key] || res.data
            return Array.isArray(data) ? data : []
        }

        options.ground = getArray(grounds, 'grounds')
        options.sector = getArray(sectors, 'sectors')
        options.squad = getArray(squads, 'squads')
        options.worker = getArray(workers, 'workers').map(w => ({ id: w.id, fullName: `${w.name} ${w.lastname}`, name: `${w.name} ${w.lastname}` }))
        options.specie = getArray(species, 'species')
        options.quality = getArray(qualities, 'qualities')
        options.variety = getArray(varieties, 'varieties')
        options.harvest_format = getArray(formats, 'formats')
        options.contractor = getArray(contractors, 'contractors')
        options.weigher_rut = getArray(users, 'usuarios').filter(u => u.id_rol == 6).map(u => ({ id: u.id, name: `${u.name} ${u.lastname}` }))
        options.season = getArray(seasons, 'seasons')
        options.shifts = getArray(shifts, 'shifts')

    } catch (error) {
        console.error('Error fetching lookups:', error)
    }
}

const handleFilterResults = async () => {
    loading.value = true
    try {
        const payload = {
            totals: filters.totals || 0,
            from: filters.from,
            to: filters.to
        }

        // Solo enviamos los campos que están marcados (checked)
        // El backend usa Object.keys(payload) para construir el SELECT y GROUP BY
        Object.keys(filterFields).forEach(key => {
            if (filterFields[key].checked) {
                payload[key] = filters[key] || '' // Enviamos el valor seleccionado o vacío para incluir la columna sin filtro fijo
            }
        })

        // Formatear fechas para la API (YYYY-MM-DD)
        if (payload.from && payload.from instanceof Date) {
            payload.from = payload.from.toISOString().split('T')[0]
        }
        if (payload.to && payload.to instanceof Date) {
            payload.to = payload.to.toISOString().split('T')[0]
        }

        const results = await conexionApi.post(`/configuracion/production/filterResults/${companyID}`, payload)

        const data = results.data.results || results.data
        if (Array.isArray(data)) {
            // Aseguramos que cada registro tenga un ID único para evitar E1046 de DevExtreme
            reportData.value = data.map((item, index) => ({
                ...item,
                id: item.id || item.id_registro || `row-${index}-${Date.now()}`
            }))
        } else {
            reportData.value = []
        }
        if (reportData.value.length === 0) {
            notify('No hay datos registrados para esta selección', 'warning', 2500)
        } else {
            notify('Búsqueda completada', 'success', 1500)
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            reportData.value = []
            notify('No se encontraron registros para los filtros seleccionados', 'warning', 2500)
        } else {
            console.error('Filter error:', error)
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
    const worksheet = workbook.addWorksheet('Reporte-Produccion')

    exportDataGrid({
        component: e.component,
        worksheet: worksheet,
        autoFilterEnabled: true,
        customizeCell: ({ gridCell, excelCell }) => {
            if (gridCell.rowType === 'header') {
                excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF132C6D' } }
                excelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
            }
        }
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_Produccion_${new Date().getTime()}.xlsx`)
            loading.value = false
        })
    })
}

const lookupName = (key, id) => {
    const list = options[key] || []
    const item = list.find(i => i.id === id)
    return item ? (item.fullName || item.name) : '-'
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('es-CL').format(new Date(date))
}

const actionButtons = [
    {
        icon: 'eye',
        hint: 'Ver Detalles',
        onClick: (e) => {
            selectedRow.value = e.row.data
            detailModalVisible.value = true
        }
    }
]

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

.custom-datebox :deep(.dx-texteditor-container) {
    border-radius: 1rem !important;
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
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
