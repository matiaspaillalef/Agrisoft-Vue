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
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Órdenes de Compra</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">Gestión y seguimiento de
          pedidos de compra activos</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button v-if="[1, 2].includes(userRole)" @click="abrirModalNuevaOC"
        class="flex items-center gap-2 px-6 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] transition-all shadow-lg shadow-blue-200 active:scale-95 uppercase tracking-widest text-xs !w-fit h-[50px]">
        <PlusIcon class="w-5 h-5" />
        Nueva Orden
      </button>
      <button
        class="p-4 bg-slate-50 dark:bg-navy-900 text-slate-400 hover:text-blue-600 rounded-2xl transition-all duration-300 shadow-inner !w-fit"
        @click="showHelp = true" title="¿Qué hace cada acción?">
        <InformationCircleIcon class="w-7 h-7" />
      </button>
    </div>
  </div>

  <!-- Main Content Area -->
  <div
    class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in slide-in-from-bottom-4 duration-700">

    <div class="p-8">
      <DxDataGrid ref="dxGrid" :data-source="dataSource" key-expr="id" :show-borders="false" :column-auto-width="true"
        :load-panel="{ enabled: false }" class="modern-grid">
        <DxSearchPanel :visible="true" placeholder="Filtrar por proveedor, folio..." />
        <DxHeaderFilter :visible="true" :allow-search="true" />
        <DxPaging :page-size="15" />

        <DxEditing mode="popup" :allow-adding="false" :allow-updating="false" :allow-deleting="false" :use-icons="true">
          <DxPopup title="Detalles de Orden" :width="500" :height="400" />
          <DxForm :col-count="1">
            <DxItem data-field="request_id" caption="Solicitud Origen" editor-type="dxSelectBox"
              :editor-options="approvedRequestsEditorOptions" />
            <DxItem data-field="supplier_id" caption="Proveedor" editor-type="dxSelectBox"
              :editor-options="suppliersEditorOptions" />
          </DxForm>
        </DxEditing>

        <DxColumn data-field="order_code" caption="Folio OC" alignment="right"
          css-class="!font-black text-blue-600 dark:text-blue-400 !text-left" />

        <DxColumn data-field="tracking_code" caption="Ref. Solicitud" alignment="right" css-class="!text-left"
          :cell-template="trackingCodeTemplate" />

        <DxColumn data-field="supplier_name" caption="Proveedor" alignment="right"
          css-class="!text-left font-bold !text-left" />

        <DxColumn data-field="status" caption="Estado" :cell-template="statusTextCellTemplate" alignment="right"
          css-class="!text-left" />

        <DxColumn data-field="created_at" caption="Fecha Emisión" data-type="date" format="dd/MM/yyyy" alignment="right"
          css-class="!text-left" />

        <DxColumn type="buttons" :buttons="customButtons" />
      </DxDataGrid>
    </div>
  </div>

  <!-- MODAL VER DETALLE (PREMIUM STYLE) -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModals"></div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl z-10 overflow-hidden border border-slate-100 dark:border-navy-700 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
      <!-- Header -->
      <div
        class="p-8 bg-slate-50/50 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700 flex justify-between items-start">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <ShoppingCartIcon class="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Resumen de Orden</h2>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Folio: <span
                class="text-blue-600">#{{ selectedItem?.order_code }}</span></p>
          </div>
        </div>

        <div v-if="selectedItem?.status"
          :class="`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusMeta(selectedItem.status).bgColor} ${getStatusMeta(selectedItem.status).textColor} border-slate-100 dark:border-navy-600 shadow-sm`">
          <span
            :class="`w-2.5 h-2.5 rounded-full animate-pulse ${getStatusMeta(selectedItem.status).pulseColor}`"></span>
          <span class="font-bold text-xs uppercase tracking-widest">{{ getStatusMeta(selectedItem.status).text }}</span>
        </div>
      </div>

      <!-- Body -->
      <div class="p-8 overflow-y-auto flex-grow space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- General info -->
          <div class="space-y-4">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
              Información Logística
            </h3>
            <div
              class="bg-slate-50 dark:bg-navy-900/30 rounded-2xl p-6 space-y-4 border border-slate-100 dark:border-navy-700">
              <div v-if="selectedItem?.tracking_code" class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Ref. Solicitud:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedItem?.tracking_code }}</span>
              </div>
              <div v-if="selectedItem?.requester_name" class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Solicitante:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedItem?.requester_name }}</span>
              </div>
              <div v-if="!selectedItem?.tracking_code" class="flex justify-between items-center text-sm">
                <span class="text-slate-500 italic">Tipo de Origen:</span>
                <span class="font-black text-amber-600 uppercase text-[10px]">Creación Directa</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Emitida por:</span>
                <span
                  class="font-bold text-slate-800 dark:text-slate-200 text-right">{{ selectedItem?.created_by_name || 'Autogestionada' }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Fecha Sistema:</span>
                <span
                  class="font-bold text-slate-800 dark:text-slate-200">{{ formatDateHrs(selectedItem?.created_at) }}</span>
              </div>
              <div
                class="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-navy-700">
                <span class="text-slate-500">Impuestos:</span>
                <span
                  :class="`font-black uppercase text-[10px] ${selectedItem?.include_iva ? 'text-blue-600' : 'text-amber-600'}`">
                  {{ selectedItem?.include_iva ? 'Afecta a IVA (19%)' : 'Exenta de IVA' }}
                </span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500">Condición de Pago:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ selectedItem?.payment_condition }}</span>
              </div>
              <div v-if="selectedItem?.special_conditions" class="pt-2 border-t border-slate-100 dark:border-navy-700">
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Condiciones
                  Especiales:</span>
                <p class="text-sm text-slate-700 dark:text-slate-300 italic">"{{ selectedItem?.special_conditions }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Supplier info -->
          <div class="space-y-4">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
              Información de Facturación
            </h3>
            <div
              class="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl p-6 space-y-4 border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden">
              <div class="flex items-center gap-3 relative z-10">
                <div class="p-3 bg-white dark:bg-navy-800 rounded-xl shadow-sm">
                  <BuildingOfficeIcon class="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div class="font-black text-slate-800 dark:text-white text-lg">{{ selectedItem?.supplier_name }}</div>
                  <div class="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">RUT:
                    {{ selectedItem?.supplier_rut }}
                  </div>
                </div>
              </div>
              <BuildingOfficeIcon
                class="absolute -right-6 -bottom-6 w-24 h-24 text-indigo-200/20 dark:text-indigo-900/10" />
            </div>
          </div>
        </div>

        <!-- Items table -->
        <div class="space-y-4 pt-4">
          <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div class="w-1 h-4 bg-emerald-600 rounded-full"></div>
            Detalle de Productos
          </h3>
          <div
            class="border border-slate-100 dark:border-navy-700 rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-navy-900/50">
            <DxDataGrid :data-source="modalItemsDataSource" key-expr="id" :show-borders="false"
              :column-auto-width="true" class="custom-view-grid">
              <DxColumn data-field="product_name" caption="Producto"
                css-class="!font-bold !text-slate-700 dark:!text-slate-200" />
              <DxColumn data-field="quantity" caption="Cant." alignment="center" />
              <DxColumn data-field="price" caption="Precio Unit."
                :format="{ type: 'currency', currency: 'USD', precision: 0, formatter: priceFormatter }"
                alignment="right" css-class="!font-black text-blue-600 dark:text-blue-400" />
              <DxColumn data-field="received_quantity" caption="Recibido" alignment="center"
                css-class="text-emerald-600 font-bold" />
              <DxColumn caption="Faltante" alignment="center"
                :calculate-cell-value="data => Math.max(0, data.quantity - (data.received_quantity || 0))"
                css-class="text-amber-600 font-bold" />
              <DxScrolling mode="virtual" />
            </DxDataGrid>
          </div>
        </div>

        <!-- NEW: Receipts History Section -->
        <div v-if="orderReceipts && orderReceipts.length > 0" class="space-y-4 pt-4 animate-in fade-in duration-500">
          <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
            Historial de Entregas (Recepciones)
          </h3>
          <div class="grid grid-cols-1 gap-4">
            <div v-for="receipt in orderReceipts" :key="receipt.id" :class="[
              'p-6 rounded-3xl border transition-all group',
              !receipt.warehouse_id
                ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                : 'bg-slate-50 dark:bg-navy-900/30 border-slate-100 dark:border-navy-700 hover:border-blue-200'
            ]">
              <div class="flex flex-col md:flex-row justify-between gap-4">
                <div class="flex gap-4">
                  <!-- Icono condicional -->
                  <div :class="[
                    'p-3 rounded-2xl shadow-sm border',
                    !receipt.warehouse_id
                      ? 'bg-white dark:bg-navy-800 text-amber-600 border-amber-100 dark:border-amber-800'
                      : 'bg-white dark:bg-navy-800 text-blue-600 border-slate-100 dark:border-navy-700'
                  ]">
                    <XCircleIcon v-if="!receipt.warehouse_id" class="w-6 h-6" />
                    <DocumentCheckIcon v-else class="w-6 h-6" />
                  </div>

                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {{ !receipt.warehouse_id ? 'Evento:' : 'Documento:' }}
                      </span>
                      <span
                        :class="['font-bold', !receipt.warehouse_id ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200']">
                        {{ !receipt.warehouse_id ? 'CIERRE MANUAL DE ORDEN' : (receipt.invoice_number ? 'Factura/Guía #' + receipt.invoice_number : 'Sin número') }}
                      </span>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span class="flex items-center gap-1">
                        <CalendarIcon class="w-3.5 h-3.5" />
                        {{ formatDate(receipt.document_date || receipt.received_at) }}
                      </span>
                      <span class="flex items-center gap-1">
                        <UserIcon class="w-3.5 h-3.5" />
                        {{ receipt.received_by_name }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Badge de pago solo si hay bodega (es recepción real) -->
                <div v-if="receipt.warehouse_id" class="text-right">
                  <span
                    class="px-3 py-1 bg-white dark:bg-navy-800 rounded-full text-[10px] font-black text-blue-600 border border-blue-50 dark:border-blue-900 shadow-sm">
                    {{ receipt.payment_method }}
                  </span>
                </div>
              </div>

              <!-- Comentario con estilo condicional -->
              <div v-if="receipt.notes" :class="[
                'mt-4 p-4 rounded-2xl border',
                !receipt.warehouse_id
                  ? 'bg-white/50 dark:bg-navy-800/50 border-amber-100/50 dark:border-amber-900/20'
                  : 'bg-white dark:bg-navy-800/50 border-slate-50 dark:border-navy-700'
              ]">
                <p
                  :class="['text-xs italic', !receipt.warehouse_id ? 'text-amber-800 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400']">
                  "{{ receipt.notes }}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rejection/Cancellation info -->
        <div v-if="selectedItem?.status === 'CANCELLED' && selectedItem?.rejection_reason"
          class="bg-red-50 dark:bg-red-900/20 rounded-[1.5rem] p-6 border border-red-100 dark:border-red-900/30 space-y-3">
          <h4
            class="text-red-800 dark:text-red-400 font-black flex items-center gap-2 text-xs uppercase tracking-widest">
            <InformationCircleIcon class="w-5 h-5" />
            Motivo de Cancelación
          </h4>
          <div class="text-sm text-red-700 dark:text-red-300/80 italic">
            "{{ selectedItem.rejection_reason }}"
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="p-8 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-navy-700 flex justify-end gap-3">
        <button @click="closeModals"
          class="px-10 py-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL NUEVA OC (DIRECTA) -->
  <div v-if="showNewOCModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="cerrarModalNuevaOC"></div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-[480px] z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in zoom-in duration-300">
      <div class="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
        <div class="relative z-10">
          <h2 class="text-2xl font-black tracking-tight mb-1 text-white!">Nueva Orden de Compra</h2>
          <p class="text-blue-100/80 text-[10px] font-black uppercase tracking-widest">Creación Directa</p>
        </div>
        <PlusCircleIcon
          class="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
      </div>

      <div class="p-8 space-y-8">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Seleccionar Proveedor
          </label>
          <DxSelectBox v-model:value="newOrderSupplier" :items="suppliers" display-expr="display" value-expr="id"
            :search-enabled="true" placeholder="Buscar proveedor..."
            class="premium-selectbox h-14 !rounded-2xl !border-slate-100 !bg-slate-50/50" />
        </div>

        <div
          class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-navy-900/50 rounded-2xl border border-slate-100 dark:border-navy-700">
          <input type="checkbox" v-model="newOrderIncludeIva" id="includeIvaCheckbox"
            class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 !w-fit !mt-3">
          <label for="includeIvaCheckbox"
            class="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Incluir impuesto IVA
            (19%)</label>
        </div>

        <div class="space-y-3">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Condición de
            Pago</label>
          <DxSelectBox v-model:value="newOrderPaymentCondition" :items="['Contado', 'Crédito']"
            class="premium-selectbox h-14 !rounded-2xl !border-slate-100 !bg-slate-50/50" />
        </div>

        <div class="space-y-3">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Condiciones
            Especiales</label>
          <textarea v-model="newOrderSpecialConditions" rows="3"
            placeholder="Ej: Entrega en bodega sur, pactar despacho..."
            class="w-full rounded-2xl border-slate-100 bg-slate-50/50 dark:bg-navy-900/50 p-4 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none border dark:border-navy-700"></textarea>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="confirmarNuevaOC"
            class="w-full py-4.5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all uppercase">
            Crear Orden
          </button>
          <button @click="cerrarModalNuevaOC"
            class="w-full py-4.5 bg-white text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-50 hover:text-slate-600 active:scale-95 transition-all uppercase">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL CANCELACIÓN (PREMIUM) -->
  <div v-if="showCancelModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="cerrarModalCancel"></div>

    <div
      class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-[480px] z-10 overflow-hidden border border-slate-100 dark:border-navy-700 animate-in zoom-in duration-300">
      <div class="p-8 bg-red-500 text-white relative overflow-hidden group">
        <div class="relative z-10">
          <h2 class="text-2xl font-black tracking-tight mb-1 text-white!">Cancelar Orden</h2>
          <p class="text-red-100/80 text-[10px] font-black uppercase tracking-widest">OC:
            {{ orderToCancel?.order_code }}
          </p>
        </div>
        <XCircleIcon
          class="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
      </div>

      <div class="p-8 space-y-6">
        <div class="space-y-3">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Indique el motivo de la cancelación
          </label>
          <textarea v-model="cancelReason" rows="4" placeholder="Escriba aquí el motivo..."
            class="w-full rounded-2xl border-slate-100 bg-slate-50/50 dark:bg-navy-900/50 p-4 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none border dark:border-navy-700"></textarea>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="confirmarCancelacion"
            class="w-full py-4.5 bg-red-500 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-red-200 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all uppercase">
            Confirmar Anulación
          </button>
          <button @click="cerrarModalCancel"
            class="w-full py-4.5 bg-white text-slate-400 rounded-2xl font-black text-sm tracking-widest hover:bg-slate-50 hover:text-slate-600 active:scale-95 transition-all uppercase">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- HELP POPUP (PREMIUM) -->
  <DxPopup v-model:visible="showHelp" :width="500" :height="'auto'" :show-close-button="true" :drag-enabled="false"
    class="premium-popup">
    <template #title>
      <div class="flex items-center gap-4 py-2">
        <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-sm">
          <InformationCircleIcon class="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <span class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Acciones y Guía</span>
      </div>
    </template>

    <div class="p-2 space-y-4">
      <div v-for="action in actionsHelp" :key="action.title"
        class="flex items-start gap-5 p-5 rounded-[1.5rem] transition-all hover:bg-slate-50 dark:hover:bg-navy-900 group border border-transparent hover:border-slate-100 dark:hover:border-navy-700">
        <div
          :class="`p-4 rounded-2xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform ${action.bgClass} text-white shadow-sm`">
          <component :is="action.icon" class="w-6 h-6" />
        </div>
        <div>
          <h4 class="font-black text-slate-800 dark:text-white text-lg tracking-tight">{{ action.title }}</h4>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{{ action.description }}</p>
        </div>
      </div>

      <div class="pt-6 mt-4 border-t border-slate-100 dark:border-navy-700 flex justify-end">
        <button @click="showHelp = false"
          class="px-10 py-3 bg-slate-100 dark:bg-navy-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-all">
          Entendido
        </button>
      </div>
    </div>
  </DxPopup>
