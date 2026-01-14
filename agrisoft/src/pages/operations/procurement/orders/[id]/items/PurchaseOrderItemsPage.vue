<template>
  <div class="max-w-11/12 mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
    <h1 class="text-2xl font-light text-navy-700 dark:text-white">
      Items de Orden de Compra #{{ purchaseOrderCode || purchaseOrderId }}
    </h1>
  </div>

  <div class="mt-[3px] max-w-11/12 mx-auto rounded-2xl bg-white dark:!bg-navy-800 py-6 px-2 md:px-10 shadow-xl">
    <div class="datagrid-container">
      <div class="mb-2 flex gap-2 align-middle  w-fit z-10 mr-0 ml-auto">
        <button
          class="btn btn-tprimary inline-flex max-w-[200px] h-[34px] mt-[3px] items-center justify-center text-sm! cursor-pointer hover:bg-black"
          @click="openNewProductPopup">
          <PlusCircleIcon class="w-5 h-5 mr-2" />
          Nuevo Producto
        </button>
      </div>
      <DxDataGrid ref="dxGrid" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
        @editor-preparing="onEditorPreparing">
        <DxSearchPanel :visible="true" placeholder="Buscar..." />

        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxPaging :page-size="10" />

        <!-- Columnas -->
        <DxColumn data-field="product_id" caption="Producto" :calculate-cell-value="getProductName" alignment="right"
          css-class="!text-left" :editor-options="{
            ...productsEditorOptions,
            value: (editingRow?.product_id ?? null)
          }" />
        <DxColumn data-field="quantity" caption="Cantidad" data-type="number" alignment="right"
          css-class="!text-left" />
        <DxColumn data-field="price" caption="Precio" data-type="number"
          :format="{ type: 'currency', currency: 'USD', precision: 0, formatter: priceFormatter }" alignment="right"
          css-class="!text-left" />
        <DxColumn data-field="received_quantity" caption="Recibido" data-type="number" format="#,##0.00"
          alignment="right" css-class="!text-left" />

        <!-- Agregar / Editar Item -->
        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
          @editing-start="e => editingRow.value = e.data" @init-new-row="e => editingRow.value = {}">
          <DxPopup title="Agregar / Editar Item" :width="400" :height="300" />
          <DxForm :col-count="1">
            <DxItem data-field="product_id" caption="Producto" editor-type="dxSelectBox" :editor-options="{
              items: products.value,
              valueExpr: 'id',
              displayExpr: 'name',
              searchEnabled: true,
              showClearButton: true,
              placeholder: 'Seleccione producto'
            }">
              <DxRequiredRule message="Debe seleccionar un producto" />
            </DxItem>
            <DxItem data-field="quantity" caption="Cantidad" editor-type="dxNumberBox">
              <DxRequiredRule message="Ingrese cantidad" />
            </DxItem>
            <DxItem data-field="price" caption="Precio" editor-type="dxNumberBox">
              <DxRequiredRule message="Ingrese precio" />
            </DxItem>
          </DxForm>
        </DxEditing>
      </DxDataGrid>
    </div>
  </div>

  <!-- Modal Nuevo Producto -->
  <div v-if="showNewProductPopup" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="fixed inset-0 bg-[#ffffff66] backdrop-blur-sm">
      <div
        class="bg-white dark:bg-navy-700 rounded-2xl shadow-xl w-full p-6 relative z-10 max-w-11/12 md:max-w-lg mx-auto top-[50%] translate-y-[-50%]">
        <h2 class="text-xl font-semibold mb-4">Nuevo Producto</h2>
        <form @submit.prevent="saveNewProduct" class="space-y-4">
          <div>
            <label class="block mb-1 text-sm">SKU</label>
            <input type="text" v-model="newProduct.sku" class="input" required
              :class="'w-full border border-gray-300 rounded-lg p-2'" />
          </div>
          <div>
            <label class="block mb-1 text-sm">Nombre</label>
            <input type="text" v-model="newProduct.name" class="input" required
              :class="'w-full border border-gray-300 rounded-lg p-2'" />
          </div>
          <div>
            <label class="block mb-1 text-sm">Ingrediente Activo</label>
            <input type="text" v-model="newProduct.active_ingredient" class="input"
              :class="'w-full border border-gray-300 rounded-lg p-2'" />
          </div>
          <div>
            <label class="block mb-1 text-sm">Descripción</label>
            <textarea v-model="newProduct.description" class="input"
              :class="'w-full border border-gray-300 rounded-lg p-2'"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm">Cantidad</label>
              <input v-model="newProduct.quantity" class="input" type="number"
                :class="'w-full border border-gray-300 rounded-lg p-2'"></input>
            </div>
            <div>
              <label class="block mb-1 text-sm">Precio</label>
              <input v-model="newProduct.price" class="input" type="number"
                :class="'w-full border border-gray-300 rounded-lg p-2'"></input>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="btn btn-secondary" @click="showNewProductPopup = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid, DxColumn, DxEditing, DxForm, DxItem, DxPopup,
  DxSearchPanel, DxPaging, DxHeaderFilter
} from 'devextreme-vue/data-grid'
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'
import { priceFormatter } from '@/utils/herlpers'
import { PlusCircleIcon } from '@heroicons/vue/24/outline'

