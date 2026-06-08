<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import conexionApi from '@/services/conexionApi'
import { priceFormatter } from '@/utils/herlpers'
import {
    CubeIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    ShoppingCartIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/solid'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxDateBox } from 'devextreme-vue/date-box'
import {
    DxDataGrid,
    DxColumn,
    DxEditing,
    DxScrolling,
    DxPaging,
    DxSearchPanel,
    DxButton,
    DxFilterRow,
    DxLookup
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const router = useRouter()
const route = useRoute()
const companyId = Number(localStorage.getItem('userIdCompany'))

/* ==================== STATE ==================== */
const loading = ref(false)
const step = ref(1) // 1 = seleccionar OC, 2 = completar ingreso

// Step 1
const purchaseOrders = ref([])
const selectedOCId = ref(null)
const selectedOC = ref(null)
const ocError = ref('')

// Step 2
const warehouses = ref([])
const selectedWarehouse = ref(null)
const notes = ref('')
const invoiceNumber = ref('')
const documentDate = ref(new Date().toISOString().split('T')[0])
const paymentCondition = ref('Contado')
const paymentSubMethod = ref('Efectivo')
const chequeNumber = ref('')
const cobroDate = ref('')
const selectedProducts = ref([])
const gridRef = ref(null)

// Filtros categoría
const selectedCategory = ref(null)
const selectedSubcategory = ref(null)
const allProducts = ref([])

/* ==================== COMPUTED ==================== */
const validOCs = computed(() =>
    purchaseOrders.value.filter(o => ['APPROVED', 'PARTIAL_RECEIVED'].includes(o.status))
)

const paymentMethodsList = computed(() => {
    if (paymentCondition.value === 'Contado') return ['Efectivo', 'Transferencia', 'Cheque']
    return ['Cheque', 'Cuenta Corriente', 'Transferencia']
})

watch(paymentCondition, (newVal) => {
    const list = newVal === 'Contado'
        ? ['Efectivo', 'Transferencia', 'Cheque']
        : ['Cheque', 'Cuenta Corriente', 'Transferencia']
    if (!list.includes(paymentSubMethod.value)) {
        paymentSubMethod.value = list[0]
    }
})

watch(selectedCategory, () => { selectedSubcategory.value = null })

const uniqueCategories = computed(() => {
    const cats = new Map()
    allProducts.value.forEach(p => {
        (p.category_links || []).forEach(cl => {
            if (cl.category_id && cl.category_name) cats.set(cl.category_id, cl.category_name)
        })
    })
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }))
})

const uniqueSubcategories = computed(() => {
    const subs = new Map()
    allProducts.value.forEach(p => {
        (p.category_links || []).forEach(cl => {
            if (cl.subcategory_id && cl.subcategory_name) {
                if (!selectedCategory.value || cl.category_id === selectedCategory.value) {
                    subs.set(cl.subcategory_id, cl.subcategory_name)
                }
            }
        })
    })
    return Array.from(subs.entries()).map(([id, name]) => ({ id, name }))
})

const filteredProducts = computed(() => {
    return allProducts.value.filter(p => {
        if (selectedCategory.value) {
            if (!(p.category_links || []).some(cl => cl.category_id === selectedCategory.value)) return false
        }
        if (selectedSubcategory.value) {
            if (!(p.category_links || []).some(cl => cl.subcategory_id === selectedSubcategory.value)) return false
        }
        return true
    })
})

const canSubmit = computed(() => {
    if (!selectedWarehouse.value) return false
    if (selectedProducts.value.length === 0) return false
    return selectedProducts.value.every(p => Number(p.quantity) > 0)
})

const isSelected = (productId) => selectedProducts.value.some(p => p.product_id === productId)

