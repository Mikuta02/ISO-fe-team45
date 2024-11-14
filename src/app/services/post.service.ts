import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get`);
  }

  getPostById(postId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${postId}`);
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}/like`, {});
  }

  getCommentsByPostId(postId: number): Observable<any> {
    return this.http.get(`http://localhost:8080/api/comments/post/${postId}`);
  }

  addComment(postId: number, content: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/comments`, content);
  }

  getFollowingPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/following`);
  }

  getTrendingPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trending`);
  }

  getNearbyPosts(latitude: number = 45.2671, longitude: number = 19.8335, radiusKm: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`);
  }

  createPost(description: string, latitude: number, longitude: number, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('image', image);

    return this.http.post(`${this.apiUrl}/create`, formData);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  updatePost(postId:number, post:FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${postId}`, post);
  }
}
