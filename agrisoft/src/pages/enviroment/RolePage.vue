<template>
  <!-- Title Header -->
  <div
    class="mb-8 p-6 bg-white dark:bg-navy-800 rounded-3xl border border-slate-100 dark:border-navy-700 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none">
        <ShieldCheckIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Roles y Permisos</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium font-inter">Gestión de niveles de acceso del sistema
        </p>
      </div>
    </div>
  </div>

  <!-- Main Grid -->
  <div
    class="mt-4 flex w-full flex-grow items-center justify-around gap-2 rounded-3xl bg-white dark:bg-navy-800 py-6 px-4 md:px-8 shadow-xl relative border border-slate-100 dark:border-navy-700">
    <LoadingOverlay :show="loading" />

    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id_rol" :show-borders="false"
      :column-auto-width="true" :width="'100%'" class="custom-grid">
      <DxScrolling mode="virtual" />
      <DxSearchPanel :visible="true" :width="280" placeholder="Buscar rol..." />
      <DxPaging :page-size="10" />

      <DxColumn data-field="id_rol" caption="ID" width="80" alignment="left" css-class="font-mono text-slate-400" />
      <DxColumn data-field="descripcion" caption="Nombre del Rol"
        css-class="font-bold text-slate-700 dark:text-slate-200 !align-left" alignment="left" />

      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
        <DxPopup title="Gestión de Roles" :show-title="true" :width="500" :height="250" />
        <DxForm :col-count="1">
          <DxItem data-field="descripcion" caption="Descripción del Rol" item-type="simple"
            :validation-rules="[{ type: 'required', message: 'La descripción es obligatoria' }]" />
        </DxForm>
      </DxEditing>
    </DxDataGrid>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid,
  DxColumn,
  DxScrolling,
  DxSearchPanel,
  DxPaging,
  DxEditing,
  DxPopup,
  DxForm,
  DxItem
} from 'devextreme-vue/data-grid'

import { ShieldCheckIcon } from '@heroicons/vue/24/outline'
import conexionApi from '@/services/conexionApi.js'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const loading = ref(false)
const mainGridRef = ref(null)

const dataSource = new CustomStore({
  key: 'id_rol',
  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/configuracion/usuarios/getRoles')
      return data.roles || []
    } catch (error) {
      console.error('Error cargando roles:', error)
      return []
    } finally {
      loading.value = false
    }
  },
  insert: async (values) => {
    const { data } = await conexionApi.post('/configuracion/usuarios/crearRol', values)
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data
  },
  update: async (key, values) => {
    const { data } = await conexionApi.post('/configuracion/usuarios/actualizarRol', { ...values, id_rol: key })
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data
  },
  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/usuarios/eliminarRol', { id_rol: key })
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data
  }
})
</script>

<style scoped>
.custom-grid :deep(.dx-datagrid-header-panel) {
  padding: 0 0 20px 0;
  background-color: transparent;
}

.custom-grid :deep(.dx-datagrid-search-panel) {
  margin-left: 0;
}

.custom-grid :deep(.dx-datagrid-filter-row) {
  background-color: #f8fafc;
}

.dark .custom-grid :deep(.dx-datagrid-filter-row) {
  background-color: #1e293b;
}

.custom-grid :deep(.dx-datagrid-content .dx-datagrid-table .dx-row > td) {
  padding: 16px;
  vertical-align: middle;
}

.custom-grid :deep(.dx-datagrid-headers .dx-header-row > td) {
  text-align: left !important;
}
</style>
