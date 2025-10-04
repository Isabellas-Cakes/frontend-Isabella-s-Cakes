<template>
  <v-container>
    <!-- Encabezado -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <v-col>
        <h2 class="text-h5 font-weight-bold">Editar perfil</h2>
      </v-col>
    </v-row>

    <!-- Formulario -->
    <v-form v-model="formValido" ref="formRef">
      <v-text-field
        v-model="miembro.nombre"
        label="Nombre"
        :rules="[(v) => !!v || 'Requerido']"
      />

      <v-text-field
        v-model="miembro.apellido"
        label="Apellido"
        :rules="[(v) => !!v || 'Requerido']"
      />

      <v-text-field
        v-model="miembro.correo"
        label="Correo electrónico"
        :rules="[(v) => !!v || 'Requerido']"
        type="email"
      />

      <v-text-field v-model="miembro.telefono" label="Teléfono" />

      <v-text-field
        v-model="miembro.contrasena"
        label="Contraseña"
        type="password"
        :rules="[(v) => !!v || 'Requerido']"
      />

      <!-- Botón Guardar -->
      <v-btn
        color="teal"
        class="mt-4"
        block
        @click="guardarPerfil"
        :disabled="!formValido"
      >
        <v-icon start>mdi-content-save</v-icon>
        Guardar cambios
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// Simular ID del miembro autenticado (puedes obtenerlo del auth más adelante)
const idMiembro = 1;

const router = useRouter();
const formRef = ref(null);
const formValido = ref(false);

const miembro = ref({
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  contrasena: "",
});

const cargarDatos = async () => {
  try {
    const res = await axios.get(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${idMiembro}`
    );
    Object.assign(miembro.value, res.data);
  } catch (err) {
    console.error("Error al cargar miembro:", err);
  }
};

const guardarPerfil = async () => {
  try {
    const esValido = await formRef.value.validate();
    if (!esValido.valid) return;

    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${idMiembro}`,
      miembro.value
    );
    alert("Perfil actualizado correctamente");
    router.back();
  } catch (err) {
    console.error("Error al guardar perfil:", err);
    alert("Error al actualizar el perfil");
  }
};

onMounted(() => {
  cargarDatos();
});
</script>
