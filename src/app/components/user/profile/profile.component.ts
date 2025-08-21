import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { PostService } from '../../../services/post.service';

interface PostDTO {
  id: number;
  description: string;
  image?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  userId: number;
  likesCount: number;
  createdAt?: string;
}

interface UserDTO {
  id: number;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  followersCount?: number;
  followingCount?: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user!: UserDTO;
  followers: UserDTO[] = [];
  following: UserDTO[] = [];
  userPosts: PostDTO[] = [];

  savingProfile = false;
  changingPassword = false;
  passwordChange = { currentPassword: '', newPassword: '', confirmPassword: '' };

  constructor(
    private userService: UserService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (me: UserDTO) => {
        this.user = me;

        // Followers / Following
        this.userService.getFollowers(this.user.id).subscribe({
          next: (list: UserDTO[]) => (this.followers = list),
          error: (e: any) => console.error('Followers load failed', e),
        });
        this.userService.getFollowing(this.user.id).subscribe({
          next: (list: UserDTO[]) => (this.following = list),
          error: (e: any) => console.error('Following load failed', e),
        });

        // Moje objave
        this.postService.getPostsByUser(this.user.id).subscribe({
          next: (posts: PostDTO[]) => (this.userPosts = posts),
          error: (e: any) => console.error('Posts load failed', e),
        });
      },
      error: (e: any) => console.error('Profile load failed', e),
    });
  }

  updateProfile(): void {
    if (!this.user) return;
    this.savingProfile = true;
    const payload = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      address: this.user.address ?? '',
    };
    this.userService.updateProfile(this.user.id, payload).subscribe({
      next: () => { this.savingProfile = false; },
      error: (err: any) => {
        console.error('Profile update failed', err);
        this.savingProfile = false;
      },
    });
  }

  changePassword(): void {
    if (!this.user) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordChange;

    if (!currentPassword || !newPassword || !confirmPassword) {
      console.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      console.error('New password must be different from the current one');
      return;
    }

    this.changingPassword = true;
    this.userService.changePassword(this.user.id, {
      currentPassword,
      newPassword,
      confirmPassword
    }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordChange = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err: any) => {
        console.error('Failed to change password', err);
        this.changingPassword = false;
      },
    });
  }
}
