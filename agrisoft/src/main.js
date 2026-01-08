import './assets/main.css'
import './assets/styles/main.css'
import 'devextreme/dist/css/dx.light.css'
import './assets/styles/dx.generic.agrisoft-scheme.css' // Custom theme
import './style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import darkMode from './plugins/darkMode'

// ✅ DevExtreme localization
import { loadMessages, locale } from 'devextreme/localization'
import esMessages from 'devextreme/localization/messages/es.json'

loadMessages(esMessages)

/*loadMessages({
    es: {
        // Edición
        'dxDataGrid-editingSaveRowChanges': 'Guardar',
        'dxDataGrid-editingCancelRowChanges': 'Cancelar',
        'dxDataGrid-editingConfirmDeleteMessage': '¿Está seguro que desea eliminar este registro?',

        // Column chooser
        'dxDataGrid-columnChooserTitle': 'Seleccionar columnas',
        'dxDataGrid-columnChooserCancel': 'Cerrar',
        'dxDataGrid-columnChooserEmptyText': 'No hay columnas para mostrar',

        // Header filter (filtros)
        'dxDataGrid-headerFilterEmptyValue': '(Vacío)',
        'dxDataGrid-headerFilterOK': 'Aceptar',
        'dxDataGrid-headerFilterCancel': 'Cancelar',
        'dxDataGrid-headerFilterSearchPlaceholder': 'Buscar...',
        'dxDataGrid-headerFilterSelectAll': 'Seleccionar todo',
        'dxDataGrid-headerFilterBlanks': '(Vacíos)',

        "dxList-selectAll": "Seleccionar todo",
        "dxList-deselectAll": "Deseleccionar todo",
        "dxList-searchPlaceholder": "Buscar...",
        "dxList-selectAllSearchResults": "Seleccionar todos los resultados de la búsqueda",

        'dxFilterRow-operatorEquals': 'Igual a',
        'dxFilterRow-operatorContains': 'Contiene',
        'dxFilterRow-operatorStartsWith': 'Empieza con',
        'dxFilterRow-operatorEndsWith': 'Termina con',

        // Botones y otros
        Yes: 'Sí',
        No: 'No',
        Save: 'Guardar',
        Cancel: 'Cancelar',
        Loading: 'Cargando...',
    }
})*/

// Aplicar español globalmente
locale('es')

// Montar app
createApp(App).use(router).use(darkMode).mount('#app')

