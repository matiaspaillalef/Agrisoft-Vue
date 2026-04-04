<template>
    <div class="p-6 min-h-screen bg-slate-50/50">
        <!-- Header con gradiente suave -->
        <div class="mb-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <QrCodeIcon class="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">Generación de QRs</h1>
                    <p class="text-slate-500 font-medium font-inter">Crea códigos para trazabilidad de personal y
                        producción</p>
                </div>
            </div>
        </div>

        <!-- Grid de Herramientas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <!-- Card: QR Trabajadores -->
            <div
                class="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                <div class="absolute top-6 right-6">
                    <div
                        class="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-500">
                        <UserIcon class="w-5 h-5" />
                    </div>
                </div>

                <h2 class="text-xl font-bold text-slate-800 mb-2">QR Trabajador</h2>
                <p class="text-slate-400 text-sm mb-8 leading-relaxed">Genera un código identificador basado en el RUT
                    del personal.</p>

                <div class="space-y-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Seleccionar
                            Trabajador</label>
                        <DxSelectBox v-model:value="selectedWorker" :data-source="workers" display-expr="fullName"
                            value-expr="id" placeholder="Escribe para buscar..." :search-enabled="true"
                            search-mode="contains" styling-mode="filled"
                            class="custom-selectbox rounded-md! h-[55px]!" />
                    </div>

                    <DxButton
                        class="generate-btn w-full !rounded-2xl !h-[56px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-200"
                        text="Generar Código" type="default" icon="check" @click="handleGenerateWorkerQR" />
                </div>
            </div>

            <!-- Card: QR Sector / Variedad -->
            <div
                class="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
                <div class="absolute top-6 right-6">
                    <div
                        class="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-500">
                        <MapIcon class="w-5 h-5" />
                    </div>
                </div>

                <h2 class="text-xl font-bold text-slate-800 mb-2">QR Sector / Variedad</h2>
                <p class="text-slate-400 text-sm mb-8 leading-relaxed">Código combinado para identificación en terreno.
                </p>

                <div class="space-y-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Sector
                            (Cuartel)</label>
                        <DxSelectBox v-model:value="selectedSector" :data-source="sectors" display-expr="name"
                            value-expr="id" placeholder="Seleccionar sector..." :search-enabled="true"
                            styling-mode="filled" class="custom-selectbox rounded-md! h-[55px]!" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Variedad</label>
                        <DxSelectBox v-model:value="selectedVariety" :data-source="varieties" display-expr="name"
                            value-expr="id" placeholder="Seleccionar variedad..." :search-enabled="true"
                            styling-mode="filled" class="custom-selectbox rounded-md! h-[55px]!" />
                    </div>

                    <DxButton
                        class="generate-btn w-full !bg-purple-600 !rounded-2xl !h-[56px] shadow-lg shadow-purple-500/20 active:scale-95 transition-all duration-200"
                        text="Generar Código" type="default" icon="map" @click="handleGenerateSectorVarietyQR" />
                </div>
            </div>

            <!-- Card: QR Lote -->
            <div
                class="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
                <div class="absolute top-6 right-6">
                    <div
                        class="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-500">
                        <RectangleStackIcon class="w-5 h-5" />
                    </div>
                </div>

                <h2 class="text-xl font-bold text-slate-800 mb-2">QR Lote (Bach)</h2>
                <p class="text-slate-400 text-sm mb-4 leading-relaxed">Generación de correlativo automático único.</p>

                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6">
                    <div class="flex gap-3">
                        <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 shrink-0" />
                        <p class="text-[11px] text-amber-800 font-bold leading-tight">
                            Cada QR para lote asigna un correlativo único. Si se genera y no se utiliza el físico, el
                            número se considerará emitido.
                        </p>
                    </div>
                </div>

                <div class="mt-auto">
                    <DxButton
                        class="generate-btn w-full !bg-emerald-600 !rounded-2xl !h-[56px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200"
                        text="Emitir Nuevo Lote" type="default" icon="add" @click="handleGenerateBatchQR" />
                </div>
            </div>
        </div>

        <!-- Modal de Visualización QR -->
        <DxPopup v-model:visible="popupVisible" :drag-enabled="false" :hide-on-outside-click="true" :show-title="false"
            width="400" height="auto" container=".p-6" class="qr-preview-popup">
            <div class="p-8 flex flex-col items-center">
                <div class="w-full flex justify-between items-center mb-6">
                    <h3 class="text-xl font-black text-slate-800 tabular-nums">{{ qrTitle }}</h3>
                    <button @click="popupVisible = false"
                        class="p-2 hover:bg-slate-100 rounded-full transition-colors w-fit!">
                        <XMarkIcon class="w-5 h-5 text-white" />
                    </button>
                </div>

                <!-- Área de Impresión -->
                <div id="qr-print-zone"
                    class="p-4 bg-white flex flex-col items-center border-2 border-slate-100 rounded-3xl">
                    <qrcode-vue :value="qrValue" :size="260" level="Q" render-as="svg" class="qr-code-svg" />
                    <div class="mt-4 flex flex-col items-center space-y-1">
                        <span
                            class="text-2xl font-black tracking-[0.3em] text-slate-900 border-t-4 border-slate-900 pt-2 px-4 uppercase">
                            {{ qrDisplayedCode }}
                        </span>
                        <span v-if="qrSubtext"
                            class="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                            {{ qrSubtext }}
                        </span>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="grid grid-cols-2 gap-4 w-full mt-8">
                    <DxButton class="!h-12 !rounded-xl !bg-slate-100 !text-slate-600 font-bold" text="Cerrar"
                        styling-mode="text" @click="popupVisible = false" />
                    <DxButton class="!h-12 !rounded-xl !bg-blue-600 !text-white font-bold shadow-lg shadow-blue-500/20"
                        text="Imprimir" icon="print" @click="printQR" />
                </div>
            </div>
        </DxPopup>

        <LoadingOverlay :show="loading" message="Cargando datos" submessage="Agrisoft Production" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { DxSelectBox, DxButton, DxPopup } from 'devextreme-vue'
