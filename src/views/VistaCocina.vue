<template>
  <v-container class="py-6">
    <h2 class="text-h5 font-weight-bold mb-4">📋 Cocina</h2>

<v-btn color="primary" @click="$router.push('/solicitar-inventario-cocina')">
  Solicitar artículo de Inventario Cocina
</v-btn>

    <v-row class="mb-4" justify="end">
      <v-col cols="auto" v-if="rol === 'cocina'">
      
        <v-btn color="black" variant="outlined" @click="cerrarSesion">
          <v-icon left>mdi-logout</v-icon>
          Cerrar sesión
        </v-btn>
      </v-col>
    </v-row>

    <template v-if="!mostrarHistorial">
      <v-alert
        v-if="pedidos.length === 0"
        type="info"
        variant="tonal"
        class="mb-4"
        border="start"
      >
        No hay pedidos pendientes, en preparación o listos con artículos pendientes.
      </v-alert>

      <v-card
        v-for="pedido in pedidos"
        :key="pedido.id_pedido"
        class="mb-6"
        variant="elevated"
        elevation="3"
        :style="cardStyle(pedido.estado)"
      >
        <v-card-title class="d-flex justify-space-between align-start">
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              🪑 Mesa {{ pedido.id_mesa }} — {{ pedido.nombre || 'Pedido sin nombre' }}
            </div>

            <div class="text-caption mt-1" v-if="pedido.inicio_preparacion">
              ⏱️ Tiempo transcurrido: {{ tiempoTranscurrido(pedido) }} min
              <div v-if="pedido.minutos">🕒 Tiempo total: {{ pedido.minutos }} min</div>
            </div>
            <div class="text-caption mt-1 text-grey" v-else>
              ⏳ Preparación aún no iniciada
            </div>
          </div>

          <v-chip :color="chipColor(pedido.estado)" class="text-capitalize" label>
            {{ etiquetaEstado(pedido.estado) }}
          </v-chip>
        </v-card-title>

        <v-card-text>
          <v-chip
            v-if="pedido.inicio_preparacion"
            class="mb-3"
            color="deep-orange"
            variant="elevated"
          >
            ⏱️ Tiempo restante del pedido: {{ tiempoRestantePedido(pedido) }}
          </v-chip>

          <v-progress-linear
            v-if="pedido.minutos && pedido.inicio_preparacion"
            :model-value="(tiempoTranscurrido(pedido) / pedido.minutos) * 100"
            color="primary"
            height="8"
            class="mb-4"
          />

          <v-list density="compact">
            <v-list-item v-for="item in pedido.detalles" :key="item.id_detalle">
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.cantidad }} × {{ item.nombre }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div v-if="item.extra">Extra: {{ item.extra }}</div>
                  <div v-if="item.minutos">
                    ⏱ {{ item.minutos }} min —
                    <strong
                      :class="{
                        'text-success': estadoTiempoArticulo(item, pedido.inicio_preparacion).includes('antes') || estadoTiempoArticulo(item, pedido.inicio_preparacion).includes('Justo'),
                        'text-warning': estadoTiempoArticulo(item, pedido.inicio_preparacion).includes('Apurado'),
                        'text-error': estadoTiempoArticulo(item, pedido.inicio_preparacion).includes('tarde') || estadoTiempoArticulo(item, pedido.inicio_preparacion).includes('Excedido')
                      }"
                    >
                      {{ estadoTiempoArticulo(item, pedido.inicio_preparacion) }}
                    </strong>
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="success"
            @click="marcarPedidoListo(pedido)"
            :disabled="pedido.estado !== 'en preparación'"
          >
            Marcar como listo
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <template v-else>
      <v-alert type="info" variant="tonal" class="mb-4">
        Historial de pedidos preparados y pagados.
      </v-alert>
      <pre>{{ historial }}</pre>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'

/* 🔌 SOCKET */
const socket = io('https://api-isabella-s-cakes.onrender.com')

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "/";
}

/* STATE */
const rol = ref(localStorage.getItem("rol"));
const pedidos = ref([])
const historial = ref([])
const mostrarHistorial = ref(false)
let intervalo
let refrescoRapido  // polling en preparación

/* 🎨 estilos */
const cardStyle = (estado) => {
  const bg =
    estado === 'pendiente'       ? '#fff3e0' :
    estado === 'en preparación'  ? '#e3f2fd' :
    estado === 'listo'           ? '#e8f5e9' :
    estado === 'ocupado'         ? '#ede7f6' :
                                   '#f1f8e9';
  const borde =
    estado === 'pendiente'       ? '#fb8c00' :
    estado === 'en preparación'  ? '#1e88e5' :
    estado === 'listo'           ? '#43a047' :
    estado === 'ocupado'         ? '#5e35b1' :
                                   '#7cb342';
  return { backgroundColor: bg, borderLeft: `6px solid ${borde}` }
}

