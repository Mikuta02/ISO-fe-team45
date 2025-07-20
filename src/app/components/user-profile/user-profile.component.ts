import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: any;
  isFollowing: boolean = false;
  currentUserId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: FollowService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.params['id'];
    this.userService.getUserById(userId).subscribe((user) => {
      this.user = user;
      this.checkIfFollowing(userId);
    });

    this.userService.getUserProfile().subscribe((profile) => {
      this.currentUserId = profile.id;
    });
  }

  checkIfFollowing(userId: number): void {
    this.userService.getFollowing(this.currentUserId).subscribe((following) => {
      this.isFollowing = following.some((u: any) => u.id === userId);
    });
  }

  follow(): void {
    this.followService.followUser(this.currentUserId, this.user.id).subscribe({
      next: () => {
        this.isFollowing = true;
        this.user.followersCount += 1;
      },
      error: (err) => console.error('Failed to follow user', err),
    });
  }

  unfollow(): void {
    this.followService.unfollowUser(this.currentUserId, this.user.id).subscribe({
      next: () => {
        this.isFollowing = false;
        this.user.followersCount -= 1;
      },
      error: (err) => console.error('Failed to unfollow user', err),
    });
  }
}
