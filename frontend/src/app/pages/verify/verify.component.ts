import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface VerifyResult {
  membershipId: string;
  fullNameAr: string;
  fullNameEn: string;
  status: string;
  isActive: boolean;
  expiresAt: string | null;
  approvedAt: string | null;
}

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  codeInput = '';
  result: VerifyResult | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // If page was opened with a code in the URL (e.g. from QR scan)
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.codeInput = code;
      this.verify();
    }
  }

  verify(): void {
    const code = this.codeInput.trim().toUpperCase();
    if (!code) {
      this.errorMessage = 'يرجى إدخال رمز العضوية';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.result = null;

    this.http.get<VerifyResult>(`${environment.apiUrl}/verify/${code}`).subscribe({
      next: (data) => {
        this.result = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'لم يتم العثور على عضو بهذا الرمز';
        this.isLoading = false;
      }
    });
  }
}
