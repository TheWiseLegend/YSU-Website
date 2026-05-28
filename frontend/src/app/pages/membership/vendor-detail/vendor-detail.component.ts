import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { LucideDynamicIcon, provideLucideIcons, LucideIcon } from '@lucide/angular';
import { VendorService } from '../../../services/vendor.service';
import { MemberAuthService } from '../../../services/member-auth.service';
import { MembershipService } from '../../../services/membership.service';
import { PublicVendor } from '../../../models/vendor.model';
import { Member } from '../../../models/member.model';
import { ALL_VENDOR_LUCIDE_ICONS, getVendorIcon } from '../../../data/vendor-icons';

@Component({
  selector: 'app-membership-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideDynamicIcon],
  providers: [provideLucideIcons(...ALL_VENDOR_LUCIDE_ICONS)],
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.scss'],
})
export class MembershipVendorDetailComponent implements OnInit, OnDestroy {
  vendor: PublicVendor | undefined;
  member: Member | null = null;
  isLoading = true;
  notFound = false;
  showSettings = false;
  phoneCopied = false;

  // ─── Slider ──────────────────────────────────────────────────────────────────
  activeSlide = 0;
  isPaused = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  readonly transitionInterval = 5000;
  private touchStartX = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private vendorService: VendorService,
    private memberAuthService: MemberAuthService,
    private membershipService: MembershipService,
  ) {}

  ngOnInit(): void {
    this.membershipService.getMe().subscribe({
      next: (member) => (this.member = member),
      error: () => {
        this.memberAuthService.logout();
        this.router.navigate(['/membership/login']);
      },
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadVendor(id);
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private loadVendor(id: string): void {
    this.isLoading = true;
    this.vendorService.getVendorById(id).subscribe({
      next: (vendor) => {
        this.vendor = vendor;
        this.notFound = false;
        this.isLoading = false;
        this.activeSlide = 0;
        document.title = `${vendor.name} - اتحاد الطلبة اليمنيين في ماليزيا`;
        this.startTimer();
      },
      error: () => {
        this.vendor = undefined;
        this.notFound = true;
        this.isLoading = false;
      },
    });
  }

  // ─── Auto-play timer ──────────────────────────────────────────────────────────

  private startTimer(): void {
    if (this.sliderImages.length <= 1) return;
    this.intervalId = setInterval(() => {
      if (!this.isPaused) this.nextSlide();
    }, this.transitionInterval);
  }

  private clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private resetTimer(): void {
    this.clearTimer();
    this.startTimer();
  }

  // ─── Slider navigation ────────────────────────────────────────────────────────

  get sliderImages(): string[] {
    if (!this.vendor) return [];
    const gallery = (this.vendor.images ?? []).map(i => i.url);
    return gallery.length > 0 ? gallery : (this.vendor.imageUrl ? [this.vendor.imageUrl] : []);
  }

  prevSlide(): void {
    const len = this.sliderImages.length;
    this.activeSlide = (this.activeSlide - 1 + len) % len;
    this.resetTimer();
  }

  nextSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % this.sliderImages.length;
    // no resetTimer here — called by interval itself
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
    this.resetTimer();
  }

  onSliderMouseEnter(): void { this.isPaused = true; }
  onSliderMouseLeave(): void { this.isPaused = false; }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const delta = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      // RTL: swipe left = go to previous (visually right), swipe right = next
      delta > 0 ? this.nextSlide() : this.prevSlide();
      this.resetTimer();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (this.vendor && this.sliderImages.length > 1) {
      if (e.key === 'ArrowLeft') { this.nextSlide(); this.resetTimer(); }
      if (e.key === 'ArrowRight') { this.prevSlide(); this.resetTimer(); }
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    this.isPaused = document.hidden;
  }

  // ─── Other helpers ────────────────────────────────────────────────────────────

  get memberInitials(): string {
    const parts = (this.member?.fullNameAr ?? '').trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0, 2) ?? '';
  }

  getCategoryIcon(key: string | null | undefined): LucideIcon {
    return getVendorIcon(key);
  }

  openMaps(): void {
    if (this.vendor?.mapsUrl) window.open(this.vendor.mapsUrl, '_blank');
  }

  goBack(): void {
    this.location.back();
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

  formatExpiryDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-MY', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  copyPhone(phone: string): void {
    navigator.clipboard.writeText(phone).then(() => {
      this.phoneCopied = true;
      setTimeout(() => (this.phoneCopied = false), 2000);
    });
  }
}
