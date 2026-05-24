import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface GalleryImage {
  id: string;
  url: string;
}

export interface Gallery {
  id: string;
  title: string;
  description?: string;
  mainImage: string;
  images: GalleryImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryDto {
  title: string;
  description?: string;
  mainImage: string;
  images: { url: string }[];
}

export interface UpdateGalleryDto {
  title?: string;
  description?: string;
  mainImage?: string;
  images?: { url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllAlbums(): Observable<Gallery[]> {
    return this.http.get<Gallery[]>(`${this.apiUrl}/gallery`, { headers: this.getHeaders() });
  }

  getAlbumById(id: string): Observable<Gallery> {
    return this.http.get<Gallery>(`${this.apiUrl}/gallery/${id}`, { headers: this.getHeaders() });
  }

  createAlbum(album: CreateGalleryDto): Observable<Gallery> {
    return this.http.post<Gallery>(`${this.apiUrl}/gallery`, album, { headers: this.getHeaders() });
  }

  updateAlbum(id: string, album: UpdateGalleryDto): Observable<Gallery> {
    return this.http.put<Gallery>(`${this.apiUrl}/gallery/${id}`, album, { headers: this.getHeaders() });
  }

  deleteAlbum(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/gallery/${id}`, { headers: this.getHeaders() });
  }

  // Additional methods for handling individual images
  addImage(galleryId: string, imageUrl: string): Observable<GalleryImage> {
    return this.http.post<GalleryImage>(
      `${this.apiUrl}/gallery/${galleryId}/images`, 
      { url: imageUrl }, 
      { headers: this.getHeaders() }
    );
  }

  removeImage(imageId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/gallery/images/${imageId}`, 
      { headers: this.getHeaders() }
    );
  }
}