import QrcodeVue from 'qrcode.vue'
import notify from 'devextreme/ui/notify'
import {
    QrCodeIcon, UserIcon, MapIcon, RectangleStackIcon,
    ExclamationTriangleIcon, XMarkIcon
} from '@heroicons/vue/24/solid'
import conexionApi from '@/services/conexionApi.js'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// Estado
const loading = ref(false)
const companyID = Number(localStorage.getItem('userIdCompany')) || 0
const workers = ref([])
const sectors = ref([])
const varieties = ref([])

const selectedWorker = ref(null)
const selectedSector = ref(null)
const selectedVariety = ref(null)

// Popup QR
const popupVisible = ref(false)
const qrValue = ref('')
const qrTitle = ref('')
const qrDisplayedCode = ref('')
const qrSubtext = ref('')

// Carga Inicial
onMounted(async () => {
    if (!companyID) {
        notify('No se encontró ID de compañía. Inicia sesión nuevamente.', 'error', 4000)
        return
    }
    loading.value = true
    try {
        const [wRes, sRes, vRes] = await Promise.all([
            conexionApi.get(`/management-people/workers/getWorkers/${companyID}`),
            conexionApi.get(`/configuracion/production/getSectorsBarracks/${companyID}`),
            conexionApi.get(`/configuracion/production/getVarieties/${companyID}`)
        ])

        // Formatear trabajadores para visualización
        workers.value = (wRes.data.workers || []).map(w => ({
            ...w,
            fullName: `${w.name} ${w.lastname} (${w.rut})`,
            cleanRut: w.rut ? w.rut.replace(/[.-]/g, '') : ''
        }))

        sectors.value = sRes.data.sectors || []
        varieties.value = vRes.data.varieties || []

    } catch (err) {
        console.error('Error cargando datos:', err)
        notify('Error al conectar con la base de datos', 'error', 4000)
    } finally {
        loading.value = false
    }
})

// Acciones: Generar QR Trabajador
const handleGenerateWorkerQR = () => {
    if (!selectedWorker.value) {
        notify('Seleccione un trabajador', 'warning', 2000)
        return
    }

    const worker = workers.value.find(w => w.id === selectedWorker.value)
    if (!worker) {
        notify('Trabajador no encontrado', 'error', 2000)
        return
    }
    qrTitle.value = 'QR Trabajador'
    qrValue.value = worker.rut.replace(/\./g, '') // RUT con guion, sin puntos
    qrDisplayedCode.value = worker.cleanRut
    qrSubtext.value = `${worker.name} ${worker.lastname}`
    popupVisible.value = true
}

