import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface MemberLoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullNameAr: string;
  fullNameEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberAuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'member_token';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<MemberLoginResponse> {
    return this.http.post<MemberLoginResponse>(`${this.apiUrl}/member-auth/register`, data)
      .pipe(
        tap(response => {
          // Clear any existing admin session before storing member token
          localStorage.removeItem('admin_token');
          this.setToken(response.access_token);
        }),
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<MemberLoginResponse> {
    return this.http.post<MemberLoginResponse>(`${this.apiUrl}/member-auth/login`, { email, password })
      .pipe(
        tap(response => {
          // Clear any existing admin session before storing member token
          localStorage.removeItem('admin_token');
          this.setToken(response.access_token);
        }),
        catchError(this.handleError)
      );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error.status === 401) errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    else if (error.status === 409) errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
    else if (error.status === 0) errorMessage = 'خطأ في الاتصال بالخادم';
    else if (error.error?.message) errorMessage = error.error.message;
    return throwError(() => errorMessage);
  }
}