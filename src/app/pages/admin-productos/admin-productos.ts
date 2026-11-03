
import { Component, OnInit } from '@angular/core';
import { Productos1 } from '../../services/productos1';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface VarianteColor {
  color: string;
  imagen: string;
  imagenes: string[];
  imagenesTexto: string;
}

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.html',
  styleUrl: './admin-productos.css'
})
export class AdminProductos implements OnInit {
  productoss: any[] = [];
  docIdEditando: string | null = null;

  id: string | number = '';
  nombre = '';

  vendeContado = true;
  vendeCredito = false;

  precioContado: number | null = null;
  precioCredito: number | null = null;

  inicial: number | null = 0;
  quincenal: number | null = 0;
  mensual: number | null = 0;

  numeroCuotasQuincenal: number | null = 0;
  numeroCuotasMensual: number | null = 0;

  categoria = '';
  descripcion = '';
  descuento: number | null = 0;

  // Campos antiguos para mantener compatibilidad.
  color = '';
  imagen = '';
  imagenesTexto = '';

  // Variantes de colores y sus galerías.
  variantesColor: VarianteColor[] = [];

  guardando = false;
  mensajeError = '';

  constructor(private productos1: Productos1) {}

  ngOnInit(): void {
    this.agregarVarianteColor();
    this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    try {
      this.productoss = await this.productos1.obtenerProductos();
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.mensajeError = 'No se pudieron cargar los productos.';
    }
  }

  agregarVarianteColor(): void {
    this.variantesColor.push({
      color: '',
      imagen: '',
      imagenes: [],
      imagenesTexto: ''
    });
  }

  eliminarVarianteColor(indice: number): void {
    if (this.variantesColor.length <= 1) {
      this.mensajeError = 'Debe quedar al menos un color.';
      return;
    }

    this.variantesColor.splice(indice, 1);
    this.mensajeError = '';
  }

  // Estas funciones se utilizan desde el HTML.
  mostrarCuotasQuincenales(): boolean {
    return Number(this.quincenal) > 0;
  }

  mostrarCuotasMensuales(): boolean {
    return Number(this.mensual) > 0;
  }

  private obtenerImagenes(
    texto: string,
    imagenPrincipal: string
  ): string[] {
    const adicionales = String(texto ?? '')
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const principal = String(imagenPrincipal ?? '').trim();

    return [...new Set([
      ...(principal ? [principal] : []),
      ...adicionales
    ])];
  }

  private prepararVariantesColor(): VarianteColor[] {
    return this.variantesColor.map(variante => {
      const colorTexto = String(variante.color ?? '').trim();
      const imagenPrincipal = String(variante.imagen ?? '').trim();

      const imagenes = this.obtenerImagenes(
        variante.imagenesTexto,
        imagenPrincipal
      );

      return {
        color: colorTexto,
        imagen: imagenPrincipal,
        imagenes,
        imagenesTexto: imagenes
          .filter(url => url !== imagenPrincipal)
          .join(', ')
      };
    });
  }

  obtenerColores(producto: any): string {
    if (
      Array.isArray(producto.variantesColor) &&
      producto.variantesColor.length > 0
    ) {
      return producto.variantesColor
        .map((variante: any) => variante.color)
        .filter((color: string) => !!color)
        .join(', ') || '—';
    }

    return producto.color || '—';
  }

