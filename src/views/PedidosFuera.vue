<template>
  <v-container class="py-6">
    <!-- Encabezado -->
    <v-row class="align-center mb-6">
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-shopping</v-icon>
        <h2 class="text-h5 font-weight-bold mb-0">Pedidos Externos</h2>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end gap-2">
        <v-btn color="teal" prepend-icon="mdi-view-grid" @click="$router.push('/categorias-externas')">
          Categorías y Artículos
        </v-btn>
        <v-btn color="green" prepend-icon="mdi-plus" @click="openNuevoPedido">
          Nuevo Pedido
        </v-btn>
        <v-btn icon variant="tonal" color="primary" @click="fetchPedidos" :aria-label="'Actualizar'">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn icon variant="tonal" @click="clearFilters" :aria-label="'Limpiar filtros'">
          <v-icon>mdi-broom</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-btn-toggle v-model="ui.tab" color="primary" rounded group class="mb-4">
      <v-btn value="pendiente"><v-icon start>mdi-clock-outline</v-icon>Pendientes</v-btn>
      <v-btn value="preparacion"><v-icon start>mdi-chef-hat</v-icon>En Preparación</v-btn>
      <v-btn value="entregados"><v-icon start>mdi-truck-check</v-icon>Entregados</v-btn>
      <v-btn value="pagados"><v-icon start>mdi-cash-check</v-icon>Pagados</v-btn>
    </v-btn-toggle>

    <!-- Filtro de búsqueda -->
    <v-card elevation="1" class="mb-4">
      <v-card-text class="pa-3">
        <v-text-field 
          v-model="ui.search" 
          density="compact" 
          variant="outlined" 
          hide-details 
          clearable
          prepend-inner-icon="mdi-magnify" 
          placeholder="Buscar por nombre del cliente"
          class="mx-auto"
          style="max-width: 400px;"
          @input="handleSearchInput"
        />
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <v-skeleton-loader v-if="loading" type="card, card, card" class="mt-4" />

    <!-- Error -->
    <v-alert v-else-if="error" type="error" border="start" class="mt-6">{{ error }}</v-alert>

    <!-- Empty -->
    <v-alert v-else-if="itemsFiltered.length === 0" type="info" border="start" class="mt-6">
      No hay resultados con los filtros actuales.
    </v-alert>

    <!-- Lista de pedidos con diseño mejorado -->
    <div v-else class="mt-4">
      <v-row>
        <v-col 
          v-for="pedido in itemsSorted" 
          :key="pedido.id_pedido_externo" 
          cols="12" 
          md="6" 
          lg="4"
        >
          <v-card 
            elevation="3" 
            class="pedido-card ma-2" 
            :class="`estado-${pedido.estado}`"
            hover
          >
            <!-- Header con estado y cliente -->
            <v-card-title class="d-flex justify-space-between align-center pa-4 pb-2">
              <div>
                <h3 class="text-h6 font-weight-bold mb-1">
                  {{ pedido.nombre_cliente || 'Sin nombre' }}
                </h3>
                <div class="text-caption text-medium-emphasis">
                  {{ fechaLarga(pedido.fecha_entrega) }}
                </div>
              </div>
              <v-chip 
                :color="chipColor(pedido.estado)" 
                size="small" 
                variant="flat"
                class="font-weight-bold"
              >
                <v-icon start size="14">{{ estadoIcon(pedido.estado) }}</v-icon>
                {{ estadoTexto(pedido.estado) }}
              </v-chip>
            </v-card-title>

            <!-- Contenido principal -->
            <v-card-text class="pa-4 pt-2">
              <!-- Información del pedido -->
              <div class="mb-3">
                <div class="d-flex align-center mb-2">
                  <v-icon size="18" color="primary" class="mr-2">mdi-package-variant</v-icon>
                  <span class="text-body-2">
                    <strong>{{ pedido.detalles?.length || 0 }}</strong> artículo(s)
                  </span>
                </div>
                
                <div v-if="pedido.telefono" class="d-flex align-center mb-2">
                  <v-icon size="18" color="blue" class="mr-2">mdi-phone</v-icon>
                  <span class="text-body-2">{{ pedido.telefono }}</span>
                </div>
                
                <div v-if="Number(pedido.total) > 0" class="d-flex align-center mb-2">
                  <v-icon size="18" color="green" class="mr-2">mdi-currency-usd</v-icon>
                  <span class="text-body-2 font-weight-bold">Q{{ Number(pedido.total).toFixed(2) }}</span>
                </div>
              </div>

              <!-- Artículos -->
              <div v-if="pedido.detalles?.length > 0" class="mb-3">
                <div class="text-caption font-weight-medium text-primary mb-2">ARTÍCULOS:</div>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip 
                    v-for="detalle in pedido.detalles.slice(0, 3)" 
                    :key="detalle.id_detalle"
                    size="x-small" 
                    variant="outlined"
                    color="primary"
                  >
                    {{ detalle.cantidad }}× {{ detalle.articulo_externo?.nombre || 'Artículo' }}
                  </v-chip>
                  <v-chip 
                    v-if="pedido.detalles.length > 3"
                    size="x-small" 
                    variant="text"
                    color="grey"
                  >
                    +{{ pedido.detalles.length - 3 }} más
                  </v-chip>
                </div>
              </div>

              <!-- Notas -->
              <div v-if="pedido.notas" class="mb-3">
                <div class="text-caption font-weight-medium text-primary mb-1">NOTAS:</div>
                <div class="text-body-2 text-medium-emphasis italic">
                  {{ pedido.notas }}
                </div>
              </div>
            </v-card-text>

            <!-- Acciones -->
            <v-card-actions class="pa-4 pt-0 d-flex justify-space-between align-center">
              <!-- Botón principal -->
              <v-btn 
                v-if="pedido.estado === 'pendiente'"
                color="blue" 
                variant="flat"
                size="small"
                @click="quickEstado(pedido,'en_preparacion')"
                class="flex-grow-1 mr-2"
              >
                <v-icon start size="16">mdi-chef-hat</v-icon>
                Preparar
              </v-btn>
              
              <v-btn 
                v-else-if="pedido.estado === 'en_preparacion'"
                color="success" 
                variant="flat"
                size="small"
                @click="quickEstado(pedido,'entregado')"
                class="flex-grow-1 mr-2"
              >
                <v-icon start size="16">mdi-truck-check</v-icon>
                Entregar
              </v-btn>
              
              <v-btn 
                v-else-if="pedido.estado === 'entregado'"
                color="purple" 
                variant="flat"
                size="small"
                @click="quickEstado(pedido,'pagado')"
                class="flex-grow-1 mr-2"
              >
                <v-icon start size="16">mdi-cash-check</v-icon>
                Pagar
              </v-btn>
              
              <v-chip 
                v-else
                color="success" 
                variant="flat" 
                size="small"
                class="flex-grow-1 mr-2"
              >
                <v-icon start size="16">mdi-check-circle</v-icon>
                Completado
              </v-chip>

              <!-- Menú de opciones -->
              <v-menu>
                <template #activator="{ props }">
                  <v-btn 
                    icon 
                    size="small" 
                    variant="text" 
                    v-bind="props"
                    class="ml-2"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item 
                    :disabled="!canDelete(pedido)" 
                    @click="confirmDelete(pedido)"
                    class="text-red"
                  >
                    <v-list-item-title>
                      <v-icon start size="16">mdi-delete</v-icon> 
                      Eliminar
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Dialog crear pedido -->
    <v-dialog v-model="dialog.open" max-width="800" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-plus</v-icon>
          Nuevo Pedido Externo
        </v-card-title>
        <v-divider />
        
        <v-card-text class="pa-6">
          <!-- Datos del cliente -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <v-icon start>mdi-information</v-icon>
            Complete la información del cliente y seleccione los artículos para el pedido
          </v-alert>
          
          <h4 class="text-h6 mb-3">
            <v-icon class="mr-2">mdi-account-circle</v-icon>
            Información del Cliente
          </h4>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.nombre_cliente" 
                label="Nombre del cliente*" 
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                :rules="[rules.required]"
                hint="Ingrese el nombre completo del cliente"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.telefono" 
                label="Teléfono (opcional)" 
                prepend-inner-icon="mdi-phone" 
                variant="outlined"
                hint="Número de contacto del cliente"
              />
            </v-col>
          </v-row>
          
          <h4 class="text-h6 mb-3 mt-4">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Programación de Entrega
          </h4>
          
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="form.fecha_entrega" 
                type="date" 
                label="Fecha de entrega*" 
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                required
                :rules="[rules.required]"
                hint="Seleccione la fecha de entrega"
                :min="new Date().toISOString().slice(0, 10)"
              />
            </v-col>
          </v-row>

          <v-textarea 
            v-model="form.notas" 
            label="Notas del pedido (opcional)" 
            rows="2" 
            prepend-inner-icon="mdi-note-text" 
            variant="outlined"
            hint="Instrucciones especiales o comentarios adicionales"
          />

          <!-- Selección de artículos externos -->
          <v-divider class="my-6" />
          <h4 class="text-h6 mb-4">
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            Artículos del Pedido
          </h4>
          
          <v-alert v-if="form.detalles.length === 0" type="warning" variant="tonal" class="mb-4">
            <v-icon start>mdi-alert-circle</v-icon>
            Debe agregar al menos un artículo para crear el pedido
          </v-alert>

          <!-- Selector de artículos -->
          <v-row align="center" class="mb-4">
            <v-col cols="12" md="8">
              <v-autocomplete
                v-model="selectedArticulo"
                :items="articulosExternos"
                item-title="nombre"
                item-value="id_articulo"
                label="Buscar artículo externo"
                prepend-inner-icon="mdi-magnify"
                clearable
                :loading="loadingArticulos"
                return-object
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-avatar size="small">
                        <v-img v-if="item.raw.imagen" :src="`https://api-isabella-s-cakes.onrender.com${item.raw.imagen}`" />
                        <v-icon v-else>mdi-package-variant</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ item.raw.nombre }}</v-list-item-title>
                    <v-list-item-subtitle>Q{{ item.raw.precio }} - Stock: {{ item.raw.stock_actual }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn 
                color="primary" 
                :disabled="!selectedArticulo"
                @click="agregarArticulo"
                block
              >
                <v-icon start>mdi-plus</v-icon>
                Agregar
              </v-btn>
            </v-col>
          </v-row>

          <!-- Lista de artículos agregados -->
          <v-card v-if="form.detalles.length > 0" variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">
              Artículos agregados ({{ form.detalles.length }})
            </v-card-title>
            <v-divider />
            <v-list density="compact">
              <v-list-item 
                v-for="(detalle, index) in form.detalles" 
                :key="index"
                class="px-4"
              >
                <template #prepend>
                  <v-avatar size="small">
                    <v-img v-if="detalle.articulo.imagen" :src="`https://api-isabella-s-cakes.onrender.com${detalle.articulo.imagen}`" />
                    <v-icon v-else>mdi-package-variant</v-icon>
                  </v-avatar>
                </template>
                
                <v-list-item-title>{{ detalle.articulo.nombre }}</v-list-item-title>
                <v-list-item-subtitle>
                  Q{{ detalle.precio_unitario }} c/u × {{ detalle.cantidad }} = Q{{ detalle.subtotal }}
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center gap-2">
                    <v-btn 
                      icon="mdi-minus" 
                      size="x-small" 
                      variant="outlined"
                      :disabled="detalle.cantidad <= 1"
                      @click="detalle.cantidad--; actualizarSubtotal(detalle)"
                    />
                    <span class="text-subtitle-2 mx-2">{{ detalle.cantidad }}</span>
                    <v-btn 
                      icon="mdi-plus" 
                      size="x-small" 
                      variant="outlined"
                      @click="detalle.cantidad++; actualizarSubtotal(detalle)"
                    />
                    <v-btn 
                      icon="mdi-delete" 
                      size="x-small" 
                      color="red" 
                      variant="text"
                      @click="form.detalles.splice(index, 1)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
            
            <v-divider />
            <v-card-actions class="justify-end">
              <div class="text-h6 font-weight-bold text-primary">
                Total: Q{{ totalPedido.toFixed(2) }}
              </div>
            </v-card-actions>
          </v-card>

          <v-alert v-else type="info" variant="outlined">
            <v-icon start>mdi-information</v-icon>
            Agrega al menos un artículo para crear el pedido
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialog">
            Cancelar
          </v-btn>
          <v-btn 
            color="green" 
            :disabled="!formValido || loading"
            :loading="loading"
            @click="crearPedido"
          >
            <v-icon start>mdi-content-save</v-icon> 
            Crear Pedido
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Otros dialogs y snackbar como antes... -->
    <v-snackbar v-model="snackbar.show" timeout="3500" :color="snackbar.color" location="top">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

/* -------- Config -------- */
const API_PEDIDOS = 'https://api-isabella-s-cakes.onrender.com/api/pedidos-externos'
const API_ARTICULOS = 'https://api-isabella-s-cakes.onrender.com/api/articulos-externos'

/* -------- State -------- */
const ui = ref({ tab: 'pendiente', search: '' })
const snackbar = ref({ show: false, text: '', color: 'green' })
const dialog = ref({ open: false })
const loading = ref(false)
const loadingArticulos = ref(false)
const error = ref('')
const items = ref([])
const articulosExternos = ref([])
const selectedArticulo = ref(null)

const form = ref({
  nombre_cliente: '',
  telefono: '',
  fecha_entrega: '',
  hora_entrega: '',
  notas: '',
  detalles: []
})

const rules = {
  required: value => !!value || 'Este campo es requerido'
}

/* -------- Computed -------- */
const totalPedido = computed(() => {
  const total = form.value.detalles.reduce((sum, detalle) => {
    const subtotal = Number(detalle.subtotal) || 0
    return sum + subtotal
  }, 0)
  return Number(total) || 0
})

const formValido = computed(() => {
  return form.value.nombre_cliente.trim() && 
         form.value.fecha_entrega && 
         form.value.detalles.length > 0
})

const itemsFiltered = computed(() => {
  let filtered = [...items.value]
  
  // Filtro por tab (estado)
  switch(ui.value.tab) {
    case 'pendiente':
      filtered = filtered.filter(p => p.estado === 'pendiente')
      break
    case 'preparacion':
      filtered = filtered.filter(p => p.estado === 'en_preparacion')
      break
    case 'entregados':
      filtered = filtered.filter(p => p.estado === 'entregado')
      break
    case 'pagados':
      filtered = filtered.filter(p => p.estado === 'pagado')
      break
  }
  
  // Filtro por texto (solo nombre del cliente)
  if (ui.value.search?.trim()) {
    const search = ui.value.search.toLowerCase().trim()
    filtered = filtered.filter(p => 
      (p.nombre_cliente || '').toLowerCase().includes(search)
    )
  }
  
  return filtered
})

const itemsSorted = computed(() => {
  return [...itemsFiltered.value].sort((a, b) => {
    return new Date(b.fecha_entrega) - new Date(a.fecha_entrega)
  })
})

/* -------- Methods -------- */
function toast(text, color = 'green') {
  snackbar.value = { show: true, text, color }
}

function chipColor(estado) {
  switch(estado?.toLowerCase()) {
    case 'pendiente': return 'orange'
    case 'en_preparacion': return 'blue'
    case 'entregado': return 'green'
    case 'pagado': return 'purple'
    default: return 'grey'
  }
}

function estadoIcon(estado) {
  switch(estado?.toLowerCase()) {
    case 'pendiente': return 'mdi-clock-outline'
    case 'en_preparacion': return 'mdi-chef-hat'
    case 'entregado': return 'mdi-truck-check'
    case 'pagado': return 'mdi-cash-check'
    default: return 'mdi-help-circle'
  }
}

function estadoTexto(estado) {
  switch(estado?.toLowerCase()) {
    case 'pendiente': return 'Pendiente'
    case 'en_preparacion': return 'En Preparación'
    case 'entregado': return 'Entregado'
    case 'pagado': return 'Pagado'
    default: return 'Desconocido'
  }
}

function fechaLarga(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function canDelete(pedido) {
  return pedido.estado === 'pendiente'
}

async function fetchPedidos() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(API_PEDIDOS)
    items.value = data || []
  } catch (e) {
    error.value = 'Error al cargar pedidos'
    items.value = []
  } finally {
    loading.value = false
  }
}

