<template>
    <!-- Title -->
    <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <CalendarDaysIcon class="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Temporadas</h1>
                <p class="text-slate-500 font-medium font-inter">Administración de ciclos agrícolas, períodos y
                    planificación</p>
            </div>
        </div>
    </div>

    <!-- ALERTA TEMPORADA -->
    <div v-if="seasonAlert" class="max-w-full mx-auto mb-4">
        <div
            class="flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p class="text-sm leading-relaxed">
                <strong>
                    La temporada {{ seasonAlert.name }} está por cerrarse automáticamente en {{ seasonAlert.days }}
                    día<span v-if="seasonAlert.days !== 1">s</span>
                </strong>
                ({{ seasonAlert.formattedDate }} hrs)
            </p>
        </div>
    </div>

    <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative text-[13px]!">
        <LoadingOverlay :show="loading" />
        <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true"
            :column-auto-width="true" :width="'100%'"" :on-init-new-row="editingOptions.onInitNewRow"
            :on-editing-start="editingOptions.onEditingStart">
            <!-- Panel adaptable -->

            <DxColumnFixing :enabled="true" />
            <DxHeaderFilter :visible="true" :allow-search="true" />
            <DxScrolling column-rendering-mode="virtual" />

            <DxSearchPanel :visible="true" placeholder="Buscar..." />
            <DxPaging :page-size="15" />

            <DxColumn data-field="name" caption="Nombre" css-class="!text-left" alignment="right" />
            <DxColumn data-field="period" caption="Periodo" css-class="!text-left" alignment="right" />
            <DxColumn data-field="date_from" caption="Fecha Inicio" css-class="!text-left" alignment="right"
                data-type="date" />
            <DxColumn data-field="date_until" caption="Fecha Término" css-class="!text-left" alignment="right"
                data-type="date" />

            <DxColumn data-field="status" caption="" :cell-template="statusCellTemplate" css-class="!text-center"
                alignment="right" :allow-filtering="false" />

            <DxColumn data-field="duplicateLastAttributes" caption="Duplicar Atributos" css-class="!text-center"
                alignment="right" :allow-filtering="false" :visible="false">
                <template #cellTemplate="{ data }">
                    <span v-if="data.duplicateLastAttributes">Sí</span>
                    <span v-else>No</span>
                </template>
            </DxColumn>

            <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
            <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true"
                :use-icons="true">
                <DxPopup title="Gestión de Temporada" :show-title="true" :width="900" :height="450" />
                <DxForm>
                    <DxItem data-field="name" :is-required="true"
                        :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />

                    <DxItem data-field="period" :is-required="true" editor-type="dxSelectBox" :editor-options="{
                        dataSource: [
                            { id: 'Anual', name: 'Anual' },
                            { id: 'Bimestral', name: 'Bimestral' },
                            { id: 'Semestral', name: 'Semestral' },
                            { id: 'Trimestral', name: 'Trimestral' },
                            { id: 'Mensual', name: 'Mensual' },
                            { id: 'Semanal', name: 'Semanal' },
                            { id: 'Diario', name: 'Diario' }
                        ],
                        displayExpr: 'name',
                        valueExpr: 'id',
                        placeholder: 'Seleccione periodo'
                    }" :validation-rules="[{ type: 'required', message: 'El periodo es obligatorio' }]" />

                    <DxItem data-field="date_from" caption="Fecha Inicio" editor-type="dxDateBox" :is-required="true"
                        :editor-options="{ type: 'date', displayFormat: 'dd/MM/yyyy' }"
                        :validation-rules="[{ type: 'required', message: 'La fecha de inicio es obligatoria' }]" />

                    <DxItem data-field="date_until" caption="Fecha Término" editor-type="dxDateBox" :is-required="true"
                        :editor-options="{ type: 'date', displayFormat: 'dd/MM/yyyy' }"
                        :validation-rules="[{ type: 'required', message: 'La fecha de término es obligatoria' }]" />

                    <DxItem data-field="status" editor-type="dxSelectBox" :is-required="true"
                        :label="{ text: 'Estado' }" :editor-options="{
                            dataSource: [
                                { id: 0, name: 'Inactivo' },
                                { id: 1, name: 'Activo' },
                                { id: 2, name: 'Cerrado' }
                            ],
                            displayExpr: 'name',
                            valueExpr: 'id',
                            placeholder: 'Seleccione estado'
                        }" :validation-rules="[{ type: 'required', message: 'El estado es obligatorio' }]" />

                    <DxItem editor-type="dxCheckBox" data-field="duplicateLastAttributes" :editor-options="{
                        text: '¿Desea duplicar los últimos atributos del sector?',
                        value: false, // Valor inicial explícito

                    }" :visible="isInserting" />

                </DxForm>

            </DxEditing>
        </DxDataGrid>
    </div>