  async guardarProducto(): Promise<void> {
    this.mensajeError = '';

    if (this.guardando) return;

    const idTexto = String(this.id ?? '').trim();
    const nombreTexto = String(this.nombre ?? '').trim();

    if (!nombreTexto) {
      this.mensajeError = 'Escribe el nombre del producto.';
      return;
    }

    if (!this.vendeContado && !this.vendeCredito) {
      this.mensajeError =
        'Selecciona contado, crédito o ambas modalidades.';
      return;
    }

    if (
      this.vendeContado &&
      (this.precioContado == null || Number(this.precioContado) <= 0)
    ) {
      this.mensajeError = 'Ingresa un precio de contado válido.';
      return;
    }

    if (
      this.vendeCredito &&
      (this.precioCredito == null || Number(this.precioCredito) <= 0)
    ) {
      this.mensajeError = 'Ingresa un precio a crédito válido.';
      return;
    }

    if (
      this.vendeCredito &&
      (this.inicial == null || Number(this.inicial) < 0)
    ) {
      this.mensajeError = 'La cuota inicial no puede ser negativa.';
      return;
    }

    if (
      this.vendeCredito &&
      (this.quincenal == null || Number(this.quincenal) < 0)
    ) {
      this.mensajeError = 'La cuota quincenal no puede ser negativa.';
      return;
    }

    if (
      this.vendeCredito &&
      (this.mensual == null || Number(this.mensual) < 0)
    ) {
      this.mensajeError = 'La cuota mensual no puede ser negativa.';
      return;
    }

    if (
      this.vendeCredito &&
      Number(this.quincenal) > 0 &&
      (
        !Number.isInteger(Number(this.numeroCuotasQuincenal)) ||
        Number(this.numeroCuotasQuincenal) < 1
      )
    ) {
      this.mensajeError =
        'Indica un número válido de cuotas quincenales.';
      return;
    }

    if (
      this.vendeCredito &&
      Number(this.mensual) > 0 &&
      (
        !Number.isInteger(Number(this.numeroCuotasMensual)) ||
        Number(this.numeroCuotasMensual) < 1
      )
    ) {
      this.mensajeError =
        'Indica un número válido de cuotas mensuales.';
      return;
    }

    if (
      this.vendeCredito &&
      Number(this.quincenal) <= 0 &&
      Number(this.mensual) <= 0
    ) {
      this.mensajeError =
        'Ingresa al menos una cuota quincenal o mensual.';
      return;
    }

    if (
      this.descuento != null &&
      (Number(this.descuento) < 0 || Number(this.descuento) > 100)
    ) {
      this.mensajeError = 'El descuento debe estar entre 0 y 100.';
      return;
    }

    if (this.variantesColor.length === 0) {
      this.mensajeError = 'Agrega al menos un color.';
      return;
    }

    for (let i = 0; i < this.variantesColor.length; i++) {
      const variante = this.variantesColor[i];

      if (!String(variante.color ?? '').trim()) {
        this.mensajeError = `Escribe el nombre del color ${i + 1}.`;
        return;
      }

      if (!String(variante.imagen ?? '').trim()) {
        this.mensajeError =
          `Agrega la imagen principal del color ${i + 1}.`;
        return;
      }
    }

    const variantes = this.prepararVariantesColor();

    const coloresNormalizados = variantes.map(
      variante => variante.color.toLocaleLowerCase()
    );

    if (new Set(coloresNormalizados).size !== coloresNormalizados.length) {
      this.mensajeError =
        'No repitas el mismo color. Cada color debe tener un nombre diferente.';
      return;
    }

    const variantePrincipal = variantes[0];

    const producto: any = {
      id: idTexto,
      nombre: nombreTexto,

      vendeContado: this.vendeContado,
      vendeCredito: this.vendeCredito,

      tipo:
        this.vendeContado && this.vendeCredito
          ? 'ambos'
          : this.vendeCredito
            ? 'credito'
            : 'contado',

      precioContado: this.vendeContado
        ? Number(this.precioContado)
        : 0,

      precioCredito: this.vendeCredito
        ? Number(this.precioCredito)
        : 0,

      precio: this.vendeContado
        ? Number(this.precioContado)
        : Number(this.precioCredito),

      inicial: this.vendeCredito ? Number(this.inicial ?? 0) : 0,
      quincenal: this.vendeCredito ? Number(this.quincenal ?? 0) : 0,
      mensual: this.vendeCredito ? Number(this.mensual ?? 0) : 0,

      numeroCuotasQuincenal: this.vendeCredito
        ? Number(this.numeroCuotasQuincenal ?? 0)
        : 0,

      numeroCuotasMensual: this.vendeCredito
        ? Number(this.numeroCuotasMensual ?? 0)
        : 0,

      numeroCuotas: this.vendeCredito
        ? Number(
            this.numeroCuotasQuincenal ||
            this.numeroCuotasMensual ||
            0
          )
        : 0,

      categoria: String(this.categoria ?? '').trim(),
      descripcion: String(this.descripcion ?? '').trim(),
      descuento: Number(this.descuento ?? 0),

      // Nuevo formato de colores y galerías.
      variantesColor: variantes,

      // Compatibilidad con el catálogo antiguo.
      color: variantePrincipal.color,
      imagen: variantePrincipal.imagen,
      imagenes: variantePrincipal.imagenes
    };

    this.guardando = true;

    try {
      if (this.docIdEditando) {
        await this.productos1.editarProducto(
          this.docIdEditando,
          producto
        );
      } else {
        await this.productos1.agregarProducto(producto);
      }

      await this.cargarProductos();
      this.limpiarFormulario();
    } catch (error) {
      console.error('Error guardando producto:', error);
      this.mensajeError =
        'No se pudo guardar el producto. Revisa la conexión e inténtalo nuevamente.';
    } finally {
      this.guardando = false;
    }
  }

