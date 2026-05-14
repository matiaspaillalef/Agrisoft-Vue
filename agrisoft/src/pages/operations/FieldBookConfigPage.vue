<template>
  <div class="page-wrapper">
    <!-- HEADER -->
    <div
      class="mb-6 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-xl hover:shadow-blue-900/5">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
          <AdjustmentsHorizontalIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Configuración</h1>
          <p class="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]">Libro de Campo</p>
        </div>
      </div>
      <button @click="openAreaModal()"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-xs shadow-lg shadow-blue-200 w-fit!">
        <PlusIcon class="w-4 h-4" />
        Nueva Área
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      <LoadingOverlay :show="loading" />
      <!-- AREAS LIST -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6">
        <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Áreas de Trabajo</h4>
        <div class="space-y-2">
          <div v-for="area in areas" :key="area.id" @click="selectArea(area)" :class="[
            'agrisoft-item border transition-all cursor-pointer group',
            selectedArea?.id === area.id ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
          ]">
            <div class="flex items-center gap-3 w-full">
              <div :class="[
                'p-2 rounded-full transition-all flex items-center justify-center bg-blue-100 text-blue-600',
                !area.status && 'opacity-50 grayscale'
              ]">
                <component :is="area.icon || 'BookOpenIcon'" class="w-4 h-4" />
              </div>

              <div class="flex-1 flex flex-col justify-center min-w-0">
                <p class="font-semibold text-slate-800 text-[13px] truncate leading-tight">{{ area.name }}</p>
                <div class="mt-0.5">
                  <span :class="[
                    'inline-block px-1.5 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider',
                    area.status ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                  ]">{{ area.status ? 'Activo' : 'Inactivo' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button @click.stop="openAreaModal(area)" class="action-btn" title="Editar">
                  <PencilSquareIcon class="w-3.5 h-3.5" />
                </button>
                <button @click.stop="handleDeleteArea(area)" class="action-btn delete" title="Eliminar">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>

                <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>

                <label class="compact-switch" @click.stop>
                  <input type="checkbox" :checked="!!area.status" @change="(e) => toggleArea(area, e.target.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TASKS LIST -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative min-h-[400px]">
        <div v-if="!selectedArea"
          class="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-8 text-center">
          <p class="font-black text-slate-300 uppercase text-[10px] tracking-widest">Selecciona un área</p>
        </div>

        <div v-else>
          <div class="flex items-center justify-between mb-6 px-2">
            <div>
              <h4 class="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">Tareas para:</h4>
              <p class="text-lg font-black text-slate-800 leading-tight">{{ selectedArea.name }}</p>
            </div>
            <button @click="openTaskModal()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-200 hover:scale-105 transition-all w-fit!">
              + Tarea
            </button>
          </div>

          <div class="space-y-2">
            <div v-for="task in tasks" :key="task.id"
              class="agrisoft-item bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all group/task">

              <div class="flex items-center gap-3 w-full">
                <div :class="[
                  'p-2 rounded-full transition-all flex items-center justify-center bg-slate-100 text-slate-600',
                  !task.status && 'opacity-50 grayscale'
                ]">
                  <AdjustmentsHorizontalIcon class="w-4 h-4" />
                </div>

                <div class="flex-1 flex flex-col justify-center min-w-0">
                  <p class="font-semibold text-slate-800 text-[13px] truncate leading-tight">{{ task.name }}</p>
                  <div class="mt-0.5">
                    <span :class="[
                      'inline-block px-1.5 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider',
                      task.status ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    ]">{{ task.status ? 'Activo' : 'Inactivo' }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button @click.stop="openTaskModal(task)" class="action-btn" title="Editar">
                    <PencilSquareIcon class="w-3.5 h-3.5" />
                  </button>
                  <button @click.stop="handleDeleteTask(task)" class="action-btn delete" title="Eliminar">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>

                  <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>

                  <label class="compact-switch" @click.stop>
                    <input type="checkbox" :checked="!!task.status" @change="(e) => toggleTask(task, e.target.checked)">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
            <div v-if="tasks.length === 0"
              class="p-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-100 mt-4">
              <p class="text-[10px] font-black text-slate-300 tracking-widest uppercase">Sin tareas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PHENOLOGICAL STATES LIST -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
        <div class="flex items-center justify-between mb-6 px-2">
          <div>
            <h4 class="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">Global:</h4>
            <p class="text-lg font-black text-slate-800 leading-tight">Estados Fenológicos</p>
          </div>
          <button @click="openPhenologicalModal()"
            class="px-4 py-2 !bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-amber-200 hover:scale-105 transition-all w-fit!">
            + Estado
          </button>
        </div>

        <div class="space-y-2">
          <div v-for="state in phenologicalStates" :key="state.id"
            class="agrisoft-item bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all group/state">

            <div class="flex items-center gap-3 w-full">
              <div :class="[
                'p-2 rounded-full transition-all flex items-center justify-center bg-amber-100 text-amber-600',
                !state.status && 'opacity-50 grayscale'
              ]">
                <BeakerIcon class="w-4 h-4" />
              </div>

              <div class="flex-1 flex flex-col justify-center min-w-0">
                <p class="font-semibold text-slate-800 text-[13px] truncate leading-tight">{{ state.name }}</p>
                <div class="mt-0.5">
                  <span :class="[
                    'inline-block px-1.5 py-[2px] rounded text-[9px] font-bold uppercase tracking-wider',
                    state.status ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                  ]">{{ state.status ? 'Activo' : 'Inactivo' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button @click.stop="openPhenologicalModal(state)" class="action-btn" title="Editar">
                  <PencilSquareIcon class="w-3.5 h-3.5" />
                </button>
                <button @click.stop="handleDeletePhenological(state)" class="action-btn delete" title="Eliminar">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>

                <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>

                <label class="compact-switch" @click.stop>
                  <input type="checkbox" :checked="!!state.status"
                    @change="(e) => togglePhenologicalStatus(state, e.target.checked)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="phenologicalStates.length === 0"
            class="p-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-100 mt-4">
            <p class="text-[10px] font-black text-slate-300 tracking-widest uppercase">Sin estados definidos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <DxPopup v-model:visible="showModal" :width="350" :height="'auto'" :show-title="false" class="premium-popup">
      <div class="p-6 space-y-6">
        <h3 class="text-lg font-black text-slate-800">
          {{ isEditing ? 'Actualizar' : 'Añadir' }}
          {{ modalType === 'area' ? 'Área' : (modalType === 'task' ? 'Tarea' : 'Estado Fenológico') }}
        </h3>
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase">Nombre</label>
            <input v-model="modalForm.name"
              class="w-full px-4 py-2 bg-slate-50 rounded-lg font-bold border-none outline-none focus:ring-2 focus:ring-blue-100 text-sm" />
          </div>
        </div>
        <div class="pt-4 flex items-center justify-end gap-3">
          <button @click="showModal = false"
            class="text-slate-400 font-black text-[10px] uppercase px-4">Cerrar</button>
          <button @click="handleSave"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase shadow-md shadow-blue-100">Guardar</button>
        </div>
      </div>
    </DxPopup>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  AdjustmentsHorizontalIcon, PlusIcon, ChevronRightIcon,
  CursorArrowRippleIcon, BookOpenIcon, TrashIcon,
  PencilSquareIcon, BeakerIcon
} from '@heroicons/vue/24/outline'
import { DxPopup } from 'devextreme-vue/popup'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import fieldBookService from '@/api/field-book.service.js'

