<template>
  <v-container class="pb-16">
    <h2 class="text-h5 font-weight-bold mb-4">
      Pedidos activos ({{ pedidosFiltrados.length }})
    </h2>

    <v-row>
      <v-col cols="12">
        <v-switch
          v-model="soloPendientes"
          label="Sólo pendientes"
          @change="cargarPedidos"
        />
      </v-col>
    </v-row>

    <v-row
      v-for="pedido in pedidosFiltrados"
      :key="pedido.id_pedido"
      class="mb-4"
    >
      <v-col cols="12">
        <v-card
          :color="pedido.estado === 'entregado' ? 'green' : 'red'"
          dark
          rounded="xl"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <strong class="text-h6">{{ pedido.nombre }}</strong>
              <span class="ml-2">(Q{{ Number(pedido.total).toFixed(2) }})</span>
              <v-chip
                v-if="
                  pedido.actualizado_en &&
                  new Date(pedido.actualizado_en) > new Date(pedido.fecha_hora)
                "
                color="yellow darken-2"
                text-color="black"
                class="ml-2"
              >
                <v-icon left small>mdi-update</v-icon>
                Actualizado
              </v-chip>
            </div>

            <div class="d-flex align-center">
              <v-chip class="mr-2" outlined color="white">
                <v-icon left small>mdi-timer-outline</v-icon>
                <template
                  v-if="
                    pedido.estado === 'entregado' &&
                    pedido.entregadoEnMinutos != null
                  "
                >
                  {{ pedido.entregadoEnMinutos }} min
                </template>
                <template v-else>
                  {{ minutosRestantes(pedido.fecha_hora, pedido.minutos) }} min
                </template>
              </v-chip>

              <v-chip dark color="grey darken-3">
                <v-icon left small>mdi-pencil</v-icon>
                {{ formatearDuracion(pedido.minutos) }}
              </v-chip>
            </div>
          </v-card-title>

          <!-- AVISO DE ENTREGA ANTICIPADA -->
          <v-card-text
            v-if="mensajeEntregaAdelantada(pedido)"
            class="text-white text-caption px-4"
          >
            {{ mensajeEntregaAdelantada(pedido) }}
          </v-card-text>

          <!-- DETALLES POR CATEGORÍA -->
          <v-card-text class="pa-0">
            <div
              v-for="(grupo, index) in agruparPorCategoria(pedido.detalles)"
              :key="index"
              class="mb-1"
            >
              <v-sheet
                color="grey lighten-3"
                class="py-1 px-3 text-black font-weight-bold d-flex justify-space-between align-center"
              >
                {{ grupo.categoria }}
                <v-icon color="success">mdi-check-circle</v-icon>
              </v-sheet>

              <div
                v-for="item in grupo.items"
                :key="item.id_detalle"
                class="px-3 py-2 bg-white text-black"
              >
                <div class="d-flex justify-space-between align-center">
                  <span>
                    <strong>{{ item.cantidad }}</strong> {{ item.articulo }}
                    <span class="ml-2 text-caption text-grey"
                      >({{ item.cuenta || "General" }})</span
                    >
                  </span>

                  <!-- Temporizador individual -->
                  <v-chip
                    v-if="item.minutos"
                    size="small"
                    class="ml-2"
                    :color="
                      minutosRestantes(pedido.fecha_hora, item.minutos) === 0
                        ? 'red'
                        : 'grey'
                    "
                    text-color="white"
                  >
                    <v-icon left small>mdi-timer-outline</v-icon>
                    {{ minutosRestantes(pedido.fecha_hora, item.minutos) }} min
                  </v-chip>
                </div>

                <div
                  v-if="item.observaciones || item.extra"
                  class="text-caption text-grey-darken-2 mt-1"
                >
                  <div v-if="item.observaciones">
                    <strong>Obs:</strong> {{ item.observaciones }}
                  </div>
                  <div v-if="item.extra">
                    <strong>Extras:</strong> {{ item.extra }}
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- ACCIONES -->
          <v-card-actions class="d-flex justify-space-around">
            <v-btn icon @click="abrirDialogoEliminar(pedido.id_pedido)">
              <v-icon color="white">mdi-close-circle</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon color="white">mdi-cash</v-icon>
            </v-btn>
            <v-btn icon @click="abrirDialogoConfirmacion(pedido.id_pedido)">
              <v-icon color="white">mdi-check-circle</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon color="white">mdi-arrow-up-bold</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon color="white">mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- DIALOGOS -->
    <v-dialog v-model="dialogConfirmar" max-width="400">
      <v-card>
        <v-card-title class="headline">¿Marcar como entregado?</v-card-title>
        <v-card-text
          >Estás a punto de marcar este pedido como entregado.</v-card-text
        >
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogConfirmar = false">Cancelar</v-btn>
          <v-btn color="green" text @click="confirmarEntrega">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="headline">¿Eliminar pedido?</v-card-title>
        <v-card-text>Esta acción no se puede deshacer.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogEliminar = false">Cancelar</v-btn>
          <v-btn color="red" text @click="eliminarPedido">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <BottomNav />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import BottomNav from "@/components/BottomNav.vue";

