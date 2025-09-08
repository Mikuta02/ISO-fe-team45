import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

type ApiPost = {
  id: number;
  description?: string;
  image?: string;           // backend polje
  likesCount?: number;
  createdAt?: string;
  userId?: number;
  authorUsername?: string;  // ako ga backend dodaje
};

type ApiUser = { userId: number; username?: string; likesGiven: number; };

type ApiTrends = {
  totalPosts: number;
  postsLastMonth: number;
  topPostsLastWeek: ApiPost[];
  topPostsAllTime: ApiPost[];
  topUsersLastWeek: ApiUser[];
};

export type PostView = {
  id: number;
  description?: string;
  likesCount?: number;
  createdAt?: string;
  authorUsername?: number;
  imageUrl?: string;        // adapterirano iz image
};

export type UserLikesView = {
  userId: number;
  username?: string;
  likesGiven: number;
};

export type NetworkTrendsView = {
  totalPosts: number;
  postsLastMonth: number;
  topPostsLastWeek: PostView[];
  topPostsAllTime: PostView[];
  topUsersLastWeek: UserLikesView[];
};

@Injectable({ providedIn: 'root' })
export class TrendService {
  constructor(private http: HttpClient) {}

  getNetworkTrends(): Observable<NetworkTrendsView> {
    return this.http.get<ApiTrends>('http://localhost:8080/api/trends').pipe(
      map(api => ({
        totalPosts: api.totalPosts,
        postsLastMonth: api.postsLastMonth,
        topPostsLastWeek: (api.topPostsLastWeek ?? []).map(p => this.mapPost(p)),
        topPostsAllTime: (api.topPostsAllTime ?? []).map(p => this.mapPost(p)),
        topUsersLastWeek: api.topUsersLastWeek ?? []
      })),
      catchError(err => throwError(() => err))
    );
  }

  private mapPost(p: ApiPost): PostView {
    return {
      id: p.id,
      description: p.description,
      likesCount: p.likesCount,
      createdAt: p.createdAt,
      authorUsername: p.userId,
      imageUrl: p.image // <- standardizujemo ime polja
    };
    // Ako kasnije backend vrati drugačije ključeve, samo ovde promeniš mapiranje.
  }
}
