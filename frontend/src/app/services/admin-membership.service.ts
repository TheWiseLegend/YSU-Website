import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';
import { Member, MembershipApplication } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class AdminMembershipService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAllMembers(status?: string): Observable<Member[]> {
    const url = status
      ? `${this.apiUrl}/admin/members?status=${status}`
      : `${this.apiUrl}/admin/members`;
    return this.http.get<Member[]>(url, { headers: this.getHeaders() });
  }

  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/admin/members/${id}`, {
      headers: this.getHeaders(),
    });
  }

  approveApplication(applicationId: string): Observable<MembershipApplication> {
    return this.http.patch<MembershipApplication>(
      `${this.apiUrl}/admin/members/${applicationId}/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }
  cancelApplication(applicationId: string, reason: string): Observable<MembershipApplication> {
    return this.http.patch<MembershipApplication>(
        `${this.apiUrl}/admin/members/${applicationId}/cancel`,
        { reason },
        { headers: this.getHeaders() }
    );
  }
}