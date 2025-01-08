import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: any;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.initMap();
    this.loadMapData();
  }

  private initMap(): void {
    this.map = L.map('map').setView([44.8, 20.46], 13); // Privremena lokacija dok ne stigne odgovor
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadMapData(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      this.postService.getMapData(latitude, longitude).subscribe({
        next: (data) => {
          // Centriramo mapu na lokaciju iz servera
          this.map.setView([data.centerLatitude, data.centerLongitude], 13);

          // Prikaz objava (ako postoje)
          data.nearbyPosts.forEach((post: any) => {
            L.marker([post.locationLatitude, post.locationLongitude])
              .addTo(this.map)
              .bindPopup(`<b>${post.description}</b><br>Likes: ${post.likesCount}`);
          });

          // Prikaz lokacija za brigu o zečevima
          data.nearbyLocations.forEach((location: any) => {
            L.marker([location.latitude, location.longitude], { icon: this.getCareLocationIcon() })
              .addTo(this.map)
              .bindPopup(`<b>${location.name}</b>`);
          });
        },
        error: (err) => {
          console.error('Failed to load map data', err);
        }
      });
    });
  }

  private getCareLocationIcon(): L.Icon {
    return L.icon({
      iconUrl: 'assets/icons/healthcare.png',
      iconSize: [30, 30]
    });
  }
}
