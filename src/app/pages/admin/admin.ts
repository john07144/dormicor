import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import {RouterModule} from '@angular/router';




@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

  constructor(private auth: Auth, private router: Router) {}

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);
      alert('Error al cerrar sesión: ');
    }
  }

}
