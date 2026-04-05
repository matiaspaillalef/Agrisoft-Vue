<template>
  <div class="space-y-8 animate-fade-in">
    <!-- TOP HEADER & FILTERS -->
    <div
      class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 animate-bounce-subtle">
          <ChartBarIcon class="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Panel Estratégico</h1>
          <p class="text-slate-500 font-medium font-inter">Control de producción y rendimiento en tiempo real</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <!-- REFRESH BUTTON -->
        <button @click="fetchAllData"
          class="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-sm group w-fit!">
          <ArrowPathIcon
            :class="['w-6 h-6 transition-transform duration-700', loading ? 'animate-spin' : 'group-hover:rotate-180']" />
        </button>

        <!-- GROUND SELECTOR -->
        <div class="relative min-w-[240px] flex-grow md:flex-grow-0">
          <select v-model="selectedGround" @change="onGroundChange"
            class="w-full appearance-none bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-all">
            <option value="0">TODOS LOS CAMPOS</option>
            <option v-for="g in grounds" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
          <ChevronDownIcon
            class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
        </div>
      </div>
    </div>

    <!-- MINI CARDS GRID -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MiniCard name="Período Actual" :icon="CalendarIcon" :featured="true" :isLoading="loading" :data="[
        { id: 1, name: 'Fecha Hoy', value: currentDate },
        { id: 2, name: 'Semana', value: currentWeek }
      ]" />

      <MiniCard name="Producción total" :icon="CircleStackIcon" :isLoading="loading" :data="[
        { id: 1, name: 'Kilos Día', value: metrics.kgDay },
        { id: 2, name: 'Temporada', value: metrics.kgSeason }
      ]" />

      <MiniCard name="Eficiencia Temp." :icon="ChartPieIcon" :isLoading="loading" :data="[
        { id: 1, name: 'Días Cosecha', value: metrics.daysHarvest },
        { id: 2, name: 'Prom. Día', value: metrics.avgKgDay }
      ]" />

      <MiniCard name="Equipo Operativo" :icon="UsersIcon" :isLoading="loading" :data="[
        { id: 1, name: 'Cosech.', value: metrics.workersCount },
        { id: 2, name: 'Prom. Cosech.', value: metrics.avgKgWorker }
      ]" />
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- TABLE 1: KILOS VARIETY -->
      <DashboardTable :title="selectedVarietyView === '1' ? 'Kilos Variedad (Hoy)' : 'Kilos Variedad (Temporada)'"
        :thead="selectedVarietyView === '1' ? 'Especie, Variedad, Sector, Kilos, Cajas' : 'Especie, Variedad, Kilos, Cajas'"
        :data="varietyData" :loadingData="loading" :omitirColumns="selectedVarietyView === '1' ? [] : ['sector']">
        <template #header-right>
          <select v-model="selectedVarietyView"
            class="text-[10px] font-black uppercase tracking-widest border-none bg-slate-50 rounded-lg px-3 py-1 cursor-pointer">
            <option value="1">Día</option>
            <option value="2">Temporada</option>
          </select>
        </template>
      </DashboardTable>

      <!-- TABLE 2: DAYS OF HARVEST -->
      <DashboardTable title="Días de Cosecha por Variedad" thead="Especie, Variedad, Días Cosechados"
        :data="harvestDaysData" :loadingData="loading" />
    </div>

    <!-- CHARTS SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- PIE CHART -->
      <div class="lg:col-span-1">
        <DashboardPieChart title="Distribución Variedades" :data="varietiesSeasonPercentage" :loadingData="loading" />
      </div>

      <!-- LINE CHART -->
      <div class="lg:col-span-2">
        <DashboardLineChart title="Humedad y Temperatura (Temporada)" :data="telemetryData" :loadingData="loading" />
      </div>
    </div>

    <!-- OVERALL VIEW SECTION (only when 'Todos los campos' is selected) -->
    <div v-show="selectedGround === '0'" class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
      <DashboardTable title="Kilos Totales por Campo" thead="Campo, Especie, Kilos Totales" :data="kgByGround"
        :loadingData="loading" :omitirColumns="['ground_status']" />

      <DashboardTable :title="selectedHourlyView === '1' ? 'Resumen Horario (Hoy)' : 'Resumen Horario (Temporada)'"
        thead="Campo, Rango, Temp, Hum, Kilos" :data="hourlyData" :loadingData="loading">
        <template #header-right>
          <select v-model="selectedHourlyView"
            class="text-[10px] font-black uppercase tracking-widest border-none bg-slate-50 rounded-lg px-3 py-1 cursor-pointer">
            <option value="1">Día</option>
            <option value="2">Temporada</option>
          </select>
        </template>
      </DashboardTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  ChartBarIcon,
  ArrowPathIcon,
  CalendarIcon,
  UsersIcon,
  CircleStackIcon,
  ChevronDownIcon,
  ChartPieIcon
} from '@heroicons/vue/24/outline'

