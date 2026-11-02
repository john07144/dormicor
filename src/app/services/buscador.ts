import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class buscador {
   // GUARDA EL TEXTO DE BUSQUEDA ACTUAL Y PERMITE ACTUALIZARLO (guardar)
  private buscarDato = new BehaviorSubject<string>('');

  // PERMITEN QUE OTROS COMPONENTES ESCUCHEN LOS CAMBIOS DEL TEXTO DE BUSQUEDA 
  search$ = this.buscarDato.asObservable();

  // ACTUALIZA EL DATO QUE TENIA POR OTRO NUEVO (cambiar)
  cambiarBuscar(texto: string) {
    this.buscarDato.next(texto);
  } 

  // DEVUELVE EL TEXTO DE BUSQUEDA QUE ESTA GUARDADO ACUALMENTE(consultar)
  obtenerBuscar(): string {
    return this.buscarDato.getValue();
  }
}
