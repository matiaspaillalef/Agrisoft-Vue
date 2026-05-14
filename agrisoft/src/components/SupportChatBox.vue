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
import conexionApi from '@/services/conexionApi'

const isOpen = ref(false)
const hasUnread = ref(false)
const isTyping = ref(false)
const userInput = ref('')

const knowledgeBase = ref([])

onMounted(async () => {
  try {
    const { data } = await MenuService.getUnreadSupport()
    hasUnread.value = data.unread > 0
    
    // Cargar base de conocimientos dinámica
    const knowledgeRes = await conexionApi.get('/support/assistant/knowledge')
    if (knowledgeRes.data.code === 'OK') {
      knowledgeBase.value = knowledgeRes.data.knowledge.map(item => ({
        keys: item.keywords.split(',').map(k => k.trim().toLowerCase()),
        response: item.response
      }))
    }
  } catch(e) {
    console.error('Error loading chat assistant data:', e)
  }
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

  // Procesar respuesta
  setTimeout(async () => {
    let aiResponse = "Lo siento, aún estoy aprendiendo sobre esa parte del sistema. ¿Te gustaría abrir un ticket de soporte para que un experto te ayude?"
    const input = userMsg.toLowerCase()

    // Respuestas predefinidas básicas (Greetings)
    const greetings = ['hola', 'buen', 'tal', 'hi', 'hello']
    if (greetings.some(g => input.includes(g))) {
        aiResponse = "¡Hola! Soy tu asistente de Agrisoft. Puedo ayudarte con dudas sobre Predios, Sectores, Cuadrillas, Bodegas, OCs o el Libro de Campo. ¿En qué te apoyo?"
    } else {
        // Buscar en la base de conocimientos dinámica
        for (const item of knowledgeBase.value) {
            if (item.keys.some(key => input.includes(key))) {
                aiResponse = item.response
                break
            }
        }
    }

    messages.value.push({ role: 'assistant', content: aiResponse })
    isTyping.value = false

    setTimeout(() => {
      const chatCont = document.querySelector('.scrollbar-thin')
      if (chatCont) chatCont.scrollTop = chatCont.scrollHeight
    }, 100)
  }, 1000)
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
