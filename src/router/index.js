import { createRouter, createWebHistory } from 'vue-router'
import CategoriasView from '../views/CategoriasView.vue'
import CrearCategoriaView from '../views/CrearCategoriaView.vue'
import RegistrarProducto from '../views/RegistrarProducto.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/pedidos',
    name: 'PedidosActivos',
    component: () => import('@/views/PedidosActivos.vue')
  },
  {
    path: '/nuevo-pedido/:mesaId',
    name: 'NuevoPedido',
    component: () => import('@/views/NuevoPedido.vue')
  },
  {
    path: '/categorias',
    name: 'categorias',
    component: CategoriasView
  },
  {
    path: '/categorias/crear',
    name: 'crearcategoria',
    component: CrearCategoriaView
  },
  {
    path: '/crear-categoria',
    name: 'CrearCategoria',
    component: CrearCategoriaView
  },
  {
    path: '/categorias/:id/articulos',
    name: 'ArticulosCategoria',
    component: () => import('../views/ArticulosCategoria.vue')
  },
  {
    path: '/categorias/:id/articulos/crear',
    name: 'CrearArticulo',
    component: () => import('../views/CrearArticulo.vue')
  },
  {
    path: '/categorias/:id/editar',
    name: 'EditarCategoria',
    component: () => import('../views/EditarCategoria.vue')
  },
  {
    path: '/articulos/:id/editar',
    name: 'EditarArticulo',
    component: () => import('../views/EditarArticulo.vue')
  },
  {
    path: '/cocina',
    name: 'VistaCocina',
    component: () => import('@/views/VistaCocina.vue')
  },
  {
    path: '/pagos',
    name: 'Pagos',
    component: () => import('@/views/PagosPedidos.vue')
  },
  {
    path: '/ajustes',
    name: 'VistaAjustes',
    component: () => import('@/views/VistaAjustes.vue')
  },
  {
    path: '/editar-perfil',
    name: 'EditarPerfil',
    component: () => import('@/views/EditarPerfil.vue')
  },
  {
    path: '/roles-view',
    name: 'RolesView',
    component: () => import('@/views/RolesView.vue')
  },
  {
    path: '/mesas',
    name: 'Mesas',
    component: () => import('@/views/MesasView.vue')
  },
  {
    path: '/historial-ventas',
    name: 'HistorialVentas',
    component: () => import('@/views/HistorialVentas.vue')
  },
  {
    path: '/historial-tiempos',
    name: 'HistorialTiempos',
    component: () => import('@/views/HistorialTiempos.vue')
  },
  {
    path: '/miembros',
    name: 'Miembros',
    component: () => import('@/views/MiembrosView.vue')
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('@/views/RegistroView.vue')
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('@/views/ConfiRoles.vue')
  },
  {
  path: '/pedidos-fuera',
  name: 'PedidosFuera',
  component: () => import('@/views/PedidosFuera.vue')
},

