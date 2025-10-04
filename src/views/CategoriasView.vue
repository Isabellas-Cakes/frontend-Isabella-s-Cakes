<template>
  <v-container>
    <v-row align="center" justify="space-between">
      <v-col cols="auto">
        <h2 class="text-h5 font-weight-bold">Categorías</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn icon color="success" @click="irACrear">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
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
        >
          <v-card-title>{{ categoria.nombre }}</v-card-title>
          <v-card-subtitle>
            {{ categoria.cantidad_articulos }} Artículo{{
              categoria.cantidad_articulos === 1 ? "" : "s"
            }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn color="success" block class="mt-4" @click="irACrear">
          <v-icon start>mdi-plus</v-icon>
          Crear categoría
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const categorias = ref([]);
const router = useRouter();

const cargarCategorias = async () => {
  try {
    const response = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/categorias/con-conteo"
    );
    categorias.value = response.data;
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

const irACrear = () => {
  router.push("/categorias/crear");
};

const irACategoria = (id_categoria) => {
  router.push(`/categorias/${id_categoria}/articulos`);
};

onMounted(cargarCategorias);
</script>