/* ==================== LOAD ==================== */
onMounted(async () => {
    loading.value = true
    try {
        const [ocRes, whRes, prodRes] = await Promise.all([
            conexionApi.get('/purchase-orders', { params: { company_id: companyId } }),
            conexionApi.get('/warehouses/getWarehouses/' + companyId),
            conexionApi.get('/products/' + companyId)
        ])
        purchaseOrders.value = ocRes.data.orders || []
        warehouses.value = (whRes.data.warehouses || []).filter(w => w.is_distribution !== 1 && w.is_distribution !== true)
        allProducts.value = (prodRes.data.products || []).filter(p => p.status === 1)

        if (warehouses.value.length === 1) {
            selectedWarehouse.value = warehouses.value[0].id
        }

        // Si viene con ?oc=ID desde la lista de OC, pre-seleccionar y continuar
        const ocQueryId = Number(route.query.oc)
        if (ocQueryId) {
            const found = purchaseOrders.value.find(o => o.id === ocQueryId)
            if (found) {
                selectedOCId.value = found.id
                await confirmarOC()
            }
        }
    } catch (e) {
        console.error('Error cargando datos:', e)
    } finally {
        loading.value = false
    }
})

/* ==================== STEP 1: Validar OC ==================== */
async function confirmarOC() {
    ocError.value = ''
    if (!selectedOCId.value) {
        ocError.value = 'Debe seleccionar una Orden de Compra.'
        return
    }

    const oc = purchaseOrders.value.find(o => o.id === selectedOCId.value)
    if (!oc) {
        ocError.value = 'La Orden de Compra no existe en el sistema.'
        return
    }
    if (!['APPROVED', 'PARTIAL_RECEIVED'].includes(oc.status)) {
        ocError.value = `La OC "${oc.order_code}" no está en estado válido para recepción (Estado actual: ${oc.status}).`
        return
    }

    // Cargar ítems de la OC para pre-poblar
    loading.value = true
    try {
        const itemsRes = await conexionApi.get(`/purchase-orders/${oc.id}/items`)
        const ocItems = itemsRes.data.items || []

        selectedOC.value = oc
        invoiceNumber.value = oc.invoice_number || ''
        documentDate.value = oc.created_at ? oc.created_at.split('T')[0] : new Date().toISOString().split('T')[0]

        // Pre-poblar productos desde la OC
        selectedProducts.value = ocItems.map(item => ({
            product_id: item.product_id,
            name: item.product_name || item.name || `Producto #${item.product_id}`,
            sku: item.sku || '',
            quantity: item.pending_quantity || item.quantity || 1,
            unit_of_measure: item.unit_of_measure || 'un',
            price: item.price || 0,
            currency: item.currency || 'CLP',
            exchange_rate: item.exchange_rate || 1.0000
        }))

        step.value = 2
    } catch (e) {
        ocError.value = 'Error al cargar los ítems de la OC. Intente nuevamente.'
        console.error(e)
    } finally {
        loading.value = false
    }
}

/* ==================== STEP 2: Products ==================== */
function addProduct(product) {
    const existingIndex = selectedProducts.value.findIndex(p => p.product_id === product.id)
    if (existingIndex !== -1) {
        selectedProducts.value[existingIndex].quantity++
    } else {
        selectedProducts.value.push({
            product_id: product.id,
            name: product.name,
            sku: product.sku,
            quantity: 1,
            unit_of_measure: product.unit_of_measure || 'un',
            price: product.price || 0,
            currency: product.currency || 'CLP',
            exchange_rate: 1.0000
        })
    }
    selectedProducts.value = [...selectedProducts.value]
}

function removeProduct(id) {
    selectedProducts.value = selectedProducts.value.filter(p => p.product_id !== id)
}

const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow') {
        if (e.dataField === 'quantity') {
            e.editorOptions.min = 0.01
            e.editorOptions.showSpinButtons = true
        }
        if (e.dataField === 'exchange_rate') {
            const currentCurrency = e.row.data?.currency || 'CLP'
            e.editorOptions.disabled = currentCurrency === 'CLP'
            if (currentCurrency === 'CLP') e.editorOptions.value = 1.0000
        }
    }
}

function setCurrencyValue(newData, value, currentRowData) {
    newData.currency = value
    if (value === 'CLP') {
        newData.exchange_rate = 1.0000
    } else if (currentRowData?.currency === 'CLP') {
        newData.exchange_rate = null
    }
}

