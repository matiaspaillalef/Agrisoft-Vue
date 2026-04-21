<template>
  <!-- Title Page -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <TruckIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Tránsitos</h1>
        <p class="text-slate-500 font-medium font-inter">Administración y control de logística y movimientos entre
          bodegas</p>
      </div>
    </div>
  </div>

  <div
    class="relative mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl bg-white dark:bg-[#2b4775] py-6 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2 px-2 md:px-10 max-w-full mx-auto">
    <LoadingOverlay :show="loading" />
    <div class="datagrid-container">
      <DxDataGrid :data-source="dataSource" :show-borders="true" :column-hiding-enabled="true" :width="'100%'"
        @content-ready="onContentReady" @init-new-row="onInitNewRow" :default-sorting="{ column: 'id', desc: true }"
        @onRowRemoving="customizeDeletePopup" @editor-preparing="onEditorPreparing" @saving="onSaving" ref="dataGrid"
        :css-class="'text-[12px]!'">
        <!-- FILTRO POR COLUMNA -->
        <!--<DxFilterRow :visible="true" :apply-filter=" 'auto' " />-->
        <!-- FILTRO DE ENCABEZADO -->
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <!--<DxColumnChooser :enabled="true" mode="select" />-->
        <DxColumnFixing :enabled="true" />
        <DxScrolling column-rendering-mode="virtual" />
        <DxSearchPanel :visible="true" placeholder="Buscar..." highlight-case-sensitive />
        <DxPaging :page-size="25" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[25, 50, 75, 100]" :show-info="true"
          :show-navigation-buttons="true" info-text="Página {0} de {1} ({2} registros)" />
        <DxEditing :allow-updating="true" :allow-adding="true" :allow-deleting="true" mode="popup" :use-icons="true"
          :texts="{ confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?' }">
          <DxPopup :show-title="true" :width="700" :height="525" title="Editar tránsito" />
          <DxForm>
            <DxItem data-field="responsible_name" editor-type="dxTextBox"
              :editor-options="{ readOnly: currentUser.role != 1 }" />
            <DxItem data-field="id" :visible="false" />
            <DxItem data-field="id_transito" :visible="false" />
            <DxItem data-field="status" editor-type="dxSelectBox"
              :editor-options="{ dataSource: transitStatus, valueExpr: 'id', displayExpr: 'name' }"
              :visible="role == 1" />
            <DxSimpleItem data-field="date" editor-type="dxDateBox" />
            <DxItem data-field="origin_id" editor-type="dxSelectBox" :set-cell-value="setOriginValue" />
            <DxItem data-field="destiny_id" editor-type="dxSelectBox" />
            <!--<DxItem data-field="products" editor-type="dxTextArea" :editor-options="{ height: 90 }" />-->
            <DxSelectBox :data-source="availableProducts" display-expr="display" value-expr="id"
              placeholder="Buscar producto por SKU, nombre o componente activo" search-enabled search-mode="contains"
              @value-changed="onProductSelected" />
            <!-- Productos -->
            <DxItem item-type="simple" caption="Productos" :col-span="2">
              <template #default>
                <DxDataGrid :data-source="filteredProducts" key-expr="id" height="320" :show-borders="true"
                  ref="(el) => { if (el) productsGridRef = el }" :editing="{
                    mode: 'batch',
                    allowUpdating: true,
                    allowAdding: false,
                    allowDeleting: false
                  }" @cell-value-changed="onCellValueChanged" @row-updated="onRowUpdated" @saving="onProductsSaving">
                  <DxSearchPanel :visible="true" placeholder="Buscar producto..." />
                  <DxColumn data-field="sku" caption="SKU" css-class="!text-left" :allow-editing="false" />
                  <DxColumn data-field="name" caption="Nombre" css-class="!text-left" :allow-editing="false" />
                  <DxColumn data-field="active_ingredient" caption="Componente activo" css-class="!text-left"
                    :allow-editing="false" />
                  <DxColumn data-field="quantity" caption="Stock" css-class="!text-left" :allow-editing="false" />
                  <DxColumn data-field="move_quantity" caption="Cantidad a mover" css-class="!text-left"
                    editor-type="dxNumberBox" :allow-editing="true" :show-editor-always="true" />
                </DxDataGrid>
              </template>
            </DxItem>

          </DxForm>
        </DxEditing>
        <DxColumn data-field="id_transito" caption="# Tránsito" :cell-template="trackingCellTemplate"
          css-class="!text-left text-[12px]!" :editor-options="{ readOnly: currentUser.role != 1 }" alignment="right"
          :hiding-priority="7" />
        <DxColumn data-field="origin_id" caption="Origen" css-class="!text-left max-w-[130px]! w-[130px]!"
          :lookup="originLookup" alignment="right" :hiding-priority="6" />
        <DxColumn caption="" width="60" :cell-template="statusIconTemplate" :hiding-priority="0" />
        <DxColumn data-field="destiny_id" caption="Destino" css-class="!text-left" :lookup="destinyLookup"
          alignment="right" :hiding-priority="5" />
        <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplatev2"
          :lookup="{ dataSource: transitStatus, valueExpr: 'id', displayExpr: 'name' }" css-class="!text-left"
          alignment="right" :hiding-priority="4" :editor-options="{ readOnly: currentUser.role != 1 }" />
        <DxColumn data-field="responsible_name" caption="Responsable" css-class="!text-left" alignment="right"
          :hiding-priority="3" />
        <DxColumn data-field="received_by" caption="Recibido" css-class="!text-left" alignment="right"
          :hiding-priority="2" />
        <DxColumn data-field="date" caption="Fecha" data-type="date" format="dd/MM/yyyy" css-class="!text-left"
          alignment="right" :hiding-priority="1" />
        <DxColumn type="buttons" width="140" :buttons="customButtons" alignment="left" :hiding-priority="0" />
      </DxDataGrid>
    </div>
  </div>
  <!-- Modal de detalle Mejorado -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[100] p-4">
    <div class="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" @click="closeModals"></div>
    <div
      class="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in zoom-in duration-200">
      <!-- Header -->
      <div
        class="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center bg-slate-50/50 dark:bg-navy-800/50">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <TruckIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white leading-none">Detalles del Tránsito</h2>
              <span
                class="px-2 py-0.5 bg-slate-200 dark:bg-navy-700 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                #{{ selectedItem?.id_transito }}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium font-inter">Información logística y control de existencias</p>
          </div>
        </div>
        <button @click="closeModals"
          class="text-gray-400 hover:text-navy-600 transition p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-full w-fit!">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8 space-y-8">
        <!-- Status & Route Section -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-navy-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-navy-700">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-navy-700">
                <MapPinIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Origen</p>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {{ getWarehouseName(selectedItem?.origin_id) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-navy-700">
                <FlagIcon class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destino</p>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {{ getWarehouseName(selectedItem?.destiny_id) }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Estado Actual
              </p>
              <div :class="[
                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter shadow-sm',
                selectedItem?.status == 3 ? 'bg-green-100 text-green-700 border border-green-200' :
                  selectedItem?.status == 2 ? 'bg-orange-100 text-orange-700 border border-orange-200 animate-pulse' :
                    selectedItem?.status == 0 ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
              ]">
                <CheckCircleIcon v-if="selectedItem?.status == 3" class="w-4 h-4" />
                <ArrowPathRoundedSquareIcon v-else-if="selectedItem?.status == 2" class="w-4 h-4" />
                <NoSymbolIcon v-else-if="selectedItem?.status == 0" class="w-4 h-4" />
                <ClockIcon v-else class="w-4 h-4" />
                {{ formatStatus(selectedItem?.status) }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-white dark:bg-navy-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-navy-700">
                <CalendarIcon class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fecha</p>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ formatDate(selectedItem?.date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsibles -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 bg-slate-50/50 dark:bg-navy-800/30 rounded-2xl border border-slate-100 dark:border-navy-700">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <UserIcon class="w-3 h-3 text-blue-500" /> Emitido por
            </p>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ selectedItem?.responsible_name }}</p>
          </div>
          <div class="p-4 bg-slate-50/50 dark:bg-navy-800/30 rounded-2xl border border-slate-100 dark:border-navy-700">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <UserCheckIcon class="w-3 h-3 text-green-500" /> Recibido por
            </p>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
              {{ selectedItem?.received_by || 'Aún no recibido' }}
            </p>
          </div>
        </div>

        <!-- Products Table -->
        <div class="space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <CubeIcon class="w-3 h-3 text-orange-500" /> Productos en Movimiento
            ({{ selectedItem?.products?.length || 0 }})
          </p>
          <div
            class="border border-slate-100 dark:border-navy-700 rounded-[1.5rem] overflow-hidden bg-white dark:bg-navy-900 shadow-sm">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-navy-800/50 border-b border-slate-100 dark:border-navy-700">
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Cantidad</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-navy-700">
                <tr v-for="(product, index) in selectedItem?.products" :key="index"
                  class="hover:bg-slate-50/80 dark:hover:bg-navy-800/20 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center font-black text-[10px] text-orange-600">
                        {{ product.Name[0] }}
                      </div>
                      <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ product.Name }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      class="px-3 py-1 bg-slate-100 dark:bg-navy-800 rounded-lg text-xs font-black text-slate-600 dark:text-slate-300">
                      {{ product.Quantity }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!selectedItem?.products?.length">
                  <td colspan="2" class="px-6 py-10 text-center text-sm text-slate-400 italic">No se encontraron
                    productos
                    registrados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-slate-50 dark:bg-navy-800/50 border-t border-gray-100 dark:border-navy-700 flex justify-end">
        <button @click="closeModals"
          class="bg-navy-600 hover:bg-navy-700 text-white font-black px-10 py-3 rounded-2xl shadow-lg transition active:scale-95 text-xs uppercase tracking-widest">
          Entendido
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Recepción Parcial -->
  <div v-if="showReceiptModal" class="fixed inset-0 flex items-center justify-center z-[101] p-4">
    <div class="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" @click="showReceiptModal = false"></div>
    <div
      class="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-xl z-20 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in zoom-in duration-200">
      <div
        class="p-6 border-b border-gray-100 dark:border-navy-700 flex justify-between items-center bg-slate-50/50 dark:bg-navy-800/50">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <CheckCircleIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Confirmar Recepción</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tránsito
              #{{ selectedTransitForReceipt?.id_transito }}</p>
          </div>
        </div>
        <button @click="showReceiptModal = false"
          class="text-gray-400 hover:text-navy-600 transition p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-full w-fit!">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="p-8 space-y-6">
        <p class="text-sm text-slate-500 font-medium leading-relaxed">
          Informe la cantidad exacta de productos recibidos. Si hubo una pérdida durante el transporte, ingrese la
          cantidad real que llegó a la bodega de destino.
        </p>

        <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          <div v-for="(product, index) in receiptProducts" :key="index"
            class="p-4 bg-slate-50 dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700 flex items-center justify-between gap-4">
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ product.name }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enviado:
                {{ product.original_quantity }}
              </p>
            </div>
            <div class="w-24">
              <input type="number" v-model="product.received_quantity"
                class="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-600 rounded-xl px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                :max="product.original_quantity" min="0" />
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-6 bg-slate-50 dark:bg-navy-800/50 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
        <button @click="showReceiptModal = false"
          class="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-700 transition text-sm">
          Cancelar
        </button>
        <button @click="confirmarRecepcion"
          class="bg-green-600 hover:bg-green-700 text-white font-black px-10 py-3 rounded-2xl shadow-lg shadow-green-200 dark:shadow-none transition active:scale-95 text-xs uppercase tracking-widest">
          Confirmar y Recibir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// ======================================================
// 📦 IMPORTACIONES
// ======================================================

// DevExtreme - Data & Store
import CustomStore from 'devextreme/data/custom_store'

// DevExtreme - Componentes DataGrid
import {
  DxDataGrid,
  DxColumn,
  DxSearchPanel,
  DxPager,
  DxPaging,
  DxColumnFixing,
  DxScrolling,
  DxEditing,
  DxForm,
  DxItem,
  DxFilterRow,
  DxHeaderFilter,
  DxColumnChooser,
  DxPopup
} from 'devextreme-vue/data-grid'
import { DxSimpleItem } from 'devextreme-vue/form'
import { ref, onMounted, watch, computed } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import {
  TruckIcon,
  XMarkIcon,
  MapPinIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowPathRoundedSquareIcon,
  NoSymbolIcon,
  ClockIcon,
  CalendarIcon,
  CubeIcon,
  UserIcon,
  UserGroupIcon
} from '@heroicons/vue/24/solid'
import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplatev2 } from '@/utils/herlpers.js'

