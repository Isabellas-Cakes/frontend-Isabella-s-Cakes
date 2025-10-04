<template>
  <v-container>
    <!-- Encabezado con botón de regresar y título -->
    <v-row align="center">
      <v-col cols="auto">
        <v-btn icon @click="router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h2 class="text-h5 font-weight-bold">Roles</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn icon color="success" @click="abrirDialogoCrear">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de roles -->
    <v-row>
      <v-col cols="12">
        <v-alert v-if="roles.length === 0" type="info" border="start" colored-border>
          No se han registrado roles aún.
        </v-alert>

        <v-list v-else>
          <v-list-item
            v-for="rol in roles"
            :key="rol.id_rol"
            class="rounded-lg my-3 elevation-1"
            style="border: 1px solid #eee"
          >
            <template #prepend>
              <v-btn icon color="red" class="ma-2" @click.stop="confirmarEliminacion(rol)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>

            <v-list-item-content @click="abrirDialogoEditar(rol)">
              <v-list-item-title class="font-weight-bold">
                {{ rol.nombre }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ rol.descripcion || 'Sin descripción' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <!-- Diálogo crear/editar rol -->
    <v-dialog v-model="dialogoActivo" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ editando ? 'Editar rol' : 'Nuevo rol' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarRol">
            <v-text-field
              v-model="rolForm.nombre"
              label="Nombre del rol*"
              prepend-inner-icon="mdi-account-key"
              required
            />
            <v-textarea
              v-model="rolForm.descripcion"
              label="Descripción"
              prepend-inner-icon="mdi-text"
              auto-grow
            />
            <v-btn
              type="submit"
              color="light-green darken-2"
              block
              class="mt-4"
              dark
            >
              <v-icon start>mdi-content-save</v-icon>
              {{ editando ? 'Actualizar' : 'Guardar' }}
            </v-btn>
            <v-btn
              color="grey"
              block
              class="mt-2"
              @click="cerrarDialogo"
            >
              <v-icon start>mdi-cancel</v-icon>
              Cancelar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Confirmación eliminación -->
    <v-dialog v-model="dialogoEliminar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar rol?</v-card-title>
        <v-card-text>
          Esto eliminará el rol
          <strong>"{{ rolAEliminar?.nombre }}"</strong> permanentemente.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialogoEliminar = false">Cancelar</v-btn>
          <v-btn color="red" @click="eliminarRol">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const roles = ref([])
const dialogoActivo = ref(false)
const dialogoEliminar = ref(false)
const editando = ref(false)

const rolForm = ref({
  id_rol: null,
  nombre: '',
  descripcion: ''
})

const rolAEliminar = ref(null)

const cargarRoles = async () => {
  try {
  const res = await axios.get('https://api-isabella-s-cakes.onrender.com/api/roles')
    roles.value = res.data
  } catch (err) {
    console.error('Error al cargar roles:', err)
  }
}

const abrirDialogoCrear = () => {
  editando.value = false
  rolForm.value = { id_rol: null, nombre: '', descripcion: '' }
  dialogoActivo.value = true
}

const abrirDialogoEditar = (rol) => {
  editando.value = true
  rolForm.value = { ...rol }
  dialogoActivo.value = true
}

const cerrarDialogo = () => {
  dialogoActivo.value = false
}

const guardarRol = async () => {
  try {
    if (editando.value) {
  await axios.put(`https://api-isabella-s-cakes.onrender.com/api/roles/${rolForm.value.id_rol}`, rolForm.value)
    } else {
  await axios.post('https://api-isabella-s-cakes.onrender.com/api/roles', rolForm.value)
    }
    await cargarRoles()
    cerrarDialogo()
  } catch (err) {
    console.error('Error al guardar rol:', err)
  }
}

const confirmarEliminacion = (rol) => {
  rolAEliminar.value = rol
  dialogoEliminar.value = true
}

const eliminarRol = async () => {
  try {
  await axios.delete(`https://api-isabella-s-cakes.onrender.com/api/roles/${rolAEliminar.value.id_rol}`)
    dialogoEliminar.value = false
    await cargarRoles()
  } catch (err) {
    console.error('Error al eliminar rol:', err)
  }
}

onMounted(() => {
  cargarRoles()
})
</script>
