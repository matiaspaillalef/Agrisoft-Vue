<template>
  <!-- =========================
       TÍTULO
  ========================== -->
  <div class="max-w-11/12 mx-auto mb-6 pl-2 md:pl-5">
    <h1 class="text-2xl font-light text-navy-700 dark:text-white">
      Solicitudes de Compra
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Solicitudes internas previas a la creación de una orden de compra.
    </p>
  </div>

  <div class="mt-[3px] max-w-11/12 mx-auto rounded-2xl bg-white dark:!bg-navy-800 py-6 px-2 md:px-10 shadow-xl">
    <DxDataGrid
      :data-source="dataSource"
      key-expr="id"
      :show-borders="true"
      :column-auto-width="true"
      :column-hiding-enabled="true"
      :customize-columns="customizeColumns"
    >
      <DxSearchPanel :visible="true" placeholder="Buscar..." />
      <DxPaging :page-size="15" />
      <DxEditing
        mode="popup"
        :allow-adding="true"
        :allow-updating="true"
        :allow-deleting="true"
        :use-icons="true"
        :texts="{ confirmDeleteMessage: '¿Está seguro que desea eliminar este registro?' }"
      >
        <DxPopup title="Solicitud de Compra" :show-title="true" :width="520" :height="300" />
        <DxForm :col-count="1">
          <DxItem
            data-field="justification"
            caption="Justificación"
            editor-type="dxTextArea"
            :editor-options="{ height: 140, placeholder: 'Explique el motivo de la compra' }"
          >
            <DxRequiredRule message="La justificación es obligatoria" />
          </DxItem>
          <DxItem data-field="requester" caption="Solicitante" :visible="true" />
        </DxForm>
      </DxEditing>

      <!-- COLUMNAS -->
      <DxColumn data-field="tracking_code" caption="#Código de solicitud" :allow-editing="false" />
      <DxColumn data-field="requester" caption="Solicitante" :allow-editing="false" />
      <DxColumn
        data-field="justification"
        caption="Justificación"
        :allow-editing="false"
        :cell-template="justificationTemplate"
      />
      <DxColumn data-field="status" caption="Estado" :allow-editing="false" />
      <DxColumn data-field="created_at" caption="Fecha" data-type="date" format="dd/MM/yyyy" :allow-editing="false" />

      <!-- BOTONES -->
      <DxColumn type="buttons">
        <DxButton name="view" hint="Ver" icon="search" @click="e => verRegistro(e.row.data)" />
        <DxButton name="edit" />
        <DxButton name="delete" />
      </DxColumn>
    </DxDataGrid>
  </div>

  <!-- MODAL -->
  <DxPopup v-model:visible="showViewModal" title="Detalle Solicitud" :width="600" :height="400">
    <div class="p-4">
      <p><strong>#Código:</strong> {{ selectedItem?.tracking_code }}</p>
      <p><strong>Solicitante:</strong> {{ selectedItem?.requester }}</p>
      <p><strong>Estado:</strong> {{ selectedItem?.status }}</p>
      <p><strong>Fecha:</strong> {{ selectedItem?.created_at }}</p>
      <p><strong>Justificación:</strong></p>
      <p class="whitespace-pre-line border p-2 rounded bg-gray-100 dark:bg-gray-800">
        {{ selectedItem?.justification }}
      </p>
    </div>
  </DxPopup>
</template>

<script setup>
import { ref } from 'vue'
import CustomStore from 'devextreme/data/custom_store'
import {
  DxDataGrid,
  DxColumn,
  DxEditing,
  DxPopup,
  DxForm,
  DxItem,
  DxSearchPanel,
  DxPaging,
  DxButton
} from 'devextreme-vue/data-grid'
import { DxRequiredRule } from 'devextreme-vue/validator'
import conexionApi from '@/services/conexionApi'

const userId = localStorage.getItem('userId') || '1'
const companyId = localStorage.getItem('userIdCompany') || '1'

const showViewModal = ref(false)
const selectedItem = ref(null)

function verRegistro(data) {
  selectedItem.value = data
  showViewModal.value = true
}

const dataSource = new CustomStore({
  key: 'id',

  /* =========================
     LOAD
  ========================== */
  load: async () => {
    const { data } = await conexionApi.get('/purchase-requests', {
      params: { company_id: companyId }
    })
    // Agregamos un extracto para la grilla
    data.requests.forEach(r => {
      r.justification_excerpt = r.justification?.length > 50
        ? r.justification.substring(0, 50) + '...'
        : r.justification
    })
    return data.requests
  },

  /* =========================
     INSERT
  ========================== */
  insert: async values => {
    const payload = {
      justification: values.justification,
      user_id: Number(userId),
      company_id: Number(companyId)
    }
    const { data } = await conexionApi.post('/purchase-requests', payload)
    return {
      id: data.id,
      ...payload,
      status: 'REQUESTED',
      created_at: new Date()
    }
  },

  /* =========================
     UPDATE
  ========================== */
  update: async (id, values) => {
    await conexionApi.put(`/purchase-requests/${id}`, {
      justification: values.justification
    })
  },

  /* =========================
     DELETE
  ========================== */
  remove: async id => {
    await conexionApi.delete(`/purchase-requests/${id}`)
  }
})

// Template para mostrar solo extracto
function justificationTemplate(cellData) {
  return cellData.data.justification_excerpt
}
</script>
