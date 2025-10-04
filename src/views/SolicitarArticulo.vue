<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Solicitar artículo</h2>
      </v-col>
    </v-row>

    <!-- Formulario de solicitud -->
    <v-row class="mt-4">
      <v-col>
        <v-card>
          <v-card-title>
            <v-icon start>mdi-clipboard-text</v-icon>
            Nueva solicitud de artículo
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="enviarSolicitud">
              <!-- Ubicación solicitante -->
              <v-select
                v-model="solicitud.ubicacion"
                :items="ubicaciones"
                label="¿Desde dónde solicitas?"
                prepend-inner-icon="mdi-map-marker"
                required
                :error-messages="errors.ubicacion"
              />

              <!-- Artículo solicitado -->
              <v-select
                v-model="solicitud.articuloId"
                :items="articulos"
                item-title="nombre"
                item-value="idInventarioCocina"
                label="Artículo necesario"
                prepend-inner-icon="mdi-food-apple"
                :loading="cargandoArticulos"
                clearable
                required
                :error-messages="errors.articuloId"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar size="40">
                        <v-img 
                          v-if="item.raw.imagen" 
                          :src="`https://api-isabella-s-cakes.onrender.com${item.raw.imagen}`"
                          cover
                        />
                        <v-icon v-else>mdi-food</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ item.raw.nombre }}</v-list-item-title>
                    <v-list-item-subtitle>
                      ${{ item.raw.precio }} - {{ item.raw.estado ? 'Disponible' : 'No disponible' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Cantidad solicitada -->
              <v-text-field
                v-model.number="solicitud.cantidad"
                label="Cantidad necesaria"
                prepend-inner-icon="mdi-numeric"
                type="number"
                min="1"
                step="1"
                required
                :error-messages="errors.cantidad"
              />

              <!-- Prioridad -->
              <v-select
                v-model="solicitud.prioridad"
                :items="prioridades"
                label="Prioridad"
                prepend-inner-icon="mdi-flag"
                required
                :error-messages="errors.prioridad"
              />

              <!-- Motivo/Observaciones -->
              <v-textarea
                v-model="solicitud.observaciones"
                label="Motivo o observaciones (opcional)"
                prepend-inner-icon="mdi-comment-text"
                rows="3"
                auto-grow
                placeholder="Ej: Se agotó el stock, necesario para orden urgente, etc."
              />

              <!-- Botones -->
              <v-row class="mt-4">
                <v-col cols="12" sm="6">
                  <v-btn
                    color="grey-darken-1"
                    variant="outlined"
                    block
                    @click="limpiarFormulario"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    Limpiar
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    type="submit"
                    color="orange-darken-1"
                    block
                    :loading="enviando"
                    :disabled="enviando"
                  >
                    <v-icon start>mdi-send</v-icon>
                    {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mis solicitudes activas -->
    <v-row class="mt-4" v-if="solicitudesRecientes.length > 0">
      <v-col>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start>mdi-history</v-icon>
            Mis solicitudes
            <v-chip class="ml-2" size="small" color="primary">
              {{ solicitudesMostradas.length }}
              <span v-if="mostrarSoloActivas">/{{ solicitudesRecientes.length }}</span>
            </v-chip>
            <v-spacer />
            <v-switch
              v-if="solicitudesRecientes.length > 3"
              v-model="mostrarSoloActivas"
              label="Solo activas"
              color="primary"
              hide-details
              density="compact"
              class="mr-2"
            />
            <v-btn
              size="small"
              color="primary"
              variant="outlined"
              @click="cargarSolicitudesRecientes"
              :loading="cargandoSolicitudes"
            >
              <v-icon start size="small">mdi-refresh</v-icon>
              Actualizar
            </v-btn>
          </v-card-title>
          <v-card-subtitle class="text-caption">
            <v-icon size="small">mdi-update</v-icon>
            Se actualiza automáticamente cada 30 segundos
          </v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="solicitudItem in solicitudesMostradas"
                :key="solicitudItem.id"
                class="mb-2 border rounded"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getColorEstado(solicitudItem.estado)">
                    <v-icon :icon="getIconEstado(solicitudItem.estado)" color="white" />
                  </v-avatar>
                </template>
                
                <v-list-item-title class="font-weight-bold">
                  {{ solicitudItem.articulo?.nombre || 'Artículo eliminado' }}
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  <div class="d-flex flex-wrap ga-2 mb-1">
                    <v-chip size="small" color="grey-lighten-2">
                      <v-icon start size="small">mdi-map-marker</v-icon>
                      {{ solicitudItem.ubicacionSolicitante }}
                    </v-chip>
                    <v-chip size="small" color="blue-lighten-2">
                      <v-icon start size="small">mdi-numeric</v-icon>
                      Cantidad: {{ solicitudItem.cantidad }}
                    </v-chip>
                    <v-chip 
                      size="small" 
                      :color="getColorPrioridad(solicitudItem.prioridad)"
                      variant="flat"
                    >
                      <v-icon start size="small">mdi-flag</v-icon>
                      {{ solicitudItem.prioridad }}
                    </v-chip>
                  </div>
                  <div class="text-caption mb-1">
                    <strong>Solicitado:</strong> {{ formatearFecha(solicitudItem.fechaSolicitud) }}
                  </div>
                  <div v-if="solicitudItem.fechaActualizacion && solicitudItem.fechaActualizacion !== solicitudItem.fechaSolicitud" class="text-caption mb-1 text-blue-darken-1">
                    <strong>Última actualización:</strong> {{ formatearFecha(solicitudItem.fechaActualizacion) }}
                  </div>
                  <div v-if="solicitudItem.observaciones" class="text-caption text-grey-darken-1 mb-1">
                    <strong>Motivo:</strong> {{ solicitudItem.observaciones }}
                  </div>
                  <div v-if="solicitudItem.respuestaAdmin" class="text-caption text-purple-darken-1 mb-1">
                    <strong>Respuesta admin:</strong> {{ solicitudItem.respuestaAdmin }}
                  </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex flex-column ga-2">
                    <v-chip
                      :color="getColorEstado(solicitudItem.estado)"
                      size="small"
                      variant="flat"
                    >
                      {{ solicitudItem.estado }}
                    </v-chip>
                    
                    <!-- Botón de cancelar solo para solicitudes pendientes -->
                    <v-btn
                      v-if="solicitudItem.estado === 'Pendiente'"
                      size="small"
                      color="red"
                      variant="outlined"
                      @click="confirmarCancelacion(solicitudItem)"
                      :loading="cancelando === solicitudItem.id"
                    >
                      <v-icon size="small">mdi-close</v-icon>
                      Cancelar
                    </v-btn>

                    <!-- Indicador para solicitudes en proceso -->
                    <v-tooltip v-else-if="solicitudItem.estado === 'En proceso'" text="Ya está siendo procesada">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          size="small"
                          color="blue"
                          variant="text"
                          disabled
                        >
                          <v-icon size="small">mdi-loading mdi-spin</v-icon>
                          En proceso
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de confirmación para cancelar -->
    <v-dialog v-model="dialogoCancelacion.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon start color="orange">mdi-alert</v-icon>
          Cancelar solicitud
        </v-card-title>
        <v-card-text>
          <p>¿Estás seguro de que deseas cancelar la solicitud de:</p>
          <div class="mt-2 pa-3 bg-grey-lighten-4 rounded">
            <strong>{{ dialogoCancelacion.solicitud?.articulo?.nombre }}</strong><br>
            <small>Cantidad: {{ dialogoCancelacion.solicitud?.cantidad }} | 
            Prioridad: {{ dialogoCancelacion.solicitud?.prioridad }}</small>
          </div>
          <p class="mt-3 text-caption text-grey-darken-1">
            Esta acción no se puede deshacer.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="dialogoCancelacion.show = false"
          >
            No, mantener
          </v-btn>
          <v-btn
            color="red"
            variant="elevated"
            @click="cancelarSolicitud"
            :loading="cancelando"
          >
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Estados reactivos
const enviando = ref(false)
const cargandoArticulos = ref(false)
const cargandoSolicitudes = ref(false)
const cancelando = ref(null) // ID de la solicitud que se está cancelando
const errors = ref({})
const mostrarSoloActivas = ref(false) // Filtro para mostrar solo solicitudes activas

// Diálogo de cancelación
const dialogoCancelacion = ref({
  show: false,
  solicitud: null
})

// Datos para el formulario
const ubicaciones = [
  { title: 'Cocina', value: 'Cocina' },
  { title: 'Barra', value: 'Barra' }
]

const prioridades = [
  { title: 'Baja - Puede esperar', value: 'Baja' },
  { title: 'Media - Necesario pronto', value: 'Media' },
  { title: 'Alta - Urgente', value: 'Alta' },
  { title: 'Crítica - Inmediato', value: 'Crítica' }
]

// Formulario de solicitud
const solicitud = ref({
  ubicacion: '',
  articuloId: null,
  cantidad: 1,
  prioridad: 'Media',
  observaciones: ''
})

// Datos
const articulos = ref([])
const solicitudesRecientes = ref([])

// Computed para filtrar solicitudes
const solicitudesMostradas = computed(() => {
  if (!mostrarSoloActivas.value) {
    return solicitudesRecientes.value
  }
  
  // Mostrar solo solicitudes activas (Pendiente o En proceso)
  return solicitudesRecientes.value.filter(s => 
    ['Pendiente', 'En proceso'].includes(s.estado)
  )
})

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Funciones
const showSnackbar = (text, color = 'success') => {
  snackbar.value.text = text
  snackbar.value.color = color
  snackbar.value.show = true
}

const validarFormulario = () => {
  errors.value = {}
  let isValid = true

  if (!solicitud.value.ubicacion) {
    errors.value.ubicacion = ['La ubicación es requerida']
    isValid = false
  }

  if (!solicitud.value.articuloId) {
    errors.value.articuloId = ['Debes seleccionar un artículo']
    isValid = false
  }

  if (!solicitud.value.cantidad || solicitud.value.cantidad < 1) {
    errors.value.cantidad = ['La cantidad debe ser mayor a 0']
    isValid = false
  }

  if (!solicitud.value.prioridad) {
    errors.value.prioridad = ['La prioridad es requerida']
    isValid = false
  }

  return isValid
}

const cargarArticulos = async () => {
  cargandoArticulos.value = true
  try {
  const res = await axios.get('https://api-isabella-s-cakes.onrender.com/api/inventario-cosina')
    articulos.value = res.data
  } catch (error) {
    console.error('Error al cargar artículos:', error)
    showSnackbar('Error al cargar la lista de artículos', 'error')
  } finally {
    cargandoArticulos.value = false
  }
}

const cargarSolicitudesRecientes = async () => {
  cargandoSolicitudes.value = true
  try {
    // Obtener el ID del usuario actual
    const usuarioId = localStorage.getItem('id_miembro')
    
    if (!usuarioId) {
      console.warn('No se encontró ID de usuario')
      return
    }

    // Cargar solo las solicitudes del usuario actual
  const res = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario/usuario/${usuarioId}`)
    
    // Cargar información completa de los artículos
    const solicitudesConArticulos = await Promise.all(
      res.data.map(async (solicitud) => {
        try {
          if (solicitud.articuloId) {
            const articuloRes = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${solicitud.articuloId}`)
            return {
              ...solicitud,
              articulo: articuloRes.data
            }
          }
          return solicitud
        } catch (error) {
          console.error(`Error al cargar artículo ${solicitud.articuloId}:`, error)
          return {
            ...solicitud,
            articulo: { nombre: 'Artículo no encontrado' }
          }
        }
      })
    )

    // Ordenar por fecha de solicitud (más recientes primero)
    solicitudesRecientes.value = solicitudesConArticulos.sort((a, b) => 
      new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
    )

  } catch (error) {
    console.error('Error al cargar solicitudes:', error)
    
    // Si hay error de conexión, mostrar datos de ejemplo para desarrollo
    if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      showSnackbar('Modo de desarrollo: Mostrando datos de ejemplo', 'info')
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Datos de ejemplo que simularían las solicitudes del usuario actual
      solicitudesRecientes.value = [
        {
          id: Date.now() + 1,
          articuloId: 1,
          articulo: { nombre: 'Arroz con pollo' },
          cantidad: 5,
          prioridad: 'Alta',
          estado: 'Pendiente',
          ubicacionSolicitante: 'Cocina',
          observaciones: 'Se agotó el stock para la cena',
          fechaSolicitud: new Date().toISOString(),
          usuarioId: localStorage.getItem('id_miembro')
        },
        {
          id: Date.now() + 2,
          articuloId: 2,
          articulo: { nombre: 'Cerveza Corona' },
          cantidad: 12,
          prioridad: 'Media',
          estado: 'En proceso',
          ubicacionSolicitante: 'Barra',
          observaciones: 'Para reponer inventario',
          fechaSolicitud: new Date(Date.now() - 3600000).toISOString(),
          usuarioId: localStorage.getItem('id_miembro')
        }
      ]
    } else {
      showSnackbar('Error al cargar tus solicitudes', 'error')
    }
  } finally {
    cargandoSolicitudes.value = false
  }
}

