<template>
    <div class="p-4 md:p-8 min-h-screen bg-slate-50/50">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div class="flex items-center gap-4">
                <div
                    class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <ChatBubbleBottomCenterTextIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 class="text-2xl font-black text-slate-800 tracking-tight">Base de Conocimientos</h1>
                    <p class="text-sm font-medium text-slate-500">Gestiona las respuestas automáticas del asistente</p>
                </div>
            </div>
        </div>

        <!-- Grid Container -->
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
            <DxDataGrid ref="dataGridRef" :data-source="knowledge" :show-borders="false" :column-auto-width="false"
                :row-alternation-enabled="true" @row-inserted="onRowInserted" @row-updated="onRowUpdated"
                @row-removed="onRowRemoved" @row-dbl-click="onRowDblClick" class="custom-grid w-full">
                <DxEditing mode="popup" :allow-updating="true" :allow-adding="true" :allow-deleting="true"
                    :use-icons="true">
                    <DxGridPopup :show-title="true" :width="700" :height="525" title="Información de Respuesta" />
                    <DxForm>
                        <DxItem :col-count="1" :col-span="2" item-type="group">
                            <DxItem data-field="keywords" editor-type="dxTextArea"
                                :editor-options="{ height: 90, placeholder: 'Ej: producto, insumo, stock...' }"
                                :label="{ text: 'Palabras Clave (separadas por coma)' }">
                                <DxRequiredRule message="Las palabras clave son obligatorias" />
                            </DxItem>
                            <DxItem data-field="response" editor-type="dxTextArea"
                                :editor-options="{ height: 150, placeholder: 'Escribe aquí la respuesta que dará el asistente...' }"
                                :label="{ text: 'Respuesta del Asistente' }">
                                <DxRequiredRule message="La respuesta es obligatoria" />
                            </DxItem>
                        </DxItem>
                    </DxForm>
                </DxEditing>

                <DxSearchPanel :visible="true" :width="240" placeholder="Buscar..." />
                <DxPaging :page-size="50" />
                <DxPager :show-page-size-selector="true" :allowed-page-sizes="[10, 20, 50]" />

                <DxColumn data-field="keywords" caption="Palabras Clave" cell-template="keywordTemplate"
                    :min-width="250" />
                <DxColumn data-field="response" :visible="false" />
                <DxColumn data-field="updated_at" caption="Última Actualización" data-type="date"
                    format="dd/MM/yyyy HH:mm" :width="180" />
                <DxColumn type="buttons" :width="150" caption="Acciones">
                    <DxButton name="view" icon="eye" hint="Ver Respuesta" :on-click="onViewClick" />
                    <DxButton name="edit" />
                    <DxButton name="delete" />
                </DxColumn>

                <template #keywordTemplate="{ data }">
                    <div class="flex flex-wrap gap-1">
                        <span v-for="word in data.value ? data.value.split(',') : []" :key="word"
                            class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                            {{ word.trim() }}
                        </span>
                    </div>
                </template>
            </DxDataGrid>
        </div>

        <!-- Detail Modal -->
        <DxPopup :visible="detailModalVisible" :drag-enabled="false" :hide-on-outside-click="true"
            :show-close-button="false" :width="550" :height="'auto'" @hiding="detailModalVisible = false">
            <template #content>
                <div class="flex flex-col h-full bg-white relative">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <SparklesIcon class="w-5 h-5" />
                            </div>
                            <div>
                                <h3 class="text-lg font-black text-slate-800 leading-tight">Respuesta del Asistente</h3>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista Previa
                                    IA</p>
                            </div>
                        </div>
                        <button @click="detailModalVisible = false"
                            class="p-2 hover:bg-slate-50 rounded-xl transition-colors !w-fit">
                            <XMarkIcon class="w-5 h-5 !text-slate-400" />
                        </button>
                    </div>

                    <!-- Keywords Preview -->
                    <div class="mb-6">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Activadores de
                            esta respuesta</p>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="word in selectedKnowledge?.keywords.split(',')" :key="word"
                                class="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold border border-slate-100">
                                {{ word.trim() }}
                            </span>
                        </div>
                    </div>

                    <!-- Main Response Content -->
                    <div
                        class="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                        <!-- Decorative Sparkles -->
                        <div
                            class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700">
                        </div>
                        <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>

                        <p
                            class="text-[10px] font-black text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ChatBubbleLeftEllipsisIcon class="w-3 h-3" />
                            Mensaje que verá el usuario
                        </p>
                        <div class="text-white text-sm font-medium leading-relaxed italic whitespace-pre-wrap">
                            "{{ selectedKnowledge?.response }}"
                        </div>
                    </div>

                    <div class="mt-8 flex justify-end">
                        <button @click="detailModalVisible = false"
                            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-slate-100 uppercase text-[10px] tracking-widest">
                            Cerrar Vista Previa
                        </button>
                    </div>
                </div>
            </template>
        </DxPopup>

        <LoadingOverlay :active="loading" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
    DxDataGrid,
    DxColumn,
    DxEditing,
    DxPopup as DxGridPopup,
    DxForm,
    DxItem,
    DxRequiredRule,
    DxSearchPanel,
    DxPaging,
    DxPager,
    DxButton
} from 'devextreme-vue/data-grid'
import { DxPopup } from 'devextreme-vue/popup'
import {
    ChatBubbleBottomCenterTextIcon,
    XMarkIcon,
    SparklesIcon,
    ChatBubbleLeftEllipsisIcon
} from '@heroicons/vue/24/outline'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import conexionApi from '@/services/conexionApi'
import notify from 'devextreme/ui/notify'
import { confirm } from 'devextreme/ui/dialog'

