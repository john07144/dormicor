
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  CommonModule,
  Location,
  DOCUMENT
} from '@angular/common';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { Productos1 } from '../../services/productos1';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.css',
})
export class ProductoDetalleComponent implements OnInit {

  producto: any = null;

  modalidadSeleccionada: 'contado' | 'credito' = 'contado';
  frecuenciaSeleccionada: 'quincenal' | 'mensual' = 'quincenal';

  // SERVICIOS
  private meta = inject(Meta);
  private title = inject(Title);
  private document = inject(DOCUMENT);
  private cdr = inject(ChangeDetectorRef);

  private readonly urlBase = 'https://dormicor.pages.dev';

  constructor(
    private route: ActivatedRoute,
    private productos1: Productos1,
    private location: Location
  ) {}

  // =========================================
  // CARGAR PRODUCTO
  // =========================================

  ngOnInit(): void {

    const idRuta = this.route.snapshot.paramMap.get('id');

    if (!idRuta) {
      console.error('No se recibió el ID del producto en la URL');
      return;
    }

    this.productos1.getProductoPorId(idRuta).subscribe({

      next: (encontrado: any | null) => {

        if (!encontrado) {
          console.error('No se encontró el producto:', idRuta);
          this.actualizarSEOProductoNoEncontrado();
          this.cdr.detectChanges();
          return;
        }

        console.log('Datos originales de Firebase:', encontrado);

        // =========================================
        // CONVERTIR VALORES A NÚMEROS
        // =========================================

        const convertirNumero = (valor: any): number => {

          if (typeof valor === 'number') {
            return Number.isFinite(valor) ? valor : 0;
          }

          if (
            valor === null ||
            valor === undefined ||
            valor === ''
          ) {
            return 0;
          }

          if (typeof valor === 'string') {

            const texto = valor.trim();
            const limpio = texto.replace(/[^\d,.-]/g, '');

            if (!limpio) {
              return 0;
            }

            const normalizado = limpio.includes(',')
              ? limpio.replace(/\./g, '').replace(',', '.')
              : limpio.replace(/\./g, '');

            const numero = Number(normalizado);

            return Number.isFinite(numero) ? numero : 0;
          }

          const numero = Number(valor);

          return Number.isFinite(numero) ? numero : 0;
        };

        // =========================================
        // BUSCAR EL PRIMER CAMPO CON VALOR
        // =========================================

        const obtenerCampo = (
          objeto: any,
          campos: string[]
        ): any => {

          for (const campo of campos) {

            if (
              objeto[campo] !== undefined &&
              objeto[campo] !== null &&
              objeto[campo] !== ''
            ) {
              return objeto[campo];
            }
          }

          return 0;
        };

        // =========================================
        // COMPATIBILIDAD CON PRODUCTOS ANTIGUOS
        // =========================================

        const vendeContado = encontrado.vendeContado ??
          (
            encontrado.tipo === 'contado' ||
            encontrado.tipo === 'ambos' ||
            (!encontrado.tipo && encontrado.precio != null)
          );

        const vendeCredito = encontrado.vendeCredito ??
          (
            encontrado.tipo === 'credito' ||
            encontrado.tipo === 'ambos'
          );

        const precioContado = convertirNumero(
          encontrado.precioContado ??
          (
            encontrado.tipo !== 'credito'
              ? encontrado.precio ?? 0
              : 0
          )
        );

        const precioCredito = convertirNumero(
          encontrado.precioCredito ??
          (
            encontrado.tipo !== 'contado'
              ? encontrado.precio ?? 0
              : 0
          )
        );

        // =========================================
        // GALERÍA DE IMÁGENES
        // =========================================

        const imagenes = Array.isArray(encontrado.imagenes)
          ? encontrado.imagenes
          : [];

        // =========================================
        // VARIANTES DE COLOR
        // =========================================

        const variantesColor = Array.isArray(encontrado.variantesColor)
          ? encontrado.variantesColor.map((variante: any) => ({
              ...variante,
              imagenes: Array.isArray(variante.imagenes)
                ? variante.imagenes
                : variante.imagen
                  ? [variante.imagen]
                  : []
            }))
          : [];

        // =========================================
        // VALORES DE LAS CUOTAS
        // =========================================

        const quincenal = convertirNumero(
          obtenerCampo(encontrado, [
            'quincenal',
            'valorQuincenal',
            'cuotaQuincenal',
            'pagoQuincenal'
          ])
        );

        const mensual = convertirNumero(
          obtenerCampo(encontrado, [
            'mensual',
            'valorMensual',
            'cuotaMensual',
            'pagoMensual'
          ])
        );

        // =========================================
        // NÚMERO DE CUOTAS QUINCENALES
        // =========================================

        const numeroCuotasQuincenal = convertirNumero(
          obtenerCampo(encontrado, [
            'numeroCuotasQuincenal',
            'cuotasQuincenales'
          ]) ||
          (
            encontrado.frecuenciaPago === 'quincenal'
              ? encontrado.numeroCuotas ?? 0
              : 0
          )
        );

        // =========================================
        // NÚMERO DE CUOTAS MENSUALES
        // =========================================

        const numeroCuotasMensual = convertirNumero(
          obtenerCampo(encontrado, [
            'numeroCuotasMensual',
            'cuotasMensuales'
          ]) ||
          (
            encontrado.frecuenciaPago === 'mensual'
              ? encontrado.numeroCuotas ?? 0
              : 0
          )
        );

        // =========================================
        // CONSTRUIR PRODUCTO
        // =========================================

        this.producto = {

          ...encontrado,

          vendeContado: Boolean(vendeContado),
          vendeCredito: Boolean(vendeCredito),

          precioContado,
          precioCredito,

          inicial: convertirNumero(encontrado.inicial),

          quincenal,
          mensual,

          numeroCuotasQuincenal,
          numeroCuotasMensual,

          descuento: convertirNumero(encontrado.descuento),

          imagenes,
          variantesColor,

          colorSeleccionado: encontrado.colorSeleccionado || '',

          imagenActiva: imagenes[0] || encontrado.imagen || ''

        };

        // =========================================
        // SELECCIONAR PRIMER COLOR
        // =========================================

        if (variantesColor.length > 0) {

          const indiceInicial = variantesColor.findIndex(
            (v: any) => v.color === this.producto.colorSeleccionado
          );

          this.seleccionarColor(
            this.producto,
            indiceInicial >= 0 ? indiceInicial : 0
          );

        }

        // =========================================
        // MODALIDAD INICIAL
        // =========================================

        if (
          this.producto.vendeCredito &&
          !this.producto.vendeContado
        ) {

          this.modalidadSeleccionada = 'credito';

        } else {

          this.modalidadSeleccionada = 'contado';

        }

        // =========================================
        // FRECUENCIA DISPONIBLE
        // =========================================

        if (quincenal > 0) {

          this.frecuenciaSeleccionada = 'quincenal';

        } else if (mensual > 0) {

          this.frecuenciaSeleccionada = 'mensual';

        } else {

          this.frecuenciaSeleccionada = 'quincenal';

        }

        // =========================================
        // ACTUALIZAR SEO
        // =========================================

        this.actualizarSEO(this.producto, idRuta);

        // =========================================
        // ACTUALIZAR VISTA DE ANGULAR
        // =========================================

        this.cdr.detectChanges();

        console.log(
          'Producto preparado para los detalles:',
          this.producto
        );

        console.log('Cuota quincenal:', this.producto.quincenal);
        console.log('Cuota mensual:', this.producto.mensual);
        console.log('Vende a crédito:', this.producto.vendeCredito);

      },

      error: err => {

        console.error(
          'Error cargando el detalle del producto:',
          err
        );

        this.actualizarSEOProductoNoEncontrado();

        this.cdr.detectChanges();

      }

    });

  }