const pedidos = ref([]);
const soloPendientes = ref(true);
const articulos = ref([]);
const categorias = ref([]);

const dialogConfirmar = ref(false);
const pedidoSeleccionado = ref(null);
const dialogEliminar = ref(false);
const pedidoAEliminar = ref(null);

const cargarPedidos = async () => {
  const [resPedidos, resDetalles, resArticulos, resCategorias] =
    await Promise.all([
  axios.get("https://api-isabella-s-cakes.onrender.com/api/pedidos"),
  axios.get("https://api-isabella-s-cakes.onrender.com/api/detallepedido"),
  axios.get("https://api-isabella-s-cakes.onrender.com/api/articulos"),
  axios.get("https://api-isabella-s-cakes.onrender.com/api/categorias"),
    ]);

  articulos.value = resArticulos.data;
  categorias.value = resCategorias.data;

  pedidos.value = resPedidos.data
    .filter((p) =>
      soloPendientes.value
        ? ["pendiente", "en espera"].includes(p.estado)
        : true
    )
    .map((p) => {
      const detalles = resDetalles.data
        .filter((d) => d.id_pedido === p.id_pedido)
        .map((d) => {
          const articulo = articulos.value.find(
            (a) => a.id_articulo === d.id_articulo
          );
          const categoria = categorias.value.find(
            (c) => c.id_categoria === (articulo?.id_categoria || null)
          );
          return {
            ...d,
            articulo: articulo?.nombre || `#${d.id_articulo}`,
            categoria: categoria?.nombre || "Sin categoría",
            cuenta: d.cuenta || "General",
          };
        });

      return {
        ...p,
        entregadoEnMinutos: p.tiempo_real ?? null,
        detalles,
      };
    });
};

const pedidosFiltrados = computed(() => pedidos.value);

const minutosRestantes = (fecha, duracion) => {
  const fin = new Date(fecha);
  fin.setMinutes(fin.getMinutes() + (duracion || 0));
  const ahora = new Date();
  return Math.max(0, Math.floor((fin - ahora) / 60000));
};

const calcularMinutosReales = (fechaPedido) => {
  const inicio = new Date(fechaPedido);
  const fin = new Date();
  return Math.floor((fin - inicio) / 60000);
};

const mensajeEntregaAdelantada = (pedido) => {
  const real = pedido.entregadoEnMinutos;
  const estimado = pedido.minutos;
  if (
    pedido.estado === "entregado" &&
    real != null &&
    estimado != null &&
    real < estimado
  ) {
    const diff = estimado - real;
    return `🕒 Se entregó ${diff} minuto${
      diff !== 1 ? "s" : ""
    } antes del tiempo estimado`;
  }
  return null;
};

const formatearDuracion = (min) => {
  if (!min || isNaN(min)) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h ? `${h} h ` : ""}${m} min`;
};

const agruparPorCategoria = (detalles) => {
  const agrupado = {};
  for (const det of detalles) {
    if (!agrupado[det.categoria]) agrupado[det.categoria] = [];
    agrupado[det.categoria].push(det);
  }
  return Object.entries(agrupado).map(([categoria, items]) => ({
    categoria,
    items,
  }));
};

const abrirDialogoConfirmacion = (id) => {
  pedidoSeleccionado.value = id;
  dialogConfirmar.value = true;
};

const confirmarEntrega = async () => {
  dialogConfirmar.value = false;
  if (pedidoSeleccionado.value !== null) {
    const pedido = pedidos.value.find(
      (p) => p.id_pedido === pedidoSeleccionado.value
    );
    const minutos = calcularMinutosReales(pedido.fecha_hora);

    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedidoSeleccionado.value}`,
      {
        estado: "entregado",
        tiempo_real: minutos,
      }
    );

    pedido.estado = "entregado";
    pedido.entregadoEnMinutos = minutos;

    alert(
      `✅ Pedido entregado en ${minutos} minuto${minutos !== 1 ? "s" : ""}`
    );
    pedidoSeleccionado.value = null;
  }
};

const abrirDialogoEliminar = (id) => {
  pedidoAEliminar.value = id;
  dialogEliminar.value = true;
};

const eliminarPedido = async () => {
  if (pedidoAEliminar.value !== null) {
    try {
      await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedidoAEliminar.value}`
      );
      dialogEliminar.value = false;
      pedidoAEliminar.value = null;
      cargarPedidos();
    } catch (error) {
      alert("❌ Error al eliminar el pedido");
    }
  }
};

onMounted(() => {
  cargarPedidos();
  setInterval(cargarPedidos, 30000); // actualiza cada 30s
});
</script>
