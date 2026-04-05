<template>
  <div class="relative flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5 p-8 h-full group">
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-col gap-1">
        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{{ title }}</h4>
        <p class="text-xl font-black text-slate-800 tracking-tight">Distribución por Variedad</p>
      </div>
      <div class="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
        <ChartPieIcon class="w-5 h-5" />
      </div>
    </div>
    
    <div v-if="loadingData" class="flex flex-col items-center justify-center h-64 animate-pulse">
        <div class="w-48 h-48 rounded-full border-[15px] border-slate-50 border-t-blue-100"></div>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="flex flex-col items-center justify-center h-64 text-center">
        <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <ChartPieIcon class="w-8 h-8 text-slate-300" />
        </div>
        <p class="text-xs font-black uppercase tracking-widest text-slate-400">Sin datos de cosecha</p>
    </div>

    <div v-else class="flex flex-col h-full">
      <div class="relative h-64">
        <DxPieChart
          id="pie"
          :data-source="data"
          :palette="['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#A855F7', '#F43F5E', '#14B8A6']"
          type="doughnut"
          :inner-radius="0.75"
          class="h-full"
        >
          <DxSeries
            argument-field="variety"
            value-field="cantidad"
          >
            <DxLabel :visible="false" />
          </DxSeries>
          <DxLegend :visible="false" />
          <DxTooltip
            :enabled="true"
            :customize-tooltip="customizeTooltip"
            :padding-left-right="16"
            :padding-top-bottom="12"
            :border="{ visible: false }"
            :shadow="{ blur: 15, color: 'rgba(0,0,0,0.1)' }"
            :font="{ size: 13, weight: 700 }"
            :corner-radius="12"
          />
        </DxPieChart>
        
        <!-- CENTER TOTAL -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kilos</span>
          <span class="text-2xl font-black text-slate-800 tracking-tighter mt-1">{{ formatKilos(totalKilos) }}</span>
        </div>
      </div>

      <!-- MODERN LEGEND / METRICS -->
      <div class="mt-8 space-y-3">
        <div v-for="(item, idx) in sortedData.slice(0, 4)" :key="idx" 
          class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors group/item">
          <div class="flex items-center gap-3">
            <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: getPaletteColor(idx) }"></div>
            <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wide truncate max-w-[120px]">{{ item.variety }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-black text-slate-400">{{ formatKilos(item.cantidad) }} kg</span>
            <span class="bg-white px-2 py-1 rounded-lg text-[10px] font-black text-blue-600 shadow-sm border border-slate-100 group-hover/item:border-blue-100">
                {{ formatPercent(item.percent) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChartPieIcon } from '@heroicons/vue/24/outline'
import DxPieChart, {
  DxSeries,
  DxLabel,
  DxTooltip,
  DxLegend
} from 'devextreme-vue/pie-chart'

const props = defineProps({
  data: Array,
  title: String,
  loadingData: Boolean
})

const palette = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#A855F7', '#F43F5E', '#14B8A6']
const getPaletteColor = (idx) => palette[idx % palette.length]

const totalKilos = computed(() => {
    if (!props.data) return 0
    return props.data.reduce((acc, curr) => acc + curr.cantidad, 0)
})

const sortedData = computed(() => {
    if (!props.data) return []
    const total = totalKilos.value
    return [...props.data].map(item => ({
        ...item,
        percent: total > 0 ? (item.cantidad / total) * 100 : 0
    })).sort((a, b) => b.cantidad - a.cantidad)
})

const formatKilos = (val) => new Intl.NumberFormat('es-CL').format(Math.round(val))
const formatPercent = (val) => Number(val).toFixed(1)

const customizeTooltip = (arg) => {
  return {
    html: `
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-black uppercase text-slate-400 opacity-70">${arg.argumentText}</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-black text-slate-800">${formatKilos(arg.value)} kg</span>
          <span class="text-xs font-black text-blue-600">(${arg.percentText})</span>
        </div>
      </div>
    `
  }
}
</script>

<style scoped>
/* DevExtreme resets */
:deep(.dx-tooltip-wrapper .dx-overlay-content) {
    border-radius: 12px !important;
    border: none !important;
}
</style>
