import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  // koristimo firstName/lastName u UI; mapiraćemo na API parametre u servisu
  searchParams: {
    firstName?: string;
    lastName?: string;
    email?: string;
    minPosts?: number;
    maxPosts?: number;
    page?: number;
    size?: number;
  } = { page: 0, size: 5 };

  sortBy: 'followingCount' | 'email' = 'email';
  order: 'asc' | 'desc' = 'asc';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.userService.getAllUsers(this.searchParams).subscribe({
      next: (data: any) => {
        this.users = Array.isArray(data) ? data : (data.content ?? []);
      },
      error: (err: any) => console.error('Error fetching users', err)
    });
  }

  sortUsers(sortBy: 'followingCount' | 'email'): void {
    this.sortBy = sortBy;
    this.userService.getAllUsersSorted(this.sortBy, this.order, this.searchParams.page ?? 0, this.searchParams.size ?? 5)
      .subscribe({
        next: (data: any) => {
          this.users = Array.isArray(data) ? data : (data.content ?? []);
        },
        error: (err: any) => console.error('Error sorting users', err)
      });
  }

  toggleOrder(): void {
    this.order = this.order === 'asc' ? 'desc' : 'asc';
    this.sortUsers(this.sortBy);
  }

  nextPage(): void {
    this.searchParams.page = (this.searchParams.page ?? 0) + 1;
    this.getAllUsers();
  }

  prevPage(): void {
    const p = this.searchParams.page ?? 0;
    this.searchParams.page = p > 0 ? p - 1 : 0;
    this.getAllUsers();
  }

  applyFilters(): void {
    this.searchParams.page = 0;
    this.getAllUsers();
  }

  clearFilters(): void {
    this.searchParams = { page: 0, size: 5 };
    this.getAllUsers();
  }
}
