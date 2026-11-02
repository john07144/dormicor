
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Buscador } from '../../services/buscador';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  sidebarOpen: boolean = false;

  constructor(
    private buscadorservice: Buscador,
    private router: Router
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  buscar(texto: string) {
    this.buscadorservice.cambiarBuscar(texto);

    if (this.router.url !== '/productoss') {
      this.router.navigate(['/productoss']);
    }
  }
}
