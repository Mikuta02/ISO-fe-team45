import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private baseUrl = 'http://localhost:8080/api/follow';

  constructor(private http: HttpClient) {}

  followUser(followerId: number, followeeId: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/follow/${followerId}/${followeeId}`, null, { responseType: 'text' });
  }

  unfollowUser(followerId: number, followeeId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/follow/${followerId}/${followeeId}`, { responseType: 'text' });
  }
}
