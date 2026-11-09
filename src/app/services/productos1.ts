
import {
  Injectable,
  Inject,
  PLATFORM_ID,
  TransferState,
  makeStateKey
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  from,
  firstValueFrom
} from 'rxjs';

import {
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  limit
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { DataSource } from '../config/data-source';

// DATOS TRANSFERIDOS DEL SERVIDOR AL NAVEGADOR.
const PRODUCTOS_TRANSFER_KEY =
  makeStateKey<any[]>('dormicor_productos_transfer');

@Injectable({
  providedIn: 'root'
})
export class Productos1 {

  private url = 'http://localhost:3000/productos';

  // =========================================
  // CACHÉ EN MEMORIA
  // =========================================

  private cache: any[] | null = null;
  private bannersCache: any[] | null = null;

  // =========================================
  // EVITAR CONSULTAS SIMULTÁNEAS
  // =========================================

  private productosEnCarga: Promise<any[]> | null = null;
  private bannersEnCarga: Promise<any[]> | null = null;

  // =========================================
  // CACHÉ DEL NAVEGADOR
  // =========================================

  private readonly productosStorageKey = 'dormicor_productos_v1';
  private readonly bannersStorageKey = 'dormicor_banners_v1';

  productoParaVolver: number | null = null;

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // =========================================
  // LEER LOCAL STORAGE
  // =========================================

  private leerStorage(clave: string): any[] | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {

      const datos = localStorage.getItem(clave);

      if (!datos) {
        return null;
      }

      const resultado = JSON.parse(datos);

      return Array.isArray(resultado) ? resultado : null;

    } catch (error) {

      console.warn('No se pudo leer la caché:', error);

      return null;
    }
  }

  // =========================================
  // GUARDAR LOCAL STORAGE
  // =========================================

  private guardarStorage(clave: string, datos: any[]): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {

      localStorage.setItem(clave, JSON.stringify(datos));

    } catch (error) {

      console.warn('No se pudo guardar la caché:', error);
    }
  }

  // =========================================
  // PRODUCTOS CACHEADOS
  // =========================================

  obtenerProductosCacheados(): any[] | null {

    if (this.cache !== null) {
      return this.cache;
    }

    this.cache = this.leerStorage(this.productosStorageKey);

    return this.cache;
  }

  // =========================================
  // BANNERS CACHEADOS
  // =========================================

  obtenerBannersCacheados(): any[] | null {

    if (this.bannersCache !== null) {
      return this.bannersCache;
    }

    this.bannersCache = this.leerStorage(this.bannersStorageKey);

    return this.bannersCache;
  }

  // =========================================
  // OBTENER PRODUCTOS PARA RESOLVER Y SSR
  // =========================================

  getProductos(): Observable<any[]> {

    return from(this.obtenerProductosParaVista());

  }

  // =========================================
  // OBTENER UN SOLO PRODUCTO POR SU ID
  // =========================================

  getProductoPorId(id: string): Observable<any | null> {

    return from(this.obtenerProductoPorId(id));

  }

  private async obtenerProductoPorId(
    id: string
  ): Promise<any | null> {

    if (!id) {
      return null;
    }

    const PRODUCTO_KEY = makeStateKey<any>(
      `dormicor_producto_${id}`
    );

    // REUTILIZAR DATOS TRANSFERIDOS DURANTE SSR

    if (this.transferState.hasKey(PRODUCTO_KEY)) {

      const producto = this.transferState.get(
        PRODUCTO_KEY,
        null
      );

      if (isPlatformBrowser(this.platformId)) {
        this.transferState.remove(PRODUCTO_KEY);
      }

      return producto;
    }

    let producto: any | null = null;

    if (!DataSource.firebase) {

      producto = await firstValueFrom(
        this.http.get<any>(
          `${this.url}/${encodeURIComponent(id)}`
        )
      );

    } else {

      // PRIMERO: BUSCAR DIRECTAMENTE POR ID DEL DOCUMENTO

      const referencia = doc(db, 'productos', id);

      const documento = await getDoc(referencia);

      if (documento.exists()) {

        producto = {
          ...documento.data(),
          docId: documento.id
        };

      } else {

        // SEGUNDO: BUSCAR POR EL CAMPO PERSONALIZADO id

        const productosRef = collection(db, 'productos');

        let consulta = query(
          productosRef,
          where('id', '==', id),
          limit(1)
        );

        let resultado = await getDocs(consulta);

        // ADMITIR id GUARDADO COMO NÚMERO

        if (resultado.empty && !isNaN(Number(id))) {

          consulta = query(
            productosRef,
            where('id', '==', Number(id)),
            limit(1)
          );

          resultado = await getDocs(consulta);
        }

        if (!resultado.empty) {

          const encontrado = resultado.docs[0];

          producto = {
            ...encontrado.data(),
            docId: encontrado.id
          };

        }
      }
    }

    // TRANSFERIR RESULTADO PARA LA HIDRATACIÓN

    this.transferState.set(
      PRODUCTO_KEY,
      producto
    );

    return producto;
  }

  // =========================================
  // OBTENER PRODUCTOS PARA LA VISTA
  // =========================================

  private async obtenerProductosParaVista(): Promise<any[]> {

    if (this.transferState.hasKey(PRODUCTOS_TRANSFER_KEY)) {

      const productos =
        this.transferState.get(PRODUCTOS_TRANSFER_KEY, []);

      this.cache = productos;

      this.guardarStorage(
        this.productosStorageKey,
        productos
      );

      if (isPlatformBrowser(this.platformId)) {
        this.transferState.remove(PRODUCTOS_TRANSFER_KEY);
      }

      return productos;
    }

    const productos = await this.obtenerProductosActualizados();

    this.transferState.set(
      PRODUCTOS_TRANSFER_KEY,
      productos
    );

    return productos;
  }

  // =========================================
  // OBTENER PRODUCTOS DESDE CACHÉ
  // =========================================

  async obtenerProductos(): Promise<any[]> {

    const guardados = this.obtenerProductosCacheados();

    if (guardados !== null) {
      return guardados;
    }

    return this.obtenerProductosActualizados();
  }

  // =========================================
  // CONSULTAR PRODUCTOS ACTUALIZADOS
  // =========================================

  async obtenerProductosActualizados(): Promise<any[]> {

    if (this.productosEnCarga !== null) {
      return this.productosEnCarga;
    }

    this.productosEnCarga = (async () => {

      try {

        let productos: any[];

        if (!DataSource.firebase) {

          productos = await firstValueFrom(
            this.http.get<any[]>(this.url)
          );

        } else {

          const productosRef = collection(db, 'productos');

          const snapshot = await getDocs(productosRef);

          productos = snapshot.docs.map(documento => ({
            ...documento.data(),
            docId: documento.id
          }));

        }

        this.cache = productos;

        this.guardarStorage(
          this.productosStorageKey,
          productos
        );

        return productos;

      } finally {

        this.productosEnCarga = null;

      }

    })();

    return this.productosEnCarga;
  }

  // =========================================
  // AGREGAR PRODUCTO
  // =========================================

  async agregarProducto(producto: any) {

    const productosRef = collection(db, 'productos');

    const resultado = await addDoc(productosRef, {
      ...producto
    });

    this.invalidarCacheProductos();

    return resultado.id;
  }

  // =========================================
  // ELIMINAR PRODUCTO
  // =========================================

  async eliminarProducto(docId: string) {

    if (!docId) {
      throw new Error('No se recibió el ID del producto.');
    }

    const productoRef = doc(db, 'productos', docId);

    await deleteDoc(productoRef);

    this.invalidarCacheProductos();
  }

  // =========================================
  // EDITAR PRODUCTO
  // =========================================

  async editarProducto(docId: string, producto: any) {

    if (!docId) {
      throw new Error('No se recibió el ID del producto.');
    }

    const productoRef = doc(db, 'productos', docId);

    await updateDoc(productoRef, producto);

    this.invalidarCacheProductos();
  }

  // =========================================
  // INVALIDAR CACHÉ DE PRODUCTOS
  // =========================================

  private invalidarCacheProductos(): void {

    this.cache = null;

    if (isPlatformBrowser(this.platformId)) {

      try {
        localStorage.removeItem(this.productosStorageKey);
      } catch (error) {
        console.warn('No se pudo eliminar la caché:', error);
      }

    }
  }

  // =========================================
  // OBTENER BANNERS
  // =========================================

  async obtenerBanners(): Promise<any[]> {

    const guardados = this.obtenerBannersCacheados();

    if (guardados !== null) {
      return guardados;
    }

    return this.obtenerBannersActualizados();
  }

  // =========================================
  // CONSULTAR BANNERS ACTUALIZADOS
  // =========================================

  async obtenerBannersActualizados(): Promise<any[]> {

    if (this.bannersEnCarga !== null) {
      return this.bannersEnCarga;
    }

    this.bannersEnCarga = (async () => {

      try {

        const referencia = doc(db, 'configuracion', 'banners');

        const resultado = await getDoc(referencia);

        const banners = resultado.exists()
          ? resultado.data()['banners'] || []
          : [];

        this.bannersCache = banners;

        this.guardarStorage(
          this.bannersStorageKey,
          banners
        );

        return banners;

      } finally {

        this.bannersEnCarga = null;

      }

    })();

    return this.bannersEnCarga;
  }

  // =========================================
  // GUARDAR BANNERS
  // =========================================

  async guardarBanners(banners: any[]): Promise<void> {

    const referencia = doc(db, 'configuracion', 'banners');

    await setDoc(referencia, {
      banners: banners
    });

    this.bannersCache = banners;

    this.guardarStorage(
      this.bannersStorageKey,
      banners
    );
  }

}
