import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private jwt = new JwtHelperService();

  constructor(private router: Router) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasAdminRole(): boolean {
    // 1) ako je role već snimljen u localStorage (vaš AuthService tako radi)
    const stored = localStorage.getItem('role');
    if (stored && (stored === 'ADMIN' || stored === 'ROLE_ADMIN')) return true;

    // 2) fallback: pročitati iz JWT
    const token = this.getToken();
    if (!token || token.split('.').length !== 3) return false;

    try {
      const payload = this.jwt.decodeToken(token) || {};
      const roles: string[] =
        payload['roles'] || payload['authorities'] || payload['role'] || [];

      if (Array.isArray(roles)) {
        return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
      }
      if (typeof roles === 'string') {
        return roles === 'ADMIN' || roles === 'ROLE_ADMIN';
      }
      return false;
    } catch {
      return false;
    }
  }

  canActivate(): boolean {
    if (this.hasAdminRole()) return true;
    this.router.navigate(['/home']);
    return false;
  }
}