{
  path: '/solicitar-inventario-cocina',
  name: 'SolicitarInventarioCocina',
  component: () => import('@/views/SolicitarInventarioCocina.vue')
},
{
  path: '/inventario-cocina',
   alias: ['/inventariocosina'], // opcional
  name: 'InventarioCocina',
  component: () => import('@/views/InventarioCocina.vue')
},
  {
    path: '/consultas-solicitudes',
    name: 'ConsultaSolisitudes', // ⬅️ debe coincidir con el name que usamos arriba
    component: () => import('@/views/ConsultaSolisitudes.vue'),
  },
  {
    path: '/registrar-producto',
    name: 'RegistrarProducto',
    component: RegistrarProducto
  },
  {
    path: '/editar-producto/:id',
    name: 'EditarProducto',
    component: () => import('@/views/EditarProducto.vue')
  },
  {
    path: '/gestion-productos',
    name: 'GestionProductos',
    component: () => import('@/views/GestionProductos.vue')
  },
  {
    path: '/crear-articulo-externos',
    name: 'CrearArticuloExternos',
    component: () => import('@/views/CrearArticuloexternos.vue')
  },
  {
    path: '/categorias-externas',
    name: 'CategoriasExternas',
    component: () => import('@/views/CategoriasExternasView.vue')
  },
  {
    path: '/categorias-externas/:id/articulos',
    name: 'ArticulosExternos',
    component: () => import('@/views/ArticulosExternosView.vue')
  },
  {
    path: '/editar-categoria-externos/:id',
    name: 'EditarCategoriaExternos',
    component: () => import('@/views/EditarCategoriaExternosView.vue')
  },
  {
    path: '/editar-articulo-externos/:id',
    name: 'EditarArticuloExternos',
    component: () => import('@/views/EditarArticuloExternosView.vue')
  },
  {
    path: '/crear-categoria-externos',
    name: 'CrearCategoriaExternos',
    component: () => import('@/views/CrearCategoriaExternosView.vue')
  },
  {
    path: '/crear-articulo-inventario-cocina',
    name: 'CrearArticuloInventarioCocina',
    component: () => import('@/views/CrearArticuloInventarioCocina.vue')
  },
  {
    path: '/crear-categoria-inventario',
    name: 'CrearCategoriaInventario',
    component: () => import('@/views/CrearCategoriaInventario.vue')
  },
  {
    path: '/editar-categoria-inventario/:id',
    name: 'EditarCategoriaInventario',
    component: () => import('@/views/EditarCategoriaInventarioView.vue')
  },
  {
    path: '/categorias-inventario/:id/articulos',
    name: 'ArticulosInventario',
    component: () => import('@/views/ArticulosInventarioView.vue')
  },
  {
    path: '/editar-articulo-inventario/:id',
    name: 'EditarArticuloInventario',
    component: () => import('@/views/EditarArticuloInventarioView.vue')
  },
  {
    path: '/solicitar-articulo',
    name: 'SolicitarArticulo',
    component: () => import('@/views/SolicitarArticulo.vue')
  },
  {
    path: '/gestion-solicitudes',
    name: 'GestionSolicitudes',
    component: () => import('@/views/GestionSolicitudes.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



const permisosPorRol = {
  admin: [
    'PedidosActivos', 'NuevoPedido', 'VistaCocina', 'Pagos', 'VistaAjustes',
    'EditarPerfil', 'RolesView', 'Mesas', 'HistorialVentas', 'HistorialTiempos',
    'Miembros', 'categorias', 'crearcategoria', 'CrearCategoria', 'ArticulosCategoria',
    'CrearArticulo', 'EditarCategoria', 'EditarArticulo', 'Roles','PedidosFuera', 'InventarioCocina', 'ConsultaSolisitudes', 'RegistrarProducto', 'EditarProducto', 'GestionProductos', 'CrearArticuloExternos', 'CategoriasExternas', 'ArticulosExternos', 'EditarCategoriaExternos', 'EditarArticuloExternos', 'CrearCategoriaExternos', 'CrearArticuloInventarioCocina', 'CrearCategoriaInventario', 'EditarCategoriaInventario', 'ArticulosInventario', 'EditarArticuloInventario', 'SolicitarArticulo', 'GestionSolicitudes'
  ],
  mesero: ['PedidosActivos', 'NuevoPedido','Pagos','PedidosFuera','InventarioCocina', 'CrearCategoria', 'CrearArticuloExternos', 'CategoriasExternas', 'ArticulosExternos', 'EditarCategoriaExternos', 'EditarArticuloExternos', 'CrearCategoriaExternos', 'CrearArticuloInventarioCocina', 'CrearCategoriaInventario', 'EditarCategoriaInventario', 'ArticulosInventario', 'EditarArticuloInventario', 'SolicitarArticulo'],
  cocina: ['VistaCocina','InventarioCocina', 'CrearArticuloExternos', 'CategoriasExternas', 'ArticulosExternos', 'EditarCategoriaExternos', 'EditarArticuloExternos', 'CrearCategoriaExternos', 'CrearArticuloInventarioCocina', 'CrearCategoriaInventario', 'EditarCategoriaInventario', 'ArticulosInventario', 'EditarArticuloInventario', 'SolicitarArticulo'],
  cajero: ['Pagos', 'CrearArticuloExternos', 'CategoriasExternas', 'ArticulosExternos', 'EditarCategoriaExternos', 'EditarArticuloExternos', 'CrearCategoriaExternos', 'EditarCategoriaInventario', 'ArticulosInventario', 'EditarArticuloInventario', 'SolicitarArticulo']
}
// Agregar permiso para SolicitarInventarioCocina a todos los roles
Object.keys(permisosPorRol).forEach(rol => {
  if (!permisosPorRol[rol].includes('SolicitarInventarioCocina')) {
    permisosPorRol[rol].push('SolicitarInventarioCocina');
  }
});

// Agregar permiso para SolicitarInventarioCocina a todos los roles
Object.keys(permisosPorRol).forEach(rol => {
  if (!permisosPorRol[rol].includes('SolicitarInventarioCocina')) {
    permisosPorRol[rol].push('SolicitarInventarioCocina');
  }
});



router.beforeEach((to, from, next) => {
  const publicPages = ['Login', 'Registro']
  const authRequired = !publicPages.includes(to.name)
  const token = localStorage.getItem('token')
  const rol = localStorage.getItem('rol')
  const routeName = to.name || (to.matched[0] && to.matched[0].name) || null

  console.log('Guardia:', { routeName, path: to.path, rol, token })

  // Si no está autenticado y la ruta requiere autenticación
  if (authRequired && !token) {
    return next({ name: 'Login' })
  }

  // Si está autenticado y trata de ir al login
  if (token && (to.path === '/' || routeName === 'Login')) {
    if (rol === 'mesero') return next({ name: 'PedidosActivos' })
    if (rol === 'cocina') return next({ name: 'VistaCocina' })
    if (rol === 'cajero') return next({ name: 'Pagos' })
    return next({ name: 'VistaAjustes' }) // admin u otro
  }

  // Si está autenticado pero no tiene permiso para la ruta
  if (authRequired && rol && routeName && !permisosPorRol[rol]?.includes(routeName)) {
    alert('No tienes permiso para acceder a esta página.')
    return next(false)
  }

  console.log('Pasando guardia:', { to, from, routeName, rol, token })
  next()
})


export default router