import MiniCard from '@/components/Dashboard/MiniCard.vue'
import DashboardTable from '@/components/Dashboard/DashboardTable.vue'
import DashboardPieChart from '@/components/Dashboard/DashboardPieChart.vue'
import DashboardLineChart from '@/components/Dashboard/DashboardLineChart.vue'
import { DashboardService } from '@/api/dashboard.services'
import { useCompanyStore } from '@/stores/companyStore'

// --- STATE ---
const { companyID } = useCompanyStore()
const loading = ref(true)
const selectedGround = ref('0')
const grounds = ref([])
const selectedVarietyView = ref('1') // 1: Day, 2: Season
const selectedHourlyView = ref('1') // 1: Day, 2: Season

const metrics = ref({
  kgDay: 0,
  kgSeason: 0,
  daysHarvest: 0,
  avgKgDay: 0,
  workersCount: 0,
  avgKgWorker: 0
})

const varietyData = ref([])
const harvestDaysData = ref([])
const varietiesSeasonPercentage = ref([])
const telemetryData = ref({ humedad: [], temperatura: [], fechas: [] })
const kgByGround = ref([])
const hourlyData = ref([])

const currentDate = computed(() => new Date().toLocaleDateString('es-CL'))
const currentWeek = computed(() => {
  const current = new Date()
  const oneJan = new Date(current.getFullYear(), 0, 1)
  const numberOfDays = Math.floor((current - oneJan) / (24 * 60 * 60 * 1000))
  return Math.ceil((current.getDay() + 1 + numberOfDays) / 7)
})

// --- FETCHING ---
const fetchAllData = async () => {
  if (!companyID.value) return
  loading.value = true

  try {
    const cID = companyID.value
    const gID = selectedGround.value

    // 1. Fetch grounds if not already fetched
    if (grounds.value.length === 0) {
      grounds.value = await DashboardService.getGrounds(cID)
    }

    // 2. Fetch parallel data
    const [
      kgDay,
      kgSeason,
      wCount,
      wWeek,
      vDay,
      vSeason,
      hDays,
      allHDays,
      vPerc,
      telemetry,
      kgGroundAll,
      hourlyDay,
      hourlySeason
    ] = await Promise.all([
      DashboardService.getDataKgDay(cID, gID),
      DashboardService.getDataKgSeason(cID, gID),
      DashboardService.getDataWorkersCount(cID, gID),
      DashboardService.getDataWorkersWeek(cID, gID),
      DashboardService.getDataVaritiesDay(cID, gID),
      DashboardService.getDataVaritiesSeason(cID, gID),
      DashboardService.getDataDaysOfHarvest(cID, gID),
      DashboardService.getDataAllDaysOfHarvest(cID, gID),
      DashboardService.getDataVarietiesSeasonPercentage(cID, gID),
      DashboardService.getDataHumidityTemperatureSeason(cID, gID),
      DashboardService.getDataKgGroundAll(cID),
      DashboardService.getDataKgGroundAllDay(cID),
      DashboardService.getDataKgGroundAllTemp(cID)
    ])

    console.log('Hourly Data Today:', hourlyDay)
    console.log('Hourly Data Season:', hourlySeason)

    // Update Metrics
    metrics.value.kgDay = kgDay?.kg_boxes || 0
    metrics.value.kgSeason = kgSeason?.kg_boxes || 0
    metrics.value.daysHarvest = allHDays?.[0]?.dias_cosecha || 0
    metrics.value.avgKgDay = metrics.value.daysHarvest > 0
      ? Number((metrics.value.kgSeason / metrics.value.daysHarvest).toFixed(1))
      : 0
    metrics.value.workersCount = wCount?.workersCount || 0
    metrics.value.avgKgWorker = metrics.value.workersCount > 0
      ? Number((metrics.value.kgDay / metrics.value.workersCount).toFixed(1))
      : 0

    // Update Tables & Charts
    updateVarietyData(vDay, vSeason)
    harvestDaysData.value = hDays
    varietiesSeasonPercentage.value = vPerc
    telemetryData.value = telemetry
    kgByGround.value = kgGroundAll
    updateHourlyData(hourlyDay, hourlySeason)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const updateVarietyData = (day, season) => {
  varietyData.value = selectedVarietyView.value === '1' ? day : season
}

const updateHourlyData = (day, season) => {
  hourlyData.value = selectedHourlyView.value === '1' ? day : season
}

const onGroundChange = () => {
  fetchAllData()
}

// Watchers for view toggles
watch(selectedVarietyView, () => {
  fetchAllData()
})

watch(selectedHourlyView, () => {
  fetchAllData()
})

// Watcher for company change
watch(companyID, () => {
  selectedGround.value = '0'
  grounds.value = []
  fetchAllData()
})

onMounted(() => {
  fetchAllData()
})

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

@keyframes bounceSubtle {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce-subtle {
  animation: bounceSubtle 3s infinite ease-in-out;
}
</style>
