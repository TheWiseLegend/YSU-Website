// src/app/admin/admin-login/admin-login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required]
    });
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