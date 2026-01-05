<script setup lang="ts">
import { ref, onMounted, watch, watchEffect } from 'vue'
//import css font weather-icons
import '@/assets/styles/weather-icons.css'

const API_TOKEN = import.meta.env.VITE_PUBLIC_API_TOKEN
const WEATHER_TOKEN = import.meta.env.VITE_PUBLIC_WEATHER_TOKEN

const weatherData = ref(null)
const currentDate = ref('')
const location = ref({ latitude: null, longitude: null })

// Obtener ubicación con Geolocalización
onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        location.value.latitude = pos.coords.latitude
        location.value.longitude = pos.coords.longitude
      },
      (err) => {
        console.error('Error al obtener la geolocalización:', err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  } else {
    console.error('La API de Geolocalización no está soportada en este navegador.')
  }
})

// Cuando cambie la ubicación, hacer fetch del clima
watchEffect(async () => {
  const { latitude, longitude } = location.value

  if (!latitude || !longitude) {
    return
  }

  try {
    const urlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_TOKEN}&units=metric&lang=es`

    const res = await fetch(urlWeather)
    if (!res.ok) throw new Error('Error al obtener clima')

    const data = await res.json()
    const condition = data.weather[0].description
    const temp = Math.floor(data.main.temp)
    const city = data.name

    const dateObj = new Date()
    const options = { timeZone: 'America/Santiago', year: 'numeric', month: 'long', day: 'numeric' }
    currentDate.value = dateObj.toLocaleDateString('es-CL', options)

    //console.log('Condición:', condition, 'Temperatura:', temp, 'Ciudad:', city)
    let iconClass = ''
    switch (condition) {
      /** Despejado */
      case 'clear sky':
      case 'cielo despejado':
      case 'cielo claro':
        iconClass = 'wi wi-day-sunny'
        break

      /** Pocas nubes */
      case 'few clouds':
      case 'pocas nubes':
        iconClass = 'wi wi-day-sunny-overcast'
        break

      /** Nubes dispersas */
      case 'scattered clouds':
      case 'nubes dispersas':
      case 'algo de nubes':
        iconClass = 'wi wi-day-cloudy'
        break

      /** Nubes rotas / cielo nublado */
      case 'broken clouds':
      case 'overcast clouds':
      case 'nubes':
      case 'nubes rotas':
      case 'cielo nublado':
        iconClass = 'wi wi-cloudy'
        break

      /** Llovizna */
      case 'light intensity drizzle':
      case 'drizzle':
      case 'heavy intensity drizzle':
      case 'light intensity drizzle rain':
      case 'drizzle rain':
      case 'heavy intensity drizzle rain':
      case 'shower rain and drizzle':
      case 'heavy shower rain and drizzle':
      case 'shower drizzle':
      case 'llovizna ligera':
      case 'llovizna':
      case 'llovizna fuerte':
      case 'llovizna ligera con lluvia':
      case 'lluvia a llovizna':
      case 'lluvia intensa a llovizna':
      case 'chubasco y llovizna':
      case 'chubasco fuerte y llovizna':
      case 'chubasco de llovizna':
        iconClass = 'wi wi-sprinkle'
        break

      /** Lluvia ligera */
      case 'light rain':
      case 'lluvia ligera':
        iconClass = 'wi wi-day-showers'
        break

      /** Lluvia moderada */
      case 'moderate rain':
      case 'lluvia moderada':
        iconClass = 'wi wi-showers'
        break

      /** Lluvia fuerte */
      case 'heavy intensity rain':
      case 'very heavy rain':
      case 'extreme rain':
      case 'lluvia intensa':
      case 'lluvia muy intensa':
      case 'lluvia extrema':
        iconClass = 'wi wi-rain'
        break

      /** Lluvia helada */
      case 'freezing rain':
      case 'lluvia helada':
        iconClass = 'wi wi-rain-mix'
        break

      /** Chubascos */
      case 'light intensity shower rain':
      case 'shower rain':
      case 'heavy intensity shower rain':
      case 'ragged shower rain':
      case 'chubasco ligero':
      case 'chubasco':
      case 'chubasco fuerte':
      case 'chubasco irregular':
        iconClass = 'wi wi-showers'
        break

      /** Nieve */
      case 'light snow':
      case 'snow':
      case 'heavy snow':
      case 'nieve ligera':
      case 'nieve':
      case 'fuerte nevada':
        iconClass = 'wi wi-snow'
        break

      /** Aguanieve */
      case 'sleet':
      case 'light shower sleet':
      case 'shower sleet':
      case 'aguanieve':
      case 'aguanieve ligera':
      case 'chubasco de aguanieve':
        iconClass = 'wi wi-sleet'
        break

      /** Lluvia y nieve */
      case 'light rain and snow':
      case 'rain and snow':
      case 'lluvia ligera y nieve':
      case 'lluvia y nieve':
        iconClass = 'wi wi-rain-mix'
        break

      /** Chubascos de nieve */
      case 'light shower snow':
      case 'shower snow':
      case 'heavy shower snow':
      case 'chubasco ligero de nieve':
      case 'chubasco de nieve':
      case 'chubasco fuerte de nieve':
        iconClass = 'wi wi-snow'
        break

      /** Neblina / Niebla */
      case 'mist':
      case 'fog':
      case 'neblina':
      case 'niebla':
        iconClass = 'wi wi-fog'
        break

      /** Humo */
      case 'smoke':
      case 'humo':
        iconClass = 'wi wi-smoke'
        break

      /** Calina */
      case 'haze':
      case 'calina':
        iconClass = 'wi wi-day-haze'
        break

      /** Arena / Polvo */
      case 'sand/dust whirls':
      case 'sand':
      case 'dust':
      case 'remolinos de arena':
      case 'arena':
      case 'polvo':
        iconClass = 'wi wi-dust'
        break

      /** Ceniza volcánica */
      case 'volcanic ash':
      case 'ceniza volcánica':
        iconClass = 'wi wi-volcano'
        break

      /** Ráfagas */
      case 'squalls':
      case 'ráfagas':
        iconClass = 'wi wi-strong-wind'
        break

      /** Tornado */
      case 'tornado':
        iconClass = 'wi wi-tornado'
        break

      /** Tormenta eléctrica */
      case 'thunderstorm with light rain':
      case 'thunderstorm with rain':
      case 'thunderstorm with heavy rain':
      case 'light thunderstorm':
      case 'thunderstorm':
      case 'heavy thunderstorm':
      case 'ragged thunderstorm':
      case 'thunderstorm with light drizzle':
      case 'thunderstorm with drizzle':
      case 'thunderstorm with heavy drizzle':
      case 'tormenta con lluvia ligera':
      case 'tormenta con lluvia':
      case 'tormenta con lluvia intensa':
      case 'tormenta ligera':
      case 'tormenta':
      case 'tormenta fuerte':
      case 'tormenta irregular':
      case 'tormenta con llovizna ligera':
      case 'tormenta con llovizna':
      case 'tormenta con llovizna intensa':
        iconClass = 'wi wi-thunderstorm'
        break

      /** Valor no reconocido */
      default:
        iconClass = 'wi wi-na'
    }
    weatherData.value = { iconClass, city, tempRedond: temp }
  } catch (err) {
    console.error('Error en fetch:', err)
  }
})
</script>

<template>
  <div class="weatherWidget">
    <template v-if="weatherData">
      <div class="weather_icon flex gap-1 items-center">
        <i :class="[weatherData.iconClass, 'text-sm']"></i>
        <h4 class="text-sm font-bold text-navy-700 dark:text-white">
          <span class="hidden">{{ weatherData.city }},</span> {{ weatherData.tempRedond }}°C
        </h4>
      </div>
      <p class="font-dm text-sm font-medium text-gray-600 hidden">{{ currentDate }}</p>
    </template>
    <p v-else>Cargando...</p>
  </div>
</template>
