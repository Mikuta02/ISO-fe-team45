import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
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

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
