import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon, provideLucideIcons, LucideIcon } from '@lucide/angular';
import { MembershipService } from '../../../services/membership.service';
import { MemberAuthService } from '../../../services/member-auth.service';
import { VendorService } from '../../../services/vendor.service';
import { Member, MembershipApplication } from '../../../models/member.model';
import { DISCOUNTED_PLACES } from '../../../data/discounted-places';
import { DiscountedPlace } from '../../../models/discounted-place.model';
import QRCode from 'qrcode';
import { PublicVendor } from '../../../models/vendor.model';
import { ALL_VENDOR_LUCIDE_ICONS, getVendorIcon } from '../../../data/vendor-icons';

@Component({
  selector: 'app-membership-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideDynamicIcon],
  providers: [provideLucideIcons(...ALL_VENDOR_LUCIDE_ICONS)],
  templateUrl: './membership-dashboard.component.html',
  styleUrls: ['./membership-dashboard.component.scss'],
})
export class MembershipDashboardComponent implements OnInit {
  member: Member | null = null;
  isLoading = true;
  errorMessage = '';
  showSettings = false;
  qrCodeDataUrl: string = '';

  // Vendors
  allPlaces: PublicVendor[] = [];
  filteredPlaces: PublicVendor[] = [];
  isLoadingVendors = false;
  vendorsError = false;
  searchQuery = '';
  selectedLocation = '';
  selectedType = '';
  sortBy = '';           // '' | 'recent'
  discountRange = '';    // '' | '1-10' | '11-20' | '21-50' | '50+'

  locationOptions: { value: string; label: string }[] = [];
  typeOptions: { value: string; label: string }[] = [];

  readonly discountRangeOptions = [
    { value: '',      label: 'جميع الخصومات' },
    { value: '1-10',  label: '١٪ – ١٠٪' },
    { value: '11-20', label: '١١٪ – ٢٠٪' },
    { value: '21-50', label: '٢١٪ – ٥٠٪' },
    { value: '50+',   label: 'أكثر من ٥٠٪' },
  ];

  imageErrors: Set<string> = new Set();

  constructor(
    private membershipService: MembershipService,
    private memberAuthService: MemberAuthService,
    private vendorService: VendorService,
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
      },
    });

    this.loadVendors();
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

  loadVendors(): void {
    this.isLoadingVendors = true;
    this.vendorsError = false;

    this.vendorService.getActiveVendors().subscribe({
      next: (vendors) => {
        this.allPlaces = vendors;
        this.buildFilterOptions();
        this.applyFilters();
        this.isLoadingVendors = false;
      },
      error: () => {
        this.vendorsError = true;
        this.isLoadingVendors = false;
      },
    });
  }

  private buildFilterOptions(): void {
    const locations = [...new Set(
      this.allPlaces
        .map((v) => v.location)
        .filter((l): l is string => !!l)
    )].sort();

    this.locationOptions = [
      { value: '', label: 'جميع المناطق' },
      ...locations.map((l) => ({ value: l, label: l })),
    ];

    const types = [...new Set(this.allPlaces.map((v) => v.categoryName))].sort();

    this.typeOptions = [
      { value: '', label: 'جميع الأنواع' },
      ...types.map((t) => ({ value: t, label: t })),
    ];
  }

  // ─── Member getters ──────────────────────────────────────────────────────────

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

  // ─── Filter methods ──────────────────────────────────────────────────────────

  /** Extracts the first integer found in a discount string, e.g. "15%" → 15, "حتى 50%" → 50 */
  private parseDiscountPct(discount: string): number | null {
    const match = discount.match(/\d+/);
    // Only treat as a percentage if the string contains '%'
    if (match && discount.includes('%')) return parseInt(match[0], 10);
    return null;
  }

  applyFilters(): void {
    let result = this.allPlaces.filter((place) => {
      const searchMatch =
        !this.searchQuery.trim() ||
        place.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim());

      const typeMatch = !this.selectedType || place.categoryName === this.selectedType;

      const locationMatch = !this.selectedLocation
        ? true
        : place.location === this.selectedLocation;

      let discountMatch = true;
      if (this.discountRange) {
        const pct = this.parseDiscountPct(place.discount);
        if (pct === null) {
          discountMatch = false;
        } else {
          switch (this.discountRange) {
            case '1-10':  discountMatch = pct >= 1  && pct <= 10;  break;
            case '11-20': discountMatch = pct >= 11 && pct <= 20;  break;
            case '21-50': discountMatch = pct >= 21 && pct <= 50;  break;
            case '50+':   discountMatch = pct > 50;                break;
          }
        }
      }

      return searchMatch && typeMatch && locationMatch && discountMatch;
    });

    if (this.sortBy === 'recent') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    this.filteredPlaces = result;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedLocation = '';
    this.selectedType = '';
    this.sortBy = '';
    this.discountRange = '';
    this.applyFilters();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedLocation) count++;
    if (this.selectedType) count++;
    if (this.sortBy) count++;
    if (this.discountRange) count++;
    return count;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  getPlaceIcon(place: PublicVendor): LucideIcon {
    return getVendorIcon(place.categoryIcon);
  }

  onImageError(event: Event, vendorId: string): void {
    this.imageErrors.add(vendorId);
    (event.target as HTMLImageElement).style.display = 'none';
  }

  hasImageError(vendorId: string): boolean {
    return this.imageErrors.has(vendorId);
  }

  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
  }

  @HostListener('document:click')
  closeSettings(): void {
    this.showSettings = false;
  }

  logout(): void {
    this.memberAuthService.logout();
    this.router.navigate(['/membership/login']);
  }
}
