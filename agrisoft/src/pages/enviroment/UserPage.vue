<template>
  <!-- Title -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Usuarios</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Usuarios registrados en el sistema
      </p>
    </div>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-11/12 mx-auto relative">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'">
    <!-- Panel adaptable -->

    <DxColumnFixing :enabled="true" />
    <DxHeaderFilter :visible="true" :allow-search="true" />
    <DxScrolling column-rendering-mode="virtual" />

    <DxSearchPanel :visible="true" placeholder="Buscar..." />
    <DxPaging :page-size="15" />

    <DxColumn data-field="id" caption="ID" css-class="!text-left" :allow-filtering="false" />
    <DxColumn data-field="name" caption="Nombre" css-class="!text-left" alignment="right"/>
    <DxColumn data-field="lastname" caption="Apellido" css-class="!text-left" alignment="right"/>
    <DxColumn data-field="mail" caption="Email" css-class="!text-left" alignment="right"/>
    <DxColumn data-field="id_rol" caption="Rol" css-class="!text-left" alignment="right">
      <DxLookup :data-source="rolesDS" value-expr="id_rol" display-expr="descripcion" />
    </DxColumn>
    <DxColumn data-field="id_company" caption="Empresa" css-class="!text-left" alignment="right">
      <DxLookup :data-source="companiesDS" value-expr="id" display-expr="name_company" />
    </DxColumn>
    <DxColumn data-field="id_state" caption="" :cell-template="statusCellTemplate" css-class="!text-center" alignment="right" :allow-filtering="false"/>
    <DxColumn data-field="password" caption="Contraseña" css-class="!text-left" :visible="false" :allow-filtering="false"/>
    <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false"/>
    <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
      <DxPopup title="Gestión de Usuario" :show-title="true" :width="900" :height="450" />
      <DxForm>
        <DxItem data-field="name" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
        </DxItem>

        <DxItem data-field="lastname" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El apellido es obligatorio' }]" />
        </DxItem>

        <DxItem data-field="mail" :is-required="true">
          <DxSimpleItem :validation-rules="[
            { type: 'required', message: 'El email es obligatorio' },
            { type: 'custom', validationCallback: (e) => validarEmail(e.value), message: 'El email no es válido' }
          ]" />
        </DxItem>

        <DxItem data-field="id_rol" caption="Rol" editor-type="dxSelectBox" :editor-options="{
          dataSource: rolesDS,
          valueExpr: 'id_rol',
          displayExpr: 'descripcion',
          searchEnabled: true,
          placeholder: 'Seleccione rol'
        }" />

        <DxItem data-field="id_company" caption="Empresa" editor-type="dxSelectBox" :editor-options="{
          dataSource: companiesDS,
          valueExpr: 'id',
          displayExpr: 'name_company',
          searchEnabled: true,
          placeholder: 'Seleccione empresa'
        }" />

        <DxItem data-field="password" :is-required="true">
          <DxSimpleItem :validation-rules="[{ type: 'required', message: 'La contraseña es obligatoria' }]" />
        </DxItem>
        <DxItem data-field="id_state" caption="Estado" editor-type="dxSelectBox" :is-required="true" :editor-options="{
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
import { ref, computed, reactive, nextTick, watch, shallowRef } from 'vue'
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
import { statusCellTemplate, validarEmail } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0

const roles = shallowRef([])
const companies = shallowRef([])

const loadRoles = async () => {
  try {
    const { data } = await conexionApi.get('/configuracion/usuarios/getRoles')
    roles.value = [...(data.roles || [])] 
  } catch (e) {
    console.error('Error cargando roles', e)
  }
}
loadRoles()

const loadCompanies = async () => {
  try {
    const { data } = await conexionApi.get('/configuracion/empresas/getEmpresas')
    companies.value = [...(data.companies || [])]
  } catch (e) {
    console.error('Error cargando empresas', e)
  }
}
loadCompanies()

watch(roles, () => {
  mainGridRef.value?.instance?.refresh()
})

watch(companies, () => {
  mainGridRef.value?.instance?.refresh()
})

const rolesDS = computed(() => ({
  store: roles.value
}))

const companiesDS = computed(() => ({
  store: companies.value
}))

const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/configuracion/usuarios/getUsuarios')
      return data.usuarios || []
    } finally {
      loading.value = false
    }
  },
  insert: async (values) => {
    const payload = {
      ...values,
      id_state: values.id_state ?? 1,
      password: values.password || "",
    }
    const { data } = await conexionApi.post('/configuracion/usuarios/crearUsuarios', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data.usuario || payload // Devuelve la entidad creada
  },
  update: async (key, values) => {
    const instance = mainGridRef.value.instance;
    const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}
    const payload = { ...currentData, ...values, id: key }

    const { data } = await conexionApi.post('/configuracion/usuarios/actualizarUsuarios', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data.usuario || payload // Devuelve el objeto actualizado
  },
  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/usuarios/eliminarUsuarios', { id: key })
    if (data.code === "ERROR") throw new Error(data.mensaje)
  }
})

// --- Botones personalizados ---
const customButtons = [
  'edit',
  'delete',
]

</script>
