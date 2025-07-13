<template>
  <div
    class="absolute right-0 hidden h-dvh min-h-screen md:hidden lg:block lg:w-[49vw] 2xl:w-[44vw]"
  >
    <div class="relative h-full w-full lg:rounded-bl-[120px] xl:rounded-bl-[200px] overflow-hidden">
      <Swiper
        :modules="[Autoplay, EffectFade]"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        effect="fade"
        :loop="true"
        class="h-full w-full"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index">
          <img :src="slide" class="w-full h-full object-cover" :alt="`Slide ${index + 1}`" />
        </SwiperSlide>
      </Swiper>

      <img
        src="@/assets/img/agrisoft_logo_dark.png"
        alt="Agrisoft"
        class="object-cover max-h-[241px] min-w-[249px] absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2 z-10"
      />
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/autoplay'

import { Autoplay, EffectFade } from 'swiper/modules'

import slide1 from '@/assets/img/slides/slide-avocado.png'
import slide2 from '@/assets/img/slides/slide-potatos.jpg'
import slide3 from '@/assets/img/slides/slide-blueberries.jpg'
import slide4 from '@/assets/img/slides/slide-apple.jpg'

const slides = [slide1, slide2, slide3, slide4]
</script>
