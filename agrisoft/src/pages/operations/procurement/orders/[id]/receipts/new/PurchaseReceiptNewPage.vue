<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import conexionApi from '@/services/conexionApi'

import {
    DxDataGrid,
    DxColumn,
    DxEditing
} from 'devextreme-vue/data-grid'

import { statusTextCellTemplate, getStatusMeta } from '@/utils/herlpers'

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
        
        // Guardamos todas para lógica interna, pero filtraremos en el computed
        warehouses.value = whRes.data.warehouses

        items.value = itemsRes.data.items.map(i => {
            const pending = Number(i.quantity) - Number(i.received_quantity || 0)

            return {
                ...i,
                pending_quantity: pending,
                receive_now: 0, 
                max_receivable: pending
            }
        })
    } catch (error) {
        console.error("Error cargando datos", error);
    }
})

/* =========================
   COMPUTED
========================== */
// 1. FILTRO: Mostrar solo bodegas que NO son de distribución para recibir
const destinationWarehouses = computed(() => {
    return warehouses.value.filter(w => w.is_distribution !== 1 && w.is_distribution !== true);
});

const canSubmit = computed(() =>
    selectedWarehouse.value &&
    items.value.some(i => Number(i.receive_now) > 0)
)

const statusMeta = computed(() =>
    order.value?.status ? getStatusMeta(order.value.status) : null
)

/* =========================
   GRID EVENTS (FIX VALIDATION)
========================== */
// 2. CORRECCIÓN: Usar este evento para establecer el MAX dinámico por fila
const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow' && e.dataField === 'receive_now') {
        const maxQuantity = e.row.data.max_receivable;
        
        e.editorOptions.min = 0;
        e.editorOptions.max = maxQuantity;
        e.editorOptions.showSpinButtons = true;
        
        // Validación visual extra
        e.editorOptions.onValueChanged = (args) => {
            e.setValue(args.value); // Necesario para guardar el valor
            if (args.value > maxQuantity) {
               // Opcional: Toast o alerta suave
            }
        }
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
        warehouse_id: selectedWarehouse.value, // Bodega Destino
        received_by: userId,
        notes: notes.value,
        items: items.value
            .filter(i =>
                Number(i.receive_now) > 0 &&
                Number(i.receive_now) <= Number(i.pending_quantity)
            )
            .map(i => ({
                purchase_order_item_id: i.id,
                product_id: i.product_id,
                quantity_received: Number(i.receive_now)
            }))
    }

    try {
        await conexionApi.post('/purchase-receipts', payload)
        
        // Usar alguna librería de notificación si tienes (ej: SweetAlert o Toast)
        alert('Recepción y Tránsito generados correctamente ✅') 
        router.push('/dashboard/operations/procurement/purchase-orders')
    } catch (error) {
        // 3. CAPTURA DE ERROR DEL BACKEND (Ej: "Bodega Distribución no existe")
        const msg = error.response?.data?.mensaje || 'Error al procesar la recepción';
        alert('❌ ' + msg);
    }
}
</script>
<template>
    <div class="max-w-11/12 mx-auto mb-6 pl-2 md:pl-5">
        <h1 class="text-2xl font-light text-navy-700 dark:text-white">
            Registrar Recepción
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            Orden de Compra
            <span class="font-semibold">#{{ order?.order_code }}</span>
        </p>
    </div>
    
    <div class="mt-2 max-w-11/12 mx-auto rounded-2xl bg-white dark:!bg-navy-800 py-6 px-4 md:px-10 shadow-xl space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
                <p class="text-gray-500">Proveedor</p>
                <p class="font-medium">{{ order?.supplier_name }}</p>
            </div>
            <div>
                <p class="text-gray-500">Fecha</p>
                <p class="font-medium">{{ order?.created_at?.substring(0, 10) }}</p>
            </div>
            <div>
                <p class="text-gray-500">Estado</p>
                <span v-if="statusMeta" :class="`
                    rounded-full ${statusMeta.bgColor} ${statusMeta.textColor}
                    font-[400] px-3 h-[23px]
                    inline-flex items-center gap-1
                    border border-gray-100`">
                    <span class="w-[10px] h-[10px] rounded-full animate-pulse" :class="statusMeta.pulseColor"></span>
                    <span class="text-[12px]">{{ statusMeta.text }}</span>
                </span>
            </div>
        </div>

        <div>
            <label class="text-sm text-gray-500 block">
                Bodega de destino
                <span class="text-xs text-blue-500 ml-2">(Se generará tránsito desde Bodega Central)</span>
            </label>
            
            <select v-model="selectedWarehouse"
                class="w-1/4 mt-1 rounded-lg dark:bg-navy-700 dark:border-navy-600 border border-gray-200 h-[35px] px-2 text-sm">
                <option :value="null">Seleccione bodega destino</option>
                <option v-for="w in destinationWarehouses" :key="w.id" :value="w.id">
                    {{ w.name }}
                </option>
            </select>
            
            <p v-if="destinationWarehouses.length === 0 && warehouses.length > 0" class="text-xs text-red-500 mt-1">
                ⚠️ No hay bodegas de destino disponibles. Verifica que no todas sean de distribución.
            </p>
        </div>

        <DxDataGrid 
            :data-source="items" 
            key-expr="id" 
            :show-borders="true" 
            :column-auto-width="true"
            @editor-preparing="onEditorPreparing"
        >
            <DxColumn data-field="product_name" caption="Producto" :allow-editing="false" css-class="!text-left" />
            <DxColumn data-field="quantity" caption="Comprado" data-type="number" :allow-editing="false" css-class="!text-left" />
            <DxColumn data-field="received_quantity" caption="Recibido" data-type="number" :allow-editing="false" css-class="!text-left" />
            <DxColumn data-field="pending_quantity" caption="Pendiente" data-type="number" :allow-editing="false" css-class="!text-left" />

            <DxColumn 
                data-field="receive_now" 
                caption="Recibir ahora" 
                data-type="number" 
                :allow-editing="true"
                cell-template="receiveCell" 
                css-class="!text-left" 
            />

            <template #receiveCell="{ data }">
                <div :class="[
                    'px-2 py-1 rounded-md border font-medium text-center cursor-pointer',
                    data.value > 0 
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                ]">
                    {{ data.value }}
                </div>
            </template>

            <DxEditing mode="cell" :allow-updating="true" :allow-adding="false" :allow-deleting="false" />
        </DxDataGrid>

        <div>
            <label class="text-sm text-gray-500">Observaciones</label>
            <textarea v-model="notes" rows="3"
                class="w-full mt-1 rounded-lg border-gray-300 dark:bg-navy-700 dark:border-navy-600 focus:ring-indigo-500" />
        </div>

        <div class="flex justify-end gap-3">
            <button class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium" @click="router.back()">
                Cancelar
            </button>

            <button class="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg shadow-indigo-500/30 transition-all"
                :disabled="!canSubmit" @click="confirmReceipt">
                Confirmar recepción
            </button>
        </div>
    </div>
</template>