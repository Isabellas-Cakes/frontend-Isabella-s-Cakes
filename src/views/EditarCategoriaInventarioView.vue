<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar categoría de inventario</h2>
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
    console.log(`Cargando categoría de inventario con ID: ${idCategoria}`);
    
    // Intentar primero el endpoint específico de categorías
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-inventario/${idCategoria}`
    );
    categoria.value = res.data || { nombre: "", descripcion: "" };
    console.log("Categoría de inventario cargada:", categoria.value);
  } catch (err) {
    console.error("Error al cargar categoría de inventario:", err);
    
    // Si el endpoint de categorías no existe, intentar con inventario-cocina
    if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
      try {
        console.log("Intentando endpoint alternativo de inventario-cocina...");
        const resAlternativo = await axios.get(
          `https://api-isabella-s-cakes.onrender.com/api/inventario-cocina/categoria/${idCategoria}`
        );
        categoria.value = resAlternativo.data || { nombre: "", descripcion: "" };
        console.log("Categoría de inventario cargada (endpoint alternativo):", categoria.value);
      } catch (errAlternativo) {
        console.error("Error en endpoint alternativo:", errAlternativo);
        error.value = "Error al cargar la categoría de inventario";
        
        if (errAlternativo.response?.status === 404) {
          error.value = "Categoría de inventario no encontrada";
        }
      }
    } else {
      error.value = "Error al cargar la categoría de inventario";
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
    console.log(`Guardando categoría de inventario con ID: ${idCategoria}`);
    
    // Intentar primero el endpoint específico de categorías
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-inventario/${idCategoria}`,
      {
        nombre: categoria.value.nombre.trim(),
        descripcion: categoria.value.descripcion?.trim() || ""
      }
    );
    
    showMessage("Categoría de inventario actualizada exitosamente", "success");
    console.log("Categoría de inventario actualizada");
    
    // Regresar después de un breve delay
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (err) {
    console.error("Error al guardar categoría de inventario:", err);
    
    // Si el endpoint específico no funciona, intentar con inventario-cocina
    if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
      try {
        console.log("Intentando guardar con endpoint alternativo...");
        await axios.put(
          `https://api-isabella-s-cakes.onrender.com/api/inventario-cocina/categoria/${idCategoria}`,
          {
            nombre: categoria.value.nombre.trim(),
            descripcion: categoria.value.descripcion?.trim() || ""
          }
        );
        
        showMessage("Categoría de inventario actualizada exitosamente", "success");
        console.log("Categoría de inventario actualizada (endpoint alternativo)");
        
        setTimeout(() => {
          router.back();
        }, 1500);
      } catch (errAlternativo) {
        console.error("Error en endpoint alternativo para guardar:", errAlternativo);
        showMessage("Error al guardar los cambios", "error");
      }
    } else {
      showMessage("Error al guardar los cambios", "error");
    }
  } finally {
    saving.value = false;
  }
};

const eliminarCategoria = async () => {
  if (!confirm("¿Estás seguro de que deseas eliminar esta categoría de inventario? Esta acción no se puede deshacer.")) {
    return;
  }
  
  deleting.value = true;
  
  try {
    console.log(`Eliminando categoría de inventario con ID: ${idCategoria}`);
    
    // Intentar primero el endpoint específico de categorías
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/categorias-inventario/${idCategoria}`
    );
    
    showMessage("Categoría de inventario eliminada correctamente", "success");
    console.log("Categoría de inventario eliminada");
    
    // Navegar a inventario después de un breve delay
    setTimeout(() => {
      router.push("/inventario-cocina");
    }, 1500);
  } catch (err) {
    console.error("Error al eliminar categoría de inventario:", err);
    
    // Si el endpoint específico no funciona, intentar con inventario-cocina
    if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
      try {
        console.log("Intentando eliminar con endpoint alternativo...");
        await axios.delete(
          `https://api-isabella-s-cakes.onrender.com/api/inventario-cocina/categoria/${idCategoria}`
        );
        
        showMessage("Categoría de inventario eliminada correctamente", "success");
        console.log("Categoría de inventario eliminada (endpoint alternativo)");
        
        setTimeout(() => {
          router.push("/inventario-cocina");
        }, 1500);
      } catch (errAlternativo) {
        console.error("Error en endpoint alternativo para eliminar:", errAlternativo);
        let errorMessage = "Error al eliminar la categoría de inventario";
        
        if (errAlternativo.response?.status === 409) {
          errorMessage = "No se puede eliminar: la categoría tiene artículos asociados";
        }
        
        showMessage(errorMessage, "error");
      }
    } else {
      let errorMessage = "Error al eliminar la categoría de inventario";
      
      if (err.response?.status === 409) {
        errorMessage = "No se puede eliminar: la categoría tiene artículos asociados";
      }
      
      showMessage(errorMessage, "error");
    }
  } finally {
    deleting.value = false;
  }
};

onMounted(cargarCategoria);
</script>