const loading = ref(false)
const areas = ref([])
const tasks = ref([])
const phenologicalStates = ref([])
const selectedArea = ref(null)
const companyId = localStorage.getItem('userIdCompany')

const showModal = ref(false)
const modalType = ref('area')
const isEditing = ref(false)
const editingItem = ref(null)
const modalForm = ref({ name: '' })

onMounted(() => {
  fetchAreas()
  fetchPhenologicalStates()
})

async function fetchPhenologicalStates() {
  loading.value = true
  try {
    const res = await fieldBookService.getPhenologicalStates(companyId)
    phenologicalStates.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchAreas() {
  loading.value = true
  try {
    const res = await fieldBookService.getAreas(companyId)
    areas.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function selectArea(area) {
  selectedArea.value = area
  fetchTasks(area.id)
}

async function fetchTasks(areaId) {
  loading.value = true
  try {
    const res = await fieldBookService.getTasksByArea(areaId)
    tasks.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function toggleArea(area, status) {
  try {
    await fieldBookService.toggleAreaStatus(area.id, status ? 1 : 0)
    area.status = status ? 1 : 0
  } catch (e) {
    console.error(e)
  }
}

async function toggleTask(task, status) {
  try {
    await fieldBookService.toggleTaskStatus(task.id, status ? 1 : 0)
    task.status = status ? 1 : 0
  } catch (e) {
    console.error(e)
  }
}

async function togglePhenologicalStatus(state, status) {
  try {
    await fieldBookService.togglePhenologicalStateStatus(state.id, status ? 1 : 0)
    state.status = status ? 1 : 0
  } catch (e) {
    console.error(e)
  }
}

function openAreaModal(item = null) {
  modalType.value = 'area'
  isEditing.value = !!item
  editingItem.value = item
  modalForm.value = { name: item ? item.name : '' }
  showModal.value = true
}

function openTaskModal(item = null) {
  modalType.value = 'task'
  isEditing.value = !!item
  editingItem.value = item
  modalForm.value = { name: item ? item.name : '' }
  showModal.value = true
}

function openPhenologicalModal(item = null) {
  modalType.value = 'phenological'
  isEditing.value = !!item
  editingItem.value = item
  modalForm.value = { name: item ? item.name : '' }
  showModal.value = true
}

async function handleSave() {
  if (!modalForm.value.name) return
  loading.value = true
  try {
    if (modalType.value === 'area') {
      if (isEditing.value) {
        await fieldBookService.updateArea(editingItem.value.id, { name: modalForm.value.name })
      } else {
        await fieldBookService.saveArea({ id_company: companyId, name: modalForm.value.name })
      }
      fetchAreas()
    } else if (modalType.value === 'task') {
      if (isEditing.value) {
        await fieldBookService.updateTask(editingItem.value.id, { name: modalForm.value.name })
      } else {
        await fieldBookService.saveTask({ id_area: selectedArea.value.id, name: modalForm.value.name })
      }
      fetchTasks(selectedArea.value.id)
    } else if (modalType.value === 'phenological') {
      if (isEditing.value) {
        await fieldBookService.updatePhenologicalState(editingItem.value.id, { name: modalForm.value.name })
      } else {
        await fieldBookService.savePhenologicalState({ id_company: companyId, name: modalForm.value.name })
      }
      fetchPhenologicalStates()
    }
    showModal.value = false
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDeleteArea(area) {
  if (!confirm(`¿Estás seguro de eliminar "${area.name}"?`)) return
  loading.value = true
  try {
    await fieldBookService.deleteArea(area.id)
    if (selectedArea.value?.id === area.id) selectedArea.value = null
    fetchAreas()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDeleteTask(task) {
  if (!confirm(`¿Estás seguro de eliminar "${task.name}"?`)) return
  loading.value = true
  try {
    await fieldBookService.deleteTask(task.id)
    fetchTasks(selectedArea.value.id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDeletePhenological(state) {
  if (!confirm(`¿Estás seguro de eliminar el estado "${state.name}"?`)) return
  loading.value = true
  try {
    await fieldBookService.deletePhenologicalState(state.id)
    fetchPhenologicalStates()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* COMPACT ITEM STYLES */
.agrisoft-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 16px;
  margin-bottom: 10px;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
  transform: translateY(-1px);
}

.action-btn.delete:hover {
  background-color: #fff1f2;
  color: #e11d48;
}

/* COMPACT SWITCH */
.compact-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  margin: 0;
  flex-shrink: 0;
}

.compact-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.compact-switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 34px;
}

.compact-switch .slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.compact-switch input:checked+.slider {
  background-color: #2563eb;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
}

.compact-switch input:checked+.slider:before {
  transform: translateX(16px);
}

/* Scrollbar sutil */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
