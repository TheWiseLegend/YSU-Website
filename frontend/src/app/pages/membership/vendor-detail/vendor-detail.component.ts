import { Component, OnInit, HostListener } from '@angular/core';
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
export class MembershipVendorDetailComponent implements OnInit {
  vendor: PublicVendor | undefined;
  member: Member | null = null;
  isLoading = true;
  notFound = false;
  showSettings = false;

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

  private loadVendor(id: string): void {
    this.isLoading = true;
    this.vendorService.getVendorById(id).subscribe({
      next: (vendor) => {
        this.vendor = vendor;
        this.notFound = false;
        this.isLoading = false;
        document.title = `${vendor.name} - اتحاد الطلبة اليمنيين في ماليزيا`;
      },
      error: () => {
        this.vendor = undefined;
        this.notFound = true;
        this.isLoading = false;
      },
    });
  }

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
}