async function fetchArticulosExternos() {
  loadingArticulos.value = true
  try {
    const { data } = await axios.get(API_ARTICULOS)
    articulosExternos.value = data || []
  } catch (e) {
    toast('Error al cargar artículos externos', 'error')
  } finally {
    loadingArticulos.value = false
  }
}

function openNuevoPedido() {
  form.value = {
    nombre_cliente: '',
    telefono: '',
    fecha_entrega: new Date().toISOString().slice(0, 10),
    hora_entrega: '12:00',
    notas: '',
    detalles: []
  }
  dialog.value.open = true
}

function cerrarDialog() {
  dialog.value.open = false
  selectedArticulo.value = null
}

function agregarArticulo() {
  if (!selectedArticulo.value) return
  
  const articulo = selectedArticulo.value
  const existe = form.value.detalles.find(d => d.id_articulo_externo === articulo.id_articulo)
  
  if (existe) {
    existe.cantidad++
    actualizarSubtotal(existe)
    toast('Cantidad aumentada', 'info')
  } else {
    const precio = Number(articulo.precio) || 0
    const detalle = {
      id_articulo_externo: articulo.id_articulo,
      articulo: articulo,
      cantidad: 1,
      precio_unitario: precio,
      subtotal: precio,
      observaciones: ''
    }
    form.value.detalles.push(detalle)
    toast('Artículo agregado', 'success')
  }
  
  selectedArticulo.value = null
}

