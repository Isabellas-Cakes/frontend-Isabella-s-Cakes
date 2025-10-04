<template>
  <v-container
    fluid
    class="pa-6"
    style="background-color: #f5f5f5; min-height: 100vh"
  >
    <!-- Encabezado -->
    <v-row align="center" justify="space-between" class="mb-6">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h1 class="text-h5 font-weight-bold">📊 Historial de ventas</h1>
      </v-col>
    </v-row>

    <!-- Botón Exportar -->
    <v-row class="mb-4">
      <v-col cols="auto">
        <v-btn color="primary" @click="generarPDF">
          <v-icon left>mdi-file-pdf-box</v-icon>
          Exportar PDF
        </v-btn>
      </v-col>
    </v-row>

    <!-- Dashboard visual (solo pantalla) -->
    <div>
      <!-- Alerta filtro -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-alert
            type="info"
            variant="outlined"
            border="start"
            color="primary"
            icon="mdi-filter"
            class="text-caption font-weight-medium"
          >
            <strong>Filtro aplicado:</strong>
            {{ filtro }}
            <template v-if="filtro === 'Día' && fechaSeleccionada">
              - {{ new Date(fechaSeleccionada).toLocaleDateString() }}
            </template>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Filtros -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="filtro"
            :items="['Día', 'Semana', 'Quincena', 'Mes', 'Año']"
            label="Filtrar por"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4" v-if="filtro === 'Día'">
          <v-text-field
            v-model="fechaSeleccionada"
            type="date"
            label="Selecciona una fecha"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <!-- Tarjetas tipo dashboard -->
      <v-row class="mb-8" dense>
        <v-col cols="12" md="4">
          <v-card
            elevation="2"
            class="pa-4"
            style="border-radius: 12px; background: #e8f5e9"
          >
            <v-row align="center" justify="space-between">
              <div>
                <div class="text-caption font-weight-bold text-uppercase mb-1">
                  INGRESOS DEL DÍA
                </div>
                <div class="text-h5 font-weight-bold text-success">
                  Q {{ totalVendido.toFixed(2) }}
                </div>
                <v-progress-linear
                  :model-value="12"
                  color="green"
                  height="4"
                  rounded
                  class="mt-2"
                />
                <div class="text-caption mt-1 text-grey-darken-1">
                  <template v-if="variacionVsAyer !== null">
                    {{ variacionVsAyer >= 0 ? "+" : "" }}{{ variacionVsAyer }}%
                    vs ayer
                  </template>
                  <template v-else> Sin datos de ayer </template>
                </div>
              </div>
              <v-avatar size="40" color="green lighten-3">
                <v-icon color="green darken-2">mdi-trending-up</v-icon>
              </v-avatar>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            elevation="2"
            class="pa-4"
            style="border-radius: 12px; background: #e3f2fd"
          >
            <v-row align="center" justify="space-between">
              <div>
                <div class="text-caption font-weight-bold text-uppercase mb-1">
                  GANANCIA NETA
                </div>
                <div class="text-h5 font-weight-bold text-primary">
                  Q {{ totalGanancias.toFixed(2) }}
                </div>
                <v-progress-linear
                  :model-value="100"
                  color="blue"
                  height="4"
                  rounded
                  class="mt-2"
                />
                <div class="text-caption mt-1 text-grey-darken-1">
                  Ganancia obtenida
                </div>
              </div>
              <v-avatar size="40" color="blue lighten-3">
                <v-icon color="blue darken-2">mdi-wallet</v-icon>
              </v-avatar>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            elevation="2"
            class="pa-4"
            style="border-radius: 12px; background: #e0f7fa"
          >
            <v-row align="center" justify="space-between">
              <div>
                <div class="text-caption font-weight-bold text-uppercase mb-1">
                  TOTAL MOVIMIENTOS
                </div>
                <div class="text-h5 font-weight-bold text-info">
                  {{ totalMovimientos }}
                </div>
                <v-progress-linear
                  :model-value="100"
                  color="cyan"
                  height="4"
                  rounded
                  class="mt-2"
                />
                <div class="text-caption mt-1 text-grey-darken-1">
                  {{ totalMovimientos }} ventas registradas
                </div>
              </div>
              <v-avatar size="40" color="cyan lighten-3">
                <v-icon color="cyan darken-2">mdi-swap-vertical</v-icon>
              </v-avatar>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sección de Gestión de Inventario -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card elevation="2" class="pa-4" style="border-radius: 12px; background: #f3e5f5">
            <v-card-title class="d-flex align-center mb-4">
              <v-icon class="mr-2" color="purple">mdi-clipboard-list</v-icon>
              📋 Gestión de Inventario
            </v-card-title>
            
            <!-- Tarjetas de estadísticas de solicitudes -->
            <v-row dense>
              <v-col cols="6" md="3">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #fff3e0">
                  <div class="text-center">
                    <v-avatar size="32" color="orange lighten-3" class="mb-2">
                      <v-icon color="orange darken-2" size="20">mdi-clock-outline</v-icon>
                    </v-avatar>
                    <div class="text-h6 font-weight-bold text-orange-darken-2">
                      {{ estadisticasSolicitudes.pendientes }}
                    </div>
                    <div class="text-caption">Pendientes</div>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="6" md="3">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #e3f2fd">
                  <div class="text-center">
                    <v-avatar size="32" color="blue lighten-3" class="mb-2">
                      <v-icon color="blue darken-2" size="20">mdi-cog</v-icon>
                    </v-avatar>
                    <div class="text-h6 font-weight-bold text-blue-darken-2">
                      {{ estadisticasSolicitudes.enProceso }}
                    </div>
                    <div class="text-caption">En Proceso</div>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="6" md="3">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #e8f5e9">
                  <div class="text-center">
                    <v-avatar size="32" color="green lighten-3" class="mb-2">
                      <v-icon color="green darken-2" size="20">mdi-check-circle</v-icon>
                    </v-avatar>
                    <div class="text-h6 font-weight-bold text-green-darken-2">
                      {{ estadisticasSolicitudes.completadas }}
                    </div>
                    <div class="text-caption">Completadas</div>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="6" md="3">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #ffebee">
                  <div class="text-center">
                    <v-avatar size="32" color="red lighten-3" class="mb-2">
                      <v-icon color="red darken-2" size="20">mdi-alert</v-icon>
                    </v-avatar>
                    <div class="text-h6 font-weight-bold text-red-darken-2">
                      {{ estadisticasSolicitudes.criticas }}
                    </div>
                    <div class="text-caption">Críticas</div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Tarjetas de totales económicos de inventario -->
            <v-row class="mt-4" dense>
              <v-col cols="12" md="4">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #fff8e1">
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="amber lighten-3" class="mr-3">
                      <v-icon color="amber darken-2" size="20">mdi-calculator</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-caption font-weight-bold text-uppercase mb-1">
                        COSTO ESTIMADO INVENTARIO
                      </div>
                      <div class="text-h6 font-weight-bold text-amber-darken-2">
                        Q {{ estadisticasSolicitudes.costoEstimado.toFixed(2) }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ estadisticasSolicitudes.totalSolicitudes }} solicitudes
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #e0f2f1">
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="teal lighten-3" class="mr-3">
                      <v-icon color="teal darken-2" size="20">mdi-piggy-bank</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-caption font-weight-bold text-uppercase mb-1">
                        AHORROS ESTIMADOS
                      </div>
                      <div class="text-h6 font-weight-bold text-teal-darken-2">
                        Q {{ estadisticasSolicitudes.ahorrosEstimados.toFixed(2) }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        Gestión eficiente
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card elevation="1" class="pa-3" style="border-radius: 8px; background: #f3e5f5">
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="purple lighten-3" class="mr-3">
                      <v-icon color="purple darken-2" size="20">mdi-percent</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-caption font-weight-bold text-uppercase mb-1">
                        EFICIENCIA
                      </div>
                      <div class="text-h6 font-weight-bold text-purple-darken-2">
                        {{ estadisticasSolicitudes.totalSolicitudes > 0 
                          ? ((estadisticasSolicitudes.completadas / estadisticasSolicitudes.totalSolicitudes) * 100).toFixed(1) 
                          : 0 }}%
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        Tasa de completación
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabla de ventas -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="font-weight-bold"
              >🧾 Detalle de ventas</v-card-title
            >
            <v-data-table
              :items="ventasFormateadas"
              :headers="headers"
              class="elevation-0"
              density="compact"
              no-data-text="No hay ventas registradas para este periodo"
              show-expand
              expand-on-click
            >
              <template v-slot:expanded-row="{ item }">
                <tr>
                  <td colspan="4" class="pa-4">
                    <div class="expanded-details">
                      <h4 class="text-subtitle-2 mb-3">Detalles de transacciones:</h4>
                      <v-row dense>
                        <v-col 
                          v-for="(detalle, index) in item.detalles_completos" 
                          :key="index"
                          cols="12" sm="6" md="4"
                        >
                          <v-card variant="outlined" class="pa-3">
                            <div class="d-flex align-center mb-2">
                              <v-icon 
                                :color="detalle.tipo === 'solicitud_externa' ? 'orange' : 'blue'" 
                                class="mr-2"
                              >
                                {{ detalle.tipo === 'solicitud_externa' ? 'mdi-cake-variant' : 'mdi-cash-register' }}
                              </v-icon>
                              <v-chip 
                                :color="detalle.tipo === 'solicitud_externa' ? 'orange' : 'blue'" 
                                size="x-small" 
                                variant="tonal"
                              >
                                {{ detalle.tipo === 'solicitud_externa' ? 'Pedido Externo' : 'Venta Tradicional' }}
                              </v-chip>
                            </div>
                            
                            <div v-if="detalle.cliente" class="text-caption mb-1">
                              <strong>Cliente:</strong> {{ detalle.cliente }}
                            </div>
                            
                            <div v-if="detalle.descripcion" class="text-caption mb-2">
                              <strong>Producto:</strong> {{ detalle.descripcion }}
                            </div>
                            
                            <div v-if="detalle.cantidad" class="text-caption mb-1">
                              <strong>Cantidad:</strong> {{ detalle.cantidad }}
                            </div>
                            
                            <div class="text-subtitle-2 text-green">
                              <strong>Monto: Q {{ Number(detalle.monto || 0).toFixed(2) }}</strong>
                            </div>
                            
                            <div v-if="detalle.ganancia !== undefined" class="text-caption text-blue mt-1">
                              <strong>Ganancia: Q {{ Number(detalle.ganancia || 0).toFixed(2) }}</strong>
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Listado detallado de productos vendidos -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="font-weight-bold d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>
              📦 Productos vendidos ({{ filtro }})
            </v-card-title>
            <v-card-text>
              <div v-if="productosVendidosDetalle.length === 0" class="text-center pa-6">
                <v-icon size="64" color="grey lighten-1">mdi-package-variant-closed</v-icon>
                <div class="text-h6 mt-2 text-grey">No hay productos vendidos en este período</div>
              </div>
              <div v-else>
                <v-row dense>
                  <v-col 
                    v-for="(producto, index) in productosVendidosDetalle" 
                    :key="index"
                    cols="12" sm="6" md="4" lg="3"
                  >
                    <v-card 
                      variant="outlined" 
                      class="pa-3 producto-card"
                      :class="producto.tipo === 'solicitud_externa' ? 'border-orange' : 'border-blue'"
                    >
                      <div class="d-flex align-center mb-3">
                        <v-avatar 
                          size="32" 
                          :color="producto.tipo === 'solicitud_externa' ? 'orange lighten-4' : 'blue lighten-4'"
                          class="mr-2"
                        >
                          <v-icon 
                            :color="producto.tipo === 'solicitud_externa' ? 'orange darken-2' : 'blue darken-2'"
                            size="20"
                          >
                            {{ producto.tipo === 'solicitud_externa' ? 'mdi-cake-variant' : 'mdi-cash-register' }}
                          </v-icon>
                        </v-avatar>
                        <v-chip 
                          :color="producto.tipo === 'solicitud_externa' ? 'orange' : 'blue'" 
                          size="small" 
                          variant="tonal"
                          class="text-caption"
                        >
                          {{ producto.tipo === 'solicitud_externa' ? 'Pedido Externo' : 'Venta Tradicional' }}
                        </v-chip>
                      </div>
                      
                      <div class="mb-2">
                        <div class="text-body-2 font-weight-bold text-primary mb-1">
                          📅 {{ new Date(producto.fecha).toLocaleDateString() }}
                        </div>
                        
                        <div v-if="producto.cliente" class="text-caption mb-1">
                          <v-icon size="14" class="mr-1">mdi-account</v-icon>
                          <strong>Cliente:</strong> {{ producto.cliente }}
                        </div>
                        
                        <div v-if="producto.descripcion" class="text-caption mb-2">
                          <v-icon size="14" class="mr-1">mdi-text</v-icon>
                          <strong>Producto:</strong> {{ producto.descripcion }}
                        </div>
                        
                        <div v-if="producto.cantidad" class="text-caption mb-1">
                          <v-icon size="14" class="mr-1">mdi-package</v-icon>
                          <strong>Cantidad:</strong> {{ producto.cantidad }}
                        </div>
                        
                        <div class="text-subtitle-2 text-success mb-1">
                          <v-icon size="16" class="mr-1">mdi-currency-usd</v-icon>
                          <strong>Q {{ Number(producto.monto || 0).toFixed(2) }}</strong>
                        </div>
                        
                        <div class="text-caption text-info">
                          <v-icon size="14" class="mr-1">mdi-trending-up</v-icon>
                          <strong>Ganancia: Q {{ Number(producto.ganancia || 0).toFixed(2) }}</strong>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Resumen de productos -->
                <v-divider class="my-4"></v-divider>
                <v-row class="mt-4">
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center pa-3 bg-blue-lighten-5 rounded">
                      <div class="text-h6 text-blue font-weight-bold">{{ totalProductosTradicionales }}</div>
                      <div class="text-caption">Ventas Tradicionales</div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center pa-3 bg-orange-lighten-5 rounded">
                      <div class="text-h6 text-orange font-weight-bold">{{ totalPedidosExternos }}</div>
                      <div class="text-caption">Pedidos Externos</div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center pa-3 bg-green-lighten-5 rounded">
                      <div class="text-h6 text-green font-weight-bold">Q {{ totalMontoProductos.toFixed(2) }}</div>
                      <div class="text-caption">Total en Productos</div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="3">
                    <div class="text-center pa-3 bg-teal-lighten-5 rounded">
                      <div class="text-h6 text-teal font-weight-bold">Q {{ totalGananciaProductos.toFixed(2) }}</div>
                      <div class="text-caption">Ganancia de Productos</div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- Contenido para PDF (oculto en pantalla) -->
    <div
      ref="contenidoPDF"
      v-show="false"
      style="padding: 20px; font-family: Arial, sans-serif"
    >
      <div style="text-align: center; margin-bottom: 10px">
        <img
          :src="logo"
          alt="Logo"
          style="width: 80px; height: auto; margin-bottom: 10px"
        />
        <h2 style="color: #d81b60; margin: 0">INFORME DE VENTAS</h2>
      </div>

      <!-- Resumen -->
      <table
        style="
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          text-align: center;
          font-size: 12px;
        "
      >
        <tr>
          <td style="border: 1px solid #000; padding: 5px">
            <b>Total Vendido:</b><br />Q {{ totalVendido?.toFixed(2) }}
          </td>
          <td style="border: 1px solid #000; padding: 5px">
            <b>Ganancia Neta:</b><br />Q {{ totalGanancias?.toFixed(2) }}
          </td>
          <td style="border: 1px solid #000; padding: 5px">
            <b>Costo Inventario:</b><br />Q {{ estadisticasSolicitudes?.costoEstimado?.toFixed(2) }}
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 5px">
            <b>Total Movimientos:</b><br />{{ totalMovimientos }}
          </td>
          <td style="border: 1px solid #000; padding: 5px">
            <b>Filtro:</b><br />{{ filtro }}
          </td>
          <td style="border: 1px solid #000; padding: 5px">
            <b>Solicitudes:</b><br />{{ estadisticasSolicitudes?.totalSolicitudes }}
          </td>
        </tr>
      </table>

      <!-- Tabla de ventas -->
      <table style="width: 100%; border-collapse: collapse; font-size: 12px">
        <thead>
          <tr
            style="background-color: #d81b60; color: white; text-align: center"
          >
            <th style="border: 1px solid #000; padding: 5px">Fecha</th>
            <th style="border: 1px solid #000; padding: 5px">Total Vendido</th>
            <th style="border: 1px solid #000; padding: 5px">Ganancia</th>
            <th style="border: 1px solid #000; padding: 5px">Productos Vendidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventasFiltradas" :key="venta.fecha">
            <td
              style="border: 1px solid #000; padding: 5px; text-align: center"
            >
              {{ venta.fecha }}
            </td>
            <td
              style="border: 1px solid #000; padding: 5px; text-align: center"
            >
              Q {{ Number(venta.total_vendido || 0).toFixed(2) }}
            </td>
            <td
              style="border: 1px solid #000; padding: 5px; text-align: center"
            >
              Q {{ Number(venta.ganancia || 0).toFixed(2) }}
            </td>
            <td
              style="border: 1px solid #000; padding: 3px; text-align: left; font-size: 10px"
            >
              <div v-for="(detalle, index) in venta.detalles" :key="index" style="margin-bottom: 2px;">
                <span style="font-weight: bold;">
                  {{ detalle.tipo === 'solicitud_externa' ? '🍰' : '🏪' }}
                  {{ detalle.descripcion || 'Producto sin nombre' }}
                </span>
                <span v-if="detalle.cantidad"> (x{{ detalle.cantidad }})</span>
                <span v-if="detalle.cliente"> - {{ detalle.cliente }}</span>
                <span style="color: #007700; font-weight: bold;"> (Q{{ Number(detalle.monto || 0).toFixed(2) }})</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { nextTick } from "vue";

const router = useRouter();

const filtro = ref("Mes");
const fechaSeleccionada = ref("");
const ventas = ref([]);
const solicitudesInventario = ref([]);
const totalMovimientos = ref(0);
const variacionVsAyer = ref(null);

const contenidoPDF = ref(null);
const logo = new URL("@/assets/logo-isabellas.png", import.meta.url).href;
const headers = [
  { title: "Fecha", value: "fecha" },
  { title: "Total vendido", value: "total_vendido" },
  { title: "Ganancia", value: "ganancia" },
  { title: "Detalles", value: "detalles", sortable: false },
];

const cargarVentas = async () => {
  try {
    console.log('🔄 Cargando ventas...');
    
    // Cargar ventas tradicionales - el backend ya incluye nombres y descripciones
  const resVentas = await axios.get("https://api-isabella-s-cakes.onrender.com/api/ventas");
    console.log('📊 Respuesta de ventas:', resVentas.data);
    
    // Cargar solicitudes externas (pedidos fuera) pagadas/entregadas
  const resSolicitudes = await axios.get("https://api-isabella-s-cakes.onrender.com/api/solicitudes");
    
    // Cargar solicitudes de inventario
  const resSolicitudesInventario = await axios.get("https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario");
    solicitudesInventario.value = resSolicitudesInventario.data || [];
    
    // Procesar ventas tradicionales - usar directamente los datos del backend
    const ventasTradicionales = (resVentas.data.resumen || []);
    
    // Procesar solicitudes externas
    const solicitudesCompletas = (resSolicitudes.data || [])
      .filter(s => s.estado === 'pagado' || s.estado === 'entregado')
      .map(s => {
        // Estimación de ganancia para solicitudes externas
        const precioTotal = Number(s.precio_total || 0);
        const costoEstimado = precioTotal * 0.6; // 60% costo, 40% ganancia
        const gananciaNeta = precioTotal - costoEstimado;
        
        return {
          fecha: s.fecha_entrega,
          total_vendido: precioTotal,
          ganancia: gananciaNeta,
          detalles: [{
            tipo: 'solicitud_externa',
            descripcion: s.descripcion || 'Pedido personalizado',
            cliente: s.nombre_cliente,
            monto: precioTotal,
            ganancia: gananciaNeta,
            cantidad: 1
          }]
        };
      });
    
    // Combinar ambas fuentes de datos
    const todasLasVentas = [...ventasTradicionales, ...solicitudesCompletas];
    
    // Agrupar por fecha y sumar totales
    const ventasAgrupadas = {};
    todasLasVentas.forEach(venta => {
      const fecha = venta.fecha;
      if (!ventasAgrupadas[fecha]) {
        ventasAgrupadas[fecha] = {
          fecha: fecha,
          total_vendido: 0,
          ganancia: 0,
          detalles: []
        };
      }
      ventasAgrupadas[fecha].total_vendido += Number(venta.total_vendido || 0);
      ventasAgrupadas[fecha].ganancia += Number(venta.ganancia || 0);
      
      // Agregar todos los detalles
      if (venta.detalles && Array.isArray(venta.detalles)) {
        ventasAgrupadas[fecha].detalles.push(...venta.detalles);
      }
    });
    
    // Convertir objeto agrupado a array
    ventas.value = Object.values(ventasAgrupadas).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Calcular totales
    totalMovimientos.value = (resVentas.data.total_movimientos || 0) + solicitudesCompletas.length;
    variacionVsAyer.value = resVentas.data.variacion_ingresos_vs_ayer ?? null;
    
    console.log('✅ Ventas cargadas:', ventas.value);
    
  } catch (error) {
    console.error("❌ Error al cargar ventas:", error);
  }
};

const ventasFiltradas = computed(() => {
  const ahora = new Date();
  const limite = new Date();

  if (filtro.value === "Día" && fechaSeleccionada.value) {
    return ventas.value.filter((v) => {
      const fechaVenta = new Date(v.fecha).toISOString().slice(0, 10);
      return fechaVenta === fechaSeleccionada.value;
    });
  }

  switch (filtro.value) {
    case "Semana":
      limite.setDate(ahora.getDate() - 7);
      break;
    case "Quincena":
      limite.setDate(ahora.getDate() - 15);
      break;
    case "Mes":
      limite.setMonth(ahora.getMonth() - 1);
      break;
    case "Año":
      limite.setFullYear(ahora.getFullYear() - 1);
      break;
  }

  return ventas.value.filter((v) => new Date(v.fecha) >= limite);
});

const ventasFormateadas = computed(() => 
  ventasFiltradas.value.map(venta => ({
    ...venta,
    total_vendido: `Q ${Number(venta.total_vendido || 0).toFixed(2)}`,
    ganancia: `Q ${Number(venta.ganancia || 0).toFixed(2)}`,
    detalles: venta.detalles?.length > 1 
      ? `${venta.detalles.length} productos` 
      : '1 producto',
    detalles_completos: venta.detalles || []
  }))
);

const totalVendido = computed(() =>
  ventasFiltradas.value.reduce(
    (sum, v) => sum + Number(v.total_vendido || 0),
    0
  )
);

const totalGanancias = computed(() =>
  ventasFiltradas.value.reduce((sum, v) => sum + Number(v.ganancia || 0), 0)
);

// Computed para obtener listado detallado de productos vendidos
const productosVendidosDetalle = computed(() => {
  const productos = [];
  
  ventasFiltradas.value.forEach(venta => {
    if (venta.detalles && Array.isArray(venta.detalles)) {
      venta.detalles.forEach(detalle => {
        productos.push({
          fecha: venta.fecha,
          tipo: detalle.tipo || 'venta_tradicional',
          descripcion: detalle.descripcion || 'Producto sin descripción',
          cliente: detalle.cliente || null,
          cantidad: detalle.cantidad || 1,
          monto: Number(detalle.monto || 0),
          ganancia: Number(detalle.ganancia || 0)
        });
      });
    }
  });
  
  // Ordenar por fecha descendente
  return productos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

// Computed para estadísticas de productos
const totalProductosTradicionales = computed(() => 
  productosVendidosDetalle.value.filter(p => p.tipo === 'venta_tradicional').length
);

const totalPedidosExternos = computed(() => 
  productosVendidosDetalle.value.filter(p => p.tipo === 'solicitud_externa').length
);

const totalMontoProductos = computed(() =>
  productosVendidosDetalle.value.reduce((sum, p) => sum + p.monto, 0)
);

const totalGananciaProductos = computed(() =>
  productosVendidosDetalle.value.reduce((sum, p) => sum + p.ganancia, 0)
);

// Computed para estadísticas de solicitudes de inventario
const estadisticasSolicitudes = computed(() => {
  const stats = {
    pendientes: 0,
    enProceso: 0,
    completadas: 0,
    criticas: 0,
    totalSolicitudes: 0,
    costoEstimado: 0,
    ahorrosEstimados: 0
  };

  solicitudesInventario.value.forEach(s => {
    stats.totalSolicitudes++;
    
    // Estimación de costos (precio promedio por artículo * cantidad)
    const costoEstimadoItem = (s.cantidad || 1) * 50; // Q50 promedio por artículo
    stats.costoEstimado += costoEstimadoItem;
    
    // Ahorros estimados al gestionar inventario eficientemente
    if (s.estado === 'Completada') {
      stats.ahorrosEstimados += costoEstimadoItem * 0.15; // 15% de ahorro
    }

    switch (s.estado) {
      case 'Pendiente':
        stats.pendientes++;
        break;
      case 'En proceso':
        stats.enProceso++;
        break;
      case 'Completada':
        stats.completadas++;
        break;
    }

    if (s.prioridad === 'Crítica' && ['Pendiente', 'En proceso'].includes(s.estado)) {
      stats.criticas++;
    }
  });

  return stats;
});

const generarPDF = async () => {
  const element = contenidoPDF.value;
  if (!element) return;

  const originalDisplay = element.style.display;
  element.style.display = "block";

  await nextTick();

  const fecha = new Date().toISOString().slice(0, 10);

  html2pdf()
    .set({
      margin: 0.3,
      filename: `Historial_Ventas_${fecha}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    })
    .from(element)
    .save()
    .finally(() => {
      element.style.display = originalDisplay;
    });
};

onMounted(() => {
  cargarVentas();
});
</script>

<style scoped>
.expanded-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.expanded-details h4 {
  color: #2c3e50;
  margin-bottom: 12px;
}

.expanded-details .v-card {
  transition: transform 0.2s ease;
}

.expanded-details .v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.producto-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.producto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.border-orange {
  border-left-color: #ff9800 !important;
}

.border-blue {
  border-left-color: #2196f3 !important;
}

.bg-blue-lighten-5 {
  background-color: #e3f2fd !important;
}

.bg-orange-lighten-5 {
  background-color: #fff3e0 !important;
}

.bg-green-lighten-5 {
  background-color: #e8f5e9 !important;
}

.bg-teal-lighten-5 {
  background-color: #e0f2f1 !important;
}
</style>