<template>
  <!-- Title Page -->
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <div class="flex flex-col">
      <h1 class="text-2xl font-light text-navy-700 dark:text-white">Gestión de Tránsitos</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Administra y controla los tránsitos de manera eficiente.</p>
    </div>
  </div>

  <div
    class="relative mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl bg-white dark:bg-[#2b4775] py-6 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2 px-2 md:px-10 max-w-11/12 mx-auto">

    <div class="datagrid-container">
      <DxDataGrid :data-source="dataSource" :show-borders="true" :column-hiding-enabled="true" :width="'100%'"
        @content-ready="onContentReady" @init-new-row="onInitNewRow" :default-sorting="{ column: 'date', desc: true }"
        @onRowRemoving="customizeDeletePopup" @editor-preparing="onEditorPreparing" @saving="onSaving" ref="dataGrid">
        <!--<DxColumnChooser :enabled="true" mode="select" />-->
        <DxColumnFixing :enabled="true" />
        <DxScrolling column-rendering-mode="virtual" />
        <DxSearchPanel :visible="true" placeholder="Buscar..." highlight-case-sensitive />
        <DxPaging :page-size="15" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50, 100]" :show-info="true"
          :show-navigation-buttons="true" info-text="Página {0} de {1} ({2} registros)" />

        <DxEditing :allow-updating="true" :allow-adding="true" :allow-deleting="true" mode="popup" :use-icons="true"
          :texts="{ confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?' }">

          <DxPopup :show-title="true" :width="700" :height="525" title="Editar tránsito" />
          <DxForm>
            <DxItem data-field="responsible_name" editor-type="dxTextBox"
              :editor-options="{ readOnly: currentUser.role != 1 }" />
            <DxItem data-field="id" :visible="false" />
            <DxItem data-field="id_transito" />
            <DxItem data-field="status" editor-type="dxSelectBox"
              :editor-options="{ dataSource: transitStatus, valueExpr: 'id', displayExpr: 'name' }" />
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
                  ref="productsGridRef" @editor-preparing="onProductsEditorPreparing" :editing="{
                    mode: 'batch',
                    allowUpdating: true,
                    allowAdding: false,
                    allowDeleting: false
                  }">
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

        <!-- Columnas -->
        <DxColumn data-field="id_transito" caption="# Tránsito" :cell-template="trackingCellTemplate"
          css-class="!text-left" :editor-options="{ readOnly: currentUser.role != 1 }" />
        <DxColumn data-field="origin_id" caption="Origen" css-class="!text-left" :lookup="originLookup" />
        <DxColumn data-field="destiny_id" caption="Destino" css-class="!text-left" :lookup="destinyLookup" />
        <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-left" />
        <DxColumn data-field="responsible_name" caption="Responsable" css-class="!text-left" />
        <DxColumn data-field="received_by" caption="Recibido por" css-class="!text-left" />
        <DxColumn data-field="date" caption="Fecha" data-type="date" format="dd/MM/yyyy" css-class="!text-left" />
        <DxColumn type="buttons" width="140" :buttons="customButtons" />
      </DxDataGrid>
    </div>
  </div>
  <!-- Modal de detalle -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="fixed inset-0 bg-[#ffffff66] backdrop-blur-sm" @click="closeModals"></div>
    <div
      class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-lg mx-auto">
      <h2 class="text-xl mb-4">Detalles del tránsito <span class="font-bold bg-gray-200 p-1 rounded-sm">{{
        selectedItem?.id_transito }}</span></h2>
      {{ console.log('Selected Item en modal:', selectedItem) }}
      <p class="text-sm"><strong>Ruta:</strong> {{ getWarehouseName(selectedItem?.origin_id) }} → {{
        getWarehouseName(selectedItem?.destiny_id) }}</p>
      <p class="text-sm"><strong>Estado:</strong> {{ formatStatus(selectedItem?.status) }}</p>
      <p class="text-sm"><strong>Responsable:</strong> {{ selectedItem?.responsible_name }}</p>
      <p class="text-sm mb-4"><strong>Fecha:</strong> {{ formatDate(selectedItem?.date) }}</p>

      <div class="max-h-44 overflow-y-auto rounded-md shadow-md">
        <table class="min-w-full table-auto border-collapse">
          <thead class="bg-blue-950 text-white text-left text-[12px] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th class="px-6 py-2">Producto</th>
              <th class="px-6 py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white text-gray-700 text-[12px]">
            <tr v-for="(product, index) in selectedItem?.products" :key="index" class="hover:bg-blue-50">
              <td class="px-6 py-2 font-medium">{{ product.Name }}</td>
              <td class="px-6 py-2">{{ product.Quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button @click="closeModals"
        class="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid, DxColumn, DxSearchPanel, DxPager, DxPaging, DxColumnFixing, DxScrolling,
  DxEditing, DxForm, DxItem
} from 'devextreme-vue/data-grid'
import { DxSimpleItem } from 'devextreme-vue/form'
import { DxPopup } from 'devextreme-vue/popup'
import { ref, onMounted, watch, computed } from 'vue'
import conexionApi from '@/services/conexionApi.js'

// --- Datos ---
const companyID = Number(localStorage.getItem('userIdCompany') || 0)
const currentUser = {
  id: Number(localStorage.getItem('userId') || 0),
  name: `${localStorage.getItem('userName') || ''} ${localStorage.getItem('userLastname') || ''}`,
  role: Number(localStorage.getItem('rol') || 0),
}

// Obtener bodegas asignadas al usuario desde localStorage
const userWarehouses = ref(JSON.parse(localStorage.getItem('userWarehouses') || '[]'))
const bodegas = ref([])
const originWarehouses = ref([])
const showViewModal = ref(false)
const selectedItem = ref(null)
const dataGrid = ref(null)

// --- Productos ---
const allProducts = ref([])          // Todos los productos
const filteredProducts = ref([])     // Productos filtrados por bodega
const availableProducts = ref([])        // productos filtrados por bodega y no seleccionados
const selectedProducts = ref([])
const selectedWarehouseId = ref(null)

onMounted(async () => {
  // --- Bodegas ---
  try {
    const { data } = await conexionApi.get(`/warehouses/getWarehouses/${companyID}`)
    if (data.code === 'OK') {
      let allBodegas = data.warehouses.map(b => ({ id: b.id, name: b.name }))
      bodegas.value = allBodegas

      if ([7, 8, 9].includes(currentUser.role)) {
        const origins = allBodegas.filter(b =>
          userWarehouses.value.some(uw => uw.id === b.id)
        )
        originWarehouses.value = origins
        localStorage.setItem('userOriginWarehouses', JSON.stringify(origins))
      }
    }
  } catch (err) {
    console.error('Error cargando bodegas:', err)
  }

  // --- Productos ---
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
  }
})

