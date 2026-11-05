
import { Routes } from '@angular/router';

import { Inicio } from './pages/inicio/inicio';
import { Productos } from './pages/productos/productos';
import { ProductoDetalleComponent } from './pages/producto-detalle/producto-detalle';
import { carruselImagenes } from './components/carrusel-imagenes/carrusel-imagenes';
import { productsResolver } from './resolvers/products.resolver';

import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { Admin } from './pages/admin/admin';
import { AdminProductos } from './pages/admin-productos/admin-productos';
import { AdminBanners } from './pages/admin-banners/admin-banners';


// CARRITO
import { CarritoPage } from './pages/carrito/carrito';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },

  // PÁGINA PRINCIPAL
  {
    path: 'inicio',
    component: Inicio,
    resolve: { productos: productsResolver }
  },

  // DETALLE DE PRODUCTOS
  {
    path: 'productos/:id',
    component: ProductoDetalleComponent
  },

  // LISTADO DE PRODUCTOS
  {
    path: 'productos',
    component: Productos
  },

  // CATEGORÍAS
  {
    path: 'categoria/:slug',
    component: Productos
  },

  // CARRITO DE COMPRAS
  {
    path: 'carrito',
    component: CarritoPage
  },

  // CARRUSEL DE IMÁGENES
  {
    path: 'carrusel-imagenes',
    component: carruselImagenes
  },

  // LOGIN
  {
    path: 'login',
    component: Login
  },

  // ADMINISTRACIÓN
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard]
  },

  {
    path: 'admin-productos',
    component: AdminProductos,
    canActivate: [authGuard]
  },

  {
    path: 'admin-banners',
    component: AdminBanners,
    canActivate: [authGuard]
  }

];

