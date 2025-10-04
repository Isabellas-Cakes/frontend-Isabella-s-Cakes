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
          v-model="categoriaExterna.nombre"
          label="Nombre*"
          prepend-inner-icon="mdi-pencil"
          required
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="categoriaExterna.descripcion"
          label="Descripción"
          prepend-inner-icon="mdi-text"
        />
      </v-col>

      <v-col cols="12">
        <v-btn 
          color="success" 
          block 
          @click="guardarCategoriaExterna"
          :loading="guardando"
          :disabled="!categoriaExterna.nombre.trim()"
        >
          <v-icon start>mdi-content-save</v-icon>
          Guardar
        </v-btn>
        
        <!-- Botón opcional para ir a ver categorías después de guardar -->
        <v-btn
          v-if="mostrarBotonVer"
          color="primary"
          variant="outlined"
          block
          @click="irACategorias"
          class="mt-2"
        >
          <v-icon start>mdi-eye</v-icon>
          Ver Categorías
        </v-btn>
      </v-col>
    </v-row>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top"
    >
      <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
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

// Estado del formulario
const categoriaExterna = ref({
  nombre: "",
  descripcion: "",
});

// Estado de la UI
const guardando = ref(false);
const mostrarBotonVer = ref(false);
const snackbar = ref({
  show: false,
  message: "",
  color: "success",
  icon: "mdi-check-circle"
});

// Reglas de validación
const rules = {
  required: value => !!value || "Este campo es requerido"
};

// Función para guardar categoría externa
const guardarCategoriaExterna = async () => {
  if (!categoriaExterna.value.nombre.trim()) {
    mostrarMensaje("El nombre de la categoría es requerido", "error", "mdi-alert-circle");
    return;
  }

  guardando.value = true;
  
  try {
    console.log("🚀 Enviando datos:", categoriaExterna.value);
  console.log("🌐 URL destino:", "https://api-isabella-s-cakes.onrender.com/api/categorias-externas");
    
    const response = await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/categorias-externas", // Mantén la URL original
      categoriaExterna.value,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log("✅ Respuesta exitosa:", response.data);
    console.log("📊 Status:", response.status);
    
    mostrarMensaje("¡Categoría externa creada exitosamente! 🎉", "success", "mdi-check-circle");
    
    // Limpiar formulario después de un momento para crear otra
    setTimeout(() => {
      limpiarFormulario();
      mostrarBotonVer.value = true; // Mostrar botón para ir a ver categorías
      // Ya no redirigir - quedarse en la página para crear más categorías
    }, 2000);
    
  } catch (error) {
    console.error("❌ Error completo:", error);
    console.error("📝 Tipo de error:", error.name);
    console.error("💬 Mensaje:", error.message);
    
    let mensajeError = "Error al guardar la categoría externa";
    
    if (error.response) {
      // El servidor respondió con un error
      console.error("🔴 Error del servidor:");
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      console.error("   Headers:", error.response.headers);
      
      if (error.response.status === 404) {
        mensajeError = "🚫 Endpoint no encontrado. Verifica que el backend tenga la ruta /api/categorias-externas";
      } else if (error.response.status === 500) {
        mensajeError = "🔧 Error interno del servidor";
      } else if (error.response.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response.data?.details) {
        mensajeError = error.response.data.details.join(", ");
      }
    } else if (error.request) {
      // La petición se envió pero no se recibió respuesta
      console.error("🌐 No hay respuesta del servidor:");
      console.error("   Request:", error.request);
      mensajeError = "🔌 No se pudo conectar con el servidor. ¿Está ejecutándose en puerto 8080?";
    } else if (error.code === 'ERR_NETWORK') {
      // Error de red (posiblemente CORS)
      console.error("🚫 Error de red/CORS detectado");
      mensajeError = "🌐 Error CORS: El servidor no permite conexiones desde este origen";
    } else {
      // Error en la configuración de la petición
      console.error("⚙️ Error de configuración:", error.message);
      mensajeError = `⚙️ Error de configuración: ${error.message}`;
    }
    
    mostrarMensaje(mensajeError, "error", "mdi-alert-circle");
  } finally {
    guardando.value = false;
  }
};

// Función para mostrar mensajes
const mostrarMensaje = (message, color, icon) => {
  snackbar.value = {
    show: true,
    message,
    color,
    icon
  };
};

// Función para ir a ver categorías (opcional)
const irACategorias = () => {
  router.push("/categorias-externas");
};

// Función para limpiar el formulario
const limpiarFormulario = () => {
  categoriaExterna.value.nombre = "";
  categoriaExterna.value.descripcion = "";
  mostrarBotonVer.value = false; // Ocultar botón cuando se limpia
};

// Función para volver atrás
const volver = () => {
  router.back();
};
</script>

<style scoped>
/* Estilos mínimos si se necesitan */
</style>