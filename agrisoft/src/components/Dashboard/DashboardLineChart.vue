<template>
  <div class="relative flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5 p-8 h-full group">
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex flex-col gap-1">
        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{{ title }}</h4>
        <p class="text-xl font-black text-slate-800 tracking-tight">Análisis de Telemetría</p>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
          <div class="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div>
          <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Temp</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
          <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Hum</span>
        </div>
      </div>
    </div>
    
    <div v-if="loadingData" class="flex flex-col items-center justify-center h-72 animate-pulse">
        <div class="w-full h-full bg-slate-50/50 rounded-3xl"></div>
    </div>
    
    <div v-else-if="!formattedData || formattedData.length === 0" class="flex flex-col items-center justify-center h-72 text-center">
        <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <ChartBarIcon class="w-8 h-8 text-slate-300" />
        </div>
        <p class="text-xs font-black uppercase tracking-widest text-slate-400">Sin señales de sensores</p>
    </div>

    <div v-else class="flex flex-col h-full">
      <div class="h-72">
        <DxChart
          id="chart"
          :data-source="formattedData"
          class="h-full"
        >
          <DxCommonSeriesSettings
            argument-field="fecha"
            type="spline"
            :point="{ size: 8, hoverStyle: { size: 12, border: { width: 4, color: '#fff' } } }"
          />
          <DxSeries
            value-field="temperatura"
            name="Temperatura"
            color="#3B82F6"
            :width="4"
          />
          <DxSeries
            value-field="humedad"
            name="Humedad"
            color="#10B981"
            :width="4"
          />
          
          <DxArgumentAxis :label="{ font: { size: 10, weight: 800, color: '#94a3b8' } }">
            <DxGrid :visible="false" />
            <DxTick :visible="false" />
          </DxArgumentAxis>
          
          <DxValueAxis :label="{ font: { size: 10, weight: 800, color: '#94a3b8' } }">
            <DxGrid :visible="true" color="#f8fafc" />
          </DxValueAxis>

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
        </DxChart>
      </div>

      <!-- INSIGHTS / SUMMARY STATS -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-3xl bg-blue-50/50 border border-blue-100/20 flex flex-col items-center justify-center text-center">
              <span class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Temp. Max</span>
              <span class="text-lg font-black text-blue-900 tracking-tight">{{ stats.maxTemp }}°C</span>
          </div>
          <div class="p-4 rounded-3xl bg-blue-50/50 border border-blue-100/20 flex flex-col items-center justify-center text-center">
              <span class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Temp. Prom</span>
              <span class="text-lg font-black text-blue-900 tracking-tight">{{ stats.avgTemp }}°C</span>
          </div>
          <div class="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-100/20 flex flex-col items-center justify-center text-center">
              <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Hum. Max</span>
              <span class="text-lg font-black text-emerald-900 tracking-tight">{{ stats.maxHum }}%</span>
          </div>
          <div class="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-100/20 flex flex-col items-center justify-center text-center">
              <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Hum. Prom</span>
              <span class="text-lg font-black text-emerald-900 tracking-tight">{{ stats.avgHum }}%</span>
          </div>
      </div>

      <!-- TREND FOOTER -->
      <div class="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="p-1 rounded-md bg-emerald-100 text-emerald-600">
                <ChevronUpIcon class="w-3 h-3" />
            </span>
            Tendencia estable registrada hoy
          </p>
          <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
            Periodo Actual
          </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChartBarIcon, ChevronUpIcon } from '@heroicons/vue/24/outline'
import DxChart, {
  DxSeries,
  DxCommonSeriesSettings,
  DxTooltip,
  DxLegend,
  DxArgumentAxis,
  DxValueAxis,
  DxGrid,
  DxTick
} from 'devextreme-vue/chart'

const props = defineProps({
  data: Object,
  title: String,
  loadingData: Boolean
})

const formattedData = computed(() => {
  if (!props.data || !props.data.fechas || props.data.fechas.length === 0) return []
  return props.data.fechas.map((fecha, idx) => ({
    fecha: fecha,
    temperatura: parseFloat(props.data.temperatura[idx]) || 0,
    humedad: parseFloat(props.data.humedad[idx]) || 0,
  })).reverse()
})

const stats = computed(() => {
    if (!formattedData.value.length) return { maxTemp: 0, avgTemp: 0, maxHum: 0, avgHum: 0 }
    
    const temps = formattedData.value.map(d => d.temperatura)
    const hums = formattedData.value.map(d => d.humedad)
    
    return {
        maxTemp: Math.max(...temps).toFixed(1),
        avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
        maxHum: Math.max(...hums).toFixed(1),
        avgHum: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1)
    }
})

const formatKilos = (val) => new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1 }).format(val)

const customizeTooltip = (arg) => {
  const isTemp = arg.seriesName === 'Temperatura'
  return {
    html: `
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-black uppercase text-slate-400 opacity-70">${arg.argumentText}</span>
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${isTemp ? '#3B82F6' : '#10B981'}"></div>
          <span class="text-sm font-black text-slate-800">${formatKilos(arg.value)}${isTemp ? '°C' : '%'}</span>
        </div>
      </div>
    `
  }
}
</script>

<style scoped>
:deep(.dx-tooltip-wrapper .dx-overlay-content) {
    border-radius: 12px !important;
    border: none !important;
}
</style>