</template>

<script setup>
import { ref, onMounted, shallowRef, computed } from 'vue'
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  //DxPopup,
  DxForm,
  DxItem,
  DxSearchPanel,
  DxPaging,
  DxHeaderFilter
} from 'devextreme-vue/data-grid'
import { useRouter } from 'vue-router'
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'
import { formatDateHrs, formatStatusText, statusTextCellTemplate, getStatusMeta, formatDate } from '@/utils/herlpers'
import { priceFormatter } from '@/utils/herlpers'
import { ShoppingCartIcon, BuildingOfficeIcon, PlusIcon, PlusCircleIcon, CalendarIcon, UserIcon } from '@heroicons/vue/24/solid'
import { InformationCircleIcon, EyeIcon, DocumentCheckIcon, XCircleIcon, ArchiveBoxArrowDownIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import DxPopup from 'devextreme-vue/popup'
import DxSelectBox from 'devextreme-vue/select-box'
import { DxScrolling } from 'devextreme-vue/data-grid'

const companyId = localStorage.getItem('userIdCompany') || '1'
const userRole = Number(localStorage.getItem('rol') || '0')

const dxGrid = ref(null)
const showViewModal = ref(false)
const showHelp = ref(false)
const showNewProductPopup = ref(false)
const selectedItem = ref(null)
const modalItemsDataSource = ref(null)
const showNewOCModal = ref(false)
const newOrderSupplier = ref(null)
const newOrderIncludeIva = ref(true)
const newOrderPaymentCondition = ref('Contado')
const newOrderSpecialConditions = ref('')
const showCancelModal = ref(false)
const cancelReason = ref('')
const orderToCancel = ref(null)
const orderReceipts = ref([])

const approvedRequests = ref([])
const suppliers = ref([])

const router = useRouter()

const haveProducts = ref(false)

const actionsHelp = [
  {
    title: 'Ver Detalle',
    description: 'Visualiza la información completa de la orden, incluyendo productos y proveedor.',
    icon: EyeIcon,
    bgClass: 'bg-slate-500'
  },
  {
    title: 'Gestionar Ítems',
    description: 'Permite agregar, editar o eliminar productos de la orden mientras esté en borrador.',
    icon: ArchiveBoxArrowDownIcon,
    bgClass: 'bg-yellow-500'
  },
  {
    title: 'Aprobar Orden',
    description: 'Valida la orden de compra para que pueda ser enviada y procesada.',
    icon: DocumentCheckIcon,
    bgClass: 'bg-blue-600'
  },
  {
    title: 'Descargar PDF',
    description: 'Genera y descarga el documento oficial de la orden de compra en formato PDF.',
    icon: DocumentArrowDownIcon,
    bgClass: 'bg-emerald-500'
  },
  {
    title: 'Registrar Recepción',
    description: 'Permite anotar la entrada de productos recibidos asociados a esta orden.',
    icon: ArchiveBoxArrowDownIcon,
    bgClass: 'bg-indigo-500'
  },
  {
    title: 'Cancelar',
    description: 'Anula la orden de compra permanentemente.',
    icon: XCircleIcon,
    bgClass: 'bg-red-500'
  }
]


/* =========================
   EDITOR OPTIONS (CLAVE)
========================== */
const approvedRequestsEditorOptions = ref({
  items: [],
  valueExpr: 'id',
  displayExpr: 'tracking_code',
  searchEnabled: true,
  searchExpr: ['tracking_code'],
  searchMode: 'contains',
  showClearButton: true,
  placeholder: 'Seleccione una solicitud'
})

const suppliersEditorOptions = ref({
  items: [],
  valueExpr: 'id',
  displayExpr: item => {
    if (!item) return ''
    return `${item.name} (${item.rut})`
  },
  searchEnabled: true,
  searchExpr: ['name', 'rut'],
  searchMode: 'contains',
  showClearButton: true,
  placeholder: 'Seleccione proveedor'
})

/* =========================
   LOAD DATA
========================== */
onMounted(async () => {
  const [req, sup] = await Promise.all([
    conexionApi.get('/purchase-requests', {
      params: {
        company_id: Number(companyId),
        status: 'APPROVED'
      }
    }),
    conexionApi.get('/suppliers', {
      params: {
        company_id: Number(companyId)
      }
    })
  ])

  approvedRequests.value = req.data.requests || []
  suppliers.value = (sup.data.suppliers || []).map(s => ({
    ...s,
    display: `${s.name} (${s.rut})`
  }))
})

function abrirModalNuevaOC() {
  newOrderSupplier.value = null
  showNewOCModal.value = true
}

function cerrarModalNuevaOC() {
  showNewOCModal.value = false
}

async function confirmarNuevaOC() {
  if (!newOrderSupplier.value) {
    alert('Debe seleccionar un proveedor')
    return
  }

  try {
    const { data } = await conexionApi.post('/purchase-orders', {
      supplier_id: newOrderSupplier.value,
      company_id: companyId,
      user_id: Number(localStorage.getItem('userId')),
      include_iva: newOrderIncludeIva.value ? 1 : 0,
      payment_condition: newOrderPaymentCondition.value,
      special_conditions: newOrderSpecialConditions.value
    })

    showNewOCModal.value = false
    dxGrid.value?.instance.refresh()

    alert(`Orden de compra #${data.order_code} creada correctamente`)

    // Redirigir a items de la nueva OC
    router.push(`/dashboard/operations/procurement/orders/${data.purchase_order_id}/items`)
  } catch (err) {
    alert(err.response?.data?.mensaje || 'Error al crear la orden')
  }
}

/* =========================
   DATA SOURCE
========================== */
const dataSource = new CustomStore({
  key: 'id',


  load: async () => {
    const { data } = await conexionApi.get('/purchase-orders', {
      params: { company_id: companyId }
    })

    return data.orders
  },
  /*
    insert: async values => {
      const { data } = await conexionApi.post(
        `/purchase-orders/from-request/${values.request_id}`,
        { supplier_id: values.supplier_id }
      )
  
      dxGrid.value?.instance.refresh()
      return data
    }
      */
})

async function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
  await Promise.all([
    loadModalItems(data.id),
    loadModalReceipts(data.id)
  ])
}

