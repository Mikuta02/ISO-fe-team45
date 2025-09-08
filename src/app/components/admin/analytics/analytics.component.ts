import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../services/analytics.service';

type TimePoint = { period: string; posts: number; comments: number; };

@Component({
  selector: 'app-admin-analytics',
  standalone: false,
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  loading = true;
  error: string | null = null;

  weekly: TimePoint[] = [];
  monthly: TimePoint[] = [];
  yearly: TimePoint[] = [];

  totalUsers = 0;
  posters = 0;
  commentersOnly = 0;
  inactive = 0;

  postersPct = 0;
  commentersOnlyPct = 0;
  inactivePct = 0;

  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.analytics.getAnalytics().subscribe({
      next: (data) => {
        this.weekly = data.weekly ?? [];
        this.monthly = data.monthly ?? [];
        this.yearly = data.yearly ?? [];

        const d = data.distribution;
        this.totalUsers = d?.totalUsers ?? 0;
        this.posters = d?.posters ?? 0;
        this.commentersOnly = d?.commentersOnly ?? 0;
        this.inactive = d?.inactive ?? 0;

        this.postersPct = this.round2(d?.postersPercent ?? this.pct(this.posters));
        this.commentersOnlyPct = this.round2(d?.commentersOnlyPercent ?? this.pct(this.commentersOnly));
        this.inactivePct = this.round2(d?.inactivePercent ?? this.pct(this.inactive));

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Greška pri učitavanju analitike.';
        this.loading = false;
      }
    });
  }

  maxValue(arr: TimePoint[], key: 'posts'|'comments'): number {
    return Math.max(1, ...arr.map(x => x[key]));
  }

  barWidth(value: number, max: number): string {
    const w = Math.round((value / Math.max(1, max)) * 100);
    return `${w}%`;
  }

  private pct(value: number): number {
    return this.totalUsers === 0 ? 0 : (value * 100) / this.totalUsers;
  }
  private round2(n: number): number { return Math.round(n * 100) / 100; }

  // za CSS var() u donut grafu
  get donutStyle() {
    const a = this.postersPct;
    const b = a + this.commentersOnlyPct;
    // treća zona do 100% je inactive
    return {
      '--p1': `${a}%`,
      '--p2': `${b}%`
    } as any;
  }
}
