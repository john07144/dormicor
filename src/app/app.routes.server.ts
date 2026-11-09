
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [

  {
    path: '',
    renderMode: RenderMode.Prerender
  },

  {
    path: 'inicio',
    renderMode: RenderMode.Prerender
  },

  // LISTADO GENERAL DE PRODUCTOS
  {
    path: 'productos',
    renderMode: RenderMode.Server
  },

  // CATEGORÍAS
  {
    path: 'categoria/:slug',
    renderMode: RenderMode.Server
  },

  // DETALLE DE PRODUCTOS
  {
    path: 'productos/:id',
    renderMode: RenderMode.Server
  },

  // DEMÁS RUTAS
  {
    path: '**',
    renderMode: RenderMode.Server
  }

];