</template>


<script setup>
import { ref, computed, watch, shallowRef } from 'vue'
import { CalendarDaysIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'

import {
    DxDataGrid,
    DxColumn,
    DxEditing,
    DxPopup,
    DxForm,
    DxItem,
    DxLookup,
    DxPaging,
    DxScrolling,
    DxColumnChooser,
    DxColumnFixing,
    DxSearchPanel,
    DxSelection,
    DxFilterRow,
    DxHeaderFilter
} from 'devextreme-vue/data-grid'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// FORM
import {
    DxSimpleItem
} from 'devextreme-vue/form'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, toMySQLDateTime } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)
const isInserting = ref(false)
const seasons = ref([])

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0

const editingOptions = {
    onInitNewRow: (e) => {
        isInserting.value = true
        //e.data.duplicateLastAttributes = false
    },
    onEditingStart: (e) => {
        isInserting.value = false
    }
}


const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const { data } = await conexionApi.get('/configuracion/production/getSeasons/' + companyID)
            seasons.value = (data.seasons || []).map(r => ({
                ...r,
                status: Number(r.status)
            }))
            return seasons.value
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {

        const duplicate = values.duplicateLastAttributes || false;

        const payload = {
            ...values,
            date_from: toMySQLDateTime(values.date_from),
            date_until: toMySQLDateTime(values.date_until),
            status: values.status ?? 1,
            company_id: companyID
        };

        delete payload.duplicateLastAttributes;

        const { data } = await conexionApi.post('/configuracion/production/createSeason', payload);
        if (data.code === "ERROR") throw new Error(data.mensaje);

        const newSeasonId = data.newSeasonId;
        const newSeason = { ...payload, id: newSeasonId };


        if (duplicate) {
            try {
                const { data: lastAttrs } = await conexionApi.get('/configuracion/production/getAttributesSector/' + companyID);
                if (lastAttrs.code === "OK" && lastAttrs.attributes.length > 0) {
                    // Encontrar el atributo con el ID más alto
                    const lastAttr = lastAttrs.attributes.reduce((prev, current) => {
                        return (prev.id > current.id) ? prev : current;
                    }, lastAttrs.attributes[0]);

                    await conexionApi.post('/configuracion/production/cloneAttributesSector', {
                        id: lastAttr.id,
                        newSeasonId: newSeasonId
                    });
                }
            } catch (err) {
                console.error('Error duplicando atributos del sector:', err);
            }
        }
        return newSeason;
    },
    update: async (key, values) => {
        const instance = mainGridRef.value.instance;
        const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}
        const payload = {
            ...currentData,
            ...values,
            date_from: toMySQLDateTime(values.date_from ?? currentData.date_from),
            date_until: toMySQLDateTime(values.date_until ?? currentData.date_until),
            id: key,
            company_id: companyID
        }

        const { data } = await conexionApi.post('/configuracion/production/updateSeason', payload)
        if (data.code === "ERROR") throw new Error(data.mensaje)
        return data.usuario || payload // Devuelve el objeto actualizado
    },
    remove: async (key) => {
        const { data } = await conexionApi.post('/configuracion/production/deleteSeason', { id: key })
        if (data.code === "ERROR") throw new Error(data.mensaje)
    }
})

const seasonAlert = computed(() => {
    const active = seasons.value.find(s => Number(s.status) === 1)
    if (!active) return null

    const now = new Date()

    const end = new Date(active.date_until.replace(' ', 'T'))
    end.setDate(end.getDate() - 1)
    end.setHours(23, 59, 59, 0)

    const diffMs = end - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 5 || diffDays < 0) return null

    const dd = String(end.getDate()).padStart(2, '0')
    const mm = String(end.getMonth() + 1).padStart(2, '0')
    const yyyy = end.getFullYear()
    const hh = String(end.getHours()).padStart(2, '0')
    const min = String(end.getMinutes()).padStart(2, '0')
    const ss = String(end.getSeconds()).padStart(2, '0')

    return {
        name: active.name,
        days: diffDays,
        formattedDate: `${dd}/${mm}/${yyyy} a las ${hh}:${min}:${ss}`
    }
})

// --- Botones personalizados ---
const customButtons = [
    'edit',
    'delete'
]

</script>
