// src/app/services/public-branches.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Branch } from './branches.service';

@Injectable({
  providedIn: 'root'
})
export class PublicBranchesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
  }

  getBranchById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/branches/${id}`);
  }
}