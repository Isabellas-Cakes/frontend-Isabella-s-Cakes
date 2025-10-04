<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Crear Artículo Externo</h2>
      </v-col>
    </v-row>

    <!-- Selector de imagen -->
    <v-row justify="center" class="my-4">
      <v-avatar size="80" class="elevation-2" @click="seleccionarImagen">
        <template v-if="imagenPreview">
          <v-img :src="imagenPreview" cover />
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

    <v-form @submit.prevent="guardarArticuloExterno">
      <!-- Selector de categoría externa -->
      <v-select
        v-model="articuloExterno.id_categoria"
        :items="categoriasExternas"
        item-title="nombre"
        item-value="id_categoria"
        label="Categoría Externa*"
        prepend-inner-icon="mdi-folder"
        required
        :error-messages="errors.categoria"
        :loading="cargandoCategorias"
      />

      <v-text-field
        v-model="articuloExterno.nombre"
        label="Nombre*"
        prepend-inner-icon="mdi-package-variant"
        required
        :error-messages="errors.nombre"
      />
      
      <v-textarea
        v-model="articuloExterno.descripcion"
        label="Descripción"
        prepend-inner-icon="mdi-text"
        auto-grow
        rows="3"
      />
      
      <v-text-field
        v-model.number="articuloExterno.costo"
        label="Costo*"
        prepend-inner-icon="mdi-cash"
        type="number"
        min="0"
        step="0.01"
        required
        :error-messages="errors.costo"
      />
      
      <v-text-field
        v-model.number="articuloExterno.precio"
        label="Precio*"
        prepend-inner-icon="mdi-currency-usd"
        type="number"
        min="0"
        step="0.01"
        required
        :error-messages="errors.precio"
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
      
      <v-text-field
        v-model.number="articuloExterno.stock_actual"
        label="Stock Actual"
        prepend-inner-icon="mdi-package"
        type="number"
        min="0"
        step="1"
      />
      
      <v-switch
        v-model="articuloExterno.estado"
        label="Activo"
        color="teal"
        inset
      />

      <p class="text-caption mt-2 text-info">
        <v-icon size="16" class="mr-1">mdi-information</v-icon>
        Los artículos externos son productos de proveedores externos que se venden en el establecimiento.
      </p>

      <v-btn 
        type="submit" 
        color="light-green darken-2" 
        block 
        class="mt-4" 
        dark
        :loading="loading"
        :disabled="loading || !articuloExterno.id_categoria"
      >
        <v-icon start>mdi-content-save</v-icon>
        {{ loading ? 'Guardando...' : 'Guardar Artículo Externo' }}
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const loading = ref(false);
const cargandoCategorias = ref(false);
const errors = ref({});
const categoriasExternas = ref([]);

// Estado para snackbar (notificaciones)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const articuloExterno = ref({
  nombre: "",
  descripcion: "",
  precio: null,
  costo: null,
  estado: true,
  stock_actual: 0,
  id_categoria: null,
});

// Computed property para calcular la ganancia
const ganancia = computed(() => {
  const precio = articuloExterno.value.precio;
  const costo = articuloExterno.value.costo;
  
  if (precio !== null && precio !== "" && costo !== null && costo !== "" && 
      !isNaN(precio) && !isNaN(costo) && precio >= 0 && costo >= 0) {
    return parseFloat((precio - costo).toFixed(2));
  }
  
  return null;
});

const fileInput = ref(null);
const imagenFile = ref(null);
const imagenPreview = ref(null);

// Cargar categorías externas al montar el componente
onMounted(async () => {
  await cargarCategoriasExternas();
});

const cargarCategoriasExternas = async () => {
  cargandoCategorias.value = true;
  try {
  const response = await axios.get("https://api-isabella-s-cakes.onrender.com/api/categorias-externas");
    categoriasExternas.value = response.data;
    console.log("Categorías externas cargadas:", response.data);
  } catch (error) {
    console.error("Error al cargar categorías externas:", error);
    showSnackbar("Error al cargar las categorías externas", "error");
  } finally {
    cargandoCategorias.value = false;
  }
};

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
  if (!articuloExterno.value.nombre || articuloExterno.value.nombre.trim() === "") {
    errors.value.nombre = ["El nombre es requerido"];
    isValid = false;
  }

  // Validar categoría
  if (!articuloExterno.value.id_categoria) {
    errors.value.categoria = ["La categoría externa es requerida"];
    isValid = false;
  }

  // Validar precio
  if (!articuloExterno.value.precio || articuloExterno.value.precio <= 0) {
    errors.value.precio = ["El precio es requerido y debe ser mayor a 0"];
    isValid = false;
  }

  // Validar costo
  if (!articuloExterno.value.costo || articuloExterno.value.costo <= 0) {
    errors.value.costo = ["El costo es requerido y debe ser mayor a 0"];
    isValid = false;
  }

  return isValid;
};

const guardarArticuloExterno = async () => {
  if (!validarFormulario()) {
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    
    // Agregar datos básicos
    formData.append("nombre", articuloExterno.value.nombre.trim());
    formData.append("descripcion", articuloExterno.value.descripcion || "");
    formData.append("precio", articuloExterno.value.precio);
    formData.append("costo", articuloExterno.value.costo);
    formData.append("estado", articuloExterno.value.estado);
    formData.append("stock_actual", articuloExterno.value.stock_actual || 0);
    formData.append("id_categoria", articuloExterno.value.id_categoria);

    // Agregar imagen si existe
    if (imagenFile.value) {
      formData.append("imagen", imagenFile.value);
    }

    // Log para debugging
    console.log("Datos a enviar:");
    console.log("- nombre:", articuloExterno.value.nombre.trim());
    console.log("- descripcion:", articuloExterno.value.descripcion);
    console.log("- precio:", articuloExterno.value.precio);
    console.log("- costo:", articuloExterno.value.costo);
    console.log("- estado:", articuloExterno.value.estado);
    console.log("- stock_actual:", articuloExterno.value.stock_actual || 0);
    console.log("- id_categoria:", articuloExterno.value.id_categoria);
    console.log("- imagen:", imagenFile.value ? "Sí" : "No");

    const response = await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/articulos-externos",
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
    showSnackbar("¡Artículo externo creado exitosamente!", "success");
    
    // Esperar un momento antes de redirigir para que el usuario vea el mensaje
    setTimeout(() => {
      router.push("/articulos-externos");
    }, 1500);

  } catch (error) {
    console.error("Error al guardar artículo externo:", error);
    
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
</script>

<style scoped>
.text-info {
  color: #2196F3;
}
</style>