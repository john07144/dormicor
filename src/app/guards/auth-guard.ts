import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {

      if (user && user.uid === 'oDSQGja9SfSx2cjT8enYrn7mN2E2') {
        resolve(true);
      } else {
        router.navigate(['/login']);
        resolve(false);
      }

    });
  });
};
