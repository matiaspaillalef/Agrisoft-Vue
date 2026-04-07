<template>
    <!-- Title Header -->
    <div
        class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <ShieldCheckIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Calidad</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de estándares y niveles de calidad</p>
            </div>
        </div>
    </div>

    <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative text-[13px]!">
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
        <DxColumn data-field="abbreviation" caption="Abreviatura" css-class="!text-left" alignment="right" />

        <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center"
            alignment="right" :allow-filtering="false" />

        <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
            <DxPopup title="Gestión de Usuario" :show-title="true" :width="900" :height="450" />
            <DxForm>
                <DxItem data-field="name" :is-required="true">
                    <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
                </DxItem>
                <DxItem data-field="abbreviation" :is-required="true">
                    <DxSimpleItem
                        :validation-rules="[{ type: 'required', message: 'La abreviatura es obligatoria' }]" />
                </DxItem>

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


</template>


<script setup>
import { ref, computed, watch, shallowRef } from 'vue'
import { ShieldCheckIcon } from '@heroicons/vue/24/solid'
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
import { statusCellTemplate } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)


const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0


const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const { data } = await conexionApi.get('/configuracion/production/getQuality/' + companyID)
            return (data.qualities || []).map(r => ({
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
        const { data } = await conexionApi.post('/configuracion/production/createQuality', payload)
        if (data.code === "ERROR") throw new Error(data.mensaje)
        return data.usuario || payload // Devuelve la entidad creada
    },
    update: async (key, values) => {
        const instance = mainGridRef.value.instance;
        const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}
        const payload = { ...currentData, ...values, id: key, company_id: companyID }
        const { data } = await conexionApi.post('/configuracion/production/updateQuality', payload)
        if (data.code === "ERROR") throw new Error(data.mensaje)
        return data.usuario || payload // Devuelve el objeto actualizado
    },
    remove: async (key) => {
        const { data } = await conexionApi.post('/configuracion/production/deleteQuality', { id: key })
        if (data.code === "ERROR") throw new Error(data.mensaje)
    }
})

// --- Botones personalizados ---
const customButtons = [
    'edit',
    'delete'
]

</script>
