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
    const [orderRes, itemsRes, whRes] = await Promise.all([
        conexionApi.get(`/purchase-orders`, {
            params: { id: orderId, company_id: companyId }
        }),
        conexionApi.get(`/purchase-orders/${orderId}/items`),
        conexionApi.get('/warehouses/getWarehouses/' + companyId)
    ])

    order.value = orderRes.data.orders[0]
    warehouses.value = whRes.data.warehouses
    //console.log(orderRes.data);

    items.value = itemsRes.data.items.map(i => {
        const pending = Number(i.quantity) - Number(i.received_quantity || 0)

        return {
            ...i,
            pending_quantity: pending,
            receive_now: 0,
            max_receivable: pending
        }
    })
})

const editorOptionsReceive = (e) => {
    return {
        min: 0,
        max: e?.row?.data?.max_receivable ?? 0,
        showSpinButtons: true
    }
}


/* =========================
   COMPUTED
========================== */
const canSubmit = computed(() =>
    selectedWarehouse.value &&
    items.value.some(i => Number(i.receive_now) > 0)
)

const statusMeta = computed(() =>
    order.value?.status ? getStatusMeta(order.value.status) : null
)

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

    await conexionApi.post('/purchase-receipts', payload)

    alert('Recepción registrada correctamente ✅')
    router.push('/dashboard/operations/procurement/purchase-orders')
}
</script>

<template>
    <!-- =========================
       HEADER
  ========================== -->
    <div class="max-w-11/12 mx-auto mb-6 pl-2 md:pl-5">
        <h1 class="text-2xl font-light text-navy-700 dark:text-white">
            Registrar Recepción
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            Orden de Compra
            <span class="font-semibold">#{{ order?.order_code }}</span>
        </p>
    </div>

    <!-- =========================
       CONTENEDOR
  ========================== -->
    <div class="mt-2 max-w-11/12 mx-auto rounded-2xl bg-white dark:!bg-navy-800 py-6 px-4 md:px-10 shadow-xl space-y-6">

        <!-- =========================
         INFO OC
    ========================== -->
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
      border border-gray-100
    `">
                    <span class="w-[10px] h-[10px] rounded-full animate-pulse" :class="statusMeta.pulseColor"></span>
                    <span class="text-[12px]">{{ statusMeta.text }}</span>
                </span>
            </div>

        </div>

        <!-- =========================
         BODEGA
    ========================== -->
        <div>
            <label class="text-sm text-gray-500 block">Bodega de recepción</label>
            <select v-model="selectedWarehouse"
                class="w-1/4 mt-1 rounded-lg dark:bg-navy-700 dark:border-navy-600 border border-gray-200 h-[35px] px-2 text-sm">
                <option :value="null">Seleccione bodega</option>
                <option v-for="w in warehouses" :key="w.id" :value="w.id">
                    {{ w.name }}
                </option>
            </select>
        </div>

        <!-- =========================
         ITEMS
    ========================== -->
        <DxDataGrid :data-source="items" key-expr="id" :show-borders="true" :column-auto-width="true">
            <DxColumn data-field="product_name" caption="Producto" :allow-editing="false" :css-class="'text-left!'" />
            <DxColumn data-field="quantity" caption="Comprado" data-type="number" :allow-editing="false" :css-class="'text-left!'" />
            <DxColumn data-field="received_quantity" caption="Recibido" data-type="number" :allow-editing="false" :css-class="'text-left!'" />
            <DxColumn data-field="pending_quantity" caption="Pendiente" data-type="number" :allow-editing="false" :css-class="'text-left!'" />

            <DxColumn data-field="receive_now" caption="Recibir ahora" data-type="number" :allow-editing="true"
                :editor-options="editorOptionsReceive" cell-template="receiveCell" :css-class="'text-left!'" />

            <template #receiveCell="{ data }">
                <div class="px-2 py-1 rounded-md border
           border-indigo-400 bg-indigo-50
           text-indigo-700 font-medium text-center
           cursor-pointer">
                    {{ data.value }}
                </div>
            </template>

            <DxEditing mode="cell" :allow-updating="true" :allow-adding="false" :allow-deleting="false" />
        </DxDataGrid>

        <!-- =========================
         NOTAS
    ========================== -->
        <div>
            <label class="text-sm text-gray-500">Observaciones</label>
            <textarea v-model="notes" rows="3"
                class="w-full mt-1 rounded-lg border-gray-300 dark:bg-navy-700 dark:border-navy-600" />
        </div>

        <!-- =========================
         ACTIONS
    ========================== -->
        <div class="flex justify-end gap-3">
            <button class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" @click="router.back()">
                Cancelar
            </button>

            <button class="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                :disabled="!canSubmit" @click="confirmReceipt">
                Confirmar recepción
            </button>
        </div>
    </div>
</template>
