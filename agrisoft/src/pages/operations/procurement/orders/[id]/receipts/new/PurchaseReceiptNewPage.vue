<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import conexionApi from '@/services/conexionApi'
import { DocumentCheckIcon, MapPinIcon, BuildingOfficeIcon, CalendarIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import {
    DxDataGrid,
    DxColumn,
    DxEditing
} from 'devextreme-vue/data-grid'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxDateBox } from 'devextreme-vue/date-box'
import { DocumentTextIcon, CreditCardIcon } from '@heroicons/vue/24/solid'

import { statusTextCellTemplate, getStatusMeta, priceFormatter } from '@/utils/herlpers'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id

const companyId = Number(localStorage.getItem('userIdCompany'))
const userId = Number(localStorage.getItem('userId'))

const order = ref(null)
const items = ref([])
const warehouses = ref([])
const selectedWarehouse = ref(null)
const notes = ref('')
const invoiceNumber = ref('')
const documentDate = ref(new Date().toISOString().split('T')[0])
const paymentMethod = ref('Contado')
const paymentDate = ref(null)
const forceClose = ref(false)

/* =========================
   LOAD DATA
========================== */
onMounted(async () => {
    try {
        const [orderRes, itemsRes, whRes] = await Promise.all([
            conexionApi.get(`/purchase-orders`, {
                params: { id: orderId, company_id: companyId }
            }),
            conexionApi.get(`/purchase-orders/${orderId}/items`),
            conexionApi.get('/warehouses/getWarehouses/' + companyId)
        ])

        order.value = orderRes.data.orders[0]
        warehouses.value = whRes.data.warehouses

        // Auto-seleccionar bodega principal si existe, o la primera disponible
        const mainWh = warehouses.value.find(w => w.is_distribution === 1 || w.is_distribution === true)
        if (mainWh) {
            selectedWarehouse.value = mainWh.id
        } else if (warehouses.value.length > 0) {
            selectedWarehouse.value = warehouses.value[0].id
        }

        items.value = itemsRes.data.items.map(i => {
            const pending = Number(i.quantity) - Number(i.received_quantity || 0)
            return {
                ...i,
                pending_quantity: pending,
                receive_now: 0,
                max_receivable: pending,
                receipt_price: i.price // Valor inicial de la OC
            }
        })
    } catch (error) {
        console.error("Error cargando datos", error);
    }
})

/* =========================
   COMPUTED
========================== */
const destinationWarehouses = computed(() => {
    // Incluimos todas las bodegas pero nos aseguramos de que el usuario vea la principal
    return warehouses.value;
});

const canSubmit = computed(() => {
    const hasItemsToReceive = items.value.some(i => Number(i.receive_now) > 0)
    // Si hay items, la bodega es obligatoria.
    // Si no hay items, solo se puede enviar si forceClose es true (no requiere bodega).
    if (hasItemsToReceive) return !!selectedWarehouse.value
    return forceClose.value
})

const statusMeta = computed(() =>
    order.value?.status ? getStatusMeta(order.value.status) : null
)

/* =========================
   GRID EVENTS
========================== */
const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow' && e.dataField === 'receive_now') {
        const maxQuantity = e.row.data.max_receivable;
        e.editorOptions.min = 0;
        e.editorOptions.max = maxQuantity;
        e.editorOptions.showSpinButtons = true;
        e.editorOptions.onValueChanged = (args) => {
            e.setValue(args.value);
        }
    }
    if (e.parentType === 'dataRow' && e.dataField === 'receipt_price') {
        e.editorOptions.format = { type: 'currency', currency: 'CLP', precision: 0 };
    }
}

/* =========================
   ACTIONS
========================== */
async function confirmReceipt() {
    if (!canSubmit.value) return

    const payload = {
        company_id: companyId,
        purchase_order_id: orderId,
        warehouse_id: selectedWarehouse.value,
        received_by: userId,
        notes: notes.value,
        invoice_number: invoiceNumber.value,
        document_date: documentDate.value,
        payment_method: paymentMethod.value,
        payment_date: paymentDate.value,
        force_close: forceClose.value,
        items: items.value
            .filter(i =>
                Number(i.receive_now) > 0 &&
                Number(i.receive_now) <= Number(i.pending_quantity)
            )
            .map(i => ({
                purchase_order_item_id: i.id,
                product_id: i.product_id,
                quantity_received: Number(i.receive_now),
                price: Number(i.receipt_price)
            }))
    }

    try {
        await conexionApi.post('/purchase-receipts', payload)
        
        const successMsg = forceClose.value && items.value.filter(i => Number(i.receive_now) > 0).length === 0
            ? 'Orden cerrada manualmente correctamente ✅'
            : 'Recepción y Tránsito generados correctamente ✅';
            
        alert(successMsg)
        router.push('/dashboard/operations/procurement/purchase-orders')
    } catch (error) {
        const msg = error.response?.data?.mensaje || 'Error al procesar la recepción';
        alert('❌ ' + msg);
    }
}
</script>

