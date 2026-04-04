<template>
    <div class="page-wrapper">
        <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <UsersIcon class="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Trabajadores</h1>
                    <p class="text-slate-500 font-medium font-inter">Administración centralizada de personal y
                        asignaciones</p>
                </div>
            </div>
        </div>

        <!-- GRID CONTAINER -->
        <div
            class="custom-grid-container relative mt-[3px] flex w-full flex-grow flex-col items-center justify-start gap-2 rounded-3xl bg-white py-8 shadow-2xl px-2 md:px-10 mb-6 min-h-[600px] border border-gray-100 dark:bg-navy-800 dark:border-white/5">

            <!-- Header Actions Area -->
            <div class="flex w-full flex-wrap justify-between items-center mb-6 gap-4">
                <div class="flex items-center gap-3">
                    <button @click="addNewRecord"
                        class="flex items-center gap-2 px-6 py-3 bg-[#112D6E] text-white rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo trabajador
                    </button>
                </div>
            </div>

            <!-- (Contenido del DataGrid y Modales ya verificado anteriormente) -->
            <!-- ... -->


            <DxDataGrid :ref="el => gridRef = el" :data-source="dataSource" :show-borders="false"
                v-model:selected-row-keys="selectedRowKeys" class="custom-grid overflow-hidden w-full"
                :column-auto-width="true" @exporting="onExporting" :load-panel="{ enabled: false }"
                :allow-column-reordering="true" :allow-column-resizing="true" key-expr="id"
                @row-prepared="onRowPrepared" @selection-changed="onSelectionChanged">

                <DxExport :enabled="true" :allow-export-selected-data="false" />
                <DxSelection mode="multiple" show-check-boxes-mode="always" />

                <DxToolbar>
                    <DxToolbarItem location="before">
                        <button @click="showDeleteWristbandsModal = true"
                            class="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all duration-300 font-medium border border-rose-100 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ selectedRowKeys.length > 0 ? 'Eliminar pulseras seleccionadas' : 'Eliminar todas las pulseras' }}
                        </button>
                    </DxToolbarItem>
                    <DxToolbarItem location="before">
                        <button @click="showImportModal = true"
                            class="flex items-center gap-2 px-4 py-2 bg-[#112D6E] text-white rounded-xl hover:opacity-90 transition-all font-bold text-[11px] shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Importar trabajadores
                        </button>
                    </DxToolbarItem>
                    <DxToolbarItem name="exportButton" location="after" :visible="hasData" />
                    <DxToolbarItem name="searchPanel" location="after" />
                </DxToolbar>

                <DxFilterRow :visible="false" />
                <DxHeaderFilter :visible="true" :allow-search="true" />
                <DxScrolling mode="standard" />
                <DxPaging :enabled="true" :page-size="15" />
                <DxPager :show-page-size-selector="true" :allowed-page-sizes="[15, 30, 50]" :show-info="true" />

                <DxColumnFixing :enabled="true" />
                <DxSearchPanel :visible="true" placeholder="Buscar trabajador..." />

                <DxColumn data-field="rut" caption="RUT" alignment="left" cell-template="rutTemplate" />
                <DxColumn data-field="name" caption="Nombre" alignment="left" />
                <DxColumn data-field="lastname" caption="Apellido" alignment="left" />
                <DxColumn data-field="state" caption="Región" alignment="left" width="160">
                    <DxLookup :data-source="regionsCl" value-expr="id" display-expr="name" />
                </DxColumn>
                <DxColumn data-field="city" caption="Ciudad" alignment="left" />
                <DxColumn data-field="phone" caption="Teléfono" alignment="left" />
                <DxColumn data-field="status" caption="Estado" alignment="center" cell-template="statusTemplate"
                    width="120" />

                <!-- Hidden Columns for Export and Lookup -->
                <DxColumn data-field="id" :visible="false" :sort-index="0" sort-order="desc" />
                <DxColumn data-field="lastname2" :visible="false" />
                <DxColumn data-field="email" :visible="false" />
                <DxColumn data-field="position" :visible="false">
                    <DxLookup :data-source="positions" value-expr="id" display-expr="name" />
                </DxColumn>
                <DxColumn data-field="contractor" :visible="false">
                    <DxLookup :data-source="contractors" value-expr="id" display-expr="name" />
                </DxColumn>
                <DxColumn data-field="squad" :visible="false">
                    <DxLookup :data-source="squads" value-expr="id" display-expr="name" />
                </DxColumn>
                <DxColumn data-field="shift" :visible="false">
                    <DxLookup :data-source="shifts" value-expr="id" display-expr="name" />
                </DxColumn>

                <!-- Hidden Fields for Editing -->
                <DxColumn data-field="born_date" data-type="date" :visible="false" />
                <DxColumn data-field="gender" :visible="false" />
                <DxColumn data-field="state_civil" :visible="false" />
                <DxColumn data-field="address" :visible="false" />
                <DxColumn data-field="phone_company" :visible="false" />
                <DxColumn data-field="date_admission" data-type="date" :visible="false" />
                <DxColumn data-field="leader_squad" :visible="false" />
                <DxColumn data-field="is_weigher" :visible="false" />
                <DxColumn data-field="observation" :visible="false" />
                <DxColumn data-field="bank" :visible="false" />
                <DxColumn data-field="account_type" :visible="false" />
                <DxColumn data-field="account_number" :visible="false" />
                <DxColumn data-field="afp" :visible="false" />
                <DxColumn data-field="health" :visible="false" />
                <DxColumn data-field="wristband" :visible="false" />

                <template #rutTemplate="{ data }">
                    <div class="flex items-center gap-2">
                        <svg v-if="!data.value || data.value === '-'" xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span class="font-bold text-navy-800">{{ data.value || 'SIN RUT' }}</span>
                    </div>
                </template>

                <template #statusTemplate="{ data }">
                    <span :class="data.value === 1 ? 'bg-[#89D527] text-white' : 'bg-red-100 text-red-700'"
                        class="px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-center block shadow-sm">
                        {{ data.value === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                </template>

                <DxColumn type="buttons" width="140" caption="Acciones" alignment="center">
                    <DxButton icon="custom-view" hint="Ver detalle" @click="viewRecord" />
                    <DxButton name="edit" icon="edit" />
                    <DxButton name="delete" icon="trash" />
                </DxColumn>

                <DxEditing mode="popup" :allow-updating="true" :allow-deleting="true" :allow-adding="true"
                    :use-icons="true">
                    <DxPopup title="Ficha del Trabajador" :show-title="true" :width="1000" :height="800" />
                    <DxForm :col-count="2">
                        <DxGroupItem caption="Información Personal" :col-count="2" :col-span="2">
                            <DxItem data-field="rut">
                                <DxLabel text="RUT (con puntos y guión)" />
                                <DxRequiredRule message="El RUT es obligatorio" />
                            </DxItem>
                            <DxItem data-field="name">
                                <DxLabel text="Nombre" />
                                <DxRequiredRule message="El nombre es obligatorio" />
                            </DxItem>
                            <DxItem data-field="lastname">
                                <DxLabel text="Apellido Paterno" />
                                <DxRequiredRule message="El apellido es obligatorio" />
                            </DxItem>
                            <DxItem data-field="lastname2">
                                <DxLabel text="Apellido Materno" />
                            </DxItem>
                            <DxItem data-field="born_date" editor-type="dxDateBox"
                                :editor-options="{ type: 'date', displayFormat: 'dd-MM-yyyy', useMaskBehavior: true }">
                                <DxLabel text="Fecha de Nacimiento" />
                            </DxItem>
                            <DxItem data-field="gender" editor-type="dxSelectBox"
                                :editor-options="{ items: ['Masculino', 'Femenino', 'Otro'] }">
                                <DxLabel text="Género" />
                            </DxItem>
                            <DxItem data-field="state_civil" editor-type="dxSelectBox"
                                :editor-options="{ items: ['Soltero', 'Casado', 'Viudo', 'Divorciado'] }">
                                <DxLabel text="Estado Civil" />
                            </DxItem>
                        </DxGroupItem>

                        <DxGroupItem caption="Contacto y Ubicación" :col-count="2" :col-span="2">
                            <DxItem data-field="phone">
                                <DxLabel text="Teléfono" />
                            </DxItem>
                            <DxItem data-field="email">
                                <DxLabel text="Correo Electrónico" />
                            </DxItem>
                            <DxItem data-field="state" editor-type="dxSelectBox"
                                :editor-options="{ items: regionsCl, displayExpr: 'name', valueExpr: 'id', searchEnabled: true }">
                                <DxLabel text="Región" />
                            </DxItem>
                            <DxItem data-field="city">
                                <DxLabel text="Ciudad" />
                            </DxItem>
                            <DxItem data-field="address" :col-span="2">
                                <DxLabel text="Dirección" />
                            </DxItem>
                        </DxGroupItem>

                        <DxGroupItem caption="Información Laboral" :col-count="3" :col-span="2">
                            <DxItem data-field="date_admission" editor-type="dxDateBox"
                                :editor-options="{ type: 'date', displayFormat: 'dd-MM-yyyy', useMaskBehavior: true }">
                                <DxLabel text="Fecha de Ingreso" />
                            </DxItem>
                            <DxItem data-field="position" editor-type="dxSelectBox"
                                :editor-options="{ dataSource: positions, valueExpr: 'id', displayExpr: 'name', searchEnabled: true }">
                                <DxLabel text="Cargo" />
                            </DxItem>
                            <DxItem data-field="contractor" editor-type="dxSelectBox"
                                :editor-options="{ dataSource: contractors, valueExpr: 'id', displayExpr: 'name', searchEnabled: true }">
                                <DxLabel text="Contratista" />
                            </DxItem>
                            <DxItem data-field="squad" editor-type="dxSelectBox"
                                :editor-options="{ dataSource: squads, valueExpr: 'id', displayExpr: 'name', searchEnabled: true }">
                                <DxLabel text="Cuadrilla" />
                            </DxItem>
                            <DxItem data-field="shift" editor-type="dxSelectBox"
                                :editor-options="{ dataSource: shifts, valueExpr: 'id', displayExpr: 'name' }">
                                <DxLabel text="Turno" />
                            </DxItem>
                            <DxItem data-field="wristband">
                                <DxLabel text="N° Pulsera" />
                            </DxItem>
                            <DxItem data-field="status" editor-type="dxSelectBox"
                                :editor-options="{ items: [{ id: 1, name: 'Activo' }, { id: 0, name: 'Inactivo' }], valueExpr: 'id', displayExpr: 'name' }">
                                <DxLabel text="Estado" />
                            </DxItem>
                            <DxItem data-field="leader_squad" editor-type="dxCheckBox"
                                :editor-options="{ text: 'Es Jefe de Cuadrilla' }">
                                <DxLabel text="Jefe" location="left" />
                            </DxItem>
                            <DxItem data-field="is_weigher" editor-type="dxCheckBox"
                                :editor-options="{ text: 'Es Pesador' }">
                                <DxLabel text="Pesador" location="left" />
                            </DxItem>
                            <DxItem data-field="observation" :col-span="3" editor-type="dxTextArea"
                                :editor-options="{ height: 60 }">
                                <DxLabel text="Observaciones" />
                            </DxItem>
                        </DxGroupItem>

                        <DxGroupItem caption="Información Bancaria y Previsión" :col-count="2" :col-span="2">
                            <DxItem data-field="bank" editor-type="dxSelectBox"
                                :editor-options="{ items: dataBank, displayExpr: 'bank', valueExpr: 'bank', searchEnabled: true }">
                                <DxLabel text="Banco" />
                            </DxItem>
                            <DxItem data-field="account_type" editor-type="dxSelectBox"
                                :editor-options="{ items: dataAccountType, displayExpr: 'accountType', valueExpr: 'accountType' }">
                                <DxLabel text="Tipo de Cuenta" />
                            </DxItem>
                            <DxItem data-field="account_number">
                                <DxLabel text="Número de Cuenta" />
                            </DxItem>
                            <DxItem data-field="afp" editor-type="dxSelectBox"
                                :editor-options="{ items: dataAFP, displayExpr: 'afp', valueExpr: 'afp' }">
                                <DxLabel text="AFP" />
                            </DxItem>
                            <DxItem data-field="health" editor-type="dxSelectBox"
                                :editor-options="{ items: dataSalud, displayExpr: 'salud', valueExpr: 'salud' }">
                                <DxLabel text="Sistema de Salud (Fonasa/Isapre)" />
                            </DxItem>
                        </DxGroupItem>
                    </DxForm>
                </DxEditing>
            </DxDataGrid>

            <!-- View Detail Popup (Professional) -->
            <DxPopupWidget :visible="isViewPopupVisible" @hiding="isViewPopupVisible = false" :drag-enabled="false"
                :hide-on-outside-click="true" :show-title="false" :width="900" :height="700">
                <div class="view-details-container p-0 h-full flex flex-col bg-white overflow-hidden rounded-[32px]">
                    <!-- Interactive Header -->
                    <div
                        class="relative bg-gradient-to-br from-[#112D6E] to-[#1E4D8E] p-10 text-white shrink-0 shadow-2xl overflow-hidden group">
                        <div
                            class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:scale-110 transition-transform duration-1000">
                        </div>
                        <div
                            class="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl group-hover:bg-blue-400/20 transition-all duration-700">
                        </div>

                        <div class="relative flex items-center gap-10">
                            <div class="relative">
                                <div
                                    class="w-32 h-32 rounded-[40px] bg-white text-[#112D6E] flex items-center justify-center text-5xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-8 ring-white/10 group-hover:rotate-3 transition-transform duration-500">
                                    {{ String(viewRecordData.name || 'W').charAt(0) }}{{ String(viewRecordData.lastname || '').charAt(0) }}
                                </div>
                                <div class="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-125 transition-transform"
                                    v-if="viewRecordData.status === 1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center gap-4">
                                    <h2 class="text-4xl font-black tracking-tighter">{{ viewRecordData.name }}
                                        {{ viewRecordData.lastname }}
                                    </h2>
                                    <span v-if="viewRecordData.is_weigher"
                                        class="px-3 py-1 bg-yellow-400 text-black text-[9px] font-black uppercase rounded-lg tracking-widest flex items-center gap-1 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20"
                                            fill="currentColor">
                                            <path
                                                d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z" />
                                        </svg>
                                        PESADOR
                                    </span>
                                </div>
                                <div class="flex items-center gap-3 text-white/80 font-medium">
                                    <span
                                        class="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md border border-white/5">{{ viewRecordData.rut }}</span>
                                    <span class="text-xs opacity-50 font-black uppercase tracking-[0.2em] ml-2">ID:
                                        #{{ viewRecordData.id }}</span>
                                </div>
                            </div>
                        </div>

                        <button @click="isViewPopupVisible = false"
                            class="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white text-white hover:text-navy-900 rounded-2xl transition-all duration-300 backdrop-blur-md group w-fit!">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Detalle Sections -->
                    <div class="p-10 flex-grow grid grid-cols-2 gap-10 overflow-y-auto bg-gray-50/50">
                        <!-- Contact Column -->
                        <div class="space-y-6">
                            <div
                                class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                <h3
                                    class="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div class="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                                    Contacto y Residencia
                                </h3>
                                <div class="space-y-5">
                                    <div class="flex items-center gap-4 group">
                                        <div
                                            class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div class="flex flex-grow justify-between items-center">
                                            <div class="flex flex-col">
                                                <span
                                                    class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Teléfono</span>
                                                <span
                                                    class="text-sm font-bold text-navy-800">{{ viewRecordData.phone || 'No registrado' }}</span>
                                            </div>
                                            <div v-if="viewRecordData.phone" class="flex gap-2">
                                                <a :href="`tel:${viewRecordData.phone}`"
                                                    class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                    <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none"
                                                        stroke="currentColor" stroke-width="3">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </a>
                                                <a :href="`https://api.whatsapp.com/send?phone=${viewRecordData.phone}&text=Hola ${viewRecordData.name}, te contacto desde Agrisoft.`"
                                                    target="_blank"
                                                    class="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                                    <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                                                        <path
                                                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4 group">
                                        <div
                                            class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div class="flex flex-col">
                                            <span
                                                class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</span>
                                            <span
                                                class="text-sm font-bold text-navy-800">{{ viewRecordData.email || 'No registrado' }}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4 group">
                                        <div
                                            class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div class="flex flex-col">
                                            <span
                                                class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ubicación</span>
                                            <span class="text-sm font-bold text-navy-800">{{ viewRecordData.address }},
                                                {{ viewRecordData.city }}, {{ viewRecordData.state }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <h3
                                    class="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div class="w-1.5 h-4 bg-emerald-600 rounded-full"></div>
                                    Finanzas y Previsión
                                </h3>
                                <div class="grid grid-cols-2 gap-y-6">
                                    <div class="flex flex-col">
                                        <span
                                            class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Banco
                                            /
                                            Cuenta</span>
                                        <span
                                            class="text-xs font-bold text-navy-800">{{ viewRecordData.bank || '-' }}</span>
                                        <span
                                            class="text-[10px] text-gray-500">{{ viewRecordData.account_number || '-' }}</span>
                                    </div>
                                    <div class="flex flex-col">
                                        <span
                                            class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Previsión
                                            /
                                            Salud</span>
                                        <span class="text-xs font-bold text-navy-800">{{ viewRecordData.afp }}</span>
                                        <span class="text-[10px] text-gray-500">{{ viewRecordData.health }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Work Column -->
                        <div class="space-y-6">
                            <div
                                class="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm h-full relative overflow-hidden">
                                <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-gray-50 rounded-full blur-2xl">
                                </div>
                                <h3
                                    class="text-[11px] font-black text-[#112D6E] uppercase tracking-widest mb-8 flex items-center gap-3">
                                    <div class="w-1.5 h-4 bg-[#112D6E] rounded-full"></div>
                                    Información de Operación
                                </h3>

                                <div class="flex flex-col gap-8 relative">
                                    <div class="flex items-start gap-4">
                                        <div class="w-1.5 h-full absolute left-4 top-2 bg-gray-50 rounded-full"></div>
                                        <div
                                            class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] relative z-10">
                                            1</div>
                                        <div class="flex flex-col">
                                            <span
                                                class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo
                                                y
                                                Empresa</span>
                                            <span
                                                class="text-lg font-black text-navy-900 tracking-tight">{{ getPositionName(viewRecordData.position) }}</span>
                                            <span
                                                class="text-sm font-medium text-blue-600">{{ getContractorName(viewRecordData.contractor) }}</span>
                                        </div>
                                    </div>

                                    <div class="flex items-start gap-4">
                                        <div
                                            class="w-8 h-8 rounded-full bg-[#112D6E] text-white flex items-center justify-center font-black text-[10px] relative z-10">
                                            2</div>
                                        <div class="flex flex-col">
                                            <span
                                                class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asignación</span>
                                            <span
                                                class="text-base font-bold text-navy-800">{{ getSquadName(viewRecordData.squad) || 'Sin Cuadrilla' }}</span>
                                            <div class="mt-2 flex gap-2">
                                                <span
                                                    class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg uppercase uppercase">{{ getShiftName(viewRecordData.shift) }}</span>
                                                <span
                                                    class="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black rounded-lg uppercase"
                                                    v-if="viewRecordData.leader_squad">JEFE CUADRILLA</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex items-start gap-4">
                                        <div
                                            class="w-8 h-8 rounded-full bg-[#112D6E] text-white flex items-center justify-center font-black text-[10px] relative z-10">
                                            3</div>
                                        <div class="flex flex-col">
                                            <span
                                                class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credencial</span>
                                            <div class="flex items-center gap-3 mt-1">
                                                <div
                                                    class="px-4 py-2 bg-navy-50 rounded-xl border-2 border-dashed border-navy-200 flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        class="h-4 w-4 text-navy-700" fill="none" viewBox="0 0 24 24"
                                                        stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2.5"
                                                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                    <span
                                                        class="text-lg font-black font-mono text-[#112D6E]">{{ viewRecordData.wristband || '000000' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DxPopupWidget>

            <!-- Delete Wristbands Modal -->
            <DxPopupWidget v-model:visible="showDeleteWristbandsModal" :drag-enabled="false"
                :hide-on-outside-click="true" :show-title="false" :width="450" :height="280">
                <div
                    class="bg-[#FF4D4D] text-white p-8 h-full flex flex-col items-center justify-between text-center relative rounded-[32px] overflow-hidden shadow-2xl">
                    <button @click="showDeleteWristbandsModal = false"
                        class="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg text-white border-2 border-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div class="flex flex-col items-center gap-4">
                        <div class="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 class="text-3xl font-black tracking-tight">Eliminación de pulseras</h2>
                        </div>
                        <p class="text-sm font-medium leading-relaxed opacity-90">
                            {{ selectedRowKeys.length > 0 ? `¿Estás seguro de eliminar las pulseras de los ${selectedRowKeys.length} trabajadores seleccionados?` : '¿Estás seguro de eliminar todas las pulseras de la empresa?' }}
                        </p>
                    </div>

                    <button @click="confirmDeleteWristbands"
                        class="mt-4 w-full py-4 bg-[#112D6E] text-white rounded-2xl font-black text-lg hover:bg-navy-900 transition-all flex items-center justify-center gap-3 shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                        </svg>
                        Continuar
                    </button>
                </div>
            </DxPopupWidget>

            <!-- Import Workers Modal -->
            <DxPopupWidget v-model:visible="showImportModal" :drag-enabled="false" :hide-on-outside-click="true"
                :show-title="false" :width="500" :height="400">
                <div class="bg-white p-10 h-full flex flex-col items-center justify-between text-center relative">
                    <button @click="showImportModal = false"
                        class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div class="flex flex-col items-center gap-6">
                        <h2 class="text-3xl font-black text-navy-900 tracking-tight">Importar trabajadores</h2>
                        <p class="text-gray-500 text-sm leading-relaxed px-4">
                            Recuerda que si ya existe el trabajador por RUT, no se creará nuevamente.
                            Descarga el excel de ejemplo para subir los trabajadores <button @click="downloadTemplate"
                                class="text-blue-500 font-bold underline">aquí</button>
                        </p>

                        <div class="w-full">
                            <label class="block w-full cursor-pointer group">
                                <div
                                    class="border-2 border-dashed border-gray-200 rounded-[32px] p-8 flex flex-col items-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="h-12 w-12 text-gray-300 group-hover:text-blue-500 transition-colors mb-3"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span
                                        class="text-blue-900 font-bold underline decoration-2 underline-offset-4">Seleccionar
                                        archivo</span>
                                    <input type="file" @change="handleFileUpload" class="hidden" accept=".xlsx, .xls">
                                </div>
                            </label>
                            <div v-if="selectedFile"
                                class="mt-4 flex items-center justify-center gap-2 text-green-600 font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ selectedFile.name }}
                            </div>
                        </div>
                    </div>

                    <button @click="uploadFile" :disabled="!selectedFile"
                        class="w-full py-4 bg-[#89D527] text-white rounded-2xl font-black text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Subir archivo
                    </button>
                </div>
            </DxPopupWidget>

            <!-- Loading Overlay -->
            <LoadingOverlay :show="loading" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { UsersIcon } from '@heroicons/vue/24/solid'
import CustomStore from 'devextreme/data/custom_store'
import {
    DxDataGrid, DxColumn, DxEditing, DxPopup, DxForm, DxPaging, DxScrolling,
    DxColumnFixing, DxSearchPanel, DxHeaderFilter, DxExport, DxPager, DxToolbar, DxItem as DxToolbarItem,
    DxButton, DxFilterRow, DxLookup, DxSelection
} from 'devextreme-vue/data-grid'
import { DxPopup as DxPopupWidget } from 'devextreme-vue/popup'
import { DxItem, DxGroupItem, DxLabel, DxRequiredRule } from 'devextreme-vue/form'
import conexionApi from '@/services/conexionApi.js'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import notify from 'devextreme/ui/notify'
import { confirm } from 'devextreme/ui/dialog'

const loading = ref(false)
const gridRef = ref(null)
const selectedRowKeys = ref([])
const hasData = ref(false)
const companyID = Number(localStorage.getItem('userIdCompany')) || 0

// Lookups Data
const positions = ref([])
const contractors = ref([])
const squads = ref([])
const shifts = ref([])

// Business Data Constants
const dataAFP = [
    { afp: 'AFP Uno' }, { afp: 'Capital' }, { afp: 'Cuprum' },
    { afp: 'Habitat' }, { afp: 'Modelo' }, { afp: 'Planvital' },
    { afp: 'Provida' }
]
const dataSalud = [
    { salud: 'Fonasa' }, { salud: 'Banmédica' }, { salud: 'Colmena' },
    { salud: 'Consalud' }, { salud: 'CruzBlanca' }, { salud: 'Nueva Masvida' },
    { salud: 'Vida Tres' }, { salud: 'Esencial' }
]
const dataBank = [
    { bank: 'Banco Estado' }, { bank: 'Banco de Chile' }, { bank: 'BCI' },
    { bank: 'Santander' }, { bank: 'Scotiabank' }, { bank: 'Itaú' },
    { bank: 'Banco Falabella' }, { bank: 'Banco Ripley' }, { bank: 'Banco Security' },
    { bank: 'Banco Bice' }, { bank: 'Banco Internacional' }, { bank: 'Banco Consorcio' }
]
const dataAccountType = [
    { accountType: 'Cuenta RUT' }, { accountType: 'Cuenta Vista' },
    { accountType: 'Cuenta Corriente' }, { accountType: 'Cuenta de Ahorro' }
]
const regionsCl = [
    { id: 'XV', name: 'Arica y Parinacota' },
    { id: 'I', name: 'Tarapacá' },
    { id: 'II', name: 'Antofagasta' },
    { id: 'III', name: 'Atacama' },
    { id: 'IV', name: 'Coquimbo' },
    { id: 'V', name: 'Valparaíso' },
    { id: 'RM', name: 'Metropolitana de Santiago' },
    { id: 'VI', name: "Libertador Gral. Bernardo O'Higgins" },
    { id: 'VII', name: 'Maule' },
    { id: 'XVI', name: 'Ñuble' },
    { id: 'VIII', name: 'Biobío' },
    { id: 'IX', name: 'La Araucanía' },
    { id: 'XIV', name: 'Los Ríos' },
    { id: 'X', name: 'Los Lagos' },
    { id: 'XI', name: 'Aysén del Gral. Carlos Ibáñez del Campo' },
    { id: 'XII', name: 'Magallanes y de la Antártica Chilena' }
]

// Modals State
const showImportModal = ref(false)
const showDeleteWristbandsModal = ref(false)
const selectedFile = ref(null)

const isViewPopupVisible = ref(false)
const viewRecordData = ref({})

onMounted(async () => {
    fetchLookups()
})

const fetchLookups = async () => {
    try {
        const [posRes, contRes, squadRes, shiftRes] = await Promise.all([
            conexionApi.get(`/management-people/positions/getPositions/${companyID}`),
            conexionApi.get(`/management-people/contractors/getContractors/${companyID}`),
            conexionApi.get(`/management-people/squads/getSquads/${companyID}`),
            conexionApi.get(`/management-people/shifts/getShifts/${companyID}`)
        ])
        positions.value = posRes.data.positions || []
        contractors.value = contRes.data.contractors || []
        squads.value = squadRes.data.squads || []
        shifts.value = shiftRes.data.shifts || []
    } catch (e) {
        console.error('Error fetching lookups', e)
    }
}

const getPositionName = (id) => positions.value.find(p => p.id === id)?.name || '-'
const getContractorName = (id) => contractors.value.find(c => c.id === id)?.name || '-'
const getSquadName = (id) => squads.value.find(s => s.id === id)?.name || '-'
const getShiftName = (id) => shifts.value.find(s => s.id === id)?.name || '-'

const onExporting = (e) => {
    loading.value = true;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Trabajadores');

    const columns = [
        { header: 'Rut', key: 'rut_num', width: 15 },
        { header: 'Dv', key: 'dv', width: 5 },
        { header: 'Nombre', key: 'name', width: 25 },
        { header: 'Apellido Paterno', key: 'lastname', width: 25 },
        { header: 'Apellido Materno', key: 'lastname2', width: 25 },
        { header: 'Estado', key: 'status_text', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'phone', width: 15 },
        { header: 'Fecha de Nacimiento', key: 'born_date', width: 20 },
        { header: 'Género', key: 'gender', width: 15 },
        { header: 'Estado Civil', key: 'state_civil', width: 15 },
        { header: 'Región', key: 'state', width: 20 },
        { header: 'Ciudad', key: 'city', width: 20 },
        { header: 'Dirección', key: 'address', width: 35 },
        { header: 'Teléfono Empresa', key: 'phone_company', width: 20 },
        { header: 'Fecha de Ingreso', key: 'date_admission', width: 20 },
        { header: 'Cargo', key: 'position_name', width: 20 },
        { header: 'Contratista', key: 'contractor_name', width: 25 },
        { header: 'Cuadrilla', key: 'squad_name', width: 25 },
        { header: 'Turno', key: 'shift_name', width: 15 },
        { header: 'N° Pulsera', key: 'wristband', width: 15 },
        { header: 'Es Jefe de Cuadrilla', key: 'leader_squad', width: 20 },
        { header: 'Es Pesador', key: 'is_weigher', width: 15 },
        { header: 'Observación', key: 'observation', width: 30 },
        { header: 'Banco', key: 'bank', width: 20 },
        { header: 'Tipo de Cuenta', key: 'account_type', width: 20 },
        { header: 'Número de Cuenta', key: 'account_number', width: 25 },
        { header: 'AFP', key: 'afp', width: 15 },
        { header: 'Salud', key: 'health', width: 15 }
    ];

    worksheet.columns = columns;

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF112D6E' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    const rows = e.component.getVisibleRows();
    rows.forEach(row => {
        if (row.rowType === 'data') {
            const data = row.data;
            let rutNum = '';
            let dv = '';
            if (data.rut && data.rut.includes('-')) {
                const parts = data.rut.split('-');
                rutNum = parts[0].replace(/\./g, '');
                dv = parts[1];
            } else if (data.rut) {
                rutNum = data.rut.slice(0, -1).replace(/\./g, '');
                dv = data.rut.slice(-1);
            }

            const formatDateExcel = (val) => {
                if (!val) return '';
                const s = String(val).slice(0, 10);
                if (s.includes('-')) {
                    const parts = s.split('-');
                    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                return s;
            };

            worksheet.addRow({
                ...data,
                rut_num: rutNum,
                dv: dv,
                status_text: data.status === 1 ? 'ACTIVO' : 'INACTIVO',
                born_date: formatDateExcel(data.born_date),
                date_admission: formatDateExcel(data.date_admission),
                position_name: positions.value.find(p => p.id === data.position)?.name || '',
                contractor_name: contractors.value.find(c => c.id === data.contractor)?.name || '',
                squad_name: squads.value.find(s => s.id === data.squad)?.name || '',
                shift_name: shifts.value.find(s => s.id === data.shift)?.name || '',
                leader_squad: data.leader_squad ? 'SI' : 'NO',
                is_weigher: data.is_weigher ? 'SI' : 'NO'
            });
        }
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Listado_Trabajadores_${new Date().toISOString().slice(0, 10)}.xlsx`);
        loading.value = false;
    }).catch(err => {
        console.error('Error al exportar:', err);
        loading.value = false;
    });
};

const onRowPrepared = (e) => {
    if (e.rowType === 'data') {
        if (!e.data.rut || e.data.rut === '-') {
            e.rowElement.classList.add('warning-row')
        }
    }
}

const viewRecord = (e) => {
    viewRecordData.value = { ...e.row.data }
    isViewPopupVisible.value = true
}

const addNewRecord = () => {
    gridRef.value.instance.addRow()
}

const handleFileUpload = (e) => {
    selectedFile.value = e.target.files[0]
}

// ─── Helper: aplica validación de lista a un rango de celdas ──────────────────
// Usa definedName (rango con nombre) para evitar el bug de exceljs con
// referencias cross-sheet en dataValidation. Los rangos con nombre
// quedan embebidos en el .xlsx y Excel los resuelve correctamente.
const applyListValidation = (sheet, col, startRow, endRow, namedRange) => {
    for (let i = startRow; i <= endRow; i++) {
        sheet.getCell(`${col}${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            showErrorMessage: true,
            formulae: [namedRange]   // nombre definido, sin "=" ni comillas internas
        }
    }
}

const downloadTemplate = async () => {
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet('Trabajadores')
    const optionsSheet = workbook.addWorksheet('Opciones')

    // ── Cabeceras ─────────────────────────────────────────────────────────────
    const headers = [
        'Rut', 'Dv', 'Nombre', 'Apellido', 'Apellido materno',
        'Fecha de nacimiento (DD-MM-YYYY)', 'Género', 'Estado civil',
        'Región', 'Ciudad', 'Dirección', 'Teléfono', 'Correo',
        'Teléfono empresa', 'Fecha de ingreso (DD-MM-YYYY)', 'Cargo',
        'Contratista', 'Cuadrilla', 'Líder de Cuadrilla', 'Pesador', 'Turno',
        'Pulsera', 'Observación', 'Banco', 'Tipo de cuenta',
        'Número de cuenta', 'AFP', 'Salud'
    ]

    sheet.addRow(headers)

    // ── Estilo cabecera ───────────────────────────────────────────────────────
    const headerRow = sheet.getRow(1)
    headerRow.height = 35
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11, name: 'Segoe UI' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '112D6E' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'medium' }, right: { style: 'thin' }
        }
    })

    // ── Anchos de columna ─────────────────────────────────────────────────────
    sheet.columns = headers.map(() => ({ width: 25 }))
    sheet.getColumn(1).width = 15
    sheet.getColumn(2).width = 5
    sheet.getColumn(22).width = 40

    // ── Fijar primera fila ────────────────────────────────────────────────────
    sheet.views = [{ state: 'frozen', ySplit: 1 }]

    // ── Listas ────────────────────────────────────────────────────────────────
    const genderList = ['Masculino', 'Femenino', 'Otro']
    const civilList = ['Soltero', 'Casado', 'Viudo', 'Divorciado']
    const leaderList = ['Sí', 'No']
    const regionsList = regionsCl.map(r => r.name)
    const afpList = dataAFP.map(a => a.afp)
    const healthList = dataSalud.map(s => s.salud)
    const bankList = dataBank.map(b => b.bank)
    const accList = dataAccountType.map(a => a.accountType)
    const posList = positions.value.length ? positions.value.map(p => p.name) : ['General']
    const contList = contractors.value.length ? contractors.value.map(c => c.name) : ['Propio']
    const squadList = squads.value.length ? squads.value.map(s => s.name) : ['Cuadrilla 1']
    const shiftList = shifts.value.length ? shifts.value.map(s => s.name) : ['Día']

    // ── Poblar hoja Opciones (cada lista en su columna) ───────────────────────
    // Col A=1: Género | B=2: Estado Civil | C=3: Líder | D=4: AFP
    // E=5: Salud | F=6: Banco | G=7: Tipo cuenta | H=8: Cargo
    // I=9: Contratista | J=10: Cuadrilla | K=11: Turno | L=12: Región
    genderList.forEach((v, i) => optionsSheet.getCell(i + 1, 1).value = v)
    civilList.forEach((v, i) => optionsSheet.getCell(i + 1, 2).value = v)
    leaderList.forEach((v, i) => optionsSheet.getCell(i + 1, 3).value = v)
    afpList.forEach((v, i) => optionsSheet.getCell(i + 1, 4).value = v)
    healthList.forEach((v, i) => optionsSheet.getCell(i + 1, 5).value = v)
    bankList.forEach((v, i) => optionsSheet.getCell(i + 1, 6).value = v)
    accList.forEach((v, i) => optionsSheet.getCell(i + 1, 7).value = v)
    posList.forEach((v, i) => optionsSheet.getCell(i + 1, 8).value = v)
    contList.forEach((v, i) => optionsSheet.getCell(i + 1, 9).value = v)
    squadList.forEach((v, i) => optionsSheet.getCell(i + 1, 10).value = v)
    shiftList.forEach((v, i) => optionsSheet.getCell(i + 1, 11).value = v)
    regionsList.forEach((v, i) => optionsSheet.getCell(i + 1, 12).value = v)

    // ── Filas de ejemplo ──────────────────────────────────────────────────────
    sheet.addRow([
        '12345678', '9', 'Juan', 'Pérez', 'García', '15-05-1990',
        'Masculino', 'Soltero', 'Maule', 'Talca', 'Calle 1 #123',
        '+56911112222', 'juan@mail.com', '+56933334444', '01-01-2024',
        posList[0], contList[0], squadList[0], 'No', 'No', shiftList[0],
        '1001', 'Trabajador activo', bankList[0], accList[0],
        '123456789', afpList[0], healthList[0]
    ])
    sheet.addRow([
        '11222333', '4', 'María', 'González', 'López', '20-08-1988',
        'Femenino', 'Casado', 'Metropolitana de Santiago', 'Santiago',
        'Av. Providencia 456', '+56955556666', 'maria@mail.com', '',
        '15-02-2024', posList[0], contList[0], squadList[0], 'Sí', 'No', shiftList[0],
        '1002', '', bankList[1] || bankList[0], accList[1] || accList[0],
        '987654321', afpList[1] || afpList[0], healthList[1] || healthList[0]
    ])

    // ── Aplicar validaciones usando referencias directas dinámicas ────────────
    const START_ROW = 2
    const END_ROW = 500

    applyListValidation(sheet, 'G', START_ROW, END_ROW, `Opciones!$A$1:$A$${genderList.length}`)
    applyListValidation(sheet, 'H', START_ROW, END_ROW, `Opciones!$B$1:$B$${civilList.length}`)
    applyListValidation(sheet, 'I', START_ROW, END_ROW, `Opciones!$L$1:$L$${regionsList.length}`)
    applyListValidation(sheet, 'P', START_ROW, END_ROW, `Opciones!$H$1:$H$${posList.length}`)
    applyListValidation(sheet, 'Q', START_ROW, END_ROW, `Opciones!$I$1:$I$${contList.length}`)
    applyListValidation(sheet, 'R', START_ROW, END_ROW, `Opciones!$J$1:$J$${squadList.length}`)
    applyListValidation(sheet, 'S', START_ROW, END_ROW, `Opciones!$C$1:$C$${leaderList.length}`)
    applyListValidation(sheet, 'T', START_ROW, END_ROW, `Opciones!$C$1:$C$${leaderList.length}`) // Reutiliza SÍ/NO para Pesador
    applyListValidation(sheet, 'U', START_ROW, END_ROW, `Opciones!$K$1:$K$${shiftList.length}`)
    applyListValidation(sheet, 'X', START_ROW, END_ROW, `Opciones!$F$1:$F$${bankList.length}`)
    applyListValidation(sheet, 'Y', START_ROW, END_ROW, `Opciones!$G$1:$G$${accList.length}`)
    applyListValidation(sheet, 'AA', START_ROW, END_ROW, `Opciones!$D$1:$D$${afpList.length}`)
    applyListValidation(sheet, 'AB', START_ROW, END_ROW, `Opciones!$E$1:$E$${healthList.length}`)

    // ── Estilos de filas de datos ─────────────────────────────────────────────
    for (let i = START_ROW; i <= END_ROW; i++) {
        for (let col = 1; col <= 27; col++) {
            const cell = sheet.getCell(i, col)
            cell.border = { bottom: { style: 'hair' }, right: { style: 'hair' } }
            cell.font = { name: 'Segoe UI', size: 10 }
        }
    }

    // ── Exportar ──────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'Plantilla_Workers_Agrisoft.xlsx'
    )
}

const validateRut = (fullRut) => {
    if (!fullRut) return false
    let [rut, dv] = fullRut.replace(/\./g, '').split('-')
    if (!rut || !dv) return false
    let sum = 0
    let multiplier = 2
    for (let i = rut.length - 1; i >= 0; i--) {
        sum += rut[i] * multiplier
        multiplier = multiplier === 7 ? 2 : multiplier + 1
    }
    const expectedDv = 11 - (sum % 11)
    const dvCalc = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString()
    return dv.toUpperCase() === dvCalc
}

const uploadFile = async () => {
    if (!selectedFile.value) return
    loading.value = true
    try {
        const workbook = new Workbook()
        const buffer = await selectedFile.value.arrayBuffer()
        await workbook.xlsx.load(buffer)
        const worksheet = workbook.getWorksheet(1)
        const workers = []
        const errors = []

        const formatDate = (dateStr) => {
            if (!dateStr || dateStr === '-') return null
            const parts = dateStr.split('-')
            if (parts.length === 3) {
                // Asume DD-MM-YYYY -> YYYY-MM-DD
                return `${parts[2]}-${parts[1]}-${parts[0]}`
            }
            return dateStr
        }

        const findIdByName = (list, name) => {
            if (!name || !list) return null;
            const found = list.find(item => item.name && item.name.toLowerCase().trim() === name.toLowerCase().trim());
            return found ? found.id : null;
        }

        const getCellValue = (col) => {
            const cell = worksheet.getCell(col);
            if (cell.value instanceof Date) {
                const d = cell.value;
                return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
            }
            const val = cell.text ? cell.text.trim() : '';
            return val === '-' ? '' : val;
        }

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return
            const rutBody = row.getCell(1).text.replace(/\./g, '')
            const rutDv = row.getCell(2).text
            const rutFull = `${rutBody}-${rutDv}`

            if (!validateRut(rutFull)) {
                errors.push(`Fila ${rowNumber}: RUT inválido (${rutFull})`)
                return
            }

            const getRowCellValue = (col) => {
                const cell = row.getCell(col);
                if (cell.value instanceof Date) {
                    const d = cell.value;
                    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                }
                const val = cell.text ? cell.text.trim() : '';
                return val === '-' ? '' : val;
            }

            const rawGender = getRowCellValue(7);
            const gender = ['Masculino', 'Femenino', 'Otro'].find(g => g.toLowerCase() === rawGender.toLowerCase()) || rawGender;

            const rawCivil = getRowCellValue(8);
            const civil = ['Soltero', 'Casado', 'Viudo', 'Divorciado'].find(c => c.toLowerCase() === rawCivil.toLowerCase()) || rawCivil;

            const isSi = (val) => val && (val.toLowerCase().trim() === 'sí' || val.toLowerCase().trim() === 'si');

            workers.push({
                rut: rutFull,
                name: getRowCellValue(3),
                lastname: getRowCellValue(4),
                lastname2: getRowCellValue(5),
                born_date: formatDate(getRowCellValue(6)),
                gender: gender,
                state_civil: civil,
                state: regionsCl.find(r => r.name.toLowerCase().trim() === getRowCellValue(9).toLowerCase())?.id || null,
                city: getRowCellValue(10),
                address: getRowCellValue(11),
                phone: getRowCellValue(12),
                email: getRowCellValue(13),
                phone_company: getRowCellValue(14),
                date_admission: formatDate(getRowCellValue(15)),
                position: findIdByName(positions.value, getRowCellValue(16)),
                contractor: findIdByName(contractors.value, getRowCellValue(17)),
                squad: findIdByName(squads.value, getRowCellValue(18)),
                leader_squad: isSi(getRowCellValue(19)) ? 1 : 0,
                is_weigher: isSi(getRowCellValue(20)) ? 1 : 0,
                shift: findIdByName(shifts.value, getRowCellValue(21)),
                wristband: getRowCellValue(22) ? String(getRowCellValue(22)) : '',
                observation: getRowCellValue(23) ? String(getRowCellValue(23)) : '',
                bank: getRowCellValue(24),
                account_type: getRowCellValue(25),
                account_number: getRowCellValue(26),
                afp: getRowCellValue(27),
                health: getRowCellValue(28),
                company_id: companyID,
                status: 1
            })
        })

        if (errors.length > 0) {
            notify(`Errores en archivo: ${errors.slice(0, 3).join(', ')}...`, 'error', 5000)
            loading.value = false
            return
        }

        // 1. Obtener trabajadores actuales para saber quién existe
        const workersRes = await conexionApi.get(`/management-people/workers/getWorkers/${companyID}`)
        const currentWorkers = workersRes.data.workers || []

        // Función para limpiar RUT para comparación (quitar puntos, guiones y espacios)
        const cleanRutForCompare = (r) => r && typeof r === 'string' ? r.replace(/[.\-\s]/g, '').toUpperCase() : r

        // Mapa de RUTs existentes -> ID del trabajador
        const existingMap = new Map(currentWorkers.map(w => [cleanRutForCompare(w.rut), w.id]))

        let successCount = 0
        let updateCount = 0

        for (const worker of workers) {
            try {
                const cleanedWorkerRut = cleanRutForCompare(worker.rut)
                if (existingMap.has(cleanedWorkerRut)) {
                    // ACTUALIZAR (Ya existe)
                    const existingId = existingMap.get(cleanedWorkerRut)
                    await conexionApi.post('/management-people/workers/updateWorker', { ...worker, id: existingId })
                    updateCount++
                } else {
                    // CREAR (No existe)
                    await conexionApi.post('/management-people/workers/createWorker', worker)
                    successCount++
                }
            } catch (e) {
                console.error(`Error procesando trabajador ${worker.rut}`, e)
            }
        }

        notify(`Importación finalizada. Creados: ${successCount}. Actualizados: ${updateCount}.`, 'success', 5000)
        showImportModal.value = false
        selectedFile.value = null
        gridRef.value.instance.refresh()
    } catch (e) {
        console.error('Import error', e)
        notify('Error al procesar el archivo Excel', 'error', 3000)
    } finally {
        loading.value = false
    }
}

