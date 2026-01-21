<template>
  <!-- Title -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Empresas</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Empresas registradas en el sistema
      </p>
    </div>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto">
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'" @editing-start="onEditingStart" @editor-preparing="onEditorPreparing">
      <!-- LOADER -->
      <DxLoadPanel v-model:visible="loading" :enabled="true" :showPane="true" :indicator-src="logoGif"
        shading-color="transparent" :height="'100%'" :width="'100%'" class="custom-loadpanel" />
      <!-- Panel adaptable -->
      <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
      <DxColumnFixing :enabled="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxPaging :page-size="15" />
      <DxColumn data-field="id" caption="ID" css-class="!text-left" />
      <DxColumn data-field="name" caption="Nombre" css-class="!text-left" />
      <DxColumn data-field="state" caption="Región" :set-cell-value="setStateValue">
        <DxLookup :data-source="StateCL" display-expr="region" value-expr="region_number" />
      </DxColumn>
      <DxColumn data-field="city" caption="Ciudad" />
      <DxColumn data-field="address" caption="Dirección" css-class="!text-left" />
      <DxColumn data-field="zone" caption="Zona" css-class="!text-left" />
      <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center" />

      <DxColumn type="buttons" width="140" :buttons="customButtons" />

      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
        <DxPopup title="Gestión de Campo" :show-title="true" :width="900" :height="450" />

        <DxForm :col-count="2">
          <DxItem data-field="name" caption="Nombre"
            :validation-rules="[{ type: 'required', message: 'El nombre del campo es obligatorio' }]" />

          <DxItem data-field="state" caption="Región"
            :validation-rules="[{ type: 'required', message: 'La región es obligatoria' }]" />

          <DxItem data-field="city" caption="Ciudad" editor-type="dxSelectBox"
            :validation-rules="[{ type: 'required', message: 'La ciudad es obligatoria' }]" />

          <DxItem data-field="zone" caption="Zona" editor-type="dxSelectBox" :editor-options="{
            dataSource: [
              { id: 'Norte', text: 'Norte' },
              { id: 'Centro', text: 'Centro' },
              { id: 'Sur', text: 'Sur' }
            ],
            valueExpr: 'id',
            displayExpr: 'text'
          }" :validation-rules="[{ type: 'required', message: 'La Zona es obligatoria' }]" />

          <DxItem data-field="address" caption="Dirección Completa" :col-span="2"
            :validation-rules="[{ type: 'required', message: 'La dirección es obligatoria' }]" />

          <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :editor-options="{
            dataSource: [
              { id: '1', text: 'Activa' },
              { id: '0', text: 'Inactiva' }
            ],
            valueExpr: 'id',
            displayExpr: 'text'
          }" :validation-rules="[{ type: 'required', message: 'El estado es obligatorio' }]" />

        </DxForm>
      </DxEditing>
    </DxDataGrid>
  </div>
</template>


<script setup>
import { ref } from 'vue'
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
  DxLoadPanel
} from 'devextreme-vue/data-grid'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate } from '@/utils/herlpers'

import { StateCL } from '@/utils/dataState.js'


const loading = ref(false)
const mainGridRef = ref(null)
const cityOptions = ref([])
const cityEditorKey = ref(0)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0
const canEdit = [1, 8].includes(userRol)

const onEditingStart = (e) => {
  const regionEncontrada = StateCL.find(
    r => r.region_number === e.data.state
  )

  if (!regionEncontrada) return
  cityOptions.value = regionEncontrada.comunas
  cityEditorKey.value++

  e.data.state = regionEncontrada.region_number
  const ciudadExiste = regionEncontrada.comunas
    .some(c => c.name === e.data.city)

  e.data.city = ciudadExiste ? e.data.city : null

  if (e.data.compensation_box) { e.data.compensation_box = Number(e.data.compensation_box); }
}


const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    const { data } = await conexionApi.get('/configuracion/production/getGround/' + companyID)
    return data.grounds || []
  },
  insert: async (values) => {
    const payload = { ...values, status: values.status ?? 1, company_id: companyID };
    const { data } = await conexionApi.post('/configuracion/production/createGround', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
  },
  update: async (key, values) => {
    const instance = mainGridRef.value.instance;
    const currentData = instance.getVisibleRows().find(r => r.key === key).data;

    if (values.state) {
      const rObj = StateCL.find(r => r.region === values.state);
      if (rObj) values.state = rObj.region_number;
    }

    const payload = { ...currentData, ...values, id: key };

    const { data } = await conexionApi.post('/configuracion/production/updateGround', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
  },
  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/production/deleteGround', { id: key })
    if (data.code === "ERROR") throw new Error(data.mensaje)
  }
})

const setStateValue = (newData, value) => {
  newData.state = value;
  newData.city = null;
};

const onEditorPreparing = (e) => {
  if (e.parentType === 'dataRow' && e.dataField === 'city') {
    const regionNumber = e.row.data.state;

    const regionData = StateCL.find(r => r.region_number === regionNumber);

    e.editorOptions.dataSource = regionData ? regionData.comunas : [];

    e.editorOptions.disabled = !regionNumber;
    e.editorOptions.placeholder = regionNumber ? 'Seleccione ciudad' : 'Seleccione región primero';

    e.editorOptions.displayExpr = 'name';
    e.editorOptions.valueExpr = 'name';
  }
};

// --- Botones personalizados ---
const customButtons = [
  'edit',
  'delete',
]

</script>
