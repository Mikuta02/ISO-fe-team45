import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { PostService } from '../../services/post.service';

type MapResponse = {
  centerLatitude: number;
  centerLongitude: number;
  nearbyPosts: Array<{
    id: number;
    description: string;
    image: string;
    locationLatitude: number;
    locationLongitude: number;
    userId: number;
    likesCount: number;
  }>;
  nearbyLocations: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
};

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: false }) mapEl!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private postsLayer = L.layerGroup();
  private careLayer = L.layerGroup();
  private allLayer = L.featureGroup(); // za fitBounds
  loading = false;

  constructor(private postService: PostService) {}

  ngAfterViewInit(): void {
    // pripremi default ikonice (ako već nemaš globalno)
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png'
    });

    // inicijalizuj mapu
    this.map = L.map(this.mapEl.nativeElement, {
      center: [45.2671, 19.8335],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // dodaj slojeve
    this.postsLayer.addTo(this.map);
    this.careLayer.addTo(this.map);
    this.allLayer.addTo(this.map);

    // učitaj podatke i iscrtaj
    this.loadAndRender();
    setTimeout(() => this.map?.invalidateSize(), 0); // u slučaju layout promene
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private loadAndRender(): void {
    this.loading = true;

    // ako imaš centar od korisnika/profila, prosledi kao parametre
    this.postService.getMapData(45.2671, 19.8335).subscribe({
      next: (resp: MapResponse) => {
        this.loading = false;
        if (!this.map) return;

        // centriraj na serverom vraćen centar
        this.map.setView([resp.centerLatitude, resp.centerLongitude], 13);

        // očisti stare markere
        this.postsLayer.clearLayers();
        this.careLayer.clearLayers();
        this.allLayer.clearLayers();

        // --- POSTS ---
        resp.nearbyPosts?.forEach(p => {
          const marker = L.marker([p.locationLatitude, p.locationLongitude])
            .bindPopup(`
              <div style="max-width:220px">
                <b>Post #${p.id}</b><br/>
                ${p.description ?? ''}<br/>
                <small>Likes: ${p.likesCount}</small><br/>
                <img src="${p.image}" alt="img" style="width:100%;margin-top:6px;border-radius:6px"/>
              </div>
            `);
          marker.addTo(this.postsLayer);
          this.allLayer.addLayer(marker);
        });

        // --- CARE LOCATIONS ---
        const careIcon = L.divIcon({
          className: 'care-pin',
          html: '🐰',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        resp.nearbyLocations?.forEach(l => {
          const m = L.marker([l.latitude, l.longitude], { icon: careIcon })
            .bindPopup(`<b>${l.name}</b>`);
          m.addTo(this.careLayer);
          this.allLayer.addLayer(m);
        });

        // fituj granice (ako ima markera)
        const bounds = this.allLayer.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds.pad(0.2));
        }

        // sigurnosno
        setTimeout(() => this.map?.invalidateSize(), 0);
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load map data', err);
      }
    });
  }
}
