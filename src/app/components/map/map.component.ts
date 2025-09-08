import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { PostService } from '../../services/post.service';

type MapResponse = {
  centerLatitude: number;
  centerLongitude: number;
  nearbyPosts: Array<{
    id: number;
    description: string;
    locationLatitude: number;
    locationLongitude: number;
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
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;
  private map?: L.Map;
  private resizeObs?: ResizeObserver;
  loading = false;

  constructor(private postService: PostService) {}

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.resizeObs = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObs.observe(this.mapEl.nativeElement);

    // geolokacija (fallback na backend center)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.loadData(pos.coords.latitude, pos.coords.longitude),
        () => this.loadData(),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      this.loadData();
    }
  }

  private loadData(lat?: number, lng?: number) {
    this.loading = true;
    this.postService.getMapData(lat, lng).subscribe({
      next: (data: MapResponse) => {
        this.loading = false;

        const centerLat = lat ?? data.centerLatitude ?? 44.787; // Beograd fallback
        const centerLng = lng ?? data.centerLongitude ?? 20.457;
        this.map!.setView([centerLat, centerLng], 12);

        const postLayer = L.layerGroup().addTo(this.map!);
        const careLayer = L.layerGroup().addTo(this.map!);

        // Objave
        data.nearbyPosts?.forEach((p) => {
          const m = L.marker([p.locationLatitude, p.locationLongitude]);
          m.bindPopup(`<b>Objava</b><br>${p.description ?? ''}`);
          m.addTo(postLayer);
        });

        // Lokacije za zečeve (circle markers)
        data.nearbyLocations?.forEach((loc) => {
          const c = L.circleMarker([loc.latitude, loc.longitude], { radius: 8 });
          c.bindPopup(`<b>${loc.name}</b><br>Usluge za brigu o zečevima`);
          c.addTo(careLayer);
        });

        // Kontrola slojeva
        L.control.layers(undefined, {
          'Objave': postLayer,
          'Lokacije za zečeve': careLayer
        }, { collapsed: false }).addTo(this.map!);

        // Fit bounds
        const bounds = L.latLngBounds([]);
        postLayer.eachLayer(layer => bounds.extend((layer as any).getLatLng?.() ?? (layer as any).getBounds?.()));
        careLayer.eachLayer(layer => bounds.extend((layer as any).getLatLng?.() ?? (layer as any).getBounds?.()));
        if (bounds.isValid()) {
          this.map!.fitBounds(bounds.pad(0.2));
        }

        setTimeout(() => this.map?.invalidateSize(), 0);
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load map data', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
    this.map?.remove();
  }
}
