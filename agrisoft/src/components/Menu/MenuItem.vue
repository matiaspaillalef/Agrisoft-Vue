<template>
  <li v-if="isVisible" :class="[levelClass, isHorizontal ? 'relative' : '']">
    <div v-if="hasChildren">
      <button @click="toggleOpen"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer w-full group transition-all duration-300 rounded-2xl mb-1 mt-1 bg-transparent!"
        :class="[
          isItemActive ? 'text-blue-600! font-normal' : 'text-slate-800! hover:text-blue-600!',
          isCollapsed ? 'justify-center !px-0' : ''
        ]">
        <component :is="iconComponent" class="h-5.5 w-5.5 flex-shrink-0 transition-colors" v-if="iconComponent" />
        <span v-if="!isCollapsed" class="text-[14px] flex-1 text-left tracking-tight font-normal">{{ item.name }}</span>
        <ChevronDownIcon v-if="!isCollapsed" class="h-4 w-4 transition-transform duration-400"
          :class="{ 'rotate-180': isOpen }" />
      </button>

      <!-- Submenú -->
      <Transition name="expand">
        <ul v-show="isOpen && !isCollapsed" 
            :class="isHorizontal 
              ? (level === 1 
                  ? 'absolute left-0 top-[100%] mt-4 bg-white dark:bg-navy-800 shadow-xl rounded-2xl p-2 min-w-[220px] z-[100] flex flex-col gap-1 border border-slate-100 dark:border-navy-700' 
                  : 'absolute left-[100%] top-0 ml-2 bg-white dark:bg-navy-800 shadow-xl rounded-2xl p-2 min-w-[220px] z-[100] flex flex-col gap-1 border border-slate-100 dark:border-navy-700')
              : 'pl-4 flex flex-col gap-1 overflow-hidden mt-1'">
          <MenuItem v-for="child in item.children" :key="child.id" :item="child" :level="level + 1"
            :isCollapsed="isCollapsed" :isHorizontal="isHorizontal" />
        </ul>
      </Transition>
    </div>

    <!-- Ítem sin hijos -->
    <div v-else>
      <router-link :to="item.url || '#'"
        class="flex items-center gap-3 px-2 py-1 group transition-all duration-300 rounded-full mb-1 mt-1 bg-transparent!"
        active-class="!text-blue-600 font-normal" :class="[
          level !== 1 ? 'pl-0' : '',
          !isExactActive ? 'text-slate-800! hover:text-blue-600!' : '',
          isCollapsed ? 'justify-center !px-0' : ''
        ]">
        <div class="relative flex items-center justify-center">
          <component :is="iconComponent" class="h-5.5 w-5.5 flex-shrink-0 transition-colors" v-if="iconComponent" />
        </div>
        <span v-if="!isCollapsed" class="text-[14px] font-normal truncate tracking-tight">{{ item.name }}</span>
      </router-link>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  item: Object,
  level: {
    type: Number,
    default: 1,
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  isHorizontal: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const userRol = Number(localStorage.getItem('rol') || 0)
const isOpen = ref(false)

const hasChildren = computed(
  () => Array.isArray(props.item?.children) && props.item.children.length > 0,
)

const canAccess = (item: any): boolean => {
  if (!item) return false

  // Si tiene URL, verificamos contra el router
  if (item.url && item.url !== '#') {
    const resolved = router.resolve(item.url)
    // resolve() devuelve la ruta 'NotFound' si no existe, pero nosotros queremos ver los roles
    if (resolved && resolved.matched.length > 0) {
      // Buscamos roles en cualquier nivel de la ruta matched
      const requiredRoles = resolved.matched.find(m => m.meta && m.meta.roles)?.meta?.roles as number[] | undefined
      if (requiredRoles && !requiredRoles.includes(userRol)) {
        return false
      }
    }
  }

  // Si es un padre, debe tener al menos un hijo accesible
  if (item.children && item.children.length > 0) {
    return item.children.some((child: any) => canAccess(child))
  }

  return true
}

const isVisible = computed(() => canAccess(props.item))

const toggleOpen = () => {
  isOpen.value = !isOpen.value
}

const checkIsActive = (item: any, currentPath: string): boolean => {
  if (!item) return false;
  if (item.url && item.url === currentPath) return true;
  if (item.children && Array.isArray(item.children)) {
    return item.children.some((child: any) => checkIsActive(child, currentPath));
  }
  return false;
}

const isItemActive = computed(() => {
  return checkIsActive(props.item, route.path)
})

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

const iconComponent = computed(() => {
  if (!props.item?.icon) return null;
  return HeroIcons[props.item.icon as keyof typeof HeroIcons] || null
})

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

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 800px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.router-link-active {
  transform: scale(1.02);
}
</style>
