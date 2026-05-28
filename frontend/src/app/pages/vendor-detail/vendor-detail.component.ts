import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { LucideDynamicIcon, provideLucideIcons, LucideIcon } from '@lucide/angular';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';
import { VendorService } from '../../services/vendor.service';
import { PublicVendor } from '../../models/vendor.model';
import { ALL_VENDOR_LUCIDE_ICONS, getVendorIcon } from '../../data/vendor-icons';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, OptimizedImageComponent, LucideDynamicIcon],
  providers: [provideLucideIcons(...ALL_VENDOR_LUCIDE_ICONS)],
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.scss'],
})
export class VendorDetailComponent implements OnInit {
  vendor: PublicVendor | undefined;
  isLoading = true;
  notFound = false;
  phoneCopied = false;

  // Lightbox
  lightboxUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadVendor(id);
      }
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

  getCategoryIcon(key: string | null | undefined): LucideIcon {
    return getVendorIcon(key);
  }

  goBack(): void {
    this.location.back();
  }

  openMaps(): void {
    if (this.vendor?.mapsUrl) {
      window.open(this.vendor.mapsUrl, '_blank');
    }
  }

  copyPhone(phone: string): void {
    navigator.clipboard.writeText(phone).then(() => {
      this.phoneCopied = true;
      setTimeout(() => this.phoneCopied = false, 2000);
    });
  }

  // ─── Lightbox ────────────────────────────────────────────────────────────────

  openLightbox(url: string): void {
    this.lightboxUrl = url;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxUrl = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLightbox();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  formatExpiryDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-MY', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}
