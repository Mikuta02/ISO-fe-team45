import { Component, Input, OnInit, signal } from '@angular/core';
import {FollowService, FollowStatus} from '../../services/follow.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  templateUrl: './follow-button.component.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./follow-button.component.css']
})
export class FollowButtonComponent implements OnInit {
  @Input({ required: true }) targetUserId!: number;

  loading = signal(false);
  status = signal<FollowStatus | null>(null);
  error = signal<string | null>(null);

  constructor(private api: FollowService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.api.status(this.targetUserId).subscribe({
      next: s => { this.status.set(s); this.loading.set(false); },
      error: e => { this.error.set(e?.error || 'Greška'); this.loading.set(false); }
    });
  }

  toggle() {
    if (!this.status()) return;
    this.loading.set(true);
    const call = this.status()!.following
      ? this.api.unfollow(this.targetUserId)
      : this.api.follow(this.targetUserId);

    call.subscribe({
      next: s => { this.status.set(s); this.loading.set(false); },
      error: e => {
        const msg = (e.status === 429)
          ? (e.error || 'Prekoračen limit: 50 praćenja/min.')
          : (e?.error || 'Greška');
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}