function actualizarSubtotal(detalle) {
  const cantidad = Number(detalle.cantidad) || 0
  const precio = Number(detalle.precio_unitario) || 0
  detalle.subtotal = cantidad * precio
}

async function crearPedido() {
  if (!formValido.value) return
  
  loading.value = true
  try {
    const payload = {
      nombre_cliente: form.value.nombre_cliente.trim(),
      telefono: form.value.telefono?.trim() || null,
      fecha_entrega: form.value.fecha_entrega,
      hora_entrega: form.value.hora_entrega,
      notas: form.value.notas?.trim() || null,
      total: totalPedido.value,
      estado: 'pendiente',
      detalles: form.value.detalles.map(d => ({
        id_articulo_externo: d.id_articulo_externo,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
        observaciones: d.observaciones || null
      }))
    }
    
    const { data } = await axios.post(API_PEDIDOS, payload)
    items.value.unshift(data.pedido || data)
    toast('¡Pedido creado exitosamente!', 'success')
    cerrarDialog()
    
  } catch (e) {
    toast(`Error al crear pedido: ${e.response?.data?.message || 'Inténtalo de nuevo'}`, 'error')
  } finally {
    loading.value = false
  }
}

async function quickEstado(pedido, nuevoEstado) {
  try {
    await axios.patch(`${API_PEDIDOS}/${pedido.id_pedido_externo}/estado`, { 
      estado: nuevoEstado 
    })
    pedido.estado = nuevoEstado
    toast(`Estado actualizado: ${nuevoEstado}`, 'success')
  } catch (e) {
    toast('Error al actualizar estado', 'error')
  }
}

