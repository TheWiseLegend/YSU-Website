// src/app/admin/admin-panel/admin-panel.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TokenExpiryWarningComponent } from '../../components/token-expiry-warning/token-expiry-warning.component';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TokenExpiryWarningComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent {
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf']);
  }
}