import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FollowStatus {
  userId: number;
  following: boolean;
  followersCount: number;
}

@Injectable({ providedIn: 'root' })
export class FollowService {
  private base = 'http://localhost:8080/api/follows';

  constructor(private http: HttpClient) {}

  follow(targetId: number): Observable<FollowStatus> {
    return this.http.post<FollowStatus>(`${this.base}/${targetId}`, {});
  }

  unfollow(targetId: number): Observable<FollowStatus> {
    return this.http.delete<FollowStatus>(`${this.base}/${targetId}`);
  }

  status(targetId: number): Observable<FollowStatus> {
    return this.http.get<FollowStatus>(`${this.base}/status/${targetId}`);
  }

  followers(userId: number, page = 0, size = 10): Observable<number[]> {
    return this.http.get<any>(`${this.base}/${userId}/followers`, { params: { page, size }})
      .pipe((src: any) => src); // Page<Long> – zavisi od vašeg Page wrappera
  }

  following(userId: number, page = 0, size = 10): Observable<number[]> {
    return this.http.get<any>(`${this.base}/${userId}/following`, { params: { page, size }})
      .pipe((src: any) => src);
  }
}
