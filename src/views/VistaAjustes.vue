<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <v-container class="py-4">
    <!-- Logo y nombre del restaurante -->
    <v-row class="text-center mb-4 d-flex flex-column align-center">
      <v-avatar size="100" class="mb-2">
        <v-img :src="logoRestaurante" alt="Logo restaurante" cover />
      </v-avatar>
      <h2 class="text-h5 font-weight-bold">{{ nombreRestaurante }}</h2>
    </v-row>

    <!-- Info del usuario -->
    <v-row class="text-center mb-4 d-flex flex-column align-center">
      <div class="text-h6">{{ usuario?.nombre }} {{ usuario?.apellido }}</div>
      <div class="text-subtitle-2">{{ usuario?.rol?.nombre || 'Cargando rol...' }}</div>
    </v-row>

    <!-- Opciones -->
    <v-row dense>
     <!-- Opciones  <v-col cols="6" v-for="(item, i) in opciones" :key="i" class="mb-2">
        <v-btn
          block
          color="teal"
          class="py-5"
          variant="elevated"
          @click="navegar(item.ruta)"
        >
          <v-icon size="26" class="mb-1">{{ item.icono }}</v-icon>
          <div class="text-caption">{{ item.texto }}</div>
        </v-btn>
      </v-col>--> 

      <v-col cols="6" v-for="(item, i) in opciones" :key="i" class="mb-2">
  <v-btn
    block
    color="pink"
    class="py-5"
    variant="elevated"
    @click="navegar(item.ruta)"
  >
    <v-icon size="26" class="mb-1">{{ item.icono }}</v-icon>
    <div class="text-caption">{{ item.texto }}</div>
  </v-btn>
</v-col>

    </v-row>

    <!-- Cerrar sesión -->
    <v-btn
      class="mt-6 mb-2"
      color="black"
      variant="outlined"
      block
      @click="cerrarSesion"
    >
      <v-icon left>mdi-logout</v-icon>
      Cerrar sesión
    </v-btn>

    <!-- Footer -->
    <div class="text-center text-caption mt-4">
      Si tienes dudas, problemas o sugerencias escríbenos a<br />
      <strong>Evzoon1996.lo@gmail.com</strong>
    </div>
    <div class="text-center text-caption mt-1 text-grey">
      Términos de uso y política de privacidad
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Nombre y logo del restaurante
const nombreRestaurante = 'Isabella’s Cakes'
const logoRestaurante = new URL('@/assets/logo-isabellas.png', import.meta.url).href

// Usuario desde API
const usuario = ref(null)

const cargarUsuario = async () => {
  const id = localStorage.getItem('id_miembro')

  if (!id) {
    console.warn('No se encontró ID de miembro en localStorage')
    return
  }

  try {
  const res = await axios.get(`https://api-isabella-s-cakes.onrender.com/api/miembros/${id}`)
    usuario.value = res.data
  } catch (error) {
    console.error('Error al cargar usuario:', error)
  }
}

const opciones = [
  { texto: 'Editar perfil', icono: 'mdi-account', ruta: '/editar-perfil' },
  { texto: 'Miembros', icono: 'mdi-account-multiple', ruta: '/miembros' },
    { texto: 'Asignar roles', icono: 'mdi-shield-account', ruta: '/roles' }, // NUEVO
  { texto: 'Mesas', icono: 'mdi-table-chair', ruta: '/mesas' },
{ texto: 'Historial ventas', icono: 'mdi-chart-bar', ruta: '/historial-ventas' } ,// ✅ nuevo
  { texto: 'Tiempos de pedido', icono: 'mdi-timer-outline', ruta: '/historial-tiempos' }, // 🆕 nuevo botón
  { texto: 'Solicitudes inventario', icono: 'mdi-clipboard-list', ruta: '/gestion-solicitudes' } // 📋 nuevo

]


function navegar(ruta) {
  router.push(ruta)
}

/*function cerrarSesion() {
  localStorage.removeItem('id_miembro')
  router.push('/login')
}
*/
function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  localStorage.removeItem('id_miembro')
  localStorage.removeItem('rol')
  localStorage.removeItem('correo') // opcional, si no quieres recordar el correo

  router.push('/') // redirige al login
}


  
onMounted(() => {
  cargarUsuario()
})
</script>

<style scoped>
.v-btn {
  flex-direction: column;
  min-height: 80px;
}
</style>
