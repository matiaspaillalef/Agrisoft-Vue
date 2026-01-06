<template>

  <!-- Title Page -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Bodegas</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Administra y controla las bodegas.</p>
    </div>
  </div>
  <div
    class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl bg-white dark:bg-gray-200 py-6 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2 px-2 md:px-10 max-w-11/12 mx-auto">
    <div class="warehouses">

      <div class="datagrid-container">
        <DxDataGrid :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
          :column-hiding-enabled="true" :width="'100%'" @editing-start="onEditingStart" @init-new-row="onInitNewRow"
          @saving="onSaving" ref="mainGridRef">

     <DxLoadPanel
     v-model:visible="loading"
      :enabled="true"
      :showPane="true"
      :indicator-src="logoGif"
      shading-color="transparent"
      :height="'100%'"
      :width="'100%'"
      class="custom-loadpanel"
    />

          <!-- Panel adaptable -->
          <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
          <DxColumnFixing :enabled="true" />
          <DxScrolling column-rendering-mode="virtual" />

          <!-- Buscador -->
          <DxSearchPanel :visible="true" :highlight-case-sensitive="true" placeholder="Buscar..." width="100%" />

          <!-- Paginación -->
          <DxPaging v-if="paginacion" :page-size="15" :page-index="0" />
          <DxFilterRow :visible="false" />

          <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
            :texts="{
              confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?',
            }">
            <DxPopup title="Gestión de Bodegas" :show-title="true" :width="600" :height="600" />

            <DxForm>
              <DxItem data-field="name" caption="Nombre" />

              <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :editor-options="{
                dataSource: [
                  { id: 1, text: 'Activa' },
                  { id: 0, text: 'Inactiva' }
                ],
                valueExpr: 'id',
                displayExpr: 'text'
              }" />
              <DxItem data-field="__usersDirty" :visible="false" />
              <!-- 👤 RESPONSABLES -->
              <DxItem item-type="simple" caption="Responsables" :col-span="2">
                <template #default>
                  <DxDataGrid ref="usersGridRef" :data-source="users" key-expr="id" height="320" :show-borders="true"
                    @content-ready="onUsersGridReady" @selection-changed="onUsersSelectionChanged">
                    <!-- ✔ CHECKBOXES -->
                    <DxSelection mode="multiple" show-check-boxes-mode="always" select-all-mode="page" />
                    <!-- ✔ SCROLL CON CABECERA FIJA -->
                    <DxSearchPanel :visible="true" placeholder="Buscar usuario..." />
                    <DxScrolling mode="standard" show-scrollbar="always" />
                    <DxColumn data-field="name" caption="Nombre" css-class="!text-left" />
                    <DxColumn data-field="lastname" caption="Apellido" css-class="!text-left" />
                    <DxColumn data-field="mail" caption="Email" css-class="!text-left" />

                  </DxDataGrid>
                </template>
              </DxItem>
            </DxForm>
          </DxEditing>

          <DxColumn data-field="name" caption="Nombre" css-class="!text-left" />

          <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-left" />

          <!-- 🔢 CANTIDAD DE RESPONSABLES -->
          <DxColumn data-field="users" caption="Responsables" :calculate-cell-value="usersLabel"
            css-class="!text-left" />
        </DxDataGrid>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  DxPopup,
  DxForm,
  DxItem,
  DxSearchPanel,
  DxSelection,
  DxFilterRow,
  DxLoadPanel
} from 'devextreme-vue/data-grid'


import { loadMessages, locale } from 'devextreme/localization'
import axios from 'axios'
import { ref, computed } from 'vue'
import conexionApi from '@/services/conexionApi.js'

import { statusCellTemplate } from '@/utils/herlpers'
import logoGif from '@/assets/img/agrisoft_logo.png'
const loading = ref(true) 

