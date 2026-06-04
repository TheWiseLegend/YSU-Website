import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideDynamicIcon,
  LucideIcon,
} from '@lucide/angular';
import { MemberAuthService } from '../../../services/member-auth.service';

@Component({
  selector: 'app-membership-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideDynamicIcon],
  templateUrl: './membership-forgot-password.component.html',
  styleUrls: ['./membership-forgot-password.component.scss'],
})
export class MembershipForgotPasswordComponent implements OnDestroy {
  screen: 'request' | 'verify' | 'reset' = 'request';

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  readonly eyeIcon: LucideIcon = LucideEye;
  readonly eyeOffIcon: LucideIcon = LucideEyeOff;

  resendCooldown = 0;
  private resendInterval: any = null;

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router,
  ) {}

  private setError(msg: string): void {
    this.errorMessage = msg;
  }

  // ─── Screen 1: request reset ──────────────────────────────
  onRequestSubmit(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.setError('صيغة البريد الإلكتروني غير صحيحة');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '';
        this.screen = 'verify';
        this.startResendCooldown();
      },
      error: (err) => {
        this.setError(err);
        this.isLoading = false;
      },
    });
  }

  // ─── Screen 2: verify code ────────────────────────────────
  onVerifySubmit(): void {
    if (!this.code || this.code.length !== 6) {
      this.setError('يرجى إدخال الرمز المكون من 6 أرقام');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService.verifyResetCode(this.email, this.code).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '';
        this.screen = 'reset';
      },
      error: (err) => {
        this.setError(err);
        this.isLoading = false;
      },
    });
  }

  onResend(): void {
    if (this.resendCooldown > 0) return;

    this.memberAuthService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.successMessage = 'تم إرسال رمز جديد إلى بريدك الإلكتروني';
        this.errorMessage = '';
        this.startResendCooldown();
      },
      error: (err) => {
        this.setError(err);
      },
    });
  }

  // ─── Screen 3: new password ───────────────────────────────
  onResetSubmit(): void {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.setError(
        'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
      );
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.setError('كلمتا المرور غير متطابقتين');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService
      .resetPassword(this.email, this.code, this.newPassword)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage =
            'تم تغيير كلمة المرور بنجاح. سيتم تحويلك لتسجيل الدخول...';
          setTimeout(() => {
            this.router.navigate(['/membership/login']);
          }, 2000);
        },
        error: (err) => {
          this.setError(err);
          this.isLoading = false;
        },
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60;
    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
        this.resendInterval = null;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.resendInterval) clearInterval(this.resendInterval);
  }
}