const chipColor = (estado) => {
  if (estado === 'pendiente') return 'orange'
  if (estado === 'en preparación') return 'blue'
  if (estado === 'listo') return 'green'
  if (estado === 'ocupado') return 'deep-purple'
  return 'grey'
}
const etiquetaEstado = (estado) => estado === 'pendiente' ? 'Pendiente'
  : estado === 'en preparación' ? 'En preparación'
  : estado === 'listo' ? 'Listo'
  : estado === 'ocupado' ? 'Ocupado'
  : (estado || 'Desconocido')

/* ⏱️ tiempos */
const tiempoTranscurrido = (pedido) => {
  if (!pedido.inicio_preparacion) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(pedido.inicio_preparacion)) / 60000))
}
const tiempoRestantePedido = (pedido) => {
  if (!pedido?.inicio_preparacion || !pedido.minutos) return '⏳ No iniciado'
  const restante = pedido.minutos - tiempoTranscurrido(pedido)
  return restante > 0 ? `${restante} min restantes` : `⏰ ${Math.abs(restante)} min tarde`
}
const estadoTiempoArticulo = (detalle, fechaInicio) => {
  if (!detalle.minutos) return '⏳ Sin tiempo'
  if (!fechaInicio) return '⏳ No iniciado'
  const inicio = new Date(fechaInicio)
  const fin = detalle.fecha_preparado ? new Date(detalle.fecha_preparado) : new Date()
  const transcurrido = Math.floor((fin - inicio) / 60000)
  const diferencia = detalle.minutos - transcurrido
  if (detalle.fecha_preparado) return diferencia === 0 ? '✅ Justo a tiempo' : (diferencia > 0 ? `🟢 ${diferencia} min antes` : `🔴 ${Math.abs(diferencia)} min tarde`)
  if (diferencia <= 0) return '🔴 Excedido'
  if (diferencia <= detalle.minutos / 2) return '⚠️ Apurado'
  return '🟢 A tiempo'
}

/* utils */
const fetchDetallesNoPreparados = async (id_pedido) => {
  const { data } = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${id_pedido}`)
  return data.filter(d => !d.preparado).map(d => ({ ...d, notificado: false }))
}
const cargarPedidoConDetalles = async (id_pedido) => {
  const { data: pedido } = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${id_pedido}`)
  const detalles = await fetchDetallesNoPreparados(id_pedido)
  return { ...pedido, detalles }
}

/* carga inicial */
const cargarPedidos = async () => {
  try {
  const { data } = await axios.get('https://api-isabella-s-cakes.onrender.com/api/pedidos')
    const activos = data.filter(p => ['pendiente', 'en preparación', 'listo', 'ocupado'].includes(p.estado))

    for (const p of activos) {
      const detalles = await fetchDetallesNoPreparados(p.id_pedido)
      const pedido = { ...p, detalles }
      await iniciarAutomaticoEnCocina(pedido)   // arranque si viene pendiente/ sin inicio
      pedidos.value.push(pedido)
    }

    // ocultar tarjetas 'listo' que ya no tienen pendientes
    pedidos.value = pedidos.value.filter(p => p.detalles.length || (p.estado !== 'listo'))
  } catch (err) {
    console.error('Error al cargar pedidos:', err)
  }
}

const cargarHistorial = async () => {
  try {
  const { data } = await axios.get('https://api-isabella-s-cakes.onrender.com/api/pedidos')
    const pagados = data.filter(p => p.estado === 'pagado')
    const resultados = []
    for (const pedido of pagados) {
  const { data: detalles } = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${pedido.id_pedido}`)
      detalles.filter(d => d.preparado && d.fecha_preparado).forEach(d => {
        resultados.push({
          nombre_articulo: d.nombre || d.articulo?.nombre || 'Artículo',
          minutos: d.minutos,
          fecha_preparado: d.fecha_preparado,
          inicio_preparacion: pedido.inicio_preparacion,
          fecha_hora: pedido.fecha_hora,
          id_mesa: pedido.id_mesa
        })
      })
    }
    historial.value = resultados
  } catch (err) { console.error('Error al cargar historial:', err) }
}

/* arranque auto en cocina */
const iniciarAutomaticoEnCocina = async (pedido) => {
  const necesitaMinutos = !Number(pedido.minutos)
  const estabaPendiente = pedido.estado === 'pendiente'
  if (!necesitaMinutos && !estabaPendiente && pedido.inicio_preparacion) return
  try {
    const payload = {}
    if (necesitaMinutos) payload.minutos = 20
    if (estabaPendiente) {
      payload.estado = 'en preparación'
      payload.inicio_preparacion = new Date().toISOString()
    } else if (!pedido.inicio_preparacion) {
      payload.inicio_preparacion = new Date().toISOString()
    }
    if (Object.keys(payload).length) {
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedido.id_pedido}`, payload)
      Object.assign(pedido, payload)
      socket.emit('estado-pedido-actualizado', { id_pedido: pedido.id_pedido, ...payload })
    }
  } catch (err) { console.error('Error en inicio automático:', err) }
}

