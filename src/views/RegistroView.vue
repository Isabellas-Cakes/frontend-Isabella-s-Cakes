<template>
  <v-container class="pa-4">
    <v-btn icon @click="router.back()" class="mb-4">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <h2 class="text-h5 font-weight-bold mb-4">Crea una cuenta</h2>

    <v-text-field v-model="form.nombre" label="Nombre *" prepend-inner-icon="mdi-pencil" />
    <v-text-field v-model="form.apellido" label="Apellido" prepend-inner-icon="mdi-pencil" />
    <v-text-field v-model="form.correo" label="Correo electrónico *" prepend-inner-icon="mdi-at" />
    <v-text-field v-model="form.telefono" label="Teléfono" prepend-inner-icon="mdi-phone" />
    <v-text-field v-model="form.contrasena" label="Contraseña *" prepend-inner-icon="mdi-lock" type="password" />

    <v-switch
      v-model="acepta"
      color="black"
      label="Acepto los Términos y condiciones"
      class="my-4"
    />

    <v-btn
      :disabled="!formValido"
      block
      color="black"
      prepend-icon="mdi-account-plus"
      @click="registrar"
    >
      Crea una cuenta
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const acepta = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  contrasena: ''
})

const formValido = computed(() =>
  form.value.nombre &&
  form.value.apellido &&
  form.value.correo &&
  form.value.contrasena &&
  acepta.value
)

const registrar = async () => {
  try {
  /* await axios.post('https://api-isabella-s-cakes.onrender.com/api/miembros', {
      ...form.value,
      estado: true,
      id_rol: 2 // O el ID de rol por defecto para nuevos usuarios
    })*/

  await axios.post('https://api-isabella-s-cakes.onrender.com/api/miembros', {
  ...form.value,
  estado: true
})

    alert('Cuenta creada con éxito')
    router.push('/')
  } catch (err) {
    alert('Error al crear cuenta: ' + err.response?.data?.message || err.message)
  }
}
</script>
