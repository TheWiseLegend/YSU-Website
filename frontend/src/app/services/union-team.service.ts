// src/app/services/union-team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators'; // Add map to imports
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';
import { UploadService } from './upload.service'; // Add this import
import { UnionTeamMember } from './public-union-team.service';

export interface CreateUnionTeamMemberDto {
  name: string;
  position: string;
  type: string;
  imageUrl: string;
  period: string;
}

export interface UpdateUnionTeamMemberDto {
  name?: string;
  position?: string;
  type?: string;
  imageUrl?: string;
  period: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnionTeamService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService,
    private uploadService: UploadService 
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllMembers(): Observable<UnionTeamMember[]> {
    return this.http.get<UnionTeamMember[]>(`${this.apiUrl}/union-team`, { headers: this.getHeaders() });
  }

  getMemberById(id: string): Observable<UnionTeamMember> {
    return this.http.get<UnionTeamMember>(`${this.apiUrl}/union-team/${id}`, { headers: this.getHeaders() });
  }

  createMember(member: CreateUnionTeamMemberDto): Observable<UnionTeamMember> {
    return this.http.post<UnionTeamMember>(`${this.apiUrl}/union-team`, member, { headers: this.getHeaders() });
  }

  updateMember(id: string, member: UpdateUnionTeamMemberDto): Observable<UnionTeamMember> {
    return this.http.put<UnionTeamMember>(`${this.apiUrl}/union-team/${id}`, member, { headers: this.getHeaders() });
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/union-team/${id}`, { headers: this.getHeaders() });
  }

  getAllPeriods(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/union-team/periods`, { headers: this.getHeaders() });
  }
  
  getMembersByPeriod(period: string): Observable<UnionTeamMember[]> {
    return this.http.get<UnionTeamMember[]>(`${this.apiUrl}/union-team/period/${period}`, { headers: this.getHeaders() });
  }
  
  getCurrentPeriod(): Observable<{ currentPeriod: string }> {
    return this.http.get<{ currentPeriod: string }>(`${this.apiUrl}/union-team/current-period`, { headers: this.getHeaders() });
  }

  // Method to delete member and their image
  deleteMemberWithImage(id: string, imageUrl: string): Observable<void> {
    return this.deleteMember(id).pipe(
      switchMap(() => this.uploadService.deleteImage(imageUrl).pipe(
        map(() => void 0) 
      ))
    );
  }

  // Method to update member and replace image
  updateMemberWithImageReplace(
    id: string, 
    member: UpdateUnionTeamMemberDto, 
    oldImageUrl: string, 
    newFile: File
  ): Observable<UnionTeamMember> {
    // First replace the image
    return this.uploadService.replaceImage(oldImageUrl, newFile).pipe(
      switchMap((uploadResponse) => {
        // Update the member with the new image URL
        const updatedMember = { ...member, imageUrl: uploadResponse.imageUrl };
        return this.updateMember(id, updatedMember);
      })
    );
  }
}