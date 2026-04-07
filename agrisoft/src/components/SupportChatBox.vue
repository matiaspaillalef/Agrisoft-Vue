<template>
  <div class="fixed bottom-6 right-6 z-[100]">
    <!-- Botón Flotante -->
    <button @click="isOpen = !isOpen"
      class="w-16! h-16! bg-navy-600! hover:bg-navy-700! text-white! rounded-full! shadow-2xl! flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative">
      <ChatBubbleLeftRightIcon v-if="!isOpen" class="w-8 h-8" />
      <XMarkIcon v-else class="w-8 h-8" />

      <!-- Badge de notificación -->
      <span v-if="!isOpen && hasUnread"
        class="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
    </button>

    <!-- Ventana de Chat -->
    <div v-show="isOpen"
      class="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-navy-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-gray-100 dark:border-navy-700 transition-all duration-300 transform origin-bottom-right">

      <!-- Header -->
      <div class="p-6 bg-slate-800! text-white flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
          <SparklesIcon class="w-7 h-7" />
        </div>
        <div>
          <h3 class="font-bold text-lg leading-tight">Asistente Agrisoft</h3>
          <p class="text-xs text-blue-100 flex items-center gap-1">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            En línea e Inteligente
          </p>
        </div>
      </div>

      <!-- Sugerencias rápidas -->
      <div v-if="messages.length === 1"
        class="px-4 py-2 flex gap-2 overflow-x-auto bg-white dark:bg-navy-900 border-b border-gray-50 dark:border-navy-800 scrollbar-none">
        <button v-for="tag in ['Sectores', 'Bodegas', 'OCs', 'Libro de Campo']" :key="tag"
          @click="userInput = tag; sendMessage()"
          class="shrink-0 text-[10px] bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-300 font-bold px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-colors uppercase border border-blue-100 dark:border-navy-700">
          # {{ tag }}
        </button>
      </div>

      <!-- Contenido del Chat -->
      <div
        class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-navy-700 bg-gray-50/50 dark:bg-navy-950/50">
        <div v-for="(msg, index) in messages" :key="index" class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          <div :class="[
            'max-w-[85%] p-3 rounded-2xl text-sm shadow-sm',
            msg.role === 'user' ?
              'bg-slate-800! text-white! rounded-tr-none' :
              'bg-white dark:bg-navy-800 text-navy-700 dark:text-gray-200 border border-gray-100 dark:border-navy-700 rounded-tl-none'
          ]">
            {{ msg.content }}
          </div>
        </div>
        <div v-if="isTyping" class="flex justify-start">
          <div
            class="bg-white dark:bg-navy-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-navy-700 flex gap-1">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      </div>

      <!-- Footer / Input -->
      <div class="p-4 bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-700">
        <div class="flex items-center gap-2 mb-3">
          <button @click="openWhatsApp"
            class="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-[11px] font-bold py-2 rounded-xl! transition shadow-md uppercase tracking-wider py-2!">
            <PhoneIcon class="w-4 h-4" />
            WhatsApp Soporte
          </button>
          <router-link to="/dashboard/support/tickets" @click="isOpen = false"
            class="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-navy-800 text-navy-700 dark:text-white text-[11px] font-bold py-2 rounded-xl! transition uppercase tracking-wider py-2!">
            <TicketIcon class="w-4 h-4" />
            Ver Tickets
          </router-link>
        </div>

        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input v-model="userInput" placeholder="Pregúntame algo sobre el sistema..."
            class="flex-1 bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-5! text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 m-0!" />
          <button type="submit" :disabled="!userInput.trim() || isTyping"
            class="bg-navy-600 hover:bg-navy-700 disabled:opacity-50 text-white p-1! rounded-xl! transition w-10! flex items-center justify-center">
            <PaperAirplaneIcon class="w-5 h-5 -rotate-45" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  SparklesIcon, 
  PaperAirplaneIcon,
  PhoneIcon,
  TicketIcon
} from '@heroicons/vue/24/outline'
import { onMounted } from 'vue'
import { MenuService } from '@/api/menu.services'

const isOpen = ref(false)
const hasUnread = ref(false)
const isTyping = ref(false)
const userInput = ref('')

onMounted(async () => {
  try {
    const { data } = await MenuService.getUnreadSupport()
    hasUnread.value = data.unread > 0
  } catch(e) {}
})

const messages = ref([
  { role: 'assistant', content: '¡Hola! Soy tu asistente inteligente de Agrisoft. ¿En qué puedo ayudarte hoy?' }
])

