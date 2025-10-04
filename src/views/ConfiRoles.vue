<template>
  <v-container>
     <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
    <h2 class="text-h5 font-weight-bold mb-4">Miembros y roles</h2>

    <!-- Botón para nuevo miembro -->
    <v-btn
      color="success"
      class="mb-4"
      @click="abrirDialogoMiembro"
      prepend-icon="mdi-account-plus"
    >
      Nuevo miembro
    </v-btn>

    <!-- Lista de miembros -->
    <v-row dense>
      <v-col
        cols="12"
        md="6"
        v-for="miembro in miembros"
        :key="miembro.id_miembro"
      >
        <v-card class="pa-3" elevation="2">
          <v-card-title class="d-flex justify-space-between">
            <div>
              <span class="text-subtitle-1 font-weight-bold"
                >{{ miembro.nombre }} {{ miembro.apellido }}</span
              >
              <div class="text-caption">{{ miembro.correo }}</div>
            </div>
            <div>
              <v-btn icon @click="abrirDialogoEditar(miembro)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="confirmarEliminacion(miembro)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <v-select
              v-model="miembro.id_rol"
              :items="roles"
              item-title="nombre"
              item-value="id_rol"
              label="Rol"
              dense
              outlined
            />
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="actualizarRol(miembro)">
              Guardar rol
            </v-btn>
            <v-chip v-if="miembro.guardado" color="green" class="ml-2" small>
              ✓ Guardado
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo crear o editar miembro -->
    <v-dialog v-model="dialogoMiembro" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{
            editando ? "Editar miembro" : "Nuevo miembro"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarMiembro">
            <v-text-field v-model="miembroForm.nombre" label="Nombre *" />
            <v-text-field v-model="miembroForm.apellido" label="Apellido *" />
            <v-text-field
              v-model="miembroForm.correo"
              label="Correo electrónico *"
            />
            <v-text-field v-model="miembroForm.telefono" label="Teléfono" />
            <v-text-field
              v-model="miembroForm.contrasena"
              label="Contraseña *"
              type="password"
            />
            <v-select
              v-model="miembroForm.id_rol"
              :items="roles"
              item-title="nombre"
              item-value="id_rol"
              label="Rol asignado *"
            />
            <v-btn type="submit" color="success" class="mt-4" block>
              <v-icon start>mdi-content-save</v-icon> Guardar
            </v-btn>
            <v-btn block class="mt-2" @click="dialogoMiembro = false"
              >Cancelar</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Confirmación de eliminación -->
    <v-dialog v-model="dialogoEliminar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar miembro?</v-card-title>
        <v-card-text>
          Esto eliminará al miembro
          <strong
            >{{ miembroAEliminar?.nombre }}
            {{ miembroAEliminar?.apellido }}</strong
          >
          de forma permanente.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogoEliminar = false">Cancelar</v-btn>
          <v-btn color="red" @click="eliminarMiembro">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; // 👈 Importa el router
const miembros = ref([]);
const roles = ref([]);

const dialogoMiembro = ref(false);
const dialogoEliminar = ref(false);
const editando = ref(false);
const router = useRouter(); // 👈 Define el router
const miembroForm = ref({
  id_miembro: null,
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  contrasena: "",
  id_rol: null,
  estado: true,
});

const miembroAEliminar = ref(null);

const cargarMiembros = async () => {
  try {
    const res = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/miembros"
    );
    miembros.value = res.data.map((m) => ({ ...m, guardado: false }));
  } catch (err) {
    console.error("Error al cargar miembros:", err);
  }
};

const cargarRoles = async () => {
  try {
    const res = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/roles"
    );
    roles.value = res.data;
  } catch (err) {
    console.error("Error al cargar roles:", err);
  }
};

const actualizarRol = async (miembro) => {
  try {
    await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${miembro.id_miembro}`,
      {
        id_rol: miembro.id_rol,
      }
    );
    miembro.guardado = true;
    setTimeout(() => {
      miembro.guardado = false;
    }, 2000);
  } catch (error) {
    alert("Error al actualizar el rol");
    console.error(error);
  }
};

const abrirDialogoMiembro = () => {
  editando.value = false;
  miembroForm.value = {
    id_miembro: null,
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    contrasena: "",
    id_rol: null,
    estado: true,
  };
  dialogoMiembro.value = true;
};

const abrirDialogoEditar = (miembro) => {
  editando.value = true;
  miembroForm.value = { ...miembro };
  dialogoMiembro.value = true;
};

const guardarMiembro = async () => {
  try {
    if (editando.value) {
      await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${miembroForm.value.id_miembro}`,
        miembroForm.value
      );
    } else {
      await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/miembros",
        miembroForm.value
      );
    }
    dialogoMiembro.value = false;
    await cargarMiembros();
  } catch (err) {
    alert("Error al guardar miembro");
    console.error(err);
  }
};

const confirmarEliminacion = (miembro) => {
  miembroAEliminar.value = miembro;
  dialogoEliminar.value = true;
};

const eliminarMiembro = async () => {
  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/miembros/${miembroAEliminar.value.id_miembro}`
    );
    dialogoEliminar.value = false;
    await cargarMiembros();
  } catch (err) {
    alert("Error al eliminar miembro");
    console.error(err);
  }
};

onMounted(() => {
  cargarRoles();
  cargarMiembros();
});
</script>
