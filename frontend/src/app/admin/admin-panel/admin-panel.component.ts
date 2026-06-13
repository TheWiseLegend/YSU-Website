// src/app/admin/admin-panel/admin-panel.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TokenExpiryWarningComponent } from '../../components/token-expiry-warning/token-expiry-warning.component';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TokenExpiryWarningComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private previousTheme: 'dark' | 'light' = 'dark';

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    // Save whatever theme the user had, then lock to light
    this.previousTheme = this.themeService.theme();
    this.themeService.setTheme('light');
  }

  ngOnDestroy(): void {
    // Restore user's theme when leaving admin area
    this.themeService.setTheme(this.previousTheme);
  }

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf']);
  }
}