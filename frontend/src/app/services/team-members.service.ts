// src/app/services/team-members.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  type: string;
  imageUrl: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberDto {
  name: string;
  position: string;
  type: string;
  imageUrl: string;
  branchId: string;
}

export interface UpdateTeamMemberDto {
  name?: string;
  position?: string;
  type?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamMembersService {
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

  getTeamMembersByBranchId(branchId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(
      `${this.apiUrl}/branches/${branchId}/team-members`, 
      { headers: this.getHeaders() }
    );
  }

  getTeamMemberById(id: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(
      `${this.apiUrl}/team-members/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  createTeamMember(member: CreateTeamMemberDto): Observable<TeamMember> {
    return this.http.post<TeamMember>(
      `${this.apiUrl}/branches/${member.branchId}/team-members`, 
      member, 
      { headers: this.getHeaders() }
    );
  }

  updateTeamMember(id: string, member: UpdateTeamMemberDto): Observable<TeamMember> {
    return this.http.put<TeamMember>(
      `${this.apiUrl}/team-members/${id}`, 
      member, 
      { headers: this.getHeaders() }
    );
  }

  deleteTeamMember(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/team-members/${id}`, 
      { headers: this.getHeaders() }
    );
  }
}