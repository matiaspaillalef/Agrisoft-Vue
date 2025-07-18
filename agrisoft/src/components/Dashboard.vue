<template>
  <div>
    <h1>Bienvenido, {{ nombre }}</h1>
    <p>Tu rol es: {{ rol }}</p>
    <button @click="logout">Cerrar sesión</button>

    <DxDataGrid
      :data-source="dataSource"
      :remote-operations="false"
      :allow-column-reordering="true"
      :row-alternation-enabled="true"
      :show-borders="true"
      :width="'100%'"
      @content-ready="onContentReady"
    >
      <DxColumn :group-index="0" data-field="Product" />
      <DxColumn
        data-field="Amount"
        caption="Sale Amount"
        data-type="number"
        format="currency"
        alignment="right"
      />
      <DxColumn
        :allow-grouping="false"
        data-field="Discount"
        caption="Discount %"
        data-type="number"
        format="percent"
        alignment="right"
        cell-template="discountCellTemplate"
        css-class="bullet"
      />
      <DxColumn data-field="SaleDate" data-type="date" />
      <DxColumn data-field="Region" data-type="string" />
      <DxColumn data-field="Sector" data-type="string" />
      <DxColumn data-field="Channel" data-type="string" />
      <DxColumn :width="150" data-field="Customer" data-type="string" />

      <DxGroupPanel :visible="true" />
      <DxSearchPanel :visible="true" :highlight-case-sensitive="true" />
      <DxGrouping :auto-expand-all="false" />
      <DxPager :visible="true" :allowed-page-sizes="pageSizes" :show-page-size-selector="true" />
      <DxPaging :page-size="10" />

      <!-- Template para la celda personalizada -->
      <template #discountCellTemplate="{ data: cellData }">
        <DiscountCell :cell-data="cellData" />
      </template>
    </DxDataGrid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import {
  DxDataGrid,
  DxColumn,
  DxGrouping,
  DxGroupPanel,
  DxPager,
  DxPaging,
  DxSearchPanel,
  type DxDataGridTypes,
} from 'devextreme-vue/data-grid';

import { DataSource } from 'devextreme-vue/common/data';
import DiscountCell from './DiscountCell/DiscountCell.vue';

const router = useRouter();

const nombre = ref('');
const rol = ref('');

onMounted(() => {
  nombre.value = localStorage.getItem('userName') || '';
  rol.value = localStorage.getItem('rol') || '';
});

function logout() {
  localStorage.clear();
  router.push({ name: 'Login' });
}

// DataGrid
const dataSource = new DataSource({
  store: {
    type: 'odata',
    version: 2,
    url: 'https://js.devexpress.com/Demos/SalesViewer/odata/DaySaleDtoes',
    key: 'Id',
    beforeSend(request) {
      const year = new Date().getFullYear() - 1;
      request.params.startDate = `${year}-05-10`;
      request.params.endDate = `${year}-05-15`;
    },
  },
});

const pageSizes = [10, 25, 50, 100];

let collapsed = false;

const onContentReady = (e: DxDataGridTypes.ContentReadyEvent) => {
  if (!collapsed) {
    e.component.expandRow(['EnviroCare']);
    collapsed = true;
  }
};
</script>
