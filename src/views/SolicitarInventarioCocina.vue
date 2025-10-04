<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="auto">
        <v-btn icon color="primary" @click="goToInventario">
          <v-icon>mdi-warehouse</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Solicitar artículo de Inventario Cocina</h2>
      </v-col>
    </v-row>

    <v-form @submit.prevent="enviarSolicitud">
      <v-autocomplete
        v-model="articuloSeleccionado"
        :items="articulos"
        item-title="nombre"
        item-value="idInventarioCocina"
        label="Selecciona un artículo"
        prepend-inner-icon="mdi-package-variant"
        :loading="loadingArticulos"
        required
        class="mb-4"
      />
      <v-text-field
        v-model.number="cantidad"
        label="Cantidad a solicitar"
        type="number"
        min="1"
        prepend-inner-icon="mdi-counter"
        required
        class="mb-4"
      />
      <v-textarea
        v-model="motivo"
        label="Motivo de la solicitud"
        prepend-inner-icon="mdi-comment"
        rows="2"
        class="mb-4"
      />
      <v-btn type="submit" color="success" :loading="enviando" block>
        <v-icon start>mdi-send</v-icon>
        Enviar solicitud
      </v-btn>
    </v-form>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const articulos = ref([]);
const loadingArticulos = ref(false);
const articuloSeleccionado = ref(null);
const cantidad = ref(1);
const motivo = ref("");
const enviando = ref(false);

const snackbar = ref({ show: false, message: '', color: 'success' });

const goToInventario = () => {
  router.push('/inventario-cocina');
};

const cargarArticulos = async () => {
  loadingArticulos.value = true;
  try {
    // Corregir URL para coincidir con el backend: inventario-cosina (sin 'c')
  const res = await axios.get('https://api-isabella-s-cakes.onrender.com/api/inventario-cosina');
    articulos.value = res.data || [];
    console.log('Artículos cargados:', articulos.value);
  } catch (err) {
    console.error('Error al cargar artículos:', err);
    snackbar.value = { show: true, message: 'Error al cargar artículos', color: 'error' };
  } finally {
    loadingArticulos.value = false;
  }
};

const enviarSolicitud = async () => {
  if (!articuloSeleccionado.value || cantidad.value < 1) {
    snackbar.value = { show: true, message: 'Selecciona un artículo y cantidad válida', color: 'error' };
    return;
  }
  
  enviando.value = true;
  try {
  await axios.post('https://api-isabella-s-cakes.onrender.com/api/solicitudes-inventario', {
      articuloId: articuloSeleccionado.value,
      cantidad: cantidad.value,
      motivo: motivo.value,
      ubicacionSolicitante: 'Cocina' // Cambia esto si tienes otra ubicación
    });
    snackbar.value = { show: true, message: 'Solicitud enviada correctamente', color: 'success' };
    // Limpiar formulario
    articuloSeleccionado.value = null;
    cantidad.value = 1;
    motivo.value = "";
  } catch (err) {
    console.error('Error al enviar solicitud:', err);
    snackbar.value = { show: true, message: 'Error al enviar la solicitud', color: 'error' };
  } finally {
    enviando.value = false;
  }
};

onMounted(cargarArticulos);
</script>