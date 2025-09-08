import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CareLocation {
  name: string;
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class RabbitCareService {
  private apiUrl = 'http://localhost:8080/api/rabbit-care';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CareLocation[]> {
    return this.http.get<CareLocation[]>(`${this.apiUrl}/locations`);
  }

  getNearby(lat: number, lng: number, radiusKm = 10): Observable<CareLocation[]> {
    const params = new HttpParams()
      .set('lat', String(lat))
      .set('lng', String(lng))
      .set('radiusKm', String(radiusKm));
    return this.http.get<CareLocation[]>(`${this.apiUrl}/nearby`, { params });
  }
}
