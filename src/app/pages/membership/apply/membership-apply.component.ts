import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MembershipService } from '../../../services/membership.service';

@Component({
  selector: 'app-membership-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './membership-apply.component.html',
  styleUrls: ['./membership-apply.component.scss']
})
export class MembershipApplyComponent implements OnInit {
  isLoading = false;
  isSubmitted = false;
  errorMessage = '';

  // Form fields
  passportNumber = '';
  phone = '';
  gender = '';
  address = '';
  university = '';
  studentId = '';
  fieldOfStudy = '';
  yearOfStudy: number | null = null;
  graduationYear: number | null = null;
  enrollmentLetterFile: File | null = null;
  receiptFile: File | null = null;

  enrollmentLetterPreview = '';
  receiptPreview = '';

  universities = [
    'Universiti Malaya (UM)',
    'Universiti Putra Malaysia (UPM)',
    'Universiti Kebangsaan Malaysia (UKM)',
    'Universiti Teknologi Malaysia (UTM)',
    'Universiti Sains Malaysia (USM)',
    'Universiti Islam Antarabangsa Malaysia (UIAM/IIUM)',
    'Universiti Teknologi MARA (UiTM)',
    'Universiti Multimedia (MMU)',
    'Universiti Tenaga Nasional (UNITEN)',
    'Universiti Cyberjaya (UC)',
    'Asia Pacific University (APU)',
    'Taylor\'s University',
    'Sunway University',
    'INTI International University',
    'Limkokwing University',
    'Management and Science University (MSU)',
    'Universiti Tun Hussein Onn Malaysia (UTHM)',
    'Universiti Malaysia Perlis (UniMAP)',
    'Universiti Malaysia Sabah (UMS)',
    'Universiti Malaysia Sarawak (UNIMAS)',
    'Universiti Sultan Zainal Abidin (UniSZA)',
    'Universiti Malaysia Pahang (UMP)',
    'Universiti Malaysia Terengganu (UMT)',
    'Universiti Malaysia Kelantan (UMK)',
    'MAHSA University',
    'Lincoln University College',
    'UCSI University',
    'SEGi University',
    'Binary University',
    'Other',
  ];

  years = [1, 2, 3, 4, 5, 6];
  currentYear = new Date().getFullYear();
  graduationYears = Array.from({ length: 8 }, (_, i) => this.currentYear + i);

  constructor(
    private membershipService: MembershipService,
    private router: Router
  ) {}

    ngOnInit(): void {
    this.membershipService.getMe().subscribe({
        next: (member) => {
        const latest = member.applications?.[0];
        if (latest && (latest.status === 'active' || latest.status === 'pending')) {
            this.router.navigate(['/membership/dashboard']);
        }
        },
        error: () => this.router.navigate(['/membership/login'])
    });
    }

  onFileChange(event: Event, field: 'enrollmentLetter' | 'receipt'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (field === 'enrollmentLetter') {
      this.enrollmentLetterFile = file;
      this.enrollmentLetterPreview = file.name;
    } else {
      this.receiptFile = file;
      this.receiptPreview = file.name;
    }
  }

  onSubmit(): void {
    if (!this.passportNumber || !this.phone || !this.gender || !this.address ||
        !this.university || !this.studentId || !this.fieldOfStudy ||
        !this.yearOfStudy || !this.graduationYear ||
        !this.enrollmentLetterFile || !this.receiptFile) {
      this.errorMessage = 'يرجى ملء جميع الحقول وتحميل الملفات المطلوبة';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.membershipService.apply({
      passportNumber: this.passportNumber,
      phone: this.phone,
      gender: this.gender,
      address: this.address,
      university: this.university,
      studentId: this.studentId,
      fieldOfStudy: this.fieldOfStudy,
      yearOfStudy: this.yearOfStudy!,
      graduationYear: this.graduationYear!,
      enrollmentLetter: this.enrollmentLetterFile!,
      receipt: this.receiptFile!,
    }).subscribe({
      next: () => {
        this.isSubmitted = true;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err;
        this.isLoading = false;
      }
    });
  }
}