<template>
  <v-container>
    <v-row align="center" justify="space-between">
      <v-col cols="auto">
        <h2 class="text-h5 font-weight-bold">Inventario Cocina</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn icon color="success" @click="irACrear">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="card, card, card" />
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" border="start" class="mb-4">
          {{ error }}
          <v-btn 
            variant="text" 
            color="error" 
            @click="cargarCategorias"
            class="ml-2"
          >
            Reintentar
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Empty state -->
    <v-row v-else-if="categorias.length === 0">
      <v-col cols="12">
        <v-alert type="info" border="start" class="mb-4">
          <v-icon start>mdi-information</v-icon>
          No hay categorías de inventario creadas aún. ¡Crea la primera!
        </v-alert>
      </v-col>
    </v-row>

    <!-- Categories list -->
    <v-row v-else>
      <v-col
        cols="12"
        v-for="categoria in categorias"
        :key="categoria.id_categoria"
      >
        <v-card
          color="teal"
          dark
          class="rounded-lg"
          @click="irACategoria(categoria.id_categoria)"
          style="cursor: pointer"
          hover
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ categoria.nombre }}</span>
            <v-icon>mdi-chevron-right</v-icon>
          </v-card-title>
          <v-card-subtitle>
            {{ categoria.cantidad_articulos || 0 }} Artículo{{
              (categoria.cantidad_articulos || 0) === 1 ? "" : "s"
            }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create button -->
    <v-row>
      <v-col cols="12">
        <v-btn color="success" block class="mt-4" @click="irACrear">
          <v-icon start>mdi-plus</v-icon>
          Crear categoría inventario
        </v-btn>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      :timeout="3000"
      location="top"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const categorias = ref([]);
const loading = ref(false);
const error = ref("");
const router = useRouter();

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const showMessage = (message, color = "success") => {
  snackbar.value = { show: true, message, color };
};

const cargarCategorias = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    console.log("🔍 Intentando cargar categorías de inventario...");
    
    // Intentar con el endpoint con conteo primero
    const response = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/categorias-inventario/con-conteo"
    );
    
    console.log("✅ Categorías cargadas con conteo:", response.data);
    categorias.value = response.data || [];
  } catch (error) {
    console.error("❌ Error al cargar categorías de inventario con conteo:", error);
    
    // Si no existe el endpoint con conteo, usar el básico
    try {
      console.log("🔄 Intentando endpoint básico...");
      
      const response = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/categorias-inventario"
      );
      
      console.log("✅ Categorías cargadas (básico):", response.data);
      categorias.value = (response.data || []).map(categoria => ({
        ...categoria,
        cantidad_articulos: 0 // Temporal hasta que funcione el conteo
      }));
      
    } catch (fallbackError) {
      console.error("❌ Error en endpoint básico también:", fallbackError);
      
      if (fallbackError.response?.status === 404) {
        error.value = "No se encontró el endpoint de categorías de inventario. Verifica que el backend tenga la ruta /api/categorias-inventario";
      } else if (fallbackError.response?.status >= 500) {
        error.value = "Error del servidor. Inténtalo más tarde.";
      } else if (!fallbackError.response) {
        error.value = "Sin conexión al servidor. Verifica que esté ejecutándose en puerto 8080.";
      } else {
        error.value = `Error ${fallbackError.response?.status}: ${fallbackError.response?.data?.message || 'Error desconocido'}`;
      }
      
      categorias.value = [];
    }
  } finally {
    loading.value = false;
  }
};

const irACrear = () => {
  router.push("/crear-categoria-inventario");
};

const irACategoria = (id_categoria) => {
  if (!id_categoria) {
    showMessage("Error: ID de categoría no válido", "error");
    return;
  }
  router.push(`/categorias-inventario/${id_categoria}/articulos`);
};

onMounted(cargarCategorias);
</script>

<style scoped>
/* Estilos mínimos para el diseño */
</style>
