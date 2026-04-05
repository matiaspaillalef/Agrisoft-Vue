<template>
  <div class="relative flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5 p-8 h-full group">
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-col gap-1">
        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{{ title }}</h4>
        <p class="text-xl font-black text-slate-800 tracking-tight">Reporte Detallado</p>
      </div>
      <slot name="header-right"></slot>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loadingData" class="space-y-4 animate-pulse">
        <div v-for="i in 5" :key="i" class="h-10 w-full bg-slate-50/50 rounded-2xl"></div>
    </div>
    
    <!-- EMPTY STATE -->
    <div v-else-if="!data || data.length === 0 || data === 0" class="flex flex-col items-center justify-center h-64 text-center">
        <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <CircleStackIcon class="w-8 h-8 text-slate-300" />
        </div>
        <p class="text-xs font-black uppercase tracking-widest text-slate-400">No hay registros disponibles</p>
    </div>

    <!-- TABLE WITH MAX-HEIGHT & COMPACT STYLE -->
    <div v-else class="overflow-y-auto max-h-[450px] custom-scrollbar -mx-4 px-4 pb-2">
      <table class="w-full text-sm text-left border-separate border-spacing-y-1">
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th v-for="header in headers" :key="header" class="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50/50">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in normalizedData" :key="idx" class="group transition-all duration-300">
            <td v-for="(value, colIdx) in row" :key="colIdx" 
                :class="[
                  'px-6 py-3 bg-slate-50/20 group-hover:bg-blue-50/40 transition-colors first:rounded-l-xl last:rounded-r-xl border-y border-transparent',
                  'text-xs font-bold transition-all group-hover:text-blue-600',
                  getColumnClass(colIdx)
                ]">
              <span class="inline-block" :class="value === '-' ? 'opacity-20' : ''">
                  {{ formatCellValue(value, colIdx) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CircleStackIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  data: Array,
  thead: String,
  title: String,
  loadingData: Boolean,
  omitirColumns: { type: Array, default: () => [] }
})

const headers = computed(() => props.thead.split(',').map(h => h.trim()))

const normalizedData = computed(() => {
  if (!props.data || props.data.length === 0 || props.data === 0) return []
  
  // Get keys from first object that aren't in omitirColumns
  const keys = Object.keys(props.data[0]).filter(key => !props.omitirColumns.includes(key))
  
  // Transform array of objects to array of arrays (only visible columns)
  return props.data.map(row => keys.map(key => row[key]))
})

const getColumnClass = (idx) => {
  if (idx === 0) return 'text-slate-800 font-extrabold'
  // Numbers usually on the right
  const isNumericValue = normalizedData.value?.[0]?.[idx] !== undefined && (typeof normalizedData.value?.[0]?.[idx] === 'number')
  return isNumericValue || idx >= headers.value.length - 1 ? 'text-right tabular-nums' : 'text-slate-600'
}

const formatCellValue = (value, colIdx) => {
  if (value === null || value === undefined || value === 0 && colIdx > 1) return '-'
  if (typeof value === 'number') {
      return new Intl.NumberFormat('es-CL').format(value)
  }
  return value
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}
</style>
