<template>
    <!-- Title -->
    <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <SparklesIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Especies</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de especies vegetales y frutales</p>
            </div>
        </div>
    </div>

    <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto relative text-[13px]!">
        <LoadingOverlay :show="loading" />
        <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true"
            :column-auto-width="true" :width="'100%'"">
        <!-- Panel adaptable -->

        <DxColumnFixing :enabled="true" />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxScrolling column-rendering-mode="virtual" />

        <DxSearchPanel :visible="true" placeholder="Buscar..." />
        <DxPaging :page-size="15" />

        <DxColumn data-field="name" caption="Nombre" css-class="!text-left" alignment="right" />

        <!---
    <DxColumn data-field="ground" caption="Campo" css-class="!text-left" alignment="right">
      <DxLookup :data-source="groundsDS" value-expr="id" display-expr="name" />
    </DxColumn> -->

        <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center"
            alignment="right" :allow-filtering="false" />

        <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
            <DxPopup title="Gestión de Usuario" :show-title="true" :width="900" :height="250" />
            <DxForm>
                <DxItem data-field="name" :is-required="true">
                    <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
                </DxItem>
                <!--
        <DxItem data-field="ground" caption="Campo" editor-type="dxSelectBox" :editor-options="{
          dataSource: groundsDS,
          valueExpr: 'id',
          displayExpr: 'name',
          searchEnabled: true,
          placeholder: 'Seleccione campo'
        }" />
-->

                <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :is-required="true"
                    :editor-options="{
                        dataSource: [
                            { id: 1, name: 'Activo' },
                            { id: 0, name: 'Inactivo' }
                        ],
                        displayExpr: 'name',
                        valueExpr: 'id',
                        placeholder: 'Seleccione estado'
                    }" :validation-rules="[{ type: 'required', message: 'El estado es obligatorio' }]" />

            </DxForm>

        </DxEditing>
        </DxDataGrid>
    </div>

    <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
        <!-- Fondo -->
        <div class="fixed inset-0 bg-[#0000003d] bg-opacity-50" @click="closeModals"></div>

        <!-- Modal -->
        <div
            class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-xl mx-auto">
            <h2 class="text-xl mb-4">
                Detalles de la Especie
                <span class="font-bold rounded-sm">
                    {{ selectedItem?.name || 'N/A' }}
                </span>
            </h2>

            <div class="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                <!-- Estado -->
                <p class="text-sm flex items-center gap-2">
                    <span v-if="selectedItem?.status !== undefined"
                        :class="`rounded-full ${getStatusMeta(selectedItem.status).bgColor} ${getStatusMeta(selectedItem.status).textColor}
              font-[400] px-3 h-[23px] inline-flex items-center w-[120px] justify-center gap-1 border border-gray-100`">
                        <span v-if="getStatusMeta(selectedItem.status).pulseColor"
                            :class="`w-[10px] h-[10px] ${getStatusMeta(selectedItem.status).pulseColor} rounded-full animate-pulse`"></span>
                        <span>{{ getStatusMeta(selectedItem.status).text }}</span>
                    </span>
                </p>

                <!-- VARIEDADES -->
                <div>
                    <h3 class="font-bold mb-2">Variedades asociadas</h3>

                    <div v-if="loadingVarieties" class="text-sm text-gray-500">
                        Cargando variedades...
                    </div>

                    <div v-else-if="!varieties.length" class="text-sm text-gray-400 italic">
                        No existen variedades asociadas a esta especie.
                    </div>

                    <div v-else class="space-y-2">
                        <div v-for="v in varieties" :key="v.id"
                            class="flex items-center justify-between border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
                            <span class="text-sm">{{ v.name }}</span>
                            <span
                                :class="`text-xs rounded-full px-2 py-[2px] ${getStatusMeta(v.status).bgColor} ${getStatusMeta(v.status).textColor}`">
                                {{ getStatusMeta(v.status).text }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Botón cerrar -->
            <button @click="closeModals"
                class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
                Cerrar
            </button>
        </div>
    </div>

</template>


<script setup>
import { ref, computed, watch, shallowRef } from 'vue'
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
    DxColumnChooser,
    DxColumnFixing,
    DxSearchPanel,
    DxSelection,
    DxFilterRow,
    DxHeaderFilter
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// FORM
import {
    DxSimpleItem
} from 'devextreme-vue/form'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, getStatusMeta } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)
const varieties = ref([])
const loadingVarieties = ref(false)


const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0


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
        return data.usuario || payload // Devuelve la entidad creada
    },
    update: async (key, values) => {
        const instance = mainGridRef.value.instance;
        const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}
        const payload = { ...currentData, ...values, id: key, company_id: companyID }

        const { data } = await conexionApi.post('/configuracion/production/updateSpecies', payload)
        if (data.code === "ERROR") throw new Error(data.mensaje)
        return data.usuario || payload // Devuelve el objeto actualizado
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

// --- Botones personalizados ---
const customButtons = [
    {
        hint: 'Ver',
        icon: 'custom-view',
        onClick: async (e) => {
            selectedItem.value = e.row.data
            showViewModal.value = true
            await loadVarieties(e.row.data.id)
        }
    }, ,
    'edit',
    'delete'
]

</script>
