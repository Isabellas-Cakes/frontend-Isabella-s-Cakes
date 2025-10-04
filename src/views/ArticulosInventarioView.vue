<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="auto">
        <v-btn 
          icon 
          variant="tonal" 
          color="primary" 
          @click="router.back()"
          class="me-2"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-weight-bold mr-2">
          Artículos de Inventario - {{ categoriaNombre }}
        </h2>
        <v-btn 
          icon 
          variant="tonal" 
          color="orange" 
          @click="editarCategoria"
          :title="'Editar categoría'"
        >
          <v-icon>mdi-pencil-box-outline</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn 
          icon 
          color="success" 
          @click="crearArticulo"
          :title="'Crear nuevo artículo'"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="heading, list-item, list-item, list-item" />
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
            @click="cargarCategoria(); cargarArticulos()"
            class="ml-2"
          >
            Reintentar
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Contenido principal -->
    <div v-else>
      <!-- Buscador -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="search"
            label="Buscar artículo de inventario"
            prepend-inner-icon="mdi-magnify"
            clearable
            dense
            hide-details
            variant="outlined"
            class="mb-4"
          />
        </v-col>
      </v-row>

      <!-- Lista de artículos -->
      <v-row>
        <v-col cols="12">
          <v-alert
            v-if="articulosFiltrados.length === 0"
            type="info"
            border="start"
            colored-border
          >
            No se encontraron artículos de inventario con ese nombre
          </v-alert>

          <v-list v-else>
            <v-list-item
              v-for="articulo in articulosFiltrados"
              :key="articulo.idInventarioCocina"
              class="rounded-lg my-2 elevation-1"
              style="border: 1px solid #eee"
              @click="irAEditarArticulo(articulo)"
            >
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold d-flex align-center">
                  {{ articulo.nombre }}
                  <v-icon
                    size="10"
                    color="green"
                    class="ml-2"
                    v-if="articulo.estado === 'activo'"
                  >
                    mdi-circle
                  </v-icon>
                </v-list-item-title>
                <v-list-item-subtitle>
                  Stock: {{ articulo.stock_actual || 0 }} - Ubicación: {{ articulo.ubicacion || 'Sin ubicación' }} - Q{{ articulo.precio || 0 }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- Botones -->
      <v-row>
        <v-col cols="12">
          <v-btn color="teal" block class="mb-2" @click="crearArticulo">
            <v-icon start>mdi-plus</v-icon> Crear artículo de inventario
          </v-btn>
        </v-col>
      </v-row>
    </div> <!-- Cierre del contenido principal -->
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const idCategoria = route.params.id;
const categoriaNombre = ref("");
const articulos = ref([]);
const loading = ref(false);
const error = ref("");

const search = ref(""); // Para el campo de búsqueda

const articulosFiltrados = computed(() => {
  return articulos.value.filter((articulo) =>
    articulo.nombre.toLowerCase().includes(search.value.toLowerCase())
  );
});

const cargarCategoria = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    console.log(`Cargando información de categoría ID: ${idCategoria}`);
    
    // El backend actual no tiene endpoint específico para categorías individuales
    // Usar nombre genérico basado en el ID
    categoriaNombre.value = `Categoría de Inventario ${idCategoria}`;
    console.log(`Categoría cargada: ${categoriaNombre.value}`);
  } catch (err) {
    console.error("Error al obtener información de categoría:", err);
    categoriaNombre.value = `Categoría de Inventario ${idCategoria}`;
    console.warn("Usando nombre genérico para la categoría");
  } finally {
    loading.value = false;
  }
};

// En la función cargarArticulos, cambiar todas las URLs:

const cargarArticulos = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    console.log(`Cargando artículos para categoría ID: ${idCategoria}`);
    // Cambiar de inventario-cocina a inventario-cosina
    try {
      console.log("🔍 Intentando: /api/inventario-cosina/categoria/" + idCategoria);
      const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/categoria/${idCategoria}`
      );
      articulos.value = res.data || [];
      console.log(`✅ Endpoint categoria funcionó: ${articulos.value.length} artículos cargados`);
    } catch (err1) {
      console.log("❌ Endpoint categoria falló:", err1.response?.status);
      // Estrategia 2: Endpoint con query parameter
      try {
        console.log("🔍 Intentando: /api/inventario-cosina?categoria=" + idCategoria);
        const resQuery = await axios.get(
          `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina?categoria=${idCategoria}`
        );
        articulos.value = resQuery.data || [];
        console.log(`✅ Endpoint query funcionó: ${articulos.value.length} artículos cargados`);
      } catch (err2) {
        console.log("❌ Endpoint query falló:", err2.response?.status);
        // Estrategia 3: Obtener todos y filtrar en frontend
        try {
          console.log("🔍 Intentando: /api/inventario-cosina (todos los artículos)");
          const resTodos = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/inventario-cosina`);
          const todosArticulos = resTodos.data || [];
          // Filtrar por id_categoria en el frontend
          articulos.value = todosArticulos.filter(articulo => 
            articulo.id_categoria == idCategoria
          );
          console.log(`✅ Endpoint todos funcionó: ${articulos.value.length} artículos filtrados de ${todosArticulos.length} total`);
        } catch (err3) {
          console.log("❌ Endpoint todos falló:", err3.response?.status);
          throw err3; // Si todo falla, lanzar el último error
        }
      }
    }
  } catch (err) {
    console.error("❌ Error final al cargar artículos de inventario:", err);
    error.value = "Error al cargar los artículos de inventario. Verifica que el servidor esté funcionando.";
    articulos.value = [];
  } finally {
    loading.value = false;
  }
};
const crearArticulo = () => {
  router.push(`/crear-articulo-inventario-cocina?categoria=${idCategoria}`);
};

const editarCategoria = () => {
  router.push(`/editar-categoria-inventario/${idCategoria}`);
};

const irAEditarArticulo = (articulo) => {
  if (!articulo.idInventarioCocina) {
    console.error("❌ idInventarioCocina no está definido en el objeto:", articulo);
    return;
  }
  // Usar la ruta correcta para editar artículos de inventario
  router.push(`/editar-articulo-inventario/${articulo.idInventarioCocina}`);
};

onMounted(() => {
  cargarCategoria();
  cargarArticulos();
});
</script>