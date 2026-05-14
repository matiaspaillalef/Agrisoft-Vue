<template>
  <div class="page-wrapper p-4 md:p-8">
    <!-- HEADER -->
    <div
      class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-xl">
      <div class="flex items-center gap-6">
        <div
          class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
          <AdjustmentsHorizontalIcon class="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Categorías de Productos</h1>
          <p
            class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight uppercase text-[10px] tracking-[0.2em]">
            Configuración de catálogo y familias</p>
        </div>
      </div>
      <button @click="openCategoryModal()"
        class="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-sm shadow-xl shadow-blue-200 w-full md:w-fit uppercase tracking-widest !w-fit">
        <PlusIcon class="w-5 h-5" />
        Nueva Categoría
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <LoadingOverlay :show="loading" />

      <!-- CATEGORIES LIST -->
      <div
        class="bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm overflow-hidden p-8">
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Categorías Principales
        </h4>
        <div class="space-y-3">
          <div v-for="category in categories" :key="category.id" @click="selectCategory(category)" :class="[
            'premium-item p-5 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4',
            selectedCategory?.id === category.id ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm' : 'bg-white dark:bg-navy-800 border-slate-100 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-700 hover:border-slate-200 shadow-sm'
          ]">
            <div :class="[
              'w-10 h-10 rounded-xl transition-all flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
              !category.status && 'opacity-50 grayscale'
            ]">
              <TagIcon class="w-5 h-5" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 dark:text-slate-200 text-base truncate">{{ category.name }}</p>
              <span :class="[
                'inline-block px-2 py-[2px] rounded-full text-[9px] font-black uppercase tracking-widest mt-1',
                category.status ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-navy-600 dark:text-slate-500'
              ]">{{ category.status ? 'Activa' : 'Inactiva' }}</span>
            </div>

            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="openCategoryModal(category)"
                class="p-2 hover:bg-white dark:hover:bg-navy-600 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                <PencilSquareIcon class="w-4 h-4" />
              </button>
              <button @click.stop="handleDeleteCategory(category)"
                class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-if="categories.length === 0"
            class="p-12 text-center border-2 border-dashed border-slate-100 dark:border-navy-700 rounded-[2rem]">
            <p class="text-xs font-black text-slate-300 uppercase tracking-widest">Sin categorías registradas</p>
          </div>
        </div>
      </div>

      <!-- SUBCATEGORIES LIST -->
      <div
        class="bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm overflow-hidden p-8 relative min-h-[500px]">
        <div v-if="!selectedCategory"
          class="absolute inset-0 bg-white/60 dark:bg-navy-800/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-20 h-20 bg-slate-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
            <CursorArrowRippleIcon class="w-10 h-10 text-slate-300" />
          </div>
          <p class="font-black text-slate-400 dark:text-slate-500 uppercase text-xs tracking-[0.3em]">Seleccione una
            categoría principal</p>
        </div>

        <div v-else class="animate-in fade-in duration-500">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h4 class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Subcategorías de:</h4>
              <p class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{{ selectedCategory.name }}
              </p>
            </div>
            <button @click="openSubcategoryModal()"
              class="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-all !w-fit">
              + Subcategoría
            </button>
          </div>

          <div class="space-y-3">
            <div v-for="sub in subcategories" :key="sub.id"
              class="p-5 rounded-2xl border border-slate-100 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/30 hover:bg-white dark:hover:bg-navy-700 hover:shadow-md transition-all group flex items-center gap-4">

              <div :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-navy-800 text-slate-400 shadow-sm',
                !sub.status && 'opacity-50 grayscale'
              ]">
                <HashtagIcon class="w-4 h-4" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-700 dark:text-slate-300 text-base truncate">{{ sub.name }}</p>
                <span :class="[
                  'inline-block px-2 py-[2px] rounded-full text-[9px] font-black uppercase tracking-widest mt-1',
                  sub.status ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-navy-600 dark:text-slate-500'
                ]">{{ sub.status ? 'Activa' : 'Inactiva' }}</span>
              </div>

              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click.stop="openSubcategoryModal(sub)"
                  class="p-2 hover:bg-white dark:hover:bg-navy-600 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                  <PencilSquareIcon class="w-4 h-4" />
                </button>
                <button @click.stop="handleDeleteSubcategory(sub)"
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="subcategories.length === 0"
              class="p-16 text-center border-2 border-dashed border-slate-100 dark:border-navy-700 rounded-[2rem] mt-4">
              <p class="text-xs font-black text-slate-300 uppercase tracking-widest">Sin subcategorías definidas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <DxPopup v-model:visible="showModal" :width="400" :height="'auto'" :show-title="false" class="premium-popup">
      <div class="p-10 space-y-8">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
            <PlusIcon class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
              {{ isEditing ? 'Actualizar' : 'Nueva' }} {{ modalType === 'category' ? 'Categoría' : 'Subcategoría' }}
            </h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestión de catálogo</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre
              Descriptivo</label>
            <input v-model="modalForm.name" placeholder="Ej: Fertilizantes, Herramientas..."
              class="w-full px-6 py-4 bg-slate-50 dark:bg-navy-900 rounded-2xl font-bold border-none outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 text-sm transition-all shadow-inner" />
          </div>

          <div v-if="isEditing"
            class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex-grow ml-1">Estado de
              Disponibilidad</label>
            <div @click="modalForm.status = modalForm.status ? 0 : 1"
              :class="`w-12 h-6 rounded-full relative cursor-pointer transition-all ${modalForm.status ? 'bg-blue-600' : 'bg-slate-300 dark:bg-navy-600'}`">
              <div
                :class="`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${modalForm.status ? 'translate-x-6' : 'translate-x-0'}`">
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="handleSave"
            class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
            Guardar Cambios
          </button>
          <button @click="showModal = false"
            class="w-full py-4 bg-white dark:bg-navy-800 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-navy-700 transition-all rounded-2xl">
            Cancelar
          </button>
        </div>
      </div>
    </DxPopup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  AdjustmentsHorizontalIcon,
  PlusIcon,
  TagIcon,
  HashtagIcon,
  CursorArrowRippleIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline'
