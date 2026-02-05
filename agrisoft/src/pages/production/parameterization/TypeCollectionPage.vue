<template>
  <!-- Title -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Tipo de recolección</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Tipos de recolección registrados en el sistema
      </p>
    </div>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto">
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'"">
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

    <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center"
      alignment="right" :allow-filtering="false" />

    <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
    <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
      <DxPopup title="Gestión de Tipo de Recolección" :show-title="true" :width="900" :height="350" />
      <DxForm>
        <DxItem data-field="name" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
        </DxItem>

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
      const { data } = await conexionApi.get('/configuracion/production/getCollectionType/' + companyID)
      return (data.collections || []).map(r => ({
        ...r,
        status: Number(r.status),
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

    const { data } = await conexionApi.post('/configuracion/production/createCollectionType', payload)
    if (data.code === 'ERROR') throw new Error(data.mensaje)
    return data.collection || payload
  },
  update: async (key, values) => {
    const instance = mainGridRef.value.instance
    const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}

    const payload = {
      ...currentData,
      ...values,
      id: key,
      company_id: companyID
    }

    const { data } = await conexionApi.post('/configuracion/production/updateCollectionType', payload)
    if (data.code === 'ERROR') throw new Error(data.mensaje)
    return data.collection || payload
  },

  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/production/deleteCollectionType', { id: key })
    if (data.code === 'ERROR') throw new Error(data.mensaje)
  }
})

// --- Botones personalizados ---
const customButtons = [
  'edit',
  'delete',
]

</script>
