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

    <!-- Selector de artículo -->
    <v-row v-if="!articuloSeleccionado" class="my-4">
      <v-col>
        <v-card>
          <v-card-title>
            <v-icon start>mdi-food</v-icon>
            Selecciona el artículo a editar
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="idArticuloSeleccionado"
              :items="articulos"
              item-title="nombre"
              item-value="idInventarioCocina"
              label="Seleccionar artículo"
              prepend-inner-icon="mdi-food-apple"
              :loading="cargandoArticulos"
              clearable
              @update:model-value="seleccionarArticulo"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar size="40">
                      <v-img 
                        v-if="item.raw.imagen" 
                        :src="`https://api-isabella-s-cakes.onrender.com${item.raw.imagen}`"
                        cover
                      />
                      <v-icon v-else>mdi-food</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.raw.nombre }}</v-list-item-title>
                  <v-list-item-subtitle>
                    ${{ item.raw.precio }} - {{ item.raw.estado ? 'Disponible' : 'No disponible' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Formulario de edición (solo se muestra cuando hay artículo seleccionado) -->
    <template v-if="articuloSeleccionado">
      <!-- Botón para cambiar artículo -->
      <v-row class="mb-4">
        <v-col>
          <v-btn 
            variant="outlined" 
            color="primary"
            @click="cambiarArticulo"
            prepend-icon="mdi-swap-horizontal"
          >
            Cambiar artículo
          </v-btn>
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
    </template>

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
const loading = ref(false);
const errors = ref({});

// Variables para el selector de artículos
const articulos = ref([]);
const cargandoArticulos = ref(false);
const idArticuloSeleccionado = ref(null);
const articuloSeleccionado = ref(false);

// Si viene un ID por parámetro, úsalo directamente
const idArticuloParam = route.params.id;

// Snackbar (notificaciones)
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

// Ganancia = precio - costo
const ganancia = computed(() => {
  const precio = articulo.value.precio;
  const costo = articulo.value.costo;
  
  if (precio !== null && costo !== null && !isNaN(precio) && !isNaN(costo)) {
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
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('El archivo es demasiado grande. Máximo 5MB.', 'error');
      return;
    }

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

  if (!articulo.value.nombre || articulo.value.nombre.trim() === "") {
    errors.value.nombre = ["El nombre es requerido"];
    isValid = false;
  }

  return isValid;
};

// 🔁 GET todos los artículos
const cargarArticulos = async () => {
  cargandoArticulos.value = true;
  try {
  const res = await axios.get('https://api-isabella-s-cakes.onrender.com/api/inventario-cosina');
    articulos.value = res.data;
    console.log('Artículos cargados:', res.data); // Debug
    // Verificar si los artículos tienen ID
    if (res.data.length > 0) {
      console.log('Primer artículo:', res.data[0]); // Debug
      console.log('Campos disponibles:', Object.keys(res.data[0])); // Debug
      
      // Detectar automáticamente el campo ID
      const primerArticulo = res.data[0];
      const posiblesCamposId = ['id', 'ID', '_id', 'idInventarioCocina', 'inventario_id'];
      let campoId = null;
      
      for (const campo of posiblesCamposId) {
        if (Object.prototype.hasOwnProperty.call(primerArticulo, campo)) {
          campoId = campo;
          console.log('Campo ID detectado:', campo, '=', primerArticulo[campo]); // Debug
          break;
        }
      }
      
      if (!campoId) {
        console.warn('No se pudo detectar el campo ID. Campos disponibles:', Object.keys(primerArticulo));
        showSnackbar('Advertencia: No se pudo detectar el campo ID en los artículos', 'warning');
      }
    }
  } catch (error) {
    console.error("Error al cargar artículos:", error);
    showSnackbar("Error al cargar la lista de artículos", "error");
  } finally {
    cargandoArticulos.value = false;
  }
};

// 🔁 GET artículo específico
const cargarArticulo = async (id) => {
  console.log('Cargando artículo con ID:', id, typeof id); // Debug
  try {
  const url = `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${id}`;
    console.log('URL de la petición:', url); // Debug
    const res = await axios.get(url);
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
    articuloSeleccionado.value = true;
  } catch (error) {
    console.error("Error al cargar artículo:", error);
    showSnackbar("Error al cargar el artículo", "error");
  }
};

// Seleccionar artículo del dropdown
const seleccionarArticulo = (id) => {
  console.log('ID seleccionado:', id, typeof id); // Debug
  if (id) {
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      idArticuloSeleccionado.value = numericId;
      cargarArticulo(numericId);
    } else {
      console.error('ID no es numérico:', id);
      showSnackbar('Error: ID de artículo inválido', 'error');
    }
  }
};

// Cambiar artículo (volver al selector)
const cambiarArticulo = () => {
  articuloSeleccionado.value = false;
  idArticuloSeleccionado.value = null;
  articulo.value = {
    nombre: "",
    descripcion: "",
    precio: null,
    costo: null,
    estado: true,
    imagen: null,
  };
  imagenFile.value = null;
  imagenPreview.value = null;
  errors.value = {};
};

// 💾 PUT (guardar cambios)
const guardarCambios = async () => {
  if (!validarFormulario()) {
    return;
  }

  const idActual = idArticuloSeleccionado.value || idArticuloParam;
  if (!idActual) {
    showSnackbar("No hay artículo seleccionado", "error");
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append("nombre", articulo.value.nombre.trim());
    formData.append("descripcion", articulo.value.descripcion || "");
    formData.append("precio", articulo.value.precio || 0);
    formData.append("costo", articulo.value.costo || 0);
    formData.append("estado", articulo.value.estado);

    if (imagenFile.value) {
      formData.append("imagen", imagenFile.value);
    }

    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${idActual}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000
      }
    );

    showSnackbar("¡Artículo actualizado exitosamente!", "success");
    setTimeout(() => router.back(), 1500);

  } catch (error) {
    console.error("Error al guardar cambios:", error);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error desconocido";
      showSnackbar(`Error ${status}: ${message}`, "error");
    } else {
      showSnackbar("No se pudo guardar el artículo", "error");
    }
  } finally {
    loading.value = false;
  }
};

// ❌ DELETE
const eliminarArticulo = async () => {
  if (!confirm("¿Seguro que deseas eliminar este artículo?")) return;

  const idActual = idArticuloSeleccionado.value || idArticuloParam;
  if (!idActual) {
    showSnackbar("No hay artículo seleccionado", "error");
    return;
  }

  loading.value = true;

  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/inventario-cosina/${idActual}`
    );
    showSnackbar("¡Artículo eliminado exitosamente!", "success");
    setTimeout(() => router.back(), 1500);
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    showSnackbar("Error al eliminar el artículo", "error");
  } finally {
    loading.value = false;
  }
};

// Ir a ingredientes
const irAIngredientes = () => {
  const idActual = idArticuloSeleccionado.value || idArticuloParam;
  router.push(`/inventario-cosina/${idActual}/ingredientes`);
};

// Cargar al montar
onMounted(async () => {
  // Si viene un ID por parámetro, cargar directamente ese artículo
  if (idArticuloParam) {
    await cargarArticulo(idArticuloParam);
  } else {
    // Si no hay ID, mostrar selector
    await cargarArticulos();
  }
});
</script>