<template>
  <!-- Title -->
  <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
        <CubeIcon class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Productos</h1>
        <p class="text-slate-500 font-medium font-inter">Administración centralizada de productos, SKUs y stock global
        </p>
      </div>
    </div>

    <router-link to="/dashboard/operations/procurement/product-config"
      class="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-all flex items-center gap-3">
      <AdjustmentsHorizontalIcon class="w-5 h-5" />
      Configurar Categorías
    </router-link>
  </div>

  <!-- GRID -->
  <div class="mt-[3px] flex w-full flex-grow items-center justify-around gap-2 rounded-2xl
           bg-white py-6 shadow-xl px-2 md:px-10 max-w-full mx-auto relative overflow-hidden">
    <LoadingOverlay :show="loading" />
    <DxDataGrid ref="mainGridRef" :data-source="dataSource" key-expr="id" :show-borders="true" :column-auto-width="true"
      :width="'100%'" @editing-start="onEditingStart" @init-new-row="onInitNewRow" @saving="onSaving"
      @exporting="onExporting" @editor-preparing="onEditorPreparing" @row-removing="onRowRemoving">
      <DxExport :enabled="true" :allow-export-selected-data="false" />
      <!-- Panel adaptable -->
      <DxColumnChooser v-if="columnChooser" :enabled="true" mode="select" />
      <DxColumnFixing :enabled="true" />
      <DxHeaderFilter :visible="true" :allow-search="true" />
      <DxScrolling column-rendering-mode="virtual" />

      <DxPaging :page-size="15" />
      <DxSearchPanel :visible="true" placeholder="Filtrar registros..." />
      <DxToolbar>
        <DxToolbarItem v-if="canEdit" name="addRowButton" location="after" />
        <DxToolbarItem location="after">
          <DxButton icon="upload" hint="Carga Masiva" @click="showImportModal = true"
            class="!rounded-xl !bg-indigo-50 !text-indigo-600 hover:!bg-indigo-100 !border-none !h-[42px]" />
        </DxToolbarItem>
        <DxToolbarItem name="exportButton" location="after" />
        <DxToolbarItem name="searchPanel" location="after" />
      </DxToolbar>

      <DxColumn data-field="sku" caption="SKU" css-class="!text-left" />
      <DxColumn data-field="name" caption="Nombre" css-class="!text-left" :cell-template="'nameTemplate'" />
      <DxColumn data-field="active_ingredient" caption="Comp. Activo" css-class="!text-left" />
      <DxColumn data-field="composition" caption="Composición" css-class="!text-left" />
      <DxColumn data-field="objective" caption="Objetivo / Justificación" css-class="!text-left" />
      <DxColumn caption="Categorías"
        :calculate-cell-value="data => (data.category_links || []).map(cl => `${cl.category_name} > ${cl.subcategory_name}`).join(', ')"
        css-class="!text-left" />
      <DxColumn data-field="category_links" :visible="false" />
      <DxColumn data-field="description" caption="Descripción" css-class="!text-left" :visible="false" />
      <DxColumn caption="Stock global" :calculate-cell-value="calculateTotalStock" css-class="!text-left"
        :allow-editing="false" />
      <DxColumn data-field="status" caption="Estado" :cell-template="statusCellTemplate" css-class="!text-center" />
      <DxColumn data-field="is_global" :visible="false" />
      <DxColumn data-field="is_sag_authorized" :visible="false" />
      <DxColumn type="buttons" width="200" :buttons="customButtons" />

      <template #nameTemplate="{ data }">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-700">{{ data.value }}</span>
          <span v-if="data.data.is_sag_authorized" 
                class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-md uppercase tracking-tighter border border-emerald-200">
            Autorizado SAG
          </span>
          <span v-if="data.data.is_global" 
                class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-md uppercase tracking-tighter border border-indigo-200">
            Global
          </span>
        </div>
      </template>

      <DxEditing mode="popup" :allow-adding="true" :allow-updating="true" :allow-deleting="true" :use-icons="true"
        :texts="{
          confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?',
        }">
        <DxPopup title="Gestión de Productos" :show-title="true" :width="750" :height="480" />
        <DxForm :col-count="2" :label-location="'top'">
          <DxItem data-field="category_links" template="classification-template" :col-span="2" />

          <DxItem data-field="name" caption="Nombre del Producto" :editor-options="{ readOnly: !canEdit }" />
          <DxItem data-field="sku" caption="SKU / Código" :editor-options="{ readOnly: !canEdit }" />

          <DxItem data-field="active_ingredient" caption="Ingrediente Activo"
            :editor-options="{ readOnly: !canEdit }" />
          <DxItem data-field="composition" caption="Composición" :editor-options="{ readOnly: !canEdit }" />

          <DxItem data-field="objective" caption="Objetivo / Justificación del Uso" editor-type="dxTextArea"
            :col-span="2"
            :editor-options="{ height: 80, readOnly: !canEdit, placeholder: 'Describa el objetivo técnico o justificación para este producto...' }" />

          <DxItem data-field="description" caption="Descripción Adicional / Notas" editor-type="dxTextArea"
            :col-span="2"
            :editor-options="{ height: 80, readOnly: !canEdit, placeholder: 'Notas adicionales, recomendaciones de almacenamiento, etc.' }" />

          <DxItem data-field="status" caption="Estado" editor-type="dxSelectBox" :editor-options="{
            items: [{ id: 1, text: 'Activo' }, { id: 0, text: 'Inactivo' }],
            displayExpr: 'text',
            valueExpr: 'id'
          }" />

          <DxItem v-if="userRol === 1" data-field="is_global" caption="Producto Global" editor-type="dxCheckBox" />
          <DxItem v-if="userRol === 1" data-field="is_sag_authorized" caption="Autorizado por SAG" editor-type="dxCheckBox" />
          <DxItem data-field="__categoryDirty" :visible="false" />
          <DxItem data-field="__usersDirty" :visible="false" />
        </DxForm>
      </DxEditing>

      <template #classification-template="{ data, component }">
        <div class="p-6 bg-slate-50 dark:bg-navy-900/50 rounded-3xl border border-slate-100 dark:border-navy-800">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Clasificaciones
            (Categorías y Subcategorías)</label>

          <DxDropDownBox v-model:value="selectedSubcategoryIds" value-expr="id" display-expr="id"
            placeholder="Seleccione clasificaciones..." :show-clear-button="true" :data-source="classificationTree"
            class="premium-selectbox h-14 !rounded-2xl !border-slate-100 dark:!bg-navy-900"
            content-template="tree-template">
            <template #tree-template>
              <DxTreeView ref="treeViewRef" :data-source="classificationTree" :select-nodes-recursive="true"
                :select-by-click="true" show-check-boxes-mode="normal" data-structure="tree" display-expr="text"
                @selection-changed="(e) => onTreeViewSelectionChanged(e, component)"
                @content-ready="onTreeViewContentReady" class="p-4" />
            </template>
          </DxDropDownBox>

          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="id in selectedSubcategoryIds" :key="id"
              class="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
              {{ getSubcategoryName(id) }}
            </span>
          </div>
        </div>
      </template>


    </DxDataGrid>
  </div>

      <!-- MODAL CARGA MASIVA -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <div v-if="showImportModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div class="p-8">
              <div class="flex items-center gap-4 mb-8">
                <div class="p-4 bg-indigo-50 rounded-3xl text-indigo-600">
                  <CloudArrowUpIcon class="w-8 h-8" />
                </div>
                <div>
                  <h3 class="text-xl font-black text-slate-800">Carga Masiva</h3>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Importar Productos desde Excel</p>
                </div>
              </div>

              <div class="space-y-6">
                <!-- Paso 1: Descargar Plantilla -->
                <div class="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div class="flex items-start gap-4">
                    <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0">1</div>
                    <div class="flex-grow">
                      <p class="text-sm font-bold text-slate-700 mb-1">Descargar Plantilla</p>
                      <p class="text-xs text-slate-500 mb-4">Usa nuestro formato Excel para asegurar que los datos sean correctos.</p>
                      <button @click="downloadTemplate" class="w-full py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl text-xs font-black hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                        <ArrowDownTrayIcon class="w-4 h-4" />
                        DESCARGAR EXCEL
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Paso 2: Subir Archivo -->
                <div class="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div class="flex items-start gap-4">
                    <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0">2</div>
                    <div class="flex-grow">
                      <p class="text-sm font-bold text-slate-700 mb-1">Subir Archivo</p>
                      <p class="text-xs text-slate-500 mb-4">Selecciona el archivo Excel completado.</p>
                      
                      <div class="relative">
                        <input type="file" @change="handleFileUpload" accept=".xlsx" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div class="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                          <DocumentIcon class="w-4 h-4" />
                          {{ importFile ? importFile.name : 'SELECCIONAR ARCHIVO' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-10">
                <button @click="showImportModal = false" class="py-4 rounded-3xl text-sm font-black text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                  CANCELAR
                </button>
                <button @click="processImport" :disabled="isImporting || !importFile" class="py-4 bg-emerald-500 text-white rounded-3xl text-sm font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none uppercase tracking-widest">
                  {{ isImporting ? 'PROCESANDO...' : 'INICIAR CARGA' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

  <!-- Modal de solo lectura Modernizado -->
  <div v-if="showViewModal" class="fixed inset-0 flex items-center justify-center z-[100] px-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModals"></div>

    <div
      class="bg-white dark:bg-navy-700 rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden transform transition-all border border-slate-100">
      <!-- HEADER -->
      <div class="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <BeakerIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">Detalles del Producto</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ficha Técnica y Stock</p>
          </div>
        </div>
        <button @click="closeModals" class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 w-fit!">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- CONTENT -->
      <div class="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div class="grid grid-cols-2 gap-8">
          <!-- Info Al Principal -->
          <div class="col-span-full bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
            <h3 class="text-2xl font-black text-blue-900 mb-1">{{ selectedItem?.name }}</h3>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg tracking-wider uppercase">SKU:
                {{ selectedItem?.sku }}</span>
              <span
                class="px-3 py-1 bg-white text-blue-600 border border-blue-100 text-[10px] font-black rounded-lg tracking-wider uppercase">{{ calculateTotalStock(selectedItem) }}
                UNIDADES TOTAL</span>
              <span v-if="selectedItem?.is_sag_authorized" 
                class="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg tracking-wider uppercase flex items-center gap-1.5">
                <CheckBadgeIcon class="w-3 h-3" /> Autorizado SAG
              </span>
              <span v-if="selectedItem?.is_global" 
                class="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg tracking-wider uppercase flex items-center gap-1.5">
                <GlobeAltIcon class="w-3 h-3" /> Producto Global
              </span>
            </div>
          </div>

          <!-- Campos Técnicos -->
          <div class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ingrediente
                Activo</label>
              <div class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100/50">
                {{ selectedItem?.active_ingredient || 'No especificado' }}
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Composición</label>
              <div class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100/50">
                {{ selectedItem?.composition || 'N/A' }}
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proveedores</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <template v-if="selectedItem?.supplier_ids?.length">
                  <span v-for="sid in selectedItem.supplier_ids" :key="sid"
                    class="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                    {{allSuppliers.find(s => s.id === sid)?.name || 'Cargando...'}}
                  </span>
                </template>
                <span v-else
                  class="text-xs text-slate-400 italic px-4 py-3 bg-slate-50 rounded-2xl w-full border border-slate-100/50">Sin
                  proveedores vinculados</span>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo /
                Justificación</label>
              <div
                class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-700 border border-slate-100/50 italic text-sm">
                "{{ selectedItem?.objective || 'Sin objetivo definido' }}"
              </div>
            </div>
            <div class="col-span-full space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clasificaciones (Categorías y Subcategorías)</label>
              <div class="flex flex-wrap gap-2 mt-2">
                <template v-if="selectedItem?.category_links?.length">
                  <span v-for="(cl, idx) in selectedItem.category_links" :key="idx"
                    class="px-3 py-2 bg-blue-50/50 text-blue-700 border border-blue-100/50 rounded-xl text-[11px] font-bold">
                    {{ cl.category_name }} <span class="mx-1 opacity-40">/</span> {{ cl.subcategory_name }}
                  </span>
                </template>
                <div v-else class="px-4 py-3 bg-slate-50 rounded-2xl font-bold text-slate-400 border border-slate-100/50 text-xs italic">
                  Sin clasificaciones asignadas
                </div>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción
                General</label>
              <div
                class="px-4 py-3 bg-slate-50 rounded-2xl font-medium text-slate-500 border border-slate-100/50 text-sm">
                {{ selectedItem?.description || 'Sin comentarios adicionales.' }}
              </div>
            </div>
          </div>

          <!-- STOCK POR BODEGA -->
          <div class="col-span-full">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <IdentificationIcon class="w-4 h-4 text-emerald-600" />
              </div>
              <h4 class="text-xs font-black text-slate-700 uppercase tracking-widest">Disponibilidad por Bodega</h4>
            </div>

            <div v-if="selectedItem?.warehouses?.length"
              class="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
              <table class="min-w-full divide-y divide-slate-100">
                <thead class="bg-slate-50/80">
                  <tr>
                    <th class="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Bodega / Almacén</th>
                    <th class="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Stock Mín.</th>
                    <th class="px-6 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Stock Máx.</th>
                    <th class="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Stock Disponible</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="(product, index) in selectedItem?.warehouses" :key="index"
                    class="hover:bg-blue-50/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full"
                          :class="product.quantity > 0 ? 'bg-emerald-500' : 'bg-rose-400'"></div>
                        <span class="text-sm font-bold text-slate-700">{{ product.warehouse_name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-bold text-slate-500">
                        {{ product.min_stock ?? '—' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-xs font-bold text-slate-500">
                        {{ product.max_stock ?? '—' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="px-3 py-1 bg-slate-50 rounded-lg text-sm font-black"
                        :class="product.quantity > (product.min_stock || 0) ? 'text-emerald-700' : 'text-rose-500'">
                        {{ product.quantity }} <small
                          class="text-[10px] ml-1">{{ product.quantity === 1 ? 'UNIDAD' : 'UNIDADES' }}</small>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin stock en bodegas vinculadas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3 px-8">
        <button @click="closeModals"
          class="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          Cerrar Vista
        </button>
      </div>
    </div>
  </div>

  <!-- ===================== MODAL TRAZABILIDAD ===================== -->
  <div v-if="showTraceModal" class="fixed inset-0 flex items-center justify-center z-[110] px-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showTraceModal = false">
    </div>
    <div
      class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">

      <!-- HEADER -->
      <div class="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <MapPinIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">Trazabilidad del Producto</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              SKU: {{ selectedTraceProduct?.sku }} &nbsp;·&nbsp; {{ selectedTraceProduct?.name }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Excel -->
          <button @click="onTraceExportExcel"
            class="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5">
            <ArrowDownTrayIcon class="w-3.5 h-3.5" /> Excel
          </button>
          <!-- PDF -->
          <button @click="onTracePrintPDF"
            class="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5">
            <DocumentArrowDownIcon class="w-3.5 h-3.5" /> PDF
          </button>
          <button @click="showTraceModal = false"
            class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 w-fit!">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="flex items-center gap-8 px-8 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total movimientos</p>
          <p class="text-xl font-black text-slate-800">{{ traceMovements.length }}</p>
        </div>
        <div class="w-px h-8 bg-slate-100"></div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos</p>
          <p class="text-xl font-black text-emerald-600">
            {{traceMovements.filter(m => ['ingreso', 'ingreso_transito', 'recepcion_compra'].includes(m.movement_type)).length}}
          </p>
        </div>
        <div class="w-px h-8 bg-slate-100"></div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Egresos</p>
          <p class="text-xl font-black text-rose-600">
            {{traceMovements.filter(m => ['egreso', 'egreso_transito', 'rebaja', 'cancelacion'].includes(m.movement_type)).length}}
          </p>
        </div>
        <div class="w-px h-8 bg-slate-100"></div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Último movimiento</p>
          <p class="text-xs font-bold text-slate-600">{{ traceMovements[0]?.created_at_fmt || '—' }}</p>
        </div>
      </div>

      <!-- Grid -->
      <div class="p-6 flex-grow overflow-hidden relative">
        <LoadingOverlay :show="traceLoading" />

        <div v-if="!traceLoading && traceMovements.length === 0"
          class="flex flex-col items-center justify-center py-16 text-slate-400">
          <MapPinIcon class="w-12 h-12 mb-3 opacity-20" />
          <p class="text-sm font-bold uppercase tracking-widest">Sin movimientos registrados</p>
          <p class="text-xs mt-1 text-slate-300">Los movimientos se generan automáticamente con tránsitos y ajustes de
            stock</p>
        </div>

        <DxDataGrid v-else ref="traceGridRef" :data-source="traceMovements" key-expr="id" :show-borders="true"
          :column-auto-width="true" :width="'100%'" :height="380">
          <DxColumnFixing :enabled="true" />
          <DxScrolling column-rendering-mode="virtual" />
          <DxPaging :page-size="20" />
          <DxSearchPanel :visible="true" placeholder="Buscar movimiento..." />
          <DxToolbar>
            <DxToolbarItem name="searchPanel" location="after" />
          </DxToolbar>
          <DxColumn data-field="created_at_fmt" caption="Fecha / Hora" :width="150" css-class="!text-left" />
          <DxColumn data-field="movement_type" caption="Tipo" :width="170" :cell-template="traceBadgeTemplate"
            css-class="!text-left" />
          <DxColumn caption="Bodega / Ruta" :calculate-cell-value="traceRouteValue" css-class="!text-left" />
          <DxColumn data-field="quantity" caption="Cantidad" alignment="right" :width="90" />
          <DxColumn data-field="stock_before" caption="Stock antes" alignment="right" :width="100" />
          <DxColumn data-field="stock_after" caption="Stock después" alignment="right" :width="110" />
          <DxColumn data-field="user_name" caption="Responsable" css-class="!text-left" />
          <DxColumn data-field="reference_code" caption="Referencia" css-class="!text-left" :width="140" />
          <DxColumn data-field="notes" caption="Notas" css-class="!text-left" />
        </DxDataGrid>
      </div>

      <!-- FOOTER -->
      <div class="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3 px-8 flex-shrink-0">
        <button @click="showTraceModal = false"
          class="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- ===================== MODAL PROVEEDORES ===================== -->
  <div v-if="showSuppliersModal" class="fixed inset-0 flex items-center justify-center z-[110] px-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showSuppliersModal = false">
    </div>
    <div
      class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in duration-300">
      <div class="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
        <div class="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
          <BuildingOfficeIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">Vincular Proveedores</h2>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Producto: {{ selectedProductForSuppliers?.name }}
          </p>
        </div>
      </div>
      <div class="p-8 space-y-6">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Seleccione los
            proveedores asociados</label>
          <DxTagBox v-model:value="productSuppliers" :data-source="allSuppliers" display-expr="name" value-expr="id"
            placeholder="Seleccione uno o varios..." class="modern-tagbox" search-enabled="true" />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <button @click="showSuppliersModal = false"
            class="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
            Cancelar
          </button>
          <button @click="saveProductSuppliers"
            class="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  CubeIcon, BeakerIcon, XMarkIcon, IdentificationIcon, MapPinIcon,
  ArrowDownTrayIcon, DocumentArrowDownIcon, BuildingOfficeIcon, AdjustmentsHorizontalIcon,
  PlusIcon, TrashIcon, CheckBadgeIcon, GlobeAltIcon,
  CloudArrowUpIcon, DocumentIcon
} from '@heroicons/vue/24/solid'
import { DxTagBox } from 'devextreme-vue/tag-box'
import { DxSelectBox } from 'devextreme-vue/select-box'
import { DxButton } from 'devextreme-vue/button'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import CustomStore from 'devextreme/data/custom_store'

import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  DxPopup,
  DxForm,
  DxItem,
  DxSearchPanel,
  DxSelection,
  DxFilterRow,
  DxExport,
  DxColumnChooser,
  DxColumnFixing,
  DxScrolling,
  DxToolbar,
  DxItem as DxToolbarItem
} from 'devextreme-vue/data-grid'
import { DxDropDownBox } from 'devextreme-vue/drop-down-box'
import { DxTreeView } from 'devextreme-vue/tree-view'
import { exportDataGrid } from 'devextreme/excel_exporter'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { loadMessages, locale } from 'devextreme/localization'

import conexionApi from '@/services/conexionApi.js'
import productCategoriesService from '@/api/product-categories.service.js'
import { formatDate, formatDateHrs, statusCellTemplate } from '@/utils/herlpers'

/* ======================
   STATE
====================== */
const loading = ref(false)
const showImportModal = ref(false)
const importFile = ref(null)
const isImporting = ref(false)

const downloadTemplate = async () => {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Productos')

  const columns = [
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Nombre', key: 'name', width: 30 },
    { header: 'Categorización (Formato: Cat > Sub1, Sub2; Cat2 > Sub3)', key: 'categorization', width: 50 },
    { header: 'Componente Activo', key: 'active_ingredient', width: 20 },
    { header: 'Composición', key: 'composition', width: 20 },
    { header: 'Objetivo / Justificación', key: 'objective', width: 30 },
    { header: 'Descripción', key: 'description', width: 30 },
    { header: 'Estado (1=Activo, 0=Inactivo)', key: 'status', width: 20 },
  ]

  if (isSuperadmin) {
    columns.push({ header: 'Es Global (1=Si, 0=No)', key: 'is_global', width: 20 })
    columns.push({ header: 'Es autorizado por el SAG (1=Si, 0=No)', key: 'is_sag_authorized', width: 25 })
  }

  worksheet.columns = columns

  // Ejemplo
  const exampleRow = {
    sku: 'PROD-001',
    name: 'Producto Multi-Categoría',
    categorization: 'Fertilizantes > Foliar, Granular; Bioestimulantes > Raizal',
    active_ingredient: 'Nitrógeno',
    composition: '46%',
    objective: 'Nutrición completa',
    description: 'Ejemplo con formato simplificado de categorías',
    status: 1
  }
  if (isSuperadmin) {
    exampleRow.is_global = 1
    exampleRow.is_sag_authorized = 1
  }
  worksheet.addRow(exampleRow)

  // Estilo
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `Plantilla_Productos_${new Date().toLocaleDateString()}.xlsx`)
}

const handleFileUpload = (e) => {
  importFile.value = e.target.files[0]
}

const processImport = async () => {
  if (!importFile.value) return alert('Por favor seleccione un archivo')
  
  isImporting.value = true
  try {
    const workbook = new Workbook()
    await workbook.xlsx.load(importFile.value)
    const worksheet = workbook.worksheets[0]
    
    const products = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header
      
      const p = {
        sku: row.getCell(1).value?.toString(),
        name: row.getCell(2).value?.toString(),
        categorization: row.getCell(3).value?.toString(),
        active_ingredient: row.getCell(4).value?.toString(),
        composition: row.getCell(5).value?.toString(),
        objective: row.getCell(6).value?.toString(),
        description: row.getCell(7).value?.toString(),
        status: Number(row.getCell(8).value) === 0 ? 0 : 1,
      }
      
      if (isSuperadmin) {
        p.is_global = Number(row.getCell(9).value) === 1 ? 1 : 0
        p.is_sag_authorized = Number(row.getCell(10).value) === 1 ? 1 : 0
      }
      
      if (p.sku && p.name) {
        products.push(p)
      }
    })

    if (products.length === 0) throw new Error('No se encontraron productos válidos en el archivo')

    const { data } = await conexionApi.post('/products/bulk', {
      products,
      company_id: companyID
    })

    if (data.code === 'OK') {
      import('devextreme/ui/notify').then(notify => {
        notify.default(data.mensaje, 'success', 3000);
      });
      showImportModal.value = false
      mainGridRef.value?.instance.refresh()
    } else {
      throw new Error(data.mensaje)
    }
  } catch (err) {
    console.error('Error en carga masiva:', err)
    alert('Error al procesar el archivo: ' + err.message)
  } finally {
    isImporting.value = false
    importFile.value = null
  }
}
const stockModalVisible = ref(false)
const selectedProduct = ref(null)
const warehousesStock = ref([])
const mainGridRef = ref(null)

const companyID = Number(localStorage.getItem('userIdCompany')) || 0

const userRol = Number(localStorage.getItem('rol')) || 0
const isSuperadmin = Number(userRol) === 1
const canEdit = [1, 2, 8, 10].includes(userRol)

const showViewModal = ref(false)
const selectedItem = ref(null)

const categories = ref([])
const allSubcategories = ref([])
const selectedSubcategoryIds = ref([])
const originalSubcategoryIds = ref([])
const treeViewRef = ref(null)
const editingKey = ref(null)

const classificationTree = computed(() => {
  return categories.value.map(cat => ({
    id: `cat_${cat.id}`,
    text: cat.name,
    expanded: true,
    items: allSubcategories.value
      .filter(sub => sub.category_id === cat.id)
      .map(sub => ({
        id: sub.id,
        text: sub.name,
        category_id: cat.id
      }))
  }))
})

onMounted(async () => {
  const currentCompanyId = Number(localStorage.getItem('userIdCompany')) || 0
  try {
    // Cargar categorías principales (opcional, si se usara en otro lado)
    const catRes = await productCategoriesService.getCategories(currentCompanyId)
    categories.value = catRes.data.data || []

    // Cargar todas las subcategorías (plano para TagBox)
    const subRes = await productCategoriesService.getAllSubcategories(currentCompanyId)
    allSubcategories.value = (subRes.data.data || []).map(s => ({
      ...s,
      fullName: `${s.category_name} > ${s.name}`
    }))
  } catch (err) {
    console.error('Error loading classification data:', err)
  }
})

function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true

  // Asegurar que los proveedores estén cargados para el modal
  if (allSuppliers.value.length === 0) {
    loadAllSuppliers()
  }
}

function closeModals() {
  showViewModal.value = false
}

// Multi-Supplier Management
const showSuppliersModal = ref(false)
const selectedProductForSuppliers = ref(null)
const productSuppliers = ref([])
const allSuppliers = ref([])

async function openSuppliersModal(product) {
  selectedProductForSuppliers.value = product
  productSuppliers.value = []
  showSuppliersModal.value = true

  try {
    // Load all suppliers if not loaded
    if (allSuppliers.value.length === 0) {
      const { data: supData } = await conexionApi.get('/suppliers', {
        params: { company_id: companyID }
      })
      allSuppliers.value = supData.suppliers || []
    }

    // Load current product suppliers
    const { data: prodSupData } = await conexionApi.get(`/products/${product.id}/suppliers?companyID=${companyID}`)
    productSuppliers.value = prodSupData.suppliers || []
  } catch (err) {
    console.error('Error al cargar proveedores:', err)
  }
}

async function loadAllSuppliers() {
  try {
    const { data: supData } = await conexionApi.get('/suppliers', { params: { company_id: companyID } })
    allSuppliers.value = supData.suppliers || []
  } catch (err) {
    console.error('Error al cargar lista de proveedores:', err)
  }
}

async function saveProductSuppliers() {
  try {
    await conexionApi.post(`/products/${selectedProductForSuppliers.value.id}/suppliers`, {
      suppliers: productSuppliers.value,
      company_id: companyID
    })
    showSuppliersModal.value = false
    // Refresh the grid to show new supplier links in View modal
    mainGridRef.value?.instance.refresh()
    alert('Proveedores actualizados correctamente')
  } catch (err) {
    console.error('Error al guardar proveedores:', err)
    alert('Error al guardar proveedores')
  }
}

/* ======================
   DATA SOURCE PRODUCTS
====================== */
const dataSource = new CustomStore({
  key: 'id',
  load: async () => {
    loading.value = true
    try {
      const { data } = await conexionApi.get('/products/' + companyID)
      return (data.products || []).map(p => ({
        ...p,
        description: p.description ?? ''
      }))
    } finally {
      loading.value = false
    }
  }
})

/* ======================
   HELPERS
====================== */
const calculateTotalStock = (row) => {
  if (!Array.isArray(row.warehouses)) return 0
  return row.warehouses.reduce(
    (sum, w) => sum + Number(w.quantity || 0),
    0
  )
}

/* ======================
   OPEN MODAL
====================== */
const openStockModal = async (e) => {
  loading.value = true
  try {
    selectedProduct.value = e.row.data

    const { data } = await conexionApi.get(
      `/warehouses/getWarehouses/${companyID}`
    )

    warehousesStock.value = data.warehouses.map(w => {
      const existing = selectedProduct.value.warehouses
        .find(ws => ws.warehouse_id === w.id)

      return {
        warehouse_id: w.id,
        warehouse_name: w.name,
        quantity: existing?.quantity || 0,
        min_stock: existing?.min_stock || null,
        max_stock: existing?.max_stock || null
      }
    })

    stockModalVisible.value = true
  } finally {
    loading.value = false
  }
}

/* ======================
   SAVE STOCK
 ====================== */
const saveStock = async () => {
  loading.value = true
  try {
    for (const row of warehousesStock.value) {
      await conexionApi.post('/products/stock', {
        product_id: selectedProduct.value.id,
        warehouse_id: row.warehouse_id,
        company_id: companyID,
        quantity: row.quantity,
        min_stock: row.min_stock,
        max_stock: row.max_stock
      })
    }

    stockModalVisible.value = false
    mainGridRef.value?.instance.refresh()
  } finally {
    loading.value = false
  }
}

function onInitNewRow(e) {
  editingKey.value = null
  e.data.status = 1
  e.data.unit_of_measure = 'un'
  e.data.currency = 'CLP'
  e.data.is_global = 0
  e.data.is_sag_authorized = 0
  selectedSubcategoryIds.value = []
  originalSubcategoryIds.value = []
}

async function onEditingStart(e) {
  const product = e.data
  
  // Si el producto es global y el usuario no es superadmin, cancelar edición
  if (Number(product.is_global) === 1 && !isSuperadmin) {
    e.cancel = true
    import('devextreme/ui/notify').then(notify => {
      notify.default('Solo los Superadministradores pueden editar productos globales', 'warning', 3000)
    })
    return
  }

  editingKey.value = e.key
  // Inicializar clasificaciones del producto para el TreeView
  const ids = e.data.category_links ? e.data.category_links
    .filter(cl => cl.subcategory_id)
    .map(cl => cl.subcategory_id) : []

  selectedSubcategoryIds.value = [...ids]
  originalSubcategoryIds.value = [...ids]

  if (!product?.id) {
    warehousesStock.value = []
    return
  }

  const { data } = await conexionApi.get(
    `/warehouses/getWarehouses/${companyID}`
  )

  warehousesStock.value = data.warehouses.map(w => {
    const existing = product.warehouses?.find(
      pw => pw.warehouse_id === w.id
    )

    return {
      warehouse_id: w.id,
      warehouse_name: w.name,
      quantity: existing?.quantity ?? 0
    }
  })

  // Load all suppliers if not already loaded (for the View modal or separate modal)
  if (allSuppliers.value.length === 0) {
    await loadAllSuppliers()
  }
}

async function onEditorPreparing(e) {
  // Ya no necesitamos la lógica de cascada SelectBox porque usamos TagBox
}

const onSaving = async (e) => {

  const categoriesChanged = JSON.stringify(selectedSubcategoryIds.value) !== JSON.stringify(originalSubcategoryIds.value);

  if (!e.changes.length && !categoriesChanged) {
    //console.log('No changes detected anywhere');
    return;
  }

  if (e.changes.length === 0) return;

  e.cancel = true;

  const change = e.changes[0];
  const newData = { ...change.data };

  newData.category_links = selectedSubcategoryIds.value.map(sid => {
    const sub = allSubcategories.value.find(s => s.id === sid);
    return {
      category_id: sub?.category_id,
      subcategory_id: sid
    };
  }).filter(cl => cl.category_id);

  if (newData.is_global !== undefined) newData.is_global = newData.is_global ? 1 : 0;
  if (newData.is_sag_authorized !== undefined) newData.is_sag_authorized = newData.is_sag_authorized ? 1 : 0;

  try {
    if (change.type === 'insert') {
      await conexionApi.post('/products', {
        ...newData,
        company_id: companyID
      })
    }

    if (change.type === 'update') {
      await conexionApi.put(`/products/${change.key}`, newData)
    }

    if (change.type === 'remove') {
      await conexionApi.delete(`/products/${change.key}`)
    }

    // Notificar éxito
    import('devextreme/ui/notify').then(notify => {
      notify.default('Producto guardado correctamente', 'success', 2000);
    });
    // REFRESCAR GRILLA
    e.component.refresh();

  } catch (err) {
    console.error('Error saving product:', err);
    import('devextreme/ui/notify').then(notify => {
      notify.default('Error al guardar el producto: ' + err.message, 'error', 5000);
    });
  } finally {
    e.component.cancelEditData();
    e.component.refresh();
  }
}

function onRowRemoving(e) {
  if (Number(e.data.is_global) === 1 && !isSuperadmin) {
    e.cancel = true
    import('devextreme/ui/notify').then(notify => {
      notify.default('No tiene permisos para eliminar productos globales', 'error', 4000)
    })
  }
}


function traceBadgeTemplate(cellElement, cellInfo) {
  const meta = traceTypeMeta(cellInfo.value)
  cellElement.innerHTML = `
    <span class="inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${meta.cls}">
      ${meta.label}
    </span>`
}

function traceRouteValue(rowData) {
  const origin = rowData.origin_warehouse_name || ''
  const destiny = rowData.destiny_warehouse_name || ''
  if (origin && destiny) return `${origin} → ${destiny}`
  return origin || destiny || '—'
}

// --- Botones personalizados ---
const customButtons = computed(() => [
  {
    hint: 'Ver',
    icon: 'eye',
    onClick: (e) => verRegistro(e.row.data),
  },
  {
    hint: 'Proveedores',
    icon: 'user',
    cssClass: 'w-[25px]! h-[25px]! bg-indigo-100 text-indigo-600 rounded-full p-[4px]!',
    onClick: (e) => openSuppliersModal(e.row.data),
  },
  {
    hint: 'Trazabilidad',
    icon: 'map',
    cssClass: 'w-[25px]! h-[25px]! bg-emerald-100 text-emerald-600 rounded-full p-[4px]!',
    onClick: (e) => openTraceModal(e.row.data),
  },
  {
    name: 'edit',
    icon: 'edit',
    visible: (e) => {
      const currentRol = Number(localStorage.getItem('rol')) || 0;
      const currentCompany = Number(localStorage.getItem('userIdCompany')) || 0;
      const isSuper = currentRol === 1;
      const isGlobal = Number(e.row.data.is_global) === 1;
      
      if (isGlobal) return isSuper;
      // Para locales: solo si es de su empresa o es superadmin
      return isSuper || (Number(e.row.data.company_id) === currentCompany);
    }
  },
  {
    name: 'delete',
    icon: 'trash',
    visible: (e) => {
      const currentRol = Number(localStorage.getItem('rol')) || 0;
      const currentCompany = Number(localStorage.getItem('userIdCompany')) || 0;
      const isSuper = currentRol === 1;
      const isGlobal = Number(e.row.data.is_global) === 1;
      
      if (isGlobal) return isSuper;
      return isSuper || (Number(e.row.data.company_id) === currentCompany);
    }
  }
])

const onExporting = (e) => {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Productos')

  exportDataGrid({
    component: e.component,
    worksheet,
    autoFilterEnabled: true,
    customizeCell: ({ gridCell, excelCell }) => {
      // Mapeo automático de status en el excel
      if (gridCell.rowType === 'data' && gridCell.column.dataField === 'status') {
        excelCell.value = Number(gridCell.value) === 1 ? 'Activo' : 'Inactivo';
      }
    }
  }).then(() => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      // Nombre dinámico con fecha y hora
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.getHours().toString().padStart(2, '0') + '-' +
        now.getMinutes().toString().padStart(2, '0');

      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `productos_${dateStr}_${timeStr}.xlsx`);
    })
  })
}

/* ======================
   TRAZABILIDAD
====================== */
const showTraceModal = ref(false)
const traceLoading = ref(false)
const selectedTraceProduct = ref(null)
const traceMovements = ref([])
const traceGridRef = ref(null)

async function openTraceModal(data) {
  selectedTraceProduct.value = data
  showTraceModal.value = true
  traceLoading.value = true
  try {
    const { data: res } = await conexionApi.get(
      `/products/${data.id}/movements?companyID=${companyID}`
    )
    traceMovements.value = (res.movements || []).map(m => ({
      ...m,
      created_at_fmt: new Date(m.created_at).toLocaleString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }))
  } catch (e) {
    console.error(e)
    traceMovements.value = []
  } finally {
    traceLoading.value = false
  }
}

function traceTypeMeta(type) {
  const map = {
    ingreso: { label: 'Ingreso manual', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '+' },
    egreso: { label: 'Egreso manual', cls: 'bg-red-100    text-red-700    border-red-200', icon: '-' },
    ajuste: { label: 'Ajuste inventario', cls: 'bg-sky-100    text-sky-700    border-sky-200', icon: '≈' },
    rebaja: { label: 'Rebaja / consumo', cls: 'bg-orange-100 text-orange-700 border-orange-200', icon: '↓' },
    egreso_transito: { label: 'Salida tránsito', cls: 'bg-violet-100 text-violet-700 border-violet-200', icon: '→' },
    ingreso_transito: { label: 'Entrada tránsito', cls: 'bg-teal-100   text-teal-700   border-teal-200', icon: '←' },
    cancelacion: { label: 'Cancelación', cls: 'bg-rose-100   text-rose-700   border-rose-200', icon: '✕' },
    recepcion_compra: { label: 'Recepción de compra', cls: 'bg-blue-100   text-blue-700   border-blue-200', icon: '📦' },
  }
  return map[type] || { label: type, cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: '·' }
}

function onTraceExportExcel() {
  const { exportDataGrid } = window.__dx_excel_exporter || {}
  if (!traceGridRef.value) return
  import('devextreme/excel_exporter').then(({ exportDataGrid: exportFn }) => {
    import('exceljs').then(({ Workbook }) => {
      import('file-saver').then(({ saveAs }) => {
        const workbook = new Workbook()
        const ws = workbook.addWorksheet('Trazabilidad')
        exportFn({
          component: traceGridRef.value.instance,
          worksheet: ws,
          autoFilterEnabled: true,
          customizeCell: ({ gridCell, excelCell }) => {
            if (gridCell.rowType === 'header') {
              excelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
              excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
            }
          }
        }).then(() => {
          workbook.xlsx.writeBuffer().then(buffer => {
            const date = new Date().toISOString().split('T')[0]
            const sku = (selectedTraceProduct.value?.sku || 'producto').replace(/\s+/g, '_').toLowerCase()
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }),
              `trazabilidad_${sku}_${date}.xlsx`)
          })
        })
      })
    })
  })
}

