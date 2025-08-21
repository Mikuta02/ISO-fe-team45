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

  @Input({ transform: booleanAttribute }) isNewPost: boolean = false;
  @Input() initialLatitude: number = 45.2671;   // Novi Sad
  @Input() initialLongitude: number = 19.8335;  // Novi Sad
  @Output() locationSelected = new EventEmitter<{ latitude: number; longitude: number }>();
  @Output() coordinatesChange = new EventEmitter<{ latitude: number; longitude: number }>();

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.initializeMap();

    if (this.isNewPost) {
      // Klik na mapu za novu objavu
      this.map?.on('click', (e: L.LeafletMouseEvent) => {
        const latitude = e.latlng.lat;
        const longitude = e.latlng.lng;
        this.locationSelected.emit({ latitude, longitude });

        if (this.map) {
          L.marker([latitude, longitude]).addTo(this.map)
            .bindPopup('Selected Location')
            .openPopup();
        }
      });

      // Draggable marker za fino podešavanje
      const marker = L.marker([this.initialLatitude, this.initialLongitude], { draggable: true }).addTo(this.map!);
      marker.on('dragend', (event: L.LeafletEvent) => {
        const latLng = (event.target as L.Marker).getLatLng();
        this.coordinatesChange.emit({ latitude: latLng.lat, longitude: latLng.lng });
      });

      // Početne koordinate
      this.coordinatesChange.emit({ latitude: this.initialLatitude, longitude: this.initialLongitude });
    } else {
      // Obližnje objave (3.12)
      this.getNearbyPosts();
    }
  }

  private initializeMap(): void {
    this.map = L.map('map', {
      center: [this.initialLatitude, this.initialLongitude],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private getNearbyPosts(): void {
    // Ako ima smisla, možete proslediti i koordinate korisnika i radius
    this.postService.getNearbyPosts().subscribe({
      next: (data: any[]) => {
        this.posts = data || [];
        this.addMarkersToMap();
      },
      error: (err: any) => {
        console.error('Error fetching nearby posts', err);
      }
    });
  }

  private addMarkersToMap(): void {
    if (this.map && this.posts.length > 0) {
      this.posts.forEach((post: any) => {
        const marker = L.marker([post.locationLatitude, post.locationLongitude]);
        marker.addTo(this.map!)
          .bindPopup(`<b>Post</b><br>${post.description}`)
          .openPopup();
      });
    }
  }
}