import { DxPopup } from 'devextreme-vue/popup'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import productCategoriesService from '@/api/product-categories.service.js'

const loading = ref(false)
const categories = ref([])
const subcategories = ref([])
const selectedCategory = ref(null)
const companyId = localStorage.getItem('userIdCompany')

const showModal = ref(false)
const modalType = ref('category')
const isEditing = ref(false)
const editingItem = ref(null)
const modalForm = ref({ name: '', status: 1 })

onMounted(fetchCategories)

async function fetchCategories() {
  loading.value = true
  try {
    const res = await productCategoriesService.getCategories(companyId)
    categories.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function selectCategory(category) {
  selectedCategory.value = category
  fetchSubcategories(category.id)
}

async function fetchSubcategories(categoryId) {
  loading.value = true
  try {
    const res = await productCategoriesService.getSubcategories(categoryId)
    subcategories.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCategoryModal(item = null) {
  modalType.value = 'category'
  isEditing.value = !!item
  editingItem.value = item
  modalForm.value = {
    name: item ? item.name : '',
    status: item ? item.status : 1
  }
  showModal.value = true
}

function openSubcategoryModal(item = null) {
  modalType.value = 'subcategory'
  isEditing.value = !!item
  editingItem.value = item
  modalForm.value = {
    name: item ? item.name : '',
    status: item ? item.status : 1
  }
  showModal.value = true
}

async function handleSave() {
  if (!modalForm.value.name) return
  loading.value = true
  try {
    if (modalType.value === 'category') {
      if (isEditing.value) {
        await productCategoriesService.updateCategory(editingItem.value.id, modalForm.value)
      } else {
        await productCategoriesService.saveCategory({ company_id: companyId, name: modalForm.value.name })
      }
      fetchCategories()
    } else {
      if (isEditing.value) {
        await productCategoriesService.updateSubcategory(editingItem.value.id, modalForm.value)
      } else {
        await productCategoriesService.saveSubcategory({ category_id: selectedCategory.value.id, name: modalForm.value.name })
      }
      fetchSubcategories(selectedCategory.value.id)
    }
    showModal.value = false
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDeleteCategory(category) {
  if (!confirm(`¿Estás seguro de eliminar "${category.name}"? Se eliminarán todas sus subcategorías.`)) return
  loading.value = true
  try {
    await productCategoriesService.deleteCategory(category.id)
    if (selectedCategory.value?.id === category.id) selectedCategory.value = null
    fetchCategories()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleDeleteSubcategory(sub) {
  if (!confirm(`¿Estás seguro de eliminar "${sub.name}"?`)) return
  loading.value = true
  try {
    await productCategoriesService.deleteSubcategory(sub.id)
    fetchSubcategories(selectedCategory.value.id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
