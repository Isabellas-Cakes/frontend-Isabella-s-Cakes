<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar categoría</h2>
      </v-col>
    </v-row>

    <v-form @submit.prevent="guardarCambios">
      <v-text-field
        v-model="categoria.nombre"
        label="Nombre*"
        prepend-inner-icon="mdi-pencil"
        required
      />
      <v-text-field
        v-model="categoria.descripcion"
        label="Descripción"
        prepend-inner-icon="mdi-pencil"
      />

      <v-btn type="submit" color="light-green darken-2" dark block class="mt-4">
        <v-icon start>mdi-content-save</v-icon>
        Guardar
      </v-btn>

      <v-btn
        color="red darken-2"
        dark
        block
        class="mt-2"
        @click="eliminarCategoria"
      >
        <v-icon start>mdi-delete</v-icon>
        Eliminar
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const idCategoria = route.params.id;

const categoria = ref({
  nombre: "",
  descripcion: "",
});

const cargarCategoria = async () => {
  try {
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/categorias/${idCategoria}`
    );
    categoria.value = res.data;
  } catch (error) {
    console.error("Error al cargar categoría:", error);
  }
};

const guardarCambios = async () => {
  try {
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/categorias/${idCategoria}`,
      categoria.value
    );
    router.back();
  } catch (error) {
    console.error("Error al guardar categoría:", error);
  }
};

const eliminarCategoria = async () => {
  if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;
  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/categorias/${idCategoria}`
    );
    router.push("/categorias");
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
  }
};

onMounted(cargarCategoria);
</script>
