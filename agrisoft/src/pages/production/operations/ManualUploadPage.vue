<template>
  <!-- Title Header -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md max-w-full mx-auto">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <CloudArrowUpIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Carga Manual de Cosecha</h1>
        <p class="text-slate-500 font-medium font-inter">Carga masiva, historial y gestión de registros productivos</p>
      </div>
    </div>
  </div>

    <!-- GRID CONTAINER -->
    <div
        class="custom-grid-container relative mt-[3px] flex w-full flex-grow flex-col items-center justify-start gap-2 rounded-3xl bg-white py-8 shadow-2xl px-2 md:px-10 mb-6 min-h-[500px] border border-gray-100 dark:bg-navy-800 dark:border-white/5">

        <!-- Header Actions Area -->
        <div class="flex w-full justify-between items-center mb-6 gap-4">
            <div class="flex-1 flex items-center">
                <h2 class="text-lg font-bold text-navy-700 dark:text-white hidden md:block">Registros de Cosecha</h2>
            </div>
            <div class="flex items-center gap-3">
                <button @click="addNewRecord"
                    class="group relative overflow-hidden flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 text-sm font-semibold tracking-wide">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:scale-110"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Registro
                    <span
                        class="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full hover:translate-y-0 transition-transform duration-300"></span>
                </button>
            </div>
        </div>

        <DxDataGrid :ref="el => gridRef = el" :data-source="dataSource" :show-borders="false"
            v-model:selected-row-keys="selectedRowKeys" class="custom-grid overflow-hidden w-full"
            :column-auto-width="true" @exporting="onExporting" @editor-preparing="onEditorPreparing"
            @init-new-row="onInitNewRow" :load-panel="{ enabled: false }" :allow-column-reordering="true"
            :allow-column-resizing="true" key-expr="id">

            <DxExport :enabled="true" :allow-export-selected-data="false" />

            <DxToolbar>
                <DxToolbarItem name="exportButton" location="after" :visible="hasData" />
                <DxToolbarItem name="searchPanel" location="after" />
            </DxToolbar>

            <DxFilterRow :visible="true" />
            <DxHeaderFilter :visible="true" :allow-search="true" />
            <DxScrolling mode="standard" column-rendering-mode="virtual" />
            <DxPaging :enabled="true" :page-size="15" />
            <DxPager :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50]" :show-info="true" />
            <!--<DxSelection mode="multiple" show-check-boxes-mode="always" width="40" />-->
            <DxColumnFixing :enabled="true" />
            <DxSearchPanel :visible="true" placeholder="Filtrar registros..." />

            <DxColumn data-field="id" :visible="false" sort-order="desc" />
            <DxColumn data-field="harvest_date" caption="Fecha" data-type="date" format="dd-MM-yyyy" alignment="right"
                css-class="!text-left" />
            <DxColumn data-field="harvest_time" caption="Hora" alignment="right" css-class="!text-left" />

            <DxColumn data-field="ground" caption="Campo" alignment="right" css-class="!text-left">
                <DxLookup :data-source="groundsList" value-expr="id" display-expr="name" />
            </DxColumn>

            <DxColumn data-field="worker" caption="Trabajador" alignment="right" css-class="!text-left"
                :set-cell-value="setWorkerValue">
                <DxLookup :data-source="workersList" value-expr="id" :display-expr="getWorkerName" />
            </DxColumn>

            <DxColumn data-field="worker_rut" caption="RUT" alignment="right" css-class="!text-left"
                :set-cell-value="setWorkerRutValue">
                <DxLookup :data-source="workersList" value-expr="id" display-expr="rut" />
            </DxColumn>

            <DxColumn data-field="specie" caption="Especie" alignment="right" css-class="!text-left"
                :set-cell-value="setSpecieValue">
                <DxLookup :data-source="speciesList" value-expr="id" display-expr="name" />
            </DxColumn>

            <DxColumn data-field="variety" caption="Variedad" alignment="right" css-class="!text-left">
                <DxLookup :data-source="varietiesList" value-expr="id" display-expr="name" />
            </DxColumn>

            <DxColumn data-field="kg_boxes" caption="Kg Cajas" data-type="number" alignment="right"
                css-class="!text-left" />


            <DxColumn data-field="sector" caption="Sector" alignment="right" css-class="!text-left">
                <DxLookup :data-source="sectorsList" value-expr="id" display-expr="name" />
            </DxColumn>

            <DxColumn data-field="harvest_format" caption="Formato Cosecha" alignment="right" css-class="!text-left">
                <DxLookup :data-source="harvestFormatsList" value-expr="id" display-expr="name" />
            </DxColumn>


            <DxColumn type="buttons" width="150">
                <DxButton icon="custom-view" hint="Ver" @click="viewRecord" />
                <DxButton name="edit" />
                <DxButton name="delete" />
                <DxButton icon="copy" hint="Clonar" @click="cloneRecord" />
            </DxColumn>

            <DxEditing mode="popup" :allow-updating="true" :allow-deleting="true" :allow-adding="true"
                :use-icons="true">
                <DxPopup title="Registro de Cosecha Manual" :show-title="true" :width="850" :height="750" />
                <DxForm :col-count="2">
                    <DxGroupItem caption="Ubicación" :col-span="2" :col-count="2">
                        <DxItem data-field="ground" caption="Campo">
                            <DxRequiredRule message="El campo es requerido" />
                            <DxLookup :data-source="groundsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Campo" />
                            <template #editorOptions>
                                { placeholder: 'Elige un campo' }
                            </template>
                        </DxItem>
                        <DxItem data-field="sector" caption="Sector">
                            <DxRequiredRule message="El sector es requerido" />
                            <DxLookup :data-source="sectorsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Sector" />
                            <template #editorOptions>
                                { placeholder: 'Elige un sector' }
                            </template>
                        </DxItem>
                        <DxItem data-field="squad" caption="Cuadrillas">
                            <DxLookup :data-source="squadsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Cuadrillas" />
                            <template #editorOptions>
                                { placeholder: 'Elige una cuadrilla' }
                            </template>
                        </DxItem>
                        <DxItem data-field="batch" editor-type="dxSelectBox"
                            :editor-options="{ dataSource: batchOptions, valueExpr: 'id', displayExpr: 'name', placeholder: 'Elige un lote' }">
                            <DxLabel text="Lote" />
                        </DxItem>
                    </DxGroupItem>

                    <DxGroupItem caption="Datos cosecha" :col-span="2" :col-count="2">
                        <DxItem data-field="worker" editor-type="dxSelectBox"
                            :editor-options="{ dataSource: workersList, valueExpr: 'id', displayExpr: getWorkerName, searchEnabled: true, placeholder: 'Elige cosechero' }">
                            <DxRequiredRule message="El cosechero es requerido" />
                            <DxLabel text="Cosechero" />
                        </DxItem>
                        <DxItem data-field="worker_rut" editor-type="dxSelectBox"
                            :editor-options="{ dataSource: workersList, valueExpr: 'id', displayExpr: 'rut', searchEnabled: true, placeholder: 'Elige RUT' }">
                            <DxRequiredRule message="El RUT es requerido" />
                            <DxLabel text="Rut cosechero" />
                        </DxItem>

                        <DxItem data-field="harvest_date" caption="Fecha cosecha" editor-type="dxDateBox"
                            :editor-options="{ type: 'datetime', displayFormat: 'dd/MM/yyyy, HH:mm', placeholder: 'dd/mm/aaaa, --:--' }">
                            <DxRequiredRule message="La fecha es requerida" />
                            <DxLabel text="Fecha cosecha" />
                        </DxItem>
                        <DxItem data-field="specie" editor-type="dxSelectBox"
                            :editor-options="{ dataSource: speciesList, valueExpr: 'id', displayExpr: 'name', placeholder: 'Elige una especie' }">
                            <DxRequiredRule message="La especie es requerida" />
                            <DxLabel text="Especie" />
                        </DxItem>
                        <DxItem data-field="variety" editor-type="dxSelectBox"
                            :editor-options="{ dataSource: varietiesList, valueExpr: 'id', displayExpr: 'name', placeholder: 'Elige una variedad' }">
                            <DxRequiredRule message="La variedad es requerida" />
                            <DxLabel text="Variedad" />
                        </DxItem>
                        <DxItem data-field="boxes" caption="N. de Cajas">
                            <DxRequiredRule message="El número de cajas es requerido" />
                            <DxLabel text="N. de Cajas" />
                        </DxItem>

                        <DxItem data-field="kg_boxes" caption="Kg Cajas">
                            <DxRequiredRule message="Los kg por caja son requeridos" />
                            <DxLabel text="Kg Cajas" />
                        </DxItem>
                        <DxItem data-field="quality" caption="Calidad">
                            <DxRequiredRule message="La calidad es requerida" />
                            <DxLookup :data-source="qualitiesList" value-expr="id" display-expr="name" />
                            <DxLabel text="Calidad" />
                            <template #editorOptions>
                                { placeholder: 'Elige una calidad' }
                            </template>
                        </DxItem>

                        <DxItem data-field="harvest_format" caption="Formato cosecha">
                            <DxLookup :data-source="harvestFormatsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Formato cosecha" />
                            <template #editorOptions>
                                { placeholder: 'Elige un formato de cosecha' }
                            </template>
                        </DxItem>
                        <DxItem data-field="weigher_rut" caption="Pesador">
                            <DxLookup :data-source="workersList" value-expr="id" :display-expr="getWorkerName" />
                            <DxLabel text="Pesador" />
                            <template #editorOptions>
                                { placeholder: 'Elige pesador' }
                            </template>
                        </DxItem>

                        <DxItem data-field="season" caption="Temporada" :col-span="1">
                            <DxLookup :data-source="seasonsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Temporada" />
                            <template #editorOptions>
                                { placeholder: 'Elige una temporada' }
                            </template>
                        </DxItem>
                        <DxItem data-field="turns" caption="Turno">
                            <DxLookup :data-source="shiftsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Turno" />
                            <template #editorOptions>
                                { placeholder: 'Elige un turno' }
                            </template>
                        </DxItem>

                        <DxItem data-field="contractor" caption="Contratista">
                            <DxLookup :data-source="contractorsList" value-expr="id" display-expr="name" />
                            <DxLabel text="Contratista" />
                            <template #editorOptions>
                                { placeholder: 'Elige un contratista' }
                            </template>
                        </DxItem>
                    </DxGroupItem>
                </DxForm>
            </DxEditing>

            <!-- Hidden Columns for Editor Lookups (consolidated) -->
            <DxColumn data-field="squad" :visible="false">
                <DxLookup :data-source="squadsList" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="quality" :visible="false">
                <DxLookup :data-source="qualitiesList" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="weigher_rut" :visible="false" caption="Pesador">
                <DxLookup :data-source="workersList" value-expr="id" :display-expr="getWorkerName" />
            </DxColumn>
            <DxColumn data-field="season" :visible="false">
                <DxLookup :data-source="seasonsList" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="turns" :visible="false">
                <DxLookup :data-source="shiftsList" value-expr="id" display-expr="name" />
            </DxColumn>
            <DxColumn data-field="contractor" :visible="false">
                <DxLookup :data-source="contractorsList" value-expr="id" display-expr="name" />
            </DxColumn>
        </DxDataGrid>

        <!-- View Popup -->
        <DxPopupWidget :visible="isViewPopupVisible" @hiding="isViewPopupVisible = false" :drag-enabled="false"
            :hide-on-outside-click="true" :show-title="true" title="Ficha Técnica de Cosecha" :width="700"
            :height="650">
            <div class="view-details-container p-6 overflow-y-auto h-full space-y-8 bg-gray-50/50 dark:bg-transparent">
                <!-- Ubicación Section -->
                <div class="detail-section">
                    <h3
                        class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span class="w-8 h-[1px] bg-blue-600/30"></span> Ubicación
                    </h3>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Campo</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ resolveGroundName(viewRecordData.ground) }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Sector</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ resolveSectorName(viewRecordData.sector) }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Cuadrilla</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200">{{ resolveSquadName(viewRecordData.squad) }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Lote</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200">#{{ viewRecordData.batch }}</span>
                        </div>
                    </div>
                </div>

                <!-- Datos Cosecha Section -->
                <div class="detail-section">
                    <h3
                        class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span class="w-8 h-[1px] bg-blue-600/30"></span> Datos Cosecha
                    </h3>
                    <div class="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div
                            class="flex flex-col col-span-2 bg-white dark:bg-navy-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Cosechero</span>
                            <div class="flex items-center gap-3 mt-1">
                                <div
                                    class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {{ String(resolveWorkerName(viewRecordData.worker) || 'W').charAt(0) }}
                                </div>
                                <div class="flex flex-col">
                                    <span
                                        class="text-sm font-bold text-navy-700 dark:text-white">{{ resolveWorkerName(viewRecordData.worker) }}</span>
                                    <span class="text-[10px] text-gray-400 font-medium tracking-tight">RUT:
                                        {{ resolveWorkerRut(viewRecordData.worker) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Especie
                                y Variedad</span>
                            <span class="text-sm font-semibold text-navy-700 dark:text-gray-200 mt-1">
                                {{ resolveSpecieName(viewRecordData.specie) }} - <span
                                    class="text-blue-500">{{ resolveVarietyName(viewRecordData.variety) }}</span>
                            </span>
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Fecha
                                Cosecha</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200 mt-1">{{ formatFullDate(viewRecordData.harvest_date) }}</span>
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Cantidad</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200 mt-1">{{ viewRecordData.boxes }}
                                Cajas ({{ viewRecordData.kg_boxes }}kg/caja)</span>
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Calidad
                                y Formato</span>
                            <span
                                class="text-sm font-semibold text-navy-700 dark:text-gray-200 mt-1">{{ resolveQualityName(viewRecordData.quality) }}
                                / {{ resolveFormatName(viewRecordData.harvest_format) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </DxPopupWidget>

        <LoadingOverlay :show="loading" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CloudArrowUpIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import {
    DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxPaging, DxScrolling,
    DxColumnFixing, DxSearchPanel, DxHeaderFilter, DxSelection, DxExport, DxPager, DxToolbar, DxItem as DxToolbarItem,
    DxLookup, DxButton
} from 'devextreme-vue/data-grid'
import { DxPopup as DxPopupWidget } from 'devextreme-vue/popup'
import { DxItem, DxGroupItem, DxLabel, DxRequiredRule } from 'devextreme-vue/form'
import DxFormWidget from 'devextreme-vue/form'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import conexionApi from '@/services/conexionApi.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'

const loading = ref(false)
const gridRef = ref(null)

const onExporting = (e) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('ManualHarvest');

    exportDataGrid({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
    }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Carga_Manual_Cosecha.xlsx');
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

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

// Lookups y Opciones
const groundsList = ref([])
const sectorsList = ref([])
const qualitiesList = ref([])
const workersList = ref([])
const varietiesList = ref([])
const speciesList = ref([])
const squadsList = ref([])
const harvestFormatsList = ref([])
const seasonsList = ref([])
const contractorsList = ref([])
const shiftsList = ref([])
const batchOptions = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: String(i + 1) }))

import DataSource from 'devextreme/data/data_source'

const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow' && (e.dataField === 'worker' || e.dataField === 'worker_rut' || e.dataField === 'weigher_rut')) {
        e.editorOptions.searchEnabled = true;

        if (e.dataField === 'worker' || e.dataField === 'worker_rut') {
            const standardHandler = e.editorOptions.onValueChanged;
            e.editorOptions.onValueChanged = (args) => {
                e.setValue(args.value);
                standardHandler && standardHandler(args);
            }
        }
    }

    if (e.parentType === 'dataRow' && e.dataField === 'variety') {
        const rowData = e.row.data;
        e.editorOptions.dataSource = new DataSource({
            store: varietiesList.value,
            filter: (item) => {
                const currentSpecieId = rowData.specie;
                if (!currentSpecieId) return false;

                // Inspección flexible del campo que amarra la variedad a la especie
                const itemSpecieId = item.species_id || item.id_specie || item.specie || item.id_species;
                return String(itemSpecieId) === String(currentSpecieId);
            }
        });
    }
}