const loading = ref(false)


// ======================================================
// 🧠 CONTEXTO DE USUARIO Y COMPAÑÍA
// ======================================================

// ID de la compañía
const companyID = Number(localStorage.getItem('userIdCompany') || 0)

// Usuario autenticado
const currentUser = {
  id: Number(localStorage.getItem('userId') || 0),
  name: `${localStorage.getItem('userName') || ''} ${localStorage.getItem('userLastname') || ''}`,
  role: Number(localStorage.getItem('rol') || 0),
}

// Roles con acceso administrativo total sobre tránsitos
const isAdmin = [1, 2].includes(currentUser.role)

// Bodegas asignadas al usuario
const userWarehouses = ref(
  JSON.parse(localStorage.getItem('userWarehouses') || '[]')
)


// ======================================================
// 📦 ESTADOS PRINCIPALES (REACTIVE STATE)
// ======================================================

// Bodegas
const bodegas = ref([])
const originWarehouses = ref([])

// UI / Modal
const showViewModal = ref(false)
const selectedItem = ref(null)

// Referencia al DataGrid
const dataGrid = ref(null)

// En tu script setup
const productsGridRef = ref(null);


// ======================================================
// 📦 ESTADOS DE PRODUCTOS
// ======================================================

const allProducts = ref([])           // Todos los productos
const filteredProducts = ref([])      // Productos filtrados por bodega
const availableProducts = ref([])     // Productos disponibles (no usados)
const selectedProducts = ref([])      // Productos seleccionados
const selectedWarehouseId = ref(null) // Bodega seleccionada
const productsChanged = ref(false)
const productosEditados = ref([])



