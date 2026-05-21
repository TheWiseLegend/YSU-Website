// src/app/services/public-gallery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Gallery, GalleryImage } from './gallery.service';

@Injectable({
  providedIn: 'root'
})
export class PublicGalleryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllAlbums(): Observable<Gallery[]> {
    return this.http.get<Gallery[]>(`${this.apiUrl}/gallery`);
  }

  getAlbumById(id: string): Observable<Gallery> {
    return this.http.get<Gallery>(`${this.apiUrl}/gallery/${id}`);
  }
}