  editar(producto: any): void {
    this.docIdEditando = producto.docId;

    this.id = String(producto.id ?? '');
    this.nombre = String(producto.nombre ?? '');

    this.vendeContado =
      producto.vendeContado ??
      (
        producto.tipo === 'contado' ||
        producto.tipo === 'ambos' ||
        (!producto.tipo && producto.precio != null)
      );

    this.vendeCredito =
      producto.vendeCredito ??
      (
        producto.tipo === 'credito' ||
        producto.tipo === 'ambos'
      );

    this.precioContado =
      producto.precioContado ??
      (producto.tipo !== 'credito' ? producto.precio ?? null : null);

    this.precioCredito =
      producto.precioCredito ??
      (producto.tipo !== 'contado' ? producto.precio ?? null : null);

    this.inicial = Number(producto.inicial ?? 0);
    this.quincenal = Number(producto.quincenal ?? 0);
    this.mensual = Number(producto.mensual ?? 0);

    this.numeroCuotasQuincenal = Number(
      producto.numeroCuotasQuincenal ??
      (
        producto.frecuenciaPago !== 'mensual'
          ? producto.numeroCuotas ?? 0
          : 0
      )
    );

    this.numeroCuotasMensual = Number(
      producto.numeroCuotasMensual ??
      (
        producto.frecuenciaPago === 'mensual'
          ? producto.numeroCuotas ?? 0
          : 0
      )
    );

    this.categoria = String(producto.categoria ?? '');
    this.descripcion = String(producto.descripcion ?? '');
    this.descuento = Number(producto.descuento ?? 0);

    if (
      Array.isArray(producto.variantesColor) &&
      producto.variantesColor.length > 0
    ) {
      this.variantesColor = producto.variantesColor.map(
        (variante: any) => {
          const imagenPrincipal = String(variante.imagen ?? '');

          const textoImagenes = Array.isArray(variante.imagenes)
            ? variante.imagenes.join(', ')
            : String(variante.imagenesTexto ?? '');

          const imagenes = this.obtenerImagenes(
            textoImagenes,
            imagenPrincipal
          );

          return {
            color: String(variante.color ?? ''),
            imagen: imagenPrincipal,
            imagenes,
            imagenesTexto: imagenes
              .filter(url => url !== imagenPrincipal)
              .join(', ')
          };
        }
      );
    } else {
      // Adaptar productos antiguos a una variante.
      const imagenPrincipal = String(producto.imagen ?? '');

      const imagenes = this.obtenerImagenes(
        Array.isArray(producto.imagenes)
          ? producto.imagenes.join(', ')
          : '',
        imagenPrincipal
      );

      this.variantesColor = [{
        color: String(producto.color ?? ''),
        imagen: imagenPrincipal,
        imagenes,
        imagenesTexto: imagenes
          .filter(url => url !== imagenPrincipal)
          .join(', ')
      }];
    }

    if (this.variantesColor.length === 0) {
      this.agregarVarianteColor();
    }

    this.color = String(producto.color ?? '');
    this.imagen = String(producto.imagen ?? '');
    this.imagenesTexto = Array.isArray(producto.imagenes)
      ? producto.imagenes.join(', ')
      : '';

    this.mensajeError = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async eliminar(docId: string): Promise<void> {
    if (!docId) {
      this.mensajeError =
        'No se encontró el identificador del producto.';
      return;
    }

    if (!confirm('¿Seguro que deseas eliminar este producto?')) {
      return;
    }

    try {
      await this.productos1.eliminarProducto(docId);
      await this.cargarProductos();

      if (this.docIdEditando === docId) {
        this.limpiarFormulario();
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      this.mensajeError = 'No se pudo eliminar el producto.';
    }
  }

  limpiarFormulario(): void {
    this.docIdEditando = null;

    this.id = '';
    this.nombre = '';

    this.vendeContado = true;
    this.vendeCredito = false;

    this.precioContado = null;
    this.precioCredito = null;

    this.inicial = 0;
    this.quincenal = 0;
    this.mensual = 0;

    this.numeroCuotasQuincenal = 0;
    this.numeroCuotasMensual = 0;

    this.categoria = '';
    this.descripcion = '';
    this.descuento = 0;

    this.color = '';
    this.imagen = '';
    this.imagenesTexto = '';

    this.variantesColor = [];
    this.agregarVarianteColor();

    this.mensajeError = '';
  }
}
