// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only attach admin token to admin-specific non-login routes
    const isAdminLoginRequest = request.url.includes('/admin-auth/login');
    const isMemberRoute = request.url.includes('/member-auth/');
    const isUploadRoute = request.url.includes('/upload/');
    const isGetRequest = request.method === 'GET';

    // Routes that need the admin token attached
    const needsAdminToken = !isAdminLoginRequest && !isMemberRoute && !isGetRequest || isUploadRoute;

    let tokenAttached = false;
    if (needsAdminToken) {
      const token = this.adminAuthService.getToken();
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        tokenAttached = true;
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only log out on 401 if we actually sent an admin token with this request
        if (error.status === 401 && tokenAttached) {
          this.adminAuthService.logout();
          this.router.navigate(['/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf']);
        }
        return throwError(() => error);
      })
    );
  }
}