<template>
  <nav aria-label="Breadcrumb">
    <ol>
      <li v-for="(crumb, i) in breadcrumbs" :key="i">
        <router-link v-if="i < breadcrumbs.length - 1" :to="crumb.to">
          {{ crumb.label }}
        </router-link>
        <span v-else>{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouteLocationMatched } from 'vue-router'

type Crumb = { label: string; to: any }

const route = useRoute()
const router = useRouter()

//console.log('Current route:', route.name, route.path)
//console.log('router:', router);

const getLabel = (rec: RouteLocationMatched): string => {
  const metaLabel = rec.meta?.breadcrumb as
    | string
    | ((r: ReturnType<typeof useRoute>) => string)
    | undefined

  if (typeof metaLabel === 'function') return metaLabel(route)
  if (typeof metaLabel === 'string' && metaLabel.trim()) return metaLabel

  // Fallbacks
  if (rec.meta?.title) return String(rec.meta.title)
  if (rec.name) return String(rec.name)
  return rec.path || '/'
}

const breadcrumbs = computed<Crumb[]>(() => {
  // Permite ocultar un nivel con meta.breadcrumb === false
  const matched = route.matched.filter((r) => r.meta?.breadcrumb !== false)

  return matched.map((rec) => {
    // Preferimos resolver por "name" si existe (mejor manejo de params)
    if (rec.name) {
      const to = {
        name: rec.name as string,
        params: route.params,
        query: undefined,
        hash: undefined,
      }
      return { label: getLabel(rec), to }
    }

    // Si no hay "name", construimos el path reemplazando :params
    let path = rec.path.replace(/:(\w+)/g, (_, key: string) => String(route.params[key] ?? ''))
    // Normaliza con router.resolve para obtener href correcto
    const to = router.resolve({ path }).href
    return { label: getLabel(rec), to }
  })
})
</script>