function formatOriginalCurrency(value, currencyCode) {
    if (value == null) return ''
    if (!currencyCode || currencyCode === 'CLP') return priceFormatter(value)
    return currencyCode + ' ' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/* ==================== SUBMIT ==================== */
async function submitEntry() {
    if (!canSubmit.value) return

    loading.value = true

    let paymentDetail = `${paymentCondition.value} - ${paymentSubMethod.value}`
    if (paymentSubMethod.value === 'Cheque' && chequeNumber.value) {
        paymentDetail += ` N° ${chequeNumber.value}`
    }
    if (paymentCondition.value === 'Crédito' && cobroDate.value) {
        paymentDetail += ` (F. Cobro: ${cobroDate.value})`
    }

    const payload = {
        company_id: companyId,
        warehouse_id: selectedWarehouse.value,
        notes: notes.value,
        invoice_number: invoiceNumber.value,
        document_date: documentDate.value,
        payment_method: paymentDetail,
        payment_date: paymentCondition.value === 'Crédito' ? cobroDate.value : null,
        is_valued: 1,
        supplier_id: selectedOC.value?.supplier_id || null,
        purchase_order_id: selectedOC.value?.id || null,
        items: selectedProducts.value.map(p => ({
            product_id: p.product_id,
            quantity: Number(p.quantity),
            unit_of_measure: p.unit_of_measure || 'un',
            price: Number(p.price || 0),
            currency: p.currency || 'CLP',
            exchange_rate: Number(p.exchange_rate || 1.0000)
        }))
    }

    try {
        await conexionApi.post('/products/manual-entry', payload)
        alert('Ingreso de materiales registrado correctamente ✅')
        router.push('/dashboard/operations/warehouse-inventory')
    } catch (error) {
        const msg = error.response?.data?.mensaje || error.response?.data?.error || 'Error al procesar el ingreso'
        alert('❌ ' + msg)
        console.error('Error en submitEntry:', error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <LoadingOverlay :show="loading" />

    <!-- Page Header -->
    <div
        class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex items-center gap-6">
            <div
                class="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[1.5rem] shadow-xl shadow-indigo-200 dark:shadow-none transform transition-transform hover:scale-105">
                <ShoppingCartIcon class="w-10 h-10 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Ingreso con OC</h1>
                <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                    Registro de ingreso de materiales vinculado a una Orden de Compra
                </p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <button @click="step === 2 ? step = 1 : router.back()"
                class="px-6 py-3 bg-slate-50 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-navy-600 transition-all border border-slate-100 dark:border-navy-600 flex items-center gap-2">
                <ArrowLeftIcon class="w-5 h-5" />
                {{ step === 2 ? 'Cambiar OC' : 'Volver' }}
            </button>
        </div>
    </div>

    <!-- STEP 1: Selección y validación de OC -->
    <div v-if="step === 1" class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-xl p-10">
            <!-- Header card -->
            <div class="flex items-center gap-4 mb-8">
                <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                    <DocumentTextIcon class="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h2 class="text-xl font-black text-slate-800 dark:text-white">Seleccionar Orden de Compra</h2>
                    <p class="text-sm text-slate-400 font-medium">Solo se muestran OC en estado Aprobada o Recepción Parcial</p>
                </div>
            </div>

            <!-- Selector OC -->
            <div class="space-y-6">
                <div>
                    <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-2">
                        Orden de Compra
                    </label>
                    <DxSelectBox
                        v-model:value="selectedOCId"
                        :items="validOCs"
                        display-expr="order_code"
                        value-expr="id"
                        :search-enabled="true"
                        placeholder="Buscar por folio OC..."
                        class="premium-selectbox !rounded-2xl !border-slate-200 !bg-slate-50 dark:!bg-navy-900/50"
                        @value-changed="ocError = ''"
                    />
                </div>

                <!-- Preview OC seleccionada -->
                <div v-if="selectedOCId && validOCs.find(o => o.id === selectedOCId)"
                    class="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-black text-indigo-500 uppercase tracking-widest">Detalle OC</span>
                        <span class="px-3 py-1 rounded-full text-xs font-bold"
                            :class="validOCs.find(o => o.id === selectedOCId)?.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'">
                            {{ validOCs.find(o => o.id === selectedOCId)?.status === 'APPROVED' ? 'Aprobada' : 'Recepción Parcial' }}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span class="text-slate-400 text-xs uppercase tracking-wider">Folio</span>
                            <p class="font-black text-indigo-700 dark:text-indigo-300">
                                {{ validOCs.find(o => o.id === selectedOCId)?.order_code }}
                            </p>
                        </div>
                        <div>
                            <span class="text-slate-400 text-xs uppercase tracking-wider">Proveedor</span>
                            <p class="font-bold text-slate-700 dark:text-slate-200">
                                {{ validOCs.find(o => o.id === selectedOCId)?.supplier_name || 'Sin proveedor' }}
                            </p>
                        </div>
                        <div>
                            <span class="text-slate-400 text-xs uppercase tracking-wider">RUT Proveedor</span>
                            <p class="font-bold text-slate-600 dark:text-slate-300">
                                {{ validOCs.find(o => o.id === selectedOCId)?.supplier_rut || '-' }}
                            </p>
                        </div>
                        <div>
                            <span class="text-slate-400 text-xs uppercase tracking-wider">Fecha Emisión</span>
                            <p class="font-bold text-slate-600 dark:text-slate-300">
                                {{ validOCs.find(o => o.id === selectedOCId)?.created_at?.split('T')[0] || '-' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Error -->
                <div v-if="ocError" class="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30">
                    <ExclamationTriangleIcon class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p class="text-sm font-bold text-red-600 dark:text-red-400">{{ ocError }}</p>
                </div>

                <!-- OC no disponibles info -->
                <div v-if="purchaseOrders.length > 0 && validOCs.length === 0"
                    class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                    <ExclamationTriangleIcon class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p class="text-sm font-bold text-amber-600 dark:text-amber-400">
                        No hay Órdenes de Compra en estado Aprobada. Las OC deben ser aprobadas antes de registrar un ingreso.
                    </p>
                </div>

                <!-- Botón continuar -->
                <button
                    @click="confirmarOC"
                    :disabled="!selectedOCId || loading"
                    class="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl transition-all shadow-2xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 disabled:grayscale">
                    <CheckCircleIcon class="w-6 h-6" />
                    Continuar con esta OC
                </button>
            </div>
        </div>
    </div>

    <!-- STEP 2: Formulario de Ingreso (igual que DirectReceiptNewPage) -->
    <div v-if="step === 2">
        <!-- Banner OC vinculada -->
        <div class="mb-6 px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <DocumentTextIcon class="w-5 h-5 text-indigo-500" />
                <span class="text-sm font-black text-indigo-700 dark:text-indigo-300">
                    OC vinculada: {{ selectedOC?.order_code }}
                </span>
                <span class="text-sm text-slate-500 dark:text-slate-400">
                    · {{ selectedOC?.supplier_name }}
                </span>
            </div>
            <button @click="step = 1"
                class="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">
                Cambiar OC
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Bodega -->
                <div class="p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Destino</h3>
                    </div>
                    <div class="space-y-4">
                        <div class="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                            <label class="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-2 block">Bodega de Recepción</label>
                            <select v-model="selectedWarehouse"
                                class="w-full bg-transparent border-0 p-0 text-lg font-black text-emerald-900 dark:text-emerald-100 focus:ring-0 cursor-pointer appearance-none">
                                <option :value="null">Seleccionar bodega...</option>
                                <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block">Observaciones / Motivo</label>
                            <textarea v-model="notes" rows="3"
                                placeholder="Ej: Recepción parcial de la OC..."
                                class="w-full rounded-[2rem] border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-6 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-300 text-slate-700 dark:text-slate-200" />
                        </div>
                    </div>
                </div>

                <!-- Documento OC -->
                <div class="p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Documento</h3>
                    </div>
                    <div class="space-y-4">
                        <!-- Proveedor (read-only desde OC) -->
                        <div class="p-4 bg-slate-50 dark:bg-navy-900/40 rounded-2xl border border-slate-100 dark:border-navy-600">
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Proveedor (desde OC)</label>
                            <p class="font-black text-slate-700 dark:text-slate-200">{{ selectedOC?.supplier_name || '-' }}</p>
                            <p class="text-xs text-slate-400">{{ selectedOC?.supplier_rut }}</p>
                        </div>
                        <!-- N° Factura -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">N° Factura / Guía</label>
                            <input type="text" v-model="invoiceNumber" placeholder="000-000"
                                class="w-full rounded-2xl border-slate-100 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 px-6 py-3 focus:border-blue-500 transition-all font-bold" />
                        </div>
                        <!-- Fecha -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Fecha Emisión</label>
                            <DxDateBox v-model:value="documentDate" type="date" display-format="dd/MM/yyyy"
                                class="premium-datebox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                        </div>
                        <!-- Condición de Pago -->
                        <div class="pt-2">
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Condición de Pago</label>
                            <DxSelectBox v-model:value="paymentCondition" :items="['Contado', 'Crédito']"
                                class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                        </div>
                        <!-- Forma de Pago -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Forma de Pago</label>
                            <DxSelectBox v-model:value="paymentSubMethod" :items="paymentMethodsList"
                                class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                        </div>
                        <!-- N° Cheque -->
                        <div v-if="paymentSubMethod === 'Cheque'">
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">N° de Cheque</label>
                            <input type="text" v-model="chequeNumber" placeholder="Ej: 123456"
                                class="w-full rounded-2xl border-slate-100 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 px-6 py-3 focus:border-blue-500 transition-all font-bold" />
                        </div>
                        <!-- Fecha Cobro -->
                        <div v-if="paymentCondition === 'Crédito'">
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Fecha de Cobro</label>
                            <input type="date" v-model="cobroDate"
                                class="w-full rounded-2xl border-slate-100 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 px-6 py-3 focus:border-blue-500 transition-all font-bold" />
                        </div>
                    </div>
                </div>

                <button
                    class="group w-full py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95"
                    :disabled="!canSubmit" @click="submitEntry">
                    <CheckCircleIcon class="w-7 h-7 transform group-hover:rotate-12 transition-transform" />
                    Confirmar Ingreso
                </button>
            </div>

            <!-- Main: Selección de Productos + Detalle -->
            <div class="lg:col-span-2 space-y-8">
                <!-- 1. Seleccionar Productos adicionales -->
                <div class="p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Agregar Productos</h3>
                    </div>

                    <!-- Filtros -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Categoría</label>
                            <DxSelectBox v-model:value="selectedCategory" :items="uniqueCategories" display-expr="name" value-expr="id"
                                :show-clear-button="true" placeholder="Todas las categorías..."
                                class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Subcategoría</label>
                            <DxSelectBox v-model:value="selectedSubcategory" :items="uniqueSubcategories" display-expr="name" value-expr="id"
                                :show-clear-button="true" placeholder="Todas las subcategorías..."
                                class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                        </div>
                    </div>

                    <div class="grid-container">
                        <DxDataGrid :data-source="filteredProducts" :show-borders="false" :height="340" key-expr="id" class="selection-grid">
                            <DxSearchPanel :visible="true" :width="240" placeholder="Buscar producto..." />
                            <DxFilterRow :visible="false" />
                            <DxScrolling mode="virtual" />
                            <DxPaging :page-size="20" />

                            <DxColumn data-field="sku" caption="SKU" :width="100" css-class="!text-left font-black text-blue-600" />
                            <DxColumn data-field="name" caption="Producto" css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" />
                            <DxColumn caption="Categoría"
                                :calculate-cell-value="data => (data.category_links || []).map(cl => `${cl.category_name} > ${cl.subcategory_name}`).join(', ')"
                                css-class="!text-left text-slate-500" />
                            <DxColumn :width="80" caption="Añadir" cell-template="addTemplate" alignment="center" />

                            <template #addTemplate="{ data }">
                                <button @click="addProduct(data.data)" :class="[
                                    'p-2 rounded-lg transition-all !w-fit',
                                    isSelected(data.data.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                                ]">
                                    <CheckCircleIcon v-if="isSelected(data.data.id)" class="w-5 h-5" />
                                    <PlusIcon v-else class="w-5 h-5" />
                                </button>
                            </template>
                        </DxDataGrid>
                    </div>
                </div>

                <!-- 2. Detalle del Ingreso -->
                <div class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700">
                    <div class="p-8 border-b border-slate-100 dark:border-navy-700 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Detalle del Ingreso</h3>
                        </div>
                        <span class="px-4 py-2 bg-slate-50 dark:bg-navy-700 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {{ selectedProducts.length }} items
                        </span>
                    </div>

                    <div class="p-8">
                        <DxDataGrid :data-source="selectedProducts" key-expr="product_id" :show-borders="false"
                            :column-auto-width="true" @editor-preparing="onEditorPreparing" ref="gridRef"
                            class="modern-grid">
                            <DxColumn data-field="sku" caption="SKU" :allow-editing="false" :width="110" css-class="!text-left font-black text-blue-600" />
                            <DxColumn data-field="name" caption="Producto" :allow-editing="false" css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" />
                            <DxColumn data-field="quantity" caption="Cantidad" data-type="number" :allow-editing="true" alignment="center" cell-template="qtyCell" />
                            <DxColumn data-field="unit_of_measure" caption="U.M." :allow-editing="true" alignment="left" css-class="!text-left">
                                <DxLookup :data-source="['kg', 't', 'm3', 'l', 'un']" />
                            </DxColumn>
                            <DxColumn data-field="price" caption="Precio Unit." data-type="number" :allow-editing="true"
                                alignment="right" css-class="!font-black text-blue-600 dark:text-blue-400 !text-left" cell-template="priceCellTemplate" />
                            <DxColumn data-field="currency" caption="Moneda" :allow-editing="true"
                                alignment="left" css-class="!text-left" :set-cell-value="setCurrencyValue">
                                <DxLookup :data-source="['CLP', 'USD', 'EUR']" />
                            </DxColumn>
                            <DxColumn data-field="exchange_rate" caption="T.C." data-type="number" :allow-editing="true"
                                format="#,##0.0000" alignment="right" css-class="!text-left" />
                            <DxColumn caption="Total Moneda"
                                :calculate-cell-value="data => data.quantity * data.price"
                                alignment="right" css-class="!font-medium text-slate-500 !text-left" cell-template="totalOriginalCellTemplate"
                                :allow-filtering="false" :allow-header-filtering="false" />
                            <DxColumn name="totalCLP" caption="Total CLP"
                                :calculate-cell-value="data => data.quantity * data.price * (Number(data.exchange_rate) || 1)"
                                alignment="right" css-class="!font-black text-slate-800 dark:text-white !text-left"
                                cell-template="totalCLPCellTemplate" :allow-filtering="false" :allow-header-filtering="false" />
                            <DxColumn type="buttons" :width="60">
                                <DxButton icon="trash" @click="(e) => removeProduct(e.row.data.product_id)" />
                            </DxColumn>

                            <template #qtyCell="{ data }">
                                <div class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800/30 rounded-xl text-emerald-700 dark:text-emerald-300 font-black text-center">
                                    {{ data.value }}
                                </div>
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

                            <DxEditing mode="cell" :allow-updating="true" :allow-deleting="true" />
                            <DxScrolling mode="virtual" />
                        </DxDataGrid>

                        <div v-if="selectedProducts.length === 0"
                            class="flex flex-col items-center justify-center py-12 text-slate-400 opacity-40">
                            <CubeIcon class="w-16 h-16 mb-4" />
                            <p class="font-black uppercase tracking-widest">No hay productos en el ingreso</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* DevExtreme Selection Grid Overrides */
:deep(.selection-grid) {
    background-color: transparent !important;
}
:deep(.selection-grid .dx-datagrid-header-panel) {
    padding: 0 0 1rem 0;
    background-color: transparent;
}
:deep(.selection-grid .dx-datagrid-search-panel) {
    margin: 0;
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
}
:deep(.selection-grid .dx-textbox) {
    border-radius: 1rem;
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
}
</style>