const knowledge = ref([])
const loading = ref(false)
const detailModalVisible = ref(false)
const selectedKnowledge = ref(null)
const dataGridRef = ref(null)

const openDetail = (data) => {
    selectedKnowledge.value = data
    detailModalVisible.value = true
}

const onViewClick = (e) => {
    openDetail(e.row.data)
}

const onRowDblClick = (e) => {
    openDetail(e.data)
}

const fetchKnowledge = async () => {
    loading.value = true
    try {
        const { data } = await conexionApi.get('/support/assistant/knowledge')
        if (data.code === 'OK') {
            knowledge.value = data.knowledge
        }
    } catch (error) {
        console.error('Error fetching knowledge:', error)
    } finally {
        loading.value = false
    }
}

const onRowInserted = async (e) => {
    try {
        const { data } = await conexionApi.post('/support/assistant/knowledge', e.data)
        if (data.code === 'OK') {
            notify('Conocimiento agregado correctamente', 'success', 2000)
            fetchKnowledge()
        }
    } catch (error) {
        notify('Error al agregar conocimiento', 'error', 2000)
    }
}

const onRowUpdated = async (e) => {
    try {
        const { data } = await conexionApi.put(`/support/assistant/knowledge/${e.key.id}`, e.data)
        if (data.code === 'OK') {
            notify('Conocimiento actualizado correctamente', 'success', 2000)
            fetchKnowledge()
        }
    } catch (error) {
        notify('Error al actualizar conocimiento', 'error', 2000)
    }
}

const onRowRemoved = async (e) => {
    try {
        const { data } = await conexionApi.delete(`/support/assistant/knowledge/${e.key.id}`)
        if (data.code === 'OK') {
            notify('Conocimiento eliminado', 'success', 2000)
        }
    } catch (error) {
        notify('Error al eliminar conocimiento', 'error', 2000)
    }
}

onMounted(fetchKnowledge)
</script>

<style scoped>
@reference "@/style.css";

.custom-grid {
    @apply text-slate-600;
}

:deep(.dx-datagrid-header-panel) {
    @apply mb-4;
}

:deep(.dx-datagrid-search-panel) {
    @apply !rounded-xl !border-slate-200;
}

:deep(.dx-button-mode-contained.dx-button-default) {
    @apply !bg-indigo-600 !rounded-xl !border-none shadow-lg shadow-indigo-100;
}
</style>
