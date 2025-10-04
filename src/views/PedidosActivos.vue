<template>
  <v-container>
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="auto">
        <h2 class="text-h5 font-weight-bold mb-0">📋 Selecciona una mesa</h2>
      </v-col>

      <v-col cols="auto" class="d-flex" style="gap: 8px">
    <v-btn color="purple" variant="tonal" @click="$router.push({ name: 'PedidosFuera' })">
      <v-icon start>mdi-cake</v-icon>
      Pedidos externos
    </v-btn>
       <v-btn v-if="rol === 'mesero'" color="black" variant="outlined" @click="cerrarSesion">
       </v-btn>
        <v-btn color="black" variant="outlined" @click="cerrarSesion">
          <v-icon left>mdi-logout</v-icon>
          Cerrar sesión
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="mesa in mesas"
        :key="mesa.id_mesa"
        cols="12"
        xs="6"
        sm="4"
        md="3"
        class="d-flex"
      >
        <v-card
          :class="mesaCardClasses(mesa)"
          class="pa-3 pa-sm-4 d-flex flex-column align-center justify-center relative w-100"
          height="100"
          min-width="0"
          @click="seleccionarMesa(mesa)"
        >
          <!-- Badge con contador de artículos listos -->
          <v-badge
            v-if="readyByMesa[mesa.id_mesa]"
            :content="readyByMesa[mesa.id_mesa]"
            color="green"
            floating
            offset-x="-8"
            offset-y="8"
          />
          <v-icon size="32" class="mb-2">mdi-table-chair</v-icon>

          <div class="text-subtitle-1 font-weight-medium">
            Mesa {{ mesa.numero }}
          </div>

          <!-- Chip de estado -->
          <v-chip size="small" :color="estadoColor(mesa.estado)" variant="flat" class="mt-1">
            <v-icon start size="16">{{ estadoIcon(mesa.estado) }}</v-icon>
            {{ estadoLabel(mesa.estado) }}
          </v-chip>

          <!-- Texto auxiliar cuando hay listos -->
          <div v-if="readyByMesa[mesa.id_mesa]" class="text-caption mt-1">
            {{ readyByMesa[mesa.id_mesa] }} listo(s) 🍽️
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 🔹 Listado de artículos listos para servir -->
    <v-card class="mt-6" v-if="articulosListos.length">
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        🍽️ Artículos listos para servir
        <v-btn size="small" color="green" variant="text" @click="servirTodo">
          <v-icon start>mdi-check-all</v-icon> Servir todo
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-list>
        <v-list-item
          v-for="(articulo, index) in articulosListos"
          :key="articulo.id_mesa + '-' + articulo.nombre + '-' + index"
          @click="marcarServido(index)"
          class="cursor-pointer"
        >
          <v-list-item-content>
            <v-list-item-title>
              <strong>Mesa {{ articulo.numeroMesa }}</strong> ·
              <strong>{{ articulo.nombre }}</strong> listo para servir
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ new Date(articulo.timestamp).toLocaleTimeString() }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <!-- (Sin botón individual) -->
        </v-list-item>
      </v-list>
    </v-card>

    <!-- 🔹 Snackbar global -->
    <v-snackbar v-model="showSnackbar" timeout="6000" :color="snackbarColor" location="top">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { io } from 'socket.io-client'

/* ===================== 🔌 SOCKET ===================== */
const socket = io('https://api-isabella-s-cakes.onrender.com')

/* ===================== 📦 STATE ===================== */
const router = useRouter()
const mesas = ref([])
const rol = ref(localStorage.getItem('rol'))
const articulosListos = ref([])

/* ===================== 🔔 SNACKBAR ===================== */
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('green')

function addNotification(message, color = 'green') {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

/* ===================== 🔊 SONIDO (opcional) ===================== */
const readyAudio = new Audio('/sounds/notify.mp3')
document.addEventListener('click', () => {
  readyAudio.play().then(() => { readyAudio.pause(); readyAudio.currentTime = 0 }).catch(() => {})
}, { once: true })
const playReadySound = () => { readyAudio.currentTime = 0; readyAudio.play().catch(() => {}) }

/* ===================== 💾 PERSISTENCIA DE ESTADO ===================== */
const LS_KEY_ESTADOS = 'mesaEstados'
function getEstadosLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_ESTADOS)) || {} } catch { return {} }
}
function setEstadoLS(id_mesa, estado) {
  const map = getEstadosLS(); map[id_mesa] = estado
  localStorage.setItem(LS_KEY_ESTADOS, JSON.stringify(map))
}
function clearEstadoLS(id_mesa) {
  const map = getEstadosLS(); delete map[id_mesa]
  localStorage.setItem(LS_KEY_ESTADOS, JSON.stringify(map))
}

