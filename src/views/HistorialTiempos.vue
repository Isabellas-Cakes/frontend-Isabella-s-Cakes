<template>


  <v-container fluid class="pa-4 pa-md-6">
    <h1 class="text-h4 text-md-h3 font-weight-bold mb-4">⏱️ Control de Tiempos Detallado</h1>
    <!-- KPIs resumen -->
    <v-row class="mb-6" dense>
      <!-- Total Movimientos removido -->
      <v-col cols="6" sm="3">
        <div class="kpi-resumen kpi-verde">
          <div class="kpi-label">Excelente (≤14 min)</div>
          <div class="kpi-value">{{ totalVerde }}</div>
        </div>
      </v-col>
      <v-col cols="6" sm="3">
        <div class="kpi-resumen kpi-amarillo">
          <div class="kpi-label">En límite (15-18 min)</div>
          <div class="kpi-value">{{ totalAmarillo }}</div>
        </div>
      </v-col>
      <v-col cols="6" sm="3">
        <div class="kpi-resumen kpi-rojo">
          <div class="kpi-label">Crítico (&gt;20 min)</div>
          <div class="kpi-value">{{ totalRojo }}</div>
        </div>
      </v-col>
      <v-col cols="12" sm="12">
        <div class="kpi-resumen kpi-promedio">
          <div class="kpi-label">Promedio Tiempo Preparación</div>
            <div class="kpi-value kpi-total">{{ promedioTiempoPreparacion }}</div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6" elevation="4" rounded="xl">
          <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-4 mb-md-6 ga-3">
            <h3 class="text-h6 text-md-h5">📋 Últimos Pedidos</h3>
            <v-text-field
              v-model="busqueda"
              append-inner-icon="mdi-magnify"
              label="Buscar..."
              variant="outlined"
              density="compact"
              style="max-width: 300px; width: 100%;"
              hide-details
            />
          </div>
          <!-- Gráfica de eficiencia general (línea) -->
          <div class="mb-6">
            <v-card class="pa-4 pa-md-6" elevation="2" rounded="xl">
              <h3 class="text-h6 text-md-h5 mb-4">📈 Eficiencia General</h3>
              <LineChartEficiencia :pedidos="pedidosFiltradosRecientes" />
            </v-card>
          </div>
          <div class="table-responsive">
            <table class="kpi-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Estado</th>
                  <th>Inicio Pedido</th>
                  <th>Inicio Prep.</th>
                  <!-- <th>Espera</th> -->
                  <th>Fin Prep.</th>
                  <th>Prep.</th>
                  <th>Inicio Consumo</th>
                  <!-- <th>Espera Comer</th> -->
                  <th>Fin Consumo</th>
                  <th>Consumo</th>
                  <th>Pagado</th>
                  <th>Pago tras Consumo</th>
                  <th>Tiempo Preparación</th>
                  <th>Tiempo Pago</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pedido in pedidosFiltradosRecientes" :key="pedido.id_pedido">
                  <td class="desc">#{{ pedido.id_pedido }}</td>
                  <td :class="['estado', pedido.estado === 'pagado' ? 'estado-pagado' : '']">{{ pedido.estado }}</td>
                  <td>{{ formatear(pedido.fecha_creacion) }}</td>
                  <td>{{ formatear(pedido.inicio_preparacion) }}</td>
                  <!-- <td>{{ mostrarMinutos(pedido.espera_preparacion) }}</td> -->
                  <td>{{ formatear(pedido.fin_preparacion) }}</td>
                  <td>{{ mostrarMinutos(pedido.tiempo_preparacion) }}</td>
                  <td>{{ formatear(pedido.inicio_consumo) }}</td>
                  <!-- <td>{{ mostrarMinutos(pedido.espera_comer) }}</td> -->
                  <td>{{ formatear(pedido.fin_consumo) }}</td>
                  <td>{{ mostrarMinutos(pedido.tiempo_consumo) }}</td>
                  <td>{{ formatear(pedido.fecha_pagado) }}</td>
                  <td>{{ mostrarMinutos(pedido.pago_tras_consumo) }}</td>
                  <td :class="['kpi-bold', getTiempoColorClass(pedido)]" :title="getTiempoTooltip(pedido)">{{ calcularTiempoPreparacion(pedido) }}</td>
                  <td>{{ calcularTiempoPago(pedido) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="pedidosFiltradosRecientes.length === 0" class="text-center py-8 text-grey">
            <v-icon size="48" class="mb-2">mdi-clipboard-list</v-icon>
            <p>No hay pedidos registrados</p>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- Tabla de artículos preparados por pedido (debajo de Últimos Pedidos) -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6 mt-6" elevation="4" rounded="xl">
          <h3 class="text-h6 text-md-h5 mb-4">🍰 Artículos preparados y sus tiempos</h3>
          <div class="table-responsive">
            <table class="kpi-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Artículo</th>
                  <th>Tiempo Preparación</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in articulosPreparadosFlat" :key="item.key">
                  <td>#{{ item.pedido }}</td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ mostrarMinutos(item.tiempo_preparacion) }}</td>
                </tr>
                <tr v-if="articulosPreparadosFlat.length === 0">
                  <td colspan="3" class="text-center">No hay artículos preparados registrados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Lista aplanada de artículos preparados de todos los pedidos filtrados
const articulosPreparadosFlat = computed(() => {
  const arr = [];
  pedidosFiltradosRecientes.value.forEach(pedido => {
    if (pedido.articulos_preparados && Array.isArray(pedido.articulos_preparados)) {
      pedido.articulos_preparados.forEach(articulo => {
        arr.push({
          pedido: pedido.id_pedido,
          nombre: articulo.nombre,
          tiempo_preparacion: articulo.tiempo_preparacion,
          key: pedido.id_pedido + '-' + articulo.nombre
        });
      });
    }
  });
  return arr;
});
// Devuelve la clase de color para la celda de tiempo real
function getTiempoColorClass(pedido) {
  const t = calcularMinutos(pedido);
  if (t === null) return '';
  if (t <= 14) return 'tiempo-verde';
  if (t > 14 && t <= 18) return 'tiempo-amarillo';
  if (t > 18) return 'tiempo-rojo';
  return '';
}

function getTiempoTooltip(pedido) {
  const t = calcularMinutos(pedido);
  if (t === null) return '';
  if (t <= 14) return 'Excelente (≤14 min)';
  if (t > 14 && t <= 18) return 'En límite (15-18 min)';
  if (t > 18) return 'Crítico (>18 min)';
  return '';
}
// KPIs resumen
const totalVerde = computed(() => pedidosFiltradosRecientes.value.filter(p => {
  const t = calcularMinutosPreparacion(p);
  return t !== null && t <= 14;
}).length);

const totalAmarillo = computed(() => pedidosFiltradosRecientes.value.filter(p => {
  const t = calcularMinutosPreparacion(p);
  return t !== null && t > 14 && t <= 18;
}).length);

const totalRojo = computed(() => pedidosFiltradosRecientes.value.filter(p => {
  const t = calcularMinutosPreparacion(p);
  return t !== null && t > 20;
}).length);

const promedioTiempoPreparacion = computed(() => {
  const tiempos = pedidosFiltradosRecientes.value.map(p => calcularMinutosPreparacion(p)).filter(t => t !== null);
  if (!tiempos.length) return 'N/D';
  const prom = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
  return `${prom} min`;
});

function calcularMinutosPreparacion(pedido) {
  if (!pedido.fecha_creacion || !pedido.fin_preparacion) return null;
  const inicio = dayjs(pedido.fecha_creacion);
  const fin = dayjs(pedido.fin_preparacion);
  const minutos = fin.diff(inicio, 'minute');
  return isNaN(minutos) ? null : minutos;
}

const calcularTiempoPreparacion = (pedido) => {
  if (!pedido.fecha_creacion || !pedido.fin_preparacion) return 'N/D';
  const inicio = dayjs(pedido.fecha_creacion);
  const fin = dayjs(pedido.fin_preparacion);
  const minutos = fin.diff(inicio, 'minute');
  return isNaN(minutos) ? 'N/D' : `${minutos} min`;
};

const calcularTiempoPago = (pedido) => {
  if (!pedido.fin_preparacion || !pedido.fecha_pagado) return 'N/D';
  const inicio = dayjs(pedido.fin_preparacion);
  const fin = dayjs(pedido.fecha_pagado);
  const minutos = fin.diff(inicio, 'minute');
  return isNaN(minutos) ? 'N/D' : `${minutos} min`;
};
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import dayjs from "dayjs";
                  import { Line } from 'vue-chartjs';
                  import {
                    Chart,
                    LineElement,
                    PointElement,
                    CategoryScale,
                    LinearScale,
                    Tooltip,
                    Legend
                  } from 'chart.js';
                  Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

                  import { defineComponent, h } from 'vue';

                  const LineChartEficiencia = defineComponent({
                    name: 'LineChartEficiencia',
                    props: {
                      pedidos: { type: Array, required: true }
                    },
                    setup(props) {
                      // Calcular eficiencia acumulada por pedido (simula evolución en el tiempo)
                      const labels = computed(() => props.pedidos.map(p => `#${p.id_pedido}`));
                      const dataEficiencia = computed(() => {
                        let verdes = 0;
                        return props.pedidos.map((p, i) => {
                          const t = p.fecha_creacion && p.fecha_pagado ? dayjs(p.fecha_pagado).diff(dayjs(p.fecha_creacion), 'minute') : null;
                          if (t !== null && t <= 14) verdes++;
                          return Math.round((verdes / (i + 1)) * 100);
                        });
                      });
                      const data = computed(() => ({
                        labels: labels.value,
                        datasets: [
                          {
                            label: 'Eficiencia acumulada (%)',
                            data: dataEficiencia.value,
                            fill: false,
                            borderColor: '#1abc6c',
                            backgroundColor: '#1abc6c',
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#1abc6c',
                          }
                        ]
                      }));
                      const options = {
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: ctx => `Eficiencia: ${ctx.parsed.y}%`
                            }
                          }
                        },
                        scales: {
                          y: {
                            min: 0,
                            max: 100,
                            ticks: {
                              callback: v => v + '%',
                              stepSize: 20
                            },
                            title: { display: true, text: 'Porcentaje' }
                          },
                          x: {
                            grid: { display: false },
                            title: { display: true, text: 'Pedidos' }
                          }
                        }
                      };
                      return () => h(Line, { data: data.value, options });
                    }
                  });

