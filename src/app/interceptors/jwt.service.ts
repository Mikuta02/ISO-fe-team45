import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject AuthService da bi uzeli token
  const authService = inject(AuthService);
  const jwtHelper = new JwtHelperService();
  const token = authService.getToken();

  // Ako postoji token, proveravamo da li je istekao
  if (token) {
    if (jwtHelper.isTokenExpired(token)) {
      // Ako je token istekao, brišemo ga iz localStorage
      authService.logout();
    } else {
      // Ako nije istekao, kloniramo zahtev i dodajemo zaglavlje Authorization
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req);
};
