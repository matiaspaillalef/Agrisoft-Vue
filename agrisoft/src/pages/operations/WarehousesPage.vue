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

      <div class="datagrid-container relative">
        <LoadingOverlay :show="loading" />
        <DxDataGrid :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
          :column-hiding-enabled="true" :width="'100%'" @editing-start="onEditingStart" @init-new-row="onInitNewRow"
          @saving="onSaving" ref="mainGridRef" @cell-prepared="onCellPrepared" :load-panel="{ enabled: false }">

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

          <DxColumn type="buttons" :width="140">
            <DxButton icon="custom-view" hint="Ver Detalles" @click="openViewModal" />
            <DxButton icon="custom-inventory" hint="Ver Inventario" @click="openInventoryModal" />
            <DxButton name="edit" />
            <DxButton name="delete" />
          </DxColumn>
        </DxDataGrid>

        <!-- Modal de Vista de Detalle -->
        <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[100] p-4">
          <div class="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" @click="showViewModal = false"></div>
          <div
            class="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in zoom-in duration-200">
            <div
              class="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center bg-slate-50/50 dark:bg-navy-800/50">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BuildingStorefrontIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 class="text-xl font-bold text-slate-800 dark:text-white">Detalles de Bodega</h2>
              </div>
              <button @click="showViewModal = false"
                class="text-gray-400 hover:text-navy-600 transition p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-full w-fit!">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <div class="p-8 space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre</p>
                  <p class="text-lg font-bold text-slate-700 dark:text-slate-200">{{ selectedWarehouse?.name }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                  <div class="flex items-center gap-1.5">
                    <span
                      :class="['w-2 h-2 rounded-full', selectedWarehouse?.status ? 'bg-green-500' : 'bg-red-500']"></span>
                    <p class="font-bold text-slate-700 dark:text-slate-200">
                      {{ selectedWarehouse?.status ? 'Activa' : 'Inactiva' }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="selectedWarehouse?.is_distribution"
                class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-center gap-3">
                <SparklesIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <p class="text-sm font-bold text-blue-700 dark:text-blue-300">Bodega de Distribución Principal</p>
              </div>

              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <UserGroupIcon class="w-4 h-4" />
                  Responsables Asignados ({{ selectedWarehouse?.users?.length || 0 }})
                </p>
                <div class="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                  <div v-for="user in getSelectedUsersInfo" :key="user.id"
                    class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700 transition hover:border-blue-200 dark:hover:border-blue-900/50">
                    <div
                      class="w-10 h-10 rounded-full bg-white dark:bg-navy-700 flex items-center justify-center font-bold text-blue-600 shadow-sm border border-slate-100 dark:border-navy-600">
                      {{ user.name[0] }}{{ user.lastname[0] }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ user.name }}
                        {{ user.lastname }}
                      </p>
                      <p class="text-xs text-slate-400">{{ user.mail }}</p>
                    </div>
                  </div>
                  <div v-if="!selectedWarehouse?.users?.length"
                    class="text-center py-6 text-slate-400 italic text-sm bg-slate-50 dark:bg-navy-800 rounded-2xl border border-dashed border-slate-200 dark:border-navy-700">
                    No hay responsables asignados
                  </div>
                </div>
              </div>
            </div>

            <div
              class="p-6 bg-slate-50 dark:bg-navy-800/50 border-t border-gray-100 dark:border-navy-700 flex justify-end">
              <button @click="showViewModal = false"
                class="bg-navy-600 hover:bg-navy-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition active:scale-95 text-sm">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== MODAL INVENTARIO ===================== -->
  <div v-if="showInventoryModal" class="fixed inset-0 flex items-center justify-center z-[110] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showInventoryModal = false"></div>
    <div
      class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
            <ClipboardDocumentListIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">Inventario</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {{ selectedInventoryWarehouse?.name }} · {{ inventoryProducts.length }} productos ·
              {{ totalInventoryStock }} unidades
            </p>
          </div>
        </div>
        <button @click="showInventoryModal = false"
          class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 w-fit!">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Grid -->
      <div class="p-6 flex-grow overflow-hidden relative">
        <LoadingOverlay :show="inventoryLoading" />
        <DxDataGrid
          :data-source="inventoryProducts"
          key-expr="product_id"
          :show-borders="true"
          :column-auto-width="true"
          :width="'100%'"
          :height="420"
          @exporting="onInventoryExporting"
          ref="inventoryGridRef"
        >
          <DxExport :enabled="true" :allow-export-selected-data="false" />
          <DxColumnFixing :enabled="true" />
          <DxScrolling column-rendering-mode="virtual" />
          <DxPaging :page-size="20" />
          <DxSearchPanel :visible="true" placeholder="Buscar producto..." />

          <DxToolbar>
            <DxToolbarItem name="exportButton" location="after" />
            <DxToolbarItem name="searchPanel" location="after" />
          </DxToolbar>

          <DxColumn data-field="sku" caption="SKU" css-class="!text-left" :width="120" />
          <DxColumn data-field="name" caption="Producto" css-class="!text-left" />
          <DxColumn data-field="active_ingredient" caption="Comp. Activo" css-class="!text-left" />
          <DxColumn data-field="quantity" caption="Stock" alignment="right" :width="90" />
          <DxColumn data-field="min_stock" caption="Stock Mín." alignment="right" :width="100"
            :cell-template="minStockTemplate" />
          <DxColumn data-field="max_stock" caption="Stock Máx." alignment="right" :width="100" />
          <DxColumn caption="Estado" :calculate-cell-value="calcEstado"
            :cell-template="estadoCellTemplate" css-class="!text-center" :width="120" />
        </DxDataGrid>
      </div>

      <!-- Footer -->
      <div class="px-8 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-end flex-shrink-0">
        <button @click="showInventoryModal = false"
          class="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          Cerrar
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import {
  BuildingStorefrontIcon,
  EyeIcon,
  XMarkIcon,
  UserGroupIcon,
  SparklesIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/solid'
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
  DxButton,
  DxExport,
  DxColumnFixing,
  DxScrolling,
  DxPaging,
  DxToolbar,
  DxItem as DxToolbarItem
} from 'devextreme-vue/data-grid'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import LoadingOverlay from '@/components/LoadingOverlay.vue'


import { loadMessages, locale } from 'devextreme/localization'
import axios from 'axios'
import { ref, computed, watch } from 'vue'
import conexionApi from '@/services/conexionApi.js'

import { statusCellTemplate } from '@/utils/herlpers'
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

/* =========================
   VISTA DE DETALLES
========================= */
const showViewModal = ref(false)
const selectedWarehouse = ref(null)

const openViewModal = (e) => {
  selectedWarehouse.value = e.row.data
  showViewModal.value = true
}

const getSelectedUsersInfo = computed(() => {
  if (!selectedWarehouse.value || !selectedWarehouse.value.users) return []
  return users.value.filter(u => selectedWarehouse.value.users.includes(u.id))
})

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
    try {
      const { data } = await conexionApi.get('/warehouses/getWarehouses/' + companyID)
      const result = data.warehouses.map(w => ({
        ...w,
        is_distribution: w.is_distribution === 1 || w.is_distribution === true,
        users: Array.isArray(w.users) ? w.users : []
      }))

      allWarehouses.value = result;
      return result;
    } finally {
      loading.value = false;
    }
  },

  insert: async values => {
    const payload = {
      ...values,
      idCompany: companyID,
      users: values.users ?? [],
      is_distribution: !!values.is_distribution
    };

    const { data } = await conexionApi.post(
      '/warehouses/createWarehouse',
      payload
    );

    return { id: data.id, ...payload };
  },

  update: async (id, values) => {
    // Para el update, si no viene is_distribution en 'values' de devextreme, 
    // pero si lo tenemos en el formData original, lo incluimos para que el backend 
    // sepa si esta bodega sigue siendo (o dejo de ser) la de distribución si es necesario.
    // Aunque el backend solo resetea si es 1.

    const payload = {
      ...values,
      idCompany: companyID
    };

    await conexionApi.put(`/warehouses/${id}`, payload);
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

/* =========================
   INVENTARIO POR BODEGA
========================= */
const showInventoryModal = ref(false)
const inventoryLoading = ref(false)
const selectedInventoryWarehouse = ref(null)
const inventoryProducts = ref([])
const inventoryGridRef = ref(null)

const totalInventoryStock = computed(() =>
  inventoryProducts.value.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
)

const openInventoryModal = async (e) => {
  selectedInventoryWarehouse.value = e.row.data
  showInventoryModal.value = true
  inventoryLoading.value = true
  try {
    const compID = Number(localStorage.getItem('userIdCompany')) || 0
    const { data } = await conexionApi.get(`/products/${compID}`)
    const products = data.products || []
    const whId = e.row.data.id
    inventoryProducts.value = products
      .filter(p => p.warehouses?.some(w => w.warehouse_id === whId))
      .map(p => {
        const whData = p.warehouses.find(w => w.warehouse_id === whId)
        return {
          product_id: p.id,
          sku: p.sku,
          name: p.name,
          active_ingredient: p.active_ingredient || '—',
          quantity: whData?.quantity ?? 0,
          min_stock: whData?.min_stock ?? null,
          max_stock: whData?.max_stock ?? null,
        }
      })
      .sort((a, b) => b.quantity - a.quantity)
  } catch (err) {
    console.error('Error cargando inventario:', err)
    inventoryProducts.value = []
  } finally {
    inventoryLoading.value = false
  }
}

function calcEstado(rowData) {
  const { quantity, min_stock } = rowData
  if (quantity === 0) return 'sinstock'
  if (min_stock !== null && min_stock !== undefined && quantity <= min_stock) return 'bajo'
  return 'normal'
}

function minStockTemplate(cellElement, cellInfo) {
  const val = cellInfo.value
  const qty = cellInfo.data.quantity
  if (val === null || val === undefined) {
    cellElement.innerHTML = `<span class="text-slate-300 text-xs">—</span>`
    return
  }
  const color = qty <= val ? 'text-red-600 font-black' : 'text-slate-600'
  cellElement.innerHTML = `<span class="${color}">${val}</span>`
}

function estadoCellTemplate(cellElement, cellInfo) {
  const estado = cellInfo.value
  const map = {
    sinstock: { label: 'Sin stock', cls: 'bg-red-100 text-red-700 border-red-200' },
    bajo:     { label: 'Stock bajo', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    normal:   { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }
  const { label, cls } = map[estado] || map.normal
  cellElement.innerHTML = `
    <span class="inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${cls}">
      ${label}
    </span>`
}

function onInventoryExporting(e) {
  const workbook = new Workbook()
  const whName = selectedInventoryWarehouse.value?.name || 'Bodega'
  const worksheet = workbook.addWorksheet(`Inventario - ${whName}`)

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
    customizeCell: ({ gridCell, excelCell }) => {
      if (gridCell.rowType === 'header') {
        excelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }
        excelCell.alignment = { horizontal: 'center' }
      }
      if (gridCell.rowType === 'data') {
        excelCell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        }
        if (gridCell.column.caption === 'Estado') {
          excelCell.value =
            gridCell.value === 'sinstock' ? 'Sin stock' :
            gridCell.value === 'bajo' ? 'Stock bajo' : 'Disponible'
        }
        if (gridCell.column.dataField === 'quantity') {
          const qty = gridCell.data?.quantity
          const min = gridCell.data?.min_stock
          if (qty === 0) {
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }
            excelCell.font = { bold: true, color: { argb: 'FFDC2626' } }
          } else if (min !== null && qty <= min) {
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }
            excelCell.font = { bold: true, color: { argb: 'FFEA580C' } }
          }
        }
      }
    }
  }).then(() => {
    workbook.xlsx.writeBuffer().then(buffer => {
      const now = new Date()
      const date = now.toISOString().split('T')[0]
      const name = whName.replace(/\s+/g, '_').toLowerCase()
      saveAs(
        new Blob([buffer], { type: 'application/octet-stream' }),
        `inventario_${name}_${date}.xlsx`
      )
    })
  })
}

</script>
