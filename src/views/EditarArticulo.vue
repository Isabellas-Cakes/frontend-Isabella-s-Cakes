<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar artículo</h2>
      </v-col>
    </v-row>

    <!-- Selector de imagen -->
    <v-row justify="center" class="my-4">
      <v-avatar size="80" class="elevation-2" @click="seleccionarImagen">
        <template v-if="imagenPreview || articulo.imagen">
          <v-img :src="imagenPreview || articulo.imagen" cover />
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

    <v-form @submit.prevent="guardarCambios">
      <v-text-field
        v-model="articulo.nombre"
        label="Nombre*"
        prepend-inner-icon="mdi-pencil"
        required
        :error-messages="errors.nombre"
      />
      <v-text-field
        v-model="articulo.descripcion"
        label="Descripción"
        prepend-inner-icon="mdi-pencil"
      />
      <v-text-field
        v-model.number="articulo.costo"
        label="Costo"
        prepend-inner-icon="mdi-cash"
        type="number"
        min="0"
        step="0.01"
      />
      <v-text-field
        v-model.number="articulo.precio"
        label="Precio"
        prepend-inner-icon="mdi-currency-usd"
        type="number"
        min="0"
        step="0.01"
      />
      <v-text-field
        :model-value="ganancia"
        label="Ganancia"
        prepend-inner-icon="mdi-trending-up"
        type="number"
        readonly
        :hint="ganancia !== null ? 'Calculado automáticamente: Precio - Costo' : 'Ingresa costo y precio para ver la ganancia'"
        persistent-hint
      />
      <v-switch
        v-model="articulo.estado"
        label="Disponible"
        color="teal"
        inset
      />

      <v-btn 
        type="submit" 
        color="light-green darken-2" 
        block 
        class="mt-4" 
        dark
        :loading="loading"
        :disabled="loading"
      >
        <v-icon start>mdi-content-save</v-icon>
        {{ loading ? 'Guardando...' : 'Guardar cambios' }}
      </v-btn>

      <v-btn color="red" dark block class="mt-2" @click="eliminarArticulo">
        <v-icon start>mdi-delete</v-icon>
        Eliminar
      </v-btn>

      <v-btn color="teal" dark block class="mt-2" @click="irAIngredientes">
        <v-icon start>mdi-food-apple</v-icon>
        Ingredientes de {{ articulo.nombre || "..." }}
      </v-btn>
    </v-form>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const idArticulo = route.params.id;
const loading = ref(false);
const errors = ref({});

// Estado para snackbar (notificaciones)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const articulo = ref({
  nombre: "",
  descripcion: "",
  precio: null,
  costo: null,
  estado: true,
  imagen: null,
});

// Computed property para calcular la ganancia
const ganancia = computed(() => {
  const precio = articulo.value.precio;
  const costo = articulo.value.costo;
  
  if (precio !== null && precio !== "" && costo !== null && costo !== "" && 
      !isNaN(precio) && !isNaN(costo) && precio >= 0 && costo >= 0) {
    return parseFloat((precio - costo).toFixed(2));
  }
  
  return null;
});

const fileInput = ref(null);
const imagenFile = ref(null);
const imagenPreview = ref(null);

const seleccionarImagen = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleImagenSeleccionada = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar tamaño del archivo (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('El archivo es demasiado grande. Máximo 5MB.', 'error');
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showSnackbar('Solo se permiten archivos de imagen.', 'error');
      return;
    }

    imagenFile.value = file;
    imagenPreview.value = URL.createObjectURL(file);
  }
};

const showSnackbar = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const validarFormulario = () => {
  errors.value = {};
  let isValid = true;

  // Validar nombre
  if (!articulo.value.nombre || articulo.value.nombre.trim() === "") {
    errors.value.nombre = ["El nombre es requerido"];
    isValid = false;
  }

  return isValid;
};

