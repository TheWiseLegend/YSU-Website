import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationExtras } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideDynamicIcon,
  LucideIcon,
} from '@lucide/angular';
import { MemberAuthService } from '../../../services/member-auth.service';

@Component({
  selector: 'app-membership-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideDynamicIcon],
  templateUrl: './membership-login.component.html',
  styleUrls: ['./membership-login.component.scss'],
})
export class MembershipLoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  readonly eyeIcon: LucideIcon = LucideEye;
  readonly eyeOffIcon: LucideIcon = LucideEyeOff;

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.memberAuthService.isLoggedIn()) {
      this.router.navigate(['/membership/dashboard']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'يرجى ملء جميع الحقول';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService
      .login(this.email, this.password, this.rememberMe)
      .subscribe({
        next: () => this.router.navigate(['/membership/dashboard']),
        error: (err) => {
          if (err === 'email_not_verified') {
            this.memberAuthService.resendOtp(this.email).subscribe({
              next: () => {
                const extras: NavigationExtras = {
                  state: { pendingEmail: this.email, showOtp: true },
                };
                this.router.navigate(['/membership/signup'], extras);
              },
              error: () => {
                this.errorMessage =
                  'حدث خطأ أثناء إرسال رمز التحقق. حاول مرة أخرى.';
              },
            });
          } else {
            this.errorMessage = err;
          }
          this.isLoading = false;
        },
      });
  }
}