const setWorkerValue = (newData, value) => {
    newData.worker = value;
    newData.worker_rut = value;
};

const setWorkerRutValue = (newData, value) => {
    newData.worker = value;
    newData.worker_rut = value;
};

const setSpecieValue = (newData, value) => {
    console.log('Cambiando especie a:', value);
    newData.specie = value;
    newData.variety = null;
};

onMounted(async () => {
    try {
        const [grounds, sectors, qualities, workers, varieties, species, squads, formats, seasons, contractors, shifts] = await Promise.all([
            conexionApi.get(`/configuracion/production/getGround/${companyID}`),
            conexionApi.get(`/configuracion/production/getSectorsBarracks/${companyID}`),
            conexionApi.get(`/configuracion/production/getQuality/${companyID}`),
            conexionApi.get(`/management-people/workers/getWorkers/${companyID}`),
            conexionApi.get(`/configuracion/production/getVarieties/${companyID}`),
            conexionApi.get(`/configuracion/production/getSpecies/${companyID}`),
            conexionApi.get(`/management-people/squads/getSquads/${companyID}`),
            conexionApi.get(`/configuracion/production/getHarvestFormat/${companyID}`),
            conexionApi.get(`/configuracion/production/getSeasons/${companyID}`),
            conexionApi.get(`/management-people/contractors/getContractors/${companyID}`),
            conexionApi.get(`/management-people/shifts/getShifts/${companyID}`)
        ])

        groundsList.value = grounds.data.grounds || grounds.data || []
        sectorsList.value = sectors.data.sectors || sectors.data || []
        qualitiesList.value = qualities.data.qualities || qualities.data.data || qualities.data || []
        workersList.value = Array.isArray(workers.data.workers) ? workers.data.workers : (workers.data.workers || workers.data || [])
        varietiesList.value = varieties.data.varieties || varieties.data || []
        speciesList.value = species.data.species || species.data || []
        squadsList.value = squads.data.squads || squads.data || []
        harvestFormatsList.value = formats.data.formats || [];
        seasonsList.value = seasons.data.seasons || seasons.data.data || (Array.isArray(seasons.data) ? seasons.data : [])
        contractorsList.value = contractors.data.contractors || contractors.data || []
        shiftsList.value = shifts.data.shifts || shifts.data || []

    } catch (e) {
        console.error('Error cargando opciones iniciales', e)
    }
})

