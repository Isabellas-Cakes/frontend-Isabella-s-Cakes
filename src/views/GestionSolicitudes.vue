<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Gestión de solicitudes</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          @click="cargarSolicitudes"
          :loading="cargando"
          prepend-icon="mdi-refresh"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mt-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="filtros.estado"
          :items="estadosDisponibles"
          label="Filtrar por estado"
          prepend-inner-icon="mdi-filter"
          clearable
          @update:model-value="aplicarFiltros"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filtros.prioridad"
          :items="prioridadesDisponibles"
          label="Filtrar por prioridad"
          prepend-inner-icon="mdi-flag"
          clearable
          @update:model-value="aplicarFiltros"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filtros.ubicacion"
          :items="ubicacionesDisponibles"
          label="Filtrar por ubicación"
          prepend-inner-icon="mdi-map-marker"
          clearable
          @update:model-value="aplicarFiltros"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filtros.busqueda"
          label="Buscar artículo"
          prepend-inner-icon="mdi-magnify"
          clearable
          @update:model-value="aplicarFiltros"
        />
      </v-col>
    </v-row>

    <!-- Estadísticas rápidas -->
    <v-row class="mb-4">
      <v-col cols="6" md="3">
        <v-card color="orange-lighten-4">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-orange-darken-2">
              {{ estadisticas.pendientes }}
            </div>
            <div class="text-subtitle-1">Pendientes</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="blue-lighten-4">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-blue-darken-2">
              {{ estadisticas.enProceso }}
            </div>
            <div class="text-subtitle-1">En proceso</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="red-lighten-4">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-red-darken-2">
              {{ estadisticas.criticas }}
            </div>
            <div class="text-subtitle-1">Críticas</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card color="green-lighten-4">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold text-green-darken-2">
              {{ estadisticas.completadas }}
            </div>
            <div class="text-subtitle-1">Completadas</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lista de solicitudes -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <v-icon start>mdi-clipboard-list</v-icon>
            Solicitudes de inventario
            <v-spacer />
            <v-chip
              :color="solicitudesFiltradas.length > 0 ? 'primary' : 'grey'"
              variant="flat"
            >
              {{ solicitudesFiltradas.length }} solicitudes
            </v-chip>
          </v-card-title>
          
          <v-card-text v-if="cargando" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="64" />
            <p class="mt-4">Cargando solicitudes...</p>
          </v-card-text>

          <v-card-text v-else-if="solicitudesFiltradas.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-clipboard-outline</v-icon>
            <p class="mt-4 text-grey-darken-1">
              {{ solicitudes.length === 0 ? 'No hay solicitudes registradas' : 'No se encontraron solicitudes con los filtros aplicados' }}
            </p>
          </v-card-text>

          <v-list v-else>
            <v-list-item
              v-for="solicitudItem in solicitudesFiltradas"
              :key="solicitudItem.id"
              class="mb-2 border rounded"
            >
              <template v-slot:prepend>
                <v-avatar :color="getColorPrioridad(solicitudItem.prioridad)">
                  <v-icon :icon="getIconPrioridad(solicitudItem.prioridad)" color="white" />
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
                    {{ solicitudItem.cantidad }}
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
                <div v-if="solicitudItem.observaciones" class="text-caption text-grey-darken-1">
                  <strong>Observaciones:</strong> {{ solicitudItem.observaciones }}
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
                  
                  <div class="d-flex ga-1">
                    <v-btn
                      v-if="solicitudItem.estado === 'Pendiente'"
                      size="small"
                      color="blue"
                      variant="tonal"
                      @click="cambiarEstado(solicitudItem.id, 'En proceso')"
                    >
                      <v-icon size="small">mdi-play</v-icon>
                    </v-btn>
                    
                    <v-btn
                      v-if="['Pendiente', 'En proceso'].includes(solicitudItem.estado)"
                      size="small"
                      color="green"
                      variant="tonal"
                      @click="cambiarEstado(solicitudItem.id, 'Completada')"
                    >
                      <v-icon size="small">mdi-check</v-icon>
                    </v-btn>
                    
                    <v-btn
                      v-if="['Pendiente', 'En proceso'].includes(solicitudItem.estado)"
                      size="small"
                      color="red"
                      variant="tonal"
                      @click="cambiarEstado(solicitudItem.id, 'Rechazada')"
                    >
                      <v-icon size="small">mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Estados reactivos
const cargando = ref(false)
const solicitudes = ref([])

// Filtros
const filtros = ref({
  estado: null,
  prioridad: null,
  ubicacion: null,
  busqueda: ''
})

// Opciones para filtros
const estadosDisponibles = [
  { title: 'Pendiente', value: 'Pendiente' },
  { title: 'En proceso', value: 'En proceso' },
  { title: 'Completada', value: 'Completada' },
  { title: 'Rechazada', value: 'Rechazada' }
]

const prioridadesDisponibles = [
  { title: 'Baja', value: 'Baja' },
  { title: 'Media', value: 'Media' },
  { title: 'Alta', value: 'Alta' },
  { title: 'Crítica', value: 'Crítica' }
]

