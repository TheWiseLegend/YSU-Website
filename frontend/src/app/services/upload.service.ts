// src/app/services/upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService
  ) {}
  
  uploadImage(file: File, folderType?: string): Observable<{imageUrl: string}> {
    const formData = new FormData();
    formData.append('files', file);
    
    // Add folder type for organization
    if (folderType) {
      formData.append('path', folderType);
    }
    
    // Add authorization header
    const token = this.adminAuthService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<{imageUrl: string}>(
      `${this.apiUrl}/upload/image`, 
      formData,
      { headers }
    );
  }

  uploadMultipleImages(files: File[], folderType?: string): Observable<{imageUrls: string[]}> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add folder type for organization
    if (folderType) {
      formData.append('path', folderType);
    }
    
    // Add authorization header
    const token = this.adminAuthService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<{imageUrls: string[]}>(
      `${this.apiUrl}/upload/images`, 
      formData,
      { headers }
    );
  }

  deleteImage(imageUrl: string): Observable<{message: string}> {
    const token = this.adminAuthService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.delete<{message: string}>(
      `${this.apiUrl}/upload/image`,
      { headers, body: { imageUrl } }
    );
  }

  replaceImage(oldImageUrl: string, newFile: File): Observable<{imageUrl: string}> {
    const formData = new FormData();
    formData.append('files', newFile);
    formData.append('oldImageUrl', oldImageUrl);
    
    const token = this.adminAuthService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<{imageUrl: string}>(
      `${this.apiUrl}/upload/image/replace`, 
      formData,
      { headers }
    );
  }
}