loadMessages({
  es: {
    // Popup edición DataGrid
    'dxDataGrid-editingSaveRowChanges': 'Guardar',
    'dxDataGrid-editingCancelRowChanges': 'Cancelar',

    // Confirmación eliminar
    'dxDataGrid-editingConfirmDeleteMessage':
      '¿Está seguro que desea eliminar este registro?',

    'dxDataGrid-columnChooserTitle': 'Seleccionar columnas',
    'dxDataGrid-columnChooserCancel': 'Cerrar',
    'dxDataGrid-columnChooserEmptyText': 'No hay columnas para mostrar',
    Yes: 'Sí',
    No: 'No',
    Save: 'Guardar',
    Cancel: 'Cancelar',
    Loading: 'Cargando...',
  },
})
locale('es')

const rolID = Number(localStorage.getItem('rol')) || ''
let companyID = Number(localStorage.getItem('userIdCompany')) || ''

/* =========================
   USUARIOS (RESPONSABLES)
========================= */
const users = ref([])
const usersGridRef = ref(null)
const formData = ref(null)
const mainGridRef = ref(null)
const isPreselectingUsers = ref(false)

const onEditingStart = (e) => {
  if (!Array.isArray(e.data.users)) {
    e.data.users = []
  }

  formData.value = e.data
}

const onInitNewRow = (e) => {
  e.data.users = []
  e.data.status = 1
  formData.value = e.data

  setTimeout(() => {
    usersGridRef.value?.instance.clearSelection()
  })
}

const loadUsers = async () => {
  try {
    const { data } = await conexionApi.get(
      `/configuracion/usuarios/${companyID}`
    )
    users.value = data.usuarios
  } catch (error) {
    console.error('Error cargando usuarios', error)
  }
}

loadUsers()

const userEditorOptions = computed(() => ({
  dataSource: users.value,
  valueExpr: 'id',
  displayExpr: item =>
    item ? `${item.name} ${item.lastname}` : '',
  showSelectionControls: true,
  searchEnabled: true,
  applyValueMode: 'useButtons',
  multiline: true
}))

/* =========================
   LABEL COLUMNA
========================= */
const usersLabel = row => {
  const count = row.users?.length || 0
  if (!count) return '-'
  if (count === 1) return '1 responsable'
  return `${count} responsables`
}

/* =========================
   DATA SOURCE
========================= */
const dataSource = new CustomStore({
  key: 'id',

  load: async () => {
    const { data } = await conexionApi.get('/warehouses/getWarehouses/' + companyID)
    //return data.warehouses
    return data.warehouses.map(w => ({
      ...w,
      users: Array.isArray(w.users) ? w.users : []
    }))
  },

  insert: async values => {
    values.idCompany = companyID
    values.users = values.users ?? []

    const { data } = await conexionApi.post(
      '/warehouses/createWarehouse',
      values
    )

    return { id: data.id, ...values }
  },

  update: async (id, values) => {
    await conexionApi.put(`/warehouses/${id}`, values)
  },

  remove: async id => {
    console.log('DELETE:', id)
    //await conexionApi.post('/warehouses/deleteWarehouse', { id })
    await conexionApi.delete('/warehouses/' + id);
  }
})

const onUsersSelectionChanged = (e) => {
  if (!formData.value) return
  if (isPreselectingUsers.value) return

  formData.value.users = e.selectedRowKeys

  const grid = mainGridRef.value?.instance
  if (!grid) return

  // SOLO FORZAR CAMBIO SI ES UPDATE
  if (formData.value.id) {
    grid.option('editing.changes', [{
      key: formData.value.id,
      type: 'update',
      data: {}
    }])

  }
}

const onSaving = (e) => {
  if (!e.changes.length) return

  const change = e.changes[0]

  if (change.type === 'insert') {
    change.data.users = [...(formData.value?.users || [])]
    console.log('🆕 INSERT USERS:', change.data.users)
  }

  if (change.type === 'update') {
    change.data.users = [...(formData.value?.users || [])]
  }
}

const onUsersGridReady = () => {
  const grid = usersGridRef.value?.instance
  if (!grid || !formData.value) return

  const selectedUsers = Array.isArray(formData.value.users)
    ? [...formData.value.users]
    : []

  isPreselectingUsers.value = true

  grid.clearSelection()
  grid.selectRows(selectedUsers, false)

  // dejar pasar el render
  setTimeout(() => {
    isPreselectingUsers.value = false
  }, 0)
}




</script>
