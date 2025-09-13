import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserQueryService {
  private apiUrl = 'http://localhost:8080/api/userslist';

  constructor(private http: HttpClient) {}

  getUsersPaged(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    minPosts?: number;
    maxPosts?: number;
    sortBy?: 'email' | 'followingCount';
    order?: 'asc' | 'desc';
    page?: number;
    size?: number;
  }): Observable<any> {
    let query = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 5))
      .set('sortBy', params.sortBy ?? 'email')
      .set('order', params.order ?? 'asc');

    if (params.firstName) query = query.set('firstName', params.firstName);
    if (params.lastName) query = query.set('lastName', params.lastName);
    if (params.email) query = query.set('email', params.email);
    if (params.minPosts !== undefined) query = query.set('minPosts', String(params.minPosts));
    if (params.maxPosts !== undefined) query = query.set('maxPosts', String(params.maxPosts));

    return this.http.get(`${this.apiUrl}/paged`, { params: query });
  }
}