/* marcar todos los detalles preparados (al marcar listo) */
const marcarDetallesComoPreparados = async (pedido) => {
  try {
    const ahora = new Date()
    const inicio = pedido.inicio_preparacion ? new Date(pedido.inicio_preparacion) : ahora
    const tiempoPreparado = Math.floor((ahora - inicio) / 60000)
    await Promise.all(
      (pedido.detalles || []).filter(d => !d.preparado).map(d =>
        axios.put(
          `https://api-isabella-s-cakes.onrender.com/api/detallepedido/preparado/${d.id_detalle}`,
          { preparado: true, tiempo_preparado: tiempoPreparado }
        ).catch(e => console.error('❌ No se pudo marcar detalle', d.id_detalle, e))
      )
    )
  } catch (e) { console.error('Error al marcar detalles como preparados:', e) }
}

// Marcar como listo solo tras confirmación del backend y recargar pedidos
const marcarPedidoListo = async (pedido) => {
  try {
    await marcarDetallesComoPreparados(pedido)
    await axios.put(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedido.id_pedido}`, { estado: 'listo' })
    socket.emit('estado-pedido-actualizado', { id_pedido: pedido.id_pedido, estado: 'listo' })
    // Recargar pedidos tras marcar como listo para evitar parpadeos
    await cargarPedidos()
  } catch (err) {
    console.error('Error al marcar como listo:', err)
  }
}

/* fallback: refresco pedidos en preparación */
const syncEnPreparacion = async () => {
  const activos = pedidos.value.filter(p => p.estado === 'en preparación')
  await Promise.all(activos.map(async (p) => {
    try {
      p.detalles = await fetchDetallesNoPreparados(p.id_pedido)
    } catch (e) { console.error('sync en preparación:', e) }
  }))
  pedidos.value = [...pedidos.value]
}

/* ======= SOCKETS ======= */
const upsertPedidoBase = (base) => {
  const i = pedidos.value.findIndex(p => p.id_pedido === base.id_pedido)
  if (i !== -1) pedidos.value[i] = base
  else pedidos.value.push(base)
  pedidos.value = [...pedidos.value]
}

const handleNuevoPedido = async (payload) => {
  const id_pedido = payload?.id_pedido
  if (!id_pedido) return
  const base = await cargarPedidoConDetalles(id_pedido)
  await iniciarAutomaticoEnCocina(base)
  upsertPedidoBase(base)
}

socket.on('nuevo-pedido', handleNuevoPedido)
socket.on('nuevo-pedido-creado', handleNuevoPedido)

/* ✅ Cuando agregan artículos: traemos detalles y arrancamos en cocina */
socket.on('nuevo-detalle-agregado', async (payload) => {
  const id_pedido = payload?.id_pedido || payload?.pedido?.id_pedido
  if (!id_pedido) return
  const base = await cargarPedidoConDetalles(id_pedido)
  if (!base.detalles.length) return  // no mostramos placeholders
  await iniciarAutomaticoEnCocina(base)
  upsertPedidoBase(base)
})

/* ✅ Cambio de estado: NO crear tarjetas vacías */
socket.on('estado-pedido-actualizado', async (pAct) => {
  const id_pedido = pAct.id_pedido
  const estado = pAct.nuevoEstado || pAct.estado
  if (!id_pedido) return

  // si queda listo, lo quitamos
  if (estado === 'listo') {
    pedidos.value = pedidos.value.filter(p => p.id_pedido !== id_pedido)
    return
  }

  // si pasa a pendiente / en preparación, cargamos detalles primero
  if (estado === 'pendiente' || estado === 'en preparación') {
    const base = await cargarPedidoConDetalles(id_pedido)
    if (!base.detalles.length) return  // evita tarjeta vacía
    await iniciarAutomaticoEnCocina(base)
    upsertPedidoBase(base)
    return
  }

  // para otros estados, solo merge si ya existe
  const i = pedidos.value.findIndex(p => p.id_pedido === id_pedido)
  if (i !== -1) pedidos.value[i] = { ...pedidos.value[i], ...pAct }
  pedidos.value = pedidos.value.filter(p => !['servido','pagado','cerrado','cancelado'].includes(p.estado))
})

/* ciclo de vida */
onMounted(() => {
  cargarPedidos()
  cargarHistorial()
  intervalo = setInterval(() => {
    // avisos y re-render
    pedidos.value = [...pedidos.value]
  }, 60000)
  // refresco rápido para capturar cambios aun si el backend no retransmite
  refrescoRapido = setInterval(syncEnPreparacion, 5000)
})

onBeforeUnmount(() => {
  clearInterval(intervalo)
  clearInterval(refrescoRapido)
})
</script>