// Auto-actualizar solicitudes cada 30 segundos para reflejar cambios de estado
let intervaloActualizacion = null

const iniciarActualizacionAutomatica = () => {
  // Limpiar intervalo previo si existe
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion)
  }
  
  // Actualizar cada 30 segundos
  intervaloActualizacion = setInterval(async () => {
    try {
      await cargarSolicitudesRecientes()
    } catch (error) {
      console.error('Error en actualización automática:', error)
    }
  }, 30000) // 30 segundos
}

const detenerActualizacionAutomatica = () => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion)
    intervaloActualizacion = null
  }
}

const confirmarCancelacion = (solicitud) => {
  dialogoCancelacion.value.solicitud = solicitud
  dialogoCancelacion.value.show = true
}

const cancelarSolicitud = async () => {
  const solicitud = dialogoCancelacion.value.solicitud
  if (!solicitud) return

  cancelando.value = solicitud.id

  try {
    // Llamada al backend para cancelar la solicitud
  await axios.patch(`https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario/${solicitud.id}`, {
      estado: 'Cancelada',
      fechaCancelacion: new Date().toISOString()
    })

    // Actualizar localmente
    const index = solicitudesRecientes.value.findIndex(s => s.id === solicitud.id)
    if (index !== -1) {
      solicitudesRecientes.value[index].estado = 'Cancelada'
      solicitudesRecientes.value[index].fechaCancelacion = new Date().toISOString()
    }

    showSnackbar('Solicitud cancelada exitosamente', 'success')
    dialogoCancelacion.value.show = false
    
    // Recargar solicitudes para obtener datos actualizados
    await cargarSolicitudesRecientes()

  } catch (error) {
    console.error('Error al cancelar solicitud:', error)
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || 'Error desconocido'
      showSnackbar(`Error ${status}: ${message}`, 'error')
    } else {
      showSnackbar('No se pudo cancelar la solicitud', 'error')
    }
  } finally {
    cancelando.value = null
  }
}

