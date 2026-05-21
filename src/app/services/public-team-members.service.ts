// src/app/services/public-team-members.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { TeamMember } from './team-members.service';

@Injectable({
  providedIn: 'root'
})
export class PublicTeamMembersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTeamMembersByBranchId(branchId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/branches/${branchId}/team-members`);
  }
}