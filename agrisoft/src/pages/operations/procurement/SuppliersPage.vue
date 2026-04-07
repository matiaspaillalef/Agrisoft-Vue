<template>
    <!-- Title -->
    <div class="max-w-full mx-auto mb-6 flex justify-between items-center pl-2 md:pl-5">
        <div>
            <h1 class="text-2xl font-light text-navy-700 dark:text-white">Proveedores</h1>
            <p class="text-sm text-gray-500">Gestión de proveedores de la empresa</p>
        </div>
    </div>

    <!-- GRID -->
    <div class="bg-white rounded-2xl shadow-xl px-6 py-6 max-w-full mx-auto relative">
        <LoadingOverlay :show="loading" />
        <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true"
            :column-auto-width="true" @editor-preparing="onEditorPreparing" @saving="onSaving">

            <DxSearchPanel :visible="true" placeholder="Buscar..." />
            <DxPaging :page-size="15" />

            <DxColumn data-field="rut" caption="RUT" />
            <DxColumn data-field="name" caption="Nombre" />
            <DxColumn data-field="email" caption="Email" />
            <DxColumn data-field="phone" caption="Teléfono" />
            <DxColumn data-field="city" caption="Ciudad" :visible="false" />
            <DxColumn data-field="address" caption="Dirección" :visible="false" />
            <DxColumn data-field="country" caption="País" :visible="false" />
            <DxColumn data-field="status" caption="Estado" :cell-template="statusTextCellTemplate" />

            <DxColumn type="buttons" width="140" :buttons="customButtons" />

            <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true"
                :use-icons="true">
                <DxPopup title="Gestión de Proveedor" :width="600" :height="520" />

                <DxForm>
                    <DxItem data-field="rut" caption="RUT" editor-type="dxTextBox" :editor-options="{
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
                        {
                            type: 'custom',
                            message: 'RUT chileno inválido',
                            validationCallback: (e) => validarRutChileno(e.value)
                        }
                    ]" />


                    <DxItem data-field="name" caption="Nombre" />
                    <DxItem data-field="email" caption="Email" />
                    <DxItem data-field="phone" caption="Teléfono" />
                    <DxItem data-field="address" caption="Dirección" />
                    <DxItem data-field="city" caption="Ciudad" />
                    <!--<DxItem data-field="country" caption="País" :editor-options="{ readOnly: true }" />-->
                    <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox"
                        :editor-options="{ items: ['ACTIVE', 'INACTIVE'] }" />
                </DxForm>
            </DxEditing>
        </DxDataGrid>
    </div>

    <!-- MODAL VER -->
    <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" @click="closeModals"></div>

        <div class="bg-white rounded-xl p-6 w-full max-w-lg z-10">
            <h2 class="text-xl mb-4 font-semibold">{{ selectedItem.name }}</h2>

            <p class="text-sm mt-1"><strong>RUT:</strong> {{ selectedItem.rut }}</p>
            <p class="text-sm mt-1"><strong>Email:</strong> {{ selectedItem.email || 'N/A' }}</p>
            <p class="text-sm mt-1"><strong>Teléfono:</strong> {{ selectedItem.phone || 'N/A' }}</p>
            <p class="text-sm mt-1"><strong>Dirección:</strong> {{ selectedItem.address || 'N/A' }}</p>
            <p class="text-sm mt-1"><strong>Ciudad:</strong> {{ selectedItem.city || 'N/A' }}</p>
            <p class="text-sm mt-1"><strong>País:</strong> {{ selectedItem.country }}</p>
            <p class="text-sm mt-1"><strong>Creado:</strong> {{ formatDate(selectedItem.created_at) }}</p>

            <button class="mt-4 w-full bg-gray-200 py-2 rounded-lg" @click="closeModals">
                Cerrar
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import CustomStore from 'devextreme/data/custom_store'
import { DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxItem, DxSearchPanel, DxPaging } from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import conexionApi from '@/services/conexionApi'
import { formatDate, statusTextCellTemplate, validarRutChileno, formatearRutConPuntos } from '@/utils/herlpers'
import DxValidator, {
    DxRequiredRule,
    DxCustomRule
} from 'devextreme-vue/validator'

const loading = ref(false)
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
