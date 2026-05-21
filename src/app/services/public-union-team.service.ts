// src/app/services/public-union-team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface UnionTeamMember {
  id: string;
  name: string;
  position: string;
  type: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  period: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicUnionTeamService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllMembers(): Observable<UnionTeamMember[]> {
    return this.http.get<UnionTeamMember[]>(`${this.apiUrl}/union-team`);
  }

  getAllPeriods(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/union-team/periods`);
  }
  
  getMembersByPeriod(period: string): Observable<UnionTeamMember[]> {
    return this.http.get<UnionTeamMember[]>(`${this.apiUrl}/union-team/period/${period}`);
  }
  
  getCurrentPeriod(): Observable<{ currentPeriod: string }> {
    return this.http.get<{ currentPeriod: string }>(`${this.apiUrl}/union-team/current-period`);
  }
}