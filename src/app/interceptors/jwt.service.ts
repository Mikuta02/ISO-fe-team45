import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {HttpInterceptorFn} from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject AuthService da bi uzeli token
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ako postoji token, kloniramo zahtev i dodajemo zaglavlje Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