function closeModals() {
  showViewModal.value = false
}

function irAPurchaseOrderItems(order) {
  router.push(`/dashboard/operations/procurement/orders/${order.id}/items`)
}
/* =========================
   BUTTONS
========================== */

const customButtons = [
  {
    hint: 'Ver',
    icon: 'custom-view',
    onClick: e => verRegistro(e.row.data)
  },
  {
    hint: 'Ver ítems',
    icon: 'box',
    cssClass: 'w-[25px]! h-[25px]! bg-yellow-400 rounded-full  p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 2) && status === 'DRAFT'
    },
    onClick: e => irAPurchaseOrderItems(e.row.data)
  },
  {
    hint: 'Aprobar',
    icon: 'custom-check',
    cssClass: 'w-[25px]! h-[25px]! bg-blue-400 rounded-full p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      const haveProducts = e.row.data.have_products
      return (userRole === 1 || userRole === 2) && status === 'DRAFT' && haveProducts > 0
    },
    onClick: async e => {
      try {
        const order = e.row.data
        await conexionApi.put(`/purchase-orders/${order.id}/approve`, {
          user_id: Number(localStorage.getItem('userId')),
          company_id: Number(localStorage.getItem('userIdCompany'))
        })
        dxGrid.value?.instance.refresh()
        alert('Orden aprobada correctamente ✅')
      } catch (err) {
        console.error('Error al aprobar la orden:', err)
        alert('Error al aprobar la orden 😬')
      }
    }
  },
  {
    hint: 'Descargar OC',
    icon: 'send',
    cssClass: 'w-[25px]! h-[25px]! bg-green-400 rounded-full p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (userRole === 1 || userRole === 2) && status === 'APPROVED'
    },
    onClick: async (e) => {
      try {
        const order = e.row.data

        // Llamada al backend para generar PDF
        const response = await conexionApi.put(
          `/purchase-orders/${order.id}/send`,
          {
            user_id: Number(localStorage.getItem('userId')),
            company_id: Number(localStorage.getItem('userIdCompany'))
          },
          { responseType: 'blob' } // <- muy importante
        )

        // Crear Blob y link temporal para descargar automáticamente
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `OC-${order.order_code}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        dxGrid.value?.instance.refresh()
        //alert('Orden enviada y PDF descargado ✅')
      } catch (err) {
        console.error('Error al enviar la orden:', err)
      }
    }
  },
  {
    hint: 'Cancelar',
    icon: 'custom-cancel-2',
    cssClass: 'w-[25px]! h-[25px]! bg-red-400 rounded-full   p-[4px]!',
    visible: (e) => {
      const status = e.row.data.status
      return (
        (userRole === 1 || userRole === 2) &&
        (status === 'DRAFT' || status === 'APPROVED')
      )
    },
    onClick: (e) => {
      orderToCancel.value = e.row.data
      cancelReason.value = ''
      showCancelModal.value = true
    }
  },
  {
    hint: 'Registrar recepción',
    icon: 'custom-box',
    cssClass: 'w-[25px]! h-[25px]! bg-indigo-400 rounded-full p-[4px]!',
    visible: (e) => {
      return (
        (userRole === 1 || userRole === 2) &&
        ['APPROVED', 'PARTIAL_RECEIVED'].includes(e.row.data.status)
      )
    },
    onClick: e => {
      router.push(
        `/dashboard/operations/procurement/orders/${e.row.data.id}/receipts/new`
      )
    }
  }

]

function cerrarModalCancel() {
  showCancelModal.value = false
  orderToCancel.value = null
}

async function confirmarCancelacion() {
  if (!cancelReason.value.trim()) {
    alert('Debe indicar un motivo')
    return
  }

  try {
    await conexionApi.put(`/purchase-orders/${orderToCancel.value.id}/cancel`, {
      user_id: Number(localStorage.getItem('userId')),
      company_id: Number(localStorage.getItem('userIdCompany')),
      rejection_reason: cancelReason.value
    })

    showCancelModal.value = false
    dxGrid.value?.instance.refresh()
    alert('Orden cancelada correctamente ❌')
  } catch (err) {
    console.error('Error al cancelar la orden:', err)
    alert(err.response?.data?.mensaje || 'No se pudo cancelar la orden 😬')
  }
}



function trackingCodeTemplate(container, options) {
  const code = options.data.tracking_code
  if (!code) {
    container.innerHTML = `<span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200/50 dark:border-amber-800/50">Orden sin solicitud</span>`
  } else {
    container.innerHTML = `<span class="text-slate-500 font-medium">${code}</span>`
  }
}

async function loadModalItems(orderId) {
  const { data } = await conexionApi.get(`/purchase-orders/${orderId}/items`)
  // agregamos product_name para mostrar en grid
  modalItemsDataSource.value = data.items.map(item => ({
    ...item,
    product_name: item.product_name || item.name

  }))
}
async function loadModalReceipts(orderId) {
  try {
    const { data } = await conexionApi.get(`/purchase-orders/${orderId}/receipts`)
    orderReceipts.value = data.receipts || []
  } catch (err) {
    console.error('Error cargando recepciones:', err)
    orderReceipts.value = []
  }
}

</script>
