<template>
  <div class="mb-8 p-8 bg-white dark:bg-navy-800 rounded-[2.5rem] border border-slate-100 dark:border-navy-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
    <div class="flex items-center gap-6">
      <div class="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none transform transition-transform hover:scale-105">
        <UserPlusIcon class="w-10 h-10 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Aprobadores Temporales</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium font-inter tracking-tight">Delegación de permisos de aprobación por períodos definidos</p>
      </div>
    </div>
  </div>

  <div class="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 dark:border-navy-700 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="p-8">
      <DxDataGrid
        ref="gridRef"
        :data-source="dataSource"
        key-expr="id"
        :show-borders="false"
        :column-auto-width="true"
        class="modern-grid"
      >
        <DxEditing
          mode="popup"
          :allow-adding="true"
          :allow-updating="true"
          :allow-deleting="true"
          :use-icons="true"
        >
          <DxPopup title="Configurar Delegación" :width="600" :height="500" />
          <DxForm :col-count="1">
            <DxItem data-field="regular_approver_id" />
            <DxItem data-field="temporary_approver_id" />
            <DxItem data-field="id_rol" />
            <DxItem data-field="start_date" editor-type="dxDateBox" />
            <DxItem data-field="end_date" editor-type="dxDateBox" />
          </DxForm>
        </DxEditing>

        <DxColumn data-field="regular_approver_id" caption="Aprobador Titular (Admin)" :visible="false">
          <DxLookup :data-source="titularUsers" value-expr="id" display-expr="fullName" />
          <DxRequiredRule message="Requerido" />
        </DxColumn>
        
        <DxColumn data-field="temporary_approver_id" caption="Aprobador Temporal (Delegado)" :visible="false">
          <DxLookup :data-source="delegadoUsers" value-expr="id" display-expr="fullName" />
          <DxRequiredRule message="Requerido" />
        </DxColumn>

        <DxColumn data-field="id_rol" caption="Rol a Delegar" :visible="false">
          <DxLookup :data-source="filteredRoles" value-expr="id_rol" display-expr="descripcion" />
        </DxColumn>

        <DxColumn data-field="regular_approver_name" caption="Titular" :allow-editing="false" />
        <DxColumn data-field="temporary_approver_name" caption="Delegado" :allow-editing="false" />
        <DxColumn data-field="role_name" caption="Rol" :allow-editing="false" />
        <DxColumn data-field="start_date" caption="Fecha Inicio" data-type="date" format="dd/MM/yyyy" />
        <DxColumn data-field="end_date" caption="Fecha Término" data-type="date" format="dd/MM/yyyy" />
        <DxColumn data-field="status" caption="Estado" :cell-template="statusTemplate" :allow-editing="false" />

        <DxPaging :page-size="10" />
        <DxSearchPanel :visible="true" placeholder="Buscar..." />
      </DxDataGrid>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxItem,
  DxPaging, DxSearchPanel, DxRequiredRule, DxLookup
} from 'devextreme-vue/data-grid'
import { UserPlusIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import conexionApi from '@/services/conexionApi'

const companyId = localStorage.getItem('userIdCompany')
const gridRef = ref(null)
const users = ref([])
const roles = ref([])

const titularUsers = computed(() => users.value.filter(u => u.id_rol === 2))
const delegadoUsers = computed(() => users.value.filter(u => u.id_rol !== 1))
const filteredRoles = computed(() => roles.value.filter(r => r.id_rol !== 1))

const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    const { data } = await conexionApi.get('/temporary-approvers', { params: { company_id: companyId } })
    return data.temporary_approvers
  },
  insert: async (values) => {
    await conexionApi.post('/temporary-approvers', { ...values, company_id: companyId })
    gridRef.value?.instance.refresh()
  },
  update: async (key, values) => {
    await conexionApi.put(`/temporary-approvers/${key}`, values)
    gridRef.value?.instance.refresh()
  },
  remove: async (key) => {
    await conexionApi.delete(`/temporary-approvers/${key}`)
    gridRef.value?.instance.refresh()
  }
})

onMounted(async () => {
  const [usersRes, rolesRes] = await Promise.all([
    conexionApi.get('/configuracion/usuarios/getUsuarios'),
    conexionApi.get('/configuracion/usuarios/getRoles')
  ])
  
  users.value = (usersRes.data.usuarios || [])
    .filter(u => u.id_company === Number(companyId) || u.id_rol === 1)
    .map(u => ({ id: u.id, fullName: `${u.name} ${u.lastname}`, id_rol: u.id_rol }))
  
  roles.value = rolesRes.data.roles || []
  console.log('Roles cargados:', roles.value)
})

function statusTemplate(container, options) {
  const active = options.data.status === 1
  const text = active ? 'Activo' : 'Inactivo'
  const color = active ? 'text-emerald-600' : 'text-red-600'
  container.innerHTML = `<span class="font-bold ${color}">${text}</span>`
}
</script>
