<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import conexionApi from '@/services/conexionApi'
import { priceFormatter } from '@/utils/herlpers'
import {
    CubeIcon,
    MapPinIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    CreditCardIcon
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
    DxToolbar,
    DxItem as DxToolbarItem,
    DxButton,
    DxFilterRow,
    DxLookup
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { DxTextBox } from 'devextreme-vue/text-box'

const router = useRouter()
const companyId = Number(localStorage.getItem('userIdCompany'))
const userId = Number(localStorage.getItem('userId'))

const loading = ref(false)
const warehouses = ref([])
const products = ref([])
const selectedWarehouse = ref(null)
const notes = ref('')
const invoiceNumber = ref('')
const documentDate = ref(new Date().toISOString().split('T')[0])
const paymentCondition = ref('Contado')
const paymentSubMethod = ref('Efectivo')
const chequeNumber = ref('')
const cobroDate = ref('')
const selectedProducts = ref([]) // { product_id, name, sku, quantity }

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
const searchQuery = ref('')
const gridRef = ref(null)

// Filtros de categoría/subcategoría
const selectedCategory = ref(null)
const selectedSubcategory = ref(null)

watch(selectedCategory, () => {
    selectedSubcategory.value = null
})

const uniqueCategories = computed(() => {
    const cats = new Map()
    products.value.forEach(p => {
        if (p.category_links) {
            p.category_links.forEach(cl => {
                if (cl.category_id && cl.category_name) {
                    cats.set(cl.category_id, cl.category_name)
                }
            })
        }
    })
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }))
})

const uniqueSubcategories = computed(() => {
    const subs = new Map()
    products.value.forEach(p => {
        if (p.category_links) {
            p.category_links.forEach(cl => {
                if (cl.subcategory_id && cl.subcategory_name) {
                    if (!selectedCategory.value || cl.category_id === selectedCategory.value) {
                        subs.set(cl.subcategory_id, cl.subcategory_name)
                    }
                }
            })
        }
    })
    return Array.from(subs.entries()).map(([id, name]) => ({ id, name }))
})

const filteredProducts = computed(() => {
    return products.value.filter(p => {
        if (selectedCategory.value) {
            const hasCat = (p.category_links || []).some(cl => cl.category_id === selectedCategory.value)
            if (!hasCat) return false
        }
        if (selectedSubcategory.value) {
            const hasSub = (p.category_links || []).some(cl => cl.subcategory_id === selectedSubcategory.value)
            if (!hasSub) return false
        }
        return true
    })
})

/* =========================
   LOAD DATA
========================== */
const suppliers = ref([])
const isValued = ref(true)
const selectedSupplier = ref(null)

onMounted(async () => {
    loading.value = true
    try {
        const [whRes, prodRes, supRes] = await Promise.all([
            conexionApi.get('/warehouses/getWarehouses/' + companyId),
            conexionApi.get('/products/' + companyId),
            conexionApi.get('/suppliers', { params: { company_id: companyId } })
        ])

        warehouses.value = whRes.data.warehouses.filter(w => w.is_distribution !== 1 && w.is_distribution !== true)
        products.value = prodRes.data.products.filter(p => p.status === 1)
        suppliers.value = (supRes.data.suppliers || []).map(s => ({
            ...s,
            display: `${s.name} (${s.rut})`
        }))

        if (warehouses.value.length === 1) {
            selectedWarehouse.value = warehouses.value[0].id
        }
    } catch (error) {
        console.error("Error cargando datos", error);
    } finally {
        loading.value = false
    }
})

/* =========================
   COMPUTED
========================== */
const canSubmit = computed(() => {
    if (!selectedWarehouse.value) return false
    if (selectedProducts.value.length === 0) return false
    if (isValued.value && !selectedSupplier.value) return false
    return selectedProducts.value.every(p => Number(p.quantity) > 0)
})

/* =========================
   ACTIONS
========================== */
const isSelected = (productId) => selectedProducts.value.some(p => p.product_id === productId)

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
            price: 0,
            currency: product.currency || 'CLP',
            exchange_rate: 1.0000
        })
    }
    // Forzamos actualización de la referencia para que DevExtreme detecte el cambio
    selectedProducts.value = [...selectedProducts.value]
}

function removeProduct(id) {
    selectedProducts.value = selectedProducts.value.filter(p => p.product_id !== id)
}

