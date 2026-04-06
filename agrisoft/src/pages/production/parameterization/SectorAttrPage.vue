<template>
    <!-- Title -->
    <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
        <div class="flex flex-col">
            <h1 class="text-2xl font-light text-navy-700 dark:text-white">Atributos de Sector</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Atributos registrados en el sistema
            </p>
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

        <DxColumn data-field="season" caption="Temporada" css-class="!text-left" alignment="right"
            :cell-template="seasonStatusCellTemplate">
            <DxLookup :data-source="seasonsDS" value-expr="id" display-expr="name" />
        </DxColumn>

        <DxColumn data-field="sector" caption="Sector" css-class="!text-left" alignment="right">
            <DxLookup :data-source="sectorDS" value-expr="id" display-expr="name" />
        </DxColumn>

        <DxColumn data-field="specie" caption="Especie" css-class="!text-left" alignment="right">
            <DxLookup :data-source="speciesDS" value-expr="id" display-expr="name" />
        </DxColumn>

        <DxColumn data-field="variety" caption="Variedad" css-class="!text-left" alignment="right">
            <DxLookup :data-source="varietiesDS" value-expr="id" display-expr="name" />
        </DxColumn>

        <DxColumn data-field="year_harvest" caption="Año plantación" css-class="!text-left" alignment="right"
            width="100" />
        <DxColumn data-field="ha_productivas" caption="Ha productivas" css-class="!text-left" alignment="right"
            width="120" :customize-text="(e) => formatNumberCL(e.value)" />
        <DxColumn data-field="on_ha" caption="Sobre Hilera" css-class="!text-left" alignment="right" width="120"
            :customize-text="(e) => formatNumberCL(e.value)" />
        <DxColumn data-field="between_ha" caption="Entre Hilera" css-class="!text-left" alignment="right" width="120"
            :customize-text="(e) => formatNumberCL(e.value)" />
        <DxColumn data-field="quantity_plants_ha" caption="Cantidad x Ha" css-class="!text-left" alignment="right"
            width="120" :customize-text="(e) => formatNumberCL(e.value)" />

        <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
            <DxPopup title="Gestión de Atributos de Sector" :show-title="true" :width="900" :height="550" />
            <DxForm>

                <DxItem data-field="season" caption="Temporada" editor-type="dxSelectBox" :is-required="true"
                    :editor-options="{
                        dataSource: seasonsDS,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        searchEnabled: true,
                        placeholder: 'Seleccione temporada'
                    }" :validation-rules="[{ type: 'required', message: 'La temporada es obligatoria' }]" />

                <DxItem data-field="sector" caption="Sector" editor-type="dxSelectBox" :is-required="true"
                    :editor-options="{
                        dataSource: sectorDS,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        searchEnabled: true,
                        placeholder: 'Seleccione sector'
                    }" :validation-rules="[{ type: 'required', message: 'El sector es obligatorio' }]" />

                <DxItem data-field="specie" caption="Especie" editor-type="dxSelectBox" :is-required="true"
                    :editor-options="{
                        dataSource: speciesDS,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        searchEnabled: true,
                        placeholder: 'Seleccione especie'
                    }" :validation-rules="[{ type: 'required', message: 'La especie es obligatoria' }]" />

                <DxItem data-field="variety" caption="Variedad" editor-type="dxSelectBox" :is-required="true"
                    :editor-options="{
                        dataSource: varietiesDS,
                        valueExpr: 'id',
                        displayExpr: 'name',
                        searchEnabled: true,
                        placeholder: 'Seleccione variedad'
                    }" :validation-rules="[{ type: 'required', message: 'La variedad es obligatoria' }]" />

                <DxItem data-field="year_harvest" caption="Año plantación" :is-required="true">
                    <DxSimpleItem
                        :validation-rules="[{ type: 'required', message: 'El año de plantación es obligatorio' }]" />
                </DxItem>

                <DxItem data-field="ha_productivas" caption="Ha productivas" :is-required="true">
                    <DxSimpleItem
                        :validation-rules="[{ type: 'required', message: 'Las ha productivas son obligatorias' }]" />
                </DxItem>

                <DxItem data-field="on_ha" caption="Sobre Hilera" :is-required="true">
                    <DxSimpleItem :validation-rules="[{ type: 'required', message: 'Sobre Hilera es obligatorio' }]" />
                </DxItem>

                <DxItem data-field="between_ha" caption="Entre Hilera" :is-required="true">
                    <DxSimpleItem :validation-rules="[{ type: 'required', message: 'Entre Hilera es obligatorio' }]" />
                </DxItem>
                <!--
        <DxItem data-field="quantity_plants_ha" caption="Cantidad x Ha" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'Cantidad x Ha es obligatorio' }]" />
        </DxItem>
    -->

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
    DxHeaderFilter
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// FORM
import {
    DxSimpleItem
} from 'devextreme-vue/form'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, formatNumberCL, seasonStatusCellTemplate } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0