// ======================================================
// 🚀 ON MOUNTED – CARGA INICIAL
// ======================================================

onMounted(async () => {
  loading.value = true;
  // ------------------------------
  // 🏬 Cargar bodegas
  // ------------------------------
  try {
    const { data } = await conexionApi.get(`/warehouses/getWarehouses/${companyID}`)
    if (data.code === 'OK') {
      const allBodegas = data.warehouses.map(b => ({
        id: b.id,
        name: b.name
      }))

      bodegas.value = allBodegas

      // Filtrar bodegas de origen según rol
      if (currentUser.id === 1) {
        // 🔑 Admin: todas las bodegas
        originWarehouses.value = allBodegas
        localStorage.setItem('userOriginWarehouses', JSON.stringify(allBodegas))

      } else if ([7, 8, 9].includes(currentUser.role)) {
        // 👤 Usuarios con bodegas asignadas
        const origins = allBodegas.filter(b =>
          userWarehouses.value.some(uw => uw.id === b.id)
        )

        originWarehouses.value = origins
        localStorage.setItem('userOriginWarehouses', JSON.stringify(origins))

      } else {
        // 🧩 Otros roles (opcional: todas o ninguna)
        originWarehouses.value = allBodegas
      }
    }
  } catch (err) {
    console.error('Error cargando bodegas:', err)
  }

  // ------------------------------
  // 📦 Cargar productos
  // ------------------------------
  try {
    const res = await conexionApi.get(`/products/${companyID}`)
    if (res.data.code === 'OK') {
      allProducts.value = res.data.products.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        active_ingredient: p.active_ingredient,
        warehouses: p.warehouses,
        quantity: 0
      }))
    }
  } catch (err) {
    console.error('Error al cargar productos:', err)
  } finally {
    loading.value = false;
  }
})


