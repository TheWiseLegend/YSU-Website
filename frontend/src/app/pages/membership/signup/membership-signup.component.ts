import { Component, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('profileInput') profileInput!: ElementRef<HTMLInputElement>;

  fullNameAr = '';
  fullNameEn = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  dataAgreement = false;

  // Profile image
  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router,
  ) {}

  private setError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      document.querySelector('.error-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.setError('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP');
      input.value = '';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.setError('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
      input.value = '';
      return;
    }

    this.profileImageFile = file;
    this.errorMessage = '';

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
    // Reset the file input so the same file can be re-selected
    if (this.profileInput) {
      this.profileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Empty fields
    if (
      !this.fullNameAr ||
      !this.fullNameEn ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.setError('يرجى ملء جميع الحقول');
      return;
    }

    // Profile image required
    if (!this.profileImageFile) {
      this.setError('الصورة الشخصية مطلوبة');
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.setError('صيغة البريد الإلكتروني غير صحيحة');
      return;
    }

    // Password strength: min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.setError(
        'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
      );
      return;
    }

    // Password match
    if (this.password !== this.confirmPassword) {
      this.setError('كلمتا المرور غير متطابقتين');
      return;
    }

    // Name: only Arabic letters allowed in Arabic name field
    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (!arabicRegex.test(this.fullNameAr.trim())) {
      this.setError('الاسم بالعربية يجب أن يحتوي على حروف عربية فقط');
      return;
    }

    // Name: only English letters allowed in English name field
    const englishRegex = /^[a-zA-Z\s]+$/;
    if (!englishRegex.test(this.fullNameEn.trim())) {
      this.setError(
        'الاسم بالإنجليزية يجب أن يحتوي على حروف إنجليزية فقط',
      );
      return;
    }

    // Agreement checkbox
    if (!this.dataAgreement) {
      this.setError('يجب الموافقة على إقرار صحة البيانات');
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
        next: () => this.router.navigate(['/membership/dashboard']),
        error: (err) => {
          this.setError(err);
          this.isLoading = false;
        },
      });
  }
}
