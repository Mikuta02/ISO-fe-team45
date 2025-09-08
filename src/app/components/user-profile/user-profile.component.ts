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
  profileUserId = 0;

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
    this.profileUserId = id;
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
}
