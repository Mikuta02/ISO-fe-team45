import {booleanAttribute, Component, Input, OnInit} from '@angular/core';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  comments: { [key: number]: any[] } = {};
  newComment: { [key: number]: string } = {};
  @Input({transform: booleanAttribute}) onlyFollowing: boolean = false;
  @Input({transform: booleanAttribute}) trending: boolean = false;

  constructor(private postService: PostService, private authService: AuthService) {}

  ngOnInit(): void {
    if(!this.onlyFollowing) {
      this.postService.getAllPosts().subscribe({
        next: (data) => {
          this.posts = data;
          // Preuzimanje komentara za svaku objavu
          this.posts.forEach(post => {
            this.getComments(post.id);
          });
        },
        error: (err) => {
          console.error('Error fetching posts', err);
        }
      });
    }else{
      this.postService.getFollowingPosts().subscribe({
        next: (data) => {
          this.posts = data;
        },
        error: (err) => {
          console.error('Error fetching following posts', err);
        }
      });
    }
    if(this.trending){
      this.postService.getTrendingPosts().subscribe({
        next: (data) => {
          this.posts = data;
        },
        error: (err) => {
          console.error('Error fetching trending posts', err);
        }
      });
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  likePost(postId: number): void {
    if (!this.isAuthenticated()) {
      alert('You must be logged in to like posts');
      return;
    }

    this.postService.likePost(postId).subscribe({
      next: () => {
        alert('Post liked successfully');
      },
      error: (err) => {
        console.error('Error liking post', err);
      }
    });
  }

  getComments(postId: number): void {
    this.postService.getCommentsByPostId(postId).subscribe({
      next: (comments) => {
        this.comments[postId] = comments;
      },
      error: (err) => {
        console.error(`Error fetching comments for post ${postId}`, err);
      }
    });
  }

  addComment(postId: number): void {
    if (!this.isAuthenticated()) {
      alert('You must be logged in to comment');
      return;
    }

    const content = this.newComment[postId];
    if (!content) {
      alert('Comment content cannot be empty');
      return;
    }

    const authorId = this.authService.getUser().userId;
    const commentDTO = {
      postId: postId,
      content: content,
      authorId: authorId
    };

    this.postService.addComment(postId, commentDTO).subscribe({
      next: (comment) => {
        if (!this.comments[postId]) {
          this.comments[postId] = [];
        }
        this.comments[postId].push(comment);
        this.newComment[postId] = '';
      },
      error: (err) => {
        console.error(`Error adding comment for post ${postId}`, err);
      }
    });
  }

}

