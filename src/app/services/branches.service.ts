import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface Branch {
  id: string;
  universityName: string;
  city: string;
  address: string;
  imageUrl: string;
  phone: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  description: string;
  establishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchDto {
  universityName: string;
  city: string;
  address: string;
  imageUrl: string;
  phone: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  description: string;
  establishedAt: string;
}

export interface UpdateBranchDto {
  universityName?: string;
  city?: string;
  address?: string;
  imageUrl?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  description?: string;
  establishedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BranchesService {
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

  getAllBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`, { headers: this.getHeaders() });
  }

  getBranchById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/branches/${id}`, { headers: this.getHeaders() });
  }

  createBranch(branch: CreateBranchDto): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/branches`, branch, { headers: this.getHeaders() });
  }

  updateBranch(id: string, branch: UpdateBranchDto): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/branches/${id}`, branch, { headers: this.getHeaders() });
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/branches/${id}`, { headers: this.getHeaders() });
  }
}