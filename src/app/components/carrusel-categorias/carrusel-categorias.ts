
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrusel-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel-categorias.html',
  styleUrl: './carrusel-categorias.css'
})
export class CarruselCategorias {

  private router = inject(Router);

  categorias: { nombre: string; ruta: string }[] = [
    { nombre: 'Colchones', ruta: '/categoria/colchon' },
    { nombre: 'Espaldar', ruta: '/categoria/espaldar' },
     { nombre: 'Base cama', ruta: '/categoria/basecama' },
    { nombre: 'Armarios', ruta: '/categoria/armario' },
    { nombre: 'Comedores', ruta: '/categoria/comedor' },
    { nombre: 'Peinadores', ruta: '/categoria/peinador' },
    { nombre: 'Salas', ruta: '/categoria/sala' },
    { nombre: 'Camas', ruta: '/categoria/cama' },
    { nombre: 'Almohadas y Más', ruta: '/categoria/almohada' },
   
  ];

  desplazamiento = 0;

  seleccionar(categoria: { nombre: string; ruta: string }): void {
    this.router.navigateByUrl(categoria.ruta);
  }

  moverCarrusel(direccion: number): void {
    this.desplazamiento = Math.max(
      0,
      this.desplazamiento + direccion * 180
    );
  }
}
