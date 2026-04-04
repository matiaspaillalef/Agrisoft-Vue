<template>

  <!-- Title Page -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <BuildingStorefrontIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Bodegas</h1>
        <p class="text-slate-500 font-medium font-inter">Administración centralizada de bodegas y centros de
          distribución</p>
      </div>
    </div>
  </div>
  <div
    class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl bg-white dark:bg-gray-200 py-6 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2 px-2 md:px-10 max-w-full mx-auto">
    <div class="warehouses">

      <div class="datagrid-container">
        <DxDataGrid :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
          :column-hiding-enabled="true" :width="'100%'" @editing-start="onEditingStart" @init-new-row="onInitNewRow"
          @saving="onSaving" ref="mainGridRef" @cell-prepared="onCellPrepared">

          <DxLoadPanel v-model:visible="loading" :enabled="true" :showPane="true" :indicator-src="logoGif"
            shading-color="transparent" :height="'100%'" :width="'100%'" class="custom-loadpanel" />

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
              <DxItem data-field="is_distribution" caption="¿Bodega de distribución?" editor-type="dxCheckBox"
                :col-span="2" css-class="custom-distribution-item" :editor-options="{
                  text: 'Marcar como centro de distribución principal, sólo 1 bodega puede ser la principal, si marca esta opción en otra bodega, se desmarcará automáticamente en la anterior.',
                }" />
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
          <template #distributionTemplate="{ data }">
            <div v-if="data.value === 1 || data.value === true"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              <i class="fas fa-star mr-1 text-blue-500"></i> Principal
            </div>
            <span v-else class="text-gray-400 text-xs">-</span>
          </template>
          <DxColumn data-field="is_distribution" caption="¿Bodega de distribución?" :visible="false" />

          <!-- 🔢 CANTIDAD DE RESPONSABLES -->
          <DxColumn data-field="users" caption="Responsables" :calculate-cell-value="usersLabel"
            css-class="!text-left" />
        </DxDataGrid>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BuildingStorefrontIcon } from '@heroicons/vue/24/solid'
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
const allWarehouses = ref([]);

const onEditingStart = (e) => {
  if (!Array.isArray(e.data.users)) {
    e.data.users = []
  }

  formData.value = e.data
}

const onInitNewRow = (e) => {
  e.data.users = []
  e.data.status = 1
  e.data.is_distribution = false
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
    loading.value = true;
    const { data } = await conexionApi.get('/warehouses/getWarehouses/' + companyID)
    const result = data.warehouses.map(w => ({
      ...w,
      users: Array.isArray(w.users) ? w.users : []
    }))

    allWarehouses.value = result; // <--- GUARDAMOS LOS DATOS AQUÍ
    loading.value = false;
    return result;
  },

  insert: async values => {
    values.idCompany = companyID; // Aseguramos que viaje el ID de empresa
    values.users = values.users ?? [];

    // Si el check viene como undefined por alguna razón, enviamos 0
    values.is_distribution = values.is_distribution ? 1 : 0;

    const { data } = await conexionApi.post(
      '/warehouses/createWarehouse',
      values
    );

    return { id: data.id, ...values };
  },

  update: async (id, values) => {
    // Agregamos idCompany para que el backend pueda resetear las otras bodegas
    const payload = { ...values, idCompany: companyID };
    await conexionApi.put(`/warehouses/${id}`, payload);

    // Opcional: Recargar el grid para actualizar allWarehouses
    mainGridRef.value?.instance.refresh();
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

const onRowPrepared = (e) => {
  if (e.rowType === 'data' && (e.data.is_distribution === 1 || e.data.is_distribution === true)) {
    // Aplicamos un estilo directo o una clase
    e.rowElement.style.backgroundColor = '#cddc39';
    e.rowElement.style.fontWeight = '700';
  }
}

const onCellPrepared = (e) => {

  if (e.rowType === 'data' && (e.data.is_distribution === 1 || e.data.is_distribution === true)) {


    //e.cellElement.style.backgroundColor = '#cddc39';
    //e.cellElement.style.color = '#1a1a1a';
    //e.cellElement.style.fontWeight = '700';

    // 2. Obtener todas las columnas visibles para identificar extremos
    const visibleColumns = e.component.getVisibleColumns();
    const isFirstClickableColumn = e.column.index === visibleColumns[0].index;
    const isLastClickableColumn = e.column.index === visibleColumns[visibleColumns.length - 2].index;

    // 3. Aplicar border-radius condicional
    if (isFirstClickableColumn) {
      e.cellElement.classList.add('row-distribucion-first');
      e.cellElement.style.borderRadius = '5px 0 0 5px';
    } else if (isLastClickableColumn) {
      e.cellElement.style.borderRadius = '0 5px 5px 0';
    }
  }
};

</script>
