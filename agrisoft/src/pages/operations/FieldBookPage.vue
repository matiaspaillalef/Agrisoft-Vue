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
        <router-link to="/operations/field-book/config"
          class="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-100">
          <AdjustmentsHorizontalIcon class="w-5 h-5" />
        </router-link>
        <button @click="openCreateModal()"
          class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs shadow-lg shadow-blue-200">
          <PlusIcon class="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
      <LoadingOverlay :show="loading" />
      <DxDataGrid :data-source="orders" :show-borders="false" :column-auto-width="true" class="premium-grid">
        <DxSearchPanel :visible="true" :width="240" placeholder="Buscar orden..." />
        <DxPaging :page-size="10" />

        <DxColumn data-field="order_number" caption="N° Orden" cell-template="orderNumTemplate" />
        <DxColumn data-field="issue_date" caption="Fecha" data-type="date" format="dd/MM/yyyy" />
        <DxColumn data-field="ground_name" caption="Campo" />
        <DxColumn data-field="specie_name" caption="Especie" />
        <DxColumn data-field="area_name" caption="Área" />
        <DxColumn data-field="task_name" caption="Tarea" />
        <DxColumn data-field="status" caption="Estado" cell-template="statusTemplate" :width="120" />
        <DxColumn caption="Acciones" cell-template="actionsTemplate" :width="140" h-alignment="center" />

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
            <button v-if="data.data.status === 'PENDING'" @click="openEditModal(data.data)"
              class="p-0! text-slate-800! bg-transparent! border-none w-fit!" title="Editar">
              <PencilSquareIcon class="w-4 h-4" />
            </button>

            <!-- Generar Orden (Tech/Admin) -->
            <button
              v-if="data.data.status === 'PENDING' && (canChangeResponsible || Number(data.data.responsible_id) === currentUserId)"
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
            <button v-if="['APPLIED', 'PARTIAL'].includes(data.data.status) && canChangeResponsible"
              @click="handleCloseOrder(data.data)" class="p-0! text-emerald-600! bg-transparent! border-none w-fit!"
              title="Validar y Cerrar">
              <ShieldCheckIcon class="w-4 h-4" />
            </button>

            <!-- Descargar Excel (Para cualquier orden generada) -->
            <button v-if="data.data.status !== 'PENDING'" @click="handleExportExcel(data.data)"
              class="p-0! text-emerald-600! bg-transparent! border-none w-fit!" title="Descargar Orden Excel">
              <ArrowDownTrayIcon class="w-4 h-4" />
            </button>

            <button v-if="data.data.status === 'PENDING' || canChangeResponsible" @click="handleDelete(data.data)"
              class="p-0! text-slate-400! hover:text-rose-600! bg-transparent! border-none w-fit!" title="Eliminar">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </DxDataGrid>
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
              <div class="flex items-center justify-between border-b border-slate-50 pb-4">
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Información Principal</span>
                <span :class="[
                  'px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border',
                  form.status === 'PENDING' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                    form.status === 'GENERATED' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                      form.status === 'PARTIAL' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                        form.status === 'APPLIED' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' :
                          'bg-emerald-100 text-emerald-600 border-emerald-200'
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
                <div class="col-span-full bg-slate-50 p-4 rounded-2xl">
                  <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 leading-none">
                    Observaciones
                    Fenológicas</p>
                  <p class="text-sm font-bold text-slate-600">"{{ form.phenological_stage || 'Sin observaciones' }}"</p>
                </div>
              </div>
            </div>

            <!-- Personal Card -->
            <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 flex flex-col">
              <div class="border-b border-slate-50 pb-4 flex items-center gap-2">
                <UsersIcon class="w-4 h-4 text-blue-500" />
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Responsable</span>
              </div>
              <div class="space-y-4 flex-1">
                <div class="group relative p-4 bg-slate-50 rounded-2xl transition-all border border-slate-50">
                  <div class="text-[8px] font-black text-slate-400 uppercase leading-none mb-1.5">Res. Técnico</div>
                  <div class="text-xs font-black text-slate-700">{{ form.responsible_name }}
                    {{ form.responsible_lastname }}
                  </div>
                </div>
                <div class="group relative p-4 bg-blue-50/50 rounded-2xl transition-all border border-blue-50">
                  <div class="text-[8px] font-black text-blue-400 uppercase leading-none mb-1.5">Aplicador</div>
                  <div class="text-xs font-black text-slate-700">{{ form.applicator_name }}
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
              </div>
              <div class="overflow-x-auto border border-slate-50 rounded-2xl">
                <table class="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr class="bg-slate-50/50">
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Insumo / Ingrediente</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Plan (L/Ha)</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Dosis 100L</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Reingreso</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Carencia (E/A)</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Intervalo</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Nº App</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Mezcla</th>
                      <th class="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Restante (L)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr v-for="(p, i) in form.products" :key="i" class="hover:bg-slate-50/30 transition-all">
                      <td class="p-4">
                        <p class="text-sm font-black text-slate-700 leading-none mb-1">{{ p.brand_name }}</p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase">{{ p.active_ingredient || 'Sin Ingrediente' }}</p>
                      </td>
                      <td class="p-4 text-center font-black text-blue-600">
                        <span class="px-3 py-1 bg-blue-50 rounded-lg text-sm">{{ p.dosage }}</span>
                      </td>
                      <td class="p-4 text-center text-xs font-bold text-slate-500">{{ p.dosage_100l || '-' }}</td>
                      <td class="p-4 text-center">
                        <span v-if="p.reentry_period" class="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black">
                          {{ p.reentry_period }} Hrs
                        </span>
                        <span v-else class="text-slate-300">-</span>
                      </td>
                      <td class="p-4 text-center text-[10px] font-black text-rose-500">
                        {{ p.withholding_label || '-' }} / {{ p.withholding_asoex || '-' }}
                      </td>
                      <td class="p-4 text-center text-xs font-bold text-slate-500">{{ p.app_interval || '-' }}</td>
                      <td class="p-4 text-center text-xs font-black text-slate-600">{{ p.season_app_number || '-' }}</td>
                      <td class="p-4 text-center">
                        <span :class="['text-[10px] font-black uppercase px-2 py-0.5 rounded-md', p.is_mix ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400']">
                          {{ p.is_mix ? 'SI' : 'NO' }}
                        </span>
                      </td>
                      <td class="p-4 text-center">
                        <span class="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-black">
                          {{ (parseFloat(p.dosage) - parseFloat(p.applied_quantity || 0)).toFixed(2) }}
                        </span>
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
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                <div v-for="(q, i) in form.quartersDetail" :key="i"
                  class="p-4 bg-slate-50 rounded-3xl flex flex-col items-center gap-1 border border-slate-100 shadow-sm hover:translate-y-[-2px] transition-all min-w-[120px]">
                  <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full mb-1"></div>
                  <p class="text-[11px] font-black text-slate-800">{{ q.quarter_number }}</p>
                  <p class="text-[8px] font-black text-blue-500 uppercase tracking-tight">
                    {{allVarieties.find(v => Number(v.id) === Number(q.id_variety))?.name || 'V. Genérica'}}
                  </p>
                  <p class="text-[8px] font-black text-slate-300 uppercase tracking-widest">{{ q.surface }} Ha</p>
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
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center justify-between">
                <span>Cuarteles Destino</span>
                <span class="text-[7px] text-indigo-400 normal-case font-bold bg-indigo-50 px-1.5 py-0.5 rounded-full">Sectores Validados</span>
              </label>
              <DxTagBox v-model:value="form.quarters" :data-source="filteredQuarters" display-expr="name"
                value-expr="id" class="premium-select shadow-sm" placeholder="Seleccionar..." />
              <p class="text-[8px] text-slate-400 font-medium italic mt-1 ml-1">
                * Mostrando solo cuarteles con atributos de sector definidos.
              </p>
            </div>
            <div v-else-if="form.id_ground" class="col-span-2 flex items-center bg-amber-50/50 p-3 rounded-2xl border border-amber-100 border-dashed">
              <p class="text-[9px] text-amber-600 font-black leading-tight uppercase tracking-wider">
                Sin sectores validados en este predio.<br/>
                <span class="text-[7px] font-bold text-slate-400">Verifica los atributos de sector.</span>
              </p>
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
            <!-- Se ocultan especie y variedad ya que ahora se derivan automáticamente de los sectores -->
            <div class="hidden">
              <DxSelectBox v-model:value="form.id_specie" :data-source="species" display-expr="name" value-expr="id" />
              <DxSelectBox v-model:value="form.id_variety" :data-source="filteredVarieties" display-expr="name"
                value-expr="id" />
            </div>
            <div class="col-span-3 space-y-1">
              <label class="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Est. Fenológico</label>
              <input v-model="form.phenological_stage" placeholder="..."
                class="w-full px-4 py-[11px] bg-slate-50 rounded-xl font-bold text-sm border-none shadow-sm outline-none focus:ring-1 focus:ring-blue-100" />
            </div>

            <div class="col-span-full border-b border-slate-50 pb-2 mt-4 flex items-center justify-between font-black">
              <span class="text-[10px] text-blue-600 uppercase tracking-[0.2em] leading-none">4. Receta e Insumos</span>
              <button @click="addProduct"
                class="text-[9px] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl uppercase tracking-widest hover:bg-blue-100 transition-all w-fit!">+
                Añadir</button>
            </div>

            <div v-for="(product, idx) in form.products" :key="idx"
              class="col-span-full relative grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/20 p-5 pt-10 rounded-3xl border border-slate-100 border-dashed">
              <!-- Trash button moved to top-right -->
              <button @click="removeProduct(idx)"
                class="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-none w-fit!">
                <TrashIcon class="w-4.5 h-4.5" />
              </button>

              <div class="col-span-2 space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Insumo (Nombre o Comp. Activo)</label>
                <DxSelectBox 
                  v-model:value="product.brand_name" 
                  :data-source="companyProducts" 
                  display-expr="name"
                  value-expr="name" 
                  :search-enabled="true" 
                  :search-expr="['name', 'active_ingredient']"
                  @on-value-changed="(e) => onProductNameChange(e, product)" 
                  class="premium-select"
                  item-template="productItem"
                >
                  <template #productItem="{ data }">
                    <div class="flex flex-col py-1">
                      <span class="font-bold text-slate-900 text-xs">{{ data.name }}</span>
                      <span class="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{{ data.active_ingredient || 'Sin Ing. Activo' }}</span>
                    </div>
                  </template>
                </DxSelectBox>
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Dosis L/Ha</label>
                <input v-model="product.dosage"
                  class="w-full px-4 py-[11px] bg-white rounded-xl font-bold text-sm border-none shadow-sm outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Agua L</label>
                <input v-model="product.water_volume"
                  class="w-full px-4 py-[11px] bg-white rounded-xl font-bold text-sm border-none shadow-sm outline-none" />
              </div>

              <div class="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-3 bg-white/50 rounded-2xl border border-slate-100">
                <div class="space-y-1">
                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reingreso (Hrs)</label>
                  <input v-model="product.reentry_period" placeholder="12"
                    class="w-full px-3 py-2 bg-white rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Carencia (Etiq | ASOEX)</label>
                  <div class="flex gap-1">
                    <input v-model="product.withholding_label" placeholder="7"
                      class="w-1/2 px-3 py-2 bg-white rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
                    <input v-model="product.withholding_asoex" placeholder="4"
                      class="w-1/2 px-3 py-2 bg-white rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Intervalo / Nº App</label>
                  <div class="flex gap-1">
                    <input v-model="product.app_interval" placeholder="20"
                      class="w-1/2 px-3 py-2 bg-white rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
                    <input v-model="product.season_app_number" placeholder="4"
                      class="w-1/2 px-3 py-2 bg-white rounded-xl font-bold text-xs border-none shadow-sm outline-none" />
                  </div>
                </div>
                <div class="col-span-full pt-2 flex items-center gap-4">
                   <div class="flex items-center gap-2">
                     <input type="checkbox" v-model="product.is_mix" class="w-4 h-4 rounded border-slate-200" />
                     <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">¿Es Mezcla?</span>
                   </div>
                </div>
              </div>
              <!--
              <div class="flex items-center justify-end">
                <button @click="removeProduct(idx)"
                  class="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-none w-fit!">
                  <TrashIcon class="w-4.5 h-4.5" />
                </button>
              </div>-->
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
                <span class="text-[10px] font-bold text-slate-400">Total Plan: {{ prod.dosage }} L/Ha</span>
              </div>
              <div class="flex items-center gap-4 mb-3">
                <div class="flex-1 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-center">
                  <p class="text-[8px] font-black uppercase tracking-widest">Ya Aplicado</p>
                  <p class="text-xs font-black">{{ prod.applied_quantity_accum || 0 }} L</p>
                </div>
                <div class="flex-1 p-2 bg-rose-50 text-rose-600 rounded-lg text-center">
                  <p class="text-[8px] font-black uppercase tracking-widest">Restante</p>
                  <p class="text-xs font-black">
                    {{ (parseFloat(prod.dosage) - parseFloat(prod.applied_quantity_accum || 0)).toFixed(2) }} L
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <input v-model="prod.applied_quantity" type="number" step="0.01"
                  :max="parseFloat(prod.dosage) - parseFloat(prod.applied_quantity_accum || 0)"
                  placeholder="Cantidad a aplicar ahora..."
                  class="flex-1 px-4 py-2 bg-white rounded-lg font-bold text-sm border-none shadow-sm outline-none focus:ring-1 focus:ring-indigo-100" />
                <span class="text-[11px] font-black text-slate-400 uppercase">Litros</span>
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
                <th class="p-2 border-r-2 border-slate-900">Dosis (L/Ha)</th>
                <th class="p-2 border-r-2 border-slate-900">Vol. Agua (L)</th>
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
  WrenchIcon, IdentificationIcon, PrinterIcon, ArrowDownTrayIcon
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
        const baseUrl = 'http://localhost:4000' // O la URL de tu backend
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

    const pHeaders = ['Nombre Comercial', 'Ing. Activo', 'Objetivo / Justificación', 'Dosis L/HA', 'Agua L', 'Dosis 100L', 'Reingreso', 'Carencia (E/A)', 'Intervalo', 'Nº App', 'Mix']
    worksheet.getCell('A' + currentRow).value = 'Nombre Comercial'
    worksheet.mergeCells(`B${currentRow}:C${currentRow}`)
    worksheet.getCell('B' + currentRow).value = 'Ing. Activo / Composición'
    worksheet.getCell('D' + currentRow).value = 'Objetivo / Justificación'
    worksheet.getCell('E' + currentRow).value = 'Dosis L/Ha'
    worksheet.getCell('F' + currentRow).value = 'Agua L'
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
import { DxDataGrid, DxColumn, DxPaging, DxSearchPanel } from 'devextreme-vue/data-grid'
import { DxPopup } from 'devextreme-vue/popup'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxTagBox } from 'devextreme-vue/tag-box'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import fieldBookService from '@/api/field-book.service.js'
import conexionApi from '@/services/conexionApi.js'

