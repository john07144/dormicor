
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  from,
  firstValueFrom,
  concat,
  of
} from 'rxjs';

import {
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  collection
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { DataSource } from '../config/data-source';

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

  constructor(private http: HttpClient) {}

  // =========================================
  // LEER LOCAL STORAGE
  // =========================================

  private leerStorage(clave: string): any[] | null {

    if (typeof window === 'undefined') {
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

    if (typeof window === 'undefined') {
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
  // OBTENER PRODUCTOS
  // CACHÉ PRIMERO Y FIREBASE DESPUÉS
  // =========================================

  getProductos(): Observable<any[]> {

    const guardados = this.obtenerProductosCacheados();

    if (guardados !== null) {

      return concat(
        of(guardados),
        from(this.obtenerProductosActualizados())
      );

    }

    return from(this.obtenerProductosActualizados());

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

    if (typeof window !== 'undefined') {

      localStorage.removeItem(this.productosStorageKey);

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


  
  // GUARDAR BANNERS
 

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
