import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';

export interface CommentDTO {
  id?: number;
  postId: number;
  userId?: number;
  authorId?: number;        // <<< dodato da ne puca template
  content: string;
  createdAt?: string;
}

export interface PostDTO {
  id: number;
  description: string;
  image?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  userId: number;
  likesCount: number;
  createdAt?: string;
  comments?: CommentDTO[];
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  posts: PostDTO[] = [];
  me: any;

  newCommentText: Record<number, string> = {};
  submittingComment: Record<number, boolean> = {};
  liking: Record<number, boolean> = {};
  loading = false;

  constructor(private postService: PostService, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (me: any) => { this.me = me; this.loadPosts(); },
      error: (_err: any) => { this.loadPosts(); }
    });
  }

  loadPosts(): void {
    this.loading = true;
    const obs: Observable<any> = this.postService.getAllPosts();
    obs.subscribe({
      next: (list: PostDTO[]) => {
        this.posts = (list || []).map(p => ({ comments: [], ...p }));
        this.loading = false;
      },
      error: (err: any) => { console.error('Failed to load posts', err); this.loading = false; }
    });
  }

  like(post: PostDTO): void {
    if (this.liking[post.id]) return;
    this.liking[post.id] = true;
    this.postService.likePost(post.id).subscribe({
      next: (_: any) => { post.likesCount = (post.likesCount || 0) + 1; this.liking[post.id] = false; },
      error: (err: any) => { console.error('Failed to like post', err); this.liking[post.id] = false; }
    });
  }

  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe({
      next: (_: any) => { this.posts = this.posts.filter(p => p.id !== postId); },
      error: (err: any) => console.error('Failed to delete post', err)
    });
  }

  addComment(post: PostDTO): void {
    const text = (this.newCommentText[post.id] || '').trim();
    if (!text || this.submittingComment[post.id]) return;
    this.submittingComment[post.id] = true;

    this.postService.addComment(post.id, { content: text }).subscribe({
      next: (comment: CommentDTO) => {
        comment.postId = comment.postId ?? post.id;
        post.comments = post.comments || [];
        post.comments.unshift(comment);
        this.newCommentText[post.id] = '';
        this.submittingComment[post.id] = false;
      },
      error: (err: any) => { console.error('Failed to add comment', err); this.submittingComment[post.id] = false; }
    });
  }

  trackByPostId(_i: number, p: PostDTO): number { return p.id; }
  trackByCommentId(_i: number, c: CommentDTO): number | string { return c.id ?? `${c.postId}-${_i}`; }
}