// --- Funciones ---
function formatStatus(status) {
  switch (status) {
    case 1: case '1': return 'Creada'
    case 2: case '2': return 'En tránsito'
    case 3: case '3': return 'Entregado'
    case 0: case '0': return 'Cancelado'
    default: return 'Desconocido'
  }
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

function onInitNewRow(e) {
  const unique = Date.now().toString().slice(-8)
  e.data.id_transito = `TRK-${companyID}-${unique}`
  e.data.date = new Date()
  e.data.status = 1

  e.data.products = []

  e.data.origin_id = null
  e.data.destiny_id = null

  if ([7, 8, 9].includes(currentUser.role)) {
    const origin = JSON.parse(localStorage.getItem('userOriginWarehouses') || '[]');
    if (origin.length === 1) {
      //const nombreBodega = origin[0].name;
      e.data.origin_id = origin[0].id
      selectedWarehouseId.value = origin[0].id
    }
  }

  if (currentUser.role === 8) {
    e.data.responsible_name = currentUser.name
    e.data.responsible_id = currentUser.id // <<==== Agregar esto
  }
}

const transitStatus = [
  { id: 1, name: 'Creada' },
  { id: 2, name: 'En tránsito' },
  { id: 3, name: 'Entregado' },
  { id: 0, name: 'Cancelado' }
]

function onEditorPreparing(e) {
  // Solo aplicamos a filas de datos
  if (e.parentType !== 'dataRow') return;

  const row = e.row?.data
  if (!row) return

  const canEdit =
    row.status === 1 &&
    row.responsible_id === currentUser.id

  if (!canEdit) {
    e.editorOptions.readOnly = true
    e.editorOptions.disabled = true
    return
  }

  // 1. Configuración de ORIGEN (Solo Data Source y configuración visual)
  if (e.dataField === 'origin_id') {
    e.editorOptions.dataSource = originWarehouses.value;
    e.editorOptions.valueExpr = 'id';
    e.editorOptions.displayExpr = 'name';
    e.editorOptions.placeholder = 'Seleccione origen';
    e.editorOptions.onValueChanged = (args) => {
      e.setValue(args.value)
      selectedWarehouseId.value = args.value // Limpiar productos al cambiar origen
    }
    // ¡BORRA EL onValueChanged DE AQUÍ!
  }

  // 2. Configuración de DESTINO
  if (e.dataField === 'destiny_id') {
    e.editorOptions.dataSource = bodegas.value;
    e.editorOptions.valueExpr = 'id';
    e.editorOptions.displayExpr = 'name';
    e.editorOptions.placeholder = 'Seleccione destino';
    // ¡BORRA EL onValueChanged DE AQUÍ!
  }


}


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



function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

function closeModals() {
  showViewModal.value = false
}

function customizeDeletePopup(e) {
  e.component.getInstance()?.option('wrapperAttr', { class: 'dx-swatch-agrisoft-scheme' });
}

// --- Templates ---
function trackingCellTemplate(cellElement, cellInfo) {
  const trackingNumber = cellInfo.data.id_transito || ''
  cellElement.innerHTML = `<span class="inline-flex items-center bg-gray-200 px-3 py-1 rounded-sm font-bold">${trackingNumber}</span>`
}

function statusCellTemplate(cellElement, cellInfo) {
  const status = cellInfo.data.status
  let color = ''
  if (status == 0) color = 'bg-red-400'
  else if (status == 1) color = 'bg-orange-400'
  else if (status == 2) color = 'bg-blue-400'
  else if (status == 3) color = 'bg-green-400'
  else color = 'bg-gray-400'
  cellElement.innerHTML = `<span class="rounded-full bg-gray-50 text-black font-[400] px-3 h-[23px] inline-flex items-center w-[100px] justify-start gap-1 border border-gray-100"><span class="w-[10px] h-[10px] rounded-full animate-pulse basis-[10px]! min-w-[10px]! min-h-[10px]! ${color}"></span><span>${formatStatus(status)}</span></span>`
}

// --- Custom Buttons ---
const customButtons = [
  {
    hint: 'Procesar',
    icon: 'custom-truck',
    cssClass: 'w-[25px]! h-[25px]! bg-orange-400 rounded-full animate-pulse p-[4px]!',
    visible: (e) => {
      return (
        e.row?.data?.status === 1 &&
        e.row?.data?.responsible_id === currentUser.id
      );
    },
    onClick: (e) => procesarTransito(e.row.data)
  },
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: (e) => verRegistro(e.row.data)
  },
  {
    hint: 'Editar',
    icon: 'edit',
    visible: (e) =>
      e.row?.data?.status === 1 &&
      e.row?.data?.responsible_id === currentUser.id,
    onClick: (e) => {
      e.component.editRow(e.row.rowIndex)
    }
  },
  {
    hint: 'Eliminar',
    icon: 'trash',
    visible: (e) =>
      e.row?.data?.status === 1 &&
      e.row?.data?.responsible_id === currentUser.id,
    onClick: (e) => {
      e.component.deleteRow(e.row.rowIndex)
    }
  },
  {
    hint: 'Cancelar',
    icon: 'custom-cancel',
    cssClass: 'w-[25px]! h-[25px]! bg-red-400 rounded-full animate-pulse p-[4px]!',
    visible: (e) =>
      e.row?.data?.status === 2 &&
      e.row?.data?.responsible_id === currentUser.id,
    onClick: (e) => cancelarTransito(e.row.data)
  },
  {
    hint: 'Recibir',
    icon: 'custom-check',
    cssClass: 'w-[25px]! h-[25px]! bg-green-400 rounded-full animate-pulse p-[4px]!',
    visible: (e) => {
      const status = e.row?.data?.status;
      const destinyId = e.row?.data?.destiny_id;
      const warehouses = userWarehouses.value;
      const tieneWarehouse = warehouses?.some(w => w.id === destinyId);;
      return status === 2 && tieneWarehouse;
    },
    onClick: (e) => {
      recibirTransito(e.row.data);
    }
  }
]


