
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Productos1 } from '../../services/productos1';

@Component({
  selector: 'app-carrusel-imagenes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrusel-imagenes.html',
  styleUrls: ['./carrusel-imagenes.css']
})
export class carruselImagenes implements OnInit {

  banners: any[] = [];
  cargando = true;
  errorCarga = '';

  constructor(
    private productos1: Productos1,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarBanners();
  }

  async cargarBanners(): Promise<void> {

    this.cargando = true;
    this.errorCarga = '';
    this.cd.detectChanges();

    try {

      console.log('1. Consultando configuración de banners...');

      const configuracion = await this.productos1.obtenerBanners();

      console.log('2. Banners recibidos:', configuracion);

      console.log('3. Consultando productos...');

      const productos = await this.productos1.obtenerProductos();

      console.log('4. Productos recibidos:', productos);

      if (!Array.isArray(configuracion) || !Array.isArray(productos)) {
        throw new Error('Los datos recibidos no son válidos.');
      }

      const bannersPreparados = configuracion
        .map((banner: any) => {

          const producto = productos.find(
            (p: any) =>
              String(p.docId) === String(banner.productoDocId)
          );

          if (!producto) {
            console.warn('Producto no encontrado:', banner.productoDocId);
            return null;
          }

          // Modalidad seleccionada desde el administrador
          const tipoPrecio: 'contado' | 'credito' =
            banner.tipoPrecio ||
            (producto.vendeContado ? 'contado' : 'credito');

          const imagen =
            banner.imagen || this.obtenerImagen(producto);

          return {
            id: Number(banner.id),
            producto: producto,
            img: imagen,
            tipoPrecio: tipoPrecio,
            precio: this.obtenerPrecio(producto, tipoPrecio),
            link: `/productos/${producto.docId}`
          };
        })
        .filter((banner: any) => banner !== null)
        .sort((a: any, b: any) => a.id - b.id);

      this.banners = bannersPreparados;

      console.log('5. Banners preparados:', this.banners);

    } catch (error: any) {

      console.error('ERROR AL CARGAR BANNERS:', error);

      this.banners = [];

      this.errorCarga =
        error?.message || 'No se pudieron cargar los banners.';

    } finally {

      this.cargando = false;

      // ACTUALIZAR LA VISTA DE ANGULAR
      this.cd.detectChanges();

      console.log('6. Carga de banners finalizada.');
    }
  }

  obtenerImagen(producto: any): string {

    if (!producto) return '';

    if (producto.variantesColor?.length) {
      return producto.variantesColor[0].imagen ||
        producto.imagen ||
        '';
    }

    return producto.imagen || '';
  }

  obtenerPrecio(
    producto: any,
    tipoPrecio: 'contado' | 'credito' = 'contado'
  ): number {

    if (!producto) return 0;

    if (tipoPrecio === 'contado') {
      return Number(
        producto.precioContado || producto.precio || 0
      );
    }

    return Number(
      producto.precioCredito || producto.precio || 0
    );
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

}