const enviarSolicitud = async () => {
  if (!validarFormulario()) {
    return
  }

  const usuarioId = localStorage.getItem('id_miembro')
  if (!usuarioId) {
    showSnackbar('Error: No se pudo identificar al usuario', 'error')
    return
  }

  enviando.value = true

  try {
    // Preparar los datos para enviar
    const datosEnvio = {
      usuarioId: parseInt(usuarioId),
      ubicacionSolicitante: solicitud.value.ubicacion,
      articuloId: solicitud.value.articuloId,
      cantidad: solicitud.value.cantidad,
      prioridad: solicitud.value.prioridad,
      observaciones: solicitud.value.observaciones || null,
      fechaSolicitud: new Date().toISOString(),
      estado: 'Pendiente'
    }

    // Enviar al backend
  await axios.post('https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario', datosEnvio)

    showSnackbar('¡Solicitud enviada exitosamente!', 'success')
    limpiarFormulario()
    
    // Recargar solicitudes recientes inmediatamente
    await cargarSolicitudesRecientes()

  } catch (error) {
    console.error('Error al enviar solicitud:', error)
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || 'Error desconocido'
      showSnackbar(`Error ${status}: ${message}`, 'error')
    } else {
      showSnackbar('No se pudo enviar la solicitud', 'error')
    }
  } finally {
    enviando.value = false
  }
}

