// src/app/components/token-expiry-warning/token-expiry-warning.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-token-expiry-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="token-expiry-warning" *ngIf="showWarning">
      <div class="warning-content">
        <span class="warning-icon">⚠️</span>
        <span class="warning-message">ستنتهي صلاحية جلستك بعد {{ getFormattedTime(remainingTime) }}. هل تريد تمديد الجلسة؟</span>
        <div class="warning-actions">
          <button class="extend-btn" (click)="renewToken()">تمديد الجلسة</button>
          <button class="logout-btn" (click)="logout()">تسجيل الخروج</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .token-expiry-warning {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #fef3c7;
      border-bottom: 1px solid #fcd34d;
      padding: 1rem;
      z-index: 1000;
      direction: rtl;
      
      .warning-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .warning-icon {
          font-size: 1.5rem;
        }
        
        .warning-message {
          flex: 1;
          color: #92400e;
          font-weight: 500;
        }
        
        .warning-actions {
          display: flex;
          gap: 0.5rem;
          
          button {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            
            &.extend-btn {
              background-color: #3b82f6;
              color: white;
              
              &:hover {
                background-color: #2563eb;
              }
            }
            
            &.logout-btn {
              background-color: #9ca3af;
              color: white;
              
              &:hover {
                background-color: #6b7280;
              }
            }
          }
        }
      }
    }
  `]
})
export class TokenExpiryWarningComponent implements OnInit, OnDestroy {
  showWarning = false;
  remainingTime = 0;
  private subscription: Subscription = new Subscription();
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; 

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check token expiry every minute
    this.subscription.add(
      interval(60000).subscribe(() => {
        this.checkTokenExpiry();
      })
    );
    
    // Initial check
    this.checkTokenExpiry();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkTokenExpiry(): void {
    const timeLeft = this.adminAuthService.getRemainingTime();
    
    if (timeLeft !== null && timeLeft > 0) {
      this.remainingTime = timeLeft;
      this.showWarning = timeLeft < this.WARNING_THRESHOLD;
    } else {
      this.showWarning = false;
    }
  }

  renewToken(): void {
    alert('الرجاء تسجيل الدخول مرة أخرى');
    this.logout();
  }

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf']);
  }

  getFormattedTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}