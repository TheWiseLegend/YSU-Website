import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MemberAuthService } from '../services/member-auth.service';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthGuard {
  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.memberAuthService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/membership/login']);
    return false;
  }
}