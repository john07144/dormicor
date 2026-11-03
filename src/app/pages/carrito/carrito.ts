
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Carrito, ProductoCarrito } from '../../services/carrito';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class CarritoPage {

  productos$;

  constructor(public carrito: Carrito) {
    this.productos$ = this.carrito.productos$;
  }

  // CAMBIAR CANTIDAD.
  cambiarCantidad(producto: ProductoCarrito, cantidad: number): void {
    this.carrito.cambiarCantidad(producto.clave, cantidad);
  }

  // ELIMINAR PRODUCTO.
  eliminar(producto: ProductoCarrito): void {
    this.carrito.eliminarProducto(producto.clave);
  }

  // VACIAR CARRITO.
  vaciarCarrito(): void {
    this.carrito.vaciarCarrito();
  }

  // FORMATEAR PRECIOS.
  formatearPrecio(valor: number): string {
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    });
  }

  // TOTAL DE LA COMPRA.
  obtenerTotal(): number {
    return this.carrito.obtenerTotal();
  }

  // CANTIDAD TOTAL DE PRODUCTOS.
  obtenerCantidad(): number {
    return this.carrito.obtenerCantidadTotal();
  }

  // ENVIAR PEDIDO POR WHATSAPP.
  obtenerLinkWhatsApp(): string {

    const productos = this.carrito.obtenerProductos();

    let mensaje = '¡Hola! Quiero realizar el siguiente pedido en Home Confort:\n\n';

    productos.forEach((producto, indice) => {

      mensaje += `${indice + 1}. ${producto.nombre}\n`;
      mensaje += `Cantidad: ${producto.cantidad}\n`;
      mensaje += `Color: ${producto.color || 'No especificado'}\n`;
      mensaje += `Modalidad: ${producto.modalidad}\n`;
      mensaje += `Precio: ${this.formatearPrecio(producto.precio)}\n`;

      if (producto.modalidad === 'credito') {
        mensaje += `Inicial: ${this.formatearPrecio(producto.inicial)}\n`;
        mensaje += `Cuota ${producto.frecuencia}: ${this.formatearPrecio(producto.valorCuota)}\n`;
        mensaje += `Número de cuotas: ${producto.numeroCuotas}\n`;
      }

      mensaje += '\n';
    });

    mensaje += `TOTAL: ${this.formatearPrecio(this.obtenerTotal())}\n\n`;
    mensaje += 'Quedo atento para confirmar mi pedido.';

    return `https://wa.me/573046637509?text=${encodeURIComponent(mensaje)}`;
  }
}
