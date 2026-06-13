// src/app/admin/admin-login/admin-login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  private previousTheme: 'dark' | 'light' = 'dark';

  constructor(
    private formBuilder: FormBuilder,
    private adminAuthService: AdminAuthService,
    private router: Router,
    private themeService: ThemeService,
  ) {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.previousTheme = this.themeService.theme();
    this.themeService.setTheme('light');
  }

  ngOnDestroy(): void {
    this.themeService.setTheme(this.previousTheme);
  }

  login(): void {
    if (this.loginForm.valid && !this.isSubmitting) {
      const password = this.loginForm.get('password')?.value;
      this.isSubmitting = true;
      this.errorMessage = '';

      this.adminAuthService.login(password).subscribe({
        next: () => {
          this.router.navigate(['/admin-panel']);
        },
        error: (error: string) => {
          this.errorMessage = error;
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}