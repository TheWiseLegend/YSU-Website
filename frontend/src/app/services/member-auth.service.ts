import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface MemberLoginResponse {
  access_token: string;
  token_type: string;
}

export interface PendingVerificationResponse {
  status: 'pending_verification';
  message: string;
}

export type RegisterResponse =
  | MemberLoginResponse
  | PendingVerificationResponse;

export interface RegisterRequest {
  email: string;
  password: string;
  fullNameAr: string;
  fullNameEn: string;
  profileImage?: File | null;
}

@Injectable({
  providedIn: 'root',
})
export class MemberAuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'member_token';

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!(
      localStorage.getItem(this.tokenKey) ??
      sessionStorage.getItem(this.tokenKey)
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('fullNameAr', data.fullNameAr);
    formData.append('fullNameEn', data.fullNameEn);
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/member-auth/register`, formData)
      .pipe(catchError(this.handleError));
    // Note: no tap here — we don't store token on register anymore.
    // Token is only stored after OTP verification succeeds.
  }

  verifyOtp(email: string, otp: string): Observable<MemberLoginResponse> {
    return this.http
      .post<MemberLoginResponse>(`${this.apiUrl}/member-auth/verify-otp`, {
        email,
        otp,
      })
      .pipe(
        tap((response) => {
          localStorage.removeItem('admin_token');
          this.setToken(response.access_token);
        }),
        catchError(this.handleError),
      );
  }

  resendOtp(email: string): Observable<{ message: string }> {    return this.http
      .post<{
        message: string;
      }>(`${this.apiUrl}/member-auth/resend-otp`, { email })
      .pipe(catchError(this.handleError));
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http
      .post<{
        message: string;
      }>(`${this.apiUrl}/member-auth/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  verifyResetCode(
    email: string,
    code: string,
  ): Observable<{ verified: boolean; email: string }> {
    return this.http
      .post<{
        verified: boolean;
        email: string;
      }>(`${this.apiUrl}/member-auth/verify-reset-code`, { email, code })
      .pipe(catchError(this.handleError));
  }

  resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http
      .post<{
        message: string;
      }>(`${this.apiUrl}/member-auth/reset-password`, {
        email,
        code,
        newPassword,
      })
      .pipe(catchError(this.handleError));
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean,
  ): Observable<MemberLoginResponse> {
    return this.http
      .post<MemberLoginResponse>(`${this.apiUrl}/member-auth/login`, {
        email,
        password,
        rememberMe,
      })
      .pipe(
        tap((response) => {
          localStorage.removeItem('admin_token');
          if (rememberMe) {
            localStorage.setItem(this.tokenKey, response.access_token);
          } else {
            sessionStorage.setItem(this.tokenKey, response.access_token);
          }
          this.loggedInSubject.next(true);
        }),
        catchError(this.handleError),
      );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.loggedInSubject.next(true);
  }

  getToken(): string | null {
    return (
      localStorage.getItem(this.tokenKey) ??
      sessionStorage.getItem(this.tokenKey)
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    this.loggedInSubject.next(false);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error.status === 429) {
      errorMessage = 'لقد قمت بعدد كبير من المحاولات، يرجى المحاولة بعد قليل';
    } else if (error.status === 401) {
      if (error.error?.message === 'email_not_verified') {
        errorMessage = 'email_not_verified';
      } else if (error.error?.message === 'رمز التحقق غير صحيح') {
        errorMessage = 'رمز التحقق غير صحيح';
      } else if (error.error?.message === 'رمز إعادة التعيين غير صحيح') {
        errorMessage = 'رمز إعادة التعيين غير صحيح';
      } else {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      }
    } else if (error.status === 409)
      errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
    else if (error.status === 400)
      errorMessage = error.error?.message || 'بيانات غير صحيحة';
    else if (error.status === 0) errorMessage = 'خطأ في الاتصال بالخادم';
    else if (error.error?.message) errorMessage = error.error.message;
    return throwError(() => errorMessage);
  }
}
