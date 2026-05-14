<template>
  <div class="page-wrapper p-6 bg-slate-50/50 min-h-screen">
    <!-- HEADER -->
    <div class="mb-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
          <BookOpenIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none">Libro de Campo</h1>
          <p class="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Registro de Aplicaciones</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="userRoleId === 11" @click="openRequirementModal()"
          class="flex items-center gap-2 !px-6 !py-4 !bg-amber-500 !text-white !rounded-full !hover:bg-amber-600 transition-all font-black text-xs shadow-lg shadow-amber-200">
          <ExclamationTriangleIcon class="w-4 h-4" />
          Reportar Requerimiento
        </button>
        <router-link v-if="userRoleId !== 11" to="/dashboard/operations/field-book/config"
          class="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-100">
          <AdjustmentsHorizontalIcon class="w-5 h-5" />
        </router-link>
        <button v-if="userRoleId !== 11" @click="openCreateModal()"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs shadow-lg shadow-blue-200">
          <PlusIcon class="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>
    </div>

    <!-- PREMIUM TABS NAVIGATION -->
    <div
      class="flex items-center gap-4 mb-8 bg-white/40 p-2 rounded-[2rem] border border-white/60 shadow-inner w-fit backdrop-blur-sm">
      <button @click="activeTab = 'plan'" :class="[
        'flex items-center gap-3 !px-8 !py-4 !rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden group !w-auto',
        activeTab === 'plan' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-y-[-2px]' : 'text-slate-400 hover:bg-white/80 hover:text-slate-600'
      ]">
        <div class="relative z-10 flex items-center gap-3">
          <BookOpenIcon
            :class="['w-4 h-4 transition-transform group-hover:scale-110', activeTab === 'plan' ? 'text-blue-100' : 'text-slate-300']" />
          Planificación
        </div>
        <div v-if="activeTab === 'plan'"
          class="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500 opacity-100"></div>
      </button>

      <button @click="activeTab = 'reqs'" :class="[
        'flex items-center gap-3 !px-8 !py-4 !rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden group !w-auto',
        activeTab === 'reqs' ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 translate-y-[-2px]' : 'text-slate-400 hover:bg-white/80 hover:text-slate-600'
      ]">
        <div class="relative z-10 flex items-center gap-3">
          <ExclamationTriangleIcon
            :class="['w-4 h-4 transition-transform group-hover:scale-110', activeTab === 'reqs' ? 'text-amber-100' : 'text-slate-300']" />
          Requerimientos
          <div v-if="requirements.filter(r => r.status === 'PENDING').length > 0"
            class="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-rose-200 animate-pulse">
            {{requirements.filter(r => r.status === 'PENDING').length}}
          </div>
        </div>
        <div v-if="activeTab === 'reqs'"
          class="absolute inset-0 bg-gradient-to-tr from-amber-600 to-amber-400 opacity-100"></div>
      </button>
    </div>
    <!-- ROLE 11 SUMMARY STATS -->
    <div v-if="userRoleId === 11" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div
        class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-orange-50 rounded-2xl text-orange-600">
          <ClockIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Atrasadas</p>
          <h3 class="text-2xl font-black text-rose-600">{{ stats.overdue }}</h3>
        </div>
      </div>

      <div
        class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-blue-50 rounded-2xl text-blue-600">
          <BeakerIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pendientes</p>
          <h3 class="text-2xl font-black text-blue-600">{{ stats.pending }}</h3>
        </div>
      </div>

      <div
        class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-amber-50 rounded-2xl text-amber-600">
          <AdjustmentsHorizontalIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Parciales</p>
          <h3 class="text-2xl font-black text-amber-600">{{ stats.partial }}</h3>
        </div>
      </div>

      <div
        class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div class="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
          <ClipboardDocumentCheckIcon class="w-8 h-8" />
        </div>
        <div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Aplicadas Hoy</p>
          <h3 class="text-2xl font-black text-emerald-600">{{ stats.appliedToday }}</h3>
        </div>
      </div>
    </div>
    <!-- MAIN CONTENT AREA -->
    <div v-if="activeTab === 'plan'" class="space-y-6">
      <!-- FILTERS AND GENERAL TOOLS -->
      <div
        class="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div class="flex flex-1 min-w-[300px] items-center gap-3">
          <div class="flex-1 space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</label>
            <input type="date" v-model="filterFrom"
              class="w-full px-4 py-2.5 bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div class="flex-1 space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</label>
            <input type="date" v-model="filterTo"
              class="w-full px-4 py-2.5 bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>

        <div class="flex items-center gap-2 flex-auto justify-end">
          <button v-if="filterFrom || filterTo" @click="resetFilters"
            class="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl transition-all border border-rose-100 shadow-sm w-fit!"
            title="Limpiar Filtros">
            <XMarkIcon class="w-5 h-5" />
          </button>
          <button v-if="userRoleId !== 11" @click="handleExportGeneralExcel"
            class="flex items-center gap-2 px-6 py-3! bg-emerald-600! text-white! rounded-2xl hover:bg-emerald-700! transition-all! font-black! text-[10px]! uppercase! tracking-widest! shadow-lg! shadow-emerald-200! w-fit!">
            <ArrowDownTrayIcon class="w-4 h-4" />
            Descargar Reporte General
          </button>
        </div>
      </div>

      <!-- MAIN GRID -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
        <LoadingOverlay :show="loading" />
        <DxDataGrid :data-source="filteredOrders" :show-borders="false" :column-auto-width="true" class="premium-grid">
          <DxHeaderFilter :visible="true" />
          <DxFilterRow :visible="false" />
          <DxPaging :page-size="20" />

          <DxColumn data-field="order_number" caption="N° Orden" cell-template="orderNumTemplate" alignment="right"
            css-class="!text-left" />
          <DxColumn data-field="issue_date" caption="Fecha" data-type="date" format="dd/MM/yyyy" alignment="right"
            css-class="!text-left" />
          <DxColumn data-field="ground_name" caption="Campo" alignment="right" css-class="!text-left" />
          <DxColumn data-field="specie_name" caption="Especie" alignment="right" css-class="!text-left" />
          <DxColumn data-field="area_name" caption="Área" alignment="right" css-class="!text-left" />
          <DxColumn data-field="task_name" caption="Tarea" alignment="right" css-class="!text-left" />
          <DxColumn data-field="status" caption="Estado" cell-template="statusTemplate" :width="120" alignment="right"
            css-class="!text-left" />
          <DxColumn caption="" cell-template="actionsTemplate" :width="140" h-alignment="center" alignment="right"
            css-class="!text-left" />

          <template #orderNumTemplate="{ data }">
            <span class="font-black text-blue-600">{{ data.data.order_number }}</span>
          </template>

          <template #statusTemplate="{ data }">
            <span :class="[
              'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
              data.data.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                data.data.status === 'GENERATED' ? 'bg-blue-100 text-blue-600' :
                  data.data.status === 'PARTIAL' ? 'bg-orange-100 text-orange-600' :
                    data.data.status === 'APPLIED' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-emerald-100 text-emerald-600'
            ]">
              {{
                data.data.status === 'PENDING' ? 'Borrador' :
                  data.data.status === 'GENERATED' ? 'Pendiente' :
                    data.data.status === 'PARTIAL' ? 'Parcial' :
                      data.data.status === 'APPLIED' ? 'Aplicada' : 'Cerrada'
              }}
            </span>
          </template>

          <template #actionsTemplate="{ data }">
            <div class="flex items-center gap-1 justify-center">
              <!-- Ver Detalles Siempre -->
              <button @click="openEditModal(data.data, true)"
                class="p-0! text-slate-800! bg-transparent! border-none w-fit!" title="Ver Detalles">
                <EyeIcon class="w-4 h-4" />
              </button>

              <!-- Editar solo si es PENDING y tiene permiso -->
              <button v-if="data.data.status === 'PENDING' && userRoleId !== 11" @click="openEditModal(data.data)"
                class="p-0! text-slate-800! bg-transparent! border-none w-fit!" title="Editar">
                <PencilSquareIcon class="w-4 h-4" />
              </button>

              <!-- Generar Orden (Tech/Admin) -->
              <button
                v-if="data.data.status === 'PENDING' && userRoleId !== 11 && (canChangeResponsible || Number(data.data.responsible_id) === currentUserId)"
                @click="handleFinalize(data.data)" class="p-0! text-slate-800! bg-transparent! border-none  w-fit!"
                title="Generar Orden">
                <CheckBadgeIcon class="w-4 h-4" />
              </button>

              <!-- Aplicar (Solo Applicator Asignado, cuando esta Generada o Parcial) -->
              <button
                v-if="['GENERATED', 'PARTIAL'].includes(data.data.status) && Number(data.data.applicator_id) === currentUserId"
                @click="openConfirmModal(data.data)" class="p-0! text-indigo-600! bg-transparent! border-none w-fit!"
                title="Registrar Aplicación">
                <BeakerIcon class="w-4 h-4" />
              </button>

              <!-- Validar/Cerrar (Tech/Admin/Roles 1-2, cuando esta Aplicada o Parcial si ya no hay mas restos) -->
              <button
                v-if="['APPLIED', 'PARTIAL'].includes(data.data.status) && canChangeResponsible && userRoleId !== 11"
                @click="handleCloseOrder(data.data)" class="p-0! text-emerald-600! bg-transparent! border-none w-fit!"
                title="Validar y Cerrar">
                <ShieldCheckIcon class="w-4 h-4" />
              </button>

              <!-- Descargar Excel (Para cualquier orden generada) -->
              <button v-if="data.data.status !== 'PENDING' && userRoleId !== 11" @click="handleExportExcel(data.data)"
                class="p-0! text-emerald-600! bg-transparent! border-none w-fit!" title="Descargar Orden Excel">
                <ArrowDownTrayIcon class="w-4 h-4" />
              </button>

              <button v-if="(data.data.status === 'PENDING' || canChangeResponsible) && userRoleId !== 11"
                @click="handleDelete(data.data)"
                class="p-0! text-slate-400! hover:text-rose-600! bg-transparent! border-none w-fit!" title="Eliminar">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </template>
        </DxDataGrid>
      </div>
    </div>

    <!-- REQUIREMENTS VIEW -->
    <div v-if="activeTab === 'reqs'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div v-if="requirements.length === 0"
        class="p-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm shadow-slate-200/20">
        <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <InformationCircleIcon class="w-12 h-12 text-slate-200" />
        </div>
        <h3 class="text-2xl font-black text-slate-800 tracking-tight">Todo está en orden</h3>
        <p class="text-slate-400 mt-2 font-medium">No hay requerimientos pendientes en el campo.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="req in requirements" :key="req.id"
          class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden relative">

          <div :class="[
            'absolute top-0 right-0 px-8 py-2.5 rounded-bl-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm z-10',
            req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
              req.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          ]">
            {{ req.status === 'PENDING' ? 'Pendiente' : req.status === 'RESOLVED' ? 'Resuelto' : 'Rechazado' }}
          </div>

          <!-- Priority Indicator Strip -->
          <div :class="[
            'absolute top-0 left-0 w-1.5 h-full opacity-60',
            req.priority === 'HIGH' ? 'bg-rose-500' :
              req.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
          ]"></div>

          <div class="flex items-start justify-between mb-8">
            <div class="flex items-center gap-4">
              <div :class="[
                'p-4 rounded-[1.25rem] shadow-lg shadow-current/10',
                req.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                  req.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              ]">
                <ExclamationTriangleIcon v-if="req.priority === 'HIGH'" class="w-7 h-7" />
                <WrenchIcon v-else-if="req.type === 'MAQUINARIA'" class="w-7 h-7" />
                <BeakerIcon v-else-if="req.type === 'FITOSANITARIO'" class="w-7 h-7" />
                <InformationCircleIcon v-else class="w-7 h-7" />
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">Solicitud
                  Técnica</p>
                <h4 class="text-base font-black text-slate-800 tracking-tight leading-tight">{{ req.type }}</h4>
              </div>
            </div>

            <!-- Action buttons for creator -->
            <div v-if="Number(req.id_creator) === currentUserId && req.status === 'PENDING'" class="flex gap-2 mt-3">
              <button @click="openRequirementModal(req)"
                class="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100/50"
                title="Editar mi requerimiento">
                <PencilSquareIcon class="w-4 h-4" />
              </button>
              <button @click="handleDeleteRequirement(req)"
                class="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100/50"
                title="Eliminar mi requerimiento">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            class="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-5 mb-8 italic text-slate-700 text-sm font-bold border border-slate-100/50 leading-relaxed group-hover:bg-white group-hover:shadow-inner transition-all duration-500">
            "{{ req.description }}"
          </div>

          <div class="grid grid-cols-2 gap-6 mb-8">
            <div class="flex flex-col gap-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Informante</span>
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black">
                  {{req.creator_name.split(' ').map(n => n[0]).join('')}}
                </div>
                <span class="text-[11px] font-black text-slate-700">{{ req.creator_name }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Fecha y Hora</span>
              <span class="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <ClockIcon class="w-3.5 h-3.5 text-slate-300" />
                {{ new Date(req.created_at).toLocaleDateString() }} <span
                  class="text-slate-300 ml-1">{{ new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </span>
            </div>
            <div v-if="req.ground_name" class="col-span-full flex flex-col gap-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Localización en
                Campo</span>
              <div class="flex items-center gap-2 px-3 py-2 bg-rose-50/30 rounded-xl w-fit border border-rose-100/30">
                <MapPinIcon class="w-4 h-4 text-rose-500" />
                <span class="text-[11px] font-black text-slate-800">
                  {{ req.ground_name }} <span v-if="req.sector_name" class="text-rose-300 mx-1">/</span> <span
                    v-if="req.sector_name" class="text-slate-600">{{ req.sector_name }}</span>
                </span>
              </div>
            </div>
          </div>

          <div v-if="req.status === 'PENDING' && userRoleId !== 11" class="pt-8 border-t border-slate-50 flex gap-3">
            <button @click="updateReqStatus(req, 'RESOLVED')"
              class="!flex-1 !py-4 !bg-emerald-600 !text-white !rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-200">
              Marcar Resuelto
            </button>
            <button @click="updateReqStatus(req, 'REJECTED')"
              class="!flex-1 px-6 !py-4 !bg-slate-900 !text-slate-400 !rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-rose-50 hover:text-rose-600 transition-all">
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE/VIEW/EDIT MODAL -->
    <DxPopup v-model:visible="showCreateModal" :width="isReadOnly ? 900 : 800" :height="'90vh'" :show-title="false"
      class="premium-popup">
      <div class="flex flex-col h-full bg-slate-50 overflow-hidden">

        <!-- HEADER -->
        <div class="p-6 bg-white border-b border-slate-100 flex items-center justify-between z-10 shrink-0 shadow-sm">
          <div class="flex items-center gap-3">
            <div :class="[
              'p-3 rounded-2xl shadow-sm',
              isReadOnly ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            ]">
              <component :is="isReadOnly ? EyeIcon : PencilSquareIcon" class="w-6 h-6 border-none" />
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-800 leading-none">
                {{ isReadOnly ? ('Orden ' + form.order_number) : (isEditing ? 'Editar Borrador' : 'Nueva Orden') }}
              </h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {{ isReadOnly ? 'Vista Completa de la Aplicación' : 'Planificación Técnica de Labor' }}
              </p>
            </div>
          </div>
          <button @click="showCreateModal = false"
            class="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all w-fit!">
            <XMarkIcon class="w-6 h-6 border-none" />
          </button>
        </div>

        <!-- MODERN VIEW (READ ONLY) -->
        <div v-if="isReadOnly" class="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Info Primaria -->
            <div class="col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
              <div class="flex items-center justify-between border-b border-slate-50 pb-6">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Información
                    Principal</span>
                  <p class="text-xs font-bold text-slate-400">Detalles técnicos de la programación</p>
                </div>
                <span :class="[
                  'px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border transition-all',
                  form.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20' :
                    form.status === 'GENERATED' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/20' :
                      form.status === 'PARTIAL' ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/20' :
                        form.status === 'APPLIED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20'
                ]">
                  {{
                    form.status === 'PENDING' ? 'Borrador' :
                      form.status === 'GENERATED' ? 'Pendiente' :
                        form.status === 'PARTIAL' ? 'Parcial' :
                          form.status === 'APPLIED' ? 'Aplicada' : 'Cerrada'
                  }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-y-8">
                <div>
                  <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">Campo /
                    Predio</p>
                  <p class="text-sm font-black text-slate-700">{{ form.ground_name || 'No especificado' }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">Fecha
                    Labor
                  </p>
                  <p class="text-sm font-black text-slate-700">{{ formatDate(form.issue_date) }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">Labor
                    Asignada</p>
                  <p class="text-sm font-black text-slate-700">{{ form.area_name }} / {{ form.task_name }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">Especie /
                    Variedad</p>
                  <p class="text-sm font-black text-slate-700">{{ form.specie_name }} ({{ form.variety_name || 'N/A' }})
                  </p>
                </div>
                <div class="col-span-full grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div class="bg-blue-600/5 p-5 rounded-[1rem] border border-blue-100/50">
                    <p
                      class="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 leading-none flex items-center gap-2">
                      <InformationCircleIcon class="w-3 h-3" /> Instrucciones / Observaciones
                    </p>
                    <p class="text-sm font-bold text-slate-700 leading-relaxed italic">
                      "{{ form.observations || 'Sin instrucciones adicionales' }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Card -->
            <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
              <div class="border-b border-slate-50 pb-6 mb-6 flex flex-col">
                <span
                  class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 leading-none">Equipos</span>
                <p class="text-xs font-bold text-slate-400">Responsables asignados</p>
              </div>
              <div class="space-y-4 flex-1">
                <div
                  class="group relative p-5 bg-slate-50/50 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden">
                  <div class="absolute -right-2 -bottom-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                    <UserIcon class="w-16 h-16 text-slate-900" />
                  </div>
                  <div class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">
                    Responsable
                    Técnico</div>
                  <div class="text-sm font-black text-slate-800 leading-none">{{ form.responsible_name }}
                    {{ form.responsible_lastname }}
                  </div>
                </div>
                <div
                  class="group relative p-5 bg-blue-50/30 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
                  <div class="absolute -right-2 -bottom-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                    <BeakerIcon class="w-16 h-16 text-blue-900" />
                  </div>
                  <div class="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none mb-2">
                    Aplicador /
                    Operador</div>
                  <div class="text-sm font-black text-slate-800 leading-none">{{ form.applicator_name }}
                    {{ form.applicator_lastname || '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Table Card -->
            <div class="col-span-full bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-50 pb-4">
                <div class="flex items-center gap-2 font-black">
                  <BeakerIcon class="w-4 h-4 text-indigo-500" />
                  <span class="text-xs text-slate-400 uppercase tracking-widest leading-none">Listado de Insumos</span>
                </div>
                <span v-if="!form.products || form.products.length === 0"
                  class="text-[9px] font-black text-amber-500 uppercase">Sin Insumos (Solo Instrucciones)</span>
              </div>
              <div v-if="form.products && form.products.length > 0"
                class="overflow-x-auto border border-slate-50 rounded-2xl">
                <table class="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr class="bg-slate-50/50">
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Grupo / Subgrupo</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Insumo / Ingrediente</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Plan (Dosis/Unidad)</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Aguas 100/L</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Reingreso</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Carencia (E/A)</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Intervalo / Nº App</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Mezcla</th>
                      <th class="p-4 text-[9px] font-black text-amber-500 uppercase tracking-widest text-center italic bg-amber-50/30">Est. Fenológico</th>
                      <th class="p-4 text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center">Restante</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Justificación</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr v-for="(p, i) in form.products" :key="i" class="hover:bg-slate-50/30 transition-all group">
                      <td class="p-5">
                        <div class="flex flex-col gap-1">
                          <span class="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{{ getCategoryName(p.id_category) }}</span>
                          <span class="text-[9px] font-bold text-slate-400 uppercase">{{ getSubcategoryName(p.id_subcategory) }}</span>
                        </div>
                      </td>
                      <td class="p-5">
                        <p class="text-sm font-black text-slate-700 leading-none mb-1.5 group-hover:text-blue-600 transition-colors">
                          {{ p.brand_name || 'MATERIAL NO ESPECIFICADO' }}
                        </p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-tight">
                          <span class="text-blue-500/50 mr-1 font-black">INGR:</span> {{ p.active_ingredient || 'NO ESPECIFICADO' }}
                        </p>
                      </td>
                      <td class="p-5 text-center">
                        <div class="flex flex-col items-center gap-1">
                          <span class="inline-flex items-center px-4 py-1.5 bg-blue-600/5 text-blue-600 rounded-xl text-[13px] font-black shadow-sm shadow-blue-100/20">
                            {{ p.dosage }}
                          </span>
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ p.dosage_unit || 'L/HA' }}</span>
                        </div>
                      </td>
                      <td class="p-5 text-center text-xs font-bold text-slate-500">{{ p.water_volume || '-' }}</td>
                      <td class="p-5 text-center">
                        <span v-if="p.reentry_period"
                          class="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black border border-amber-100 shadow-sm shadow-amber-100/20">
                          {{ p.reentry_period }} Hrs
                        </span>
                        <span v-else class="text-slate-300">-</span>
                      </td>
                      <td class="p-5 text-center text-[10px] font-black text-rose-500 bg-rose-50/30">
                        {{ p.withholding_label || '-' }} <span class="text-slate-300 mx-1">|</span>
                        {{ p.withholding_asoex || '-' }}
                      </td>
                      <td class="p-5 text-center">
                        <div class="flex flex-col items-center gap-1">
                          <span class="text-xs font-bold text-slate-500">{{ p.app_interval || '-' }}</span>
                          <span class="text-[9px] font-black text-slate-400 uppercase">App: {{ p.season_app_number || '-' }}</span>
                        </div>
                      </td>
                      <td class="p-5 text-center">
                        <span
                          :class="['text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-sm transition-all', p.is_mix ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-indigo-100/20' : 'bg-slate-50 text-slate-400 border border-slate-100']">
                          {{ p.is_mix ? 'SÍ' : 'NO' }}
                        </span>
                      </td>
                      <td class="p-5 text-center">
                        <span v-if="p.phenological_stage"
                          class="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black border border-amber-100 italic">
                          {{ p.phenological_stage }}
                        </span>
                        <span v-else class="text-slate-300">-</span>
                      </td>
                      <td class="p-5 text-center">
                        <span
                          class="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black border border-emerald-100 shadow-sm shadow-emerald-100/20">
                          {{ (parseFloat(p.dosage) - parseFloat(p.applied_quantity || 0)).toFixed(2) }}
                        </span>
                      </td>
                      <td class="p-5 max-w-[200px]">
                         <div v-if="p.justification" class="bg-blue-50/30 p-2.5 rounded-xl border border-blue-100/20">
                             <p class="text-[10px] text-blue-700 font-medium leading-tight line-clamp-3 group-hover:line-clamp-none transition-all">
                               {{ p.justification }}
                             </p>
                          </div>
                          <span v-else class="text-slate-300 text-[10px] font-bold italic ml-2">Sin justificación</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Quarters Card -->
            <div class="col-span-full bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
              <div class="flex items-center gap-2 border-b border-slate-50 pb-4">
                <MapPinIcon class="w-4 h-4 text-rose-500" />
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Ubicaciones
                  Asignadas</span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                <div v-for="(q, i) in form.quartersDetail" :key="i"
                  class="group relative overflow-hidden p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                  <!-- Decorative background element -->
                  <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <MapPinIcon class="w-24 h-24 text-slate-900" />
                  </div>

                  <div class="flex items-start justify-between mb-3 relative z-10">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sector
                        /
                        Cuartel</span>
                    </div>
                    <div
                      class="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      {{ q.surface }} Ha
                    </div>
                  </div>

                  <div class="relative z-10">
                    <h4
                      class="text-base font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                      {{ q.quarter_number }}
                    </h4>
                    <div class="flex items-center gap-1.5 mt-2">
                      <div class="p-1 bg-amber-50 text-amber-600 rounded-md">
                        <TagIcon class="w-3 h-3" />
                      </div>
                      <span class="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">
                        {{allVarieties.find(v => Number(v.id) === Number(q.id_variety))?.name || 'V. Genérica'}}
                      </span>
                    </div>
                  </div>

                  <!-- Bottom accent line -->
                  <div
                    class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  </div>
                </div>
              </div>
            </div>

            <!-- Safety Footer -->
            <div class="col-span-full bg-slate-900 rounded-[2.5rem] p-8 space-y-4 text-white">
              <div class="flex items-center gap-2 opacity-50 border-b border-slate-800 pb-4">
                <ShieldCheckIcon class="w-5 h-5 text-amber-500" />
                <span class="text-[10px] font-black uppercase tracking-widest">EPP y Maquinaria</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                    <WrenchIcon class="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-500 uppercase mb-0.5 leading-none">Maquinaria</p>
                    <p class="text-xs font-bold text-slate-100">{{ form.machinery || 'Estándar' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                    <IdentificationIcon class="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-500 uppercase mb-0.5 leading-none">Garantía / EPP</p>
                    <p class="text-xs font-bold text-slate-100 italic">
                      "{{ form.ppe_required || 'Uso obligatorio de EPP básico' }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM VIEW (CREATE/EDIT) -->
        <div v-else class="flex-1 overflow-y-auto p-8 space-y-8 bg-white scrollbar-hide">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div class="col-span-full border-b border-slate-50 pb-2 flex items-center gap-2 font-black">
              <span class="text-[10px] text-blue-600 uppercase tracking-[0.2em] leading-none">1. Ubicación y
                Fecha</span>
              <div class="flex-1 h-[1px] bg-slate-50"></div>
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Predio / Campo</label>
              <DxSelectBox v-model:value="form.id_ground" :data-source="grounds" display-expr="name" value-expr="id"
                class="premium-select shadow-sm" />
            </div>
            <div v-if="filteredQuarters.length > 0" class="col-span-2 space-y-1">
              <label
                class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center justify-between">
                <span>Cuarteles Destino</span>
                <span
                  class="text-[7px] text-indigo-400 normal-case font-bold bg-indigo-50 px-1.5 py-0.5 rounded-full">Sectores
                  Validados</span>
              </label>
              <DxTagBox v-model:value="form.quarters" :data-source="filteredQuarters" display-expr="name"
                value-expr="id" class="premium-select shadow-sm" placeholder="Seleccionar..." />
              <p class="text-[8px] text-slate-400 font-medium italic mt-1 ml-1">
                * Mostrando solo cuarteles con atributos de sector definidos.
              </p>
            </div>
            <div v-else-if="form.id_ground"
              class="col-span-2 flex items-center bg-amber-50/50 p-3 rounded-2xl border border-amber-100 border-dashed">
              <p class="text-[9px] text-amber-600 font-black leading-tight uppercase tracking-wider">
                Sin sectores validados en este predio.<br />
                <span class="text-[7px] font-bold text-slate-400">Verifica los atributos de sector.</span>
              </p>
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Superficie Total
                (Ha)</label>
              <div
                class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                <MapPinIcon class="w-4 h-4" />
                <span class="text-base font-black tracking-tight">{{ totalSurface.toFixed(2) }} Ha</span>
              </div>
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Fecha
                Programación</label>
              <input type="date" v-model="form.issue_date"
                class="w-full px-4 py-[11px] bg-slate-50 rounded-xl font-bold text-sm border border-transparent outline-none focus:ring-1 focus:ring-blue-100 shadow-sm transition-all" />
            </div>

            <div class="col-span-full border-b border-slate-50 pb-2 mt-4 flex items-center gap-2 font-black">
              <span class="text-[10px] text-blue-600 uppercase tracking-[0.2em] leading-none">2. Responsabilidad
                Técnica</span>
              <div class="flex-1 h-[1px] bg-slate-50"></div>
            </div>
            <div class="col-span-3 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Res. Técnico</label>
              <DxSelectBox v-model:value="form.responsible_id" :data-source="users" :display-expr="displayFullName"
                value-expr="id" :disabled="!canChangeResponsible" class="premium-select shadow-sm"
                :class="{ 'opacity-50 grayscale': !canChangeResponsible }" :search-enabled="true" />
            </div>
            <div class="col-span-3 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Aplicador /
                Operador</label>
              <DxSelectBox v-model:value="form.applicator_id" :data-source="users" :display-expr="displayFullName"
                value-expr="id" class="premium-select shadow-sm" :search-enabled="true" />
            </div>

            <div class="col-span-full border-b border-slate-50 pb-2 mt-4 flex items-center gap-2 font-black">
              <span class="text-[10px] text-blue-600 uppercase tracking-[0.2em] leading-none">3. Configuración de
                Labor</span>
              <div class="flex-1 h-[1px] bg-slate-50"></div>
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Área Operativa</label>
              <DxSelectBox v-model:value="form.id_area" :data-source="configAreas" display-expr="name" value-expr="id"
                class="premium-select shadow-sm" />
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Labor
                Específica</label>
              <DxSelectBox v-model:value="form.id_task" :data-source="configTasks" display-expr="name" value-expr="id"
                class="premium-select shadow-sm" :disabled="!form.id_area" />
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Especie</label>
              <DxSelectBox v-model:value="form.id_specie" :data-source="species" display-expr="name" value-expr="id"
                class="premium-select shadow-sm" placeholder="Opcional..." />
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Variedad</label>
              <DxSelectBox v-model:value="form.id_variety" :data-source="filteredVarieties" display-expr="name"
                value-expr="id" class="premium-select shadow-sm" placeholder="Opcional..."
                :disabled="!form.id_specie" />
            </div>
            <div class="col-span-full space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Instrucciones Generales
                (Opcional)</label>
              <textarea v-model="form.observations"
                placeholder="Escribe aquí las instrucciones para el aplicador o detalles de la labor..."
                class="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none focus:ring-1 focus:ring-blue-100 min-h-[80px]"></textarea>
            </div>

            <div class="col-span-full border-b border-slate-50 pb-2 mt-4 flex items-center justify-between font-black">
              <span class="text-[10px] text-blue-600 uppercase tracking-[0.2em] leading-none">4. Receta e Insumos</span>
              <button @click="addProduct"
                class="text-[9px] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl uppercase tracking-widest hover:bg-blue-100 transition-all w-fit!">+
                Añadir</button>
            </div>

            <div v-for="product in form.products" :key="product._uId"
              class="col-span-full relative flex flex-col gap-6 bg-slate-50/40 p-8 pt-12 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group/product mb-6">

              <!-- Trash button -->
              <button @click="removeProductByUid(product._uId)"
                class="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-100/50 rounded-2xl transition-all border-none w-fit! group-hover/product:text-slate-400">
                <TrashIcon class="w-5 h-5" />
              </button>

              <!-- ROW 1: CATEGORIZATION -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Grupo de materiales
                  </label>
                  <DxSelectBox v-model:value="product.id_category" :data-source="categories" display-expr="name"
                    value-expr="id" :search-enabled="true" class="premium-select shadow-sm bg-white"
                    placeholder="Seleccionar grupo..." @on-value-changed="() => onCategoryChange(product)" />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Subgrupo de materiales
                  </label>
                  <DxSelectBox v-model:value="product.id_subcategory" :data-source="getFilteredSubcategories(product)"
                    display-expr="name" value-expr="id" :search-enabled="true" class="premium-select shadow-sm bg-white"
                    placeholder="Seleccionar subgrupo..." :disabled="!product.id_category"
                    @on-value-changed="() => product.id_product = null" />
                </div>
              </div>

              <!-- ROW 2: PRODUCT & PHENO -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 space-y-1.5">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre
                    material</label>
                  <DxSelectBox v-model:value="product.id_product" :data-source="getFilteredProducts(product)"
                    display-expr="name" value-expr="id" :search-enabled="true"
                    :search-expr="['name', 'active_ingredient']"
                    @on-value-changed="(e) => onProductNameChange(e, product)" class="premium-select shadow-sm bg-white"
                    item-template="productItem" placeholder="Buscar material o ingrediente activo...">
                    <template #productItem="{ data }">
                      <div class="flex flex-col py-1">
                        <span class="font-bold text-slate-900 text-xs">{{ data.name }}</span>
                        <span
                          class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{{ data.active_ingredient || 'Sin Ing. Activo' }}</span>
                      </div>
                    </template>
                  </DxSelectBox>
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Est. Fenológico
                  </label>
                  <DxSelectBox v-model:value="product.phenological_stage" :data-source="phenoStatesList"
                    display-expr="name" value-expr="name" class="premium-select shadow-sm bg-white"
                    placeholder="Seleccionar..." />
                </div>
              </div>

              <!-- ROW 3: CALCULATIONS (TWO LEVELS) -->
              <div
                class="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                <!-- Top Level: Inputs -->
                <div class="flex flex-wrap md:flex-nowrap items-end gap-4">
                  <div class="flex-1 min-w-[100px] space-y-2">
                    <label
                      class="text-[8px] font-black text-slate-400 uppercase tracking-tight text-center block h-4">Dosis
                      100l</label>
                    <input v-model="product.dosage_100l" type="number" step="0.01" placeholder="0.00"
                      class="w-full h-[44px]! px-3 bg-slate-50/50 rounded-xl font-bold text-xs border border-slate-100 outline-none focus:ring-2! focus:ring-blue-100! focus:bg-white! transition-all text-center !mb-0" />
                  </div>
                  <div class="flex-1 min-w-[100px] space-y-2">
                    <label
                      class="text-[8px] font-black text-slate-400 uppercase tracking-tight text-center block h-4">Mojamiento
                      (l)</label>
                    <input v-model="product.water_volume" type="number" step="1" placeholder="0"
                      class="w-full h-[44px]! px-3 bg-slate-50/50 rounded-xl font-bold text-xs border border-slate-100 outline-none focus:ring-2! focus:ring-blue-100! focus:bg-white! transition-all text-center !mb-0" />
                  </div>
                  <div class="flex-1 min-w-[100px] space-y-2">
                    <label
                      class="text-[8px] font-black text-blue-600 uppercase tracking-tight text-center block leading-tight h-4">Dosis
                      x ha <span class="bg-blue-50 px-1 rounded ml-1">(A)</span></label>
                    <input v-model="product.dosage" type="number" step="0.01" @input="updateProductQuantity(product)"
                      placeholder="0.00"
                      class="w-full h-[44px]! px-3 bg-blue-50/30 rounded-xl font-black text-xs border border-blue-100 outline-none focus:ring-2! focus:ring-blue-200! focus:bg-white! transition-all text-center text-blue-700 !mb-0" />
                  </div>
                  <div class="w-[100px] shrink-0">
                    <DxSelectBox v-model:value="product.dosage_unit" :items="['L/HA', 'KG/HA']"
                      class="premium-select-compact !h-[44px] shadow-sm" />
                  </div>
                </div>

                <!-- Bottom Level: Results -->
                <div class="flex flex-wrap md:flex-nowrap items-end gap-4 pt-4 border-t border-slate-50 border-dashed">
                  <div class="w-[140px] shrink-0 space-y-2">
                    <label
                      class="text-[8px] font-black text-slate-400 uppercase tracking-tight text-center block leading-tight h-4">Superficie
                      <span class="bg-slate-100 px-1 rounded ml-1 text-slate-500">(B)</span></label>
                    <div
                      class="w-full h-[44px]! flex items-center justify-center bg-slate-50 rounded-xl font-black text-sm text-slate-600 border border-slate-100 shadow-inner">
                      {{ totalSurface }} <span class="text-[8px] ml-1 opacity-50">HA</span>
                    </div>
                  </div>
                  <div class="flex-1 space-y-2">
                    <label
                      class="text-[8px] font-black text-emerald-600 uppercase tracking-tight text-center block leading-tight h-4">Cantidad
                      total requerida <span
                        class="bg-emerald-50 px-1 rounded ml-1 text-emerald-600">(AxB)</span></label>
                    <div
                      class="w-full h-[44px]! flex items-center justify-center bg-emerald-50/50 rounded-xl font-black text-sm text-emerald-700 border border-emerald-100 shadow-inner">
                      {{ (parseFloat(product.dosage || 0) * totalSurface).toFixed(2) }}
                      <span
                        class="text-[9px] ml-2 text-emerald-500 uppercase">{{ product.dosage_unit === 'KG/HA' ? 'KG' : 'L' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ROW 4: SAFETY & MIX -->
              <div
                class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/40 p-4 rounded-3xl border border-slate-50 items-end">
                <div class="space-y-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block h-4">Reingreso
                    (Hrs)</label>
                  <input v-model="product.reentry_period" type="number" placeholder="--"
                    class="w-full h-[44px]! px-4 bg-white rounded-xl font-bold text-xs border border-slate-100 outline-none focus:ring-1! focus:ring-blue-100! transition-all shadow-sm !mb-0" />
                </div>
                <div class="space-y-2">
                  <label
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block h-4">Carencia
                    (Etiq | Asoex)</label>
                  <div class="flex gap-2">
                    <input v-model="product.withholding_label" placeholder="Etiq"
                      class="w-1/2 h-[44px]! px-3 bg-white rounded-xl font-bold text-xs border border-slate-100 outline-none text-center shadow-sm !mb-0" />
                    <input v-model="product.withholding_asoex" placeholder="Asoex"
                      class="w-1/2 h-[44px]! px-3 bg-white rounded-xl font-bold text-xs border border-slate-100 outline-none text-center shadow-sm !mb-0" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block h-4">Intervalo
                    / N° App</label>
                  <div class="flex gap-2">
                    <input v-model="product.app_interval" placeholder="Int"
                      class="w-1/2 h-[44px]! px-3 bg-white rounded-xl font-bold text-xs border border-slate-100 outline-none text-center shadow-sm!mb-0 !mb-0" />
                    <input v-model="product.season_app_number" placeholder="N°"
                      class="w-1/2 h-[44px]! px-3 bg-white rounded-xl font-bold text-xs border border-slate-100 outline-none text-center shadow-sm !mb-0" />
                  </div>
                </div>
                <div class="flex flex-col items-center justify-center pb-1">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block h-4">¿Es
                    mezcla?</label>
                  <button @click="product.is_mix = !product.is_mix" type="button"
                    :style="{ width: '44px !important', minWidth: '44px !important', height: '24px !important' }"
                    :class="[
                      'relative inline-flex shrink-0 cursor-pointer !rounded-full border-none p-0 transition-colors duration-200 ease-in-out focus:outline-none ring-0 !p-0',
                      product.is_mix ? 'bg-blue-600' : 'bg-slate-200'
                    ]">
                    <span :class="[
                      'pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-[2px] ml-[2px]',
                      product.is_mix ? 'translate-x-[20px]' : 'translate-x-0'
                    ]"></span>
                  </button>
                </div>
              </div>

              <!-- ROW 5: JUSTIFICATION -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Justificación
                  técnica de
                  la aplicación</label>
                <textarea v-model="product.justification"
                  placeholder="Describa el motivo fitosanitario o nutricional de este insumo..."
                  class="w-full px-5 py-4 bg-white rounded-[1.5rem] font-medium text-xs border border-slate-100 outline-none focus:ring-2 focus:ring-blue-50/50 focus:border-blue-100 transition-all min-h-[80px] resize-none shadow-sm"></textarea>
              </div>

              <!-- BODEGA Y RESERVA (FOOTER) -->
              <div v-if="product.id_product"
                class="mt-2 p-6 bg-blue-600/5 rounded-[2rem] border border-blue-600/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="col-span-1 space-y-1.5">
                  <label class="text-[9px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <MapPinIcon class="w-3 h-3" /> Bodega Origen
                  </label>
                  <DxSelectBox v-model:value="product.id_warehouse" :data-source="warehouses" value-expr="id"
                    display-expr="name" :search-enabled="true" class="premium-select-small shadow-sm bg-white"
                    placeholder="Elegir bodega..." @on-value-changed="(e) => onWarehouseChange(e, product)" />
                </div>
                <div
                  class="col-span-2 flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm">
                  <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-100/50 rounded-xl text-blue-600">
                      <ShieldCheckIcon class="w-5 h-5" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest">Reserva de
                        Stock</span>
                      <p class="text-[8px] text-slate-400 font-bold mt-0.5 uppercase">Bloquea unidades para esta labor
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <div v-if="product.id_warehouse" class="px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100">
                      <span class="text-[9px] font-black text-blue-700 uppercase flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        Disp: {{ getSelectedWarehouseStock(product) }}
                      </span>
                    </div>
                    <button @click="product.reserve_stock = !product.reserve_stock" type="button" :class="[
                      'relative inline-flex h-[26px] w-[48px] cursor-pointer rounded-full border-none p-0 transition-colors duration-200 ease-in-out focus:outline-none',
                      product.reserve_stock ? 'bg-emerald-500' : 'bg-slate-200'
                    ]">
                      <span :class="[
                        'pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out mt-[2px] ml-[2px]',
                        product.reserve_stock ? 'translate-x-[22px]' : 'translate-x-0'
                      ]"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-span-full border-b border-slate-50 pb-2 mt-4 flex items-center gap-2 font-black">
              <span class="text-[10px] text-blue-600 uppercase tracking-[0.2em] leading-none">5. Seguridad
                Aplicador</span>
              <div class="flex-1 h-[1px] bg-slate-50"></div>
            </div>
            <div class="col-span-3 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Maquinaria</label>
              <input v-model="form.machinery"
                class="w-full px-4 py-[11px] bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none focus:ring-1 focus:ring-blue-100" />
            </div>
            <div class="col-span-3 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">EPP</label>
              <input v-model="form.ppe_required"
                class="w-full px-4 py-[11px] bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none focus:ring-1 focus:ring-blue-100" />
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div
          class="p-6 border-t border-slate-50 bg-white flex items-center justify-end gap-3 rounded-b-[2rem] shrink-0 z-10">
          <button @click="showCreateModal = false"
            class="px-8 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
            {{ isReadOnly ? 'Cerrar Vista' : 'Cerrar' }}
          </button>
          <button v-if="!isReadOnly" @click="handleSaveOrder"
            class="px-10 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:translate-y-[-2px] hover:shadow-2xl transition-all">
            {{ isEditing ? 'Guardar Cambios' : 'Lanzar Orden' }}
          </button>
        </div>
      </div>
    </DxPopup>

    <!-- APPLICATION CONFIRMATION MODAL (For Applicator) -->
    <DxPopup v-model:visible="showConfirmModal" :width="500" :height="'auto'" :show-title="false" class="premium-popup">
      <div class="p-8 bg-white rounded-3xl">
        <div class="flex items-center gap-4 mb-8">
          <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <BeakerIcon class="w-8 h-8" />
          </div>
          <div>
            <h3 class="text-xl font-black text-slate-800 leading-none">Confirmar Aplicación</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Orden: {{ selectedOrderConfirm?.order_number }}
            </p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Real</label>
              <input type="date" v-model="confirmForm.application_date"
                class="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Horario (Ini -
                Fin)</label>
              <div class="flex items-center gap-2">
                <input type="time" v-model="confirmForm.start_time"
                  class="w-full px-2 py-3 bg-slate-50 rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
                <input type="time" v-model="confirmForm.end_time"
                  class="w-full px-2 py-3 bg-slate-50 rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
              Cantidades Aplicadas</p>
            <div v-for="prod in confirmForm.products" :key="prod.id"
              class="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-black text-slate-700">{{ prod.brand_name }}</span>
                <span class="text-[10px] font-bold text-slate-400">Total Plan: {{ prod.dosage }} L-Kg/Ha</span>
              </div>
              <div class="flex items-center gap-4 mb-3">
                <div class="flex-1 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-center">
                  <p class="text-[8px] font-black uppercase tracking-widest">Ya Aplicado</p>
                  <p class="text-xs font-black">{{ prod.applied_quantity_accum || 0 }} L-Kg</p>
                </div>
                <div class="flex-1 p-2 bg-rose-50 text-rose-600 rounded-lg text-center">
                  <p class="text-[8px] font-black uppercase tracking-widest">Restante</p>
                  <p class="text-xs font-black">
                    {{ (parseFloat(prod.dosage) - parseFloat(prod.applied_quantity_accum || 0)).toFixed(2) }} L-Kg
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="prod.applied_quantity" type="number" step="0.01"
                  :max="parseFloat(prod.dosage) - parseFloat(prod.applied_quantity_accum || 0)"
                  placeholder="Cantidad a aplicar ahora..."
                  class="flex-1 px-4 py-2 bg-white rounded-lg font-bold text-sm border-none shadow-sm outline-none focus:ring-1 focus:ring-indigo-100" />
                <span class="text-[11px] font-black text-slate-400 uppercase">L-Kg</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-slate-50">
          <button @click="showConfirmModal = false"
            class="px-6 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancelar</button>
          <button @click="handleConfirmApplication"
            class="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:translate-y-[-2px] transition-all">
            Finalizar Aplicación
          </button>
        </div>
      </div>
    </DxPopup>

    <!-- PRINTABLE ORDER TEMPLATE (Excel Style) -->
    <div id="printable-area" class="hidden print:block p-8 bg-white text-slate-800 font-sans" v-if="orderToPrint">
      <!-- Header Table -->
      <div class="border-2 border-slate-900 mb-6">
        <div class="flex items-center">
          <div class="w-1/4 p-4 border-r-2 border-slate-900 bg-slate-50 flex items-center justify-center">
            <h2 class="text-xs font-black uppercase text-indigo-800">Huertos Diguillín</h2>
          </div>
          <div class="w-1/2 p-4 border-r-2 border-slate-900 text-center">
            <h1 class="text-sm font-black uppercase tracking-widest">Orden de Aplicación Productos Fitosanitarios</h1>
            <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase">Agrisoft v1.0 - Gestión de Campo</p>
          </div>
          <div class="w-1/4">
            <div class="p-2 border-b-2 border-slate-900 text-[9px] font-black uppercase flex justify-between">
              <span>Ref:</span> <span>ORD-2026-00</span>
            </div>
            <div class="p-2 border-b-2 border-slate-900 text-[9px] font-black uppercase flex justify-between">
              <span>Fecha:</span> <span>{{ formatDate(orderToPrint.issue_date) }}</span>
            </div>
            <div class="p-2 text-[10px] font-black uppercase flex justify-between bg-slate-900 text-white">
              <span>N° Orden:</span> <span class="text-lg leading-none">{{ orderToPrint.order_number }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Info Table -->
      <div class="grid grid-cols-2 gap-0 border-2 border-slate-900 mb-6 text-[10px]">
        <div class="border-r-2 border-slate-900">
          <div class="flex border-b-2 border-slate-900">
            <div class="w-1/3 p-2 bg-slate-50 font-black uppercase border-r-2 border-slate-900">Fecha Emisión</div>
            <div class="w-2/3 p-2">{{ formatDate(orderToPrint.issue_date) }}</div>
          </div>
          <div class="flex border-b-2 border-slate-900">
            <div class="w-1/3 p-2 bg-slate-50 font-black uppercase border-r-2 border-slate-900">Campo / Predio</div>
            <div class="w-2/3 p-2 font-bold">{{ orderToPrint.ground_name }}</div>
          </div>
          <div class="flex">
            <div class="w-1/3 p-2 bg-slate-50 font-black uppercase border-r-2 border-slate-900">Maquinaria</div>
            <div class="w-2/3 p-2 italic">{{ orderToPrint.machinery || 'N/A' }}</div>
          </div>
        </div>
        <div>
          <div class="flex border-b-2 border-slate-900">
            <div class="w-1/3 p-2 bg-slate-50 font-black uppercase border-r-2 border-slate-900">Res. Técnico</div>
            <div class="w-2/3 p-2 font-black uppercase underline">{{ orderToPrint.responsible_name }}
              {{ orderToPrint.responsible_lastname }}
            </div>
          </div>
          <div class="flex border-b-2 border-slate-900">
            <div class="w-1/3 p-2 bg-slate-50 font-black uppercase border-r-2 border-slate-900">Aplicador</div>
            <div class="w-2/3 p-2 font-black uppercase">{{ orderToPrint.applicator_name }}
              {{ orderToPrint.applicator_lastname }}
            </div>
          </div>
          <div class="flex">
            <div class="w-1/3 p-2 bg-slate-50 font-black uppercase border-r-2 border-slate-900">Especie/Var</div>
            <div class="w-2/3 p-2">{{ orderToPrint.specie_name }} ({{ orderToPrint.variety_name }})</div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="mb-6">
        <h4 class="text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white p-1 inline-block mb-1">I.
          Cuadro
          Indicaciones Aplicación (Productos)</h4>
        <div class="border-2 border-slate-900 overflow-hidden">
          <table class="w-full text-center border-collapse text-[9px]">
            <thead>
              <tr class="bg-slate-50 border-b-2 border-slate-900">
                <th class="p-2 border-r-2 border-slate-900 text-left">Nombre Comercial / Insumo</th>
                <th class="p-2 border-r-2 border-slate-900">Ing. Activo / Composición</th>
                <th class="p-2 border-r-2 border-slate-900">Objetivo / Justificación</th>
                <th class="p-2 border-r-2 border-slate-900">Dosis (L-Kg/Ha)</th>
                <th class="p-2 border-r-2 border-slate-900">Aguas 100/L</th>
                <th class="p-2">Mix</th>
              </tr>
            </thead>
            <tbody class="divide-y-2 divide-slate-800">
              <tr v-for="p in orderToPrint.productsData" :key="p.id">
                <td class="p-2 border-r-2 border-slate-800 font-black text-left">{{ p.brand_name }}</td>
                <td class="p-2 border-r-2 border-slate-800 italic">{{ p.active_ingredient || '-' }}
                  ({{ p.composition || '-' }})</td>
                <td class="p-2 border-r-2 border-slate-800">{{ p.objective || '-' }} / {{ p.justification || '-' }}</td>
                <td class="p-2 border-r-2 border-slate-800 font-black text-blue-800">{{ p.dosage }}</td>
                <td class="p-2 border-r-2 border-slate-800">{{ p.water_volume }}</td>
                <td class="p-2 uppercase font-bold">{{ p.is_mix ? 'SI' : 'NO' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-[8px] font-bold text-slate-400 mt-2 italic">* Obligatorio uso de EPP completo:
          {{ orderToPrint.ppe_required || 'Uso obligatorio del equipo fijado por seguridad.' }}
        </p>
      </div>

      <!-- Quarters Table -->
      <div class="mb-8 overflow-hidden">
        <h4 class="text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white p-1 inline-block mb-1">II.
          Cuarteles Asignados</h4>
        <div class="grid grid-cols-5 gap-2">
          <div v-for="q in orderToPrint.quartersData" :key="q.id"
            class="p-2 border-2 border-slate-900 bg-slate-50/10 text-center">
            <p class="text-[10px] font-black">{{ q.quarter_number }}</p>
            <p class="text-[8px] font-black text-slate-400">{{ q.surface }} HA</p>
          </div>
        </div>
      </div>

      <!-- Observations -->
      <div class="border-2 border-slate-900 p-4 mb-10 min-h-[80px]">
        <h4 class="text-[8px] font-black uppercase text-slate-400 mb-2 leading-none">Observaciones / Recomendaciones
          Fenológicas:</h4>
        <p class="text-[11px] font-medium leading-relaxed italic text-slate-600">
          "{{ orderToPrint.phenological_stage || 'No se registraron observaciones específicas para esta labor.' }}"</p>
      </div>

      <!-- Signature Section -->
      <div class="flex justify-around items-end pt-12 mt-12">
        <div class="text-center w-64 border-t-2 border-slate-900 pt-2">
          <p class="text-[10px] font-black uppercase">{{ orderToPrint.responsible_name }}
            {{ orderToPrint.responsible_lastname }}
          </p>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Responsable Técnico</p>
        </div>
        <div class="text-center w-64 border-t-2 border-slate-900 pt-2">
          <p class="text-[10px] font-black uppercase">{{ orderToPrint.applicator_name }}
            {{ orderToPrint.applicator_lastname }}
          </p>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aplicador / Operador</p>
        </div>
      </div>
    </div>

    <!-- REQUIREMENT CREATION MODAL -->
    <DxPopup v-model:visible="showRequirementModal" :width="500" :height="'auto'" :show-title="false"
      class="premium-popup">
      <div class="p-8 bg-white flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <ExclamationTriangleIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-800 leading-none">Reportar Requerimiento</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Alerta inmediata para
                Agrónomos</p>
            </div>
          </div>
          <button @click="showRequirementModal = false"
            class="p-2 text-slate-400 hover:text-rose-500 transition-all !w-fit">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Problema</label>
            <DxSelectBox v-model:value="reqForm.type" :data-source="requirementTypes" display-expr="name"
              value-expr="id" class="premium-select" placeholder="Selecciona el tipo..." />
          </div>

          <div class="space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
            <div class="flex gap-2">
              <button v-for="p in ['LOW', 'MEDIUM', 'HIGH']" :key="p" @click="reqForm.priority = p" :class="[
                'flex-1 py-2 rounded-xl text-[10px] font-black border transition-all',
                reqForm.priority === p ?
                  (p === 'HIGH' ? '!bg-rose-600 !text-white !border-rose-600 !shadow-lg !shadow-rose-200' :
                    p === 'MEDIUM' ? '!bg-amber-500 !text-white !border-amber-500 !shadow-lg !shadow-amber-200' :
                      '!bg-blue-500 !text-white !border-blue-500 !shadow-lg !shadow-blue-200') :
                  'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
              ]">
                {{ p === 'HIGH' ? 'Crítica' : p === 'MEDIUM' ? 'Normal' : 'Baja' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Campo
                (Opcional)</label>
              <DxSelectBox v-model:value="reqForm.id_ground" :data-source="grounds" display-expr="name" value-expr="id"
                class="premium-select" placeholder="Global..." />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cuartel
                (Opcional)</label>
              <DxSelectBox v-model:value="reqForm.id_quarter" :data-source="reqFilteredQuarters" display-expr="name"
                value-expr="id" class="premium-select" :disabled="!reqForm.id_ground" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del
              Requerimiento</label>
            <textarea v-model="reqForm.description"
              class="w-full px-4 py-3 bg-slate-50 rounded-2xl font-bold text-sm border-none shadow-sm outline-none focus:ring-2 focus:ring-amber-500 min-h-[120px]"
              placeholder="Detalla lo que necesitas o el problema detectado..."></textarea>
          </div>
        </div>

        <button @click="handleSaveRequirement"
          class="w-full !py-4 !bg-blue-600 !text-white !rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 mt-4">
          Enviar Reporte Ahora
        </button>
      </div>
    </DxPopup>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { useCompanyStore } from '@/stores/companyStore'
import { CompanyService } from '@/api/company.services'

import {
  BookOpenIcon, PlusIcon, AdjustmentsHorizontalIcon, XMarkIcon, TrashIcon, PencilSquareIcon,
  CheckBadgeIcon, EyeIcon, UsersIcon, BeakerIcon, MapPinIcon, ShieldCheckIcon,
  WrenchIcon, IdentificationIcon, PrinterIcon, ArrowDownTrayIcon, FunnelIcon,
  ExclamationTriangleIcon, ClockIcon, ClipboardDocumentCheckIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline'

async function handleExportExcel(order) {
  loading.value = true
  try {
    const res = await fieldBookService.getOrderDetails(order.id)
    if (res.data.code !== 'OK') throw new Error(res.data.mensaje)

    const details = res.data.order || order
    const productsRaw = res.data.products || []
    const quartersRaw = res.data.quarters || []

    const quartersEnriched = quartersRaw.map(q => {
      const qId = Number(q.id_quarter || q.id);
      const qName = (q.quarter_number || "").trim().toLowerCase();

      // Buscar por ID del Atributo, ID del Sector o Nombre como respaldos
      const attr = sectorAttributes.value.find(a =>
        Number(a.id) === qId ||
        Number(a.sector) === qId ||
        (allQuarters.value.find(base => Number(base.id) === Number(a.sector))?.name || "").trim().toLowerCase() === qName
      );

      if (attr) {
        const vObj = allVarieties.value.find(v => Number(v.id) === Number(attr.variety));
        const sObj = species.value.find(s => Number(s.id) === Number(attr.specie));

        return {
          ...q,
          surface: (parseFloat(q.surface) > 0) ? q.surface : (attr.ha_productivas || 0),
          variety_name: (q.variety_name && q.variety_name !== '-') ? q.variety_name : (vObj?.name || '-'),
          specie_name: (q.specie_name && q.specie_name !== '-') ? q.specie_name : (sObj?.name || '-')
        };
      }
      return q;
    });

    // AUTO-ENRIQUECER: Si los campos técnicos vienen vacíos de la BD, intentar pescarlos del maestro
    const productsData = productsRaw.map(p => {
      const pName = (p.brand_name || "").trim().toLowerCase();
      const hasTechnicalData = (p.active_ingredient?.trim() && p.active_ingredient !== '-') ||
        (p.composition?.trim() && p.composition !== '-');

      if (!hasTechnicalData) {
        const master = companyProducts.value.find(m => (m.name || "").trim().toLowerCase() === pName);
        //console.log(`[EXCEL SYNC] Product: ${pName}, Found in Master: ${!!master}`);
        if (master) {
          return {
            ...p,
            active_ingredient: master.active_ingredient || p.active_ingredient,
            composition: master.composition || p.composition,
            objective: master.objective || p.objective,
            justification: master.justification || p.justification
          }
        }
      }
      return p
    });

    // RESOLVER NOMBRES (Data Mapping)
    const respUser = users.value.find(u => Number(u.id) === Number(details.responsible_id))
    const appUser = users.value.find(u => Number(u.id) === Number(details.applicator_id))
    const spec = species.value.find(s => Number(s.id) === Number(details.id_specie))
    const varC = allVarieties.value.find(v => Number(v.id) === Number(details.id_variety))
    const ground = grounds.value.find(g => Number(g.id) === Number(details.id_ground))

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Orden de Aplicación')

    // CONFIGURACIÓN DE COLUMNAS
    worksheet.columns = [
      { width: 22 }, { width: 14 }, { width: 14 }, { width: 25 },
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 8 }, { width: 8 }
    ]

    // --- ENCABEZADO ---
    const { companyID } = useCompanyStore()
    const company = await CompanyService.getCompany(companyID.value)

    try {
      // 1. Obtener URL del logo (usar el de la empresa o el default)
      let logoUrl = company?.logo || '/logos/logo_16.png'

      // Si es una ruta relativa, convertirla a absoluta para el fetch
      // Si empieza con http ya es absoluta
      if (!logoUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL
        if (logoUrl.startsWith('/')) logoUrl = baseUrl + logoUrl
        else logoUrl = baseUrl + '/' + logoUrl
      }

      const response = await fetch(logoUrl)
      const buffer = await response.arrayBuffer()

      const logoId = workbook.addImage({
        buffer: buffer,
        extension: 'png'
      })

      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        br: { col: 1.8, row: 2.8 }
      })
    } catch (e) {
      console.error('Error cargando logo al Excel:', e)
      // Fallback a texto si el logo falla
      worksheet.mergeCells('A1:B3')
      const logoCell = worksheet.getCell('A1')
      logoCell.value = company?.name_company || 'HUERTOS DIGUILLÍN'
      logoCell.font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } }
      logoCell.alignment = { vertical: 'middle', horizontal: 'center' }
    }

    worksheet.mergeCells('C1:F2')
    const titleCell = worksheet.getCell('C1')
    titleCell.value = 'ORDEN APLICACIÓN PRODUCTOS FITOSANITARIOS'
    titleCell.font = { bold: true, size: 12 }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }

    worksheet.mergeCells('C3:F3')
    worksheet.getCell('C3').value = (ground?.name || details.ground_name || '').toUpperCase()
    worksheet.getCell('C3').alignment = { horizontal: 'center' }
    worksheet.getCell('C3').font = { size: 9, italic: true }

    // Ref y N Orden
    worksheet.mergeCells('G1:H1')
    worksheet.getCell('G1').value = 'Ref.: ORD-2026-00'
    worksheet.getCell('G1').font = { size: 8 }
    worksheet.mergeCells('G2:H3')
    const orderNumCell = worksheet.getCell('G2')
    orderNumCell.value = `ORDEN N° ${details.order_number}`
    orderNumCell.font = { bold: true, size: 14 }
    orderNumCell.alignment = { vertical: 'middle', horizontal: 'center' }

    // --- INFO GENERAL (Rosa/Verde como el Excel) ---
    let currentRow = 5
    const drawInfoRow = (label1, val1, label2, val2, color1 = 'FFFCE4EC', color2 = 'FFE8F5E9') => {
      worksheet.getCell(`A${currentRow}`).value = label1
      worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 9 }
      worksheet.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }

      worksheet.mergeCells(`B${currentRow}:D${currentRow}`)
      const v1Cell = worksheet.getCell(`B${currentRow}`)
      v1Cell.value = val1
      v1Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color1 } }
      v1Cell.font = { size: 9, bold: true }

      worksheet.getCell(`E${currentRow}`).value = label2
      worksheet.getCell(`E${currentRow}`).font = { bold: true, size: 9 }
      worksheet.getCell(`E${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }

      worksheet.mergeCells(`F${currentRow}:H${currentRow}`)
      const v2Cell = worksheet.getCell(`F${currentRow}`)
      v2Cell.value = val2
      v2Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color2 } }
      v2Cell.font = { size: 9, bold: true }
      currentRow++
    }

    drawInfoRow('Fecha Emisión:', formatDate(details.issue_date), 'Resp. Técnico:', `${respUser?.name || ''} ${respUser?.lastname || ''}`)
    drawInfoRow('Especie:', `${spec?.name || ''}`, 'Aplicador:', `${appUser?.name || ''} ${appUser?.lastname || ''}`, 'FFE3F2FD', 'FFF3E5F5')
    drawInfoRow('Estado Fenológico:', details.phenological_stage || '-', 'Maquinaria:', details.machinery || '-', 'FFF3E5F5', 'FFE0F2F1')
    currentRow++

    // --- TABLA PRODUCTOS ---
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`)
    const prodHeader = worksheet.getCell(`A${currentRow}`)
    prodHeader.value = 'I. CUADRO INDICACIONES DE APLICACIÓN (Producto)'
    prodHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    prodHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    prodHeader.alignment = { horizontal: 'center' }
    currentRow++

    const pHeaders = ['Nombre Comercial', 'Ing. Activo', 'Objetivo / Justificación', 'Dosis L-Kg/HA', 'Aguas 100/L', 'Dosis 100L', 'Reingreso', 'Carencia (E/A)', 'Intervalo', 'Nº App', 'Mix']
    worksheet.getCell('A' + currentRow).value = 'Nombre Comercial'
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`)
    worksheet.getCell('B' + currentRow).value = 'Ing. Activo / Composición'
    worksheet.getCell('D' + currentRow).value = 'Objetivo / Justificación'
    worksheet.getCell('E' + currentRow).value = 'Dosis L-Kg/Ha'
    worksheet.getCell('F' + currentRow).value = 'Aguas 100/L'
    worksheet.getCell('G' + currentRow).value = 'Dosis 100L'
    worksheet.getCell('H' + currentRow).value = 'Reingreso'
    worksheet.getCell('I' + currentRow).value = 'Carencia E/A'
    worksheet.getCell('J' + currentRow).value = 'Intervalo'
    worksheet.getCell('K' + currentRow).value = 'Nº App'
    worksheet.getCell('L' + currentRow).value = 'Mix'
    worksheet.mergeCells(`L${currentRow}:M${currentRow}`)

    const headerRow = worksheet.getRow(currentRow)
    headerRow.font = { bold: true, size: 9 }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    headerRow.height = 25
    currentRow++

    productsData.forEach(p => {
      worksheet.getCell('A' + currentRow).value = p.brand_name
      worksheet.mergeCells(`B${currentRow}:C${currentRow}`)
      worksheet.getCell('B' + currentRow).value = `${p.active_ingredient || ''} ${p.composition || ''}`
      const techInfo = [p.objective, p.justification].filter(i => i && i.trim()).join(' / ')
      worksheet.getCell('D' + currentRow).value = techInfo || '-'
      worksheet.getCell('E' + currentRow).value = parseFloat(p.dosage || 0)
      worksheet.getCell('F' + currentRow).value = parseFloat(p.water_volume || 0)
      worksheet.getCell('G' + currentRow).value = p.dosage_100l || '-'
      worksheet.getCell('H' + currentRow).value = p.reentry_period ? `${p.reentry_period} hrs` : '-'
      worksheet.getCell('I' + currentRow).value = [p.withholding_label, p.withholding_asoex].filter(v => v).join(' / ') || '-'
      worksheet.getCell('J' + currentRow).value = p.app_interval || '-'
      worksheet.getCell('K' + currentRow).value = p.season_app_number || '-'
      worksheet.mergeCells(`L${currentRow}:M${currentRow}`)
      worksheet.getCell('L' + currentRow).value = p.is_mix ? 'SI' : 'NO'

      const row = worksheet.getRow(currentRow)
      row.font = { size: 9 }
      row.alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell('A' + currentRow).alignment = { horizontal: 'left' }
      currentRow++
    })
    currentRow++

    // --- TABLA CUARTELES ---
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`)
    const qHeader = worksheet.getCell(`A${currentRow}`)
    qHeader.value = 'II. CUADRO INDICACIONES DE APLICACIÓN (Cuarteles)'
    qHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    qHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    qHeader.alignment = { horizontal: 'center' }
    currentRow++

    worksheet.mergeCells(`A${currentRow}:B${currentRow}`)
    worksheet.getCell('A' + currentRow).value = 'Cuartel'
    worksheet.getCell('C' + currentRow).value = 'Superficie (Ha)'
    worksheet.mergeCells(`D${currentRow}:F${currentRow}`)
    worksheet.getCell('D' + currentRow).value = 'Especie'
    worksheet.mergeCells(`G${currentRow}:M${currentRow}`)
    worksheet.getCell('G' + currentRow).value = 'Variedad(es)'
    worksheet.getRow(currentRow).font = { bold: true, size: 9 }
    worksheet.getRow(currentRow).alignment = { horizontal: 'center' }
    currentRow++

    quartersEnriched.forEach(q => {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`)
      worksheet.getCell('A' + currentRow).value = q.quarter_number
      worksheet.getCell('C' + currentRow).value = parseFloat(q.surface)
      worksheet.mergeCells(`D${currentRow}:F${currentRow}`)
      worksheet.getCell('D' + currentRow).value = q.specie_name || '-'
      worksheet.mergeCells(`G${currentRow}:M${currentRow}`)
      worksheet.getCell('G' + currentRow).value = q.variety_name || '-'

      const r = worksheet.getRow(currentRow)
      r.font = { size: 9 }
      r.alignment = { horizontal: 'center' }
      currentRow++
    })
    currentRow++

    // --- FIRMAS ---
    currentRow += 3
    worksheet.mergeCells(`A${currentRow}:C${currentRow}`)
    worksheet.getCell(`A${currentRow}`).value = '__________________________'
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`)
    worksheet.getCell(`F${currentRow}`).value = '__________________________'
    currentRow++

    worksheet.mergeCells(`A${currentRow}:C${currentRow}`)
    worksheet.getCell(`A${currentRow}`).value = 'Firma Resp. Técnico'
    worksheet.mergeCells(`F${currentRow}:H${currentRow}`)
    worksheet.getCell(`F${currentRow}`).value = 'Firma Aplicador'

    worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' }
    worksheet.getCell(`F${currentRow}`).alignment = { horizontal: 'center' }
    worksheet.getCell(`A${currentRow}`).font = { size: 8, bold: true }
    worksheet.getCell(`F${currentRow}`).font = { size: 8, bold: true }

    // Bordes Globales
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber >= 5) {
        row.eachCell({ includeEmpty: false }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `Orden_${details.order_number}.xlsx`)

  } catch (e) {
    console.error(e)
    alert('Error al exportar Excel: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function handleExportGeneralExcel() {
  if (filteredOrders.value.length === 0) {
    alert('No hay registros para exportar en el periodo seleccionado.')
    return
  }

  loading.value = true
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Libro de Campo General')

    // --- ENCABEZADO CON LOGO ---
    const { companyID } = useCompanyStore()
    const company = await CompanyService.getCompany(companyID.value)

    try {
      let logoUrl = company?.logo || '/logos/logo_16.png'
      if (!logoUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL
        if (logoUrl.startsWith('/')) logoUrl = baseUrl + logoUrl
        else logoUrl = baseUrl + '/' + logoUrl
      }
      const response = await fetch(logoUrl)
      const buffer = await response.arrayBuffer()
      const logoId = workbook.addImage({ buffer: buffer, extension: 'png' })
      worksheet.addImage(logoId, { tl: { col: 0, row: 0 }, br: { col: 2, row: 3 } })
    } catch (e) {
      console.error('Error cargando logo al Excel:', e)
    }

    worksheet.mergeCells('D1:L2')
    const titleCell = worksheet.getCell('D1')
    titleCell.value = 'REPORTE GENERAL DE LIBRO DE CAMPO (BITÁCORA DE APLICACIONES)'
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.mergeCells('D3:L3')
    worksheet.getCell('D3').value = `Periodo: ${filterFrom.value || 'Inicio'} hasta ${filterTo.value || 'Fin'}`
    worksheet.getCell('D3').alignment = { horizontal: 'center' }
    worksheet.getCell('D3').font = { size: 10, italic: true }

    // Estilos base
    const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } }, alignment: { horizontal: 'center', vertical: 'middle' } }

    // Iniciar tabla en fila 6
    let startRow = 6

    // Columnas adaptadas para reporte masivo
    worksheet.columns = [
      { header: 'N° ORDEN', key: 'order', width: 10 },
      { header: 'FECHA LABOR', key: 'date', width: 12 },
      { header: 'CAMPO', key: 'ground', width: 15 },
      { header: 'AREA / TAREA', key: 'task', width: 20 },
      { header: 'ESPECIE (VAR)', key: 'specie', width: 20 },
      { header: 'EST. FENOLOG.', key: 'stage', width: 20 },
      { header: 'CUARTELES', key: 'quarters', width: 15 },
      { header: 'SUP. TOTAL (HA)', key: 'sup', width: 14 },
      { header: 'INSUMO', key: 'brand', width: 20 },
      { header: 'ING. ACTIVO', key: 'active', width: 20 },
      { header: 'DOSIS (L-Kg/HA)', key: 'dosage', width: 14 },
      { header: 'AGUAS 100/L', key: 'water', width: 12 },
      { header: 'RESP. TÉCNICO', key: 'tech', width: 18 },
      { header: 'APLICADOR', key: 'applicator', width: 18 },
      { header: 'ESTADO', key: 'status', width: 12 }
    ]

    // Formatear cabecera (que ahora está en la fila 6)
    worksheet.getRow(startRow).eachCell(cell => {
      Object.assign(cell, headerStyle)
    })

    // Fetch details for all selected orders
    const rawResults = await Promise.all(
      filteredOrders.value.map(o => fieldBookService.getOrderDetails(o.id))
    )

    rawResults.forEach(res => {
      if (res.data.code !== 'OK') return;
      const o = res.data.order;
      const products = res.data.products || [];
      const quarters = res.data.quarters || [];

      const quartersText = quarters.map(q => q.quarter_number).join(', ')
      const totalHa = quarters.reduce((acc, q) => acc + parseFloat(q.surface || 0), 0)

      // Resolver nombres desde el maestro local si el API no los trae
      const rUser = users.value.find(u => Number(u.id) === Number(o.responsible_id))
      const aUser = users.value.find(u => Number(u.id) === Number(o.applicator_id))
      const techName = rUser ? `${rUser.name} ${rUser.lastname}` : (o.responsible_name || 'N/A')
      const appName = aUser ? `${aUser.name} ${aUser.lastname}` : (o.applicator_name || '-')

      const groundObj = grounds.value.find(g => Number(g.id) === Number(o.id_ground))
      const areaObj = configAreas.value.find(a => Number(a.id) === Number(o.id_area))
      const specObj = species.value.find(s => Number(s.id) === Number(o.id_specie))
      const varObj = allVarieties.value.find(v => Number(v.id) === Number(o.id_variety))

      const taskStr = [areaObj?.name || o.area_name, o.task_name].filter(v => v && v !== 'undefined').join(' / ') || '-'
      const specieStr = specObj ? `${specObj.name} (${varObj?.name || o.variety_name || '-'})` : (o.specie_name || '-')

      // Por cada producto generamos una fila para que el reporte sea detallado y filtrable
      products.forEach(p => {
        worksheet.addRow({
          order: o.order_number,
          date: formatDate(o.issue_date),
          ground: groundObj?.name || o.ground_name || '-',
          task: taskStr,
          specie: specieStr,
          stage: o.phenological_stage || '-',
          quarters: quartersText,
          sup: totalHa.toFixed(2),
          brand: p.brand_name,
          active: p.active_ingredient || '-',
          dosage: p.dosage,
          water: p.water_volume,
          tech: techName,
          applicator: appName,
          status: o.status === 'PENDING' ? 'Borrador' : o.status === 'GENERATED' ? 'Pendiente' : o.status === 'APPLIED' ? 'Aplicada' : 'Cerrada'
        })
      })

      // Si no hay productos, igual mostrar la orden
      if (products.length === 0) {
        worksheet.addRow({
          order: o.order_number,
          date: formatDate(o.issue_date),
          ground: groundObj?.name || o.ground_name || '-',
          task: taskStr,
          specie: specieStr,
          stage: o.phenological_stage || '-',
          quarters: quartersText,
          sup: totalHa.toFixed(2),
          tech: techName,
          applicator: appName,
          status: o.status === 'PENDING' ? 'Borrador' : o.status === 'GENERATED' ? 'Pendiente' : o.status === 'APPLIED' ? 'Aplicada' : 'Cerrada'
        })
      }
    })

    // Bordes, Alineación y Colores Dinámicos
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber >= startRow) {
        row.eachCell((cell, colNumber) => {
          // Borde estándar para todo
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
          cell.alignment = { vertical: 'middle', horizontal: 'center' }

          if (rowNumber === startRow) return; // Saltamos cabecera para los rellenos de datos

          // 1. Colores de Columnas (Según Imagen Referencia)
          if (colNumber === 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } } // Fecha (Verde claro)
          if (colNumber === 7) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } } // Cuarteles (Rosa)
          if (colNumber === 11) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } } // Dosis (Azul)
          if (colNumber === 12) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } } // Aguas/Mojamiento (Verde)

          // 2. Color por ESTADO (Columna 15)
          if (colNumber === 15) {
            const val = cell.value;
            let bgColor = 'FFF1F5F9'; // Gris suave fondo
            let fontColor = 'FF000000'; // Negro texto
            if (val === 'Cerrada') { bgColor = 'FFD1FAE5'; fontColor = 'FF065F46'; }
            if (val === 'Aplicada') { bgColor = 'FFE0E7FF'; fontColor = 'FF3730A3'; }
            if (val === 'Pendiente') { bgColor = 'FFDBEAFE'; fontColor = 'FF1E40AF'; }
            if (val === 'Borrador') { bgColor = 'FFFEF3C7'; fontColor = 'FF92400E'; }

            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
            cell.font = { bold: true, size: 8, color: { argb: fontColor } }
          }
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = `Reporte_General_Campo_${filterFrom.value || 'inicio'}_a_${filterTo.value || 'fin'}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (e) {
    console.error(e)
    alert('Error al generar reporte general: ' + e.message)
  } finally {
    loading.value = false
  }
}
import { DxDataGrid, DxColumn, DxPaging, DxSearchPanel, DxHeaderFilter, DxFilterRow } from 'devextreme-vue/data-grid'
import { DxPopup } from 'devextreme-vue/popup'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxTagBox } from 'devextreme-vue/tag-box'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import fieldBookService from '@/api/field-book.service.js'
import conexionApi from '@/services/conexionApi.js'

const loading = ref(false)
const activeTab = ref('plan') // 'plan' o 'reqs'
const requirements = ref([])
const showRequirementModal = ref(false)
const isEditingReq = ref(false)
const reqForm = ref({
  id: null,
  type: '',
  description: '',
  priority: 'MEDIUM',
  id_ground: null,
  id_quarter: null
})

const reqFilteredQuarters = computed(() => {
  if (!reqForm.value.id_ground) return []
  return allQuarters.value.filter(q => Number(q.ground) === Number(reqForm.value.id_ground))
})

const requirementTypes = [
  { id: 'MAQUINARIA', name: 'Falla en Maquinaria' },
  { id: 'INSUMOS', name: 'Falta de Insumos / Repuestos' },
  { id: 'FITOSANITARIO', name: 'Alerta Fitosanitaria (Enfermedad/Plaga)' },
  { id: 'RIEGO', name: 'Problema de Riego' },
  { id: 'INFRAESTRUCTURA', name: 'Infraestructura / Cerco / Caminos' },
  { id: 'OTRO', name: 'Otro Requerimiento' }
]
const showCreateModal = ref(false)
const isEditing = ref(false)
const isReadOnly = ref(false)
const editingOrderId = ref(null)
const orders = ref([])
const grounds = ref([])
const species = ref([])
const users = ref([])
const companyProducts = ref([])
const configAreas = ref([])
const configTasks = ref([])
const warehouses = ref([])
const categories = ref([])
const allSubcategories = ref([])

const filterFrom = ref('')
const filterTo = ref('')

const stats = computed(() => {
  const myOrders = orders.value.filter(o => Number(o.applicator_id) === currentUserId)
  const today = new Date().setHours(0, 0, 0, 0)
  const todayStr = new Date().toISOString().split('T')[0]

  return {
    pending: myOrders.filter(o => o.status === 'GENERATED').length,
    overdue: myOrders.filter(o => {
      const isPending = o.status === 'GENERATED'
      const orderDate = new Date(o.issue_date).setHours(0, 0, 0, 0)
      return isPending && orderDate < today
    }).length,
    partial: myOrders.filter(o => o.status === 'PARTIAL').length,
    appliedToday: myOrders.filter(o => o.status === 'APPLIED' && o.application_date?.split('T')[0] === todayStr).length,
    applied: myOrders.filter(o => o.status === 'APPLIED').length
  }
})

const filteredOrders = computed(() => {
  let list = [...orders.value]

  // Si es Aplicador (Rol 11), solo mostrar sus asignadas
  if (userRoleId === 11) {
    list = list.filter(o => Number(o.applicator_id) === currentUserId)
  }

  if (!filterFrom.value && !filterTo.value) {
    return list.sort((a, b) => b.order_number.localeCompare(a.order_number))
  }

  return list.filter(o => {
    const date = o.issue_date?.split('T')[0]
    let match = true
    if (filterFrom.value && date < filterFrom.value) match = false
    if (filterTo.value && date > filterTo.value) match = false
    return match
  }).sort((a, b) => b.order_number.localeCompare(a.order_number))
})

function resetFilters() {
  filterFrom.value = ''
  filterTo.value = ''
}

const showConfirmModal = ref(false)
const selectedOrderConfirm = ref(null)
const orderToPrint = ref(null)
const confirmForm = ref({
  id_order: null,
  application_date: new Date().toISOString().split('T')[0],
  start_time: '08:00',
  end_time: '12:00',
  products: []
})

const allQuarters = ref([])
const allVarieties = ref([])
const filteredVarieties = ref([])
const sectorAttributes = ref([])

const filteredQuarters = computed(() => {
  if (!form.value.id_ground) return []
  return allQuarters.value.filter(q => {
    const belongsToGround = Number(q.ground) === Number(form.value.id_ground)
    const attr = sectorAttributes.value.find(a => Number(a.sector) === Number(q.id))
    if (!belongsToGround || !attr) return false

    // Si hay filtros de especie/variedad seleccionados, aplicar
    if (form.value.id_specie && Number(attr.specie) !== Number(form.value.id_specie)) return false
    if (form.value.id_variety && Number(attr.variety) !== Number(form.value.id_variety)) return false

    return true
  })
})

const totalSurface = computed(() => {
  if (!form.value.quarters) return 0
  return form.value.quarters.reduce((acc, id) => {
    const q = allQuarters.value.find(base => Number(base.id) === Number(id))
    const attr = sectorAttributes.value.find(a => Number(a.sector) === Number(id))
    const surface = parseFloat(q?.ha_productivas || q?.surface || attr?.ha_productivas || 0)
    return acc + surface
  }, 0)
})

const companyId = localStorage.getItem('userIdCompany')
const currentUserId = Number(localStorage.getItem('userId'))
const userRoleId = Number(localStorage.getItem('rol'))

// Roles que pueden cambiar el responsable (Administrador=1, Gerencia=2, Técnico=3)
const canChangeResponsible = computed(() => [1, 2, 3].includes(userRoleId))

const form = ref({
  order_number: '',
  id_ground: null, ground_name: '',
  id_specie: null, specie_name: '',
  id_variety: null, variety_name: '',
  id_area: null, area_name: '',
  id_task: null, task_name: '',
  issue_date: new Date().toISOString().split('T')[0],
  responsible_id: currentUserId, responsible_name: '', responsible_lastname: '',
  applicator_id: null, applicator_name: '', applicator_lastname: '',
  phenological_stage: '',
  machinery: '',
  ppe_required: '',
  status: 'PENDING',
  quarters: [],
  quartersDetail: [],
  products: [{
    _uId: Date.now(),
    brand_name: '', id_product: null,
    id_category: null, id_subcategory: null,
    active_ingredient: '', composition: '', objective: '',
    dosage: '', water_volume: '', dosage_100l: '',
    dosage_unit: 'L/HA', total_quantity: 0,
    phenological_stage: '', justification: '',
    is_mix: false, reentry_period: '',
    withholding_label: '', withholding_asoex: '',
    app_interval: '', season_app_number: '',
    id_warehouse: null, reserve_stock: false, stock_info: []
  }]
})

onMounted(fetchData)

const displayFullName = (item) => {
  return item ? `${item.name} ${item.lastname}` : ''
}

const getWarehouseName = (id) => {
  if (!id) return 'BOD'
  const w = warehouses.value.find(ext => Number(ext.id) === Number(id))
  return w ? w.name : `BOD-${id}`
}

function getCategoryName(id) {
  if (!id) return '-'
  const cat = categories.value.find(c => Number(c.id) === Number(id))
  return cat ? cat.name : `CAT-${id}`
}

function getSubcategoryName(id) {
  if (!id) return '-'
  const sub = allSubcategories.value.find(s => Number(s.id) === Number(id))
  return sub ? sub.name : `SUB-${id}`
}

const phenoStatesList = ref([])

async function fetchData() {
  loading.value = true
  try {
    const [
      ordersRes, usersRes, groundsRes, speciesRes, productsRes,
      areasRes, quartersRes, varietiesRes, attributesRes,
      warehousesRes, phenoRes, categoriesRes, subcategoriesRes
    ] = await Promise.all([
      fieldBookService.getOrders(companyId),
      conexionApi.get(`/configuracion/usuarios/${companyId}`),
      conexionApi.get(`/configuracion/production/getGround/${companyId}`),
      conexionApi.get(`/configuracion/production/getSpecies/${companyId}`),
      conexionApi.get(`/products/${companyId}`),
      fieldBookService.getAreas(companyId),
      conexionApi.get(`/configuracion/production/getSectorsBarracks/${companyId}`),
      conexionApi.get(`/configuracion/production/getVarieties/${companyId}`),
      conexionApi.get(`/configuracion/production/getAttributesSector/${companyId}`),
      conexionApi.get(`/warehouses/getWarehouses/${companyId}`),
      fieldBookService.getPhenologicalStates(companyId),
      conexionApi.get(`/product-categories/${companyId}`),
      conexionApi.get(`/all-subcategories/${companyId}`)
    ])

    orders.value = ordersRes.data.orders || []
    users.value = (usersRes.data.usuarios || []).map(u => ({
      ...u,
      fullName: `${u.name} ${u.lastname}`
    }))
    grounds.value = groundsRes.data.grounds || []
    species.value = speciesRes.data.species || []
    companyProducts.value = productsRes.data.products || []
    configAreas.value = (areasRes.data.data || []).filter(a => a.status)
    allQuarters.value = quartersRes.data.sectors || []
    allVarieties.value = varietiesRes.data.varieties || []
    sectorAttributes.value = attributesRes.data.attributes || []
    warehouses.value = warehousesRes.data.warehouses || []
    categories.value = categoriesRes.data?.data || []
    allSubcategories.value = subcategoriesRes.data?.data || []

    // Asignación ultra-robusta de estados fenológicos (solo activos)
    const rawPheno = phenoRes.data?.data || phenoRes.data || []
    phenoStatesList.value = Array.isArray(rawPheno)
      ? rawPheno.filter(s => s && (Number(s.status) === 1))
      : []

    console.log("🌱 [FIELD BOOK] Estados Fenológicos Activos Cargados:", phenoStatesList.value.length)

    companyProducts.value = (productsRes.data.products || []).map(p => {
      const si = p.warehouses || p.stocks || p.Stocks || [];
      return {
        ...p,
        stock_info: [...si]
      };
    })

    await fetchRequirements()

    if (!isEditing.value) resetForm()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  const currentUser = users.value.find(u => Number(u.id) === currentUserId)

  form.value = {
    id_ground: grounds.value.length ? grounds.value[0].id : null,
    id_specie: species.value.length ? species.value[0].id : null,
    id_variety: null, id_area: null, id_task: null,
    issue_date: new Date().toISOString().split('T')[0],
    responsible_id: currentUser?.id || currentUserId,
    responsible_name: currentUser?.name || '',
    responsible_lastname: currentUser?.lastname || '',
    applicator_id: null, applicator_name: '', applicator_lastname: '',
    phenological_stage: '', machinery: '', ppe_required: '',
    observations: '',
    status: 'PENDING',
    quarters: [], quartersDetail: [],
    products: [{
      _uId: Date.now(),
      brand_name: '', id_product: null, dosage: '', water_volume: '',
      active_ingredient: '', composition: '', objective: '', justification: '',
      dosage_100l: '', is_mix: false, reentry_period: '',
      withholding_label: '', withholding_asoex: '',
      app_interval: '', season_app_number: '',
      id_warehouse: null, reserve_stock: false, stock_info: [],
      phenological_stage: ''
    }]
  }
}

async function fetchProductStock(productId, productRow) {
  try {
    const res = await conexionApi.get(`/products/${productId}`)
    if (res.data.code === 'OK') {
      const d = res.data;
      const productObj = d.product || d.data || d;

      const newStock = productObj.warehouses || productObj.stocks || productObj.warehouse_products || d.stocks
      if (newStock && newStock.length > 0) {
        productRow.stock_info = [...newStock]
      }

      if (productRow.id_warehouse) {
        fetchCurrentWarehouseStock(productRow)
      }
    }
  } catch (e) {
    console.error("Error fetching stock:", e)
  }
}

const calculateProductNeeded = (product) => {
  const totalHaRaw = form.value.quarters.reduce((acc, id) => {
    const q = allQuarters.value.find(base => base.id === id)
    return acc + parseFloat(q?.ha_productivas || q?.surface || 0)
  }, 0)

  // Si no hay cuarteles seleccionados, asumimos 1 Ha para mostrar la dosis base en el aviso
  const totalHa = totalHaRaw > 0 ? totalHaRaw : 1;
  return (parseFloat(product.dosage || 0) * totalHa).toFixed(2)
}

const getSelectedWarehouseStock = (product) => {
  if (!product.id_warehouse) return 0
  const found = (product.stock_info || []).find(s => Number(s.id_warehouse || s.warehouse_id) === Number(product.id_warehouse))
  if (found) {
    const qty = (found.quantity !== undefined ? found.quantity : (found.stock || found.Stock || 0))
    return parseFloat(qty) || 0
  }
  return 0
}

const getSelectedWarehouseReserved = (product) => {
  if (!product.id_warehouse) return 0
  const found = (product.stock_info || []).find(s => Number(s.id_warehouse || s.warehouse_id) === Number(product.id_warehouse))
  if (found) {
    return parseFloat(found.reserved_quantity || 0) || 0
  }
  return 0
}

async function fetchCurrentWarehouseStock(productRow) {
  if (!productRow.id_product || !productRow.id_warehouse) return

  try {
    const res = await conexionApi.get(`/products/stock/${productRow.id_product}/${productRow.id_warehouse}`)
    if (res.data.code === 'OK' || res.data.status === 'OK') {
      const quantity = (res.data.quantity !== undefined ? res.data.quantity : res.data.data?.quantity) || 0
      const reserved = (res.data.reserved_quantity !== undefined ? res.data.reserved_quantity : res.data.data?.reserved_quantity) || 0

      if (!productRow.stock_info) productRow.stock_info = []

      const idx = productRow.stock_info.findIndex(s => Number(s.id_warehouse || s.warehouse_id) === Number(productRow.id_warehouse))
      if (idx !== -1) {
        productRow.stock_info[idx].quantity = quantity
        productRow.stock_info[idx].reserved_quantity = reserved
      } else {
        productRow.stock_info.push({ warehouse_id: productRow.id_warehouse, quantity: quantity, reserved_quantity: reserved })
      }
    }
  } catch (e) {
    console.error("Error query warehouse product stock:", e)
  }
}

function onWarehouseChange(e, productRow) {
  if (!e.value) return
  fetchCurrentWarehouseStock(productRow)
}

function onProductNameChange(e, productRow) {
  const newVal = e.value
  // Capturar el texto mostrado si es posible
  if (e.component && e.component.option('text')) {
    productRow.brand_name = e.component.option('text')
  }

  if (!newVal) {
    productRow.id_product = null
    return
  }

  productRow.id_product = Number(newVal)
  const found = companyProducts.value.find(p => Number(p.id) === Number(newVal))
  
  if (found) {
    if (!productRow.id_category) productRow.id_category = found.category_id
    if (!productRow.id_subcategory) productRow.id_subcategory = found.subcategory_id

    Object.assign(productRow, {
      brand_name: found.name,
      active_ingredient: found.active_ingredient ?? '',
      composition: found.composition ?? '',
      objective: found.objective ?? '',
      justification: found.justification ?? productRow.justification,
      stock_info: [...(found.stock_info || [])]
    })
    fetchProductStock(found.id, productRow)
  } else {
    // Si no es un ID (es texto personalizado)
    if (isNaN(productRow.id_product)) {
       productRow.id_product = null
       productRow.brand_name = newVal
    }
    fetchProductStock(newVal, productRow)
  }
}

const getFilteredSubcategories = (product) => {
  if (!product.id_category) return []
  return allSubcategories.value.filter(s => Number(s.category_id) === Number(product.id_category))
}

const getFilteredProducts = (product) => {
  let list = [...companyProducts.value]
  if (product.id_category) {
    list = list.filter(p => {
      const hasDirect = Number(p.category_id) === Number(product.id_category)
      const hasLink = p.category_links?.some(cl => Number(cl.category_id) === Number(product.id_category))
      return hasDirect || hasLink
    })
  }
  if (product.id_subcategory) {
    list = list.filter(p => {
      const hasDirect = Number(p.subcategory_id) === Number(product.id_subcategory)
      const hasLink = p.category_links?.some(cl => Number(cl.subcategory_id) === Number(product.id_subcategory))
      return hasDirect || hasLink
    })
  }
  return list
}

const onCategoryChange = (product) => {
  product.id_subcategory = null
  product.id_product = null
}

const updateProductQuantity = (product) => {
  const dosage = parseFloat(product.dosage || 0)
  const surface = totalSurface.value || 0
  product.total_quantity = (dosage * surface).toFixed(2)
}

watch(totalSurface, (newVal) => {
  form.value.products.forEach(p => {
    updateProductQuantity(p)
  })
})

function addProduct() {
  form.value.products.push({
    _uId: Date.now() + Math.random(),
    brand_name: '', id_product: null, 
    id_category: null, id_subcategory: null,
    active_ingredient: '', composition: '', objective: '',
    dosage: '', water_volume: '', dosage_unit: 'L/HA',
    justification: '',
    dosage_100l: '', is_mix: false, reentry_period: '',
    withholding_label: '', withholding_asoex: '',
    app_interval: '', season_app_number: '',
    id_warehouse: null, reserve_stock: false, stock_info: [],
    phenological_stage: ''
  })
}

function removeProductByUid(uid) {
  form.value.products = form.value.products.filter(p => p._uId !== uid)
}

// Watch users to ensure selection happens as soon as they are loaded if modal is open
watch(users, (newUsers) => {
  if (newUsers.length > 0 && !isEditing.value && showCreateModal.value) {
    resetForm()
  }
})

function openCreateModal() {
  isEditing.value = false
  isReadOnly.value = false
  editingOrderId.value = null
  resetForm()
  showCreateModal.value = true
}

async function openEditModal(order, readOnly = false) {
  loading.value = true
  try {
    const res = await fieldBookService.getOrderDetails(order.id)
    isEditing.value = true
    isReadOnly.value = readOnly
    editingOrderId.value = order.id

    if (res.data.code === 'OK') {
      const details = res.data.order || order
      const productsRaw = res.data.products || []
      const quartersRaw = res.data.quarters || []

      // AUTO-ENRIQUECER CUARTELES (Vista de detalles)
      const quartersData = quartersRaw.map(q => {
        const qId = Number(q.id_quarter || q.id);
        const qName = (q.quarter_number || "").trim().toLowerCase();
        const attr = sectorAttributes.value.find(a =>
          Number(a.id) === qId ||
          Number(a.sector) === qId ||
          (allQuarters.value.find(base => Number(base.id) === Number(a.sector))?.name || "").trim().toLowerCase() === qName
        );
        if (attr) {
          const vObj = allVarieties.value.find(v => Number(v.id) === Number(attr.variety));
          return {
            ...q,
            surface: (parseFloat(q.surface) > 0) ? q.surface : (attr.ha_productivas || 0),
            id_variety: attr.variety,
            variety_name: q.variety_name && q.variety_name !== '-' ? q.variety_name : (vObj?.name || '-')
          }
        }
        return q;
      });

      // AUTO-ENRIQUECER PRODUCTOS
      const productsData = productsRaw.map((p, i) => {
        const pName = (p.brand_name || "").trim().toLowerCase();
        const hasTech = (p.active_ingredient?.trim() && p.active_ingredient !== '-') || (p.composition?.trim() && p.composition !== '-');
        if (!hasTech) {
          const master = companyProducts.value.find(m => (m.name || "").trim().toLowerCase() === pName);
          if (master) {
            return {
              ...p,
              active_ingredient: master.active_ingredient || p.active_ingredient,
              composition: master.composition || p.composition,
              objective: master.objective || p.objective,
              justification: master.justification || p.justification
            }
          }
        }
        return {
          ...p,
          _uId: Date.now() + Math.random() + i
        }
      });

      // Inyectar nombres para la vista detalle
      const effectiveResponsibleId = canChangeResponsible.value ? Number(details.responsible_id) : currentUserId
      const ground = grounds.value.find(g => Number(g.id) === Number(details.id_ground))
      const resp = users.value.find(u => Number(u.id) === effectiveResponsibleId)
      const app = users.value.find(u => Number(u.id) === Number(details.applicator_id))
      const area = configAreas.value.find(a => Number(a.id) === Number(details.id_area))
      const taskArr = configTasks.value
      const task = taskArr.find(t => Number(t.id) === Number(details.id_task))
      const specie = species.value.find(s => Number(s.id) === Number(details.id_specie))
      const variety = allVarieties.value.find(v => Number(v.id) === Number(details.id_variety))

      form.value = {
        ...details,
        responsible_id: effectiveResponsibleId,
        ground_name: ground?.name || details.ground_name,
        responsible_name: resp?.name || details.responsible_name,
        responsible_lastname: resp?.lastname || details.responsible_lastname,
        applicator_name: app?.name || details.applicator_name,
        applicator_lastname: app?.lastname || details.applicator_lastname,
        area_name: area?.name || details.area_name,
        task_name: task?.name || details.task_name,
        specie_name: specie?.name || details.specie_name,
        variety_name: variety?.name || details.variety_name,
        issue_date: details.issue_date?.split('T')[0],
        quarters: quartersData.map(q => {
          const found = allQuarters.value.find(base => base.name === q.quarter_number)
          return found ? found.id : q.id_quarter
        }),
        quartersDetail: quartersData,
        observations: details.observations || '',
        products: productsData
      }
      showCreateModal.value = true
    } else {
      alert('Error: ' + res.data.mensaje)
    }
  } catch (e) {
    console.error(e)
    alert('Error al conectar con el servidor')
  } finally {
    loading.value = false
  }
}

async function handleSaveOrder() {
  loading.value = true
  try {
    const mappedQuarters = form.value.quarters.map(id => {
      const q = allQuarters.value.find(quarter => quarter.id === id)
      const attr = sectorAttributes.value.find(a => Number(a.sector) === Number(id))
      return {
        id_quarter: id,
        quarter_number: q?.name || id,
        surface: q?.ha_productivas || 0,
        id_variety: attr ? attr.variety : form.value.id_variety
      }
    })

    const cleanedProducts = form.value.products
      .filter(p => (p.brand_name && p.brand_name.trim() !== '') || p.id_product)
      .map(p => {
        let finalBrandName = p.brand_name;
        // Si no hay nombre pero hay ID, buscarlo
        if ((!finalBrandName || finalBrandName.trim() === '') && p.id_product) {
          const master = companyProducts.value.find(m => Number(m.id) === Number(p.id_product))
          if (master) finalBrandName = master.name
        }
        return {
          ...p,
          brand_name: finalBrandName,
          phenological_stage: p.phenological_stage || null, // Asegurar persistencia
          dosage_unit: p.dosage_unit || 'L/HA'
        }
      });

    const payload = {
      ...form.value,
      id_company: companyId,
      quarters: mappedQuarters,
      products: cleanedProducts,
      executor_id: form.value.applicator_id
    }

    // VALIDACIÓN ESTRICTA DE DISPONIBILIDAD DE STOCK
    const totalHa = mappedQuarters.reduce((acc, q) => acc + parseFloat(q.surface || 0), 0)
    for (const p of payload.products) {
      if (p.id_warehouse) {
        // Obtenemos el stock más actual para esta bodega
        const stockItem = (p.stock_info || []).find(s => Number(s.id_warehouse || s.warehouse_id) === Number(p.id_warehouse))
        const available = stockItem ? parseFloat(stockItem.quantity || stockItem.stock || 0) : 0
        const needed = parseFloat(p.dosage || 0) * totalHa

        if (needed > available && !p.reserve_stock) {
          alert(`🚫 ERROR DE STOCK: Para "${p.brand_name || 'Insumo'}", el stock disponible (${available}) es INSUFICIENTE para cubrir la dosis planificada (${needed.toFixed(2)}). Para continuar, activa la opción de "Reservar Stock" si planeas retirarlo más tarde.`)
          loading.value = false
          return
        }
      }
    }

    let res;
    if (isEditing.value) {
      res = await fieldBookService.updateOrder(editingOrderId.value, payload)
    } else {
      res = await fieldBookService.createOrder(payload)
    }

    if (res.data.code === 'OK') {
      showCreateModal.value = false
      fetchData()
    } else {
      alert('Error: ' + res.data.mensaje)
    }
  } catch (e) {
    console.error(e)
    alert('Error de servidor')
  } finally {
    loading.value = false
  }
}

async function handleFinalize(order) {
  if (!confirm(`¿Estás seguro de generar definitivamente la Orden ${order.order_number}? Una vez generada no podrá editarse.`)) return
  loading.value = true
  try {
    await fieldBookService.finalizeOrder(order.id)
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function openConfirmModal(order) {
  loading.value = true
  try {
    const res = await fieldBookService.getOrderDetails(order.id)
    if (res.data.code === 'OK') {
      selectedOrderConfirm.value = order
      confirmForm.value = {
        id_order: order.id,
        application_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '12:00',
        products: (res.data.products || []).map(p => {
          const accum = parseFloat(p.applied_quantity || 0)
          const total = parseFloat(p.dosage || 0)
          const remaining = Math.max(0, total - accum)
          return {
            ...p,
            applied_quantity_accum: accum,
            applied_quantity: remaining // Sugerir el total restante
          }
        })
      }
      showConfirmModal.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleConfirmApplication() {
  // Validación de seguridad: no permitir mas de lo asignado
  for (const p of confirmForm.value.products) {
    const totalDespues = parseFloat(p.applied_quantity_accum || 0) + parseFloat(p.applied_quantity || 0)
    if (totalDespues > parseFloat(p.dosage || 0) + 0.01) { // 0.01 margen por flotantes
      alert(`No puedes aplicar más de lo asignado para ${p.brand_name}. Máximo restante: ${(parseFloat(p.dosage) - parseFloat(p.applied_quantity_accum)).toFixed(2)}`)
      return
    }
  }

  console.log("🚀 [CONFIRM] Sending to API:", JSON.stringify(confirmForm.value, null, 2))
  loading.value = true
  try {
    const res = await fieldBookService.confirmApplication(confirmForm.value)
    if (res.data.code === 'OK') {
      showConfirmModal.value = false
      fetchData()
    }
  } catch (e) {
    console.error("❌ [CONFIRM] API Error:", e)
  } finally {
    loading.value = false
  }
}

async function handleCloseOrder(order) {
  if (!confirm(`¿Deseas validar y cerrar oficialmente la orden ${order.order_number}?`)) return
  loading.value = true
  try {
    const res = await fieldBookService.closeOrder(order.id)
    if (res.data.code === 'OK') {
      fetchData()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// --- FIELD REQUIREMENTS METHODS ---

async function fetchRequirements() {
  try {
    const res = await fieldBookService.getRequirements(companyId)
    if (res.data.code === 'OK') {
      requirements.value = res.data.requirements
    }
  } catch (e) {
    console.error(e)
  }
}

function openRequirementModal(req = null) {
  if (req) {
    isEditingReq.value = true
    reqForm.value = {
      id: req.id,
      type: req.type,
      description: req.description,
      priority: req.priority,
      id_ground: req.id_ground,
      id_quarter: req.id_quarter
    }
  } else {
    isEditingReq.value = false
    reqForm.value = {
      id: null,
      type: '',
      description: '',
      priority: 'MEDIUM',
      id_ground: grounds.value.length ? grounds.value[0].id : null,
      id_quarter: null
    }
  }
  showRequirementModal.value = true
}

async function handleSaveRequirement() {
  if (!reqForm.value.type || !reqForm.value.description) {
    alert('Por favor completa el tipo y la descripción')
    return
  }

  loading.value = true
  try {
    const payload = {
      ...reqForm.value,
      id_company: companyId,
      id_creator: currentUserId
    }

    let res;
    if (isEditingReq.value) {
      res = await fieldBookService.updateRequirement(reqForm.value.id, payload)
    } else {
      res = await fieldBookService.createRequirement(payload)
    }

    if (res.data.code === 'OK') {
      showRequirementModal.value = false
      fetchRequirements()
      alert(isEditingReq.value ? 'Requerimiento actualizado' : 'Requerimiento reportado exitosamente. Los agrónomos han sido notificados.')
    } else {
      alert('Error: ' + res.data.mensaje)
    }
  } catch (e) {
    console.error(e)
    alert('Error de servidor al guardar requerimiento')
  } finally {
    loading.value = false
  }
}

async function handleDeleteRequirement(req) {
  if (!confirm('¿Estás seguro de eliminar este requerimiento?')) return
  loading.value = true
  try {
    const res = await fieldBookService.deleteRequirement(req.id)
    if (res.data.code === 'OK') {
      fetchRequirements()
    } else {
      alert('Error: ' + res.data.mensaje)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function updateReqStatus(req, status) {
  const statusEs = status === 'RESOLVED' ? 'RESUELTO' : 'RECHAZADO'
  if (!confirm(`¿Deseas marcar este requerimiento como ${statusEs}?`)) return
  try {
    const res = await fieldBookService.updateRequirementStatus(req.id, status)
    if (res.data.code === 'OK') {
      fetchRequirements()
    }
  } catch (e) {
    console.error(e)
  }
}

async function handleDelete(order) {
  if (!confirm(`¿Estás seguro de eliminar la Orden ${order.order_number}?`)) return
  loading.value = true
  try {
    await fieldBookService.deleteOrder(order.id)
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}


function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Watchers
// filteredQuarters ya es computed

watch(() => form.value.id_specie, (newVal) => {
  filteredVarieties.value = allVarieties.value.filter(v => Number(v.species_id) === Number(newVal))
}, { immediate: true })

watch(() => form.value.id_area, async (newVal) => {
  if (newVal) {
    const res = await fieldBookService.getTasksByArea(newVal)
    configTasks.value = (res.data.data || []).filter(t => t.status)
  } else {
    configTasks.value = []
  }
}, { immediate: true })

watch(() => form.value.quarters, (newVal) => {
  if (newVal && newVal.length > 0) {
    // Si hay cuarteles seleccionados, tomamos especie/variedad del primero
    const firstQuarterId = newVal[0]
    const attr = sectorAttributes.value.find(a => Number(a.sector) === Number(firstQuarterId))
    if (attr) {
      form.value.id_specie = attr.specie
      form.value.id_variety = attr.variety

      // Auto-set names for display
      const s = species.value.find(ext => ext.id === attr.specie)
      if (s) form.value.specie_name = s.name

      const v = allVarieties.value.find(ext => ext.id === attr.variety)
      if (v) form.value.variety_name = v.name
    }
  }
}, { deep: true })
</script>

<style scoped>
.premium-grid :deep(.dx-datagrid-headers) {
  background-color: white;
  color: var(--color-slate-800) !important;
  font-weight: 700 !important;
  text-transform: initial;
  font-size: 10px;
  letter-spacing: normal;
}

.premium-grid :deep(.dx-data-row) {
  height: 55px;
}

.premium-select :deep(.dx-texteditor-input) {
  padding: 10px 14px;
  font-weight: 700;
  font-size: 13px;
}

.premium-select :deep(.dx-widget) {
  border-radius: 16px;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
}

.premium-select-small :deep(.dx-texteditor-input) {
  padding: 8px 12px;
  font-weight: 700;
  font-size: 11px;
}

.premium-select-small :deep(.dx-widget) {
  border-radius: 12px;
  background-color: white;
  border: 1px solid #f1f5f9;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media print {
  body {
    background: white !important;
  }

  /* Hide all app UI elements when printing */
  .layout-wrapper,
  .v-application,
  .main-container,
  nav,
  .dx-widget,
  header,
  button {
    display: none !important;
  }

  /* Force visible the printable area */
  #printable-area {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    visibility: visible !important;
  }

  #printable-area * {
    visibility: visible !important;
  }
}
</style>
