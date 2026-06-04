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
  styleUrls: ['./membership-signup.component.scss'],
})
export class MembershipSignupComponent {
  // Form fields
  email = '';
  password = '';
  confirmPassword = '';
  fullNameAr = '';
  fullNameEn = '';
  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;

  // UI state
  isLoading = false;
  errorMessage = '';

  // OTP state
  showOtpScreen = false;
  pendingEmail = '';
  otpValue = '';
  otpSuccess = '';
  resendCooldown = 0;
  private resendInterval: any = null;

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as {
      pendingEmail?: string;
      showOtp?: boolean;
    };
    if (state?.showOtp && state?.pendingEmail) {
      this.pendingEmail = state.pendingEmail;
      this.showOtpScreen = true;
    }
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.profileImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
  }

  private setError(msg: string): void {
    this.errorMessage = msg;
  }

  onSubmit(): void {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.setError('صيغة البريد الإلكتروني غير صحيحة');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.setError(
        'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
      );
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.setError('كلمتا المرور غير متطابقتين');
      return;
    }

    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (!arabicRegex.test(this.fullNameAr.trim())) {
      this.setError('الاسم بالعربية يجب أن يحتوي على حروف عربية فقط');
      return;
    }

    const englishRegex = /^[a-zA-Z\s]+$/;
    if (!englishRegex.test(this.fullNameEn.trim())) {
      this.setError('الاسم بالإنجليزية يجب أن يحتوي على حروف إنجليزية فقط');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService
      .register({
        email: this.email,
        password: this.password,
        fullNameAr: this.fullNameAr,
        fullNameEn: this.fullNameEn,
        profileImage: this.profileImageFile,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (
            'status' in response &&
            response.status === 'pending_verification'
          ) {
            this.pendingEmail = this.email;
            this.showOtpScreen = true;
            this.errorMessage = '';
          }
        },
        error: (err) => {
          this.setError(err);
          this.isLoading = false;
        },
      });
  }

  onVerifyOtp(): void {
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.errorMessage = 'يرجى إدخال رمز التحقق المكون من 6 أرقام';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.otpSuccess = '';

    this.memberAuthService
      .verifyOtp(this.pendingEmail, this.otpValue)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/membership/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err;
          this.isLoading = false;
        },
      });
  }

  onResendOtp(): void {
    if (this.resendCooldown > 0) return;

    this.memberAuthService.resendOtp(this.pendingEmail).subscribe({
      next: () => {
        this.otpSuccess = 'تم إرسال رمز جديد إلى بريدك الإلكتروني';
        this.errorMessage = '';
        this.startResendCooldown();
      },
      error: (err) => {
        this.errorMessage = err;
      },
    });
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
