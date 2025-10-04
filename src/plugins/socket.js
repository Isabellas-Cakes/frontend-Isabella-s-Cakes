// filepath: src/plugins/socket.js
import { io } from "socket.io-client";
//export const socket = io("http://localhost:8080");

// ⚡ Configuración optimizada para producción
export const socket = io("https://api-isabella-s-cakes.onrender.com", {
  transports: ["websocket"],    // Usa WebSocket directo (mejor rendimiento)
  autoConnect: true,            // Conexión automática al importar
  reconnection: true,           // Intenta reconectarse si se cae
  reconnectionAttempts: 5,      // Hasta 5 reintentos
  reconnectionDelay: 2000,      // 2s entre intentos
  timeout: 10000                // Timeout de 10s para conexión inicial
});

// Puedes escuchar eventos de conexión/desconexión globalmente
socket.on("connect", () => console.log("✅ Socket conectado:", socket.id));
socket.on("disconnect", () => console.warn("⚠️ Socket desconectado"));