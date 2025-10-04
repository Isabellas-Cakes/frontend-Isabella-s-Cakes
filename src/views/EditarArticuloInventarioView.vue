<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar artículo de inventario</h2>
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
        v-model.number="articulo.costo"
        label="Costo"
        prepend-inner-icon="mdi-cash-multiple"
        type="number"
        step="0.01"
        min="0"
        variant="outlined"
      />
      
      <v-text-field
        v-model.number="articulo.stock_actual"
        label="Stock actual*"
        prepend-inner-icon="mdi-package-variant"
        type="number"
        min="0"
        required
        variant="outlined"
        :error-messages="errors.stock_actual"
      />

      <v-text-field
        v-model="articulo.ubicacion"
        label="Ubicación*"
        prepend-inner-icon="mdi-map-marker"
        required
        variant="outlined"
        :error-messages="errors.ubicacion"
      />

      <v-select
        v-model="articulo.estado"
        label="Estado*"
        prepend-inner-icon="mdi-toggle-switch"
        :items="estadosDisponibles"
        variant="outlined"
        required
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
  costo: 0,
  stock_actual: 0,
  ubicacion: "",
  estado: "activo",
  imagen: "",
  id_categoria: null
});

const errors = ref({
  nombre: [],
  precio: [],
  stock_actual: [],
  ubicacion: []
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const estadosDisponibles = [
  { title: 'Activo', value: 'activo' },
  { title: 'Inactivo', value: 'inactivo' }
];

const isFormValid = computed(() => {
  return articulo.value.nombre?.trim() && 
         articulo.value.precio >= 0 &&
         articulo.value.stock_actual >= 0 &&
         articulo.value.ubicacion?.trim() &&
         articulo.value.estado;
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
    console.log(`Cargando artículo de inventario con ID: ${idArticulo}`);
    
    // Corregir URL para coincidir con el backend: inventario-cosina (sin 'c')
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${idArticulo}`
    );
    
    const articuloData = res.data || {};
    
    // Mapear los datos del backend a la estructura del frontend
    articulo.value = {
      nombre: articuloData.nombre || "",
      descripcion: articuloData.descripcion || "",
      precio: parseFloat(articuloData.precio) || 0,
      costo: parseFloat(articuloData.costo) || 0,
      stock_actual: parseInt(articuloData.stock_actual) || 0,
      ubicacion: articuloData.ubicacion || "",
      estado: articuloData.estado || "activo",
      imagen: articuloData.imagen || "",
      id_categoria: articuloData.id_categoria || null
    };
    
    console.log("Artículo de inventario cargado:", articulo.value);
  } catch (err) {
    console.error("Error al cargar artículo de inventario:", err);
    error.value = "Error al cargar el artículo de inventario";
    
    if (err.response?.status === 404) {
      error.value = "Artículo de inventario no encontrado";
    }
  } finally {
    loading.value = false;
  }
};

const guardarCambios = async () => {
  // Limpiar errores
  errors.value = { nombre: [], precio: [], stock_actual: [], ubicacion: [] };
  
  // Validaciones
  if (!articulo.value.nombre?.trim()) {
    errors.value.nombre.push("El nombre es requerido");
  }
  
  if (articulo.value.precio < 0) {
    errors.value.precio.push("El precio no puede ser negativo");
  }
  
  if (articulo.value.stock_actual < 0) {
    errors.value.stock_actual.push("El stock no puede ser negativo");
  }
  
  if (!articulo.value.ubicacion?.trim()) {
    errors.value.ubicacion.push("La ubicación es requerida");
  }
  
  if (Object.values(errors.value).some(errorArray => errorArray.length > 0)) {
    showMessage("Por favor corrige los errores del formulario", "error");
    return;
  }

  saving.value = true;
  
  try {
    console.log(`Guardando cambios del artículo de inventario ID: ${idArticulo}`);
    
    const formData = new FormData();
    formData.append('nombre', articulo.value.nombre.trim());
    formData.append('descripcion', articulo.value.descripcion?.trim() || '');
    formData.append('precio', articulo.value.precio.toString());
    formData.append('costo', articulo.value.costo.toString());
    formData.append('stock_actual', articulo.value.stock_actual.toString());
    formData.append('ubicacion', articulo.value.ubicacion.trim());
    formData.append('estado', articulo.value.estado);
    
    if (articulo.value.id_categoria) {
      formData.append('id_categoria', articulo.value.id_categoria.toString());
    }
    
    if (imagenFile.value) {
      formData.append('imagen', imagenFile.value);
    }
    
    // Corregir URL para coincidir con el backend: inventario-cosina (sin 'c')
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${idArticulo}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    showMessage("Artículo de inventario actualizado exitosamente", "success");
    console.log("Artículo de inventario actualizado correctamente");
    
    // Regresar después de un breve delay
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (err) {
    console.error("Error al guardar artículo de inventario:", err);
    showMessage("Error al guardar los cambios", "error");
  } finally {
    saving.value = false;
  }
};

const eliminarArticulo = async () => {
  if (!confirm("¿Estás seguro de que deseas eliminar este artículo de inventario? Esta acción no se puede deshacer.")) {
    return;
  }
  
  deleting.value = true;
  
  try {
    console.log(`Eliminando artículo de inventario ID: ${idArticulo}`);
    
    // Corregir URL para coincidir con el backend: inventario-cosina (sin 'c')
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${idArticulo}`
    );
    
    showMessage("Artículo de inventario eliminado correctamente", "success");
    console.log("Artículo de inventario eliminado");
    
    // Regresar después de un breve delay
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (err) {
    console.error("Error al eliminar artículo de inventario:", err);
    let errorMessage = "Error al eliminar el artículo de inventario";
    
    if (err.response?.status === 409) {
      errorMessage = "No se puede eliminar: el artículo tiene solicitudes asociadas";
    }
    
    showMessage(errorMessage, "error");
  } finally {
    deleting.value = false;
  }
};

onMounted(cargarArticulo);
</script>