const ubicacionesDisponibles = [
  { title: 'Cocina', value: 'Cocina' },
  { title: 'Barra', value: 'Barra' }
]

// Snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Computed
const solicitudesFiltradas = computed(() => {
  let resultado = [...solicitudes.value]

  // Filtro por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(s => s.estado === filtros.value.estado)
  }

  // Filtro por prioridad
  if (filtros.value.prioridad) {
    resultado = resultado.filter(s => s.prioridad === filtros.value.prioridad)
  }

  // Filtro por ubicación
  if (filtros.value.ubicacion) {
    resultado = resultado.filter(s => s.ubicacionSolicitante === filtros.value.ubicacion)
  }

  // Filtro por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(s => 
      s.articulo?.nombre?.toLowerCase().includes(busqueda) ||
      s.observaciones?.toLowerCase().includes(busqueda)
    )
  }

  // Ordenar por prioridad y fecha
  return resultado.sort((a, b) => {
    const prioridadOrder = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 }
    const prioridadA = prioridadOrder[a.prioridad] || 0
    const prioridadB = prioridadOrder[b.prioridad] || 0
    
    if (prioridadA !== prioridadB) {
      return prioridadB - prioridadA // Mayor prioridad primero
    }
    
    return new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud) // Más reciente primero
  })
})

const estadisticas = computed(() => {
  const stats = {
    pendientes: 0,
    enProceso: 0,
    completadas: 0,
    criticas: 0
  }

  solicitudes.value.forEach(s => {
    switch (s.estado) {
      case 'Pendiente':
        stats.pendientes++
        break
      case 'En proceso':
        stats.enProceso++
        break
      case 'Completada':
        stats.completadas++
        break
    }

    if (s.prioridad === 'Crítica' && ['Pendiente', 'En proceso'].includes(s.estado)) {
      stats.criticas++
    }
  })

  return stats
})

// Funciones
const showSnackbar = (text, color = 'success') => {
  snackbar.value.text = text
  snackbar.value.color = color
  snackbar.value.show = true
}

const cargarSolicitudes = async () => {
  cargando.value = true
  try {
    // Cargar solicitudes del backend
  const res = await axios.get('https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario')
    solicitudes.value = res.data

    // Si necesitas cargar información adicional de los artículos
    for (const solicitud of solicitudes.value) {
      if (solicitud.articuloId && !solicitud.articulo) {
        try {
          const articuloRes = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${solicitud.articuloId}`)
          solicitud.articulo = articuloRes.data
        } catch (error) {
          console.error(`Error al cargar artículo ${solicitud.articuloId}:`, error)
          solicitud.articulo = { nombre: 'Artículo no encontrado' }
        }
      }
    }

  } catch (error) {
    console.error('Error al cargar solicitudes:', error)
    showSnackbar('Error al cargar las solicitudes', 'error')
    
    // Datos de ejemplo para pruebas (remover cuando tengas el API)
    solicitudes.value = [
      {
        id: 1,
        articuloId: 1,
        articulo: { nombre: 'Arroz con pollo' },
        cantidad: 5,
        prioridad: 'Alta',
        estado: 'Pendiente',
        ubicacionSolicitante: 'Cocina',
        observaciones: 'Se agotó el stock para la cena',
        fechaSolicitud: new Date().toISOString()
      },
      {
        id: 2,
        articuloId: 2,
        articulo: { nombre: 'Cerveza Corona' },
        cantidad: 24,
        prioridad: 'Crítica',
        estado: 'En proceso',
        ubicacionSolicitante: 'Barra',
        observaciones: 'Necesario para evento de esta noche',
        fechaSolicitud: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  } finally {
    cargando.value = false
  }
}

const cambiarEstado = async (solicitudId, nuevoEstado) => {
  try {
  await axios.patch(`https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario/${solicitudId}`, {
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString()
    })

    // Actualizar localmente
    const solicitud = solicitudes.value.find(s => s.id === solicitudId)
    if (solicitud) {
      solicitud.estado = nuevoEstado
      solicitud.fechaActualizacion = new Date().toISOString()
    }

    const mensaje = {
      'En proceso': 'Solicitud marcada como en proceso',
      'Completada': 'Solicitud completada exitosamente',
      'Rechazada': 'Solicitud rechazada'
    }

    showSnackbar(mensaje[nuevoEstado] || 'Estado actualizado', 'success')

  } catch (error) {
    console.error('Error al cambiar estado:', error)
    showSnackbar('Error al actualizar el estado', 'error')
  }
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente mediante el computed
}

// Funciones de utilidad
const getColorEstado = (estado) => {
  switch (estado) {
    case 'Pendiente': return 'orange'
    case 'En proceso': return 'blue'
    case 'Completada': return 'green'
    case 'Rechazada': return 'red'
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

const getIconPrioridad = (prioridad) => {
  switch (prioridad) {
    case 'Baja': return 'mdi-flag'
    case 'Media': return 'mdi-flag'
    case 'Alta': return 'mdi-flag'
    case 'Crítica': return 'mdi-alert'
    default: return 'mdi-flag'
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
onMounted(() => {
  cargarSolicitudes()
})
</script>