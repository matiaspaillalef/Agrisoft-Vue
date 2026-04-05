<template>
  <div class="flex flex-col gap-1.5 transition-all duration-300 hover:translate-x-1 group">
    <span class="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none pl-0.5 group-hover:text-blue-500 transition-colors">
      {{ title }}
    </span>
    <div class="flex items-center gap-2">
      <div class="w-1 h-3 bg-blue-100 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>
      <span class="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
        {{ value || '---' }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: '---'
  }
})
</script>