const companyId = localStorage.getItem('userIdCompany')

const route = useRoute()
const purchaseOrderId = ref(route.params.id)
const purchaseOrderCode = ref('')
const editingRow = ref(null)
const showNewProductPopup = ref(false)
const newProduct = ref({
  sku: '',
  name: '',
  active_ingredient: '',
  description: '',
  company_id: companyId,
})

onMounted(async () => {
  try {
    // Llamamos al endpoint pasando company_id y id como query
    const { data } = await conexionApi.get('/purchase-orders', {
      params: { company_id: localStorage.getItem('userIdCompany'), id: purchaseOrderId.value }
    })

    // data.orders es un array, si viene el id debería traer solo 1 elemento
    if (data.code === 'OK' && data.orders && data.orders.length > 0) {
      purchaseOrderCode.value = data.orders[0].order_code
    }
  } catch (err) {
    console.error('Error obteniendo orden de compra:', err)
  }
})

watch(() => route.params.id, (newId) => {
  purchaseOrderId.value = newId
  dxGrid.value?.instance.refresh()
})

const dxGrid = ref(null)
const products = ref([])

// Opciones de SelectBox reactivas
const productsEditorOptions = ref({
  items: [],
  valueExpr: 'id',
  displayExpr: 'name',
  searchEnabled: true,
  showClearButton: true,
  placeholder: 'Seleccione producto'
})

// Data source dinámico por OC
const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    const { data } = await conexionApi.get(`/purchase-orders/${purchaseOrderId.value}/items`)
    return data.items
  },
  insert: async values => {
    const payload = { ...values, purchase_order_id: purchaseOrderId.value, company_id: companyId }
    const { data } = await conexionApi.post(`/purchase-orders/${purchaseOrderId.value}/items`, payload)
    dxGrid.value?.instance.refresh()
    return data
  },
  update: async (key, values) => {
    const payload = { ...values, company_id: companyId }
    await conexionApi.put(`/purchase-order-items/${key}`, payload)
    dxGrid.value?.instance.refresh()
  },
  remove: async key => {
    await conexionApi.delete(`/purchase-order-items/${key}`)
    dxGrid.value?.instance.refresh()
  }
})

function getProductName(row) {
  if (!row?.product_id) return ''
  const product = products.value?.find(p => Number(p.id) === Number(row.product_id))
  return product ? product.name : ''
}

function onEditorPreparing(e) {
  // Esto se ejecuta cada vez que se abre un editor (nuevo o editar)
  if (e.parentType === 'dataRow' && e.dataField === 'product_id') {
    e.editorOptions.value = e.row?.data?.product_id || null
  }
}

function openNewProductPopup() {
  showNewProductPopup.value = true
  newProduct.value = { sku: '', name: '', active_ingredient: '', description: '', company_id: companyId }
}

// Cargar productos disponibles
onMounted(async () => {
  const { data } = await conexionApi.get(`/products/${companyId}`)
  products.value = data.products
  productsEditorOptions.value.items = products.value
})

async function saveNewProduct() {
  try {
    // 1️⃣ Crear producto nuevo
    const { data: productData } = await conexionApi.post('/products', {
      sku: newProduct.value.sku,
      name: newProduct.value.name,
      active_ingredient: newProduct.value.active_ingredient,
      description: newProduct.value.description,
      company_id: companyId,
      status: 1
    });

    if (productData.code !== 'OK') {
      return alert('Error al crear producto: ' + productData.mensaje);
    }

    const productId = productData.product_id;

    // 2️⃣ Insertar automáticamente el item en la OC
    const { data: itemData } = await conexionApi.post(`/purchase-orders/${purchaseOrderId.value}/items`, {
      product_id: productId,
      quantity: newProduct.value.quantity,
      price: newProduct.value.price,
      company_id: companyId
    });

    if (itemData.code !== 'OK') {
      return alert('Error al agregar item a la OC: ' + itemData.mensaje);
    }

    // 3️⃣ Actualizar listado de productos y refrescar DxDataGrid
    const { data: prodList } = await conexionApi.get(`/products/${companyId}`);
    products.value = prodList.products;
    dxGrid.value?.instance.refresh();

    showNewProductPopup.value = false;
    newProduct.value = { sku: '', name: '', active_ingredient: '', description: '', quantity: '', price: '', company_id: companyId };
  } catch (err) {
    console.error(err);
    alert('Error creando producto o agregando item');
  }
}

</script>
