<template>
  <div class="page">
    <header class="header">
      <h2>Consulta de Solicitudes</h2>
      <div class="filters">
        <select v-model="filtroUbicacion" class="input">
          <option value="">Todas las ubicaciones</option>
          <option value="Cocina">Cocina</option>
          <option value="Barra">Barra</option>
        </select>
        <input
          v-model.trim="busqueda"
          class="input"
          placeholder="Buscar por descripción…"
        />
        <button class="btn" @click="cargar">
          <span class="material-symbols-outlined">refresh</span>
          <span class="btn-text">Recargar</span>
        </button>
      </div>
    </header>

    <section class="card">
      <div class="table-wrapper">
        <div class="table">
          <div class="thead">
            <div>Descripción</div>
            <div class="th--sm">Ubicación</div>
            <div class="th--sm">Estado</div>
            <div class="th--sm">Precio</div>
            <div class="th--sm right">Acciones</div>
          </div>

          <div v-if="cargando" class="empty">
            <span class="spinner"></span> Cargando…
          </div>

          <div v-else-if="filtrados.length === 0" class="empty">
            No hay solicitudes con los filtros actuales.
          </div>

          <div
            v-else
            v-for="it in filtrados"
            :key="it.id_item ?? it.id"
            class="trow"
          >
            <!-- Descripción -->
            <div class="td">
              <input
                v-model.trim="buffer[itKey(it)].descripcion"
                class="input input--inline"
                :placeholder="it.descripcion"
              />
            </div>

            <!-- Ubicación (solo lectura) -->
            <div class="td th--sm">
              <span class="tag" :class="it.ubicacion === 'Barra' ? 'tag--bar' : 'tag--coc'">
                {{ it.ubicacion }}
              </span>
            </div>

            <!-- Estado -->
            <div class="td th--sm">
              <select
                v-model="buffer[itKey(it)].estado"
                class="input input--inline"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>

            <!-- Precio -->
            <div class="td th--sm">
              <input
                v-model.number="buffer[itKey(it)].precio"
                class="input input--inline right"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <!-- Acciones -->
            <div class="td th--sm right actions">
              <button
                class="btn btn--ghost"
                :disabled="guardando[itKey(it)]"
                @click="restaurar(it)"
                title="Restaurar cambios"
              >
                <span class="material-symbols-outlined">undo</span>
              </button>
              <button
                class="btn"
                :disabled="guardando[itKey(it)] || !puedeGuardar(buffer[itKey(it)])"
                @click="guardar(it)"
                title="Guardar cambios"
              >
                <span v-if="!guardando[itKey(it)]" class="material-symbols-outlined">save</span>
                <span v-else class="spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Endpoints existentes:
// GET /api/inventario-cosina
// PUT /api/inventario-cosina/:id  :contentReference[oaicite:3]{index=3}
const API = 'https://api-isabella-s-cakes.onrender.com/api/inventario-cosina' // montado en server.js :contentReference[oaicite:4]{index=4}

const items = ref([])
const buffer = ref({})          // estados editables por fila
const guardando = ref({})       // loading por fila
const cargando = ref(true)
const busqueda = ref('')
const filtroUbicacion = ref('')

// helpers
const itKey = (it) => String(it.id_item ?? it.id)

const snapshot = (it) => ({
  descripcion: it.descripcion ?? '',
  estado: it.estado ?? 'Pendiente',
  precio: Number(it.precio ?? 0)
})

const cargar = async () => {
  cargando.value = true
  try {
    const { data } = await axios.get(API)
    items.value = Array.isArray(data) ? data : []
    // Inicializa buffers por item
    buffer.value = {}
    guardando.value = {}
    for (const it of items.value) {
      buffer.value[itKey(it)] = snapshot(it)
      guardando.value[itKey(it)] = false
    }
  } catch (e) {
    console.error('Error al cargar solicitudes', e)
  } finally {
    cargando.value = false
  }
}

const restaurar = (it) => {
  buffer.value[itKey(it)] = snapshot(it)
}