const limpiarFormulario = () => {
  solicitud.value = {
    ubicacion: '',
    articuloId: null,
    cantidad: 1,
    prioridad: 'Media',
    observaciones: ''
  }
  errors.value = {}
}

// Funciones para el estado de las solicitudes
const getColorEstado = (estado) => {
  switch (estado) {
    case 'Pendiente': return 'orange'
    case 'En proceso': return 'blue'
    case 'Completada': return 'green'
    case 'Rechazada': return 'red'
    case 'Cancelada': return 'grey'
    default: return 'grey'
  }
}

const getColorPrioridad = (prioridad) => {
  switch (prioridad) {
    case 'Baja': return 'grey'
    case 'Media': return 'blue'
    case 'Alta': return 'orange'
    case 'Crítica': return 'red'
    default: return 'grey'
  }
}

const getIconEstado = (estado) => {
  switch (estado) {
    case 'Pendiente': return 'mdi-clock'
    case 'En proceso': return 'mdi-loading'
    case 'Completada': return 'mdi-check'
    case 'Rechazada': return 'mdi-close'
    case 'Cancelada': return 'mdi-cancel'
    default: return 'mdi-help'
  }
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Al montar el componente
onMounted(async () => {
  await Promise.all([
    cargarArticulos(),
    cargarSolicitudesRecientes()
  ])
  
  // Iniciar actualización automática
  iniciarActualizacionAutomatica()
})

// Al desmontar el componente
onUnmounted(() => {
  detenerActualizacionAutomatica()
})
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.mdi-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.v-chip {
  font-size: 0.75rem;
}

.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>