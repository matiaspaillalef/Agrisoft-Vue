<template>
  <router-view :key="routerKey" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCompanyStore } from '@/stores/companyStore'

const routerKey = ref(0)

const { onCompanyChange } = useCompanyStore()

onMounted(() => {
  onCompanyChange(() => {
    // 🔥 fuerza remount de TODAS las páginas
    routerKey.value++
  })
})
</script>