function clearFilters() {
  ui.value.search = ''
  fetchPedidos()
}

function handleSearchInput() {
  // La búsqueda es reactiva, no necesita hacer nada especial
}

function confirmDelete(pedido) {
  // TODO: Implementar confirmación de eliminación
  if (confirm(`¿Estás seguro de eliminar el pedido de ${pedido.nombre_cliente}?`)) {
    deletePedido(pedido)
  }
}

async function deletePedido(pedido) {
  try {
    await axios.delete(`${API_PEDIDOS}/${pedido.id_pedido_externo}`)
    const index = items.value.findIndex(p => p.id_pedido_externo === pedido.id_pedido_externo)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
    toast('Pedido eliminado correctamente', 'success')
  } catch (e) {
    toast('Error al eliminar el pedido', 'error')
  }
}

/* -------- Lifecycle -------- */
onMounted(() => {
  fetchPedidos()
  fetchArticulosExternos()
})
</script>

<style scoped>
/* Estilos mejorados para las tarjetas de pedidos */
.pedido-card {
  transition: all 0.3s ease !important;
  border-radius: 12px !important;
  position: relative;
  overflow: hidden;
}

.pedido-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.pedido-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--estado-color);
}

/* Estados con colores */
.estado-pendiente {
  --estado-color: #FF9800;
}

