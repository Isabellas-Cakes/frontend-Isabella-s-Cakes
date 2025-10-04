<template>
  <v-container>
    <v-row class="align-center justify-space-between mb-4">
      <v-col cols="auto">
        <h2 class="mb-0">💳 Pedidos pendientes de pago</h2>
      </v-col>
      <v-col cols="auto" v-if="rol === 'cajero'">
        <v-btn color="black" variant="outlined" @click="cerrarSesion">
          <v-icon left>mdi-logout</v-icon>
          Cerrar sesión
        </v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="pedidos.length === 0"
      type="info"
      border="start"
      colored-border
    >
      No hay pedidos listos para pagar.
    </v-alert>

    <v-card
      v-for="pedido in pedidos"
      :key="pedido.id_pedido"
      class="mb-4"
      outlined
    >
      <v-card-title>
        🧾 Pedido #{{ pedido.id_pedido }} — Mesa {{ pedido.id_mesa }}
      </v-card-title>
      <v-card-subtitle>
        <div>
          <strong>Mesa:</strong> {{ pedido.mesa?.numero || pedido.id_mesa }}
        </div>
        <div><strong>Cliente:</strong> {{ pedido.nombre || "Sin nombre" }}</div>
        <div>
          <strong>Total:</strong> Q{{ calcularTotal(pedido).toFixed(2) }}
        </div>
      </v-card-subtitle>

      <v-card-actions>
        <v-btn color="primary" @click="seleccionarPedido(pedido)">
          💵 Pagar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Diálogo de pago -->
    <v-dialog v-model="dialogoPago" max-width="600px">
      <v-card>
        <v-card-title>
          Confirmar pago — Pedido #{{ pedidoSeleccionado?.id_pedido }}
        </v-card-title>
        <v-card-text v-if="pedidoSeleccionado">
          <v-text-field
            v-model.number="efectivoRecibido"
            label="💵 Efectivo recibido"
            type="number"
            min="0"
            class="mt-2"
            prepend-inner-icon="mdi-cash"
          />

          <p v-if="efectivoRecibido !== null" class="mt-2">
            <strong>Cambio:</strong>
            <span v-if="cambio >= 0">Q{{ cambio.toFixed(2) }}</span>
            <span v-else class="text-error">❌ Efectivo insuficiente</span>
          </p>

          <v-expansion-panels class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title
                >🧾 Ver resumen de pago</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="detalle in pedidoSeleccionado?.detalles || []"
                    :key="detalle.id_detalle"
                  >
                    <v-list-item-title>
                      {{ detalle.cantidad }} x {{ detalle.nombre }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      Subtotal: Q{{ detalle.subtotal.toFixed(2) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <p class="mt-2">
                  <strong>Total:</strong> Q{{
                    calcularTotal(pedidoSeleccionado).toFixed(2)
                  }}
                </p>
                <p><strong>Método de pago:</strong> 💵 Efectivo</p>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <!-- 
          <v-btn text @click="dialogoPago = false">Cancelar</v-btn>
          <v-btn color="success" @click="confirmarPago">Confirmar pago</v-btn>
          Diálogo de pago -->

          <v-btn color="success" :disabled="isPaying" @click="confirmarPago">
            {{ isPaying ? "Procesando..." : "Confirmar pago" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { io } from "socket.io-client"; // 👈 Importa socket.io-client

const pedidos = ref([]);
const pedidoSeleccionado = ref(null);
const dialogoPago = ref(false);
const efectivoRecibido = ref(null);
const isPaying = ref(false);

const rol = ref(localStorage.getItem("rol"));

// 🔹 Conectar socket
const socket = io("https://api-isabella-s-cakes.onrender.com");

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "/"; // o router.push('/') si estás usando Vue Router
}

const seleccionarPedido = async (pedido) => {
  try {
    const { data: detalles } = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${pedido.id_pedido}`
    );

    pedidoSeleccionado.value = {
      ...pedido,
      detalles: detalles.map((d) => ({
        ...d,
        nombre: d.nombre || d.articulo?.nombre || "Artículo",
        subtotal: parseFloat(d.subtotal),
      })),
    };

    efectivoRecibido.value = null;
    dialogoPago.value = true;
  } catch (err) {
    console.error("Error al cargar detalles:", err);
    alert("Error al cargar detalles del pedido");
  }
};

const calcularTotal = (pedido) => {
  if (!pedido || !pedido.detalles) return 0;
  return pedido.detalles.reduce((sum, d) => sum + parseFloat(d.subtotal), 0);
};

const cambio = computed(() => {
  if (!pedidoSeleccionado.value || efectivoRecibido.value == null) return 0;
  return efectivoRecibido.value - calcularTotal(pedidoSeleccionado.value);
});

const confirmarPago = async () => {
  if (!pedidoSeleccionado.value) return;

  if (efectivoRecibido.value == null || cambio.value < 0) {
    alert("Monto insuficiente");
    return;
  }

  isPaying.value = true; // ✅ activar bloqueo
  await pagarPedido(pedidoSeleccionado.value);
};

const pagarPedido = async (pedido) => {
  try {
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedido.id_pedido}/pagar`,
      { metodo_pago: "efectivo" }
    );

    pedidos.value = pedidos.value.filter(
      (p) => p.id_pedido !== pedido.id_pedido
    );
    dialogoPago.value = false;
    alert("✅ Pedido pagado y mesa liberada");
  } catch (error) {
    console.error("Error al pagar pedido:", error);
    alert("No se pudo procesar el pago");
  } finally {
    isPaying.value = false; // Siempre liberar el botón
  }
};

const cargarPedidos = async () => {
  try {
    const { data } = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/pedidos"
    );
    const pedidosListos = data.filter((p) => p.estado === "servido"); // 👈 Solo pedidos servidos

    // Cargar detalles de cada pedido
    for (const pedido of pedidosListos) {
      const { data: detalles } = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${pedido.id_pedido}`
      );
      pedido.detalles = detalles.map((d) => ({
        ...d,
        nombre: d.nombre || d.articulo?.nombre || "Artículo",
        subtotal: parseFloat(d.subtotal),
      }));
    }

    pedidos.value = pedidosListos;
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
  }
};

onMounted(() => {
  cargarPedidos();

/*
  socket.on("estado-pedido-actualizado", (pedidoActualizado) => {
  console.log("📡 Evento recibido:", pedidoActualizado);

  // 🔹 Chequear estado real
  if (pedidoActualizado.estado === "servido") {
    cargarPedidos(); // o agregar dinámicamente el pedido a la lista
  } else if (pedidoActualizado.estado === "pagado") {
    // Removerlo de la lista si ya estaba
    pedidos.value = pedidos.value.filter(
      p => p.id_pedido !== pedidoActualizado.id_pedido
    );
  }
});
*/

  // 🔹 Listener de Socket.IO para actualizar en tiempo real
 /* socket.on("estado-pedido-actualizado", ({ nuevoEstado }) => {
    if (nuevoEstado === "servido") {
      cargarPedidos(); // 🔁 Refresca lista si hay un nuevo servido
    }
  });*/

socket.on("estado-pedido-actualizado", async (pedidoActualizado) => {
  if (pedidoActualizado.estado === "servido") {
    // Obtener detalles del pedido para mostrarlo completo
    const { data: detalles } = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${pedidoActualizado.id_pedido}`
    );

    pedidoActualizado.detalles = detalles.map(d => ({
      ...d,
      nombre: d.nombre || d.articulo?.nombre || "Artículo",
      subtotal: parseFloat(d.subtotal),
    }));

    pedidos.value.push(pedidoActualizado);
  } else if (pedidoActualizado.estado === "pagado") {
    pedidos.value = pedidos.value.filter(
      p => p.id_pedido !== pedidoActualizado.id_pedido
    );
  }
});



});
</script>
