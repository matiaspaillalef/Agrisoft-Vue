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
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto relative">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'" @editing-start="onEditingStart" @editor-preparing="onEditorPreparing">
      <!-- Panel adaptable -->
      <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
      <DxColumnFixing :enabled="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxPaging :page-size="15" />

      <DxColumn data-field="name_company" caption="Nombre de la Empresa" css-class="!text-left" />
      <DxColumn data-field="rut" caption="RUT" css-class="!text-left" />
      <DxColumn data-field="state" caption="Región" :set-cell-value="setStateValue">
        <DxLookup :data-source="StateCL" display-expr="region" value-expr="region_number" />
      </DxColumn>
      <DxColumn data-field="city" caption="Ciudad" />
      <DxColumn data-field="phone" caption="Teléfono" css-class="!text-left" />
      <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center" />

      <!-- Columnas Ocultas -->
      <DxColumn data-field="giro" caption="Giro" css-class="!text-left" :visible="false" />
      <DxColumn data-field="web" caption="Sitio Web" css-class="!text-left" :visible="false" />
      <DxColumn data-field="compensation_box" caption="Caja Compensación" css-class="!text-left" :visible="false" />
      <DxColumn data-field="address" caption="Dirección" css-class="!text-left" :visible="false" />
      <DxColumn data-field="legal_representative_name" caption="Nombre Rep. Legal" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="legal_representative_rut" caption="RUT Rep. Legal" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="legal_representative_phone" caption="Teléfono Rep. Legal" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="legal_representative_email" caption="Email Rep. Legal" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="system_representative_name" caption="Nombre Rep. Sistema" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="system_representative_rut" caption="RUT Rep. Sistema" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="system_representative_phone" caption="Teléfono Rep. Sistema" css-class="!text-left"
        :visible="false" />
      <DxColumn data-field="system_representative_email" caption="Email Rep. Sistema" css-class="!text-left"
        :visible="false" />

      <DxColumn type="buttons" width="140" :buttons="customButtons" />

      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
        <DxPopup title="Gestión de Empresa" :show-title="true" :width="900" :height="750" />

        <DxForm :col-count="2">

          <!-- ================= INFO CORPORATIVA ================= -->
          <DxSimpleItem item-type="group" caption="Información Corporativa" :col-span="2" :col-count="2">
            <DxItem data-field="name_company" caption="Razón Social"
              :validation-rules="[{ type: 'required', message: 'La razón social es obligatoria' }]" />

            <DxItem data-field="rut" caption="RUT Empresa" editor-type="dxTextBox" :editor-options="{
              valueChangeEvent: 'input',
              onInput(e) {
                const formatted = formatearRutConPuntos(e.event.target.value)
                e.component.option('value', formatted)
                const form = e.component.option('form')
                form?.updateData('rut', formatted)
              }
            }" :validation-rules="[
        { type: 'required', message: 'El RUT es obligatorio' },
        {
          type: 'custom',
          message: 'RUT chileno inválido',
          validationCallback: (e) => validarRutChileno(e.value)
        }
      ]" />

            <DxItem data-field="giro" caption="Giro"
              :validation-rules="[{ type: 'required', message: 'El giro es obligatorio' }]" />

            <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :editor-options="{
              dataSource: [
                { id: 1, text: 'Activa' },
                { id: 0, text: 'Inactiva' }
              ],
              valueExpr: 'id',
              displayExpr: 'text'
            }" :validation-rules="[{ type: 'required', message: 'El estado es obligatorio' }]" />

            <DxItem data-field="web" caption="Sitio Web" :validation-rules="[
              { type: 'required', message: 'El sitio web es obligatorio' },
              {
                type: 'custom',
                message: 'URL inválida (ej: https://empresa.cl)',
                validationCallback: (e) => validarURL(e.value)
              }
            ]" />

            <DxItem data-field="compensation_box" caption="Caja Compensación" editor-type="dxSelectBox" :editor-options="{
              dataSource: ProvitionalCL,
              displayExpr: 'name',
              valueExpr: 'id',
              searchEnabled: true,
              noDataText: 'No hay opciones'
            }" :validation-rules="[{ type: 'required', message: 'Debe seleccionar una caja de compensación' }]" />
          </DxSimpleItem>

          <!-- ================= UBICACIÓN ================= -->
          <DxSimpleItem item-type="group" caption="Ubicación y Contacto" :col-span="2" :col-count="2">
            <DxItem data-field="state" caption="Región"
              :validation-rules="[{ type: 'required', message: 'La región es obligatoria' }]" />

            <DxItem data-field="city" caption="Ciudad" editor-type="dxSelectBox"
              :validation-rules="[{ type: 'required', message: 'La ciudad es obligatoria' }]" />

            <DxItem data-field="address" caption="Dirección Completa" :col-span="2"
              :validation-rules="[{ type: 'required', message: 'La dirección es obligatoria' }]" />

            <DxItem data-field="phone" caption="Teléfono Contacto" :validation-rules="[
              { type: 'required', message: 'El teléfono es obligatorio' },
              {
                type: 'custom',
                message: 'Debe contener 9 dígitos numéricos',
                validationCallback: (e) => validarTelefonoCL(e.value)
              }
            ]" />
          </DxSimpleItem>

          <!-- ================= REPRESENTANTE LEGAL ================= -->
          <DxSimpleItem item-type="group" caption="Representante Legal" :col-span="1" :col-count="1">
            <DxItem data-field="legal_representative_name" caption="Nombre"
              :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />

            <DxItem data-field="legal_representative_rut" caption="RUT" editor-type="dxTextBox" :editor-options="{
              valueChangeEvent: 'input',
              onInput(e) {
                const formatted = formatearRutConPuntos(e.event.target.value)
                e.component.option('value', formatted)
                const form = e.component.option('form')
                form?.updateData('legal_representative_rut', formatted)
              }
            }" :validation-rules="[
        { type: 'required', message: 'El RUT es obligatorio' },
        {
          type: 'custom',
          message: 'RUT chileno inválido',
          validationCallback: (e) => validarRutChileno(e.value)
        }
      ]" />

            <DxItem data-field="legal_representative_phone" caption="Teléfono" :validation-rules="[
              { type: 'required', message: 'El teléfono es obligatorio' },
              {
                type: 'custom',
                message: 'Debe contener 9 dígitos, solo números',
                validationCallback: (e) => validarTelefonoCL(e.value)
              }
            ]" />

            <DxItem data-field="legal_representative_email" caption="Email" :validation-rules="[
              { type: 'required', message: 'El email es obligatorio' },
              {
                type: 'custom',
                message: 'Email inválido',
                validationCallback: (e) => validarEmail(e.value)
              }
            ]" />
          </DxSimpleItem>

          <!-- ================= REPRESENTANTE SISTEMA ================= -->
          <DxSimpleItem item-type="group" caption="Representante de Sistema" :col-span="1" :col-count="1">
            <DxItem data-field="system_representative_name" caption="Nombre"
              :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />

            <DxItem data-field="system_representative_rut" caption="RUT" editor-type="dxTextBox" :editor-options="{
              valueChangeEvent: 'input',
              onInput(e) {
                const formatted = formatearRutConPuntos(e.event.target.value)
                e.component.option('value', formatted)
                const form = e.component.option('form')
                form?.updateData('system_representative_rut', formatted)
              }
            }" :validation-rules="[
        { type: 'required', message: 'El RUT es obligatorio' },
        {
          type: 'custom',
          message: 'RUT chileno inválido',
          validationCallback: (e) => validarRutChileno(e.value)
        }
      ]" />

            <DxItem data-field="system_representative_phone" caption="Teléfono" :validation-rules="[
              { type: 'required', message: 'El teléfono es obligatorio' },
              {
                type: 'custom',
                message: 'Debe contener 9 dígitos, solo números',
                validationCallback: (e) => validarTelefonoCL(e.value)
              }
            ]" />

            <DxItem data-field="system_representative_email" caption="Email" :validation-rules="[
              { type: 'required', message: 'El email es obligatorio' },
              {
                type: 'custom',
                message: 'Email inválido',
                validationCallback: (e) => validarEmail(e.value)
              }
            ]" />
          </DxSimpleItem>
        </DxForm>

      </DxEditing>


    </DxDataGrid>
  </div>

  <!-- Modal de solo lectura con Tailwind -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
    <!-- Fondo oscuro -->
    <div class="fixed inset-0 bg-[#0000003d] bg-opacity-50" @click="closeModals"></div>

    <!-- Contenedor del modal -->
    <div
      class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-lg mx-auto">
      <h2 class="text-xl mb-4">
        Detalles de la Empresa
        <span class="font-bold rounded-sm">
          {{ selectedItem?.name_company || 'N/A' }}
        </span>
      </h2>
      <div class="max-h-96 overflow-y-scroll pr-2">
        <div class="space-y-2">
          <div
            class="w-24 h-24 rounded-md overflow-hidden mb-2 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center p-2">
            <img :src="selectedItem?.logo || noFoundImg" alt="Logo Empresa" class="object-contain w-full h-full" />
          </div>

          <p class="text-sm flex items-center gap-2">
            <span v-if="selectedItem?.status !== undefined"
              :class="`rounded-full ${getStatusMeta(selectedItem.status).bgColor} ${getStatusMeta(selectedItem.status).textColor} font-[400] px-3 h-[23px] inline-flex items-center w-[120px] justify-center gap-1 border border-gray-100`">
              <span v-if="getStatusMeta(selectedItem.status).pulseColor"
                :class="`w-[10px] h-[10px] ${getStatusMeta(selectedItem.status).pulseColor} rounded-full animate-pulse`"></span>

              <span>{{ getStatusMeta(selectedItem.status).text }}</span>
            </span>
          </p>
          <p class="text-sm">
            <strong>RUT</strong>: {{ selectedItem?.rut || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Giro Comercial:</strong> {{ selectedItem?.giro || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Teléfono:</strong> {{ selectedItem?.phone || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Web:</strong> {{ selectedItem?.web || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Dirección:</strong> {{ selectedItem?.address || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Ciudad:</strong> {{ selectedItem?.city || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Región:</strong> {{ getRegionName(selectedItem?.state) || 'N/A' }}
          </p>

          <p class="text-sm">
            <strong>Caja de Compensación:</strong> {{ getCompensationBoxName(selectedItem?.compensation_box) || 'N/A' }}
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="mt-4 mb-3 font-bold">Representante Legal</h3>
          <p class="text-sm">
            <strong>Nombre:</strong> {{ selectedItem?.legal_representative_name || 'N/A' }}
          </p>
          <p class="text-sm">
            <strong>RUT:</strong> {{ selectedItem?.legal_representative_rut || 'N/A' }}
          </p>
          <p class="text-sm">
            <strong>Teléfono:</strong> {{ selectedItem?.legal_representative_phone || 'N/A' }}
          </p>
          <p class="text-sm">
            <strong>Email:</strong> {{ selectedItem?.legal_representative_email || 'N/A' }}
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="mt-4 mb-3 font-bold">Representante del Sistema</h3>
          <p class="text-sm">
            <strong>Nombre:</strong> {{ selectedItem?.system_representative_name || 'N/A' }}
          </p>
          <p class="text-sm">
            <strong>RUT:</strong> {{ selectedItem?.system_representative_rut || 'N/A' }}
          </p>
          <p class="text-sm">
            <strong>Teléfono:</strong> {{ selectedItem?.system_representative_phone || 'N/A' }}
          </p>
          <p class="text-sm">
            <strong>Email:</strong> {{ selectedItem?.system_representative_email || 'N/A' }}
          </p>
        </div>
      </div>
      <!-- Botón cerrar -->
      <button @click="closeModals" class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">
        Cerrar
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, reactive } from 'vue'
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
  DxFilterRow
} from 'devextreme-vue/data-grid'

// FORM
import {
  DxSimpleItem
} from 'devextreme-vue/form'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, getStatusMeta, getCompensationBoxName, getRegionName, validarRutChileno, formatearRutConPuntos, validarEmail, validarTelefonoCL, validarURL } from '@/utils/herlpers'

import { StateCL } from '@/utils/dataState.js'
import { ProvitionalCL } from '@/utils/dataProvitionals'

import noFoundImg from '@/assets/img/nofound.svg'

const loading = ref(false)
const mainGridRef = ref(null)
const cityOptions = ref([])
const cityEditorKey = ref(0)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0
const canEdit = [1, 8].includes(userRol)

const showViewModal = ref(false)
const selectedItem = ref(null)

function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

function closeModals() {
  showViewModal.value = false
}


const formState = reactive({
  selectedRegion: null
})

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
    const { data } = await conexionApi.get('/configuracion/empresas/getEmpresas')
    return data.companies || []
  },
  insert: async (values) => {
    const payload = { ...values, status: values.status ?? 1, logo: "" };
    console.log(payload);
    const { data } = await conexionApi.post('/configuracion/empresas/createCompany', payload)
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

    const { data } = await conexionApi.post('/configuracion/empresas/updateCompany', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
  },
  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/empresas/deleteCompany', { id: key })
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
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: (e) => verRegistro(e.row.data),
  },
  'edit',
  'delete',
]

</script>