// --- DataGrid principal ---
const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    try {
      const { data } = await conexionApi.get(`/transits/${companyID}`)
      if (data.code === 'OK') {
        return data.transits.map(t => ({
          id: t.id,
          id_transito: t.id_transito,
          origin_id: t.warehouse_origin,
          destiny_id: t.warehouse_destiny,
          status: t.status,
          responsible_id: t.responsible_id,
          responsible_name: t.responsible_name + ' ' + t.responsible_lastname,
          received_by: t.received_name
            ? t.received_name
            : '—',
          date: new Date(t.date),
          products: t.products.map(p => ({ Name: p.name, Quantity: p.quantity })),
        }))
      }
      return []
    } catch (err) {
      console.error('Error cargando tránsitos:', err)
      return []
    }
  },
  insert: async (values) => {
    const warehouseOrigin = originWarehouses.value.find(
      b => b.id === values.origin_id
    )

    if (!warehouseOrigin) {
      throw new Error('Bodega de origen inválida')
    }

    const warehouseDestiny = bodegas.value.find(
      b => b.id === values.destiny_id
    )

    if (!warehouseDestiny) {
      throw new Error('Bodega de destino inválida')
    }

    const productsToMove = filteredProducts.value.filter(
      p => Number(p.move_quantity) > 0
    )

    if (!productsToMove.length) {
      throw new Error('Debe agregar al menos un producto')
    }


    if (!productsToMove.length) {
      throw new Error('Debe agregar al menos un producto')
    }

    const payload = {
      company_id: companyID,
      id_transito: values.id_transito,
      warehouse_origin: warehouseOrigin.id,
      warehouse_destiny: warehouseDestiny.id,
      responsible_id: currentUser.id,
      date: values.date
        ? values.date.toISOString().slice(0, 19).replace('T', ' ')
        : null,

      products: productsToMove.map(p => ({
        product_id: p.id,
        quantity: p.move_quantity
      }))
    }

    const { data } = await conexionApi.post('/transits', payload)

    if (data.code !== 'OK') {
      throw new Error(data.mensaje || 'Error al crear tránsito')
    }

    return {
      id: data.transit_id,
      ...values
    }
  },
  update: async (key, values) => { try { await conexionApi.put(`/transits/${key}`, values) } catch (err) { console.error(err) } },
  remove: async (key) => { try { await conexionApi.delete(`/transits/${key}`) } catch (err) { console.error(err) } },
})

