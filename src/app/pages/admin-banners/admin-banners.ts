
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Productos1 } from '../../services/productos1';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-banners.html',
  styleUrl: './admin-banners.css'
})
export class AdminBanners implements OnInit {

  productos: any[] = [];
  banners: any[] = [];

  bannerId = 1;
  productoDocId = '';

  // NUEVO: MODALIDAD DEL PRECIO DEL BANNER
  tipoPrecio: 'contado' | 'credito' = 'contado';

  bannerEditando: number | null = null;

  guardando = false;
  mensaje = '';

  constructor(private productos1: Productos1) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  // CARGAR PRODUCTOS Y BANNERS GUARDADOS
  async cargarDatos() {
    try {
      this.productos = await this.productos1.obtenerProductos();

      const guardados = await this.productos1.obtenerBanners();

      this.banners = (guardados || [])
        .map((banner: any) => {
          const producto = this.obtenerProducto(
            banner.productoDocId
          );

          return {
            ...banner,
            imagen: banner.imagen || this.obtenerImagen(producto),

            // COMPATIBILIDAD CON BANNERS ANTERIORES
            tipoPrecio: banner.tipoPrecio ||
              (producto?.vendeContado ? 'contado' : 'credito')
          };
        })
        .sort((a: any, b: any) => a.id - b.id);

      console.log('Banners cargados:', this.banners);

    } catch (error) {
      console.error('Error cargando banners:', error);
      this.mensaje = 'Error al cargar los datos.';
    }
  }

  // BUSCAR PRODUCTO POR SU DOCUMENTO DE FIREBASE
  obtenerProducto(docId: string) {
    return this.productos.find(
      producto => String(producto.docId) === String(docId)
    );
  }

  // OBTENER IMAGEN PRINCIPAL DEL PRODUCTO
  obtenerImagen(producto: any): string {
    if (!producto) return '';

    if (producto.variantesColor?.length) {
      return producto.variantesColor[0].imagen ||
        producto.imagen ||
        '';
    }

    return producto.imagen || '';
  }

  // OBTENER PRECIO SEGÚN LA MODALIDAD ELEGIDA
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

  // GENERAR ENLACE AUTOMÁTICO AL DETALLE
  obtenerEnlace(productoDocId: string): string {
    return productoDocId
      ? `/productos/${productoDocId}`
      : '';
  }

  // GUARDAR O ACTUALIZAR BANNER
  async guardar() {

    if (!this.productoDocId) {
      this.mensaje = 'Selecciona un producto.';
      return;
    }

    const producto = this.obtenerProducto(this.productoDocId);

    if (!producto) {
      this.mensaje = 'El producto seleccionado no existe.';
      return;
    }

    // VALIDAR QUE EL PRODUCTO TENGA LA MODALIDAD ELEGIDA
    if (
      this.tipoPrecio === 'contado' &&
      !producto.vendeContado
    ) {
      this.mensaje = 'Este producto no está disponible de contado.';
      return;
    }

    if (
      this.tipoPrecio === 'credito' &&
      !producto.vendeCredito
    ) {
      this.mensaje = 'Este producto no está disponible a crédito.';
      return;
    }

    const precio = this.obtenerPrecio(producto, this.tipoPrecio);

    if (precio <= 0) {
      this.mensaje = 'El producto no tiene un precio válido para esta modalidad.';
      return;
    }

    const imagen = this.obtenerImagen(producto);

    if (!imagen) {
      this.mensaje = 'El producto seleccionado no tiene una imagen.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    // GUARDAR IMAGEN Y MODALIDAD DEL PRECIO
    const registro = {
      id: Number(this.bannerId),
      productoDocId: this.productoDocId,
      imagen: imagen,
      tipoPrecio: this.tipoPrecio
    };

    const mensajeExito = this.bannerEditando !== null
      ? 'Banner actualizado correctamente.'
      : 'Banner guardado correctamente.';

    try {

      const actualizados = [
        ...this.banners.filter(
          b => Number(b.id) !== Number(this.bannerId)
        ),
        registro
      ];

      actualizados.sort((a, b) => a.id - b.id);

      await this.productos1.guardarBanners(actualizados);

      this.banners = actualizados;

      this.mensaje = mensajeExito;

      this.limpiarFormulario();

    } catch (error) {
      console.error('Error guardando banner:', error);
      this.mensaje = 'No se pudo guardar el banner. Revisa Firebase.';
    } finally {
      this.guardando = false;
    }
  }

  // CARGAR BANNER EN EL FORMULARIO PARA EDITAR
  editar(banner: any) {
    this.bannerId = banner.id;
    this.productoDocId = banner.productoDocId;

    this.tipoPrecio = banner.tipoPrecio || 'contado';

    this.bannerEditando = banner.id;
    this.mensaje = '';
  }

  // ELIMINAR BANNER
  async eliminar(banner: any) {

    const confirmar = confirm(
      `¿Deseas eliminar el Banner ${banner.id}?`
    );

    if (!confirmar) return;

    this.guardando = true;
    this.mensaje = '';

    const anteriores = [...this.banners];

    try {

      const actualizados = this.banners.filter(
        b => Number(b.id) !== Number(banner.id)
      );

      await this.productos1.guardarBanners(actualizados);

      this.banners = actualizados;

      this.mensaje = 'Banner eliminado correctamente.';

      if (this.bannerEditando === banner.id) {
        this.limpiarFormulario();
      }

    } catch (error) {
      console.error('Error eliminando banner:', error);
      this.banners = anteriores;
      this.mensaje = 'No se pudo eliminar el banner.';
    } finally {
      this.guardando = false;
    }
  }

  // LIMPIAR FORMULARIO
  limpiarFormulario() {
    this.bannerId = 1;
    this.productoDocId = '';
    this.tipoPrecio = 'contado';
    this.bannerEditando = null;
  }
}