// ======================================================
// 🔁 FORMATEADORES
// ======================================================

function formatStatus(status) {
  switch (status) {
    case 1:
    case '1': return 'Creada'
    case 2:
    case '2': return 'En tránsito'
    case 3:
    case '3': return 'Entregada'
    case 0:
    case '0': return 'Cancelada'
    default: return 'Desconocido'
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


// ======================================================
// ➕ NUEVO REGISTRO (INIT NEW ROW)
// ======================================================

function onInitNewRow(e) {

  productosEditados.value = [];
  filteredProducts.value = filteredProducts.value.map(p => ({ ...p, move_quantity: 0 }));

  const unique = Date.now().toString()

  e.data.id_transito = `TRK-${companyID}-${unique}`
  e.data.date = new Date()
  e.data.status = 1
  e.data.products = []

  e.data.origin_id = null
  e.data.destiny_id = null

  // Asignación automática de origen según rol
  if ([1, 2, 7, 8, 9].includes(currentUser.role)) {
    const origin = JSON.parse(localStorage.getItem('userOriginWarehouses') || '[]')
    if (origin.length === 1) {
      e.data.origin_id = origin[0].id
      selectedWarehouseId.value = origin[0].id
    }
  }

  // Responsable automático para todos los roles permitidos
  e.data.responsible_name = currentUser.name
  e.data.responsible_id = currentUser.id
}


// ======================================================
// 📌 ESTADOS DE TRÁNSITO
// ======================================================

const transitStatus = [
  { id: 1, name: 'Creada' },
  { id: 2, name: 'En tránsito' },
  { id: 3, name: 'Entregado' },
  { id: 0, name: 'Cancelado' }
]


// ======================================================
// ✏️ CONFIGURACIÓN DE EDITORES (EDITOR PREPARING)
// ======================================================

function onEditorPreparing(e) {
  if (e.parentType !== 'dataRow') return

  const row = e.row?.data
  if (!row) return

  const canEdit =
    row.status === 1 &&
    (row.responsible_id === currentUser.id || isAdmin)

  if (!canEdit) {
    e.editorOptions.readOnly = true
    e.editorOptions.disabled = true
    return
  }

  // ORIGEN
  if (e.dataField === 'origin_id') {
    e.editorOptions.dataSource = originWarehouses.value
    e.editorOptions.valueExpr = 'id'
    e.editorOptions.displayExpr = 'name'
    e.editorOptions.placeholder = 'Seleccione origen'
    e.editorOptions.onValueChanged = (args) => {
      e.setValue(args.value)
      selectedWarehouseId.value = args.value
    }
  }

  // DESTINO
  if (e.dataField === 'destiny_id') {
    e.editorOptions.dataSource = bodegas.value
    e.editorOptions.valueExpr = 'id'
    e.editorOptions.displayExpr = 'name'
    e.editorOptions.placeholder = 'Seleccione destino'
  }
}


// ======================================================
// 🧮 EDITOR DE PRODUCTOS
// ======================================================

function onProductsEditorPreparing(e) {
  if (e.parentType === 'dataRow' && e.dataField === 'move_quantity') {
    const stock = e.row.data.quantity || 0

    e.editorOptions.min = 0
    e.editorOptions.max = stock
    e.editorOptions.showSpinButtons = true

    e.editorOptions.onValueChanged = (args) => {
      if (args.value > stock) {
        args.component.option('value', stock)
      }
      e.row.data.move_quantity = args.value
    }
  }
}


// ======================================================
// 👁️ MODAL DE VISTA
// ======================================================

function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

function closeModals() {
  productsChanged.value = false
  showViewModal.value = false
}


// ======================================================
// 🎨 TEMPLATES DE CELDA
// ======================================================

function trackingCellTemplate(cellElement, cellInfo) {
  const trackingNumber = cellInfo.data.id_transito || ''
  cellElement.innerHTML =
    `<span class="inline-flex items-centerrounded-sm font-bold text-[12px]">${trackingNumber}</span>`
}



// Icono de estado (usado como cellTemplate alternativo)
function statusIconTemplate(cellElement, cellInfo) {
  const status = cellInfo.data.status
  let svg = ''

  if (status === 0 || status === '0') {
    // Cancelado
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 text-red-500">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="m9.75 9.75 4.5 4.5
             m0-4.5-4.5 4.5
             M21 12a9 9 0 1 1-18 0
             9 9 0 0 1 18 0Z" />
      </svg>
    `
  } else {
    // Cualquier otro estado
    svg = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 text-green-500">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M17.25 8.25 21 12
             m0 0-3.75 3.75
             M21 12H3" />
      </svg>
    `
  }

  cellElement.innerHTML = svg
}


// ======================================================
// 🔘 BOTONES PERSONALIZADOS
// ======================================================

const customButtons = [
  {
    hint: 'Procesar',
    icon: 'custom-truck',
    cssClass: 'w-[25px]! h-[25px]! bg-orange-400 rounded-full animate-pulse p-[4px]!',
    visible: e =>
      e.row?.data?.status === 1 &&
      (e.row?.data?.responsible_id === currentUser.id || isAdmin),
    onClick: e => procesarTransito(e.row.data)
  },
  {
    hint: 'Cancelar',
    icon: 'custom-cancel',
    cssClass: 'w-[25px]! h-[25px]! bg-red-400 rounded-full animate-pulse p-[4px]!',
    visible: e =>
      e.row?.data?.status === 2 &&
      (e.row?.data?.responsible_id === currentUser.id || isAdmin),
    onClick: e => cancelarTransito(e.row.data)
  },
  {
    hint: 'Recibir',
    icon: 'custom-check',
    cssClass: 'w-[25px]! h-[25px]! bg-green-400 rounded-full animate-pulse p-[4px]!',
    visible: e => {
      const destinyId = e.row?.data?.destiny_id
      return (
        e.row?.data?.status === 2 &&
        (userWarehouses.value.some(w => w.id === destinyId) || isAdmin)
      )
    },
    onClick: e => recibirTransito(e.row.data)
  },
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: e => verRegistro(e.row.data)
  },
  {
    hint: 'Editar',
    icon: 'edit',
    visible: e => false,
    onClick: e => e.component.editRow(e.row.rowIndex)
  },
  {
    hint: 'Eliminar',
    icon: 'trash',
    visible: e =>
      e.row?.data?.status === 1 &&
      (e.row?.data?.responsible_id === currentUser.id || isAdmin),
    onClick: e => e.component.deleteRow(e.row.rowIndex)
  }
]


// ======================================================
// 📊 DATA SOURCE – GRID PRINCIPAL
// ======================================================

const dataSource = new CustomStore({
  key: 'id',

  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get(`/transits/${companyID}`)
      if (data.code === 'OK') {
        return data.transits
          .map(t => ({
            id: t.id,
            id_transito: t.id_transito,
            origin_id: t.warehouse_origin,
            destiny_id: t.warehouse_destiny,
            status: t.status,
            responsible_id: t.responsible_id,
            responsible_name: `${t.responsible_name} ${t.responsible_lastname}`,
            received_by: t.received_name || '—',
            date: new Date(t.date),
            products: t.products.map(p => ({
              id: p.product_id,
              Name: p.name,
              Quantity: p.quantity
            }))
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      }
      return []
    } catch (err) {
      console.error('Error cargando tránsitos:', err)
      return []
    } finally {
      loading.value = false
    }
  },

  insert: async (values) => {
    return await procesarGuardadoTransit(values);
  },

  update: async (key, values) => {
    // SI LA KEY ES TEMPORAL, ES UN INSERT DISFRAZADO
    if (String(key).includes('_DX_KEY')) {
      return await procesarGuardadoTransit(values);
    }

    // Aquí iría tu lógica normal de UPDATE para registros que ya existen en DB
    try {
      await conexionApi.put(`/transits/${key}`, values);
    } catch (err) {
      console.error(err);
    }
  },

  remove: async (key) => {
    try { await conexionApi.delete(`/transits/${key}`) }
    catch (err) { console.error(err) }
  }
})


// ======================================================
// 🔄 WATCHERS & HELPERS
// ======================================================

watch(selectedWarehouseId, (warehouseId) => {
  if (!warehouseId) {
    filteredProducts.value = []
    return
  }

  const warehouse = bodegas.value.find(b => b.id === warehouseId)
  selectedWarehouseId.value = warehouseId

  if (!warehouse) return

  filteredProducts.value = allProducts.value
    .filter(p => p.warehouses?.some(w => w.warehouse_name === warehouse.name))
    .map(p => ({
      ...p,
      quantity: p.warehouses.find(w => w.warehouse_name === warehouse.name)?.quantity || 0,
      move_quantity: 0
    }))
})

function getWarehouseName(id) {
  const warehouse = bodegas.value.find(b => b.id === id)
  return warehouse ? warehouse.name : '—'
}

const originLookup = computed(() => ({
  dataSource: bodegas.value,
  valueExpr: 'id',
  displayExpr: 'name'
}))

const destinyLookup = computed(() => ({
  dataSource: bodegas.value,
  valueExpr: 'id',
  displayExpr: 'name'
}))


// ======================================================
// ⚙️ ACCIONES DE NEGOCIO (CANCELAR / RECIBIR / PROCESAR)
// ======================================================

const showReceiptModal = ref(false)
const selectedTransitForReceipt = ref(null)
const receiptProducts = ref([])

async function cancelarTransito(rowData) {
  if (!confirm('¿Está seguro que desea cancelar este tránsito y liberar los productos?')) return
  loading.value = true
  try {
    const { data } = await conexionApi.put(`/transits/${rowData.id}/cancel`)
    if (data.code !== 'OK') throw new Error(data.mensaje)
    rowData.status = 0
    dataGrid.value.instance.refresh()
    alert('Tránsito cancelado y stock liberado')
  } catch (err) {
    console.error(err)
    alert(err.message || 'Error al cancelar tránsito')
  } finally {
    loading.value = false
  }
}

async function recibirTransito(rowData) {
  selectedTransitForReceipt.value = rowData
  // Mapear productos actuales para el modal de recepción
  receiptProducts.value = rowData.products.map(p => ({
    product_id: p.id || p.product_id, // Asegurar ID correcto
    name: p.Name || p.name,
    original_quantity: p.Quantity || p.quantity,
    received_quantity: p.Quantity || p.quantity // Por defecto todo
  }))
  showReceiptModal.value = true
}

async function confirmarRecepcion() {
  if (!selectedTransitForReceipt.value) return

  loading.value = true
  try {
    const payload = {
      received_by: currentUser.id,
      products: receiptProducts.value.map(p => ({
        product_id: p.product_id,
        received_quantity: Number(p.received_quantity)
      }))
    }

    const { data } = await conexionApi.put(`/transits/${selectedTransitForReceipt.value.id}/receive`, payload)
    if (data.code !== 'OK') throw new Error(data.mensaje)

    showReceiptModal.value = false
    dataGrid.value.instance.refresh()
    alert('Tránsito recibido y stock actualizado correctamente')
  } catch (err) {
    console.error(err)
    alert(err.message || 'Error al confirmar recepción')
  } finally {
    loading.value = false
  }
}

async function procesarTransito(rowData) {
  loading.value = true
  try {
    const { data } = await conexionApi.put(`/transits/${rowData.id}/process`)
    if (data.code !== 'OK') throw new Error(data.mensaje)
    rowData.status = 2
    dataGrid.value.instance.refresh()
  } catch (err) {
    console.error(err)
    alert('Error al procesar el tránsito')
  } finally {
    loading.value = false
  }
}

// ======================================================
// 🧩 UTILIDADES
// ======================================================
function onCellValueChanged(e) {
  if (e.dataField === 'move_quantity') {
    productsChanged.value = true
  }
}

function onSaving(e) {
  if (productsGridRef.value) {
    const gridInstance = productsGridRef.value.instance || productsGridRef.value;
    gridInstance.saveEditData();
  }

  if (e.changes.length > 0) {
    const change = e.changes[0];
    const isTempKey = String(change.key).includes('_DX_KEY');
    if (change.type === 'insert' || isTempKey) {
      change.data = {
        ...change.data,
        products: [...productosEditados.value]
      };
    }
  }
}

function onProductsSaving(e) {
  e.cancel = true;
  const allRows = e.component.getVisibleRows().map(row => row.data);
  productosEditados.value = allRows.filter(p => p.move_quantity > 0);
}

const onRowUpdated = (e) => {
  const producto = e.data

  const index = productosEditados.value.findIndex(
    p => p.id === producto.id
  )

  if (index === -1) {
    productosEditados.value.push({
      id: producto.id,
      move_quantity: producto.move_quantity
    })
  } else {
    productosEditados.value[index].move_quantity = producto.move_quantity
  }

  productosEditados.value = [...productosEditados.value]
  productsEditedSet.value.add(producto.id)
  dataGrid.value.instance.saveEditData()

  emitCambios()
}

const emit = defineEmits(['products-changed'])

const emitCambios = () => {
  emit('productos-cambiados', productosEditados.value)
}

// Función auxiliar para no repetir código
async function procesarGuardadoTransit(values) {

  const productsToMove = values.products || productosEditados.value;

  if (!productsToMove?.length) {
    throw new Error('Debe agregar productos con cantidad');
  }

  const unique = Date.now().toString()

  const idTransit = `TRK-${companyID}-${unique}`

  const payload = {
    company_id: companyID,
    id_transito: idTransit,
    warehouse_origin: selectedWarehouseId.value,
    warehouse_destiny: values.destiny_id,
    responsible_id: currentUser.id,
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),

    products: productsToMove.map(p => ({
      product_id: p.id,
      quantity: p.move_quantity
    }))
  };

  const { data } = await conexionApi.post('/transits', payload);
  if (data.code !== 'OK') throw new Error(data.mensaje);

  productosEditados.value = [];
  return data;
}

</script>
