import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TrendService, NetworkTrendsView, PostView, UserLikesView } from '../../services/trend.service';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsComponent implements OnInit {
  trends?: NetworkTrendsView;
  loading = true;
  error?: string;

  constructor(private readonly trendService: TrendService,
              private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = undefined;
    this.trendService.getNetworkTrends().subscribe({
      next: (data) => {
        this.trends = data;
        this.loading = false;
        this.cdr.markForCheck(); // bitno zbog OnPush
      },
      error: (err) => {
        console.error(err);
        this.error = 'Došlo je do greške pri učitavanju trendova. Pokušaj ponovo.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByPost = (_: number, p: PostView) => p.id;
  trackByUser = (_: number, u: UserLikesView) => u.userId;

  prettyDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
