import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  latitude = 45.2671;
  longitude = 19.8335;
  mapData: any[] = [];
  loading = false;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadMapData(this.latitude, this.longitude);
  }

  onMapClick(evt: { lat: number; lng: number }): void {
    this.latitude = evt.lat;
    this.longitude = evt.lng;
    this.loadMapData(this.latitude, this.longitude);
  }

  private loadMapData(latitude: number, longitude: number): void {
    this.loading = true;
    this.postService.getMapData(latitude, longitude).subscribe({
      next: (data: any[]) => {
        this.mapData = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load map data', err);
        this.loading = false;
      }
    });
  }
}
