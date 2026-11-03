
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalidadCarrito = 'contado' | 'credito';
export type FrecuenciaCarrito = 'quincenal' | 'mensual';

export interface ProductoCarrito {
  clave: string;
  id: number | string;
  nombre: string;
  imagen: string;
  color: string;
  modalidad: ModalidadCarrito;
  precio: number;
  inicial: number;
  frecuencia: FrecuenciaCarrito;
  valorCuota: number;
  numeroCuotas: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class Carrito {

  private readonly STORAGE_KEY = 'homeconfort_carrito';

  private productosSubject = new BehaviorSubject<ProductoCarrito[]>(
    this.cargarCarrito()
  );

  productos$ = this.productosSubject.asObservable();

  // OBTENER PRODUCTOS DEL CARRITO.
  obtenerProductos(): ProductoCarrito[] {
    return this.productosSubject.value;
  }

  // CARGAR CARRITO GUARDADO.
  private cargarCarrito(): ProductoCarrito[] {

    try {
      if (typeof localStorage === 'undefined') {
        return [];
      }

      const guardado = localStorage.getItem(this.STORAGE_KEY);

      return guardado ? JSON.parse(guardado) : [];

    } catch (error) {
      console.error('Error cargando el carrito:', error);
      return [];
    }
  }

  // GUARDAR CARRITO.
  private guardarCarrito(productos: ProductoCarrito[]): void {

    this.productosSubject.next(productos);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(productos)
        );
      }
    } catch (error) {
      console.error('Error guardando el carrito:', error);
    }
  }

  // AGREGAR PRODUCTO.
  agregarProducto(producto: ProductoCarrito): void {

    const productos = [...this.productosSubject.value];

    const existente = productos.find(
      p => p.clave === producto.clave
    );

    if (existente) {

      existente.cantidad += producto.cantidad;

    } else {

      productos.push({
        ...producto,
        cantidad: producto.cantidad || 1
      });

    }

    this.guardarCarrito(productos);
  }

  // CAMBIAR CANTIDAD.
  cambiarCantidad(clave: string, cantidad: number): void {

    if (cantidad < 1) return;

    const productos = this.productosSubject.value.map(p =>
      p.clave === clave
        ? { ...p, cantidad }
        : p
    );

    this.guardarCarrito(productos);
  }

  // ELIMINAR PRODUCTO.
  eliminarProducto(clave: string): void {

    const productos = this.productosSubject.value.filter(
      p => p.clave !== clave
    );

    this.guardarCarrito(productos);
  }

  // VACIAR CARRITO.
  vaciarCarrito(): void {
    this.guardarCarrito([]);
  }

  // CONTAR UNIDADES.
  obtenerCantidadTotal(): number {

    return this.productosSubject.value.reduce(
      (total, p) => total + p.cantidad,
      0
    );
  }

  // CALCULAR TOTAL.
  obtenerTotal(): number {

    return this.productosSubject.value.reduce(
      (total, p) => total + (p.precio * p.cantidad),
      0
    );
  }
}