<template>
    <!-- Page Header -->
    <div
        class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-6">
            <div
                class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
                <DocumentCheckIcon class="w-10 h-10 text-white" />
            </div>
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Registrar Recepción
                    </h1>
                    <span v-if="order?.order_code"
                        class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                        #{{ order.order_code }}
                    </span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">
                    Confirmando ingreso de productos para la orden de compra
                </p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <button @click="router.back()"
                class="px-6 py-3 bg-slate-50 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-navy-600 transition-all border border-slate-100 dark:border-navy-600">
                Volver
            </button>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <!-- Order Context & Destination -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Supplier info -->
            <div
                class="p-6 bg-white dark:bg-navy-800 rounded-3xl border border-slate-100 dark:border-navy-700 shadow-sm flex items-center gap-5">
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                    <BuildingOfficeIcon class="w-7 h-7" />
                </div>
                <div class="overflow-hidden">
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Proveedor</p>
                    <p class="text-base font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ order?.supplier_name || 'Cargando...' }}
                    </p>
                </div>
            </div>

            <!-- Date info -->
            <div
                class="p-6 bg-white dark:bg-navy-800 rounded-3xl border border-slate-100 dark:border-navy-700 shadow-sm flex items-center gap-5">
                <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                    <CalendarIcon class="w-7 h-7" />
                </div>
                <div>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Fecha Emisión</p>
                    <p class="text-base font-bold text-slate-800 dark:text-slate-200">
                        {{ order?.created_at?.substring(0, 10) || '--/--/----' }}
                    </p>
                </div>
            </div>


            <!-- DESTINATION WAREHOUSE (CRITICAL) -->
            <div
                class="p-6 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-100 dark:shadow-none flex items-center gap-5 text-white transform hover:scale-[1.02] transition-transform duration-300">
                <div class="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                    <MapPinIcon class="w-8 h-8" />
                </div>
                <div class="flex-grow">
                    <p class="text-[10px] text-blue-100 font-black uppercase tracking-widest mb-1">Bodega de Recepción
                    </p>
                    <div class="relative flex items-center">
                        <select v-model="selectedWarehouse"
                            class="w-full bg-transparent border-0 p-0 text-lg font-black placeholder-blue-200 focus:ring-0 cursor-pointer appearance-none pr-8">
                            <option :value="null" class="text-slate-800">Seleccionar bodega...</option>
                            <option v-for="w in destinationWarehouses" :key="w.id" :value="w.id" class="text-slate-800">
                                {{ w.name }} {{ w.is_distribution ? '(Principal)' : '' }}
                            </option>
                        </select>
                        <ChevronDownIcon class="w-5 h-5 absolute right-0 pointer-events-none opacity-50" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Warning Message -->
        <div v-if="destinationWarehouses.length === 0 && warehouses.length > 0"
            class="p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 text-sm font-bold rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-4">
            <div class="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <span>No hay bodegas de destino disponibles. Por favor, configure bodegas que no sean de distribución para
                poder recepcionar.</span>
        </div>

        <!-- Items Table -->
        <div
            class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700">
            <div
                class="p-8 border-b border-slate-100 dark:border-navy-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                        Detalle de Productos a Recibir
                    </h3>
                </div>
                <div
                    class="px-4 py-2 bg-slate-50 dark:bg-navy-700 rounded-full border border-slate-100 dark:border-navy-600">
                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Total Items: {{ items.length }}
                    </span>
                </div>
            </div>

            <div class="p-8">
                <DxDataGrid :data-source="items" key-expr="id" :show-borders="false" :column-auto-width="true"
                    :load-panel="{ enabled: false }" @editor-preparing="onEditorPreparing" class="modern-grid">
                    <DxColumn data-field="product_name" caption="Producto" :allow-editing="false"
                        css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" />
                    <DxColumn data-field="quantity" caption="Comprado" data-type="number" :allow-editing="false"
                        alignment="center" cell-template="qtyTemplate" />
                    <DxColumn data-field="received_quantity" caption="Recibido" data-type="number"
                        :allow-editing="false" alignment="center" cell-template="qtyTemplate" />
                    <DxColumn data-field="pending_quantity" caption="Pendiente" data-type="number"
                        :allow-editing="false" alignment="center" cell-template="qtyPendingTemplate" />

                    <DxColumn data-field="receive_now" caption="Recibir ahora" data-type="number" :allow-editing="true"
                        cell-template="receiveCell" alignment="center" />

                    <DxColumn data-field="receipt_price" caption="Precio Unit. ($)" data-type="number"
                        :allow-editing="false" alignment="right" cell-template="priceCell" />

                    <template #qtyTemplate="{ data }">
                        <span class="font-medium text-slate-600 dark:text-slate-400">{{ data.value }}</span>
                    </template>

                    <template #qtyPendingTemplate="{ data }">
                        <span
                            :class="['font-black', data.value > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400']">
                            {{ data.value }}
                        </span>
                    </template>

                    <template #receiveCell="{ data }">
                        <div :class="[
                            'group relative px-6 py-3 rounded-2xl border-2 font-black text-center transition-all duration-300 cursor-pointer',
                            data.value > 0
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md scale-105'
                                : 'border-slate-100 dark:border-navy-600 bg-slate-50 dark:bg-navy-700 text-slate-400 dark:text-slate-500 hover:border-blue-200'
                        ]">
                            <span class="text-lg">{{ data.value }}</span>
                            <div v-if="data.value > 0"
                                class="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </template>

                    <template #priceCell="{ data }">
                        <div
                            class="px-4 py-3 bg-slate-50 dark:bg-navy-900/50 rounded-xl font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-navy-700">
                            {{ priceFormatter(data.value) }}
                        </div>
                    </template>

                    <DxEditing mode="cell" :allow-updating="true" :allow-adding="false" :allow-deleting="false" />
                </DxDataGrid>
            </div>
        </div>

        <!-- Observations & Footer Actions -->
        <div
            class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl p-8 border border-slate-100 dark:border-navy-700 space-y-8">
            <div>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-1.5 h-6 bg-slate-200 dark:bg-navy-600 rounded-full"></div>
                    <label
                        class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Observaciones
                        de Recepción</label>
                </div>
                <textarea v-model="notes" rows="3" placeholder="Añada notas internas relevantes sobre esta recepción..."
                    class="w-full rounded-[2rem] border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-200" />
            </div>

            <!-- Document Info Section -->
            <!-- Document Info Section -->
            <div class="pt-8 border-t border-slate-100 dark:border-navy-700">
                <div class="flex items-center gap-3 mb-8">
                    <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Información del
                        Documento</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    <div class="space-y-3">
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1 block">N°
                            Factura /
                            Guía</label>
                        <div class="relative group">
                            <DocumentTextIcon
                                class="absolute left-4 top-[calc(50%-8px)] -translate-y-[50%] w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                            <input type="text" v-model="invoiceNumber" placeholder="Ej: 12345"
                                class="w-full h-[58px] mt-0 rounded-2xl border-slate-100 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 pl-12 pr-6 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all font-bold text-slate-700 dark:text-slate-200 !pl-[40px]" />
                        </div>
                    </div>

                    <div class="space-y-3">
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1 block">Fecha
                            Emisión</label>
                        <DxDateBox v-model:value="documentDate" type="date" display-format="dd/MM/yyyy"
                            class="premium-datebox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50 !h-[58px]" />
                    </div>

                    <div class="space-y-3">
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1 block">Forma
                            de
                            Pago</label>
                        <DxSelectBox v-model:value="paymentMethod" :items="['Contado', 'Crédito']"
                            class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50 !h-[58px]" />
                    </div>

                    <div v-if="paymentMethod === 'Crédito'" class="space-y-3 animate-in fade-in zoom-in duration-300">
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1 block">Fecha
                            de Pago</label>
                        <DxDateBox v-model:value="paymentDate" type="date" display-format="dd/MM/yyyy"
                            class="premium-datebox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50 !h-[58px]" />
                    </div>

                    <div class="space-y-3 flex flex-col">
                        <label
                            class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1 block opacity-0">Cerrar
                            orden</label>
                        <div @click="forceClose = !forceClose"
                            :class="`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border h-[58px] ${forceClose ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-slate-50 dark:bg-navy-900/50 border-slate-100 dark:border-navy-700'}`">
                            <div
                                :class="`w-12 h-6 rounded-full relative transition-all duration-300 ${forceClose ? 'bg-amber-500' : 'bg-slate-300 dark:bg-navy-600'}`">
                                <div
                                    :class="`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${forceClose ? 'translate-x-6' : 'translate-x-0'}`">
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <span
                                    :class="`text-[10px] font-black uppercase tracking-widest ${forceClose ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'}`">
                                    Cerrar Orden
                                </span>
                                <span class="text-[9px] text-slate-400 font-bold leading-none">Finalizar OC
                                    manualmente</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col md:flex-row justify-end gap-4 pt-4">
                <button
                    class="px-10 py-4 bg-white dark:bg-navy-800 border-2 border-slate-100 dark:border-navy-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-navy-700 hover:border-slate-200 transition-all"
                    @click="router.back()">
                    Descartar Cambios
                </button>

                <button
                    class="group px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95"
                    :disabled="!canSubmit" @click="confirmReceipt">
                    <DocumentCheckIcon class="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
                    {{ forceClose && !items.some(i => Number(i.receive_now) > 0) ? 'Cerrar Orden' : 'Confirmar Recepción' }}
                </button>
            </div>
        </div>
    </div>
</template>
