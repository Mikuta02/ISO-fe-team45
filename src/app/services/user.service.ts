import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // Profil i korisnici
  getUserProfile(): Observable<any> { return this.http.get(`${this.apiUrl}/me`); }
  getUserById(userId: number): Observable<any> { return this.http.get(`${this.apiUrl}/${userId}`); }
  getFollowers(userId: number): Observable<any> { return this.http.get(`${this.apiUrl}/${userId}/followers`); }
  getFollowing(userId: number): Observable<any> { return this.http.get(`${this.apiUrl}/${userId}/following`); }

  updateProfile(
    userId: number,
    payload: { firstName: string; lastName: string; address: string }
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, payload, { responseType: 'text' });
  }

  // >>> Usklađeno sa backendom: currentPassword + newPassword + confirmPassword
  changePassword(
    userId: number,
    payload: { currentPassword: string; newPassword: string; confirmPassword: string }
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/change-password`, payload, { responseType: 'text' });
  }

  // Registracija – provera username-a (ostavljeno ako koristiš)
  isUsernameTaken(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username`, { params: { username } });
  }

  // Admin lista korisnika / pretraga / paginacija / sortiranje
  getAllUsers(search: {
    firstName?: string; lastName?: string; email?: string;
    minPosts?: number; maxPosts?: number; page?: number; size?: number;
  } = {}): Observable<any> {
    // mapiranje UI -> API parametara (ako backend očekuje name/surname)
    const paramsObj: any = {
      name: search.firstName, surname: search.lastName, email: search.email,
      minPosts: search.minPosts, maxPosts: search.maxPosts,
      page: search.page, size: search.size
    };
    let params = new HttpParams();
    Object.entries(paramsObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get(`${this.apiUrl}`, { params });
  }

  getAllUsersSorted(
    sortBy: 'followingCount' | 'email',
    order: 'asc' | 'desc' = 'asc',
    page: number = 0,
    size: number = 5
  ): Observable<any> {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('order', order)
      .set('page', page)
      .set('size', size);
    return this.http.get(`${this.apiUrl}/sorted`, { params });
  }
}