const sendMessage = async () => {
  if (!userInput.value.trim()) return

  const userMsg = userInput.value
  messages.value.push({ role: 'user', content: userMsg })
  userInput.value = ''
  isTyping.value = true

  // Scrollear al final
  setTimeout(() => {
    const chatCont = document.querySelector('.scrollbar-thin')
    if (chatCont) chatCont.scrollTop = chatCont.scrollHeight
  }, 100)

  // Simulación de IA (Aquí se integraría Gemini/OpenAI)
  setTimeout(async () => {
    let aiResponse = "Lo siento, aún estoy aprendiendo sobre esa parte del sistema. ¿Te gustaría abrir un ticket de soporte para que un experto te ayude?"
    const input = userMsg.toLowerCase()

    const knowledgeBase = [
      {
        keys: ['hola', 'buen', 'tal'],
        response: "¡Hola! Soy tu asistente de Agrisoft. Puedo ayudarte con dudas sobre Predios, Sectores, Cuadrillas, Bodegas, OCs o el Libro de Campo. ¿En qué te apoyo?"
      },
      {
        keys: ['predio', 'campo', 'suelo', 'ground'],
        response: "Gestiona tus predios en Producción > Parametrización > Predios. Allí defines la ubicación, zona y datos geográficos. Es la base para configurar sectores."
      },
      {
        keys: ['sector', 'barraco', 'cuartel', 'lote'],
        response: "Los sectores se configuran en Producción > Sectores/Cuarteles. Cada sector debe estar asociado a un predio y tener asignada una especie y variedad específica."
      },
      {
        keys: ['especie', 'variedad', 'fruta', 'cultivo'],
        response: "Define tus especies y variedades en Producción > Parametrización. Esto permite clasificar la producción y los reportes detallados por tipo de cultivo."
      },
      {
        keys: ['producto', 'insumo', 'artículo', 'material'],
        response: "La lista de productos está en Operaciones > Productos. Puedes filtrar por categoría, marca o principio activo. También verás el stock real por bodega."
      },
      {
        keys: ['marca', 'fabricante'],
        response: "Configura las marcas en Operaciones > Parametrización > Marcas. Esto ayuda a clasificar mejor tus insumos y productos."
      },
      {
        keys: ['principio', 'activo', 'quimico', 'formula'],
        response: "Los principios activos se gestionan en Operaciones > Parametrización. Es vital para el Libro de Campo y el control de aplicaciones fitosanitarias."
      },
      {
        keys: ['orden', 'compra', 'oc', 'adquisicion', 'comprar'],
        response: "Genera OCs en Operaciones > Adquisiciones > Órdenes de Compra. Recuerda que primero debes tener una Solicitud de Compra aprobada."
      },
      {
        keys: ['solicitud', 'pedido', 'requisicion'],
        response: "Las solicitudes de compra se crean en Adquisiciones > Solicitudes. Una vez enviadas, el administrador puede aprobarlas para generar la orden de compra."
      },
      {
        keys: ['proveedor', 'vendedor'],
        response: "Registra a tus proveedores en Adquisiciones > Proveedores. Es necesario para asignarles órdenes de compra y llevar un historial de suministros."
      },
      {
        keys: ['bodega', 'warehouse', 'stock', 'inventario', 'almacen'],
        response: "Gestiona bodegas en Operaciones > Bodegas. Cada bodega centraliza el stock de sus productos asignados. Puedes ver el detalle de movimientos por fecha."
      },
      {
        keys: ['transito', 'traspaso', 'transferencia', 'mover'],
        response: "Mueve stock entre bodegas en Operaciones > Tránsito. Debes indicar la bodega de origen, la de destino y los productos con sus cantidades."
      },
      {
        keys: ['libro', 'campo', 'field', 'book', 'cuaderno', 'registro'],
        response: "El Libro de Campo (Operaciones > Libro de Campo) registra aplicaciones, labores y dosis. Asegúrate de configurar antes tus sectores e insumos."
      },
      {
        keys: ['dosis', 'aplicacion', 'dosificacion'],
        response: "En el Libro de Campo puedes definir dosis por hectárea o por volumen de agua. El sistema calcula automáticamente el total necesario según el área del sector."
      },
      {
        keys: ['carencia', 'reentrada', 'seguridad', 'vencimiento'],
        response: "Registra los periodos de carencia y reentrada en el Libro de Campo para garantizar la seguridad alimentaria y el cumplimiento de normativas de exportación."
      },
      {
        keys: ['trabajador', 'empleado', 'persona', 'personal'],
        response: "Gestiona tu personal en Gestión de Personas > Trabajadores. Puedes registrar datos personales, contratos y asignarlos a cuadrillas."
      },
      {
        keys: ['cuadrilla', 'grupo', 'equipo', 'squad'],
        response: "Las cuadrillas se crean en Gestión de Personas > Cuadrillas. Facilitan la asignación masiva de labores y el seguimiento de productividad por equipo."
      },
      {
        keys: ['usuario', 'rol', 'permiso', 'acceso', 'perfil'],
        response: "El administrador gestiona usuarios y roles en Configuración > Usuarios. Cada rol tiene permisos específicos para ver u ocultar módulos."
      },
      {
        keys: ['contraseña', 'password', 'clave', 'acceder', 'olvido'],
        response: "Recupera tu clave en 'Olvidé mi contraseña' en la pantalla de ingreso. Recibirás un enlace por correo para crear una nueva clave segura."
      },
      {
        keys: ['reporte', 'informe', 'excel', 'descargar', 'pdf'],
        response: "Todos los módulos principales (Producción, Operaciones, Personas) tienen botón de exportación a Excel para analizar los datos fuera del sistema."
      },
      {
        keys: ['qr', 'código', 'etiqueta', 'barcode'],
        response: "Crea QRs en Producción > Crear QR. Permiten identificar bines o unidades de cosecha para trazabilidad total desde el campo al packing."
      },
      {
        keys: ['clima', 'tiempo', 'metereologia'],
        response: "El sistema muestra el clima actual en el Sidenav para ayudarte a planificar labores y aplicaciones según las condiciones ambientales."
      },
      {
        keys: ['suplantar', 'impersonate', 'ver como'],
        response: "Como Superadmin, puedes entrar al sistema 'como si fueras' otro usuario desde el panel de Gestión de Usuarios para dar soporte remoto."
      }
    ]

    for (const item of knowledgeBase) {
      if (item.keys.some(key => input.includes(key))) {
        aiResponse = item.response
        break
      }
    }

    messages.value.push({ role: 'assistant', content: aiResponse })
    isTyping.value = false

    setTimeout(() => {
      const chatCont = document.querySelector('.scrollbar-thin')
      if (chatCont) chatCont.scrollTop = chatCont.scrollHeight
    }, 100)
  }, 1500)
}

const openWhatsApp = () => {
  const phone = "56990992902" // Número de soporte Gerardo
  const text = "Hola Agrisoft, necesito ayuda con una consulta del sistema."
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
