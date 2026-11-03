import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  async login(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

async logout() {
  return await signOut(auth);
}
  

}