const confirmDeleteWristbands = async () => {
    loading.value = true
    try {
        if (selectedRowKeys.value.length > 0) {
            // Eliminar seleccionadas
            await conexionApi.post('/management-people/workers/deleteSelectedBands', {
                ids: selectedRowKeys.value,
                company_id: companyID
            })
            notify(`${selectedRowKeys.value.length} pulseras eliminadas`, 'success', 3000)
            selectedRowKeys.value = []
            gridRef.value.instance.clearSelection()
        } else {
            // Eliminar todas
            await conexionApi.post('/management-people/workers/deleteAllBand', { company_id: companyID })
            notify('Todas las pulseras eliminadas correctamente', 'success', 3000)
        }
        showDeleteWristbandsModal.value = false
        gridRef.value.instance.refresh()
    } catch (e) {
        notify('Error al eliminar pulseras', 'error', 3000)
    } finally {
        loading.value = false
    }
}

const syncUser = async (worker, isDelete = false) => {
    try {
        if (isDelete) {
            const userRes = await conexionApi.get('/configuracion/getUsers')
            const user = userRes.data.usuarios?.find(u => u.mail === worker.email)
            if (user) await conexionApi.post('/configuracion/deleteUser', { id: user.id })
        } else if (worker.is_weigher) {
            const cleanRut = worker.rut.replace(/[.\-]/g, '').replace(/[Kk]/, '0').slice(0, 9)
            await conexionApi.post('/configuracion/createUser', {
                name: worker.name,
                lastname: worker.lastname,
                mail: worker.email,
                id_rol: 6,
                password: cleanRut,
                id_state: 1,
                id_company: companyID
            })
        }
    } catch (e) { console.error('User sync error', e) }
}

