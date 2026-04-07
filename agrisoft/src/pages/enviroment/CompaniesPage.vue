<template>
  <!-- Title -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <BuildingOffice2Icon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Empresas</h1>
        <p class="text-slate-500 font-medium font-inter">Administración centralizada de empresas</p>
      </div>
    </div>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative">
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

  <!-- Modal de solo lectura Premium -->
  <Transition name="fade">
    <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[1000] p-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="closeModals"></div>

      <div
        class="bg-white dark:bg-navy-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 flex flex-col md:flex-row h-auto max-h-[90vh]">

        <!-- Sidebar decorativa / Logo -->
        <div
          class="w-full md:w-1/3 bg-slate-50 dark:bg-navy-900/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-navy-700">
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200">
            </div>
            <div
              class="relative w-32 h-32 bg-white dark:bg-navy-800 rounded-2xl shadow-inner flex items-center justify-center p-4 overflow-hidden border border-slate-200 dark:border-navy-700">
              <img :src="selectedItem?.logo || noFoundImg" alt="Logo" class="object-contain w-full h-full" />
            </div>
          </div>

          <h2 class="mt-6 text-xl font-bold text-navy-700 dark:text-white text-center leading-tight">
            {{ selectedItem?.name_company }}
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium tracking-wide uppercase">
            {{ selectedItem?.rut }}
          </p>

          <div class="mt-6">
            <span v-if="selectedItem?.status !== undefined"
              :class="`rounded-full ${getStatusMeta(selectedItem.status).bgColor} ${getStatusMeta(selectedItem.status).textColor} text-xs font-bold px-4 py-1.5 inline-flex items-center gap-2 border border-current/10 shadow-sm`">
              <span v-if="getStatusMeta(selectedItem.status).pulseColor"
                :class="`w-2 h-2 ${getStatusMeta(selectedItem.status).pulseColor} rounded-full animate-pulse`"></span>
              {{ getStatusMeta(selectedItem.status).text }}
            </span>
          </div>

          <div class="mt-auto hidden md:block w-full">
            <div class="p-4 bg-white/50 dark:bg-navy-800/50 rounded-xl border border-slate-100 dark:border-navy-700">
              <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Giro Comercial</p>
              <p class="text-xs text-navy-700 dark:text-slate-200 line-clamp-3 leading-relaxed">
                {{ selectedItem?.giro || 'No especificado' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="flex-1 flex flex-col min-h-0">
          <!-- Header interior -->
          <div class="px-8 pt-8 pb-4 flex justify-between items-center bg-white dark:bg-navy-800 sticky top-0 z-10">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="dx-icon-info text-brand-500"></i>
              Detalles de la Organización
            </h3>
            <button @click="closeModals"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors w-fit!">
              <i class="dx-icon-close text-xl text-brand-500 hover:text-brand-600"></i>
            </button>
          </div>

          <!-- Scroll Area -->
          <div class="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

              <!-- Sección General -->
              <div class="space-y-6">
                <div>
                  <h4 class="text-xs font-bold text-brand-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    Información General
                  </h4>
                  <div class="space-y-4">
                    <div class="flex items-start gap-3">
                      <div
                        class="p-2 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-navy-700">
                        <i class="dx-icon-globe text-slate-400 text-sm"></i>
                      </div>
                      <div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sitio Web</p>
                        <a :href="selectedItem?.web" target="_blank"
                          class="text-sm text-brand-500 hover:underline truncate block max-w-[150px]">
                          {{ selectedItem?.web || 'N/A' }}
                        </a>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div
                        class="p-2 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-navy-700">
                        <i class="dx-icon-tel text-slate-400 text-sm"></i>
                      </div>
                      <div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Teléfono Principal
                        </p>
                        <p class="text-sm text-navy-700 dark:text-slate-200">{{ selectedItem?.phone || 'N/A' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-xs font-bold text-brand-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    Ubicación y Entidad
                  </h4>
                  <div class="space-y-4">
                    <div class="flex items-start gap-3">
                      <div
                        class="p-2 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-navy-700">
                        <i class="dx-icon-map text-slate-400 text-sm"></i>
                      </div>
                      <div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Dirección</p>
                        <p class="text-sm text-navy-700 dark:text-slate-200 leading-snug">
                          {{ selectedItem?.address || 'N/A' }}, {{ selectedItem?.city }},
                          {{ getRegionName(selectedItem?.state) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div
                        class="p-2 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-navy-700">
                        <i class="dx-icon-home text-slate-400 text-sm"></i>
                      </div>
                      <div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Caja de Compensación
                        </p>
                        <p class="text-sm text-navy-700 dark:text-slate-200">
                          {{ getCompensationBoxName(selectedItem?.compensation_box) || 'No asignada' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Representantes -->
              <div class="space-y-8">
                <!-- Legal -->
                <div
                  class="p-5 rounded-2xl bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                  <h4
                    class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i class="dx-icon-user text-sm"></i>
                    Rep. Legal
                  </h4>
                  <div class="space-y-3">
                    <p class="text-sm font-semibold text-navy-700 dark:text-white leading-tight">
                      {{ selectedItem?.legal_representative_name || 'N/A' }}
                    </p>
                    <div class="grid grid-cols-1 gap-2 text-[13px]">
                      <div class="flex justify-between border-b border-slate-200/50 dark:border-navy-700 pb-1">
                        <span class="text-slate-400">RUT</span>
                        <span
                          class="text-navy-700 dark:text-slate-300 font-medium">{{ selectedItem?.legal_representative_rut || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between border-b border-slate-200/50 dark:border-navy-700 pb-1">
                        <span class="text-slate-400">Email</span>
                        <span
                          class="text-navy-700 dark:text-slate-300 font-medium truncate ml-4">{{ selectedItem?.legal_representative_email || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sistema -->
                <div
                  class="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10">
                  <h4
                    class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i class="dx-icon-preferences text-sm"></i>
                    Rep. Sistema
                  </h4>
                  <div class="space-y-3">
                    <p class="text-sm font-semibold text-navy-700 dark:text-white leading-tight">
                      {{ selectedItem?.system_representative_name || 'N/A' }}
                    </p>
                    <div class="grid grid-cols-1 gap-2 text-[13px]">
                      <div class="flex justify-between border-b border-white/20 dark:border-navy-700 pb-1">
                        <span class="text-slate-400">Email</span>
                        <span
                          class="text-navy-700 dark:text-slate-300 font-medium truncate ml-4">{{ selectedItem?.system_representative_email || 'N/A' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Teléfono</span>
                        <span
                          class="text-navy-700 dark:text-slate-300 font-medium">{{ selectedItem?.system_representative_phone || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer Action -->
          <div
            class="px-8 py-6 bg-slate-50/80 dark:bg-navy-900 shadow-[0_-1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_0_rgba(255,255,255,0.05)] flex justify-end">
            <button @click="closeModals"
              class="px-6 py-2 bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-700 transition-all shadow-sm">
              Cerrar Vista
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1e293b;
}
</style>

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

import { BuildingOffice2Icon } from '@heroicons/vue/24/outline'

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