/* ===================== 🧮 HELPERS UI ===================== */
const readyByMesa = computed(() => {
  const map = {}
  for (const a of articulosListos.value) map[a.id_mesa] = (map[a.id_mesa] || 0) + 1
  return map
})
/*
function normalizar(estado) {
  const s = (estado || '').toLowerCase()
  if (s === 'servido' || s === 'pendiente de pago') return 'pendiente de pago'
  return s
}
function estadoLabel(estado) {
  switch (normalizar(estado)) {
    case 'ocupada': return 'Ocupada'
    case 'reservada': return 'Reservada'
    case 'en preparación': return 'En preparación'
    case 'listo': return 'Listo'
    case 'pendiente de pago': return 'Pendiente de pago'
    default: return 'Libre'
  }
}
function estadoIcon(estado) {
  switch (normalizar(estado)) {
    case 'ocupada': return 'mdi-account-group'
    case 'reservada': return 'mdi-bookmark'
    case 'en preparación': return 'mdi-fire'
    case 'listo': return 'mdi-check-circle'
    case 'pendiente de pago': return 'mdi-cash-register'
    default: return 'mdi-checkbox-blank-circle-outline'
  }
}
function estadoColor(estado) {
  switch (normalizar(estado)) {
    case 'ocupada': return 'red'
    case 'reservada': return 'orange'
    case 'en preparación': return 'orange'
    case 'listo': return 'green'
    case 'pendiente de pago': return 'purple'
    default: return 'green'
  }
}
function mesaCardClasses(mesa) {
  const base = ['mesa-card', 'rounded-lg']
  const s = normalizar(mesa.estado)
  if (s === 'ocupada') base.push('mesa-ocupada')
  else if (s === 'reservada') base.push('mesa-reservada')
  else if (s === 'en preparación') base.push('mesa-prep')
  else if (s === 'pendiente de pago') base.push('mesa-pago')
  else base.push('mesa-libre')
  if (readyByMesa.value[mesa.id_mesa]) base.push('pulse-border')
  return base
}
*/
function normalizar(estado) {
  if (!estado || typeof estado !== 'string') return ''
  const s = estado.toLowerCase().trim()
  if (s === 'ocupado' || s === 'ocupada') return 'ocupada'
  if (s === 'pendiente') return 'pendiente'
  if (s === 'servido' || s === 'pendiente de pago') return 'pendiente de pago'
  return s
}

function estadoLabel(estado) {
  switch (normalizar(estado)) {
    case 'ocupada': return 'Ocupado'
    case 'reservada': return 'Reservada'
    case 'pendiente': return 'Pendiente'
    case 'en preparación': return 'En preparación'
    case 'listo': return 'Listo'
    case 'pendiente de pago': return 'Pendiente de pago'
    default: return 'Libre'
  }
}

function estadoIcon(estado) {
  switch (normalizar(estado)) {
    case 'ocupada': return 'mdi-account-group'
    case 'reservada': return 'mdi-bookmark'
    case 'pendiente': return 'mdi-timer-sand'
    case 'en preparación': return 'mdi-fire'
    case 'listo': return 'mdi-check-circle'
    case 'pendiente de pago': return 'mdi-cash-register'
    default: return 'mdi-checkbox-blank-circle-outline'
  }
}

function estadoColor(estado) {
  switch (normalizar(estado)) {
    case 'ocupada': return 'red'
    case 'reservada': return 'orange'
    case 'pendiente': return 'blue-grey' // o 'grey'
    case 'en preparación': return 'orange'
    case 'listo': return 'green'
    case 'pendiente de pago': return 'purple'
    default: return 'green'
  }
}

function mesaCardClasses(mesa) {
  const base = ['mesa-card', 'rounded-lg']
  if (!mesa || typeof mesa !== 'object') return base
  const s = normalizar(mesa.estado)
  if (s === 'ocupada') base.push('mesa-ocupada')
  else if (s === 'reservada') base.push('mesa-reservada')
  else if (s === 'pendiente') base.push('mesa-pendiente')
  else if (s === 'en preparación') base.push('mesa-prep')
  else if (s === 'pendiente de pago') base.push('mesa-pago')
  else base.push('mesa-libre')
  if (mesa.id_mesa && readyByMesa.value[mesa.id_mesa]) base.push('pulse-border')
  return base
}






