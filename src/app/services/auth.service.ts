import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IpAddressService } from './ip-adress.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private ipService: IpAddressService) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, user);
  }

  login(credentials: any): Observable<any> {
    return this.ipService.getIpAddress().pipe(
      switchMap((data) => {
        const ipAddress = data.ip; // IP adresa korisnika
        return this.http.post(`${this.apiUrl}/login`, credentials, {
          headers: { 'X-FORWARDED-FOR': ipAddress },
        });
      }),
      tap((response: any) => {
        const token = response.token;
        if (token) {
          localStorage.setItem('token', token);

          // Dekodiranje tokena kako bismo dobili userId i ulogu
          const decodedToken = this.jwtHelper.decodeToken(token);
          if (decodedToken && decodedToken.userId) {
            localStorage.setItem('userId', decodedToken.userId.toString()); // Čuvanje userId
          }
          if (decodedToken && decodedToken.role) {
            localStorage.setItem('role', decodedToken.role); // Opcionalno čuvanje role
          }
        }
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    // Ako token ne postoji ili ne ispunjava uslov da ima tri dela, vratiti false
    if (!token || token.split('.').length !== 3) {
      return false;
    }

    return !this.jwtHelper.isTokenExpired(token);
  }

  getUser(): any {
    const token = this.getToken();
    if (!token || token.split('.').length !== 3) {
      return null;
    }

    return this.jwtHelper.decodeToken(token);
  }

  getUserId(): string | null {
    return localStorage.getItem('userId'); // Dobijanje sačuvanog `userId`
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role'); // Opcionalno brisanje role
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}
