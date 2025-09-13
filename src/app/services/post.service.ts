import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get`);
  }

  getPostById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPost(description: string, latitude: number, longitude: number, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('locationLatitude', latitude.toString());
    formData.append('locationLongitude', longitude.toString());
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}`, formData);
  }

  // Komentari
  addComment(postId: number, payload: { content: string }): Observable<any> {
    // backend putanja: POST /api/posts/{postId}/comments (već postoji kod vas)
    return this.http.post(`${this.apiUrl}/${postId}/comments`, payload);
  }

  getCommentsForPost(postId: number): Observable<any[]> {
    // backend putanja: GET /api/comments/post/{postId}
    return this.http.get<any[]>(`http://localhost:8080/api/comments/post/${postId}`);
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/like`, null);
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/unlike`, null);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  updatePost(postId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${postId}`, formData);
  }

  // Objave po korisniku
  getPostsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  // >>> Vraćeno zbog map.component.ts
  getMapData(latitude: number | undefined, longitude: number | undefined): Observable<any> {
    const params = new HttpParams()
      .set('latitude', String(latitude))
      .set('longitude', String(longitude));
    return this.http.get(`${this.apiUrl}/map`, { params });
  }

  // Obližnje objave na mapi (koristi se u MapPostsComponent)
  getNearbyPosts(lat?: number, lng?: number, radiusKm?: number): Observable<any> {
    let params = new HttpParams();
    if (lat !== undefined && lng !== undefined) {
      params = params.set('latitude', String(lat)).set('longitude', String(lng));
    }
    if (radiusKm !== undefined) params = params.set('radiusKm', String(radiusKm));
    return this.http.get(`${this.apiUrl}/nearby`, { params });
  }

  getFollowingPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/following`);
  }

  getTrendingPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trending`);
  }
}
