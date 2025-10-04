<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <!-- Logo -->
    <img
      :src="logo"
      alt="Logo"
      style="max-width: 120px; margin-bottom: 1rem; margin-top: -1.5rem"
    />

    <h2 class="font-weight-bold mb-6 text-center" style="color: #d81b60">
      Isabella’s Cakes
    </h2>

    <v-card elevation="0" max-width="350" class="w-100">
      <v-text-field
        v-model="correo"
        label="Correo electrónico"
        prepend-inner-icon="mdi-at"
        type="email"
        hide-details
        density="compact"
        class="mb-2"
        color="pink"
      />
      <v-text-field
        v-model="contrasena"
        label="Contraseña"
        prepend-inner-icon="mdi-lock"
        type="password"
        hide-details
        density="compact"
        class="mb-2"
        color="pink"
      />
      <v-switch
        v-model="recordar"
        label="Recordar mi correo"
        color="pink"
        class="mb-4"
      />

      <v-btn
        color="pink darken-1"
        block
        @click="login"
        prepend-icon="mdi-login"
        class="mb-3 white--text"
      >
        Iniciar sesión
      </v-btn>

      <v-btn variant="outlined" color="pink" block @click="registrarse">
        ¿No tienes una cuenta? Regístrate aquí
      </v-btn>

      <div class="text-center mt-4">
        <small class="text-grey">¿Olvidaste tu contraseña?</small>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const logo = new URL("@/assets/logo-isabellas.png", import.meta.url).href;
const correo = ref("");
const contrasena = ref("");
const recordar = ref(false);
const router = useRouter();

onMounted(() => {
  const guardado = localStorage.getItem("correo");
  if (guardado) {
    correo.value = guardado;
    recordar.value = true;
  }
});

const login = async () => {
  try {
    const res = await axios.post(
  "https://api-isabella-s-cakes.onrender.com/api/miembros/login",
      {
        correo: correo.value,
        contrasena: contrasena.value,
      }
    );

    const { miembro, token } = res.data;

    if (recordar.value) {
      localStorage.setItem("correo", correo.value);
    } else {
      localStorage.removeItem("correo");
    }

    // Guardar datos de sesión
    localStorage.setItem("token", token); // ✅ importante para mantener sesión
    localStorage.setItem("usuario", JSON.stringify(miembro));
    localStorage.setItem("id_miembro", miembro.id_miembro);
    localStorage.setItem("rol", miembro.rol.nombre);

    // Redirección por rol
    const rolNombre = miembro.rol.nombre;
    if (rolNombre === "mesero") router.push("/pedidos");
    else if (rolNombre === "cocina") router.push("/cocina");
    else if (rolNombre === "cajero") router.push("/pagos");
    else router.push("/ajustes"); // admin
  } catch (error) {
    alert("Correo o contraseña incorrectos");
    console.error("Login error:", error.response?.data || error);
  }
};

const registrarse = () => {
  router.push("/registro");
};
</script>

<style scoped>
.v-container {
  padding-top: 40px;
}
</style>
