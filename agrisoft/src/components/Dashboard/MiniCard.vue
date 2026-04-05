<template>
  <div :class="[
    'relative overflow-hidden flex flex-col justify-between p-6 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1',
    featured
      ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-200'
      : 'bg-white border-slate-100 shadow-sm hover:shadow-blue-900/5'
  ]">
    <!-- DECORATIVE GRADIENT FOR FEATURED -->
    <div v-if="featured"
      class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

    <div class="relative z-10 flex flex-col h-full">
      <div class="flex items-center gap-4 mb-6">
        <div :class="[
          'p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110',
          featured ? 'bg-white/20 text-white shadow-lg shadow-black/10' : 'bg-blue-50 text-blue-600'
        ]">
          <component :is="icon" class="w-6 h-6" />
        </div>
        <h4 :class="[
          'text-xs font-black uppercase tracking-widest leading-none',
          featured ? 'text-blue-100' : 'text-slate-400'
        ]">
          {{ name }}
        </h4>
      </div>

      <div v-if="isLoading" class="flex gap-10 animate-pulse">
        <div v-for="i in 2" :key="i" class="flex flex-col gap-3">
          <div :class="['h-3 w-16 rounded-full', featured ? 'bg-white/20' : 'bg-slate-100']"></div>
          <div :class="['h-8 w-24 rounded-2xl', featured ? 'bg-white/30' : 'bg-slate-200']"></div>
        </div>
      </div>

      <div v-else class="flex flex-wrap gap-x-12 gap-y-6">
        <div v-for="item in data" :key="item.id" class="flex flex-col group/item cursor-default">
          <p :class="[
            'text-[10px] font-black uppercase tracking-widest mb-1.5 transition-colors',
            featured ? 'text-blue-200/80 group-hover/item:text-white' : 'text-slate-500 group-hover/item:text-blue-600'
          ]">
            {{ item.name }}
          </p>
          <div class="flex items-baseline gap-1">
            <h4 :class="[
              'text-lg font-black tracking-tight leading-none',
              featured ? 'text-white' : 'text-slate-800'
            ]">
              {{ formatValue(item.value) }}
            </h4>
            <span v-if="item.name.toLowerCase().includes('kilo')" :class="[
              'text-[10px] font-black uppercase tracking-widest opacity-40',
              featured ? 'text-white' : 'text-slate-400'
            ]">kg</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  name: String,
  icon: Object,
  data: Array,
  featured: Boolean,
  isLoading: Boolean
})

const formatValue = (value) => {
  if (value === undefined || value === null) return '0'
  if (typeof value === 'number') {
    // If it's a decimal, show 1 decimal place, otherwise integer
    const formatted = Number.isInteger(value)
      ? new Intl.NumberFormat('es-CL').format(value)
      : new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
    return formatted
  }
  return value
}
</script>

<style scoped>
/* Smooth entrance */
.animate-slide-in {
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