  // =========================================
  // SEO DINÁMICO
  // =========================================

  private actualizarSEO(p: any, id: string): void {

    const nombre = String(
      p.nombre || 'Producto DormiCor'
    ).trim();

    const descripcionOriginal = String(
      p.descripcion || ''
    ).replace(/\s+/g, ' ').trim();

    const descripcion = (
      descripcionOriginal ||
      `${nombre}. Conoce sus características y opciones de compra en DormiCor.`
    ).slice(0, 160);

    const titulo = `${nombre} | DormiCor`;

    const url = `${this.urlBase}/productos/${encodeURIComponent(id)}`;

    const imagenOriginal =
      p.imagenActiva ||
      p.imagen ||
      p.imagenes?.[0] ||
      '';

    const imagen = imagenOriginal
      ? this.obtenerURLAbsoluta(imagenOriginal)
      : `${this.urlBase}/assets/img/logo.png`;

    this.title.setTitle(titulo);

    this.meta.updateTag({
      name: 'description',
      content: descripcion
    });

    this.meta.updateTag({
      name: 'robots',
      content: 'index, follow, max-image-preview:large'
    });

    this.meta.updateTag({
      name: 'keywords',
      content: `${nombre}, muebles, camas, colchones, DormiCor, Pereira, Colombia`
    });

    // OPEN GRAPH

    this.meta.updateTag({
      property: 'og:type',
      content: 'product'
    });

    this.meta.updateTag({
      property: 'og:title',
      content: titulo
    });

    this.meta.updateTag({
      property: 'og:description',
      content: descripcion
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url
    });

    this.meta.updateTag({
      property: 'og:image',
      content: imagen
    });

    // TWITTER

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image'
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: titulo
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: descripcion
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: imagen
    });

    // CANONICAL

    this.actualizarURLCanonica(url);

    // DATOS ESTRUCTURADOS

    this.actualizarDatosEstructurados(
      p,
      nombre,
      descripcion,
      url,
      imagen
    );

  }

  // =========================================
  // URL ABSOLUTA DE IMAGEN
  // =========================================

  private obtenerURLAbsoluta(imagen: string): string {

    try {
      return new URL(imagen, this.urlBase).href;
    } catch {
      return imagen;
    }

  }

  // =========================================
  // URL CANÓNICA
  // =========================================

  private actualizarURLCanonica(url: string): void {

    let canonical = this.document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!canonical) {

      canonical = this.document.createElement('link');

      canonical.setAttribute('rel', 'canonical');

      this.document.head.appendChild(canonical);

    }

    canonical.setAttribute('href', url);

  }

  // =========================================
  // SCHEMA.ORG PRODUCT
  // =========================================

  private actualizarDatosEstructurados(
    p: any,
    nombre: string,
    descripcion: string,
    url: string,
    imagen: string
  ): void {

    const datos: any = {

      '@context': 'https://schema.org',

      '@type': 'Product',

      name: nombre,

      description: descripcion,

      image: imagen,

      url: url,

      brand: {
        '@type': 'Brand',
        name: 'DormiCor'
      }

    };

    const precio = Number(
      p.precioContado || p.precioCredito || p.precio || 0
    );

    if (Number.isFinite(precio) && precio > 0) {

      datos.offers = {

        '@type': 'Offer',

        priceCurrency: 'COP',

        price: precio,

        url: url

      };

    }

    let script = this.document.getElementById(
      'producto-jsonld'
    ) as HTMLScriptElement | null;

    if (!script) {

      script = this.document.createElement('script');

      script.id = 'producto-jsonld';

      script.type = 'application/ld+json';

      this.document.head.appendChild(script);

    }

    script.textContent = JSON.stringify(datos);

  }

  // =========================================
  // SEO CUANDO NO SE ENCUENTRA EL PRODUCTO
  // =========================================

  private actualizarSEOProductoNoEncontrado(): void {

    this.title.setTitle('Producto no encontrado | DormiCor');

    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow'
    });

    this.meta.updateTag({
      name: 'description',
      content: 'El producto solicitado no está disponible en DormiCor.'
    });

  }

  // =========================================
  // COLOR CSS
  // =========================================

  obtenerColorCSS(color: string): string {

    const nombre = (color || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');

    const coloresCSS: Record<string, string> = {

      blanco: '#ffffff',
      negro: '#171717',
      gris: '#808080',
      'gris claro': '#d3d3d3',
      'gris oscuro': '#454545',
      cafe: '#795548',
      marron: '#795548',
      beige: '#d8c3a5',
      rojo: '#e53935',
      azul: '#1976d2',
      verde: '#388e3c',
      rosado: '#e8a0b4',
      rosa: '#e8a0b4',
      dorado: '#c9a227',
      plateado: '#c0c0c0',
      morado: '#800080',
      amarillo: '#fdd835',
      naranja: '#ef6c00'

    };

    return coloresCSS[nombre] || '#d9d9d9';

  }

  // =========================================
  // VARIANTE ACTIVA
  // =========================================

  esVarianteActiva(p: any, indice: number): boolean {

    return Number(p?.indiceColorSeleccionado ?? -1) === indice;

  }

  // =========================================
  // SELECCIONAR COLOR
  // =========================================

  seleccionarColor(p: any, indice: number): void {

    if (!p || !Array.isArray(p.variantesColor)) {
      return;
    }

    const variante = p.variantesColor[indice];

    if (!variante) {
      return;
    }

    p.indiceColorSeleccionado = indice;

    p.colorSeleccionado = variante.color || '';

    const imagenesColor = Array.isArray(variante.imagenes)
      ? variante.imagenes.filter(
          (img: any) => typeof img === 'string' && img.trim()
        )
      : [];

    const imagenPrincipal = variante.imagen || imagenesColor[0];

    if (imagenPrincipal) {
      p.imagenActiva = imagenPrincipal;
    }

    if (imagenesColor.length > 0) {

      p.imagenes = imagenesColor;

    } else if (imagenPrincipal) {

      p.imagenes = [imagenPrincipal];

    }

  }

  // =========================================
  // FRECUENCIAS DISPONIBLES
  // =========================================

  tieneFrecuenciasDisponibles(): boolean {

    return Number(this.producto?.quincenal ?? 0) > 0 ||
           Number(this.producto?.mensual ?? 0) > 0;

  }

  // =========================================
  // SELECCIONAR MODALIDAD
  // =========================================

  seleccionarModalidad(
    modalidad: 'contado' | 'credito'
  ): void {

    if (!this.producto) {
      return;
    }

    if (modalidad === 'contado' && this.producto.vendeContado) {

      this.modalidadSeleccionada = 'contado';

      return;
    }

    if (modalidad === 'credito' && this.producto.vendeCredito) {

      this.modalidadSeleccionada = 'credito';

      if (
        this.frecuenciaSeleccionada === 'quincenal' &&
        Number(this.producto.quincenal) <= 0
      ) {

        this.frecuenciaSeleccionada =
          Number(this.producto.mensual) > 0
            ? 'mensual'
            : 'quincenal';

      } else if (
        this.frecuenciaSeleccionada === 'mensual' &&
        Number(this.producto.mensual) <= 0
      ) {

        this.frecuenciaSeleccionada =
          Number(this.producto.quincenal) > 0
            ? 'quincenal'
            : 'mensual';

      }

    }

  }

  // =========================================
  // SELECCIONAR FRECUENCIA
  // =========================================

  seleccionarFrecuencia(
    frecuencia: 'quincenal' | 'mensual'
  ): void {

    if (
      !this.producto ||
      this.modalidadSeleccionada !== 'credito'
    ) {
      return;
    }

    if (
      frecuencia === 'quincenal' &&
      Number(this.producto.quincenal) > 0
    ) {

      this.frecuenciaSeleccionada = 'quincenal';

    }

    if (
      frecuencia === 'mensual' &&
      Number(this.producto.mensual) > 0
    ) {

      this.frecuenciaSeleccionada = 'mensual';

    }

  }

  // =========================================
  // CAMBIAR IMAGEN
  // =========================================

  cambiarImagen(p: any, img: string): void {

    p.imagenActiva = img;

  }

  // =========================================
  // VOLVER
  // =========================================

  volver(): void {

    this.location.back();

  }

  // =========================================
  // PRECIO ORIGINAL
  // =========================================

  precioOriginal(p: any): number {

    return Number(p.precioContado ?? p.precio ?? 0);

  }

  // =========================================
  // PRECIO FINAL
  // =========================================

  precioFinal(
    p: any,
    modalidad: 'contado' | 'credito' = 'contado'
  ): number {

    const precioBase = Number(
      modalidad === 'credito'
        ? (p.precioCredito ?? p.precio ?? 0)
        : (p.precioContado ?? p.precio ?? 0)
    );

    if (modalidad === 'credito') {
      return precioBase;
    }

    const descuento = Number(p.descuento ?? 0);

    return descuento > 0
      ? precioBase - (precioBase * descuento / 100)
      : precioBase;

  }

  // =========================================
  // VALOR DE LA CUOTA
  // =========================================

  obtenerValorCuota(p: any): number {

    return this.frecuenciaSeleccionada === 'mensual'
      ? Number(p.mensual ?? 0)
      : Number(p.quincenal ?? 0);

  }

  // =========================================
  // NÚMERO DE CUOTAS
  // =========================================

  obtenerNumeroCuotas(p: any): number {

    return this.frecuenciaSeleccionada === 'mensual'
      ? Number(p.numeroCuotasMensual ?? 0)
      : Number(p.numeroCuotasQuincenal ?? 0);

  }

  // =========================================
  // NOMBRE DE FRECUENCIA
  // =========================================

  obtenerNombreFrecuencia(): string {

    return this.frecuenciaSeleccionada === 'mensual'
      ? 'mensual'
      : 'quincenal';

  }

  // =========================================
  // FORMATEAR PRECIO
  // =========================================

  private formatearPrecio(valor: number): string {

    return Number(valor || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    });

  }

  // =========================================
  // WHATSAPP
  // =========================================

  obtenerLinkWhatsApp(p: any): string {

    let modalidad = this.modalidadSeleccionada;

    if (modalidad === 'contado' && !p.vendeContado) {
      modalidad = 'credito';
    }

    if (modalidad === 'credito' && !p.vendeCredito) {
      modalidad = 'contado';
    }

    const precio = this.precioFinal(p, modalidad);

    let mensaje =
      `Hola, estoy interesado en el producto ${p.nombre}. `;

    if (p.colorSeleccionado) {

      mensaje += `Color seleccionado: ${p.colorSeleccionado}. `;

    }

    if (modalidad === 'contado') {

      mensaje +=
        `Deseo comprarlo de contado. ` +
        `Precio de contado: ${this.formatearPrecio(precio)}.`;

    } else {

      mensaje +=
        `Deseo comprarlo a crédito. ` +
        `Precio a crédito: ${this.formatearPrecio(precio)}.`;

      if (Number(p.inicial) > 0) {

        mensaje +=
          ` Cuota inicial: ${this.formatearPrecio(Number(p.inicial))}.`;

      }

      const valorCuota = this.obtenerValorCuota(p);
      const numeroCuotas = this.obtenerNumeroCuotas(p);
      const frecuencia = this.obtenerNombreFrecuencia();

      if (valorCuota > 0) {

        mensaje +=
          ` Frecuencia de pago elegida: ${frecuencia}.` +
          ` Valor de cada cuota: ${this.formatearPrecio(valorCuota)}.`;

      }

      if (numeroCuotas > 0) {

        mensaje +=
          ` Número de cuotas ${frecuencia}: ${numeroCuotas}.`;

      }

      if (valorCuota <= 0) {

        mensaje +=
          ' Quisiera que me informaran sobre las opciones de pago disponibles.';

      }

    }

    return `https://wa.me/573137110232?text=${encodeURIComponent(mensaje)}`;

  }

}
