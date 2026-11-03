
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { buscador } from '../../services/buscador';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  sidebarOpen: boolean = false;

  constructor(
    private buscador: buscador,
    private router: Router
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  buscar(texto: string) {
    this.buscador.cambiarBuscar(texto);

    if (this.router.url !== '/productos') {
      this.router.navigate(['/productos']);
    }
  }
}
