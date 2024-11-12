import { booleanAttribute, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-map-posts',
  templateUrl: './map-posts.component.html',
  styleUrls: ['./map-posts.component.css']
})
export class MapPostsComponent implements OnInit {
  private map: L.Map | undefined;
  posts: any[] = [];
  @Input({transform: booleanAttribute}) isNewPost: boolean = false;

  @Output() locationSelected = new EventEmitter<{ latitude: number, longitude: number }>();

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.initializeMap();
    if (this.isNewPost) {
      this.map?.on('click', (e: L.LeafletMouseEvent) => {
        const latitude = e.latlng.lat;
        const longitude = e.latlng.lng;

        // Emitujemo izabrane koordinate
        this.locationSelected.emit({ latitude, longitude });

        // Dodajemo marker na izabrano mesto na mapi
        if (this.map) {
          L.marker([latitude, longitude]).addTo(this.map)
            .bindPopup('Selected Location')
            .openPopup();
        }
      });
    } else {
      this.getNearbyPosts();
    }
  }

  private initializeMap(): void {
    // Kreiramo mapu i postavljamo početni fokus
    this.map = L.map('map', {
      center: [45.2671, 19.8335], // Primer koordinata (Novi Sad, Srbija)
      zoom: 13
    });

    // Dodajemo osnovni sloj mape (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private getNearbyPosts(): void {
    this.postService.getNearbyPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.addMarkersToMap();
      },
      error: (err) => {
        console.error('Error fetching nearby posts', err);
      }
    });
  }

  private addMarkersToMap(): void {
    if (this.map && this.posts.length > 0) {
      this.posts.forEach((post) => {
        const marker = L.marker([post.locationLatitude, post.locationLongitude]);
        marker.addTo(this.map!)
          .bindPopup(`<b>${post.title}</b><br>${post.description}`)
          .openPopup();
      });
    }
  }
}