async function submitEntry() {
    if (!canSubmit.value) return

    if (isValued.value && !selectedSupplier.value) {
        alert('Debe seleccionar un proveedor para el ingreso valorizado')
        return
    }

    loading.value = true

    // Serializar forma de pago
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
        payment_method: isValued.value ? paymentDetail : null,
        payment_date: (isValued.value && paymentCondition.value === 'Crédito') ? cobroDate.value : null,
        is_valued: isValued.value ? 1 : 0,
        supplier_id: isValued.value ? selectedSupplier.value : null,
        items: selectedProducts.value.map(p => ({
            product_id: p.product_id,
            quantity: Number(p.quantity),
            unit_of_measure: p.unit_of_measure || 'un',
            price: isValued.value ? Number(p.price || 0) : 0,
            currency: isValued.value ? (p.currency || 'CLP') : 'CLP',
            exchange_rate: isValued.value ? Number(p.exchange_rate || 1.0000) : 1.0000
        }))
    }

    try {
        // Ahora usamos el nuevo endpoint que creamos en el backend para ingresos manuales
        await conexionApi.post('/products/manual-entry', payload)
        alert('Ingreso de materiales registrado correctamente ✅')
        router.push('/dashboard/operations/warehouse-inventory')
    } catch (error) {
        const msg = error.response?.data?.mensaje || error.response?.data?.error || 'Error al procesar el ingreso';
        alert('❌ ' + msg);
        console.error('Error en submitEntry:', error);
    } finally {
        loading.value = false
    }
}

