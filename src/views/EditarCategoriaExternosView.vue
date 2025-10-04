<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar categoría externa</h2>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-skeleton-loader v-if="loading" type="card" class="mt-4" />

    <!-- Error -->
    <v-alert v-else-if="error" type="error" border="start" class="mt-4">
      {{ error }}
      <v-btn variant="text" color="error" @click="cargarCategoria" class="ml-2">
        Reintentar
      </v-btn>
    </v-alert>

    <!-- Formulario -->
    <v-form v-else @submit.prevent="guardarCambios">
      <v-text-field
        v-model="categoria.nombre"
        label="Nombre*"
        prepend-inner-icon="mdi-pencil"
        required
        variant="outlined"
        class="mt-4"
      />
      <v-text-field
        v-model="categoria.descripcion"
        label="Descripción"
        prepend-inner-icon="mdi-pencil"
        variant="outlined"
      />

      <v-btn 
        type="submit" 
        color="light-green darken-2" 
        dark 
        block 
        class="mt-4"
        :loading="saving"
        :disabled="!categoria.nombre?.trim()"
      >
        <v-icon start>mdi-content-save</v-icon>
        Guardar cambios
      </v-btn>

      <v-btn
        color="red darken-2"
        dark
        block
        class="mt-2"
        @click="eliminarCategoria"
        :loading="deleting"
      >
        <v-icon start>mdi-delete</v-icon>
        Eliminar categoría
      </v-btn>
    </v-form>

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
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const idCategoria = route.params.id;
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref("");

const categoria = ref({
  nombre: "",
  descripcion: "",
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const showMessage = (message, color = "success") => {
  snackbar.value = { show: true, message, color };
};

const cargarCategoria = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-externas/${idCategoria}`
    );
    categoria.value = res.data || { nombre: "", descripcion: "" };
  } catch (err) {
    console.error("Error al cargar categoría externa:", err);
    error.value = "Error al cargar la categoría externa";
    
    if (err.response?.status === 404) {
      error.value = "Categoría externa no encontrada";
    }
  } finally {
    loading.value = false;
  }
};

const guardarCambios = async () => {
  if (!categoria.value.nombre?.trim()) {
    showMessage("El nombre es requerido", "error");
    return;
  }

  saving.value = true;
  
  try {
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-externas/${idCategoria}`,
      {
        nombre: categoria.value.nombre.trim(),
        descripcion: categoria.value.descripcion?.trim() || ""
      }
    );
    
    showMessage("Categoría externa actualizada exitosamente", "success");
    
    // Regresar después de un breve delay
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (err) {
    console.error("Error al guardar categoría externa:", err);
    showMessage("Error al guardar los cambios", "error");
  } finally {
    saving.value = false;
  }
};

const eliminarCategoria = async () => {
  if (!confirm("¿Estás seguro de que deseas eliminar esta categoría externa? Esta acción no se puede deshacer.")) {
    return;
  }
  
  deleting.value = true;
  
  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-externas/${idCategoria}`
    );
    
    showMessage("Categoría externa eliminada correctamente", "success");
    
    // Navegar a categorías externas después de un breve delay
    setTimeout(() => {
      router.push("/categorias-externas");
    }, 1500);
  } catch (err) {
    console.error("Error al eliminar categoría externa:", err);
    let errorMessage = "Error al eliminar la categoría externa";
    
    if (err.response?.status === 409) {
      errorMessage = "No se puede eliminar: la categoría tiene artículos asociados";
    }
    
    showMessage(errorMessage, "error");
  } finally {
    deleting.value = false;
  }
};

onMounted(cargarCategoria);
</script>