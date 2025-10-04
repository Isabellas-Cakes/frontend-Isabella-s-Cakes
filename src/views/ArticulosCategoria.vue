<template>
  <v-container>
    <v-row align="center" justify="space-between">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-weight-bold mr-2">
          Artículos de {{ categoriaNombre }}
        </h2>
        <v-btn icon @click="editarCategoria">
          <v-icon>mdi-pencil-box-outline</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn icon color="success" @click="crearArticulo">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Buscador -->
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="search"
          label="Buscar artículo"
          prepend-inner-icon="mdi-magnify"
          clearable
          dense
          hide-details
          variant="outlined"
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
          No se encontraron artículos con ese nombre
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
                Q{{ articulo.precio }}
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
          <v-icon start>mdi-plus</v-icon> Crear artículo
        </v-btn>
      </v-col>
    </v-row>
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

const search = ref(""); // Para el campo de búsqueda

const articulosFiltrados = computed(() => {
  return articulos.value.filter((articulo) =>
    articulo.nombre.toLowerCase().includes(search.value.toLowerCase())
  );
});

const cargarCategoria = async () => {
  try {
    const res = await axios.get(
      `https://api-isabella-s-cakes.onrender.com/api/categorias/${idCategoria}`
    );
    categoriaNombre.value = res.data.nombre;
  } catch (error) {
    console.error("Error al obtener categoría:", error);
  }
};

const cargarArticulos = async () => {
  try {
    const res = await axios.get(
      `https://api-isabella-s-cakes.onrender.com/api/articulos?categoria=${idCategoria}`
    );
    articulos.value = res.data;
  } catch (error) {
    console.error("Error al cargar artículos:", error);
  }
};

const crearArticulo = () => {
  router.push(`/categorias/${idCategoria}/articulos/crear`);
};

const editarCategoria = () => {
  router.push(`/categorias/${idCategoria}/editar`);
};

const irAEditarArticulo = (articulo) => {
  if (!articulo.id_articulo) {
    console.error("❌ id_articulo no está definido en el objeto:", articulo);
    return;
  }
  router.push(`/articulos/${articulo.id_articulo}/editar`);
};

onMounted(() => {
  cargarCategoria();
  cargarArticulos();
});
</script>
