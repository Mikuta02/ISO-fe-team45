import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      }
    });
  }

  updateProfile(): void {
    this.userService.updateUser(this.user).subscribe({
      next: (updatedUser) => {
        console.log('Profile updated', updatedUser);
      },
      error: (err) => {
        console.error('Failed to update user profile', err);
      }
    });
  }
}
