<template>
  <!-- Page Header -->
  <div class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
    <div class="flex items-center gap-6">
      <div class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
        <ShoppingCartIcon class="w-10 h-10 text-white" />
      </div>
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Items de Orden de Compra</h1>
          <span v-if="purchaseOrderCode" class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
            #{{ purchaseOrderCode }}
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">
          Gestionando el detalle de productos y cantidades para esta orden
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button @click="openNewProductPopup" 
        class="group px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center gap-2">
        <PlusCircleIcon class="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
        Registar Nuevo Producto
      </button>
      <button @click="$router.back()" 
        class="px-6 py-3 bg-slate-50 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-navy-600 transition-all border border-slate-100 dark:border-navy-600">
        Volver
      </button>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="p-8 border-b border-slate-100 dark:border-navy-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          Listado de Ítems
        </h3>
      </div>
    </div>

    <div class="p-8">
      <DxDataGrid 
        ref="dxGrid" 
        :data-source="dataSource" 
        key-expr="id" 
        :show-borders="false" 
        :column-auto-width="true"
        :load-panel="{ enabled: false }" 
        @editor-preparing="onEditorPreparing"
        class="modern-grid"
      >
        <DxSearchPanel :visible="true" placeholder="Buscar ítems..." />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxPaging :page-size="10" />

        <DxColumn data-field="product_id" caption="Producto" :calculate-cell-value="getProductName" 
          css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" :editor-options="{
            ...productsEditorOptions,
            value: (editingRow?.product_id ?? null)
          }" />
        
        <DxColumn data-field="quantity" caption="Cantidad" data-type="number" alignment="center" 
          cell-template="qtyTemplate" />
        
        <DxColumn data-field="price" caption="Precio Unitario" data-type="number"
          :format="{ type: 'currency', currency: 'USD', precision: 0, formatter: priceFormatter }" 
          alignment="right" css-class="!font-black text-blue-600 dark:text-blue-400" />
        
        <DxColumn data-field="received_quantity" caption="Recibido" data-type="number" format="#,##0.00"
          alignment="center" cell-template="qtyTemplate" />

        <template #qtyTemplate="{ data }">
          <span class="font-medium text-slate-600 dark:text-slate-400">{{ data.value }}</span>
        </template>

        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
          @editing-start="e => editingRow.value = e.data" @init-new-row="e => editingRow.value = {}">
          <DxPopup title="Gestión de Ítem" :width="500" :height="400" />
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

  <!-- Modal Nuevo Producto (Optimized) -->
  <div v-if="showNewProductPopup" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showNewProductPopup = false"></div>
    
    <div class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-100 dark:border-navy-700 flex flex-col animate-in zoom-in duration-300">
      <!-- Header -->
      <div class="p-8 bg-slate-50/50 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700 flex items-center gap-4">
        <div class="p-3 bg-blue-600 rounded-2xl shadow-lg">
          <PlusCircleIcon class="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Nuevo Producto</h2>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Crea un ítem y agrégalo a la orden</p>
        </div>
      </div>

      <!-- Body -->
      <form @submit.prevent="saveNewProduct" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre del Producto</label>
            <input type="text" v-model="newProduct.name" 
              class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all font-bold" 
              placeholder="Ej: Fertilizante Triple 15" required />
          </div>

          <div>
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">SKU / Código</label>
            <input type="text" v-model="newProduct.sku" 
              class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-bold" 
              placeholder="PROD-001" required />
          </div>

          <div>
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Ingrediente Activo</label>
            <input type="text" v-model="newProduct.active_ingredient" 
              class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-bold" 
              placeholder="Opcional" />
          </div>

          <div class="md:col-span-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Descripción</label>
            <textarea v-model="newProduct.description" rows="2"
              class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all" 
              placeholder="Detalles adicionales..."></textarea>
          </div>

          <div>
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Cantidad OC</label>
            <input type="number" v-model="newProduct.quantity" 
              class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-black text-blue-600" 
              required />
          </div>

          <div>
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Precio Unit.</label>
            <input type="number" v-model="newProduct.price" 
              class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-black text-emerald-600" 
              required />
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-6 flex justify-end gap-4 border-t border-slate-100 dark:border-navy-700 mt-2">
          <button type="button" 
            class="px-8 py-3 bg-white dark:bg-navy-800 border-2 border-slate-100 dark:border-navy-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 transition-all" 
            @click="showNewProductPopup = false">
            Cancelar
          </button>
          <button type="submit" 
            class="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none">
            Guardar Ítem
          </button>
        </div>
      </form>
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
import { ShoppingCartIcon } from '@heroicons/vue/24/solid'
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
