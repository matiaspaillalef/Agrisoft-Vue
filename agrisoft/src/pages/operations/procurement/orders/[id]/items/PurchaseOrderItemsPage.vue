<template>
  <!-- Page Header -->
  <div
    class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
    <div class="flex items-center gap-6">
      <div
        class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
        <ShoppingCartIcon class="w-10 h-10 text-white" />
      </div>
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Items de Orden de Compra</h1>
          <span v-if="purchaseOrderCode"
            class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
            #{{ purchaseOrderCode }}
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">
          Gestionando el detalle de productos y cantidades para esta orden
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button v-if="orderStatus === 'DRAFT' && dataSourceItems.length > 0" @click="aprobarOrden"
        class="group !px-6 !py-3 !bg-emerald-600 text-white font-black !rounded-2xl hover:!bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none flex items-center gap-2 w-fit!">
        <CheckCircleIcon class="w-5 h-5 transition-transform duration-300" />
        Aprobar Orden
      </button>
      <button @click="openNewProductPopup"
        class="group !px-6 !py-3 !bg-blue-600 text-white font-black !rounded-2xl hover:!bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center gap-2 w-fit!">
        <PlusCircleIcon class="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
        Registar Producto
      </button>
      <button @click="$router.back()"
        class="!px-6 !py-3 !bg-slate-50 dark:bg-navy-700 !text-slate-600 dark:text-slate-300 font-bold !rounded-2xl hover:!bg-slate-100 dark:hover:!bg-navy-600 transition-all !border !border-slate-100 dark:!border-navy-600 w-fit!">
        Volver
      </button>
    </div>
  </div>

  <!-- Main Content Area -->
  <div
    class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div
      class="p-8 border-b border-slate-100 dark:border-navy-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          Listado de Ítems
        </h3>
      </div>
    </div>
    <div class="p-8">
      <DxDataGrid ref="dxGrid" :data-source="dataSource" key-expr="id" :show-borders="false" :column-auto-width="true"
        :load-panel="{ enabled: false }" @editor-preparing="onEditorPreparing" class="modern-grid">
        <DxSearchPanel :visible="true" placeholder="Buscar ítems..." />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxPaging :page-size="10" />

        <DxColumn data-field="product_id" caption="Producto" :calculate-cell-value="getProductName"
          css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" alignment="right" :editor-options="{
            ...productsEditorOptions,
            value: (editingRow?.product_id ?? null)
          }" />
        <DxColumn data-field="quantity" caption="Cantidad" data-type="number" alignment="right"
          cell-template="qtyTemplate" css-class="!text-left" />

        <DxColumn data-field="unit_of_measure" caption="U.M." alignment="right" css-class="!text-left" :visible="false">
          <DxLookup :data-source="['kg', 't', 'm3', 'l', 'un']" />
        </DxColumn>

        <DxColumn data-field="price" caption="Precio Unit." data-type="number" alignment="right"
          css-class="!font-black text-blue-600 dark:text-blue-400 !text-left" cell-template="priceCellTemplate" />

        <DxColumn data-field="currency" caption="Moneda" alignment="right" css-class="!text-left"
          :set-cell-value="setCurrencyValue">
          <DxLookup :data-source="['CLP', 'USD', 'EUR']" />
        </DxColumn>

        <DxColumn data-field="exchange_rate" caption="T.C." data-type="number" format="#,##0.0000" alignment="right"
          css-class="!text-left" />

        <DxColumn caption="Total Moneda" :calculate-cell-value="data => data.quantity * data.price" alignment="right"
          css-class="!font-medium text-slate-500 !text-left" cell-template="totalOriginalCellTemplate"
          :allow-filtering="false" :allow-header-filtering="false" />

        <DxColumn name="totalCLP" caption="Total CLP"
          :calculate-cell-value="data => data.quantity * data.price * (Number(data.exchange_rate) || 1)"
          alignment="right" css-class="!font-black text-slate-800 dark:text-white !text-left"
          cell-template="totalCLPCellTemplate" :allow-filtering="false" :allow-header-filtering="false" />

        <DxColumn data-field="received_quantity" caption="Recibido" data-type="number" format="#,##0.00"
          alignment="right" cell-template="qtyTemplate" css-class="!text-left" :allow-header-filtering="false" />

        <DxSummary>
          <DxTotalItem column="quantity" summary-type="sum" display-format="Total: {0}" />
          <DxTotalItem column="totalCLP" summary-type="sum" display-format="Neto: {0}"
            :value-format="{ type: 'currency', currency: 'USD', precision: 0, formatter: priceFormatter }" />
        </DxSummary>

        <template #qtyTemplate="{ data }">
          <span class="font-medium text-slate-600 dark:text-slate-400">{{ data.value }}</span>
        </template>

        <template #priceCellTemplate="{ data }">
          <span class="font-black text-blue-600 dark:text-blue-400">
            {{ formatOriginalCurrency(data.value, data.data?.currency) }}
          </span>
        </template>

        <template #totalOriginalCellTemplate="{ data }">
          <span class="font-medium text-slate-500">
            {{ formatOriginalCurrency(data.value, data.data?.currency) }}
          </span>
        </template>

        <template #totalCLPCellTemplate="{ data }">
          <span class="font-black text-slate-800 dark:text-white">
            {{ priceFormatter(data.value) }}
          </span>
        </template>

        <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
          @editing-start="e => editingRow.value = e.data" @init-new-row="e => editingRow.value = {}">
          <DxPopup title="Gestión de Ítem" :width="500" :height="450" />
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
            <DxItem data-field="unit_of_measure" caption="U. Medida" editor-type="dxSelectBox" :editor-options="{
              items: ['kg', 't', 'm3', 'l', 'un'],
              placeholder: 'Seleccione U. Medida'
            }">
              <DxRequiredRule message="Seleccione unidad de medida" />
            </DxItem>
            <DxItem data-field="price" caption="Precio" editor-type="dxNumberBox">
              <DxRequiredRule message="Ingrese precio" />
            </DxItem>
            <DxItem data-field="currency" caption="Moneda" editor-type="dxSelectBox" :editor-options="{
              items: ['CLP', 'USD', 'EUR'],
              placeholder: 'Seleccione moneda'
            }">
              <DxRequiredRule message="Seleccione moneda" />
            </DxItem>
            <DxItem data-field="exchange_rate" caption="Tipo Cambio" editor-type="dxNumberBox" :editor-options="{
              min: 0,
              format: '#,##0.0000',
              placeholder: 'Ingrese tipo de cambio'
            }" />
          </DxForm>
        </DxEditing>
      </DxDataGrid>

      <!-- Totals & Configuration Footer -->
      <div class="mt-8 flex flex-col gap-6">
        <!-- Configuration Area -->
        <div
          class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-slate-50/50 dark:bg-navy-900/50 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm">
          <!-- Left side: Basic Config -->
          <div class="lg:col-span-4 flex flex-col gap-6 border-r border-slate-200 dark:border-navy-700 pr-6">
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Régimen
                Tributario</span>
              <div @click="toggleIva"
                :class="`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${includeIva ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-navy-800 border-slate-100 dark:border-navy-700'}`">
                <div
                  :class="`w-12 h-6 rounded-full relative transition-all duration-300 ${includeIva ? 'bg-blue-600' : 'bg-slate-300 dark:bg-navy-600'}`">
                  <div
                    :class="`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${includeIva ? 'translate-x-6' : 'translate-x-0'}`">
                  </div>
                </div>
                <div class="flex flex-col">
                  <span
                    :class="`text-sm font-bold transition-colors ${includeIva ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`">
                    {{ includeIva ? 'Afecta a IVA (19%)' : 'Orden Exenta' }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium leading-none">Cálculo de impuesto
                    automático</span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Condición de
                  Pago</span>
                <DxSelectBox v-model:value="paymentCondition" :items="['Contado', 'Crédito']"
                  @value-changed="savePaymentConditionDetails"
                  class="premium-selectbox !h-12 !rounded-2xl !border-slate-100 !bg-white dark:!bg-navy-800" />
              </div>

              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Forma de
                  Pago</span>
                <DxSelectBox v-model:value="paymentMethod" :items="paymentMethodsList"
                  @value-changed="savePaymentConditionDetails"
                  class="premium-selectbox !h-12 !rounded-2xl !border-slate-100 !bg-white dark:!bg-navy-800" />
              </div>

              <div v-if="paymentMethod === 'Cheque'">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">N° de
                  Cheque</span>
                <input type="text" v-model="chequeNumber" @change="savePaymentConditionDetails"
                  class="w-full h-12 rounded-2xl border border-slate-100 dark:border-navy-700 bg-white dark:bg-navy-800 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej: 123456" />
              </div>

              <div v-if="paymentCondition === 'Crédito'">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Fecha de
                  Cobro</span>
                <input type="date" v-model="cobroDate" @change="savePaymentConditionDetails"
                  class="w-full h-12 rounded-2xl border border-slate-100 dark:border-navy-700 bg-white dark:bg-navy-800 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <!-- Right side: Special Conditions -->
          <div class="lg:col-span-8 flex flex-col">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Términos y
              Condiciones
              Comerciales Especiales</span>
            <div class="relative group h-full">
              <textarea v-model="specialConditions" @blur="updateSpecialConditions"
                class="w-full h-full min-h-[100px] rounded-[1.5rem] border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-5 text-sm text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-blue-400 outline-none transition-all resize-none font-medium leading-relaxed"
                placeholder="Escriba aquí cualquier acuerdo especial, plazos de entrega, lugares de despacho o notas comerciales..."></textarea>
              <div
                class="absolute right-4 bottom-4 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                <span
                  class="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">Autoguardado
                  activado</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals Area -->
        <div
          class="p-6 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-xl flex flex-col md:flex-row justify-end items-center gap-8 overflow-hidden relative group">
          <!-- Subtle decoration -->
          <div
            class="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700">
          </div>

          <div v-if="totalNetOtherCurrency" class="flex flex-col items-end relative z-10">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Neto Otra
              Moneda</span>
            <span
              class="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{{ totalNetOtherCurrency }}</span>
          </div>

          <div class="flex flex-col items-end relative z-10">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Neto $</span>
            <span
              class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{{ priceFormatter(totalsInPesos.net) }}</span>
          </div>

          <div class="flex flex-col items-end relative z-10 transition-all duration-300"
            :class="includeIva ? 'opacity-100' : 'opacity-20 grayscale'">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">IVA $ (19%)</span>
            <span
              class="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{{ includeIva ? priceFormatter(totalsInPesos.vat) : '$ 0' }}</span>
          </div>

          <div
            class="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-4 rounded-[2rem] shadow-2xl shadow-blue-200 dark:shadow-none flex flex-col items-end relative z-10 transform transition-transform hover:scale-[1.02]">
            <span class="text-[10px] font-black text-blue-100/80 uppercase tracking-[0.2em] mb-1">
              {{ includeIva ? 'Total Bruto $ de Orden' : 'Total Exento $ Final' }}
            </span>
            <span
              class="text-3xl font-black text-white tracking-tighter">{{ priceFormatter(totalsInPesos.gross) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Nuevo Producto (Optimized) -->
  <div v-if="showNewProductPopup" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showNewProductPopup = false">
    </div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-100 dark:border-navy-700 flex flex-col animate-in zoom-in duration-300 max-h-[90vh]">
      <!-- Header -->
      <div
        class="p-8 bg-slate-50/50 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700 flex items-center gap-4 shrink-0">
        <div class="p-3 bg-blue-600 rounded-2xl shadow-lg">
          <PlusCircleIcon class="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Nuevo Producto</h2>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Crea un ítem y agrégalo a la orden</p>
        </div>
      </div>

      <!-- Body -->
      <form @submit.prevent="saveNewProduct" class="flex flex-col flex-grow overflow-hidden">
        <div class="p-8 space-y-6 overflow-y-auto flex-grow scrollbar-thin">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre del
                Producto</label>
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
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Ingrediente
                Activo</label>
              <input type="text" v-model="newProduct.active_ingredient"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-bold"
                placeholder="Opcional" />
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Composición</label>
              <input type="text" v-model="newProduct.composition"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-bold"
                placeholder="Opcional" />
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Categoría</label>
              <DxSelectBox v-model:value="newProduct.category_id" :items="categories" display-expr="name"
                value-expr="id" @value-changed="loadSubcategoriesForNewProduct"
                class="premium-selectbox h-14 !rounded-2xl !border-slate-200 !bg-slate-50 dark:!bg-navy-900/50"
                placeholder="Seleccione..." />
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Subcategoría</label>
              <DxSelectBox v-model:value="newProduct.subcategory_id" :items="currentSubcategories" display-expr="name"
                value-expr="id"
                class="premium-selectbox h-14 !rounded-2xl !border-slate-200 !bg-slate-50 dark:!bg-navy-900/50"
                placeholder="Seleccione..." />
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Objetivo /
                Justificación</label>
              <textarea v-model="newProduct.objective" rows="2"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-medium"
                placeholder="Objetivo o justificación del uso..."></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Descripción /
                Notas</label>
              <textarea v-model="newProduct.description" rows="2"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-medium"
                placeholder="Detalles adicionales..."></textarea>
            </div>

            <div v-if="userRol === 1"
              class="md:col-span-2 grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-navy-900/40 rounded-[2rem] border border-slate-100 dark:border-navy-700/50">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="newProduct.is_global"
                  class="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-navy-600 dark:bg-navy-900" />
                <div class="flex flex-col">
                  <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Producto
                    Global</span>
                  <span class="text-[9px] text-slate-400">Compartido entre todas las empresas</span>
                </div>
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" v-model="newProduct.is_sag_authorized"
                  class="w-5 h-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-navy-600 dark:bg-navy-900" />
                <div class="flex flex-col">
                  <span
                    class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Autorizado
                    SAG</span>
                  <span class="text-[9px] text-slate-400">Verificado por el SAG</span>
                </div>
              </label>
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Cantidad OC</label>
              <input type="number" v-model="newProduct.quantity"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-black text-blue-600"
                required />
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Unidad
                Medida</label>
              <DxSelectBox v-model:value="newProduct.unit_of_measure" :items="['kg', 't', 'm3', 'l', 'un']"
                class="premium-selectbox h-14 !rounded-2xl !border-slate-200 !bg-slate-50 dark:!bg-navy-900/50" />
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Precio Unit.</label>
              <input type="number" v-model="newProduct.price"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-black text-emerald-600"
                required />
            </div>

            <div>
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Moneda</label>
              <DxSelectBox v-model:value="newProduct.currency" :items="['CLP', 'USD', 'EUR']"
                class="premium-selectbox h-14 !rounded-2xl !border-slate-200 !bg-slate-50 dark:!bg-navy-900/50" />
            </div>

            <div v-if="newProduct.currency && newProduct.currency !== 'CLP'">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo Cambio</label>
              <input type="number" step="0.0001" v-model.number="newProduct.exchange_rate"
                class="w-full rounded-2xl border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-4 focus:border-blue-500 transition-all font-black text-amber-600"
                placeholder="1.0000" required />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-8 flex justify-end gap-4 border-t border-slate-100 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50 shrink-0">
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

  <!-- MODAL APROBAR ORDEN (PREMIUM) -->
  <div v-if="showApproveModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showApproveModal = false">
    </div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-[440px] z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in zoom-in duration-300">
      <div class="p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group">
        <div class="relative z-10">
          <h2 class="text-2xl font-black tracking-tight mb-1 text-white!">Aprobar Orden</h2>
          <p class="text-emerald-100/80 text-[10px] font-black uppercase tracking-widest">
            ORDEN DE COMPRA #{{ purchaseOrderCode }}
          </p>
        </div>
        <CheckCircleIcon
          class="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
      </div>

      <div class="p-8 text-center space-y-6">
        <p class="text-slate-600 dark:text-slate-300 font-bold text-base">
          ¿Seguro que deseas aprobar esta orden de compra?
        </p>

        <div class="flex flex-col gap-3">
          <button @click="confirmarAprobacion"
            class="w-full py-4 !bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none !hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all uppercase">
            Sí, Aprobar
          </button>
          <button @click="showApproveModal = false"
            class="w-full py-4 bg-slate-100 text-slate-600 dark:bg-navy-700 dark:text-slate-300 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-200 dark:hover:bg-navy-600 active:scale-95 transition-all uppercase">
            No, Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid, DxColumn, DxEditing, DxForm, DxItem, DxPopup,
  DxSearchPanel, DxPaging, DxHeaderFilter, DxLookup
} from 'devextreme-vue/data-grid'
import DxSelectBox from 'devextreme-vue/select-box'
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'
import productCategoriesService from '@/api/product-categories.service'
import { priceFormatter } from '@/utils/herlpers'
import { ShoppingCartIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'
import { PlusCircleIcon } from '@heroicons/vue/24/outline'
import { DxSummary, DxTotalItem } from 'devextreme-vue/data-grid'
import notify from 'devextreme/ui/notify'

const companyId = localStorage.getItem('userIdCompany') || '1'
const userRol = Number(localStorage.getItem('rol')) || 0

const route = useRoute()
const purchaseOrderId = ref(route.params.id)
const purchaseOrderCode = ref('')
const supplierId = ref(null)
const editingRow = ref(null)
const showNewProductPopup = ref(false)
const showApproveModal = ref(false)
const newProduct = ref({
  sku: '',
  name: '',
  active_ingredient: '',
  composition: '',
  objective: '',
  description: '',
  company_id: companyId,
  unit_of_measure: 'un',
  currency: 'CLP',
  exchange_rate: 1.0000,
  supplier_id: null,
  category_id: null,
  subcategory_id: null,
  is_global: false,
  is_sag_authorized: false
})

const paymentCondition = ref('Contado')

// Variables para forma de pago detallada
const paymentMethod = ref('Efectivo')
const chequeNumber = ref('')
const cobroDate = ref('')

const paymentMethodsList = computed(() => {
  if (paymentCondition.value === 'Contado') {
    return ['Efectivo', 'Transferencia', 'Cheque']
  } else {
    return ['Cheque', 'Cuenta Corriente', 'Transferencia']
  }
})

watch(() => newProduct.value.currency, (val) => {
  if (val === 'CLP') {
    newProduct.value.exchange_rate = 1.0000
  } else if (newProduct.value.exchange_rate === 1.0000) {
    newProduct.value.exchange_rate = null
  }
})

watch(paymentCondition, (newVal) => {
  const list = newVal === 'Contado'
    ? ['Efectivo', 'Transferencia', 'Cheque']
    : ['Cheque', 'Cuenta Corriente', 'Transferencia']
  if (!list.includes(paymentMethod.value)) {
    paymentMethod.value = list[0]
  }
})

function formatOriginalCurrency(value, currencyCode) {
  if (value == null) return ''
  if (!currencyCode || currencyCode === 'CLP') {
    return priceFormatter(value)
  }
  return currencyCode + ' ' + Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function serializePaymentCondition() {
  let cond = paymentCondition.value || 'Contado'
  let method = paymentMethod.value
  let detail = ''

  if (method === 'Cheque' && chequeNumber.value) {
    detail += ` N° ${chequeNumber.value}`
  }

  if (cond === 'Crédito' && cobroDate.value) {
    detail += ` (F. Cobro: ${cobroDate.value})`
  }

  return `${cond} - ${method}${detail}`
}

function deserializePaymentCondition(str) {
  if (!str) {
    paymentCondition.value = 'Contado'
    paymentMethod.value = 'Efectivo'
    chequeNumber.value = ''
    cobroDate.value = ''
    return
  }

  if (str.startsWith('Crédito')) {
    paymentCondition.value = 'Crédito'
  } else {
    paymentCondition.value = 'Contado'
  }

  const part = str.split(' - ')[1] || ''
  if (part.includes('Cheque')) {
    paymentMethod.value = 'Cheque'
    const numMatch = part.match(/N°\s*([^\s(]+)/)
    chequeNumber.value = numMatch ? numMatch[1] : ''
  } else if (part.includes('Transferencia')) {
    paymentMethod.value = 'Transferencia'
  } else if (part.includes('Cuenta Corriente')) {
    paymentMethod.value = 'Cuenta Corriente'
  } else {
    paymentMethod.value = 'Efectivo'
  }

  const dateMatch = part.match(/\(F. Cobro:\s*([^)]+)\)/)
  cobroDate.value = dateMatch ? dateMatch[1] : ''
}

async function savePaymentConditionDetails() {
  const value = serializePaymentCondition()
  try {
    await conexionApi.put(`/purchase-orders/${purchaseOrderId.value}`, {
      payment_condition: value
    })
  } catch (err) {
    console.error('Error al guardar forma de pago:', err)
  }
}

const categories = ref([])
const currentSubcategories = ref([])

const orderStatus = ref('')
const includeIva = ref(true)
const specialConditions = ref('')
const dataSourceItems = ref([])
const totalNetOtherCurrency = computed(() => {
  const groups = {}
  dataSourceItems.value.forEach(item => {
    const cur = item.currency || 'CLP'
    if (cur !== 'CLP') {
      groups[cur] = (groups[cur] || 0) + (item.quantity * item.price)
    }
  })

  const keys = Object.keys(groups)
  if (keys.length === 0) return null
  return keys.map(k => {
    const val = groups[k]
    return `${k} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }).join(' / ')
})

const totalsInPesos = computed(() => {
  const net = dataSourceItems.value.reduce((acc, item) => {
    const rate = Number(item.exchange_rate) || 1.0000
    return acc + (item.quantity * item.price * rate)
  }, 0)
  const vat = includeIva.value ? (net * 0.19) : 0
  const gross = net + vat
  return { net, vat, gross }
})

const totals = computed(() => totalsInPesos.value)

onMounted(async () => {
  try {
    // Llamamos al endpoint pasando company_id y id como query
    const { data } = await conexionApi.get('/purchase-orders', {
      params: { company_id: localStorage.getItem('userIdCompany'), id: purchaseOrderId.value }
    })

    // data.orders es un array, si viene el id debería traer solo 1 elemento
    if (data.code === 'OK' && data.orders && data.orders.length > 0) {
      const order = data.orders[0]
      purchaseOrderCode.value = order.order_code
      orderStatus.value = order.status
      supplierId.value = order.supplier_id
      includeIva.value = order.include_iva === 1
      specialConditions.value = order.special_conditions || ''
      deserializePaymentCondition(order.payment_condition)

      // Cargar productos filtrados por proveedor
      loadProducts()
    }

    // Cargar categorías para el modal
    const catRes = await productCategoriesService.getCategories(companyId)
    categories.value = catRes.data.data || []
  } catch (err) {
    console.error('Error obteniendo orden de compra:', err)
  }
})

async function loadSubcategoriesForNewProduct(e) {
  if (e.value) {
    const res = await productCategoriesService.getSubcategories(e.value)
    currentSubcategories.value = res.data.data || []
    newProduct.value.subcategory_id = null
  } else {
    currentSubcategories.value = []
  }
}

async function loadProducts() {
  const { data } = await conexionApi.get(`/products/${companyId}`, {
    params: { supplier_id: supplierId.value }
  })
  // Solo mostrar productos activos (status = 1)
  products.value = (data.products || []).filter(p => Number(p.status) === 1)
  productsEditorOptions.value.items = products.value
}

// updatePaymentCondition removed, handled by savePaymentConditionDetails

async function updateSpecialConditions() {
  try {
    await conexionApi.put(`/purchase-orders/${purchaseOrderId.value}`, {
      special_conditions: specialConditions.value
    })
  } catch (err) {
    console.error('Error al actualizar condiciones especiales')
  }
}

async function toggleIva() {
  const newValue = !includeIva.value
  try {
    await conexionApi.put(`/purchase-orders/${purchaseOrderId.value}`, {
      include_iva: newValue ? 1 : 0
    })
    includeIva.value = newValue
  } catch (err) {
    notify({
      message: 'Error al actualizar impuesto',
      type: 'error',
      displayTime: 3000,
      position: 'top center'
    })
  }
}

function aprobarOrden() {
  showApproveModal.value = true
}

async function confirmarAprobacion() {
  showApproveModal.value = false
  try {
    await conexionApi.put(`/purchase-orders/${purchaseOrderId.value}/approve`, {
      user_id: Number(localStorage.getItem('userId')),
      company_id: Number(localStorage.getItem('userIdCompany'))
    })
    orderStatus.value = 'APPROVED'
    notify({
      message: 'Orden aprobada correctamente ✅',
      type: 'success',
      displayTime: 3000,
      position: 'top center'
    })
  } catch (err) {
    notify({
      message: err.response?.data?.mensaje || 'Error al aprobar la orden',
      type: 'error',
      displayTime: 3000,
      position: 'top center'
    })
  }
}

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
    dataSourceItems.value = data.items
    return data.items
  },
  insert: async values => {
    const payload = { ...values, purchase_order_id: purchaseOrderId.value, company_id: companyId }
    if (!payload.currency || payload.currency === 'CLP') {
      payload.exchange_rate = 1.0000
    }
    const { data } = await conexionApi.post(`/purchase-orders/${purchaseOrderId.value}/items`, payload)
    dxGrid.value?.instance.refresh()
    return data
  },
  update: async (key, values) => {
    const payload = { ...values, company_id: Number(companyId) }
    if (payload.currency === 'CLP') {
      payload.exchange_rate = 1.0000
    }
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

function setCurrencyValue(newData, value, currentRowData) {
  newData.currency = value;
  if (value === 'CLP') {
    newData.exchange_rate = 1.0000;
  } else if (currentRowData?.currency === 'CLP') {
    newData.exchange_rate = null;
  }
}

function onEditorPreparing(e) {
  if (e.parentType === 'dataRow') {
    if (e.dataField === 'product_id') {
      e.editorOptions.value = e.row?.data?.product_id || null
    }
    if (e.dataField === 'exchange_rate') {
      const currentCurrency = e.row.data?.currency || 'CLP';
      e.editorOptions.disabled = currentCurrency === 'CLP';
      if (currentCurrency === 'CLP') {
        e.editorOptions.value = 1.0000;
      }
    }
  }
}

function openNewProductPopup() {
  showNewProductPopup.value = true
  newProduct.value = {
    company_id: companyId, unit_of_measure: 'un', currency: 'CLP', exchange_rate: 1.0000,
    supplier_id: supplierId.value,
    category_id: null,
    subcategory_id: null,
    composition: '',
    objective: '',
    is_global: false,
    is_sag_authorized: false
  }
  currentSubcategories.value = []
}

// Cargar productos iniciales (opcional, ya se hace en loadProducts)
onMounted(async () => {
  // loadProducts se llama desde el otro onMounted una vez que tenemos el supplierId
})

async function saveNewProduct() {
  try {
    // 1️⃣ Crear producto nuevo
    const { data: productData } = await conexionApi.post('/products', {
      sku: newProduct.value.sku,
      name: newProduct.value.name,
      active_ingredient: newProduct.value.active_ingredient,
      composition: newProduct.value.composition,
      objective: newProduct.value.objective,
      description: newProduct.value.description,
      company_id: companyId,
      supplier_id: supplierId.value,
      unit_of_measure: newProduct.value.unit_of_measure,
      currency: newProduct.value.currency,
      category_id: newProduct.value.category_id,
      subcategory_id: newProduct.value.subcategory_id,
      is_global: newProduct.value.is_global ? 1 : 0,
      is_sag_authorized: newProduct.value.is_sag_authorized ? 1 : 0,
      status: 1
    });

    if (productData.code !== 'OK') {
      notify({
        message: 'Error al crear producto: ' + productData.mensaje,
        type: 'error',
        displayTime: 3000,
        position: 'top center'
      });
      return;
    }

    const productId = productData.product_id;

    // 1.5️⃣ Vincular producto al proveedor en la tabla M:N
    await conexionApi.post(`/products/${productId}/suppliers`, {
      suppliers: [supplierId.value],
      company_id: companyId
    });

    // 2️⃣ Insertar automáticamente el item en la OC
    const { data: itemData } = await conexionApi.post(`/purchase-orders/${purchaseOrderId.value}/items`, {
      product_id: productId,
      quantity: newProduct.value.quantity,
      price: newProduct.value.price,
      company_id: companyId,
      unit_of_measure: newProduct.value.unit_of_measure,
      currency: newProduct.value.currency,
      exchange_rate: newProduct.value.exchange_rate || 1.0000
    });

    if (itemData.code !== 'OK') {
      notify({
        message: 'Error al agregar item a la OC: ' + itemData.mensaje,
        type: 'error',
        displayTime: 3000,
        position: 'top center'
      });
      return;
    }

    // 3️⃣ Actualizar listado de productos y refrescar DxDataGrid
    await loadProducts();
    dxGrid.value?.instance.refresh();

    showNewProductPopup.value = false;
    newProduct.value = {
      sku: '', name: '', active_ingredient: '', composition: '', objective: '', description: '',
      quantity: '', price: '', company_id: companyId, unit_of_measure: 'un', currency: 'CLP', exchange_rate: 1.0000,
      is_global: false, is_sag_authorized: false
    };
  } catch (err) {
    console.error(err);
    notify({
      message: 'Error creando producto o agregando item',
      type: 'error',
      displayTime: 3000,
      position: 'top center'
    });
  }
}

</script>
