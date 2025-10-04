<template>
  <v-container>
    <!-- Botón de regresar -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn icon @click="volver">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Formulario -->
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="categoria.nombre"
          label="Nombre*"
          prepend-inner-icon="mdi-pencil"
          required
        />
        <v-text-field
          v-model="categoria.descripcion"
          label="Descripción"
          prepend-inner-icon="mdi-text"
        />
      </v-col>

      <v-col cols="12">
        <v-btn color="success" block @click="guardarCategoria">
          <v-icon start>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const categoria = ref({
  nombre: "",
  descripcion: "",
});

const guardarCategoria = async () => {
  try {
    await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/categorias",
      categoria.value
    );
    alert("Categoría guardada correctamente");
    categoria.value.nombre = "";
    categoria.value.descripcion = "";
    router.push("/categorias"); // redirigir después de guardar
  } catch (error) {
    alert("Error al guardar la categoría");
    console.error(error);
  }
};

const volver = () => {
  router.back();
};
</script>
