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

  // Kreiranje objave (multipart)
  createPost(description: string, latitude: number, longitude: number, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}`, formData);
  }

  // Komentari
  addComment(postId: number, payload: { content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/comments`, payload);
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/like`, null);
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
  getMapData(latitude: number, longitude: number): Observable<any> {
    const params = new HttpParams()
      .set('latitude', String(latitude))
      .set('longitude', String(longitude));
    return this.http.get(`${this.apiUrl}/map`, { params });
  }

  // Obližnje objave na mapi (koristi se u MapPostsComponent)
  getNearbyPosts(lat?: number, lng?: number, radiusKm?: number): Observable<any> {
    let params = new HttpParams();
    if (lat !== undefined && lng !== undefined) {
      params = params.set('lat', String(lat)).set('lng', String(lng));
    }
    if (radiusKm !== undefined) params = params.set('radiusKm', String(radiusKm));
    return this.http.get(`${this.apiUrl}/nearby`, { params });
  }
}
