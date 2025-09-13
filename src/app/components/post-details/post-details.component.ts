import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent implements OnInit {
  postId!: number;
  post: any;
  comments: any[] = [];
  newComment = '';
  loading = true;
  liking = false;
  deleting = false;
  isAuthor = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
  ) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.postService.getPostById(this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.isAuthor = this.getCurrentUserId() === post.userId;
        this.fetchComments();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchComments(): void {
    this.postService.getCommentsForPost(this.postId).subscribe(cs => {
      this.comments = cs || [];
    });
  }

  like(): void {
    if (this.liking) return;
    this.liking = true;
    this.postService.likePost(this.postId).subscribe({
      next: () => { this.post.likesCount = (this.post.likesCount ?? 0) + 1; this.liking = false; },
      error: () => { this.liking = false; }
    });
  }

  unlike(): void {
    if (this.liking) return;
    this.liking = true;
    this.postService.unlikePost(this.postId).subscribe({
      next: () => { this.post.likesCount = Math.max(0, (this.post.likesCount ?? 0) - 1); this.liking = false; },
      error: () => { this.liking = false; }
    });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    this.postService.addComment(this.postId, { content: this.newComment.trim() }).subscribe({
      next: (c: any) => {
        this.comments.unshift(c);
        this.newComment = '';
      }
    });
  }

  delete(): void {
    if (!confirm('Obriši objavu?')) return;
    this.deleting = true;
    this.postService.deletePost(this.postId).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/posts']);
      },
      error: () => { this.deleting = false; }
    });
  }

  private getCurrentUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? Number(id) : null;
  }
}
