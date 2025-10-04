<template>
  <v-container class="pb-16">
    <!-- 🔹 ENCABEZADO -->
     
    <v-row>
      <v-col cols="12">
        <h2>Nuevo pedido</h2>
      </v-col>

      <!-- 🔹 ALERTA DE ESTADO -->
      <v-col cols="12" v-if="pedido.id_pedido">
        <v-alert
          :type="tipoAlerta"
          :icon="iconoAlerta"
          :color="colorAlerta"
          border="start"
          class="mb-2"
        >
          Estado actual: <strong>{{ pedido.estado.toUpperCase() }}</strong><br />

          <template v-if="pedido.estado === 'servido'">
            ✅ Pedido servido: en espera de pago. No se pueden agregar más artículos.
          </template>

          <!-- ✅ En "en preparación" SÍ permite agregar -->
          <template v-else-if="pedido.estado === 'en preparación'">
            <p>El pedido está en preparación. <strong>Puedes agregar artículos nuevos</strong> y se enviarán a cocina.</p>
            <div v-if="pedido.articulos.length" class="mt-2">
              <h6 class="fw-bold mb-1">Artículos del pedido:</h6>
              <ul class="mb-0 ps-3">
                <li v-for="item in pedido.articulos" :key="item._uid">
                  {{ item.cantidad }} × {{ item.nombre }}
                  <span v-if="item.preparado" class="badge bg-success ms-2">✅ Listo</span>
                </li>
              </ul>
            </div>
          </template>

          <template v-else-if="pedido.estado === 'cancelado'">
            ❌ Este pedido ha sido cancelado. Motivo: {{ pedido.motivo_cancelacion || 'Sin especificar' }}
          </template>

          <template v-else>
            Puedes agregar más artículos si el cliente lo solicita.
          </template>
        </v-alert>
      </v-col>

      <!-- 🔹 TIEMPO EN PREPARACIÓN -->
      <v-col cols="12" v-if="pedido.estado === 'en preparación' && pedido.inicio_preparacion">
        <div class="text-grey text-caption">
          ⏳ En preparación desde hace {{ minutosEnPreparacion }} minuto(s)
        </div>
      </v-col>

      <!-- 🔹 BOTONES DE ACCIÓN JUNTOS -->
      <v-col cols="12" class="text-right">
        <!-- ✅ Enviar (única notificación visible) -->
        <v-btn
          color="green"
          @click="enviarPedido"
          :disabled="!pedidoValido || pedido.estado === 'servido' || pedido.estado === 'cancelado' || isSubmitting"
        >
          <v-icon start>mdi-send</v-icon>
          {{ isSubmitting ? "Enviando..." : "Enviar" }}
        </v-btn>

        <!-- Cancelar -->
        <v-btn
          color="red"
          class="ml-2"
          @click="mostrarDialogoCancelacion"
          :disabled="pedido.estado === 'servido' || pedido.estado === 'cancelado'"
        >
          <v-icon start>mdi-cancel</v-icon>
          Cancelar
        </v-btn>

        <!-- Marcar como servido -->
        <v-btn
          color="teal"
          class="ml-2"
          v-if="pedido.id_pedido && pedido.estado === 'listo'"
          @click="marcarComoServido"
        >
          <v-icon start>mdi-check-circle</v-icon>
          Marcar como servido
        </v-btn>
      </v-col>
    </v-row>

    <!-- 🔹 CAMPOS DE FORMULARIO -->
    <v-text-field
      v-model="pedido.nombre"
      label="Nombre"
      prepend-inner-icon="mdi-pencil"
      @input="validarNombre"
      :disabled="pedido.estado === 'cancelado'"
    />

    <!-- 🔹 TOTAL -->
    <h3>Total de pedido: Q{{ totalGeneral.toFixed(2) }}</h3>

    <!-- 🔹 BUSCADOR -->
    <v-text-field
      v-model="search"
      label="Buscar"
      prepend-inner-icon="mdi-magnify"
      clearable
      :disabled="pedido.estado === 'cancelado'"
    />

    <!-- 🔹 RESULTADOS DEL BUSCADOR GLOBAL -->
    <v-list
      v-if="(search || '').trim() && articulosFiltradosGlobal.length && pedido.estado !== 'cancelado'"
      class="mb-4 elevation-1"
    >
      <v-list-item
        v-for="articulo in articulosFiltradosGlobal"
        :key="articulo.id_articulo"
        @click="agregarArticulo(articulo)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ articulo.nombre }}</v-list-item-title>
          <v-list-item-subtitle>Q{{ articulo.precio }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-icon color="green">mdi-plus</v-icon>
      </v-list-item>
    </v-list>

    <!-- 🔹 ARTÍCULOS POR CATEGORÍA -->
    <v-expansion-panels v-if="pedido.estado !== 'cancelado'">
      <v-expansion-panel
        v-for="categoria in categoriasFiltradas"
        :key="categoria.id_categoria"
      >
        <v-expansion-panel-title>
          {{ categoria.nombre }} (Q{{ calcularSubtotalCategoria(categoria.id_categoria).toFixed(2) }})
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <!-- 🔹 Lista de artículos en edición -->
          <v-card
            v-for="item in pedido.articulos.filter((i) => i.id_categoria === categoria.id_categoria && !i.yaAgregado)"
            :key="item._uid"
            class="mb-3"
          >
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <strong>{{ item.nombre }}</strong>
                  <div>Q{{ item.precio }}</div>
                </div>

                <div class="d-flex align-center">
                  <v-btn icon @click="item.expandido = !item.expandido">
                    <v-icon>{{ item.expandido ? "mdi-check" : "mdi-dots-horizontal" }}</v-icon>
                  </v-btn>
                  <v-btn icon @click="item.cantidad--" :disabled="item.cantidad <= 1">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <div class="mx-2">{{ item.cantidad }}</div>
                  <v-btn icon @click="item.cantidad++">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- 🔹 Opciones extra -->
              <div v-if="item.expandido" class="mt-2">
                <v-text-field v-model="item.extra" label="Algo extra" dense />

                <v-row class="mt-2">
                  <v-col cols="6">
                    <v-btn block color="teal" @click="duplicarArticulo(item)">
                      <v-icon start>mdi-content-copy</v-icon> Duplicar
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn block color="red" @click="eliminarArticulo(item)">
                      <v-icon start>mdi-delete</v-icon> Eliminar
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- 🔹 Lista de artículos disponibles -->
          <v-list-item
            v-for="articulo in articulosFiltradosDisponibles(categoria.id_categoria)"
            :key="articulo.id_articulo"
            @click="agregarArticulo(articulo)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ articulo.nombre }}</v-list-item-title>
              <v-list-item-subtitle>Q{{ articulo.precio }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-icon color="green">mdi-plus</v-icon>
          </v-list-item>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- 🔹 RESUMEN DEL PEDIDO -->
    <h3 class="mt-6">Resumen del pedido</h3>
    <v-card class="mb-4" outlined>
      <v-card-title>
        Artículos del pedido - Total: Q{{ totalGeneral.toFixed(2) }}
        <v-chip v-if="pedido.estado === 'cancelado'" color="red" class="ml-2">CANCELADO</v-chip>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list dense>
          <!-- 🧾 Artículos ya agregados -->
          <v-subheader class="pl-0" v-if="articulosYaAgregadosAgrupados.length">
            🧾 Ya en el pedido
          </v-subheader>
          <v-list-item
            v-for="item in articulosYaAgregadosAgrupados"
            :key="`${item.nombre}_${item.precio}_${item.extra}`"
          >
            <v-list-item-content>
              <v-list-item-title style="font-family: monospace">
                {{ item.cantidad }} × {{ item.nombre }} — Q{{ (item.precio * item.cantidad).toFixed(2) }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="item.extra">
                Extra: {{ item.extra }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <!-- 🆕 Nuevos artículos -->
          <v-subheader
            class="pl-0 mt-2"
            v-if="pedido.articulos.some((i) => !i.yaAgregado) && pedido.estado !== 'cancelado'"
          >
            🆕 Nuevos artículos
          </v-subheader>
          <v-list-item
            v-for="item in pedido.articulos.filter((i) => !i.yaAgregado)"
            :key="'nuevo_' + item._uid"
          >
            <v-list-item-content>
              <v-list-item-title style="font-family: monospace">
                {{ item.cantidad }} × {{ item.nombre }} — Q{{ (item.precio * item.cantidad).toFixed(2) }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="item.extra">
                Extra: {{ item.extra }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 🔹 DIÁLOGO CONFIRMAR ENVÍO -->
    <v-dialog v-model="confirmarEnvio" max-width="500">
      <v-card>
        <v-card-title>¿Enviar pedido?</v-card-title>
        <v-card-text>
          Total: Q{{ totalGeneral.toFixed(2) }}<br />
          Artículos: {{ pedido.articulos.length }}

          <div v-if="pedido.articulos.length === 0" class="text-red mt-2">
            ⚠️ Debes agregar al menos un artículo antes de enviar el pedido.
          </div>
          <div v-if="!pedido.nombre.trim()" class="text-red mt-2">
            ⚠️ Debes ingresar un nombre.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="confirmarEnvio = false">Cancelar</v-btn>
          <v-btn
            color="green"
            :disabled="!pedidoValido || pedido.estado === 'servido' || isSubmitting"
            @click="enviarPedido"
          >
            <v-icon start>mdi-send</v-icon>
            {{ isSubmitting ? "Enviando..." : "Confirmar" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🔹 DIÁLOGO CONFIRMAR CANCELACIÓN -->
    <v-dialog v-model="dialogoCancelacion.mostrar" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 text-red">
          <v-icon left>mdi-alert</v-icon>
          ¿Cancelar pedido?
        </v-card-title>
        
        <v-card-text>
          <div class="mb-3">
            <strong>Pedido:</strong> {{ pedido.nombre || 'Sin nombre' }}<br />
            <strong>Estado actual:</strong> {{ pedido.estado.toUpperCase() }}<br />
            <strong>Total:</strong> Q{{ totalGeneral.toFixed(2) }}<br />
            <strong>Artículos:</strong> {{ pedido.articulos.length }}
          </div>

          <!-- Advertencias según el estado -->
          <v-alert 
            v-if="pedido.estado === 'en preparación'" 
            type="warning" 
            class="mb-3"
            border="start"
          >
            ⚠️ Este pedido está en preparación. La cancelación puede generar desperdicio de ingredientes.
          </v-alert>

          <v-alert 
            v-if="pedido.estado === 'listo'" 
            type="error" 
            class="mb-3"
            border="start"
          >
            🚫 Este pedido ya está listo. La cancelación puede aplicar cargos adicionales.
          </v-alert>

          <!-- Campo para motivo -->
          <v-text-field
            v-model="dialogoCancelacion.motivo"
            label="Motivo de cancelación (obligatorio)"
            placeholder="Ej: Cliente cambió de opinión, error en el pedido, etc."
            :rules="[v => !!v || 'El motivo es obligatorio']"
            outlined
          />

          <!-- Checkbox de confirmación para estados críticos -->
          <v-checkbox
            v-if="['en preparación', 'listo'].includes(pedido.estado)"
            v-model="dialogoCancelacion.confirmacionEspecial"
            :label="`Entiendo las implicaciones de cancelar un pedido ${pedido.estado}`"
            color="red"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn 
            text 
            @click="cerrarDialogoCancelacion"
            :disabled="dialogoCancelacion.procesando"
          >
            No cancelar
          </v-btn>
          <v-btn 
            color="red" 
            @click="confirmarCancelacionPedido"
            :disabled="!puedeConfirmarCancelacion || dialogoCancelacion.procesando"
            :loading="dialogoCancelacion.procesando"
          >
            <v-icon left>mdi-delete</v-icon>
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✅ ÚNICA NOTIFICACIÓN: SNACKBAR AL ENVIAR -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
/* eslint-disable no-unused-vars */ /* ← evita falsos positivos al usar <script setup> */
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { io } from "socket.io-client";

const route = useRoute();
const idMesa = route.params.mesaId;

const categorias = ref([]);
const articulos = ref([]);
const search = ref("");
const isSubmitting = ref(false);
const confirmarEnvio = ref(false);

/* 🔔 Estado del diálogo de cancelación */
const dialogoCancelacion = reactive({
  mostrar: false,
  motivo: "",
  confirmacionEspecial: false,
  procesando: false
});

/* 🔔 Snackbar */
const snackbar = reactive({ show: false, text: "", color: "green" });
const showSnack = (text, color = "green") => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

/* ⏱️ ticker */
const nowTick = ref(Date.now());
let tickInterval = null;

const pedido = reactive({
  id_miembro: 1,
  id_mesa: idMesa,
  nombre: "",
  minutos: null,
  estado: "pendiente",
  id_pedido: null,
  inicio_preparacion: null,
  motivo_cancelacion: null,
  articulos: [],
});

const socket = io("https://api-isabella-s-cakes.onrender.com");

/* =================== COMPUTED / HELPERS =================== */
const totalGeneral = computed(() =>
  pedido.articulos.reduce((sum, a) => sum + a.precio * a.cantidad, 0)
);

const categoriasFiltradas = computed(() =>
  categorias.value.filter((cat) =>
    articulos.value.some((a) => a.id_categoria === cat.id_categoria)
  )
);

const articulosFiltradosGlobal = computed(() => {
  const term = (search.value || '').toString().trim().toLowerCase();
  if (!term) return [];
  return articulos.value.filter(a => {
    if (!a.nombre) return false;
    return a.nombre.toLowerCase().includes(term);
  });
});

const articulosYaAgregadosAgrupados = computed(() => {
  const agrupados = {};
  for (const item of pedido.articulos.filter((i) => i.yaAgregado)) {
    const clave = `${item.nombre}|${item.precio}|${item.extra || ""}`;
    if (!agrupados[clave]) agrupados[clave] = { ...item, cantidad: 0 };
    agrupados[clave].cantidad += item.cantidad;
  }
  return Object.values(agrupados);
});

const pedidoValido = computed(() =>
  pedido.nombre.trim() !== "" && pedido.articulos.length > 0 && pedido.estado !== 'cancelado'
);

const tipoAlerta = computed(() =>
  pedido.estado === "servido"
    ? "info"
    : pedido.estado === "listo"
    ? "success"
    : pedido.estado === "en preparación"
    ? "warning"
    : pedido.estado === "cancelado"
    ? "error"
    : "info"
);
const iconoAlerta = computed(() =>
  pedido.estado === "servido"
    ? "mdi-cash"
    : pedido.estado === "listo"
    ? "mdi-check-circle"
    : pedido.estado === "en preparación"
    ? "mdi-fire"
    : pedido.estado === "cancelado"
    ? "mdi-cancel"
    : "mdi-information"
);
const colorAlerta = computed(() =>
  pedido.estado === "servido"
    ? "blue lighten-4"
    : pedido.estado === "listo"
    ? "green lighten-4"
    : pedido.estado === "en preparación"
    ? "orange lighten-4"
    : pedido.estado === "cancelado"
    ? "red lighten-4"
    : "blue lighten-4"
);

const minutosEnPreparacion = computed(() => {
  if (!pedido.inicio_preparacion) return 0;
  const inicio = new Date(pedido.inicio_preparacion).getTime();
  const diffMs = nowTick.value - inicio;
  const mins = Math.floor(diffMs / 60000);
  return mins < 0 ? 0 : mins;
});

const puedeConfirmarCancelacion = computed(() => {
  const tieneMotivo = dialogoCancelacion.motivo.trim().length > 0;
  const estadosCriticos = ['en preparación', 'listo'];
  
  if (estadosCriticos.includes(pedido.estado)) {
    return tieneMotivo && dialogoCancelacion.confirmacionEspecial;
  }
  
  return tieneMotivo;
});

/* =================== ACCIONES =================== */
const validarNombre = () => {
  pedido.nombre = pedido.nombre.replace(/[^a-zA-Z]/g, "");
};

const agregarArticulo = (articulo) => {
  if (pedido.estado === 'cancelado') return;
  
  const nuevo = {
    ...articulo,
    cantidad: 1,
    extra: "",
    expandido: false,
    yaAgregado: false,
    _uid: Date.now() + Math.random(),
  };
  pedido.articulos.push(nuevo);
};

const duplicarArticulo = (item) => {
  if (pedido.estado === 'cancelado') return;
  
  const copia = { ...item, _uid: Date.now() + Math.random(), yaAgregado: false };
  pedido.articulos.push(copia);
};

const eliminarArticulo = (item) => {
  const index = pedido.articulos.indexOf(item);
  if (index !== -1) pedido.articulos.splice(index, 1);
};

const calcularSubtotalCategoria = (id_categoria) =>
  pedido.articulos
    .filter((a) => a.id_categoria === id_categoria)
    .reduce((sum, a) => sum + a.precio * a.cantidad, 0);

const articulosFiltradosDisponibles = (id_categoria) => {
  const idsYaAgregados = pedido.articulos
    .filter((i) => !i.yaAgregado)
    .map((i) => i.id_articulo);

  const term = (search.value || '').toString().trim().toLowerCase();

  return articulos.value.filter((a) => {
    if (a.id_categoria !== id_categoria) return false;
    if (!a.nombre) return false;
    if (term && !a.nombre.toLowerCase().includes(term)) return false;
    if (idsYaAgregados.includes(a.id_articulo)) return false;
    return true;
  });
};

const reiniciarPedido = () => {
  pedido.id_pedido = null;
  pedido.estado = "pendiente";
  pedido.nombre = "";
  pedido.minutos = null;
  pedido.motivo_cancelacion = null;
  pedido.articulos = [];
};

/* =================== FUNCIONES DE CANCELACIÓN MEJORADAS =================== */
const mostrarDialogoCancelacion = () => {
  // Resetear estado del diálogo
  dialogoCancelacion.motivo = "";
  dialogoCancelacion.confirmacionEspecial = false;
  dialogoCancelacion.procesando = false;
  dialogoCancelacion.mostrar = true;
};

const cerrarDialogoCancelacion = () => {
  dialogoCancelacion.mostrar = false;
  dialogoCancelacion.motivo = "";
  dialogoCancelacion.confirmacionEspecial = false;
};

const confirmarCancelacionPedido = async () => {
  if (!puedeConfirmarCancelacion.value) return;
  
  dialogoCancelacion.procesando = true;
  
  try {
    if (pedido.id_pedido) {
      // Actualizar pedido con información de auditoría
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedido.id_pedido}`, { 
        estado: "cancelado",
        motivo_cancelacion: dialogoCancelacion.motivo,
        fecha_cancelacion: new Date().toISOString(),
        cancelado_por: pedido.id_miembro
      });

      // Verificar si hay otros pedidos activos en la mesa antes de liberarla
      try {
  const pedidosActivos = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/pedidos/mesa/${idMesa}/activos`);
        
        if (pedidosActivos.data.length <= 1) { // Solo este pedido o ninguno
          await axios.put(`https://api-isabella-s-cakes.onrender.com/api/mesas/${idMesa}`, { estado: "libre" });
        }
      } catch (error) {
        console.warn("No se pudo verificar otros pedidos de la mesa:", error);
        // Continuar con la cancelación aunque falle la verificación de la mesa
      }

      // Notificar a cocina y otros clientes
      socket.emit("pedido-cancelado", { 
        id_pedido: pedido.id_pedido, 
        motivo: dialogoCancelacion.motivo,
        estado_anterior: pedido.estado
      });
    }

    // Actualizar estado local pero mantener información para referencia
    pedido.estado = "cancelado";
    pedido.motivo_cancelacion = dialogoCancelacion.motivo;
    
    showSnack(`✅ Pedido cancelado: ${dialogoCancelacion.motivo}`, "info");
    cerrarDialogoCancelacion();
    
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    showSnack("❌ Error al cancelar el pedido", "error");
  } finally {
    dialogoCancelacion.procesando = false;
  }
};

/* 🔕 sockets sin alertas intrusivas */
socket.on("estado-pedido-actualizado", async ({ id_pedido }) => {
  if (pedido.id_pedido === id_pedido) {
    try {
  const res = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${id_pedido}`);
      const pedidoActualizado = res.data;
      pedido.estado = pedidoActualizado.estado;
      pedido.inicio_preparacion = pedidoActualizado.inicio_preparacion;
      pedido.motivo_cancelacion = pedidoActualizado.motivo_cancelacion;
    } catch (e) {
      console.error("sync pedido:", e);
    }
  }
});

socket.on("detalle-preparado", (detalle) => {
  if (detalle.id_pedido !== pedido.id_pedido) return;
  const idx = pedido.articulos.findIndex(a => a.id_detalle === detalle.id_detalle);
  if (idx !== -1) {
    pedido.articulos.splice(idx, 1, { ...pedido.articulos[idx], preparado: true });
  }
});

/* CRUD principal */
const enviarPedido = async () => {
  if (isSubmitting.value || pedido.estado === 'cancelado') return;
  isSubmitting.value = true;

  try {
    let idPedido = pedido.id_pedido;

    // 1) Crear pedido si no existe
    if (!idPedido) {
  const res = await axios.post("https://api-isabella-s-cakes.onrender.com/api/pedidos", {
        nombre: pedido.nombre || "Pedido sin nombre",
        total: totalGeneral.value,
        estado: "pendiente",
        fecha_hora: new Date().toISOString(),
        id_miembro: pedido.id_miembro,
        id_mesa: idMesa,
      });
      idPedido = res.data.pedido.id_pedido;
      pedido.id_pedido = idPedido;

      // Emitimos ambos para compatibilidad con cocina
      socket.emit("nuevo-pedido", { id_pedido: idPedido });
      socket.emit("nuevo-pedido-creado", { id_pedido: idPedido });
    }

    // 2) Insertar nuevos artículos
    let nuevosArticulosAgregados = false;
    for (const art of pedido.articulos) {
      if (art.yaAgregado) continue;
      nuevosArticulosAgregados = true;

  await axios.post("https://api-isabella-s-cakes.onrender.com/api/detallepedido", {
        id_pedido: idPedido,
        id_articulo: art.id_articulo,
        cantidad: art.cantidad,
        precio_unitario: art.precio,
        subtotal: art.precio * art.cantidad,
        extra: art.extra,
        cuenta: "General",
        preparado: false,
      });
      socket.emit("nuevo-detalle-agregado", { id_pedido: idPedido });
      art.yaAgregado = true;
    }

    // 3) Si estaba 'listo' y agregamos -> volver a 'pendiente'
    if (pedido.estado === "listo" && nuevosArticulosAgregados) {
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${idPedido}`, { estado: "pendiente" });
      socket.emit("estado-pedido-actualizado", { id_pedido: idPedido, nuevoEstado: "pendiente" });
      pedido.estado = "pendiente";
    }

    // 4) Actualizar total
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${idPedido}`, {
      total: totalGeneral.value,
    });

    // 5) Mesa ocupada
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/mesas/${idMesa}`, {
      estado: "ocupada",
    });

    // 6) Refrescar detalles desde backend
    const detalles = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${idPedido}`
    );
    pedido.articulos = detalles.data.map((item) => ({
      id_articulo: item.id_articulo,
      id_detalle: item.id_detalle,
      nombre: item.nombre || (item.articulo?.nombre ?? "Sin nombre"),
      id_categoria: item.id_categoria ?? item.articulo?.id_categoria ?? null,
      precio: parseFloat(item.precio_unitario),
      cantidad: item.cantidad,
      extra: item.extra || "",
      preparado: !!item.preparado,
      expandido: false,
      yaAgregado: true,
      _uid: Date.now() + Math.random(),
    }));

    confirmarEnvio.value = false;
    showSnack("✅ Pedido enviado/actualizado", "green");
  } catch (err) {
    console.error(err);
    confirmarEnvio.value = false;
    showSnack("❌ Error al enviar", "red");
  } finally {
    isSubmitting.value = false;
  }
};

const marcarComoServido = async () => {
  try {
    if (!pedido.id_pedido || pedido.estado !== "listo") return;
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/pedidos/${pedido.id_pedido}`, { estado: "servido" });
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/mesas/${idMesa}`, { estado: "pendiente_pago" });
    socket.emit("estado-pedido-actualizado", { id_pedido: pedido.id_pedido, nuevoEstado: "servido" });
    pedido.estado = "servido";
  } catch (e) {
    console.error("servir:", e);
  }
};

/* =================== MOUNT =================== */
onMounted(async () => {
  tickInterval = setInterval(() => (nowTick.value = Date.now()), 60_000);

  try {
  const cat = await axios.get("https://api-isabella-s-cakes.onrender.com/api/categorias");
    categorias.value = cat.data;

  const art = await axios.get("https://api-isabella-s-cakes.onrender.com/api/articulos");
    articulos.value = art.data;

    if (!idMesa) return;

    const activo = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/pedidos/mesa/${idMesa}/activo`
    );

    if (activo.data.length > 0) {
      const p = activo.data[0];
      if (["activo", "pendiente", "listo", "en preparación", "cancelado"].includes(p.estado)) {
        Object.assign(pedido, {
          nombre: p.nombre,
          minutos: p.minutos,
          id_miembro: p.id_miembro,
          estado: p.estado,
          inicio_preparacion: p.inicio_preparacion,
          motivo_cancelacion: p.motivo_cancelacion,
          id_pedido: p.id_pedido,
        });

        const detalles = await axios.get(
          `https://api-isabella-s-cakes.onrender.com/api/detallepedido/pedido/${pedido.id_pedido}`
        );

        pedido.articulos = detalles.data.map((item) => ({
          id_articulo: item.id_articulo,
          id_detalle: item.id_detalle,
          nombre: item.nombre || (item.articulo?.nombre ?? "Sin nombre"),
          id_categoria: item.id_categoria ?? item.articulo?.id_categoria ?? null,
          precio: parseFloat(item.precio_unitario),
          cantidad: item.cantidad,
          extra: item.extra || "",
          preparado: !!item.preparado,
          expandido: false,
          yaAgregado: true,
          _uid: Date.now() + Math.random(),
        }));
      } else {
        reiniciarPedido();
      }
    }
  } catch (err) {
    console.warn("No se pudo cargar pedido activo:", err?.message);
  }
});

onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval);
});
</script>