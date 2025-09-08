import {
  booleanAttribute, Component, Input, Output, EventEmitter,
  AfterViewInit, ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import * as L from 'leaflet';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-map-posts',
  templateUrl: './map-posts.component.html',
  styleUrls: ['./map-posts.component.css']
})
export class MapPostsComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private resizeObs?: ResizeObserver;
  posts: any[] = [];

  @Input({ transform: booleanAttribute }) isNewPost = false;
  @Input() initialLatitude = 45.2671;
  @Input() initialLongitude = 19.8335;
  @Output() locationSelected = new EventEmitter<{ latitude: number; longitude: number }>();
  @Output() coordinatesChange = new EventEmitter<{ latitude: number; longitude: number }>();

  // VAŽNO: bez static:true (ako je #ref u *ngIf, static:true zezne timing)
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  constructor(private postService: PostService) {}

  ngAfterViewInit(): void {
    // Sačekaj da layout izmeri dimenzije (ako je u tabu ili conditional render)
    requestAnimationFrame(() => {
      this.safeInitMap();
    });
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
    this.map?.remove();
  }

  private safeInitMap(): void {
    const el = this.mapContainer?.nativeElement;
    if (!el) return;

    // Ako je element još uvek 0x0 (sakriven), poveži ResizeObserver i inicijalizuj kad postane vidljiv
    const tryInit = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        this.initializeMap();
        this.afterMapInit();
        this.resizeObs?.disconnect();
      }
    };

    console.log('mapContainer?', !!this.mapContainer, this.mapContainer?.nativeElement);
    console.log('size', this.mapContainer?.nativeElement?.clientWidth, this.mapContainer?.nativeElement?.clientHeight);


    if (el.clientWidth === 0 || el.clientHeight === 0) {
      this.resizeObs = new ResizeObserver(() => {
        tryInit();
        // održavaj i invalidateSize kad se menja layout
        this.map?.invalidateSize();
      });
      this.resizeObs.observe(el);
    } else {
      this.initializeMap();
      this.afterMapInit();
    }
  }

  private initializeMap(): void {
    // default ikonice iz assets/leaflet/
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png'
    });

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.initialLatitude, this.initialLongitude],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Ako je bilo sakriveno, pogodi dimenzije posle rendera
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private afterMapInit(): void {
    if (!this.map) return;

    if (this.isNewPost) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.locationSelected.emit({ latitude: lat, longitude: lng });
        L.marker([lat, lng]).addTo(this.map!).bindPopup('Selected Location').openPopup();
      });

      const marker = L.marker([this.initialLatitude, this.initialLongitude], { draggable: true }).addTo(this.map);
      marker.on('dragend', (event: L.LeafletEvent) => {
        const latLng = (event.target as L.Marker).getLatLng();
        this.coordinatesChange.emit({ latitude: latLng.lat, longitude: latLng.lng });
      });

      this.coordinatesChange.emit({ latitude: this.initialLatitude, longitude: this.initialLongitude });
    } else {
      this.getNearbyPosts();
    }
  }

  private getNearbyPosts(): void {
    this.postService.getNearbyPosts(this.initialLatitude, this.initialLongitude, 20).subscribe({
      next: (data: any[]) => {
        this.posts = data || [];
        this.addMarkersToMap();
      },
      error: (err) => console.error('Error fetching nearby posts', err)
    });
  }

  private addMarkersToMap(): void {
    if (!this.map || this.posts.length === 0) return;

    this.posts.forEach((post: any, i: number) => {
      const m = L.marker([post.locationLatitude, post.locationLongitude]).addTo(this.map!);
      m.bindPopup(`<b>Post</b><br>${post.description ?? ''}`);
      if (i === 0) m.openPopup();
    });

    // opcionalno: fit to bounds
    const group = L.featureGroup(this.posts.map(p => L.marker([p.locationLatitude, p.locationLongitude])));
    if (this.posts.length > 0) {
      this.map.fitBounds(group.getBounds().pad(0.2));
      setTimeout(() => this.map?.invalidateSize(), 0);
    }
  }
}
