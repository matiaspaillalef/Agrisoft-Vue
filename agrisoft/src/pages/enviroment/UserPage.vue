<template>
  <!-- Title -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <UsersIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Usuarios</h1>
        <p class="text-slate-500 font-medium font-inter">Administración centralizada de usuarios del sistema</p>
      </div>
    </div>

    <!-- Floating-like button if admin needs to go back to original user -->
    <div v-if="isImpersonating" class="flex gap-2">
      <button @click="revertImpersonation"
        class="flex items-center gap-2 bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-200 transition-colors">
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
        Volver a mi cuenta
      </button>
    </div>
  </div>

  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      @init-new-row="onInitNewRow" :width="'100%'">
      <!-- Panel adaptable -->

      <DxColumnFixing :enabled="true" />
      <DxHeaderFilter :visible="true" :allow-search="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxPaging :page-size="15" />

      <DxColumn data-field="id" caption="ID" css-class="!text-left" :allow-filtering="false" />
      <DxColumn data-field="name" caption="Nombre" css-class="!text-left" alignment="right" />
      <DxColumn data-field="lastname" caption="Apellido" css-class="!text-left" alignment="right" />
      <DxColumn data-field="mail" caption="Email" css-class="!text-left" alignment="right" />
      <DxColumn data-field="id_rol" caption="Rol" css-class="!text-left" alignment="right">
        <DxLookup :data-source="rolesDS" value-expr="id_rol" display-expr="descripcion" />
      </DxColumn>
      <DxColumn data-field="id_company" caption="Empresa" css-class="!text-left" alignment="right">
        <DxLookup :data-source="companiesDS" value-expr="id" display-expr="name_company" />
      </DxColumn>
      <DxColumn data-field="id_state" caption="" :cell-template="statusCellTemplate" css-class="!text-center"
        alignment="right" :allow-filtering="false" />
      <DxColumn data-field="password" caption="Contraseña" css-class="!text-left" :visible="false"
        :allow-filtering="false" />
      <DxColumn type="buttons" width="140" :buttons="customButtons" :allow-filtering="false" />
      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true">
        <DxPopup title="Gestión de Usuario" :show-title="true" :width="900" :height="450" />
        <DxForm>
          <DxItem data-field="name" :is-required="true">
            <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El nombre es obligatorio' }]" />
          </DxItem>

          <DxItem data-field="lastname" :is-required="true">
            <DxSimpleItem :validation-rules="[{ type: 'required', message: 'El apellido es obligatorio' }]" />
          </DxItem>

          <DxItem data-field="mail" :is-required="true">
            <DxSimpleItem :validation-rules="[
              { type: 'required', message: 'El email es obligatorio' },
              { type: 'custom', validationCallback: (e) => validarEmail(e.value), message: 'El email no es válido' }
            ]" />
          </DxItem>

          <DxItem data-field="id_rol" caption="Rol" editor-type="dxSelectBox" :editor-options="{
            dataSource: rolesDS,
            valueExpr: 'id_rol',
            displayExpr: 'descripcion',
            searchEnabled: true,
            placeholder: 'Seleccione rol'
          }" />

          <DxItem data-field="id_company" caption="Empresa" editor-type="dxSelectBox" :editor-options="{
            dataSource: companiesDS,
            valueExpr: 'id',
            displayExpr: 'name_company',
            searchEnabled: true,
            placeholder: 'Seleccione empresa',
            readOnly: userRol !== 1
          }" />

          <DxItem data-field="password" :is-required="true">
            <DxSimpleItem :validation-rules="[{ type: 'required', message: 'La contraseña es obligatoria' }]" />
          </DxItem>
          <DxItem data-field="id_state" caption="Estado" editor-type="dxSelectBox" :is-required="true" :editor-options="{
            dataSource: [
              { id: 1, name: 'Activo' },
              { id: 0, name: 'Inactivo' }
            ],
            displayExpr: 'name',
            valueExpr: 'id',
            placeholder: 'Seleccione estado'
          }" :validation-rules="[{ type: 'required', message: 'El estado es obligatorio' }]" />

        </DxForm>

      </DxEditing>


    </DxDataGrid>
  </div>

  <!-- Floating Button (Super Admin) -->
  <div v-if="userRol === 1" class="fixed bottom-10 right-10 z-[100]">
    <button @click="showImpersonatePopup = true"
      class="flex items-center gap-3 bg-indigo-600! text-sm! hover:bg-indigo-700! text-white px-8! py-5 rounded-full! shadow-2xl transition-all hover:scale-105 active:scale-95 font-normal border-4 border-white/20 backdrop-blur-sm">
      <UserGroupIcon class="w-7 h-7" />
      Cambiar de usuario
    </button>
  </div>

  <!-- Popup de Suplantación -->
  <DxStandalonePopup v-model:visible="showImpersonatePopup" title="Suplantar Usuario" :width="500" :height="450"
    class="premium-popup">
    <div class="p-8 h-full flex flex-col items-center justify-center text-center">
      <div class="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-6">
        <ShieldCheckIcon class="w-12 h-12" />
      </div>
      <h2 class="text-2xl font-black text-slate-800 mb-2">Cambiar de Contexto</h2>
      <p class="text-slate-500 font-medium mb-8 leading-relaxed">Selecciona un usuario para ver el sistema con sus
        permisos e información:</p>

      <DxSelectBox v-model="targetUserId" :data-source="usersList" display-expr="fullName" value-expr="id"
        search-enabled placeholder="Buscar usuario por nombre o email..."
        class="w-full !rounded-2xl border-slate-100 shadow-sm mb-10 h-14" />

      <div class="mt-auto flex w-full gap-4">
        <button @click="showImpersonatePopup = false"
          class="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
        <button @click="handleImpersonate" :disabled="!targetUserId || impersonating"
          class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 disabled:opacity-50">
          {{ impersonating ? 'Cargando...' : 'Suplantar' }}
        </button>
      </div>
    </div>
  </DxStandalonePopup>