.estado-pendiente::before {
  background: #FF9800;
}

.estado-en_preparacion {
  --estado-color: #2196F3;
}

.estado-en_preparacion::before {
  background: #2196F3;
}

.estado-entregado {
  --estado-color: #4CAF50;
}

.estado-entregado::before {
  background: #4CAF50;
}

.estado-pagado {
  --estado-color: #9C27B0;
}

.estado-pagado::before {
  background: #9C27B0;
}

/* Animaciones y efectos */
.pedido-card .v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.pedido-card .v-chip {
  font-size: 11px !important;
  height: 24px !important;
}

/* Responsive design mejorado */
@media (max-width: 960px) {
  .pedido-card {
    margin: 8px 4px !important;
  }
}

@media (max-width: 600px) {
  .pedido-card .v-card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .pedido-card .v-card-actions .v-btn {
    width: 100%;
    margin: 0 !important;
  }
  
  .pedido-card .v-card-actions .v-menu {
    align-self: flex-end;
  }
}

/* Estilos para la información */
.pedido-card .text-primary {
  color: rgba(25, 118, 210, 0.87) !important;
}

.pedido-card .v-icon {
  opacity: 0.8;
}

/* Hover effects para botones */
.pedido-card .v-btn {
  transition: all 0.2s ease;
}

.pedido-card .v-btn:hover {
  transform: translateY(-1px);
}

/* Estilos heredados y limpios */
.card--hover {
  transition: all 0.3s ease;
  cursor: pointer;
}

.card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.border-orange {
  border-left-color: #FF9800 !important;
}

.border-blue {
  border-left-color: #2196F3 !important;
}

.border-green {
  border-left-color: #4CAF50 !important;
}

.border-purple {
  border-left-color: #9C27B0 !important;
}

.border-grey {
  border-left-color: #9E9E9E !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-timeline-item .v-timeline-item__body {
  padding-left: 16px !important;
}

.text-none {
  text-transform: none !important;
}

.fade-transition {
  transition: opacity 0.3s ease;
}

/* Mejoras para dispositivos móviles */
@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 8px;
  }
  
  .card--hover {
    margin-bottom: 16px;
  }
  
  .v-timeline {
    padding-left: 0;
  }
  
  .v-timeline-item__opposite {
    display: none;
  }
}
</style>