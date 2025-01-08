import { Component, OnInit } from '@angular/core';
import { TrendService } from '../../services/trend.service';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.css'],
})
export class TrendsComponent implements OnInit {
  totalPosts: number = 0;
  postsLastMonth: number = 0;
  topPostsThisWeek: any[] = [];
  topPostsAllTime: any[] = [];
  topUsersByLikes: any[] = [];

  constructor(private trendService: TrendService) {}

  ngOnInit(): void {
    this.loadTrends();
  }

  loadTrends(): void {
    this.trendService.getNetworkTrends().subscribe({
      next: (data) => {
        this.totalPosts = data.totalPosts;
        this.postsLastMonth = data.postsLastMonth;
        this.topPostsThisWeek = data.topPostsLastWeek; // prilagodjeno polje sa backend podacima
        this.topPostsAllTime = data.topPostsAllTime;
        this.topUsersByLikes = data.topUsersLastWeek;
      },
      error: (err) => {
        console.error('Failed to load trends data', err);
      }
    });
  }
}