const pedidos = ref([]);
const busqueda = ref('');

const formatear = (fecha) => {
  return fecha ? dayjs(fecha).format("DD/MM HH:mm:ss") : "N/D";
};

const mostrarMinutos = (valor) => {
  return (valor === null || valor === undefined) ? "N/D" : `${valor} min`;
};

const pedidosFiltradosRecientes = computed(() => {
  let filtrados = pedidos.value;
  if (busqueda.value) {
    filtrados = filtrados.filter(p => 
      p.id_pedido.toString().includes(busqueda.value)
    );
  }
  return filtrados.slice(0, 20); // ya vienen ordenados del backend
});

const cargarHistorial = async () => {
  try {
  const res = await axios.get("https://api-isabella-s-cakes.onrender.com/api/pedidos/historial-tiempos");
    pedidos.value = res.data;
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
};

onMounted(async () => {
  await cargarHistorial();
});
</script>

<style scoped>
/* Leyenda de colores para la tabla */
.kpi-leyenda {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 0.98rem;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.leyenda-box {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  margin-right: 4px;
  vertical-align: middle;
}
.leyenda-verde {
  background: linear-gradient(90deg, #d4fbe5 60%, #b6f7c6 100%);
  border: 1.5px solid #1abc6c;
}
.leyenda-amarillo {
  background: linear-gradient(90deg, #fff7d6 60%, #ffe9a7 100%);
  border: 1.5px solid #e6b800;
}
.leyenda-rojo {
  background: linear-gradient(90deg, #ffe0e0 60%, #ffb3b3 100%);
  border: 1.5px solid #e74c3c;
}
.leyenda-text {
  margin-right: 16px;
}
/* Colores para la celda de tiempo real en la tabla */
.tiempo-verde {
  background: linear-gradient(90deg, #d4fbe5 60%, #b6f7c6 100%) !important;
  color: #1abc6c !important;
}
.tiempo-amarillo {
  background: linear-gradient(90deg, #fff7d6 60%, #ffe9a7 100%) !important;
  color: #e6b800 !important;
}
.tiempo-rojo {
  background: linear-gradient(90deg, #ffe0e0 60%, #ffb3b3 100%) !important;
  color: #e74c3c !important;
}
/* KPIs resumen */
.kpi-resumen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin-bottom: 12px;
  padding: 18px 8px 10px 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  font-size: 1.1rem;
}
.kpi-label {
  font-size: 0.95rem;
  color: #888;
  font-weight: 500;
  margin-bottom: 4px;
}
.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
}
.kpi-total {
  background: linear-gradient(90deg, #e3e8f0 60%, #f7f8fa 100%);
  color: #5b6b7a;
}
.kpi-verde {
  background: linear-gradient(90deg, #d4fbe5 60%, #b6f7c6 100%);
  color: #1abc6c;
}
.kpi-amarillo {
  background: linear-gradient(90deg, #fff7d6 60%, #ffe9a7 100%);
  color: #e6b800;
}
.kpi-rojo {
  background: linear-gradient(90deg, #ffe0e0 60%, #ffb3b3 100%);
  color: #e74c3c;
}
.kpi-promedio {
  background: linear-gradient(90deg, #e3e8f0 60%, #f7f8fa 100%);
  color: #764ba2;
  margin-top: 8px;
}
/* Tabla tipo dashboard KPIs */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.kpi-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  font-size: 0.98rem;
  min-width: 900px;
}
.kpi-table th, .kpi-table td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}
.kpi-table th {
  background: #f7f8fa;
  color: #6b7280;
  font-weight: 700;
  font-size: 1.05rem;
}
.kpi-table tr:nth-child(even) {
  background: #f9f9fc;
}
.kpi-table tr:nth-child(odd) {
  background: #fff;
}
.kpi-table .desc {
  font-weight: 600;
  color: #5b6b7a;
  background: #e3e8f0;
  border-left: 4px solid #a3aed6;
}
.kpi-table .estado {
  font-weight: 600;
  text-transform: capitalize;
}
.kpi-table .estado-pagado {
  color: #2ecc71;
  background: #eafaf1;
}
.kpi-table .kpi-bold {
  font-weight: 700;
  color: #3b3b3b;
  background: #e3e8f0;
}
@media (max-width: 900px) {
  .kpi-table {
    min-width: 700px;
    font-size: 0.93rem;
  }
}
@media (max-width: 600px) {
  .kpi-table {
    min-width: 500px;
    font-size: 0.85rem;
  }
  .kpi-table th, .kpi-table td {
    padding: 8px 4px;
  }
}
</style>
