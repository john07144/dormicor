import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Productos1 } from '../services/productos1';

// EL RESOLVER ME AYUDA A CARGAR LOS DATOS DE MIS SERVICIOS
// ANTES DE CARGAR MI PAGINA 

export const productsResolver: ResolveFn<any[]> = () => {
  return inject(Productos1).getProductos();
};