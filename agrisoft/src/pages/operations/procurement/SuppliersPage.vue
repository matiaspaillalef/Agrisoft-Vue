<template>
    <!-- Page Header -->
    <div
        class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
        <div class="flex items-center gap-6">
            <div
                class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
                <BuildingOfficeIcon class="w-10 h-10 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Gestión de Proveedores
                </h1>
                <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">Administración de
                    socios comerciales y proveedores de insumo</p>
            </div>
        </div>
    </div>

    <!-- Main Content Area -->
    <div
        class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div class="p-8">
            <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="false"
                :column-auto-width="true" :load-panel="{ enabled: false }" @editor-preparing="onEditorPreparing"
                @saving="onSaving" class="modern-grid">
                <DxSearchPanel :visible="true" placeholder="Buscar por RUT, Nombre o Ciudad..." />
                <DxPaging :page-size="15" />

                <DxColumn data-field="rut" caption="RUT" alignment="left"
                    css-class="!text-left font-black text-blue-600" />
                <DxColumn data-field="name" caption="Razón Social"
                    css-class="!text-left font-bold text-slate-700 dark:!text-slate-200" />
                <DxColumn data-field="contact_name" caption="Nombre de Contacto" alignment="left" css-class="!text-left" />
                <DxColumn data-field="email" caption="Email de Contacto" alignment="right" css-class="!text-left" />
                <DxColumn data-field="phone" caption="Teléfono" alignment="right" css-class="!text-left" />
                <DxColumn data-field="address" caption="Dirección" alignment="left" css-class="!text-left" />
                <DxColumn data-field="city" caption="Ciudad" alignment="left" css-class="!text-left" />
                <DxColumn data-field="status" caption="Estado" :cell-template="statusTextCellTemplate" alignment="right"
                    css-class="!text-left" />

                <DxColumn type="buttons" width="140" :buttons="customButtons" />

                <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true"
                    :use-icons="true">
                    <DxPopup title="Gestión de Proveedor" :width="650" :height="500" />
                    <DxForm :col-count="2" label-location="top">
                        <DxItem data-field="rut" editor-type="dxTextBox" :editor-options="{
                            valueChangeEvent: 'input',
                            onValueChanged(e) {
                                if (!e.value) return
                                const formatted = formatearRutConPuntos(e.value)
                                if (formatted !== e.value) {
                                    e.component.option('value', formatted)
                                    const form = e.component.option('form')
                                    form?.updateData('rut', formatted)
                                }
                            }
                        }" :validation-rules="[
                            { type: 'required', message: 'El RUT es obligatorio' },
                            { type: 'custom', message: 'RUT chileno inválido', validationCallback: (e) => validarRutChileno(e.value) }
                        ]">
                            <DxLabel text="RUT" />
                        </DxItem>

                        <DxItem data-field="name">
                            <DxLabel text="Razón Social" />
                        </DxItem>
                        <DxItem data-field="contact_name">
                            <DxLabel text="Nombre de Contacto" />
                        </DxItem>
                        <DxItem data-field="email">
                            <DxLabel text="Email de Contacto" />
                        </DxItem>
                        <DxItem data-field="phone">
                            <DxLabel text="Teléfono" />
                        </DxItem>
                        <DxItem data-field="address">
                            <DxLabel text="Dirección Comercial" />
                        </DxItem>
                        <DxItem data-field="city">
                            <DxLabel text="Ciudad" />
                        </DxItem>
                        <DxItem data-field="status" editor-type="dxSelectBox"
                            :editor-options="{ items: ['ACTIVE', 'INACTIVE'] }">
                            <DxLabel text="Estado" />
                        </DxItem>
                    </DxForm>
                </DxEditing>
            </DxDataGrid>
        </div>
    </div>

    <!-- MODAL VER DETALLE (PREMIUM) -->
    <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[999] p-4">
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModals"></div>

        <div
            class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-100 dark:border-navy-700 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            <!-- Header -->
            <div class="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
                <div class="relative z-10">
                    <div class="flex items-center gap-5 mb-4">
                        <div class="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                            <BuildingOfficeIcon class="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-black tracking-tight leading-tight">{{ selectedItem?.name }}</h2>
                            <p class="text-blue-100 font-bold text-sm tracking-widest uppercase mt-1">RUT:
                                {{ selectedItem?.rut }}
                            </p>
                        </div>
                    </div>

                    <div v-if="selectedItem?.status"
                        :class="`px-5 py-2 rounded-full border-2 inline-flex items-center gap-2 border-white/20 bg-white/10 shadow-sm`">
                        <span
                            :class="`w-2.5 h-2.5 rounded-full animate-pulse ${getStatusMeta(selectedItem.status).pulseColor}`"></span>
                        <span
                            class="font-black text-[10px] uppercase tracking-[0.2em]">{{ getStatusMeta(selectedItem.status).text }}</span>
                    </div>
                </div>
                <BuildingOfficeIcon class="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
            </div>

            <!-- Body -->
            <div class="p-8 space-y-8">
                <div class="space-y-4">
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
                        Información de Contacto & Ubicación
                    </h3>

                    <div
                        class="bg-slate-50 dark:bg-navy-900/50 rounded-3xl p-6 border border-slate-100 dark:border-navy-700 space-y-4">
                        <div
                            class="flex items-center gap-5 p-4 bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-slate-50 dark:border-navy-700 transition-all hover:shadow-md">
                            <div
                                class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 transition-transform group-hover:scale-110">
                                <IdentificationIcon class="w-6 h-6" />
                            </div>
                            <div>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Nombre de Contacto</p>
                                <p class="text-base font-bold text-slate-800 dark:text-slate-200">
                                    {{ selectedItem?.contact_name || 'No registrado' }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="flex items-center gap-5 p-4 bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-slate-50 dark:border-navy-700 transition-all hover:shadow-md">
                            <div
                                class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 transition-transform group-hover:scale-110">
                                <EnvelopeIcon class="w-6 h-6" />
                            </div>
                            <div>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Correo
                                    Electrónico</p>
                                <p class="text-base font-bold text-slate-800 dark:text-slate-200">
                                    {{ selectedItem?.email || 'No registrado' }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="flex items-center gap-5 p-4 bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-slate-50 dark:border-navy-700 transition-all hover:shadow-md">
                            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                                <PhoneIcon class="w-6 h-6" />
                            </div>
                            <div>
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">
                                    Teléfono Movil / Fijo</p>
                                <p class="text-base font-bold text-slate-800 dark:text-slate-200">
                                    {{ selectedItem?.phone || 'No registrado' }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="flex items-center gap-5 p-4 bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-slate-50 dark:border-navy-700 transition-all hover:shadow-md">
                            <div class="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600">
                                <MapPinIcon class="w-6 h-6" />
                            </div>
                            <div class="overflow-hidden">
                                <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">
                                    Domicilio / Casa Matriz</p>
                                <p class="text-base font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {{ selectedItem?.address || 'Sin dirección' }}
                                    {{ selectedItem?.city ? `- ${selectedItem.city}` : '' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center px-2">
                    <span class="text-xs font-bold text-slate-400 lowercase tracking-tight">Registro creado el: <span
                            class="text-slate-600 dark:text-slate-500">{{ formatDate(selectedItem?.created_at) }}</span></span>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="p-8 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-navy-700 flex justify-end">
                <button @click="closeModals"
                    class="px-12 py-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                    Cerrar Detalle
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, IdentificationIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import { DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxItem, DxSearchPanel, DxPaging, DxLabel } from 'devextreme-vue/data-grid'
import conexionApi from '@/services/conexionApi'
import { formatDate, statusTextCellTemplate, validarRutChileno, formatearRutConPuntos, getStatusMeta } from '@/utils/herlpers'
import DxValidator, {
    DxRequiredRule,
    DxCustomRule
} from 'devextreme-vue/validator'

const mainGridRef = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)
const rutValue = ref('')

const companyID = Number(localStorage.getItem('userIdCompany'))

const verRegistro = (data) => {
    selectedItem.value = data
    showViewModal.value = true
}

const closeModals = () => {
    showViewModal.value = false
}

const onEditorPreparing = (e) => {
    if (e.dataField === 'rut' && e.parentType === 'dataRow') {
        e.editorOptions.valueChangeEvent = 'input'

        e.editorOptions.onValueChanged = (ev) => {
            const formatted = formatearRutConPuntos(ev.value)
            rutValue.value = formatted

            if (formatted !== ev.value) {
                ev.component.option('value', formatted)
            }
        }
    }
}

const onSaving = (e) => {
    if (!e.changes.length) return

    const change = e.changes[0]

    if (change.type === 'insert') {
        change.data.rut = rutValue.value
    }
}


const dataSource = new CustomStore({
    key: 'id',

    load: async () => {
        const { data } = await conexionApi.get('/suppliers', {
            params: { company_id: companyID }
        })
        return data.suppliers
    },

    insert: async (values) => {
        if (!values.rut) {
            throw new Error('RUT no recibido')
        }
        await conexionApi.post('/suppliers', {
            country: 'Chile',
            ...values,
            company_id: companyID
        })
    },

    update: async (key, values) => {
        const cleanValues = Object.fromEntries(
            Object.entries(values).filter(
                ([_, value]) => value !== undefined
            )
        )

        await conexionApi.put(`/suppliers/${key}`, cleanValues)
    },

    remove: async (key) => {
        await conexionApi.delete(`/suppliers/${key}`)
    }
})

const customButtons = [
    {
        hint: 'Ver',
        icon: 'custom-view',
        onClick: (e) => verRegistro(e.row.data)
    },
    'edit',
    'delete'
]
</script>
