import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MemberAuthService } from '../../../services/member-auth.service';

@Component({
  selector: 'app-membership-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './membership-login.component.html',
  styleUrls: ['./membership-login.component.scss']
})
export class MembershipLoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'يرجى ملء جميع الحقول';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.memberAuthService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/membership/dashboard']),
      error: (err) => {
        this.errorMessage = err;
        this.isLoading = false;
      }
    });
  }
}