async function onTracePrintPDF() {
  const prod = selectedTraceProduct.value
  const movements = traceMovements.value

  // ── Cargar jsPDF dinámicamente ────────────────────────────
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')

  // ── Logo de la empresa (base64) ────────────────────────────
  let logoBase64 = null
  try {
    const { data } = await conexionApi.get(`/configuracion/empresas/getEmpresa/${companyID}`)
    const logoUrl = data?.company?.logo
    if (logoUrl) {
      logoBase64 = await new Promise((res) => {
        const img = new Image(); img.crossOrigin = 'anonymous'
        img.onload = () => {
          const c = document.createElement('canvas')
          c.width = img.naturalWidth; c.height = img.naturalHeight
          c.getContext('2d').drawImage(img, 0, 0)
          res(c.toDataURL('image/png'))
        }
        img.onerror = () => res(null)
        img.src = logoUrl
      })
    }
  } catch (_) { /* sin logo */ }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

  // ══════════════════════════════════════════════════
  //  HEADER — fondo blanco + barra lateral azul
  // ══════════════════════════════════════════════════
  // Fondo suave
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, pageW, 42, 'F')

  // Barra de acento izquierda
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 5, 42, 'F')

  // Línea divisoria inferior del header
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(0, 42, pageW, 42)

  // Etiqueta tipo "chip"
  doc.setFillColor(219, 234, 254)
  doc.roundedRect(10, 7, 40, 6, 1.5, 1.5, 'F')
  doc.setTextColor(29, 78, 216)
  doc.setFontSize(6.5); doc.setFont('helvetica', 'bold')
  doc.text('TRAZABILIDAD DE PRODUCTO', 14, 11.5)

  // Título principal
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text(prod?.name || '—', 10, 22)

  // Subtítulo SKU
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`SKU: ${prod?.sku}   ·   Generado el ${dateStr} a las ${timeStr}`, 10, 29)

  // Línea separadora interna
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)
  doc.line(10, 33, pageW - 10, 33)

  // Componente activo si existe
  if (prod?.active_ingredient) {
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139)
    doc.text(`Comp. activo: `, 10, 39)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59)
    doc.text(prod.active_ingredient, 36, 39)
  }

  // ── Logo empresa (esquina superior derecha) ────────────────
  if (logoBase64) {
    try {
      const logoH = 20, logoW = 35
      doc.addImage(logoBase64, 'PNG', pageW - logoW - 10, 11, logoW, logoH)
    } catch (_) { }
  } else {
    // Fallback: texto "AGRISOFT" como marca
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235)
    doc.text('AGRISOFT', pageW - 24, 19)
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184)
    doc.text('Sistema de Gestión Agrícola', pageW - 34, 24)
  }

  // ══════════════════════════════════════════════════
  //  KPI CARDS
  // ══════════════════════════════════════════════════
  const ingresos = movements.filter(m => ['ingreso', 'ingreso_transito', 'recepcion_compra'].includes(m.movement_type)).length
  const egresos = movements.filter(m => ['egreso', 'egreso_transito', 'rebaja', 'cancelacion'].includes(m.movement_type)).length
  const total = movements.length

  const kpis = [
    { label: 'TOTAL MOVIMIENTOS', value: total, fill: [241, 245, 249], text: [30, 41, 59], accent: [100, 116, 139] },
    { label: 'INGRESOS', value: ingresos, fill: [240, 253, 244], text: [5, 150, 105], accent: [5, 150, 105] },
    { label: 'EGRESOS', value: egresos, fill: [255, 241, 242], text: [225, 29, 72], accent: [225, 29, 72] },
    {
      label: 'ÚLTIMO MOVIMIENTO', value: movements[0]?.created_at_fmt?.split(',')[0] || '—',
      fill: [239, 246, 255], text: [37, 99, 235], accent: [37, 99, 235], small: true
    },
  ]

  let kx = 10
  kpis.forEach(k => {
    const kw = 58
    doc.setFillColor(...k.fill)
    doc.roundedRect(kx, 46, kw, 14, 2, 2, 'F')
    doc.setFontSize(5.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...k.accent)
    doc.text(k.label, kx + 3, 51)
    doc.setFontSize(k.small ? 8 : 11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...k.text)
    doc.text(String(k.value), kx + 3, 58)
    kx += kw + 3
  })

  // ══════════════════════════════════════════════════
  //  TABLA DE MOVIMIENTOS
  // ══════════════════════════════════════════════════
  const typeLabels = {
    ingreso: 'Ingreso manual', egreso: 'Egreso manual',
    ajuste: 'Ajuste inventario', rebaja: 'Rebaja/consumo',
    egreso_transito: 'Salida tránsito', ingreso_transito: 'Entrada tránsito',
    cancelacion: 'Cancelación', recepcion_compra: 'Recepción compra',
  }
  const typeColors = {
    ingreso: [209, 250, 229], egreso: [254, 226, 226], ajuste: [224, 242, 254],
    rebaja: [255, 237, 213], egreso_transito: [237, 233, 254],
    ingreso_transito: [204, 251, 241], cancelacion: [255, 228, 230],
    recepcion_compra: [219, 234, 254],
  }

  doc.autoTable({
    startY: 64,
    head: [['Fecha / Hora', 'Tipo de movimiento', 'Bodega / Ruta', 'Cant.', 'Antes', 'Después', 'Responsable', 'Referencia', 'Notas']],
    body: movements.map(m => {
      const origin = m.origin_warehouse_name || '—'
      const destiny = m.destiny_warehouse_name || '—'
      return [
        m.created_at_fmt,
        typeLabels[m.movement_type] || m.movement_type,
        m.destiny_warehouse_name ? `${origin} → ${destiny}` : origin,
        m.quantity ?? '—',
        m.stock_before ?? '—',
        m.stock_after ?? '—',
        m.user_name || '—',
        m.reference_code || '—',
        m.notes || '—',
      ]
    }),
    styles: {
      fontSize: 7, cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineColor: [241, 245, 249], lineWidth: 0.25,
      font: 'helvetica', textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 41, 59], textColor: [255, 255, 255],
      fontStyle: 'bold', fontSize: 6.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 1) {
        const c = typeColors[movements[data.row.index]?.movement_type]
        if (c) data.cell.styles.fillColor = c
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 6.5
      }
    },
    margin: { left: 10, right: 10 },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3,
  })

  // ══════════════════════════════════════════════════
  //  FOOTER en cada página
  // ══════════════════════════════════════════════════
  const n = doc.internal.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    doc.setPage(i)
    // Línea footer
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3)
    doc.line(10, pageH - 9, pageW - 10, pageH - 9)
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184)
    doc.text('Agrisoft — Sistema de Gestión Agrícola', 10, pageH - 5)
    doc.text(`Página ${i} de ${n}`, pageW - 20, pageH - 5)
    // Acento azul lateral en páginas siguientes
    if (i > 1) {
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 5, pageH, 'F')
    }
  }

  // ── Descarga ───────────────────────────────────────────────
  const fileDateStr = now.toISOString().split('T')[0]
  const skuSlug = (prod?.sku || 'producto').replace(/\s+/g, '_').toLowerCase()
  doc.save(`trazabilidad_${skuSlug}_${fileDateStr}.pdf`)
}

