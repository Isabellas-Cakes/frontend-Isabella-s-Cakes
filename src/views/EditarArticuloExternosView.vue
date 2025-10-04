<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar artículo externo</h2>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-skeleton-loader v-if="loading" type="card" class="mt-4" />

    <!-- Error -->
    <v-alert v-else-if="error" type="error" border="start" class="mt-4">
      {{ error }}
      <v-btn variant="text" color="error" @click="cargarArticulo" class="ml-2">
        Reintentar
      </v-btn>
    </v-alert>

    <!-- Formulario -->
    <v-form v-else @submit.prevent="guardarCambios">
      <!-- Selector de imagen -->
      <v-row justify="center" class="my-4">
        <v-avatar size="80" class="elevation-2" @click="seleccionarImagen" style="cursor: pointer">
          <template v-if="imagenPreview || articulo.imagen">
            <v-img :src="imagenPreview || `https://api-isabella-s-cakes.onrender.com${articulo.imagen}`" cover />
          </template>
          <template v-else>
            <v-icon size="40">mdi-camera</v-icon>
          </template>
        </v-avatar>
      </v-row>
      
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        style="display: none"
        @change="handleImagenSeleccionada"
      />

      <v-text-field
        v-model="articulo.nombre"
        label="Nombre*"
        prepend-inner-icon="mdi-pencil"
        required
        variant="outlined"
        class="mt-4"
        :error-messages="errors.nombre"
      />
      
      <v-text-field
        v-model="articulo.descripcion"
        label="Descripción"
        prepend-inner-icon="mdi-pencil"
        variant="outlined"
      />
      
      <v-text-field
        v-model.number="articulo.precio"
        label="Precio*"
        prepend-inner-icon="mdi-currency-usd"
        type="number"
        step="0.01"
        min="0"
        required
        variant="outlined"
        :error-messages="errors.precio"
      />
      
      <v-text-field
        v-model.number="articulo.stock_actual"
        label="Stock actual"
        prepend-inner-icon="mdi-package-variant"
        type="number"
        min="0"
        variant="outlined"
      />

      <v-switch
        v-model="articulo.estado"
        label="Artículo activo"
        color="success"
        class="mt-2"
      />

      <v-btn 
        type="submit" 
        color="light-green darken-2" 
        dark 
        block 
        class="mt-4"
        :loading="saving"
        :disabled="!isFormValid"
      >
        <v-icon start>mdi-content-save</v-icon>
        Guardar cambios
      </v-btn>

      <v-btn
        color="red darken-2"
        dark
        block
        class="mt-2"
        @click="eliminarArticulo"
        :loading="deleting"
      >
        <v-icon start>mdi-delete</v-icon>
        Eliminar artículo
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const idArticulo = route.params.id;
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref("");
const fileInput = ref(null);
const imagenPreview = ref(null);
const imagenFile = ref(null);

const articulo = ref({
  nombre: "",
  descripcion: "",
  precio: 0,
  stock_actual: 0,
  estado: true,
  imagen: ""
});

const errors = ref({
  nombre: [],
  precio: []
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const isFormValid = computed(() => {
  return articulo.value.nombre?.trim() && 
         articulo.value.precio > 0;
});

const showMessage = (message, color = "success") => {
  snackbar.value = { show: true, message, color };
};

const seleccionarImagen = () => {
  fileInput.value?.click();
};

const handleImagenSeleccionada = (event) => {
  const file = event.target.files[0];
  if (file) {
    imagenFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagenPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const cargarArticulo = async () => {
  loading.value = true;
  error.value = "";
  
  try {
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/articulos-externos/${idArticulo}`
    );
    articulo.value = res.data || {
      nombre: "",
      descripcion: "",
      precio: 0,
      stock_actual: 0,
      estado: true,
      imagen: ""
    };
  } catch (err) {
    console.error("Error al cargar artículo externo:", err);
    error.value = "Error al cargar el artículo externo";
    
    if (err.response?.status === 404) {
      error.value = "Artículo externo no encontrado";
    }
  } finally {
    loading.value = false;
  }
};

const guardarCambios = async () => {
  // Limpiar errores
  errors.value = { nombre: [], precio: [] };
  
  // Validaciones
  if (!articulo.value.nombre?.trim()) {
    errors.value.nombre.push("El nombre es requerido");
  }
  
  if (!articulo.value.precio || articulo.value.precio <= 0) {
    errors.value.precio.push("El precio debe ser mayor a 0");
  }
  
  if (errors.value.nombre.length > 0 || errors.value.precio.length > 0) {
    showMessage("Por favor corrige los errores del formulario", "error");
    return;
  }

  saving.value = true;
  
  try {
    const formData = new FormData();
    formData.append('nombre', articulo.value.nombre.trim());
    formData.append('descripcion', articulo.value.descripcion?.trim() || '');
    formData.append('precio', articulo.value.precio.toString());
    formData.append('stock_actual', (articulo.value.stock_actual || 0).toString());
    formData.append('estado', articulo.value.estado ? '1' : '0');
    
    if (imagenFile.value) {
      formData.append('imagen', imagenFile.value);
    }
    
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/articulos-externos/${idArticulo}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    showMessage("Artículo externo actualizado exitosamente", "success");
    
    // Regresar después de un breve delay
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (err) {
    console.error("Error al guardar artículo externo:", err);
    showMessage("Error al guardar los cambios", "error");
  } finally {
    saving.value = false;
  }
};

const eliminarArticulo = async () => {
  if (!confirm("¿Estás seguro de que deseas eliminar este artículo externo? Esta acción no se puede deshacer.")) {
    return;
  }
  
  deleting.value = true;
  
  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/articulos-externos/${idArticulo}`
    );
    
    showMessage("Artículo externo eliminado correctamente", "success");
    
    // Regresar después de un breve delay
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (err) {
    console.error("Error al eliminar artículo externo:", err);
    let errorMessage = "Error al eliminar el artículo externo";
    
    if (err.response?.status === 409) {
      errorMessage = "No se puede eliminar: el artículo tiene pedidos asociados";
    }
    
    showMessage(errorMessage, "error");
  } finally {
    deleting.value = false;
  }
};

onMounted(cargarArticulo);
</script>