</template>


<script setup>
import { ref, computed, reactive, nextTick, watch, shallowRef } from 'vue'
import CustomStore from 'devextreme/data/custom_store'

import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  DxPopup,
  DxForm,
  DxItem,
  DxLookup,
  DxPaging,
  DxScrolling,
  DxColumnChooser,
  DxColumnFixing,
  DxSearchPanel,
  DxSelection,
  DxFilterRow,
  DxHeaderFilter
} from 'devextreme-vue/data-grid'
import { DxPopup as DxStandalonePopup } from 'devextreme-vue/popup'
import DxSelectBox from 'devextreme-vue/select-box'
import {
  UsersIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useCompanyStore } from '@/stores/companyStore'

// FORM
import {
  DxSimpleItem
} from 'devextreme-vue/form'

import conexionApi from '@/services/conexionApi.js'
import { statusCellTemplate, validarEmail } from '@/utils/herlpers'

const loading = ref(false)
const mainGridRef = ref(null)

const { companyID: selectedCompanyID, onCompanyChange } = useCompanyStore()

const userRol = Number(localStorage.getItem('rol')) || 0
const currentCompanyId = Number(localStorage.getItem('userIdCompany'))
const isImpersonating = !!localStorage.getItem('original_token')

function onInitNewRow(e) {
  if (userRol !== 1) {
    e.data.id_company = currentCompanyId
  }
}

const showImpersonatePopup = ref(false)
const targetUserId = ref(null)
const impersonating = ref(false)
const usersList = ref([])

const roles = shallowRef([])
const companies = shallowRef([])

const loadRoles = async () => {
  try {
    const { data } = await conexionApi.get('/configuracion/usuarios/getRoles')
    roles.value = [...(data.roles || [])]
  } catch (e) {
    console.error('Error cargando roles', e)
  }
}
loadRoles()

const loadCompanies = async () => {
  try {
    const { data } = await conexionApi.get('/configuracion/empresas/getEmpresas')
    companies.value = [...(data.companies || [])]
  } catch (e) {
    console.error('Error cargando empresas', e)
  }
}
loadCompanies()

onCompanyChange(() => {
  mainGridRef.value?.instance?.refresh()
})

watch(roles, () => {
  mainGridRef.value?.instance?.refresh()
})

watch(companies, () => {
  mainGridRef.value?.instance?.refresh()
})

const rolesDS = computed(() => {
  let filteredRoles = roles.value
  if (userRol !== 1) {
    // Si no es superadmin, no puede ver ni asignar rol 1 ni 2
    filteredRoles = filteredRoles.filter(r => r.id_rol !== 1 && r.id_rol !== 2)
  }
  return { store: filteredRoles }
})

