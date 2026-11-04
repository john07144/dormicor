
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

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

  // =========================================
  // INICIAR COMPONENTE
  // =========================================

  async ngOnInit(): Promise<void> {

    // 1. BUSCAR DATOS GUARDADOS EN EL NAVEGADOR

    const bannersGuardados =
      this.productos1.obtenerBannersCacheados();

    const productosGuardados =
      this.productos1.obtenerProductosCacheados();

    // 2. MOSTRAR BANNERS INMEDIATAMENTE

    if (
      bannersGuardados !== null &&
      productosGuardados !== null
    ) {

      this.prepararBanners(
        bannersGuardados,
        productosGuardados
      );

      this.cargando = false;

      this.cd.detectChanges();

    }

    // 3. ACTUALIZAR DATOS DESDE FIREBASE

    await this.cargarBanners();

  }

  // =========================================
  // CARGAR Y ACTUALIZAR BANNERS
  // =========================================

  async cargarBanners(): Promise<void> {

    // NO OCULTAR LOS BANNERS SI YA EXISTEN

    if (this.banners.length === 0) {
      this.cargando = true;
    }

    this.errorCarga = '';

    try {

      console.log('Actualizando banners...');

      // CONSULTAR BANNERS Y PRODUCTOS EN PARALELO

      const [configuracion, productos] = await Promise.all([

        this.productos1.obtenerBannersActualizados(),

        this.productos1.obtenerProductosActualizados()

      ]);

      if (
        !Array.isArray(configuracion) ||
        !Array.isArray(productos)
      ) {

        throw new Error('Los datos recibidos no son válidos.');

      }

      // PREPARAR LOS BANNERS ACTUALIZADOS

      this.prepararBanners(
        configuracion,
        productos
      );

      console.log('Banners actualizados:', this.banners);

    } catch (error: any) {

      console.error('ERROR AL CARGAR BANNERS:', error);

      // NO BORRAR LOS BANNERS ANTERIORES SI FALLA FIREBASE

      if (this.banners.length === 0) {

        this.errorCarga =
          error?.message || 'No se pudieron cargar los banners.';

      }

    } finally {

      this.cargando = false;

      this.cd.detectChanges();

      console.log('Carga de banners finalizada.');

    }

  }

  // =========================================
  // PREPARAR BANNERS
  // =========================================

  private prepararBanners(
    configuracion: any[],
    productos: any[]
  ): void {

    const bannersPreparados = configuracion

      .map((banner: any) => {

        const producto = productos.find(
          (p: any) =>
            String(p.docId) === String(banner.productoDocId)
        );

        if (!producto) {

          console.warn(
            'Producto no encontrado:',
            banner.productoDocId
          );

          return null;

        }

        // MODALIDAD SELECCIONADA DESDE EL ADMINISTRADOR

        const tipoPrecio: 'contado' | 'credito' =
          banner.tipoPrecio ||
          (producto.vendeContado ? 'contado' : 'credito');

        // IMAGEN DEL PRODUCTO

        const imagen =
          banner.imagen || this.obtenerImagen(producto);

        return {

          id: Number(banner.id),

          producto: producto,

          img: imagen,

          tipoPrecio: tipoPrecio,

          precio: this.obtenerPrecio(
            producto,
            tipoPrecio
          ),

          link: `/productos/${producto.docId}`

        };

      })

      .filter((banner: any) => banner !== null)

      .sort((a: any, b: any) => a.id - b.id);

    this.banners = bannersPreparados;

    this.cd.detectChanges();

  }

  // =========================================
  // OBTENER IMAGEN DEL PRODUCTO
  // =========================================

  obtenerImagen(producto: any): string {

    if (!producto) return '';

    if (producto.variantesColor?.length) {

      return producto.variantesColor[0].imagen ||
        producto.imagen ||
        '';

    }

    return producto.imagen || '';

  }

  // =========================================
  // OBTENER PRECIO
  // =========================================

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

  // =========================================
  // IDENTIFICAR BANNERS
  // =========================================

  trackById(index: number, item: any): number {

    return item.id;

  }

}
