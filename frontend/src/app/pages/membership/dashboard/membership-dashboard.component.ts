import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MembershipService } from '../../../services/membership.service';
import { MemberAuthService } from '../../../services/member-auth.service';
import { Member, MembershipApplication } from '../../../models/member.model';
import { DISCOUNTED_PLACES } from '../../../data/discounted-places';
import { DiscountedPlace } from '../../../models/discounted-place.model';
import QRCode from 'qrcode';

@Component({
  selector: 'app-membership-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './membership-dashboard.component.html',
  styleUrls: ['./membership-dashboard.component.scss']
})
export class MembershipDashboardComponent implements OnInit {
  member: Member | null = null;
  isLoading = true;
  errorMessage = '';
  showSettings = false;
  qrCodeDataUrl: string = '';

  // Places
  allPlaces: DiscountedPlace[] = DISCOUNTED_PLACES;
  filteredPlaces: DiscountedPlace[] = [];
  searchQuery = '';
  selectedLocation = '';
  selectedType = '';

  locationOptions = [
    { value: '', label: 'جميع المناطق' },
    { value: 'سايبرجايا', label: 'سايبرجايا' },
    { value: 'سيردانج', label: 'سيردانج' },
    { value: 'كوالالمبور', label: 'كوالالمبور' },
  ];

  typeOptions = [
    { value: '', label: 'جميع الأنواع' },
    { value: 'مطعم', label: '🍽 مطعم' },
    { value: 'بقالة', label: '🛒 بقالة' },
    { value: 'سياحة', label: '🌍 سياحة' },
  ];

  imageErrors: Set<number> = new Set();

  constructor(
    private membershipService: MembershipService,
    private memberAuthService: MemberAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.membershipService.getMe().subscribe({
      next: (member) => {
        this.member = member;
        this.isLoading = false;
        this.applyFilters();
        this.generateQrCode();
      },
      error: () => {
        this.memberAuthService.logout();
        this.router.navigate(['/membership/login']);
      }
    });
  }

  private async generateQrCode(): Promise<void> {
    if (!this.member?.membershipId) return;
    const verifyUrl = `${window.location.origin}/verify/${this.member.membershipId}`;
    this.qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#2E3F6E', light: '#FFFFFF' }
    });
  }

  get latestApplication(): MembershipApplication | null {
    return this.member?.applications?.[0] ?? null;
  }

  get currentStatus(): 'new' | 'pending' | 'active' | 'expired' | 'cancelled' {
    if (!this.latestApplication) return 'new';
    return this.latestApplication.status;
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      new: 'جديد',
      pending: 'قيد المراجعة',
      active: 'نشط',
      expired: 'منتهي',
      cancelled: 'ملغي'
    };
    return map[this.currentStatus] ?? '';
  }

  get statusClass(): string {
    const map: Record<string, string> = {
      new: 'status-new',
      pending: 'status-pending',
      active: 'status-active',
      expired: 'status-expired',
      cancelled: 'status-cancelled'
    };
    return map[this.currentStatus] ?? '';
  }

  get showCTA(): boolean {
    return this.currentStatus === 'new' ||
      this.currentStatus === 'expired' ||
      this.currentStatus === 'cancelled';
  }

  get memberInitials(): string {
    const parts = (this.member?.fullNameAr ?? '').trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0, 2) ?? '';
  }

  applyFilters(): void {
    this.filteredPlaces = this.allPlaces.filter(place => {
      const searchMatch = !this.searchQuery.trim() ||
        place.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
      const typeMatch = !this.selectedType || place.type === this.selectedType;
      let locationMatch: boolean;
      if (!this.selectedLocation) {
        locationMatch = true;
      } else {
        locationMatch = place.location === null
          ? this.selectedType === 'سياحة'
          : place.location === this.selectedLocation;
      }
      return searchMatch && typeMatch && locationMatch;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedLocation = '';
    this.selectedType = '';
    this.applyFilters();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedLocation) count++;
    if (this.selectedType) count++;
    return count;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = { 'مطعم': '🍽', 'بقالة': '🛒', 'سياحة': '🌍' };
    return icons[type] ?? '';
  }

  onImageError(event: Event, placeId: number): void {
    this.imageErrors.add(placeId);
    (event.target as HTMLImageElement).style.display = 'none';
  }

  hasImageError(placeId: number): boolean {
    return this.imageErrors.has(placeId);
  }

  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
  }

  @HostListener('document:click')
  closeSettings(): void { this.showSettings = false; }

  logout(): void {
    this.memberAuthService.logout();
    this.router.navigate(['/membership/login']);
  }
}
