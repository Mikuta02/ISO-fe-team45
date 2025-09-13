import {Component, Input, OnInit} from '@angular/core';
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
  commentVisible: Record<number, boolean> = {};


  @Input() onlyFollowing = false;
  @Input() trending = false;

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
    let obs: Observable<any>;

    if (this.onlyFollowing) {
      obs = this.postService.getFollowingPosts();
    } else if (this.trending) {
      obs = this.postService.getTrendingPosts();
    } else {
      obs = this.postService.getAllPosts();
    }

    obs.subscribe({
      next: (list: PostDTO[]) => {
        this.posts = (list || []).map(p => ({ comments: [], ...p }));
        this.loading = false;

        if (this.onlyFollowing && this.posts.length === 0) {
          // Prikaži poruku ako nema following postova
          alert("Ne pratite nikoga, zapratite korisnike da biste videli njihove objave.");
        }
      },
      error: (err: any) => {
        console.error('Failed to load posts', err);
        this.loading = false;
      }
    });
  }


  like(post: PostDTO): void {
    if (!this.me) {
      alert("Morate se prijaviti da biste lajkovali objave.");
      return;
    }

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
    if (!this.me) {
      alert("Morate se prijaviti da biste komentarisali.");
      return;
    }
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

  unlike(post: PostDTO): void {
    if (!this.me) {
      alert("Morate se prijaviti da biste uklonili lajk.");
      return;
    }

    if (this.liking[post.id]) return;
    this.liking[post.id] = true;
    this.postService.unlikePost(post.id).subscribe({
      next: (_: any) => {
        post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
        this.liking[post.id] = false;
      },
      error: (err: any) => {
        console.error('Failed to unlike post', err);
        this.liking[post.id] = false;
      }
    });
  }
  toggleComments(post: PostDTO): void {
    this.commentVisible[post.id] = !this.commentVisible[post.id];
  }


  trackByPostId(_i: number, p: PostDTO): number { return p.id; }
  trackByCommentId(_i: number, c: CommentDTO): number | string { return c.id ?? `${c.postId}-${_i}`; }
}
