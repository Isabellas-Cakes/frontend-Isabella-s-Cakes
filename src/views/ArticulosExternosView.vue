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
          Artículos Externos de {{ categoriaNombre }}
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
            label="Buscar artículo externo"
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
          No se encontraron artículos externos con ese nombre
        </v-alert>

        <v-list v-else>
          <v-list-item
            v-for="articulo in articulosFiltrados"
            :key="articulo.id_articulo"
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
                  v-if="articulo.estado"
                >
                  mdi-circle
                </v-icon>
              </v-list-item-title>
              <v-list-item-subtitle>
                Q{{ articulo.precio }} - Stock: {{ articulo.stock_actual || 0 }}
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
            <v-icon start>mdi-plus</v-icon> Crear artículo externo
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
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-externas/${idCategoria}`
    );
    categoriaNombre.value = res.data?.nombre || "Categoría";
  } catch (err) {
    console.error("Error al obtener categoría externa:", err);
    error.value = "Error al cargar la categoría externa";
    
    if (err.response?.status === 404) {
      error.value = "Categoría externa no encontrada";
    }
  } finally {
    loading.value = false;
  }
};

const cargarArticulos = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/articulos-externos?categoria=${idCategoria}`
    );
    articulos.value = res.data || [];
  } catch (err) {
    console.error("Error al cargar artículos externos:", err);
    error.value = "Error al cargar los artículos externos";
    articulos.value = [];
  } finally {
    loading.value = false;
  }
};

const crearArticulo = () => {
  router.push(`/crear-articulo-externos?categoria=${idCategoria}`);
};

const editarCategoria = () => {
  router.push(`/editar-categoria-externos/${idCategoria}`);
};

const irAEditarArticulo = (articulo) => {
  if (!articulo.id_articulo) {
    console.error("❌ id_articulo no está definido en el objeto:", articulo);
    return;
  }
  router.push(`/editar-articulo-externos/${articulo.id_articulo}`);
};

onMounted(() => {
  cargarCategoria();
  cargarArticulos();
});
</script>