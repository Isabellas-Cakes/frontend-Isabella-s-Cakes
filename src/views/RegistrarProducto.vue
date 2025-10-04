<template>
  <div class="rp-container">
    <header class="rp-header">
      <button class="rp-back" @click="volver">
        ←
      </button>
      <h2>Crear artículo</h2>
    </header>
    <div class="rp-photo">
      <button class="rp-photo-btn" title="Agregar foto">
        <span class="rp-photo-icon">📷</span>
      </button>
    </div>
    <form class="rp-form" @submit.prevent="registrarProducto">
      <div class="rp-field">
        <span class="rp-icon">✏️</span>
        <input v-model.trim="producto.nombre" class="rp-input" placeholder="Nombre*" required />
      </div>
      <!-- Elimina el campo de descripción -->
      <div class="rp-field">
        <span class="rp-icon">📍</span>
        <select v-model="producto.ubicacion" class="rp-input" required>
          <option disabled value="">Ubicación</option>
          <option value="Cocina">Cocina</option>
          <option value="Barra">Barra</option>
        </select>
      </div>
      <div class="rp-field">
        <span class="rp-icon">💳</span>
        <span class="rp-label">Costo</span>
        <input v-model.number="producto.costo" type="number" class="rp-input" placeholder="Costo" min="0" step="0.01" />
      </div>
      <div class="rp-field">
        <span class="rp-icon">%</span>
        <span class="rp-label">Porcentaje de ganancia</span>
        <input v-model.number="producto.ganancia" type="number" class="rp-input" placeholder="Porcentaje de ganancia (%)" min="0" step="0.01" />
      </div>
      <div class="rp-switch-row">
        <label class="rp-switch-label">
          <input type="checkbox" v-model="producto.disponible" class="rp-switch" />
          <span class="rp-switch-custom"></span>
          Disponible
        </label>
      </div>
      <div class="rp-info">
        Podrás agregar los ingredientes de este artículo una vez lo hayas guardado.
      </div>
      <button class="rp-btn" type="submit" :disabled="enviando">
        <span v-if="!enviando">💾 GUARDAR</span>
        <span v-else class="rp-spinner"></span>
      </button>
      <p v-if="error" class="rp-error">{{ error }}</p>
      <p v-if="exito" class="rp-success">{{ exito }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
const router = useRouter()

const API = 'https://api-isabella-s-cakes.onrender.com/api/inventario-cosina'

const producto = ref({
  nombre: '',
  ubicacion: '',
  costo: 0,
  ganancia: 0,
  disponible: true
})
const enviando = ref(false)
const error = ref('')
const exito = ref('')

const registrarProducto = async () => {
  error.value = ''
  exito.value = ''
  enviando.value = true
  try {
    // Guarda el nombre en el campo descripcion
    const payload = {
      descripcion: producto.value.nombre,
      ubicacion: producto.value.ubicacion,
      costo: producto.value.costo,
      ganancia: producto.value.ganancia,
      disponible: producto.value.disponible,
      precio: producto.value.costo * (1 + producto.value.ganancia / 100)
    }
    await axios.post(API, payload)
    exito.value = 'Producto registrado correctamente'
    producto.value = { nombre: '', ubicacion: '', costo: 0, ganancia: 0, disponible: true }
  } catch (e) {
    error.value = 'No se pudo registrar el producto'
  } finally {
    enviando.value = false
  }
}

const volver = () => {
  router.back()
}
</script>

<style scoped>
.rp-container {
  max-width: 600px;
  margin: 24px auto;
  padding: 16px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}
.rp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.rp-back {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 8px;
}
.rp-photo {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}
.rp-photo-btn {
  background: #f7f8fa;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0,0,0,.08);
}
.rp-photo-icon {
  font-size: 2rem;
}
.rp-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rp-field {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 8px 14px;
}
.rp-icon {
  font-size: 1.2rem;
  color: #888;
}
.rp-input {
  border: none;
  background: transparent;
  font-size: 1rem;
  flex: 1;
  outline: none;
  padding: 8px 0;
}
.rp-input:focus {
  background: #eef1f7;
}
.rp-switch-row {
  display: flex;
  align-items: center;
  margin: 8px 0;
}
.rp-switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  cursor: pointer;
}
.rp-switch {
  display: none;
}
.rp-switch-custom {
  width: 36px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  position: relative;
  transition: background .2s;
}
.rp-switch-label input:checked + .rp-switch-custom {
  background: #7ed957;
}
.rp-switch-custom::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: left .2s;
}
.rp-switch-label input:checked + .rp-switch-custom::after {
  left: 18px;
}
.rp-info {
  color: #888;
  font-size: .95rem;
  margin-bottom: 8px;
}
.rp-btn {
  width: 100%;
  background: #7ed957;
  color: #222;
  border: none;
  border-radius: 6px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .2s;
}
.rp-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}
.rp-error {
  color: #d33;
  font-size: .95rem;
  margin-top: 4px;
}
.rp-success {
  color: #0c8a0c;
  font-size: .95rem;
  margin-top: 4px;
}
.rp-spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  display: inline-block;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg) } }
.rp-label {
  font-size: 1rem;
  color: #555;
  margin-right: 8px;
  font-weight: 500;
}
</style>

