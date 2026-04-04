<template>
    <Transition name="fade">
        <div v-if="show" :class="[
            fullPage ? 'fixed' : 'absolute',
            'inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-navy-950/80 backdrop-blur-md transition-all duration-500 rounded-[32px]'
        ]">
            <div class="flex flex-col items-center shrink-0">
                <div class="loading-container relative group scale-75 md:scale-100">
                    <!-- Efectos de Brillo Ambiente -->
                    <div
                        class="absolute -inset-10 bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse">
                    </div>
                    <div
                        class="absolute -inset-10 bg-gradient-to-bl from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse delay-700">
                    </div>

                    <!-- Spinner Principal de Doble Anillo -->
                    <div class="relative w-32 h-32">
                        <!-- Anillo Exterior -->
                        <div
                            class="absolute inset-0 border-[3px] border-blue-500/10 rounded-full ring-8 ring-blue-500/5 shadow-inner">
                        </div>
                        <div
                            class="absolute inset-0 border-[3px] border-transparent border-t-blue-600 border-r-blue-400 rounded-full animate-[spin_1.5s_cubic_bezier(0.5,0,0.5,1)_infinite] shadow-lg shadow-blue-500/20">
                        </div>

                        <!-- Anillo Interior Contrarrótativo -->
                        <div class="absolute inset-4 border-[2px] border-purple-500/10 rounded-full"></div>
                        <div
                            class="absolute inset-4 border-[2px] border-transparent border-b-purple-600 border-l-indigo-400 rounded-full animate-[spin_2s_linear_infinite_reverse]">
                        </div>

                        <!-- Núcleo con Logo/Icono -->
                        <div class="absolute inset-0 flex items-center justify-center p-2">
                            <div
                                class="spinner-logo bg-gradient-to-br from-blue-600 to-blue-400 p-2.5 rounded-xl rotate-12 animate-pulse shadow-lg ring-4 ring-blue-500/10">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Textos con Animación -->
                <div class="spinner-text-group mt-6 flex flex-col items-center">
                    <span
                        class="spinner-main-text font-bold text-navy-700 dark:text-white text-xl tracking-tight leading-none italic uppercase">
                        {{ message }}
                    </span>
                    <span
                        class="spinner-sub-text text-blue-500 text-[11px] font-black uppercase tracking-[0.4em] mt-2.5 animate-pulse leading-none italic">
                        {{ submessage }}
                    </span>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    fullPage: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: 'Cargando'
    },
    submessage: {
        type: String,
        default: 'Agrisoft'
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
}

.spinner-logo {
    animation: spinner-icon 3s ease-in-out infinite;
}

@keyframes spinner-icon {

    0%,
    100% {
        transform: scale(1) rotate(12deg);
    }

    50% {
        transform: scale(1.15) rotate(-12deg);
    }
}

.spinner-main-text {
    animation: text-float 2s ease-in-out infinite;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

@keyframes text-float {

    0%,
    100% {
        transform: translateY(0);
        opacity: 0.8;
    }

    50% {
        transform: translateY(-4px);
        opacity: 1;
    }
}
</style>