const cargarArticulo = async () => {
  try {
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/articulos/${idArticulo}`
    );
    articulo.value = {
      nombre: res.data.nombre || "",
      descripcion: res.data.descripcion || "",
      precio: parseFloat(res.data.precio) || null,
      costo: parseFloat(res.data.costo) || null,
      estado: res.data.estado ?? true,
      imagen: res.data.imagen
  ? `https://api-isabella-s-cakes.onrender.com${res.data.imagen}`
        : null,
    };
  } catch (error) {
    console.error("Error al cargar artículo:", error);
    showSnackbar("Error al cargar el artículo", "error");
  }
};

const guardarCambios = async () => {
  if (!validarFormulario()) {
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    
    // Agregar datos básicos
    formData.append("nombre", articulo.value.nombre.trim());
    formData.append("descripcion", articulo.value.descripcion || "");
    formData.append("precio", articulo.value.precio || 0);
    formData.append("costo", articulo.value.costo || 0);
    formData.append("estado", articulo.value.estado);

    // Agregar imagen si existe
    if (imagenFile.value) {
      formData.append("imagen", imagenFile.value);
    }

    // Log para debugging
    console.log("Datos a enviar:");
    console.log("- nombre:", articulo.value.nombre.trim());
    console.log("- descripcion:", articulo.value.descripcion);
    console.log("- precio:", articulo.value.precio || 0);
    console.log("- costo:", articulo.value.costo || 0);
    console.log("- estado:", articulo.value.estado);
    console.log("- imagen:", imagenFile.value ? "Sí" : "No");

    const response = await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/articulos/${idArticulo}`,
      formData,
      {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    console.log("Respuesta del servidor:", response.data);
    
    // Mostrar mensaje de éxito
    showSnackbar("¡Artículo actualizado exitosamente!", "success");
    
    // Esperar un momento antes de redirigir para que el usuario vea el mensaje
    setTimeout(() => {
      router.back();
    }, 1500);

  } catch (error) {
    console.error("Error al guardar cambios:", error);
    
    // Manejo detallado de errores
    if (error.response) {
      console.error("Datos del error del servidor:", error.response.data);
      console.error("Status:", error.response.status);
      
      // Mostrar mensaje específico según el tipo de error
      if (error.response.status === 400) {
        const message = error.response.data?.message || "Datos inválidos";
        showSnackbar(`Error de validación: ${message}`, "error");
        
        // Si hay detalles de errores, mostrarlos en la consola
        if (error.response.data?.details) {
          console.error("Detalles del error:", error.response.data.details);
        }
      } else if (error.response.status === 500) {
        showSnackbar("Error interno del servidor. Revisa la consola para más detalles.", "error");
        
        if (error.response.data?.details) {
          console.error("Detalles del error del servidor:", error.response.data.details);
        }
      } else {
        const message = error.response.data?.message || "Error desconocido";
        showSnackbar(`Error ${error.response.status}: ${message}`, "error");
      }
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor:", error.request);
  showSnackbar("No se pudo conectar con el servidor. Verifica que esté ejecutándose en https://api-isabella-s-cakes.onrender.com", "error");
    } else {
      console.error("Error al configurar la petición:", error.message);
      showSnackbar(`Error al enviar los datos: ${error.message}`, "error");
    }
  } finally {
    loading.value = false;
  }
};

const eliminarArticulo = async () => {
  if (!confirm("¿Seguro que deseas eliminar este artículo?")) return;
  
  loading.value = true;
  
  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/articulos/${idArticulo}`
    );
    showSnackbar("¡Artículo eliminado exitosamente!", "success");
    
    // Esperar un momento antes de redirigir
    setTimeout(() => {
      router.back();
    }, 1500);
    
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    showSnackbar("Error al eliminar el artículo", "error");
  } finally {
    loading.value = false;
  }
};

const irAIngredientes = () => {
  router.push(`/articulos/${idArticulo}/ingredientes`);
};

onMounted(cargarArticulo);
</script>
