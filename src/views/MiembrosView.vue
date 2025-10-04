<template>
  <v-container>
    <h2 class="text-h5 font-weight-bold mb-4">Gestión de Miembros</h2>

    <v-row>
      <v-col
        cols="12"
        md="4"
        v-for="miembro in miembros"
        :key="miembro.id_miembro"
      >
        <v-card class="pa-3" elevation="3">
          <v-card-title class="text-h6"
            >{{ miembro.nombre }} {{ miembro.apellido }}</v-card-title
          >
          <v-card-subtitle>{{ miembro.correo }}</v-card-subtitle>
          <v-card-text>
            <div><strong>Teléfono:</strong> {{ miembro.telefono || "—" }}</div>
            <div><strong>Rol:</strong> {{ miembro.rol?.nombre || "—" }}</div>
            <div>
              <strong>Estado:</strong>
              <v-chip :color="miembro.estado ? 'green' : 'red'" dark>
                {{ miembro.estado ? "Activo" : "Inactivo" }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="editarMiembro(miembro)"
              >Editar</v-btn
            >
            <v-btn color="error" @click="eliminarMiembro(miembro.id_miembro)"
              >Eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{
            editando ? "Editar Miembro" : "Nuevo Miembro"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.nombre" label="Nombre" required />
          <v-text-field v-model="form.apellido" label="Apellido" required />
          <v-text-field
            v-model="form.correo"
            label="Correo"
            type="email"
            required
          />
          <v-text-field v-model="form.telefono" label="Teléfono" />
          <v-text-field
            v-if="!editando"
            v-model="form.contrasena"
            label="Contraseña"
            type="password"
            required
          />
          <v-select
            v-model="form.id_rol"
            :items="roles"
            item-title="nombre"
            item-value="id_rol"
            label="Rol"
            required
          />
          <v-switch v-model="form.estado" label="Estado Activo" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarMiembro">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      color="success"
      class="mt-4"
      @click="nuevoMiembro"
      prepend-icon="mdi-plus"
    >
      Nuevo Miembro
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const miembros = ref([]);
const roles = ref([]);
const dialog = ref(false);
const editando = ref(false);
const form = ref({
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  contrasena: "",
  id_rol: null,
  estado: true,
});

const obtenerMiembros = async () => {
  try {
    const res = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/miembros"
    );
    miembros.value = res.data;
  } catch (error) {
    console.error("Error al obtener miembros:", error);
  }
};

const obtenerRoles = async () => {
  try {
    const res = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/roles"
    );
    roles.value = res.data;
  } catch (error) {
    console.error("Error al obtener roles:", error);
  }
};

const nuevoMiembro = () => {
  editando.value = false;
  form.value = {
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    contrasena: "",
    id_rol: null,
    estado: true,
  };
  dialog.value = true;
};

const editarMiembro = (miembro) => {
  form.value = {
    ...miembro,
    contrasena: "", // ← no mostramos la contraseña existente
  };
  editando.value = true;
  dialog.value = true;
};

const guardarMiembro = async () => {
  try {
    if (editando.value) {
      const payload = { ...form.value };
      delete payload.contrasena; // ← no actualizamos si no se cambió
      await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${form.value.id_miembro}`,
        payload
      );
    } else {
      await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/miembros",
        form.value
      );
    }
    dialog.value = false;
    await obtenerMiembros();
  } catch (error) {
    console.error("Error al guardar miembro:", error);
  }
};

const eliminarMiembro = async (id) => {
  try {
    if (confirm("¿Estás seguro de eliminar este miembro?")) {
      await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${id}`
      );
      await obtenerMiembros();
    }
  } catch (error) {
    console.error("Error al eliminar miembro:", error);
  }
};

onMounted(() => {
  obtenerMiembros();
  obtenerRoles();
});
</script>
