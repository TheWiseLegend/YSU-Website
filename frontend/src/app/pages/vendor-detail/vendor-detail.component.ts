import { Component, OnInit } from '@angular/core';
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
}