const loading = ref(false)
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
const filteredQuarters = ref([])
const allVarieties = ref([])
const filteredVarieties = ref([])
const sectorAttributes = ref([])

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
  products: [{ brand_name: '', dosage: '', water_volume: '' }]
})

onMounted(fetchData)

const displayFullName = (item) => {
  return item ? `${item.name} ${item.lastname}` : ''
}

async function fetchData() {
  loading.value = true
  try {
    const [ordersRes, usersRes, groundsRes, speciesRes, productsRes, areasRes, quartersRes, varietiesRes, attributesRes] = await Promise.all([
      fieldBookService.getOrders(companyId),
      conexionApi.get(`/configuracion/usuarios/${companyId}`),
      conexionApi.get(`/configuracion/production/getGround/${companyId}`),
      conexionApi.get(`/configuracion/production/getSpecies/${companyId}`),
      conexionApi.get(`/products/${companyId}`),
      fieldBookService.getAreas(companyId),
      conexionApi.get(`/configuracion/production/getSectorsBarracks/${companyId}`),
      conexionApi.get(`/configuracion/production/getVarieties/${companyId}`),
      conexionApi.get(`/configuracion/production/getAttributesSector/${companyId}`)
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
    status: 'PENDING',
    quarters: [], quartersDetail: [],
    products: [{ 
      brand_name: '', dosage: '', water_volume: '', 
      active_ingredient: '', composition: '', objective: '', justification: '',
      dosage_100l: '', is_mix: false, reentry_period: '',
      withholding_label: '', withholding_asoex: '',
      app_interval: '', season_app_number: ''
    }]
  }
}

function onProductNameChange(e, productRow) {
  if (!e.value) return
  const found = companyProducts.value.find(p => p.name === e.value)
  if (found) {
    productRow.brand_name = found.name
    productRow.active_ingredient = found.active_ingredient ?? ''
    productRow.composition = found.composition ?? ''
    productRow.objective = found.objective ?? ''
    productRow.justification = found.justification ?? ''
  }
}

function addProduct() {
  form.value.products.push({
    brand_name: '', dosage: '', water_volume: '',
    active_ingredient: '', composition: '',
    objective: '', justification: '',
    dosage_100l: '', is_mix: false, reentry_period: '',
    withholding_label: '', withholding_asoex: '',
    app_interval: '', season_app_number: ''
  })
}

function removeProduct(idx) {
  form.value.products.splice(idx, 1)
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
      const productsData = productsRaw.map(p => {
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
        return p
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
        products: productsData.length > 0 ? productsData : [{ brand_name: '', dosage: '', water_volume: '', active_ingredient: '', composition: '', objective: '', justification: '' }]
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

    const payload = {
      ...form.value,
      id_company: companyId,
      quarters: mappedQuarters,
      executor_id: form.value.applicator_id // Sync executor with applicator as they are the same
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
watch(() => form.value.id_ground, (newVal) => {
  filteredQuarters.value = allQuarters.value.filter(q => 
    Number(q.ground) === Number(newVal) &&
    sectorAttributes.value.some(attr => Number(attr.sector) === Number(q.id))
  )
})

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
  background-color: #f8fafc;
  color: #64748b !important;
  font-weight: 900 !important;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.1em;
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
