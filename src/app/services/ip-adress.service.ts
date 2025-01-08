import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IpAddressService {
  private apiUrl = 'https://api64.ipify.org?format=json'; // API za dohvat IP adrese

  constructor(private http: HttpClient) {}

  getIpAddress(): Observable<{ ip: string }> {
    return this.http.get<{ ip: string }>(this.apiUrl);
  }
}
