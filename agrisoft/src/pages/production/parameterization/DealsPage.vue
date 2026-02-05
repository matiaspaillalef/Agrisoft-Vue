<template>
    <!-- Title -->
    <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
        <div class="flex flex-col">
            <h1 class="text-2xl font-light text-navy-700 dark:text-white">Tratos</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Tratos registrados en el sistema
            </p>
        </div>
    </div>

    <!-- GRID -->
    <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto">
        <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true"
            :column-auto-width="true" :width="'100%'"">
      <!-- LOADER -->
      <DxLoadPanel v-model:visible="loading" :enabled="true" :showPane="true" :indicator-src="logoGif"
            shading-color="transparent" :height="'100%'" :width="'100%'" class="custom-loadpanel" />
        <!-- Panel adaptable -->

        <DxColumnFixing :enabled="true" />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxScrolling column-rendering-mode="virtual" />

        <DxSearchPanel :visible="true" placeholder="Buscar..." />
        <DxPaging :page-size="15" />

        <DxColumn data-field="name" caption="Nombre" css-class="!text-left" alignment="right" />

        <DxColumn data-field="harvest_format" caption="Conf Cosecha" css-class="!text-left" alignment="right">
            <DxLookup :data-source="formatDS" value-expr="id" display-expr="name" />
        </DxColumn>

        <DxColumn data-field="price" caption="Precio" css-class="!text-left" alignment="right"
            :format="priceFormatter" />

        <DxColumn data-field="quality" caption="Calidad" css-class="!text-left" alignment="right">
            <DxLookup :data-source="qualityDS" value-expr="id" display-expr="name" />
        </DxColumn>

        <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-center"
            alignment="right" :allow-filtering="false" />

        <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
            <DxPopup title="Gestión de Tratos" :show-title="true" :width="900" :height="350" />
            <DxForm>
                <DxItem data-field="name" :is-required="true">
                    <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
                </DxItem>

                <DxItem data-field="harvest_format" caption="Formato de Cosecha" editor-type="dxSelectBox"
                    :is-required="true" :editor-options="{
                        dataSource: formatDS,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        searchEnabled: true,
                        placeholder: 'Seleccione formato de cosecha'
                    }" :validation-rules="[{ type: 'required', message: 'El formato de cosecha es obligatorio' }]" />

                <DxItem data-field="price" :is-required="true">
                    <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El precio es obligatorio' }]" />
                </DxItem>

                <DxItem data-field="quality" caption="Calidad" editor-type="dxSelectBox" :is-required="true"
                    :editor-options="{
                        dataSource: qualityDS,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        searchEnabled: true,
                        placeholder: 'Seleccione especie'
                    }" :validation-rules="[{ type: 'required', message: 'La especie es obligatoria' }]" />

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
    DxLoadPanel,
    DxHeaderFilter
} from 'devextreme-vue/data-grid'

// FORM
import {
    DxSimpleItem
} from 'devextreme-vue/form'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, priceFormatter } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0

const quality = shallowRef([])
const format = shallowRef([])

const loadQuality = async () => {
    try {
        const { data } = await conexionApi.get('/configuracion/production/getQuality/' + companyID)
        quality.value = [...(data.qualities || [])]
    } catch (e) {
        console.error('Error cargando calidad', e)
    }
}
loadQuality()

const loadFormat = async () => {
    try {
        const { data } = await conexionApi.get('/configuracion/production/getHarvestFormat/' + companyID)
        format.value = [...(data.formats || [])]
    } catch (e) {
        console.error('Error cargando tipos de recolección', e)
    }
}
loadFormat()

watch(quality, () => {
    mainGridRef.value?.instance?.refresh()
})

watch(format, () => {
    mainGridRef.value?.instance?.refresh()
})

const qualityDS = computed(() => ({
    store: quality.value
}))

const formatDS = computed(() => ({
    store: format.value
}))


const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const { data } = await conexionApi.get('/configuracion/production/getDeals/' + companyID)
            return data.deals
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

        const { data } = await conexionApi.post('/configuracion/production/createDeal', payload)
        if (data.code === 'ERROR') throw new Error(data.mensaje)
        return data.deals || payload
    },

    update: async (key, values) => {
        const instance = mainGridRef.value.instance
        const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}

        const payload = {
            ...currentData,
            ...values,
            id: key,
            company_id: companyID,
            ...(values.specie !== undefined && { species_id: values.specie })
        }

        const { data } = await conexionApi.post('/configuracion/production/updateDeal', payload)
        if (data.code === 'ERROR') throw new Error(data.mensaje)
        return data.deals || payload
    },

    remove: async (key) => {
        const { data } = await conexionApi.post('/configuracion/production/deleteDeal', { id: key })
        if (data.code === 'ERROR') throw new Error(data.mensaje)
    }
})

// --- Botones personalizados ---
const customButtons = [
    'edit',
    'delete',
]

</script>
