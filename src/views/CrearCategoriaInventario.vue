<template>
  <v-container>
    <!-- Botón de regresar -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn icon @click="volver">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="text-h5 font-weight-bold ml-3">Crear Categoría de Inventario</span>
      </v-col>
    </v-row>

    <!-- Formulario -->
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="categoria.nombre"
          label="Nombre de la Categoría*"
          prepend-inner-icon="mdi-folder"
          required
          :error-messages="errors.nombre"
          hint="Ej: Ingredientes Básicos, Bebidas, Utensilios"
          persistent-hint
        />
        
        <v-text-field
          v-model="categoria.descripcion"
          label="Descripción"
          prepend-inner-icon="mdi-text"
          hint="Describe qué tipo de items incluye esta categoría"
          persistent-hint
        />

        <!-- Selector de ubicación -->
        <v-select
          v-model="categoria.ubicacion"
          label="Ubicación*"
          prepend-inner-icon="mdi-map-marker"
          :items="ubicaciones"
          required
          :error-messages="errors.ubicacion"
          hint="¿Dónde se utilizarán principalmente los items de esta categoría?"
          persistent-hint
        />
      </v-col>

      <v-col cols="12">
        <v-btn 
          color="light-green darken-2" 
          block 
          @click="guardarCategoria"
          :loading="loading"
          :disabled="loading"
          dark
        >
          <v-icon start>mdi-content-save</v-icon>
          {{ loading ? 'Guardando...' : 'Guardar Categoría' }}
        </v-btn>
      </v-col>
    </v-row>

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
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const loading = ref(false);
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

// Datos de la categoría
const categoria = ref({
  nombre: "",
  descripcion: "",
  ubicacion: ""
});

const showSnackbar = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

const validarFormulario = () => {
  errors.value = {};
  let isValid = true;

  // Validar nombre
  if (!categoria.value.nombre || categoria.value.nombre.trim() === "") {
    errors.value.nombre = ["El nombre de la categoría es requerido"];
    isValid = false;
  }

  // Validar ubicación
  if (!categoria.value.ubicacion) {
    errors.value.ubicacion = ["La ubicación es requerida"];
    isValid = false;
  }

  return isValid;
};

const guardarCategoria = async () => {
  if (!validarFormulario()) {
    return;
  }

  loading.value = true;

  try {
    const datos = {
      nombre: categoria.value.nombre.trim(),
      descripcion: categoria.value.descripcion?.trim() || "",
      ubicacion: categoria.value.ubicacion
    };

    console.log("Datos a enviar:", datos);

    const response = await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/categorias-inventario",
      datos,
      {
        headers: { 
          "Content-Type": "application/json" 
        },
        timeout: 10000
      }
    );

    console.log("Respuesta del servidor:", response.data);
    
    // Mostrar mensaje de éxito
    showSnackbar("¡Categoría de inventario creada exitosamente!", "success");
    
    // Esperar un momento antes de redirigir
    setTimeout(() => {
      router.push("/categorias-inventario"); // Ajusta la ruta según tu aplicación
    }, 1500);

  } catch (error) {
    console.error("Error al guardar categoría:", error);
    
    // Manejo detallado de errores
    if (error.response) {
      console.error("Datos del error del servidor:", error.response.data);
      console.error("Status:", error.response.status);
      
      if (error.response.status === 400) {
        const message = error.response.data?.message || "Datos inválidos";
        showSnackbar(`Error de validación: ${message}`, "error");
        
        if (error.response.data?.details) {
          console.error("Detalles del error:", error.response.data.details);
        }
      } else if (error.response.status === 409) {
        showSnackbar("Ya existe una categoría con este nombre", "error");
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

const volver = () => {
  router.back();
};
</script>