const species = shallowRef([])
const seasons = shallowRef([])
const sector = shallowRef([])
const varieties = shallowRef([])

const loadSpecies = async () => {
    try {
        const { data } = await conexionApi.get('/configuracion/production/getSpecies/' + companyID)
        species.value = [...(data.species || [])]
    } catch (e) {
        console.error('Error cargando especies', e)
    }
}
loadSpecies()

const loadSeasons = async () => {
    try {
        const { data } = await conexionApi.get('/configuracion/production/getSeasons/' + companyID)
        seasons.value = [...(data.seasons || [])]
    } catch (e) {
        console.error('Error cargando temporadas', e)
    }
}
loadSeasons()

const loadSector = async () => {
    try {
        const { data } = await conexionApi.get('/configuracion/production/getSectorsBarracks/' + companyID)
        sector.value = [...(data.sectors || [])]
    } catch (e) {
        console.error('Error cargando sectores', e)
    }
}
loadSector()

const loadVarieties = async () => {
    try {
        const { data } = await conexionApi.get('/configuracion/production/getVarieties/' + companyID)
        varieties.value = [...(data.varieties || [])]
    } catch (e) {
        console.error('Error cargando variedades', e)
    }
}
loadVarieties()

watch(species, () => {
    mainGridRef.value?.instance?.refresh()
})

watch(seasons, () => {
    mainGridRef.value?.instance?.refresh()
})

watch(sector, () => {
    mainGridRef.value?.instance?.refresh()
})

watch(varieties, () => {
    mainGridRef.value?.instance?.refresh()
})

const speciesDS = computed(() => ({
    store: species.value
}))

const seasonsDS = computed(() => ({
    store: seasons.value
}))

const sectorDS = computed(() => ({
    store: sector.value
}))

const varietiesDS = computed(() => ({
    store: varieties.value
}))

const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const { data } = await conexionApi.get('/configuracion/production/getAttributesSector/' + companyID)
            // Ordenar por ID descendente para que los últimos agregados aparezcan primero
            const sortedData = (data.attributes || []).map(r => ({
                ...r,
                status: Number(r.status),
                species_id: r.species_id ? Number(r.species_id) : null
            })).sort((a, b) => b.id - a.id)

            return sortedData
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {
        const payload = {
            ...values,
            specie: values.specie,
            sector: values.sector,
            variety: values.variety,
            season: values.season,
            company_id: companyID
        }

        delete payload.status
        delete payload.quantity_plants_ha

        const { data } = await conexionApi.post('/configuracion/production/createAttributeSector', payload)
        if (data.code === 'ERROR') throw new Error(data.mensaje)
        return data.attribute || payload
    },
    update: async (key, values) => {
        const instance = mainGridRef.value.instance
        const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}

        const payload = {
            ...currentData,
            ...values,
            id: key,
            company_id: companyID,
            ...(values.species_id !== undefined && { species_id: values.species_id })
        }

        const { data } = await conexionApi.post('/configuracion/production/updateAttributeSector', payload)
        if (data.code === 'ERROR') throw new Error(data.mensaje)
        delete payload.status
        delete payload.quantity_plants_ha
        return data.attribute || payload
    },
    remove: async (key) => {
        const { data } = await conexionApi.post('/configuracion/production/deleteAttributeSector', { id: key })
        if (data.code === 'ERROR') throw new Error(data.mensaje)
    }
})

// --- Botones personalizados ---
const customButtons = [
    'delete',
    {
        hint: 'Editar',
        icon: 'edit',
        onClick: (e) => {
            const grid = mainGridRef.value.instance;
            const rowIndex = grid.getRowIndexByKey(e.row.key);
            if (rowIndex >= 0) {
                grid.editRow(rowIndex);
            }
        },
        visible: (e) => {
            const seasons = e.component.option('columns')
                .find(c => c.dataField === 'season')?.lookup?.dataSource?.store || [];
            const season = seasons.find(s => Number(s.id) === Number(e.row.data.season));
            return season?.status === 1;
        }
    },
    {
        hint: 'Clonar',
        icon: 'copy',
        onClick: async (e) => {
            try {
                const key = e.row.key;
                const { data } = await conexionApi.post('/configuracion/production/cloneAttributesSector', { id: key });
                if (data.code === 'ERROR') throw new Error(data.mensaje);

                mainGridRef.value.instance.refresh();
            } catch (err) {
                console.error('Error clonando registro', err);
                alert('No se pudo clonar el registro.');
            }
        },
        visible: (e) => {
            const seasons = e.component.option('columns')
                .find(c => c.dataField === 'season')?.lookup?.dataSource?.store || [];
            const season = seasons.find(s => Number(s.id) === Number(e.row.data.season));
            return season?.status === 1; // Solo si la temporada está activa
        }
    },

]

</script>