// Acciones: Generar QR Sector/Variedad
const handleGenerateSectorVarietyQR = () => {
    if (!selectedSector.value || !selectedVariety.value) {
        notify('Seleccione sector y variedad', 'warning', 2000)
        return
    }

    const sector = sectors.value.find(s => s.id === selectedSector.value)
    const variety = varieties.value.find(v => v.id === selectedVariety.value)

    if (!sector || !variety) {
        notify('Información incompleta', 'error', 2000)
        return
    }

    // Formato: 000000:000000 (Padded a 6 dígitos)
    const sID = String(sector.id).padStart(6, '0')
    const vID = String(variety.id).padStart(6, '0')

    qrTitle.value = 'Sector & Variedad'
    qrValue.value = `${sID}:${vID}`
    qrDisplayedCode.value = `${sID}:${vID}`
    qrSubtext.value = `${sector.name} - ${variety.name}`
    popupVisible.value = true
}

// Acciones: Generar QR Lote
const handleGenerateBatchQR = async () => {
    loading.value = true
    try {
        const res = await conexionApi.post(`/configuracion/production/updateCorrelative/${companyID}`, {})
        if (res.data?.code === 'OK') {
            const fullCode = res.data.correlative_number
            qrTitle.value = 'Nuevo Lote (Bach)'
            qrValue.value = fullCode
            // Mostrar solo los últimos 9 dígitos o el código completo dependiendo de la preferencia
            qrDisplayedCode.value = fullCode.slice(-9)
            qrSubtext.value = `ID ÚNICO: ${fullCode}`
            popupVisible.value = true
        } else {
            notify('Error al generar correlativo', 'error', 3000)
        }
    } catch (err) {
        console.error(err)
        notify('Error de servidor al emitir lote', 'error', 4000)
    } finally {
        loading.value = false
    }
}

// Lógica de Impresión
const printQR = () => {
    const content = document.getElementById('qr-print-zone').innerHTML
    const printWindow = window.open('', '_blank', 'width=600,height=600')

    printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir QR - Agrisoft</title>
        <style>
          body { 
            margin: 0; 
            padding: 40px; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: auto;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .container { 
            text-align: center; 
            width: 100%;
          }
          /* Seleccionar el SVG del QR */
          svg { 
            width: 320px !important; 
            height: 320px !important; 
            margin-bottom: 30px;
          }
          /* Contenedor del texto bajado por el innerHTML */
          .flex { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 15px; 
          }
          span { 
            display: block; 
            text-align: center;
          }
          /* Estilo para el ID/Código */
          .text-2xl { 
            font-size: 36px !important; 
            font-weight: 950 !important; 
            letter-spacing: 0.3em !important; 
            border-top: 5px solid #000;
            padding-top: 15px;
            margin-top: 10px;
            text-transform: uppercase;
            width: 100%;
          }
          /* Estilo para el nombre/subtexto */
          .text-\\[10px\\] {
            font-size: 16px !important;
            font-weight: 800 !important;
            color: #333 !important;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 5px;
          }
          @media print {
            body { padding: 0; }
            .container { margin-top: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container text-center">
          ${content}
        </div>
      </body>
    </html>
  `)

    printWindow.document.close()
    printWindow.focus()
    // Esperar un momento para asegurar que el SVG se renderice
    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 500)
}
</script>

<style>
/* Estilos para DevExtreme SelectBox custom */
.custom-selectbox .dx-texteditor-input {
    padding-left: 1.5rem !important;
    font-weight: 600 !important;
    color: #1e293b !important;
}

.custom-selectbox.dx-editor-filled {
    border: 1px solid #f1f5f9 !important;
    border-radius: 1rem !important;
    background-color: #f8fafc !important;
}

.custom-selectbox.dx-state-focused {
    border-color: #3b82f6 !important;
    background-color: white !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

/* Modales */
.qr-preview-popup .dx-popup-content {
    border-radius: 2.5rem !important;
    padding: 0 !important;
    overflow: hidden !important;
}

#qr-print-zone svg {
    display: block;
}

.font-inter {
    font-family: 'Inter', sans-serif;
}
</style>
