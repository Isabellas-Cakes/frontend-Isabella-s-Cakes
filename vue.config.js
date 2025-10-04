const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  },

  devServer: {
    host: 'localhost',
    port: 8081,
    hot: true,
    liveReload: true,
    compress: true,
    open: false,
    client: {
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: 8081,
        protocol: 'ws'
      },
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true,
      reconnect: 5
    },
    // Configuración para evitar problemas de CORS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    // Configuración adicional para estabilidad
    setupExitSignals: true,
    allowedHosts: 'all'
  }
})