const onEditorPreparing = (e) => {
    if (e.parentType === 'dataRow') {
        if (e.dataField === 'quantity') {
            e.editorOptions.min = 0.01;
            e.editorOptions.showSpinButtons = true;
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

function setCurrencyValue(newData, value, currentRowData) {
    newData.currency = value;
    if (value === 'CLP') {
        newData.exchange_rate = 1.0000;
    } else if (currentRowData?.currency === 'CLP') {
        newData.exchange_rate = null;
    }
}

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
</script>

<template>
    <LoadingOverlay :show="loading" />

    <!-- Page Header -->
    <div
        class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-6">
            <div
                class="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[1.5rem] shadow-xl shadow-emerald-200 dark:shadow-none transform transition-transform hover:scale-105">
                <CubeIcon class="w-10 h-10 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Ingreso de Materiales</h1>
                <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">
                    Registrar entrada directa o reingreso de insumos al inventario
                </p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <button @click="router.back()"
                class="px-6 py-3 bg-slate-50 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-navy-600 transition-all border border-slate-100 dark:border-navy-600 flex items-center gap-2">
                <ArrowLeftIcon class="w-5 h-5" />
                Volver
            </button>
        </div>
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
                            placeholder="Ej: Reingreso de sobrantes de aplicación en Sector A..."
                            class="w-full rounded-[2rem] border-slate-200 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 p-6 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-300 text-slate-700 dark:text-slate-200" />
                    </div>
                </div>
            </div>

            <!-- Documento (solo si valorizado) -->
            <div v-if="isValued" class="p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Documento</h3>
                </div>
                <div class="space-y-4">
                    <!-- Proveedor -->
                    <div>
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Proveedor</label>
                        <DxSelectBox v-model:value="selectedSupplier" :items="suppliers" display-expr="display" value-expr="id"
                            :search-enabled="true" placeholder="Seleccionar proveedor..."
                            class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
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
                    <!-- Fecha de Cobro -->
                    <div v-if="paymentCondition === 'Crédito'">
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Fecha de Cobro</label>
                        <input type="date" v-model="cobroDate"
                            class="w-full rounded-2xl border-slate-100 dark:border-navy-600 bg-slate-50 dark:bg-navy-900/50 px-6 py-3 focus:border-blue-500 transition-all font-bold" />
                    </div>
                </div>
            </div>

            <button
                class="group w-full py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-95"
                :disabled="!canSubmit" @click="submitEntry">
                <CheckCircleIcon class="w-7 h-7 transform group-hover:rotate-12 transition-transform" />
                Confirmar Ingreso
            </button>
        </div>

        <!-- Main: Selección de Productos + Detalle -->
        <div class="lg:col-span-2 space-y-8">
            <!-- 1. Selección de Productos -->
            <div class="p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Seleccionar Productos</h3>
                </div>

                <!-- Filtros de Categoría y Subcategoría -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Filtrar por Categoría</label>
                        <DxSelectBox v-model:value="selectedCategory" :items="uniqueCategories" display-expr="name" value-expr="id"
                            :show-clear-button="true" placeholder="Todas las categorías..."
                            class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4 block mb-1">Filtrar por Subcategoría</label>
                        <DxSelectBox v-model:value="selectedSubcategory" :items="uniqueSubcategories" display-expr="name" value-expr="id"
                            :show-clear-button="true" placeholder="Todas las subcategorías..."
                            class="premium-selectbox !rounded-2xl !border-slate-100 !bg-slate-50 dark:!bg-navy-900/50" />
                    </div>
                </div>

                <div class="grid-container">
                    <DxDataGrid :data-source="filteredProducts" :show-borders="false" :height="380" key-expr="id"
                        class="selection-grid">
                        <DxSearchPanel :visible="true" :width="240" placeholder="Buscar SKU, nombre o componente..." />
                        <DxFilterRow :visible="false" />
                        <DxScrolling mode="virtual" />
                        <DxPaging :page-size="20" />

                        <DxColumn data-field="sku" caption="SKU" :width="100" css-class="!text-left font-black text-blue-600" />
                        <DxColumn data-field="name" caption="Producto" css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" />
                        <DxColumn caption="Categoría"
                            :calculate-cell-value="data => (data.category_links || []).map(cl => `${cl.category_name} > ${cl.subcategory_name}`).join(', ')"
                            css-class="!text-left text-slate-500" />
                        <DxColumn data-field="active_ingredient" caption="Comp. Activo" css-class="!text-left text-slate-500" />
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

            <!-- 2. Detalle del Ingreso con toggle valorizado -->
            <div class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700">
                <!-- Header del detalle con toggle -->
                <div class="p-8 border-b border-slate-100 dark:border-navy-700 flex flex-wrap justify-between items-center gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Detalle del Ingreso</h3>
                    </div>

                    <div class="flex items-center gap-4">
                        <!-- Badge items -->
                        <span class="px-4 py-2 bg-slate-50 dark:bg-navy-700 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {{ selectedProducts.length }} items
                        </span>
                        <!-- Toggle Valorizado -->
                        <label class="flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-2xl border transition-all"
                            :class="isValued
                                ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-slate-50 border-slate-100 dark:bg-navy-700 dark:border-navy-600'">
                            <!-- Toggle pill -->
                            <div @click="isValued = !isValued"
                                :class="`w-11 h-6 rounded-full relative transition-all duration-300 cursor-pointer ${isValued ? 'bg-blue-600' : 'bg-slate-300 dark:bg-navy-500'}`">
                                <div :class="`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isValued ? 'translate-x-5' : 'translate-x-0'}`"></div>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-black uppercase tracking-wider leading-none"
                                    :class="isValued ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'">
                                    {{ isValued ? 'Valorizado' : 'No Valorizado' }}
                                </span>
                                <span class="text-[9px] text-slate-400 leading-none mt-0.5">
                                    {{ isValued ? 'Con datos de OC' : 'Solo cantidad y U.M.' }}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="p-8">
                    <DxDataGrid :data-source="selectedProducts" key-expr="product_id" :show-borders="false"
                        :column-auto-width="true" @editor-preparing="onEditorPreparing" ref="gridRef"
                        class="modern-grid">
                        <DxColumn data-field="sku" caption="SKU" :allow-editing="false" :width="110"
                            css-class="!text-left font-black text-blue-600" />
                        <DxColumn data-field="name" caption="Producto" :allow-editing="false"
                            css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" />
                        <DxColumn data-field="quantity" caption="Cantidad" data-type="number" :allow-editing="true"
                            alignment="center" cell-template="qtyCell" />
                        <DxColumn data-field="unit_of_measure" caption="U.M." :allow-editing="true" alignment="left" css-class="!text-left">
                            <DxLookup :data-source="['kg', 't', 'm3', 'l', 'un']" />
                        </DxColumn>

                        <!-- Columnas solo si Valorizado -->
                        <DxColumn v-if="isValued" data-field="price" caption="Precio Unit." data-type="number" :allow-editing="true"
                            alignment="right" css-class="!font-black text-blue-600 dark:text-blue-400 !text-left" cell-template="priceCellTemplate" />
                        <DxColumn v-if="isValued" data-field="currency" caption="Moneda" :allow-editing="true"
                            alignment="left" css-class="!text-left" :set-cell-value="setCurrencyValue">
                            <DxLookup :data-source="['CLP', 'USD', 'EUR']" />
                        </DxColumn>
                        <DxColumn v-if="isValued" data-field="exchange_rate" caption="T.C." data-type="number" :allow-editing="true"
                            format="#,##0.0000" alignment="right" css-class="!text-left" />
                        <DxColumn v-if="isValued" caption="Total Moneda"
                            :calculate-cell-value="data => data.quantity * data.price"
                            alignment="right" css-class="!font-medium text-slate-500 !text-left" cell-template="totalOriginalCellTemplate"
                            :allow-filtering="false" :allow-header-filtering="false" />
                        <DxColumn v-if="isValued" name="totalCLP" caption="Total CLP"
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
                        <p class="font-black uppercase tracking-widest">No hay productos seleccionados</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #1e293b;
}

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

:deep(.dark .selection-grid .dx-textbox) {
    background-color: #0f172a;
    border-color: #1e293b;
}

:deep(.dx-button.selected-btn) {
    background-color: #2563eb !important;
    color: white !important;
    border-radius: 0.5rem;
}
</style>