function onProductSelected(e) {
  const product = filteredProducts.value.find(p => p.id === e.value)
  if (!product) return

  if (!product.move_quantity) {
    product.move_quantity = 0
  }
}

// Asegúrate de que la función setOriginValue esté así:
const setOriginValue = (newData, value) => {
  console.log('🟢 ORIGEN CAMBIÓ:', value)
  newData.origin_id = value

  const warehouse = bodegas.value.find(b => b.id === value)

  console.log('Bodega de origen seleccionada:', warehouse)

  if (!warehouse) {
    filteredProducts.value = []
    return
  }

  const warehouseName = warehouse.name

  filteredProducts.value = allProducts.value
    .filter(p =>
      p.warehouses.some(w => w.warehouse_name === warehouseName)
    )
    .map(p => ({
      ...p,
      quantity: p.warehouses.find(w => w.warehouse_name === warehouseName)?.quantity || 0,
      move_quantity: 0
    }))

}


watch(selectedWarehouseId, (newWarehouseId) => {

  if (!newWarehouseId) {
    filteredProducts.value = []
    return
  }

  const warehouse = bodegas.value.find(b => b.id === newWarehouseId)
  if (!warehouse) {
    filteredProducts.value = []
    return
  }

  const warehouseName = warehouse.name

  filteredProducts.value = allProducts.value
    .filter(p =>
      p.warehouses.some(w => w.warehouse_name === warehouseName)
    )
    .map(p => ({
      ...p,
      quantity: p.warehouses.find(w => w.warehouse_name === warehouseName)?.quantity || 0,
      move_quantity: 0
    }))

})

function onSaving(e) {
  if (e.changes?.length) {
    const productsToMove = filteredProducts.value.filter(
      p => Number(p.move_quantity) > 0
    )

    e.changes[0].data = {
      ...e.changes[0].data,
      products: productsToMove
    }
  }
}

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

// --- Funciones ---
async function cancelarTransito(rowData) {
  if (!confirm('¿Está seguro que desea cancelar este tránsito y liberar los productos?')) return

  try {
    const { data } = await conexionApi.put(`/transits/${rowData.id}/cancel`)
    if (data.code !== 'OK') throw new Error(data.mensaje || 'Error al cancelar tránsito')

    rowData.status = 0
    dataGrid.value.instance.refresh()
    alert('Tránsito cancelado y stock liberado')
  } catch (err) {
    console.error(err)
    alert(err.message || 'Error al cancelar tránsito')
  }
}

async function recibirTransito(rowData) {
  if (!confirm('¿Desea recibir este tránsito y mover los productos a la bodega destino?')) return;

  try {
    const { data } = await conexionApi.put(
      `/transits/${rowData.id}/receive`,
      {
        received_by: currentUser.id
      }
    );

    if (data.code !== 'OK') throw new Error(data.mensaje || 'Error al recibir tránsito');

    rowData.status = 3;
    dataGrid.value.instance.refresh();
    alert('Tránsito recibido y stock actualizado');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al recibir tránsito');
  }
}

async function procesarTransito(rowData) {
  try {
    const response = await conexionApi.put(`/transits/${rowData.id}/process`)
    const data = response.data

    if (!data || data.code !== 'OK') {
      console.error('Respuesta inesperada del servidor:', data)
      return alert(data?.mensaje || 'Error al procesar el tránsito')
    }

    // Actualiza el status local
    rowData.status = 2

    // Refresca solo el grid usando el ref correcto
    if (dataGrid.value) {
      dataGrid.value.instance.refresh()
    }

  } catch (err) {
    console.error('Error en el request:', err)
    alert('Error al procesar el tránsito')
  }
}





</script>
