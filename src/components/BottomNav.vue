<template>
  <v-bottom-navigation
    v-model="currentTab"
    grow
    fixed
    height="64"
  >
    <v-btn v-if="esRol(['mesero', 'admin'])" to="/pedidos" value="pedidos">
      <v-icon>mdi-format-list-bulleted</v-icon>
      <span :class="{ active: currentTab === 'pedidos' }">Pedidos</span>
    </v-btn>

    <v-btn v-if="esRol(['cocina', 'admin'])" to="/cocina" value="cocina">
      <v-icon>mdi-pot-steam</v-icon>
      <span :class="{ active: currentTab === 'cocina' }">Cocina</span>
    </v-btn>

    <v-btn v-if="esRol(['cajero', 'admin','mesero'])" to="/pagos" value="pagos">
      <v-icon>mdi-cash-register</v-icon>
      <span :class="{ active: currentTab === 'pagos' }">Pagos</span>
    </v-btn>

    <v-btn v-if="esRol(['admin'])" to="/categorias" value="menu">
      <v-icon>mdi-silverware-fork-knife</v-icon>
      <span :class="{ active: currentTab === 'menu' }">Menú</span>
    </v-btn>

    <v-btn v-if="esRol(['admin'])" to="/ajustes" value="ajustes">
      <v-icon>mdi-cog</v-icon>
      <span :class="{ active: currentTab === 'ajustes' }">Ajustes</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const currentTab = ref('pedidos')
const route = useRoute()
const rol = localStorage.getItem('rol') || '' // ← obtiene el rol del localStorage

// Verifica si el rol del usuario está en los permitidos
function esRol(permitidos) {
  return permitidos.includes(rol)
}

// Detectar ruta activa para mantener la pestaña seleccionada
watch(() => route.path, () => {
  if (route.path.startsWith('/categorias')) currentTab.value = 'menu'
  else if (route.path.startsWith('/ajustes')) currentTab.value = 'ajustes'
  else if (route.path.startsWith('/pagos')) currentTab.value = 'pagos'
  else if (route.path.startsWith('/cocina')) currentTab.value = 'cocina'
  else currentTab.value = 'pedidos'
}, { immediate: true })
</script>

<style scoped>
.v-bottom-navigation {
  border-top: 1px solid #ccc;
}

.v-btn span {
  font-size: 0.75rem;
  color: #444;
}

.v-btn .v-icon {
  margin-bottom: 2px;
}

.active {
  color: #D81B60 !important;
  font-weight: bold;
}
</style>
