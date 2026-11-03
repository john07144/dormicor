import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = '';
  
  constructor(private auth: Auth, private router: Router) {}

  //ASYNC ME AYUDA A AVISARLE A JAVASCRIPT QUE ESTA FUNCION ME VA A TOMAR UN TIEMPO EN EJECUTARLA
  async login() {
    //try y catch uno me ayuda a ejecutar un posible error y el otro me ayuda a avisarlo tanto en mi consola como al usuario
    try {
      //await me ayuda a avisarle a javascript que espere a que se ejecute la funcion login para q no me devuelva al mismo componente y me llegue a dar algun error siempre y cuando ya haya llamado a async en la funcion login
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch (error) {

      //ejecuto tanto el error en consola como un alert para el usuario
       console.error(error);
      alert('Correo o contraseña incorrectos. ');
    }
  }
 
}
