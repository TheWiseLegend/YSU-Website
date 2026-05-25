import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';
import {
  CreateCategoryDto,
  CreateVendorDto,
  PublicVendor,
  UpdateCategoryDto,
  UpdateVendorDto,
  Vendor,
  VendorCategory,
} from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Admin: Vendors ──────────────────────────────────────────────────────────

  getAll(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.apiUrl}/admin/vendors`, {
      headers: this.getHeaders(),
    });
  }

  create(dto: CreateVendorDto): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.apiUrl}/admin/vendors`, dto, {
      headers: this.getHeaders(),
    });
  }

  update(id: string, dto: UpdateVendorDto): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.apiUrl}/admin/vendors/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deactivate(id: string): Observable<Vendor> {
    return this.http.patch<Vendor>(
      `${this.apiUrl}/admin/vendors/${id}/deactivate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  reactivate(id: string): Observable<Vendor> {
    return this.http.patch<Vendor>(
      `${this.apiUrl}/admin/vendors/${id}/reactivate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/vendors/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // ─── Admin: Categories ───────────────────────────────────────────────────────

  getCategories(): Observable<VendorCategory[]> {
    return this.http.get<VendorCategory[]>(
      `${this.apiUrl}/admin/vendor-categories`,
      { headers: this.getHeaders() }
    );
  }

  createCategory(dto: CreateCategoryDto): Observable<VendorCategory> {
    return this.http.post<VendorCategory>(
      `${this.apiUrl}/admin/vendor-categories`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  updateCategory(id: string, dto: UpdateCategoryDto): Observable<VendorCategory> {
    return this.http.patch<VendorCategory>(
      `${this.apiUrl}/admin/vendor-categories/${id}`,
      dto,
      { headers: this.getHeaders() }
    );
  }

  deactivateCategory(id: string): Observable<VendorCategory> {
    return this.http.patch<VendorCategory>(
      `${this.apiUrl}/admin/vendor-categories/${id}/deactivate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  reactivateCategory(id: string): Observable<VendorCategory> {
    return this.http.patch<VendorCategory>(
      `${this.apiUrl}/admin/vendor-categories/${id}/reactivate`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/vendor-categories/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // ─── Public ──────────────────────────────────────────────────────────────────

  getActiveVendors(): Observable<PublicVendor[]> {
    return this.http.get<PublicVendor[]>(`${this.apiUrl}/vendors/public`);
  }
}
