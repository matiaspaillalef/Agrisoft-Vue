<template>
  <!-- Title Header -->
  <div
    class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <Squares2X2Icon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Formatos de Cosecha</h1>
        <p class="text-slate-500 font-medium font-inter">Administración de formatos y pesos base de recolección</p>
      </div>
    </div>
  </div>

  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative text-[13px]!">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'"">
    <!-- Panel adaptable -->

    <DxColumnFixing :enabled="true" />
    <DxHeaderFilter :visible="true" :allow-search="true" />
    <DxScrolling column-rendering-mode="virtual" />

    <DxSearchPanel :visible="true" placeholder="Buscar..." />
    <DxPaging :page-size="15" />

    <DxColumn data-field="name" caption="Nombre" css-class="!text-left" alignment="right" />
    <DxColumn data-field="tara_base" caption="Tara Base" css-class="!text-left" alignment="right" />

    <DxColumn data-field="specie" caption="Especie" css-class="!text-left" alignment="right">
      <DxLookup :data-source="speciesDS" value-expr="id" display-expr="name" />
    </DxColumn>

    <DxColumn data-field="quantity_trays" caption="Cantidad" css-class="!text-left" alignment="right" />

    <DxColumn data-field="collection" caption="Recolección" css-class="!text-left" alignment="right">
      <DxLookup :data-source="collectionsDS" value-expr="id" display-expr="name" />
    </DxColumn>

    <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-center"
      alignment="right" :allow-filtering="false" />

    <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
    <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
      <DxPopup title="Gestión de Usuario" :show-title="true" :width="900" :height="350" />
      <DxForm>
        <DxItem data-field="name" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
        </DxItem>

        <DxItem data-field="tara_base" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'Tara base es obligatoria' }]" />
        </DxItem>

        <DxItem data-field="specie" caption="Especie" editor-type="dxSelectBox" :is-required="true" :editor-options="{
          dataSource: speciesDS,
          valueExpr: 'id',
          displayExpr: 'name',
          searchEnabled: true,
          placeholder: 'Seleccione especie'
        }" :validation-rules="[{ type: 'required', message: 'La especie es obligatoria' }]" />

        <DxItem data-field="quantity_trays" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'Cantidad es obligatoria' }]" />
        </DxItem>

        <DxItem data-field="collection" caption="Recolección" editor-type="dxSelectBox" :is-required="true"
          :editor-options="{
            dataSource: collectionsDS,
            valueExpr: 'id',
            displayExpr: 'name',
            searchEnabled: true,
            placeholder: 'Seleccione recolección'
          }" :validation-rules="[{ type: 'required', message: 'La recolección es obligatoria' }]" />

        <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :is-required="true" :editor-options="{
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
import { Squares2X2Icon } from '@heroicons/vue/24/solid'
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

const species = shallowRef([])
const collections = shallowRef([])

const loadSpecies = async () => {
  try {
    const { data } = await conexionApi.get('/configuracion/production/getSpecies/' + companyID)
    species.value = [...(data.species || [])]
  } catch (e) {
    console.error('Error cargando especies', e)
  }
}
loadSpecies()

const loadCollections = async () => {
  try {
    const { data } = await conexionApi.get('/configuracion/production/getCollectionType/' + companyID)
    collections.value = [...(data.collections || [])]
  } catch (e) {
    console.error('Error cargando tipos de recolección', e)
  }
}
loadCollections()

watch(species, () => {
  mainGridRef.value?.instance?.refresh()
})

watch(collections, () => {
  mainGridRef.value?.instance?.refresh()
})

const speciesDS = computed(() => ({
  store: species.value
}))

const collectionsDS = computed(() => ({
  store: collections.value
}))


const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/configuracion/production/getHarvestFormat/' + companyID)
      return data.formats
    } finally {
      loading.value = false
    }
  },

  insert: async (values) => {
    const payload = {
      ...values,
      species_id: values.species_id,
      status: values.status ?? 1,
      company_id: companyID
    }

    const { data } = await conexionApi.post('/configuracion/production/createHarvestFormat', payload)
    if (data.code === 'ERROR') throw new Error(data.mensaje)
    return data.format || payload
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

    const { data } = await conexionApi.post('/configuracion/production/updateHarvestFormat', payload)
    if (data.code === 'ERROR') throw new Error(data.mensaje)
    return data.format || payload
  },

  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/production/deleteHarvestFormat', { id: key })
    if (data.code === 'ERROR') throw new Error(data.mensaje)
  }
})

// --- Botones personalizados ---
const customButtons = [
  'edit',
  'delete',
]

</script>