/* ===================== 🔧 ACCIONES ===================== */
function cerrarSesion() {
  localStorage.clear()
  window.location.href = '/'
}

const cargarMesas = async () => {
  try {
  const { data } = await axios.get('https://api-isabella-s-cakes.onrender.com/api/mesas')
    const guardados = getEstadosLS()
    if (!Array.isArray(data)) { mesas.value = []; return; }
    mesas.value = data.map(m => {
      if (!m || typeof m !== 'object' || !m.id_mesa) return null;
      return guardados[m.id_mesa]
        ? { ...m, estado: guardados[m.id_mesa] }
        : m
    }).filter(Boolean)
  } catch (error) {
    console.error('Error al cargar mesas:', error)
    mesas.value = []
  }
}

// Servir un artículo al tocar la fila
function marcarServido(index) {
  const item = articulosListos.value[index]
  if (!item) return
  socket.emit('articulo-servido', {
    id_mesa: item.id_mesa,
    nombre_articulo: item.nombre,
    hora_servido: new Date().toISOString()
  })
  articulosListos.value.splice(index, 1)
  // Eliminar duplicados por seguridad
  articulosListos.value = articulosListos.value.filter((a, i, arr) => arr.findIndex(b => b.id_mesa === a.id_mesa && b.nombre === a.nombre) === i)
  addNotification(`🍽️ "${item.nombre}" de mesa ${item.numeroMesa} servido.`, 'green')
}

// Servir todos
function servirTodo() {
  const items = [...articulosListos.value]
  articulosListos.value = []
  for (const item of items) {
    if (!item || !item.id_mesa || !item.nombre) continue;
    socket.emit('articulo-servido', {
      id_mesa: item.id_mesa,
      nombre_articulo: item.nombre,
      hora_servido: new Date().toISOString()
    })
  }
  addNotification(`✅ ${items.length} artículo(s) servidos.`, 'green')
}

// Al tocar una mesa: servir los listos de esa mesa y navegar
function seleccionarMesa(mesa) {
  if (!mesa || !mesa.id_mesa) return;
  const restantes = []
  const servidos = []
  for (const a of articulosListos.value) {
    if (a && a.id_mesa === mesa.id_mesa) servidos.push(a)
    else restantes.push(a)
  }
  articulosListos.value = restantes.filter((a, i, arr) => arr.findIndex(b => b.id_mesa === a.id_mesa && b.nombre === a.nombre) === i)

  if (servidos.length) {
    servidos.forEach(a => {
      if (!a || !a.id_mesa || !a.nombre) return;
      socket.emit('articulo-servido', {
        id_mesa: a.id_mesa,
        nombre_articulo: a.nombre,
        hora_servido: new Date().toISOString()
      })
    })
    addNotification(`🍽️ ${servidos.length} artículo(s) de la mesa ${mesa.numero} servidos.`, 'green')
  }

  router.push({ name: 'NuevoPedido', params: { mesaId: mesa.id_mesa } })
}

