<template>
    <!-- Title Header -->
    <div
        class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-200">
                <SparklesIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Especies</h1>
                <p class="text-slate-500 font-medium font-inter">Administración centralizada de especies vegetales y
                    frutales</p>
            </div>
        </div>
    </div>

    <!-- Main Grid Container -->
    <div
        class="mt-4 flex w-full flex-grow items-center justify-around gap-2 rounded-3xl bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative text-[13px]! border border-slate-50">
        <LoadingOverlay :show="loading" />
        <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="false"
            :column-auto-width="true" :width="'100%'" class="custom-grid">

            <DxColumnFixing :enabled="true" />
            <DxHeaderFilter :visible="true" :allow-search="true" />
            <DxScrolling column-rendering-mode="virtual" />
            <DxSearchPanel :visible="true" placeholder="Buscar especie..." :width="280" />
            <DxPaging :page-size="15" />

            <DxColumn data-field="id" caption="ID" width="80" css-class="font-mono text-slate-400 !text-left"
                alignment="right" />
            <DxColumn data-field="name" caption="Nombre de la Especie"
                css-class="font-bold text-slate-700 font-inter !text-left" alignment="right" />

            <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-center"
                width="150" :allow-filtering="false" />

            <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />

            <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true"
                :use-icons="true">
                <DxPopup title="Gestión de Especie" :show-title="true" :width="500" :height="350"
                    class="premium-editor" />
                <DxForm :col-count="1">
                    <DxItem data-field="name" caption="Nombre" :is-required="true">
                        <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
                    </DxItem>

                    <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :is-required="true"
                        :editor-options="{
                            dataSource: [
                                { id: 1, name: 'Activo' },
                                { id: 0, name: 'Inactivo' }
                            ],
                            displayExpr: 'name',
                            valueExpr: 'id',
                            placeholder: 'Seleccione estado...'
                        }" :validation-rules="[{ type: 'required', message: 'El estado es obligatorio' }]" />
                </DxForm>
            </DxEditing>
        </DxDataGrid>
    </div>

    <!-- Improved View Modal -->
    <Transition name="fade">
        <div v-if="showViewModal"
            class="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-slate-900/40 backdrop-blur-sm">
            <div
                class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
                <!-- Header del Modal -->
                <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-emerald-50/30">
                    <div class="flex items-center gap-5">
                        <div class="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
                            <SparklesIcon class="w-8 h-8" />
                        </div>
                        <div>
                            <h2 class="text-3xl font-black text-slate-800 tracking-tight">Detalles de Especie</h2>
                            <p class="text-slate-500 font-medium font-inter">Información técnica y variedades asociadas
                            </p>
                        </div>
                    </div>
                    <button @click="closeModals"
                        class="p-3 hover:bg-white rounded-2xl transition-all hover:shadow-sm w-fit! text-white!">
                        <XMarkIcon class="w-7 h-7 text-white" />
                    </button>
                </div>

                <div class="flex flex-col lg:flex-row h-full">
                    <!-- Sidebar del Modal -->
                    <div
                        class="lg:w-1/3 bg-slate-50/50 p-8 border-r border-slate-50 flex flex-col items-center justify-center text-center">
                        <div
                            class="w-32 h-32 rounded-[2.5rem] bg-emerald-600 text-white flex items-center justify-center text-5xl font-black mb-6 shadow-xl shadow-emerald-200">
                            {{ selectedItem?.name?.charAt(0) || '?' }}
                        </div>
                        <h3 class="text-2xl font-black text-slate-800 mb-2 leading-tight">{{ selectedItem?.name }}</h3>

                        <!-- Badge de Estado -->
                        <div v-if="selectedItem?.status !== undefined"
                            :class="`mt-4 rounded-full ${getStatusMeta(selectedItem.status).bgColor} ${getStatusMeta(selectedItem.status).textColor}
                                      font-black px-6 py-2 flex items-center gap-2 border border-white shadow-sm transition-all hover:scale-105`">
                            <span
                                :class="`w-3 h-3 ${getStatusMeta(selectedItem.status).pulseColor} rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]`"></span>
                            <span
                                class="text-xs uppercase tracking-widest">{{ getStatusMeta(selectedItem.status).text }}</span>
                        </div>
                    </div>

                    <!-- Cuerpo del Modal (Variedades) -->
                    <div class="lg:w-2/3 p-8">
                        <div class="mb-6 flex items-center justify-between">
                            <h4 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <PuzzlePieceIcon class="w-5 h-5 text-emerald-500" />
                                Variedades Asociadas
                            </h4>
                            <span
                                class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                {{ varieties.length }} Total
                            </span>
                        </div>

                        <div class="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-if="loadingVarieties" class="space-y-3">
                                <div v-for="i in 3" :key="i" class="h-16 w-full bg-slate-50 animate-pulse rounded-2xl">
                                </div>
                            </div>

                            <div v-else-if="!varieties.length"
                                class="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <NoSymbolIcon class="w-12 h-12 text-slate-300 mb-4" />
                                <p class="text-slate-400 font-bold">No hay variedades para esta especie</p>
                            </div>

                            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="v in varieties" :key="v.id"
                                    class="group flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-200">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="font-bold text-slate-700">{{ v.name }}</span>
                                        <span
                                            :class="`w-2 h-2 rounded-full ${getStatusMeta(v.status).pulseColor}`"></span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] text-slate-400 font-mono uppercase">ID:
                                            {{ v.id }}</span>
                                        <span
                                            class="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{{ getStatusMeta(v.status).text }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, watch, shallowRef } from 'vue'
import {
    XMarkIcon,
    PuzzlePieceIcon,
    NoSymbolIcon
} from '@heroicons/vue/24/outline'
import { SparklesIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'

import {
    DxDataGrid,
    DxColumn,
    DxEditing,
    DxPopup,
    DxForm,
    DxItem,
    DxLookup,
    DxPaging,
    DxScrolling,
    DxColumnFixing,
    DxSearchPanel,
    DxHeaderFilter
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// FORM
import { DxSimpleItem } from 'devextreme-vue/form'
import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, getStatusMeta } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)
const varieties = ref([])
const loadingVarieties = ref(false)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const { data } = await conexionApi.get('/configuracion/production/getSpecies/' + companyID)
            return (data.species || []).map(r => ({
                ...r,
                status: Number(r.status)
            }))
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {
        const payload = {
            ...values,
            status: values.status ?? 1,
            company_id: companyID
        }
        const { data } = await conexionApi.post('/configuracion/production/createSpecies', payload)
        if (data.code === "ERROR") throw new Error(data.mensaje)
        return data.usuario || payload
    },
    update: async (key, values) => {
        const instance = mainGridRef.value.instance;
        const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}
        const payload = { ...currentData, ...values, id: key, company_id: companyID }

        const { data } = await conexionApi.post('/configuracion/production/updateSpecies', payload)
        if (data.code === "ERROR") throw new Error(data.mensaje)
        return data.usuario || payload
    },
    remove: async (key) => {
        const { data } = await conexionApi.post('/configuracion/production/deleteSpecies', { id: key })
        if (data.code === "ERROR") throw new Error(data.mensaje)
    }
})

function closeModals() {
    showViewModal.value = false
    varieties.value = []
}

// --- Botones personalizados ---
const customButtons = [
    {
        hint: 'Ver Detalles',
        icon: 'custom-view',
        onClick: async (e) => {
            selectedItem.value = e.row.data
            showViewModal.value = true
            await loadVarieties(e.row.data.id)
        }
    },
    'edit',
    'delete'
]

// ---------------- CARGA VARIEDADES ----------------
async function loadVarieties(speciesId) {
    loadingVarieties.value = true
    try {
        const { data } = await conexionApi.get(
            `/configuracion/production/getVarietiesBySpecies/${speciesId}?companyID=${companyID}`
        )
        varieties.value = (data.varieties || []).map(v => ({
            ...v,
            status: Number(v.status)
        }))
    } catch (e) {
        console.error('Error cargando variedades', e)
        varieties.value = []
    } finally {
        loadingVarieties.value = false
    }
}

</script>

<style scoped>
.custom-grid :deep(.dx-datagrid-header-panel) {
    padding: 0 0 20px 0;
    background-color: transparent;
}

.custom-grid :deep(.dx-datagrid-search-panel) {
    margin-left: 0;
}

.custom-grid :deep(.dx-datagrid-content .dx-datagrid-table .dx-row > td) {
    padding: 16px;
    vertical-align: middle;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
