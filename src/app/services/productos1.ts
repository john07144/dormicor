
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
  collection
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { DataSource } from '../config/data-source';

@Injectable({
  providedIn: 'root'
})
export class Productos {

  private url = 'http://localhost:3000/productos';

  private cache: any[] | null = null;

  productoParaVolver: number | null = null;

  constructor(private http: HttpClient) {}

  // OBTENER TODOS LOS PRODUCTOS
  getProductos(): Observable<any[]> {

    // UTILIZAR CACHÉ SI YA EXISTE
    if (this.cache) {
      return of(this.cache);
    }

    // OBTENER PRODUCTOS DESDE API LOCAL
    if (!DataSource.firebase) {

      return this.http.get<any[]>(this.url).pipe(
        tap(productos => this.cache = productos)
      );

    }

    // OBTENER PRODUCTOS DESDE FIREBASE
    return from(
      getDocs(collection(db, 'productos'))
    ).pipe(

      map(snapshot =>
        snapshot.docs.map(documento => ({
          ...documento.data(),
          docId: documento.id
        }))
      ),

      tap(productos => {
        this.cache = productos;
      })

    );
  }

  // AGREGAR UN PRODUCTO
  async agregarProducto(producto: any) {

    const productosRef = collection(db, 'productos');

    const resultado = await addDoc(productosRef, {
      ...producto
    });

    this.cache = null;

    return resultado.id;
  }

  // OBTENER PRODUCTOS MEDIANTE PROMESA
  async obtenerProductos() {

    const productosRef = collection(db, 'productos');

    const snapshot = await getDocs(productosRef);

    const productos = snapshot.docs.map(documento => ({
      ...documento.data(),
      docId: documento.id
    }));

    this.cache = productos;

    return productos;
  }

  // ELIMINAR UN PRODUCTO
  async eliminarProducto(docId: string) {

    if (!docId) {
      throw new Error('No se recibió el ID del producto.');
    }

    const productoRef = doc(db, 'productos', docId);

    await deleteDoc(productoRef);

    this.cache = null;
  }

  // EDITAR UN PRODUCTO
  async editarProducto(docId: string, producto: any) {

    if (!docId) {
      throw new Error('No se recibió el ID del producto.');
    }

    const productoRef = doc(db, 'productos', docId);

    await updateDoc(productoRef, producto);

    this.cache = null;
  }

}
