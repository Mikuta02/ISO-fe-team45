import { Component, OnInit } from '@angular/core';
import { UserQueryService } from '../../../services/user-query.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  // filter/sort/pagination state
  searchParams: {
    firstName?: string;
    lastName?: string;
    email?: string;
    minPosts?: number | null;
    maxPosts?: number | null;
    sortBy?: 'followingCount' | 'email';
    order?: 'asc' | 'desc';
    page: number;
    size: number;
  } = {
    page: 0,
    size: 5,
    sortBy: 'email',
    order: 'asc',
    minPosts: null,
    maxPosts: null
  };

  totalElements = 0;
  totalPages = 0;

  constructor(private userService: UserQueryService) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    const params = {
      ...this.searchParams,
      // coerce nulls to undefined so they don't appear in query
      minPosts: this.searchParams.minPosts ?? undefined,
      maxPosts: this.searchParams.maxPosts ?? undefined
    };
    this.userService.getUsersPaged(params).subscribe({
      next: (page: any) => {
        this.users = page?.content ?? [];
        this.totalElements = page?.totalElements ?? 0;
        this.totalPages = page?.totalPages ?? 0;
      },
      error: (err) => console.error('Error fetching users', err)
    });
  }

  sortUsers(sortBy: 'followingCount' | 'email'): void {
    this.searchParams.sortBy = sortBy;
    this.getAllUsers();
  }

  toggleOrder(): void {
    this.searchParams.order = this.searchParams.order === 'asc' ? 'desc' : 'asc';
    this.getAllUsers();
  }

  nextPage(): void {
    if (this.searchParams.page + 1 < this.totalPages) {
      this.searchParams.page += 1;
      this.getAllUsers();
    }
  }

  prevPage(): void {
    if (this.searchParams.page > 0) {
      this.searchParams.page -= 1;
      this.getAllUsers();
    }
  }

  goToPage(p: number): void {
    this.searchParams.page = p > 0 ? p - 1 : 0;
    this.getAllUsers();
  }

  applyFilters(): void {
    this.searchParams.page = 0;
    this.getAllUsers();
  }

  clearFilters(): void {
    this.searchParams = { page: 0, size: 5, sortBy: 'email', order: 'asc', minPosts: null, maxPosts: null };
    this.getAllUsers();
  }
}
