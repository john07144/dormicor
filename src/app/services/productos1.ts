
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, from } from 'rxjs';
import { tap, map } from 'rxjs/operators';

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

  // CACHÉ DE PRODUCTOS
  private cache: any[] | null = null;

  // EVITAR CONSULTAS SIMULTÁNEAS DE PRODUCTOS
  private productosEnCarga: Promise<any[]> | null = null;

  // CACHÉ DE BANNERS
  private bannersCache: any[] | null = null;

  // EVITAR CONSULTAS SIMULTÁNEAS DE BANNERS
  private bannersEnCarga: Promise<any[]> | null = null;

  productoParaVolver: number | null = null;

  constructor(private http: HttpClient) {}

  // OBTENER TODOS LOS PRODUCTOS
  getProductos(): Observable<any[]> {

    if (this.cache !== null) {
      return of(this.cache);
    }

    // API LOCAL
    if (!DataSource.firebase) {

      return this.http.get<any[]>(this.url).pipe(
        tap(productos => {
          this.cache = productos;
        })
      );

    }

    // FIREBASE
    return from(this.obtenerProductos());
  }

  // AGREGAR UN PRODUCTO
  async agregarProducto(producto: any) {

    const productosRef = collection(db, 'productos');

    const resultado = await addDoc(productosRef, {
      ...producto
    });

    this.invalidarCacheProductos();

    return resultado.id;
  }

  // OBTENER PRODUCTOS MEDIANTE PROMESA
  async obtenerProductos(): Promise<any[]> {

    // UTILIZAR CACHÉ SI YA EXISTE
    if (this.cache !== null) {
      return this.cache;
    }

    // REUTILIZAR CONSULTA SI YA ESTÁ EN CURSO
    if (this.productosEnCarga !== null) {
      return this.productosEnCarga;
    }

    this.productosEnCarga = (async () => {

      try {

        const productosRef = collection(db, 'productos');

        const snapshot = await getDocs(productosRef);

        const productos = snapshot.docs.map(documento => ({
          ...documento.data(),
          docId: documento.id
        }));

        this.cache = productos;

        return productos;

      } finally {

        this.productosEnCarga = null;

      }

    })();

    return this.productosEnCarga;
  }

  // ELIMINAR UN PRODUCTO
  async eliminarProducto(docId: string) {

    if (!docId) {
      throw new Error('No se recibió el ID del producto.');
    }

    const productoRef = doc(db, 'productos', docId);

    await deleteDoc(productoRef);

    this.invalidarCacheProductos();
  }

  // EDITAR UN PRODUCTO
  async editarProducto(docId: string, producto: any) {

    if (!docId) {
      throw new Error('No se recibió el ID del producto.');
    }

    const productoRef = doc(db, 'productos', docId);

    await updateDoc(productoRef, producto);

    this.invalidarCacheProductos();
  }

  // INVALIDAR CACHÉ DE PRODUCTOS
  private invalidarCacheProductos(): void {
    this.cache = null;
    this.productosEnCarga = null;
  }

  // OBTENER CONFIGURACIÓN DE LOS BANNERS
  async obtenerBanners(): Promise<any[]> {

    // UTILIZAR CACHÉ SI YA EXISTE
    if (this.bannersCache !== null) {
      return this.bannersCache;
    }

    // REUTILIZAR CONSULTA EN CURSO
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

        return banners;

      } finally {

        this.bannersEnCarga = null;

      }

    })();

    return this.bannersEnCarga;
  }

  // GUARDAR CONFIGURACIÓN DE LOS BANNERS
  async guardarBanners(banners: any[]): Promise<void> {

    const referencia = doc(db, 'configuracion', 'banners');

    await setDoc(referencia, {
      banners: banners
    });

    // ACTUALIZAR CACHÉ DESPUÉS DE GUARDAR
    this.bannersCache = banners;
  }

}