const options = computed(() => ({
    ground: groundsList.value,
    sector: sectorsList.value,
    worker_rut: workersList.value,
    quality: qualitiesList.value,
    variety: varietiesList.value,
    specie: speciesList.value
}))

const addNewRecord = () => {
    gridRef.value.instance.addRow()
}

const isViewPopupVisible = ref(false)
const viewRecordData = ref({})

const viewRecord = (e) => {
    viewRecordData.value = { ...e.row.data };
    isViewPopupVisible.value = true;
}

// Resoluidores de Nombres para la Vista Detallada
const resolveGroundName = (id) => groundsList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const resolveSectorName = (id) => sectorsList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const resolveSquadName = (id) => squadsList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const resolveWorkerName = (id) => {
    const w = workersList.value.find(x => x.id === id)
    return w ? `${w.name} ${w.lastname || ''}` : (id ? String(id) : 'Trabajador no encontrado')
}
const resolveWorkerRut = (id) => workersList.value.find(x => x.id === id)?.rut || 'N/A'
const resolveSpecieName = (id) => speciesList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const resolveVarietyName = (id) => varietiesList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const resolveQualityName = (id) => qualitiesList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const resolveFormatName = (id) => harvestFormatsList.value.find(x => x.id === id)?.name || (id ? String(id) : 'Sin asignar')
const formatFullDate = (date) => {
    if (!date) return 'Sin fecha'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Fecha inválida'
    return d.toLocaleString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const clonedData = ref(null)

const cloneRecord = (e) => {
    // Guardamos los datos para usarlos en onInitNewRow
    clonedData.value = { ...e.row.data };
    delete clonedData.value.id;
    gridRef.value.instance.addRow();
}

const onInitNewRow = (e) => {
    if (clonedData.value) {
        // Poblamos la nueva fila con los datos clonados
        Object.assign(e.data, clonedData.value);
        clonedData.value = null; // Limpiamos para el siguiente
    }
}

const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const response = await conexionApi.get(`/configuracion/production/getManualHarvesting/${companyID}`)
            const data = response.data.manualHarvesting || []
            hasData.value = data.length > 0
            return data
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {
        const date = values.harvest_date ? new Date(values.harvest_date) : new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        const now = new Date().toISOString();

        const payload = {
            ...values,
            company_id: companyID,
            harvest_date: `${yyyy}-${mm}-${dd}T${hh}:${min}:00`,
            sync: 1,
            sync_date: now,
            date_register: now,
            source: 1
        }

        console.log('Enviando payload INSERT a backend:', payload)
        const res = await conexionApi.post('/configuracion/production/createManualHarvesting', payload)
        if (res.data && res.data.code === 'ERROR') {
            throw new Error(res.data.mensaje || 'Error al guardar el registro')
        }
        return res.data
    },
    update: async (key, values) => {
        const row = gridRef.value.instance.getVisibleRows().find(r => r.key === key)?.data || {}
        const merged = { ...row, ...values };
        const date = merged.harvest_date ? new Date(merged.harvest_date) : new Date();

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        const now = new Date().toISOString();

        const payload = {
            ...merged,
            id: key,
            company_id: companyID,
            harvest_date: `${yyyy}-${mm}-${dd}T${hh}:${min}:00`,
            sync: 1,
            sync_date: now,
            date_register: now,
            source: 1
        }

        console.log('Enviando payload UPDATE a backend:', payload)
        const res = await conexionApi.post('/configuracion/production/updateManualHarvesting', payload)
        if (res.data && res.data.code === 'ERROR') {
            throw new Error(res.data.mensaje || 'Error al actualizar el registro')
        }
        return payload
    },
    remove: async (key) => {
        const res = await conexionApi.post('/configuracion/production/deleteManualHarvesting', { id: key })
        if (res.data && res.data.code === 'ERROR') {
            throw new Error(res.data.mensaje || 'Error al eliminar el registro')
        }
        return res.data
    }
})
</script>

<style scoped>
/* Re-using premium styles from Regularization */
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

:deep(.dx-datagrid-export-button:hover) {
    background-color: #059669 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3) !important;
}
</style>