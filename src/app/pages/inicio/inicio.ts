import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Productos1 } from '../../services/productos1';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Productos } from '../productos/productos';
import { carruselImagenes } from '../../components/carrusel-imagenes/carrusel-imagenes';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, FormsModule, RouterModule, carruselImagenes, Productos],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {}
