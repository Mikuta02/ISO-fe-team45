import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user: any;
  isFollowing = false;
  currentUserId = 0;

  posts: any[] = [];
  followers: any[] = [];
  following: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: FollowService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Ulogovani korisnik (da znamo ko prati)
    this.userService.getUserProfile().subscribe({
      next: (me) => {
        this.currentUserId = me.id;
        // Targe­t korisnik
        this.userService.getUserById(id).subscribe({
          next: (u) => {
            this.user = u;

            // Followers/following i postovi
            this.userService.getFollowers(id).subscribe({
              next: (list) => {
                this.followers = list;
                this.isFollowing = !!this.followers.find((x: any) => x.id === this.currentUserId);
              },
            });

            this.userService.getFollowing(id).subscribe({
              next: (list) => (this.following = list),
            });

            this.postService.getPostsByUser(id).subscribe({
              next: (list) => (this.posts = list),
            });
          },
        });
      },
    });
  }

  follow(): void {
    this.followService.followUser(this.currentUserId, this.user.id).subscribe({
      next: () => {
        this.isFollowing = true;
        this.user.followersCount = (this.user.followersCount ?? 0) + 1;
      },
      error: (err) => console.error('Failed to follow user', err),
    });
  }

  unfollow(): void {
    this.followService.unfollowUser(this.currentUserId, this.user.id).subscribe({
      next: () => {
        this.isFollowing = false;
        this.user.followersCount = Math.max(0, (this.user.followersCount ?? 1) - 1);
      },
      error: (err) => console.error('Failed to unfollow user', err),
    });
  }
}
