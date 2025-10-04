module.exports = {
  // Configuración específica para el cliente WebSocket
  devServer: {
    // Configuración del cliente WebSocket
    client: {
      // URL del WebSocket
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 8081,
        protocol: 'ws'
      },
      // Configuración de logging
      logging: 'info',
      // Configuración de overlay de errores
      overlay: {
        errors: true,
        warnings: false
      },
      // Configuración de progreso
      progress: true,
      // Configuración de reconexión
      reconnect: 5
    },
    // Configuración adicional del servidor
    compress: true,
    hot: true,
    liveReload: true,
    open: false,
    // Configuración de headers CORS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  }
};