const companiesDS = computed(() => ({
  store: companies.value
}))

const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/configuracion/usuarios/getUsuarios')
      const usuarios = data.usuarios || []

      // Filtrar usuarios por la empresa seleccionada actualmente
      const filteredUsers = usuarios.filter(u => u.id_company === selectedCompanyID.value)

      usersList.value = filteredUsers.map(u => ({
        ...u,
        fullName: `${u.name} ${u.lastname} (${u.mail})`
      }))

      return filteredUsers
    } finally {
      loading.value = false
    }
  },
  insert: async (values) => {
    const payload = {
      ...values,
      id_state: values.id_state ?? 1,
      password: values.password || "",
    }
    const { data } = await conexionApi.post('/configuracion/usuarios/crearUsuarios', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data.usuario || payload // Devuelve la entidad creada
  },
  update: async (key, values) => {
    const instance = mainGridRef.value.instance;
    const currentData = instance.getVisibleRows().find(r => r.key === key)?.data || {}
    const payload = { ...currentData, ...values, id: key }

    const { data } = await conexionApi.post('/configuracion/usuarios/actualizarUsuarios', payload)
    if (data.code === "ERROR") throw new Error(data.mensaje)
    return data.usuario || payload // Devuelve el objeto actualizado
  },
  remove: async (key) => {
    const { data } = await conexionApi.post('/configuracion/usuarios/eliminarUsuarios', { id: key })
    if (data.code === "ERROR") throw new Error(data.mensaje)
  }
})

// --- Botones personalizados ---
const customButtons = [
  {
    name: 'edit',
    visible: (e) => {
      if (userRol === 1) return true // Superadmin edita todo
      // Los admins no pueden editar a otros admins (rol 1 o 2)
      return e.row.data.id_rol !== 1 && e.row.data.id_rol !== 2
    }
  },
  {
    name: 'delete',
    visible: (e) => {
      if (userRol === 1) return true
      return e.row.data.id_rol !== 1 && e.row.data.id_rol !== 2
    }
  }
]

// --- Impersonation ---
const handleImpersonate = async () => {
  if (!targetUserId.value) return
  impersonating.value = true
  try {
    const { data } = await conexionApi.post('/impersonate', { targetUserId: targetUserId.value })
    if (data.code === 'OK') {
      // Guardar sesión actual si no estamos suplantando ya
      if (!localStorage.getItem('original_token')) {
        localStorage.setItem('original_token', localStorage.getItem('token'))
        localStorage.setItem('original_userId', localStorage.getItem('userId'))
        localStorage.setItem('original_rol', localStorage.getItem('rol'))
        localStorage.setItem('original_userName', localStorage.getItem('userName'))
        localStorage.setItem('original_userLastname', localStorage.getItem('userLastname'))
        localStorage.setItem('original_userIdCompany', localStorage.getItem('userIdCompany'))
      }

      // Iniciar nueva sesión
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('rol', data.rol)
      localStorage.setItem('userName', data.nombre)
      localStorage.setItem('userLastname', data.apellido)
      localStorage.setItem('userIdCompany', data.idCompany)

      showImpersonatePopup.value = false
      window.location.href = '/dashboard'
    } else {
      alert(data.mensaje || 'Error al suplantar')
    }
  } catch (error) {
    console.error('Error suplantación:', error)
  } finally {
    impersonating.value = false
  }
}

const revertImpersonation = () => {
  if (!localStorage.getItem('original_token')) return

  localStorage.setItem('token', localStorage.getItem('original_token'))
  localStorage.setItem('userId', localStorage.getItem('original_userId'))
  localStorage.setItem('rol', localStorage.getItem('original_rol'))
  localStorage.setItem('userName', localStorage.getItem('original_userName'))
  localStorage.setItem('userLastname', localStorage.getItem('original_userLastname'))
  localStorage.setItem('userIdCompany', localStorage.getItem('original_userIdCompany'))

  localStorage.removeItem('original_token')
  localStorage.removeItem('original_userId')
  localStorage.removeItem('original_rol')
  localStorage.removeItem('original_userName')
  localStorage.removeItem('original_userLastname')
  localStorage.removeItem('original_userIdCompany')

  window.location.href = '/dashboard/enviroment/user-creation'
}

</script>
