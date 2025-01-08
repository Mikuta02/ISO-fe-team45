import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}/profile`, user);
  }

  isUsernameTaken(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-username?username=${username}`);
  }

  getAllUsers(filters?: any): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      if (filters.firstName) {
        params = params.append('firstName', filters.firstName);
      }
      if (filters.lastName) {
        params = params.append('lastName', filters.lastName);
      }
      if (filters.email) {
        params = params.append('email', filters.email);
      }
      if (filters.minPosts != null) {
        params = params.append('minPosts', filters.minPosts);
      }
      if (filters.maxPosts != null) {
        params = params.append('maxPosts', filters.maxPosts);
      }
    }

    return this.http.get(`${this.apiUrl}`, { params });
  }

  getAllUsersSorted(sortBy: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sorted`, {
      params: new HttpParams().set('sortBy', sortBy)
    });
  }

  changePassword(userId: number, passwords: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/change-password`, passwords);
  }

  getFollowers(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/followers`);
  }

  getFollowing(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/following`);
  }
}
