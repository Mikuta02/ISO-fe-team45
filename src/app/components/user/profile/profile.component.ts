import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { PostService } from '../../../services/post.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any;
  followers: any[] = [];
  following: any[] = [];
  userPosts: any[] = [];
  passwordChange = { newPassword: '', confirmPassword: '' };

  constructor(
    private userService: UserService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.loadFollowers(user.id);
        this.loadFollowing(user.id);
        this.loadUserPosts(user.id);
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      },
    });
  }

  loadFollowers(userId: number): void {
    this.userService.getFollowers(userId).subscribe({
      next: (followers) => (this.followers = followers),
      error: (err) => console.error('Failed to load followers', err),
    });
  }

  loadFollowing(userId: number): void {
    this.userService.getFollowing(userId).subscribe({
      next: (following) => (this.following = following),
      error: (err) => console.error('Failed to load following', err),
    });
  }

  loadUserPosts(userId: number): void {
    this.postService.getUserPosts(userId).subscribe({
      next: (posts) => (this.userPosts = posts),
      error: (err) => console.error('Failed to load user posts', err),
    });
  }

  updateProfile(): void {
    this.userService.updateUser(this.user).subscribe({
      next: () => console.log('Profile updated'),
      error: (err) => console.error('Failed to update user profile', err),
    });
  }

  changePassword(): void {
    if (this.passwordChange.newPassword !== this.passwordChange.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    this.userService.changePassword(this.user.id, {
      currentPassword: this.user.password,
      newPassword: this.passwordChange.newPassword,
      confirmPassword: this.passwordChange.confirmPassword,
    }).subscribe({
      next: () => console.log('Password changed successfully'),
      error: (err) => console.error('Failed to change password', err),
    });
  }
}