// --- Clasificaciones Jerárquicas (TreeView) ---
let isSyncingTree = false;

function onTreeViewSelectionChanged(e, formComponent) {
  if (isSyncingTree) return;
  const nodes = e.component.getSelectedNodes();
  const newIds = nodes
    .filter(node => !node.itemData.items) // Solo subcategorías (hojas)
    .map(node => node.itemData.id);

  console.log('TreeView Selection Changed. New IDs:', newIds);

  if (JSON.stringify(newIds) !== JSON.stringify(selectedSubcategoryIds.value)) {
    selectedSubcategoryIds.value = newIds;

    const links = newIds.map(sid => {
      const sub = allSubcategories.value.find(s => s.id === sid);
      return {
        category_id: sub?.category_id,
        subcategory_id: sid
      };
    }).filter(cl => cl.category_id);

    // Notificar al componente del formulario sobre el cambio
    if (formComponent) {
      console.log('Updating formComponent data for category_links:', links);
      formComponent.updateData('category_links', links);
    } else {
      console.warn('formComponent not provided to onTreeViewSelectionChanged');
    }
  }
}

function onTreeViewContentReady(e) {
  syncTreeViewSelection(e.component);
}

function syncTreeViewSelection(treeView) {
  if (!treeView) return;
  isSyncingTree = true;
  treeView.unselectAll();
  selectedSubcategoryIds.value.forEach(id => {
    treeView.selectItem(id);
  });
  isSyncingTree = false;
}

function getSubcategoryName(id) {
  const sub = allSubcategories.value.find(s => s.id === id);
  return sub ? sub.name : id;
}

watch(selectedSubcategoryIds, (newVal, oldVal) => {
  if (isSyncingTree) return;
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;

  if (treeViewRef.value) {
    syncTreeViewSelection(treeViewRef.value.instance);
  }
});

</script>

<style scoped>
:deep(.dx-datagrid-export-button) {
  background-color: #10b981 !important;
  color: white !important;
  border-radius: 12px !important;
  border: none !important;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2) !important;
  transition: all 0.2s ease !important;
  padding: 0px 12px !important;
  height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
}

:deep(.dx-datagrid-export-button:hover) {
  background-color: #059669 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3) !important;
}
</style>
