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
}