const puedeGuardar = (row) => {
  // Reglas básicas del modelo: estado ∈ {Pendiente, Entregado}, precio ≥ 0  :contentReference[oaicite:5]{index=5}
  if (!row.descripcion?.trim()) return false
  if (!['Pendiente', 'Entregado'].includes(row.estado)) return false
  if (Number.isNaN(Number(row.precio)) || Number(row.precio) < 0) return false
  return true
}

const guardar = async (it) => {
  const key = itKey(it)
  const row = buffer.value[key]
  if (!puedeGuardar(row)) return

  guardando.value[key] = true
  try {
    // Solo enviamos los campos editables: descripcion, estado, precio
    const body = {
      descripcion: row.descripcion,
      estado: row.estado,
      precio: Number(row.precio)
    }
    const { data } = await axios.put(`${API}/${it.id_item ?? it.id}`, body)
    // Sincroniza copia base
    const idx = items.value.findIndex(x => itKey(x) === key)
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...data }
    buffer.value[key] = snapshot(items.value[idx])
  } catch (e) {
    console.error('No se pudo guardar', e)
    // no lanzamos, solo dejamos registro
  } finally {
    guardando.value[key] = false
  }
}

const filtrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return items.value
    .filter(it => !filtroUbicacion.value || it.ubicacion === filtroUbicacion.value)
    .filter(it => !q || (it.descripcion ?? '').toLowerCase().includes(q))
    // Orden: Pendientes arriba
    .sort((a, b) => (a.estado === b.estado ? 0 : a.estado === 'Pendiente' ? -1 : 1))
})

onMounted(cargar)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Material+Symbols+Outlined');

:root { color-scheme: dark light; }
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 8px 32px 8px;
  font-family: 'Roboto', Arial, sans-serif;
  background: #f7f8fa;
}
.header {
  position: sticky;
  top: 0;
  background: #f7f8fa;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0 8px 0;
}
h2 {
  margin: 0;
  font-size: clamp(1.3rem, 4vw, 2rem);
  font-weight: 700;
  color: #222;
  letter-spacing: 0.02em;
}
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
  width: 180px;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #7c3aed;
  outline: none;
}
.input--inline {
  padding: 7px 10px;
  width: 100%;
  font-size: 0.98rem;
}
.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(90deg, #7c3aed 0%, #6366f1 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.btn--ghost {
  background: transparent;
  color: #7c3aed;
  border: 1px solid #7c3aed;
  box-shadow: none;
}
.btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}
.btn-text {
  display: none;
}
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-size: 1.3em;
  vertical-align: middle;
}
.card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(124,58,237,0.07), 0 1.5px 6px rgba(0,0,0,0.04);
  padding: 18px 12px;
  margin-top: 16px;
  overflow-x: auto;
}
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}
.table {
  min-width: 600px;
  width: 100%;
}
.thead, .trow {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 1.2fr;
  gap: 10px;
  align-items: center;
}
.thead {
  font-weight: 700;
  padding: 10px 0;
  border-bottom: 2px solid #ececec;
  background: #f3f4f6;
  color: #7c3aed;
  font-size: 1.05rem;
}
.trow {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  transition: background 0.15s;
}
.trow:hover {
  background: #f3f4f6;
}
.th--sm { text-align: left; }
.right { text-align: right; }
.td { min-width: 0; }

.tag {
  border-radius: 999px;
  padding: 5px 14px;
  border: 1px solid currentColor;
  font-size: .95rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  background: #f3f4f6;
}
.tag--bar { color: #2563eb; background: #e0e7ff; }
.tag--coc { color: #059669; background: #d1fae5; }

.empty {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: #888;
  font-size: 1.1rem;
}
.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2.5px solid #7c3aed;
  border-right-color: transparent;
  display: inline-block;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 700px) {
  .header {
    padding: 16px 0 4px 0;
  }
  .filters {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  .input {
    width: 100%;
    min-width: 0;
  }
  .card {
    padding: 10px 4px;
    border-radius: 12px;
  }
  .table {
    min-width: 400px;
    font-size: 0.97rem;
  }
  .thead, .trow {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
    gap: 6px;
  }
  .btn-text {
    display: inline;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 0 2px 16px 2px;
  }
  .card {
    padding: 6px 2px;
  }
  .thead, .trow {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    font-size: 0.93rem;
  }
  h2 {
    font-size: 1.1rem;
  }
}
</style>
