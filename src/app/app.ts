
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar} from './layout/navbar/navbar';
import { CarruselCategorias } from './components/carrusel-categorias/carrusel-categorias';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CarruselCategorias],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Dormicor');
}