/* ===================== ⚡ SOCKETS ===================== */
onMounted(() => {
  cargarMesas()

  // Pago → mesa libre
  socket.on('pedido-pagado', ({ id_mesa }) => {
    const mesa = mesas.value.find(m => m.id_mesa === id_mesa)
    if (mesa) mesa.estado = 'libre'
    clearEstadoLS(id_mesa) // limpiar persistencia
  })
/*
  // Cambios de estado emitidos por Cocina (respetar tal cual)
  socket.on('estado-pedido-actualizado', (p) => {
    const nuevoEstado = (p.estado || '').toLowerCase()
    const id_mesa = p.id_mesa
    if (!['pendiente', 'en preparación', 'listo', 'servido', 'pendiente de pago'].includes(nuevoEstado)) return

    const mesa = mesas.value.find(m => m.id_mesa === id_mesa)
    if (!mesa) return

    // Mapeo visual final
    const estadoFinal =
      (nuevoEstado === 'servido' || nuevoEstado === 'pendiente de pago')
        ? 'pendiente de pago'
        : nuevoEstado

    mesa.estado = estadoFinal
    setEstadoLS(id_mesa, estadoFinal)

    const msg =
      estadoFinal === 'en preparación' ? `🔥 Mesa ${mesa.numero}: pedido en preparación`
      : estadoFinal === 'listo' ? `✅ Mesa ${mesa.numero}: pedido LISTO`
      : estadoFinal === 'pendiente de pago' ? `💳 Mesa ${mesa.numero}: pendiente de pago`
      : `ℹ️ Mesa ${mesa.numero}: ${estadoFinal}`

    const color =
      estadoFinal === 'en preparación' ? 'orange'
      : estadoFinal === 'listo' ? 'green'
      : estadoFinal === 'pendiente de pago' ? 'purple'
      : 'grey'

    addNotification(msg, color)
    if (estadoFinal === 'listo') playReadySound()
  })

*/
socket.on('estado-pedido-actualizado', (p) => {
  const nuevoEstado = (p.estado || '').toLowerCase()
  const id_mesa = p.id_mesa
  if (!['pendiente', 'en preparación', 'listo', 'servido', 'pendiente de pago', 'ocupado', 'ocupada', 'reservada'].includes(nuevoEstado)) return

  const mesa = mesas.value.find(m => m.id_mesa === id_mesa)
  if (!mesa) return

  const n = normalizar(nuevoEstado) // usa tu normalizador
  const estadoFinal = n

  mesa.estado = estadoFinal
  setEstadoLS(id_mesa, estadoFinal)

  const msg =
    estadoFinal === 'pendiente' ? `⏳ Mesa ${mesa.numero}: pedido pendiente`
    : estadoFinal === 'en preparación' ? `🔥 Mesa ${mesa.numero}: pedido en preparación`
    : estadoFinal === 'listo' ? `✅ Mesa ${mesa.numero}: pedido LISTO`
    : estadoFinal === 'pendiente de pago' ? `💳 Mesa ${mesa.numero}: pendiente de pago`
    : estadoFinal === 'ocupada' ? `👥 Mesa ${mesa.numero}: ocupada`
    : `ℹ️ Mesa ${mesa.numero}: ${estadoFinal}`

  const color =
    estadoFinal === 'pendiente' ? 'blue-grey'
    : estadoFinal === 'en preparación' ? 'orange'
    : estadoFinal === 'listo' ? 'green'
    : estadoFinal === 'pendiente de pago' ? 'purple'
    : estadoFinal === 'ocupada' ? 'red'
    : 'grey'

  addNotification(msg, color)
  if (estadoFinal === 'listo') playReadySound()
})


  // Artículo individual preparado (NO tocar estado aquí)
  socket.on('articulo-preparado', ({ nombre_articulo, id_mesa }) => {
    if (!nombre_articulo || !id_mesa) return;
    const mesa = mesas.value.find(m => m.id_mesa === id_mesa)
    const numeroMesa = mesa?.numero || id_mesa
    const nombre = nombre_articulo

    const yaExiste = articulosListos.value.some(a => a && a.nombre === nombre && a.id_mesa === id_mesa)
    if (!yaExiste) {
      articulosListos.value.push({
        nombre,
        id_mesa,
        numeroMesa,
        timestamp: new Date()
      })
      // Eliminar duplicados por seguridad
      articulosListos.value = articulosListos.value.filter((a, i, arr) => arr.findIndex(b => b.id_mesa === a.id_mesa && b.nombre === a.nombre) === i)
      addNotification(`✅ El artículo ${nombre} de la mesa ${numeroMesa} está listo.`, 'green')
      playReadySound()
    }
  })
})

onUnmounted(() => {
  socket.off('pedido-pagado')
  socket.off('estado-pedido-actualizado')
  socket.off('articulo-preparado')
})
</script>

<style scoped>
.relative { position: relative; }
.cursor-pointer { cursor: pointer; }


.mesa-card {
  background: var(--v-theme-surface);
  transition: box-shadow .2s, transform .1s;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}
.mesa-card:hover { transform: translateY(-2px); }
.mesa-ocupada   { background: #ef5350; color: #fff; }
.mesa-reservada { background: #ffcc80; }
.mesa-prep      { background: #ffd180; } /* en preparación */
.mesa-pago      { background: #ce93d8; color: #fff; } /* pendiente de pago */
.mesa-libre     { background: #a5d6a7; }
.mesa-pendiente { background: #cfd8dc; } /* gris azulado suave */
@media (max-width: 600px) {
  .mesa-card {
    height: 90px !important;
    padding: 10px !important;
    font-size: 0.95rem;
  }
  .v-icon {
    font-size: 24px !important;
  }
}

.pulse-border {
  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.8);
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70%  { box-shadow: 0 0 0 12px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
</style>
