<template>
  <v-container>
    <!-- Encabezado con botón regresar y título -->
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Mesas</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn icon color="success" @click="abrirDialogoCrear">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de mesas -->
    <v-row>
      <v-col cols="12">
        <v-alert
          v-if="mesas.length === 0"
          type="info"
          border="start"
          colored-border
        >
          No se han registrado mesas aún.
        </v-alert>

        <v-list v-else>
          <v-list-item
            v-for="mesa in mesas"
            :key="mesa.id_mesa"
            class="rounded-lg my-3 elevation-1"
            style="border: 1px solid #eee"
          >
            <template #prepend>
              <v-btn
                icon
                color="red"
                class="ma-2"
                @click.stop="confirmarEliminacion(mesa)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>

            <v-list-item-content @click="abrirDialogoEditar(mesa)">
              <v-list-item-title class="font-weight-bold">
                Mesa {{ mesa.numero }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Estado: {{ mesa.estado }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <!-- Diálogo crear/editar mesa -->
    <v-dialog v-model="dialogoActivo" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{
            editando ? "Editar mesa" : "Nueva mesa"
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarMesa">
            <v-text-field
              v-model="mesaForm.numero"
              label="Número de mesa*"
              prepend-inner-icon="mdi-numeric"
              type="number"
              required
            />
            <v-btn
              type="submit"
              color="light-green darken-2"
              block
              class="mt-4"
              dark
            >
              <v-icon start>mdi-content-save</v-icon>
              {{ editando ? "Actualizar" : "Guardar" }}
            </v-btn>
            <v-btn color="grey" block class="mt-2" @click="cerrarDialogo">
              <v-icon start>mdi-cancel</v-icon>
              Cancelar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo confirmación eliminación -->
    <v-dialog v-model="dialogoEliminar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar mesa?</v-card-title>
        <v-card-text>
          Esto eliminará la mesa
          <strong>"Mesa {{ mesaAEliminar?.numero }}"</strong> permanentemente.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogoEliminar = false">Cancelar</v-btn>
          <v-btn color="red" @click="eliminarMesa">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const mesas = ref([]);
const dialogoActivo = ref(false);
const dialogoEliminar = ref(false);
const editando = ref(false);

const mesaForm = ref({
  id_mesa: null,
  numero: "",
});

const mesaAEliminar = ref(null);

const cargarMesas = async () => {
  try {
    const res = await axios.get(
  "https://api-isabella-s-cakes.onrender.com/api/mesas"
    );
    mesas.value = res.data;
  } catch (err) {
    console.error("Error al cargar mesas:", err);
  }
};

const abrirDialogoCrear = () => {
  editando.value = false;
  mesaForm.value = { id_mesa: null, numero: "" };
  dialogoActivo.value = true;
};

const abrirDialogoEditar = (mesa) => {
  editando.value = true;
  mesaForm.value = { ...mesa };
  dialogoActivo.value = true;
};

const cerrarDialogo = () => {
  dialogoActivo.value = false;
};

const guardarMesa = async () => {
  try {
    if (editando.value) {
      await axios.put(
  `https://api-isabella-s-cakes.onrender.com/api/mesas/${mesaForm.value.id_mesa}`,
        mesaForm.value
      );
    } else {
      await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/mesas",
        mesaForm.value
      );
    }
    await cargarMesas();
    cerrarDialogo();
  } catch (err) {
    console.error("Error al guardar mesa:", err);
  }
};

const confirmarEliminacion = (mesa) => {
  mesaAEliminar.value = mesa;
  dialogoEliminar.value = true;
};

const eliminarMesa = async () => {
  try {
    await axios.delete(
  `https://api-isabella-s-cakes.onrender.com/api/mesas/${mesaAEliminar.value.id_mesa}`
    );
    await cargarMesas();
  } catch (err) {
    console.error("Error al eliminar mesa:", err);
  } finally {
    dialogoEliminar.value = false;
  }
};

onMounted(() => {
  cargarMesas();
});
</script>