const syncSquad = async (workerId, squadId, action = 'add') => {
    try {
        const endpoint = action === 'add'
            ? 'addWorkerToSquad'
            : action === 'delete'
                ? 'deleteWorkerFromSquad'
                : 'updateWorkerFromSquad'
        await conexionApi.post(`/management-people/squads/${endpoint}`, { id: workerId, squad: squadId })
    } catch (e) { console.error('Squad sync error', e) }
}

const dataSource = new CustomStore({
    key: 'id',
    load: async () => {
        loading.value = true
        try {
            const response = await conexionApi.get(`/management-people/workers/getWorkers/${companyID}`)
            const data = response.data.workers || []
            hasData.value = data.length > 0
            return data
        } finally {
            loading.value = false
        }
    },
    insert: async (values) => {
        loading.value = true
        try {
            const payload = {
                ...values,
                company_id: companyID,
                leader_squad: values.leader_squad ? 1 : 0,
                is_weigher: values.is_weigher ? 1 : 0,
                status: values.status ?? 1
            }
            const res = await conexionApi.post('/management-people/workers/createWorker', payload)
            if (res.data?.code === 'OK') {
                const newId = res.data.id
                await Promise.all([
                    syncUser({ ...payload, id: newId }),
                    syncSquad(newId, payload.squad, 'add')
                ])
            }
            return res.data
        } finally { loading.value = false }
    },
    update: async (key, values) => {
        loading.value = true
        try {
            const row = gridRef.value.instance.getVisibleRows().find(r => r.key === key)?.data || {}
            const payload = {
                ...row, ...values, id: key, company_id: companyID,
                leader_squad: (values.leader_squad !== undefined ? values.leader_squad : row.leader_squad) ? 1 : 0,
                is_weigher: (values.is_weigher !== undefined ? values.is_weigher : row.is_weigher) ? 1 : 0,
            }
            const res = await conexionApi.post('/management-people/workers/updateWorker', payload)

            if (res.data?.code === 'OK') {
                notify('Trabajador actualizado correctamente', 'success', 2000)
                await Promise.all([
                    syncUser(payload, !payload.is_weigher),
                    syncSquad(key, payload.squad, 'update')
                ])
                return payload
            } else {
                notify(`Error: ${res.data?.mensaje || 'No se pudo actualizar'}`, 'error', 4000)
                throw new Error(res.data?.mensaje)
            }
        } catch (e) {
            throw e
        } finally { loading.value = false }
    },
    remove: async (key) => {
        loading.value = true
        try {
            const row = gridRef.value.instance.getVisibleRows().find(r => r.key === key)?.data || {}
            const res = await conexionApi.post('/management-people/workers/deleteWorker', { id: key })
            if (res.data?.code === 'OK') {
                await Promise.all([
                    syncUser(row, true),
                    syncSquad(key, row.squad, 'delete')
                ])
            }
            return res.data
        } finally { loading.value = false }
    }
})
</script>

<style scoped>
:deep(.warning-row) {
    background-color: #FFFDE7 !important;
}

:deep(.warning-row:hover) {
    background-color: #FFF9C4 !important;
}
</style>