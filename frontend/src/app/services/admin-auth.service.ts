import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface LoginResponse {
  access_token: string;
}

export interface LoginRequest {
  password: string;
}

interface TokenData {
  token: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'admin_token';
  private readonly TOKEN_EXPIRY_TIME = 60 * 60 * 1000; 

  constructor(private http: HttpClient) {}

  login(password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin-auth/login`, loginData)
      .pipe(
        tap(response => {
          // Clear any existing member session before storing admin token
          localStorage.removeItem('member_token');
          this.setToken(response.access_token);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'خطأ في الاتصال بالخادم';
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'كلمة المرور غير صحيحة';
          break;
        case 404:
          errorMessage = 'الخادم غير متوفر';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم';
          break;
        default:
          errorMessage = `خطأ: ${error.status}`;
      }
    }
    
    return throwError(() => errorMessage);
  }

  setToken(token: string): void {
    const tokenData: TokenData = {
      token: token,
      timestamp: Date.now()
    };
    localStorage.setItem(this.tokenKey, JSON.stringify(tokenData));
  }

  getToken(): string | null {
    const tokenDataString = localStorage.getItem(this.tokenKey);
    if (!tokenDataString) {
      return null;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataString);
      
      // Check if token is expired
      if (this.isTokenExpired(tokenData.timestamp)) {
        this.logout();
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      // Invalid token data format
      this.logout();
      return null;
    }
  }

  private isTokenExpired(timestamp: number): boolean {
    const currentTime = Date.now();
    return currentTime - timestamp > this.TOKEN_EXPIRY_TIME;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getRemainingTime(): number | null {
    const tokenDataString = localStorage.getItem(this.tokenKey);
    if (!tokenDataString) {
      return null;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataString);
      const currentTime = Date.now();
      const remainingTime = this.TOKEN_EXPIRY_TIME - (currentTime - tokenData.timestamp);
      
      return remainingTime > 0 ? remainingTime : null;
    } catch (error) {
      return null;
    }
  }
}