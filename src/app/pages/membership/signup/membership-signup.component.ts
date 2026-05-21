import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MemberAuthService } from '../../../services/member-auth.service';

@Component({
  selector: 'app-membership-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './membership-signup.component.html',
  styleUrls: ['./membership-signup.component.scss']
})
export class MembershipSignupComponent {
  fullNameAr = '';
  fullNameEn = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.fullNameAr || !this.fullNameEn || !this.email || !this.password) {
      this.errorMessage = 'يرجى ملء جميع الحقول';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'كلمتا المرور غير متطابقتين';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService.register({
      email: this.email,
      password: this.password,
      fullNameAr: this.fullNameAr,
      fullNameEn: this.fullNameEn,
    }).subscribe({
      next: () => this.router.navigate(['/membership/dashboard']),
      error: (err) => {
        this.errorMessage = err;
        this.isLoading = false;
      }
    });
  }
}