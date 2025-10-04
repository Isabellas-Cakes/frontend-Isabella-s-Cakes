<template>
  <!-- Mostrar app solo cuando esté lista -->
  <v-app v-if="appReady">
    <v-main>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </v-main>
    <BottomNav v-if="mostrarBottomNav" />
  </v-app>
</template>

<script setup>
import BottomNav from './components/BottomNav.vue'
import { useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'

const appReady = ref(false)
const route = useRoute()

const mostrarBottomNav = computed(() => route.path !== '/')

onMounted(() => {
  // Esperar que se cargue correctamente localStorage antes de montar
  setTimeout(() => {
    appReady.value = true
  }, 100) // puedes ajustar el delay si hace falta
})
</script>

<style>
body {
  margin: 0;
}
</style>
