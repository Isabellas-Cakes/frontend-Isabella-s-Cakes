<template>
  <v-container>
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Crear Item de Inventario</h2>
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

    <v-form @submit.prevent="guardarItemInventario">
      <v-text-field
        v-model="itemInventario.nombre"
        label="Nombre del Item*"
        prepend-inner-icon="mdi-package-variant"
        required
        :error-messages="errors.nombre"
      />
      
      <v-text-field
        v-model="itemInventario.descripcion"
        label="Descripción"
        prepend-inner-icon="mdi-pencil"
      />

      <!-- Selector de ubicación -->
      <v-select
        v-model="itemInventario.ubicacion"
        label="Ubicación*"
        prepend-inner-icon="mdi-map-marker"
        :items="ubicaciones"
        required
        :error-messages="errors.ubicacion"
      />

      <!-- Selector de categoría -->
      <v-select
        v-model="itemInventario.id_categoria"
        label="Categoría*"
        prepend-inner-icon="mdi-folder"
        :items="categorias"
        item-title="nombre"
        item-value="id_categoria"
        required
        :error-messages="errors.id_categoria"
        :loading="cargandoCategorias"
      />

      <v-text-field
        v-model.number="itemInventario.costo"
        label="Costo*"
        prepend-inner-icon="mdi-cash"
        type="number"
        min="0"
        step="0.01"
        required
        :error-messages="errors.costo"
      />

      <v-text-field
        v-model.number="itemInventario.precio"
        label="Precio de Venta*"
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
        v-model.number="itemInventario.stock_actual"
        label="Stock Inicial"
        prepend-inner-icon="mdi-counter"
        type="number"
        min="0"
        hint="Cantidad inicial en inventario"
        persistent-hint
      />

      <v-switch
        v-model="itemInventario.activo"
        label="Item Activo"
        color="teal"
        inset
      />

      <p class="text-caption mt-2 text-grey-600">
        <v-icon size="small" class="mr-1">mdi-information</v-icon>
        El item se guardará en el inventario de cocina para control de stock.
      </p>

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
        {{ loading ? 'Guardando...' : 'Guardar Item' }}
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

// Estado para snackbar (notificaciones)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Opciones para ubicación
const ubicaciones = [
  { title: 'Cocina', value: 'Cocina' },
  { title: 'Barra', value: 'Barra' }
];

// Lista de categorías
const categorias = ref([]);

// Datos del item de inventario
const itemInventario = ref({
  nombre: "",
  descripcion: "",
  precio: null,
  costo: null,
  stock_actual: 0,
  ubicacion: "",
  id_categoria: null,
  activo: true // Para manejar el estado como boolean en el frontend
});

// Computed property para calcular la ganancia
const ganancia = computed(() => {
  const precio = itemInventario.value.precio;
  const costo = itemInventario.value.costo;
  
  if (precio !== null && precio !== "" && costo !== null && costo !== "" && 
      !isNaN(precio) && !isNaN(costo) && precio >= 0 && costo >= 0) {
    return parseFloat((precio - costo).toFixed(2));
  }
  
  return null;
});

// Cargar categorías de inventario
const cargarCategorias = async () => {
  cargandoCategorias.value = true;
  try {
  const response = await axios.get("https://api-isabella-s-cakes.onrender.com/api/categorias-inventario");
    categorias.value = Array.isArray(response.data) ? response.data : [];
    console.log("Categorías cargadas:", categorias.value);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    showSnackbar("Error al cargar las categorías", "error");
  } finally {
    cargandoCategorias.value = false;
  }
};

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
  if (!itemInventario.value.nombre || itemInventario.value.nombre.trim() === "") {
    errors.value.nombre = ["El nombre es requerido"];
    isValid = false;
  }

  // Validar ubicación
  if (!itemInventario.value.ubicacion) {
    errors.value.ubicacion = ["La ubicación es requerida"];
    isValid = false;
  }

  // Validar categoría
  if (!itemInventario.value.id_categoria) {
    errors.value.id_categoria = ["La categoría es requerida"];
    isValid = false;
  }

  // Validar costo
  if (itemInventario.value.costo === null || itemInventario.value.costo === "" || itemInventario.value.costo < 0) {
    errors.value.costo = ["El costo es requerido y debe ser mayor o igual a 0"];
    isValid = false;
  }

  // Validar precio
  if (itemInventario.value.precio === null || itemInventario.value.precio === "" || itemInventario.value.precio < 0) {
    errors.value.precio = ["El precio es requerido y debe ser mayor o igual a 0"];
    isValid = false;
  }

  return isValid;
};

const guardarItemInventario = async () => {
  if (!validarFormulario()) {
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    
    // Agregar datos básicos
    formData.append("nombre", itemInventario.value.nombre.trim());
    formData.append("descripcion", itemInventario.value.descripcion || "");
    formData.append("precio", itemInventario.value.precio);
    formData.append("costo", itemInventario.value.costo);
    formData.append("stock_actual", itemInventario.value.stock_actual || 0);
    formData.append("ubicacion", itemInventario.value.ubicacion);
    formData.append("id_categoria", itemInventario.value.id_categoria);
    
    // Convertir boolean a string para el estado ENUM
    const estadoValue = itemInventario.value.activo ? "activo" : "inactivo";
    formData.append("estado", estadoValue);

    // Agregar imagen si existe
    if (imagenFile.value) {
      formData.append("imagen", imagenFile.value);
    }

    // Log para debugging
    console.log("Datos a enviar:");
    console.log("- nombre:", itemInventario.value.nombre.trim());
    console.log("- descripcion:", itemInventario.value.descripcion);
    console.log("- precio:", itemInventario.value.precio);
    console.log("- costo:", itemInventario.value.costo);
    console.log("- stock_actual:", itemInventario.value.stock_actual || 0);
    console.log("- ubicacion:", itemInventario.value.ubicacion);
    console.log("- id_categoria:", itemInventario.value.id_categoria);
    console.log("- estado:", estadoValue);
    console.log("- imagen:", imagenFile.value ? "Sí" : "No");

    const response = await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/inventario-cosina",
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
    showSnackbar("¡Item de inventario creado exitosamente!", "success");
    
    // Esperar un momento antes de redirigir para que el usuario vea el mensaje
    setTimeout(() => {
      router.push("/inventario"); // Ajusta la ruta según tu aplicación
    }, 1500);

  } catch (error) {
    console.error("Error al guardar item de inventario:", error);
    
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

// Cargar categorías al montar el componente
onMounted(() => {
  cargarCategorias();
});
</script>