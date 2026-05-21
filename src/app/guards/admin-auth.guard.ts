// src/app/guards/admin-auth.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard {
  
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.adminAuthService.isLoggedIn()) {
      return true;
    } else {
      // Token is either missing or expired
      this.router.navigate(['/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf']);
      return false;
    }
  }
  
  canActivateChild(): boolean {
    return this.canActivate();
  }
}