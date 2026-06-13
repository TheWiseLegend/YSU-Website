import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MemberAuthService } from '../../../../services/member-auth.service';
import { ThemeService } from '../../../../services/theme.service';
import { Member } from '../../../../models/member.model';

@Component({
  selector: 'app-membership-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership-header.component.html',
  styleUrls: ['./membership-header.component.scss'],
})
export class MembershipHeaderComponent {
  @Input() member: Member | null = null;
  @Output() changeProfilePhoto = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();

  showSettings = false;

  constructor(
    private memberAuthService: MemberAuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  get memberInitials(): string {
    const parts = (this.member?.fullNameAr ?? '').trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0, 2) ?? '';
  }

  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
  }

  @HostListener('document:click')
  closeSettings(): void {
    this.showSettings = false;
  }

  onChangeProfilePhoto(): void {
    this.showSettings = false;
    this.changeProfilePhoto.emit();
  }

  onChangePassword(): void {
    this.showSettings = false;
    this.changePassword.emit();
  }

  logout(): void {
    this.memberAuthService.logout();
    this.router.navigate(['/membership/login']);
  }
}
