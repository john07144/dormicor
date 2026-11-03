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
  {
    path: 'categoria/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'productos/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];