<template>
  <li :class="levelClass">
    <div v-if="hasChildren">
      <button @click="toggleOpen"
        class="flex items-center gap-2 text-[13px] py-2 cursor-pointer w-full !bg-transparent !pl-0 !pr-0 group transition-colors duration-200 !text-blue-950"
        :class="{ 'text-blue-700 font-semibold': isItemActive, 'text-blue-950': !isItemActive }">
        <span class="inline-flex items-center text-left gap-2 w-full">
          <component :is="iconComponent" class="h-5 w-5" v-if="iconComponent" />
          <span class="relative">
            <span :class="`text-left ${level === 2 || level === 3 ? 'truncate' : ''}`">{{ item.name }}</span>
            <!-- Línea animada -->
            <span
              class="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
          </span>
        </span>
        <ChevronDownIcon class="h-4 w-4 ml-auto transition-transform" :class="{ 'rotate-180': isOpen }" />
      </button>

      <!-- Submenú -->
      <ul v-show="isOpen" class="pl-4 flex flex-col gap-0">
        <MenuItem v-for="child in item.children" :key="child.id" :item="child" :level="level + 1" />
      </ul>
    </div>

    <!-- Ítem sin hijos -->
    <div v-else>
      <router-link :to="item.url || '#'"
        class="flex items-center gap-2 text-[13px] py-2 group transition-colors duration-200"
        active-class="!text-blue-700 font-semibold router-link-active" :class="{ 'text-blue-950': !isExactActive }">
        <component :is="iconComponent" class="h-5 w-5" v-if="iconComponent" />
        <span class="relative">
          <span :class="{ truncate: level === 2 || level === 3, solitary: level === 1 }">{{
            item.name
          }}</span>
          <span
            class="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
        </span>
      </router-link>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useRoute } from 'vue-router'

const props = defineProps({
  item: Object,
  level: {
    type: Number,
    default: 1,
  },
})

const route = useRoute()
const isOpen = ref(false)

const hasChildren = computed(
  () => Array.isArray(props.item?.children) && props.item.children.length > 0,
)

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

// Check if current route is within this item or its descendants
const checkIsActive = (item: any, currentPath: string): boolean => {
  if (!item) return false;
  if (item.url && item.url === currentPath) return true;
  if (item.children && Array.isArray(item.children)) {
    return item.children.some((child: any) => checkIsActive(child, currentPath));
  }
  return false;
}

// Compute if this item or any of its children are active
const isItemActive = computed(() => {
  return checkIsActive(props.item, route.path)
})

// Compute if the current item is exactly active
const isExactActive = computed(() => {
  return props.item?.url && props.item.url === route.path
})

onMounted(() => {
  if (hasChildren.value && isItemActive.value) {
    isOpen.value = true
  }
})

watch(() => route.path, (newPath) => {
  if (hasChildren.value && checkIsActive(props.item, newPath)) {
    isOpen.value = true
  }
})

// Obtener componente de ícono dinámicamente
const iconComponent = computed(() => {
  if (!props.item?.icon) return null;
  return HeroIcons[props.item.icon as keyof typeof HeroIcons] || null
})

// Clases según nivel
const levelClass = computed(() => {
  return [
    'menu-item',
    {
      'first-level': props.level === 1,
      'second-level': props.level === 2,
      'third-level': props.level === 3,
    },
  ]
})
</script>
