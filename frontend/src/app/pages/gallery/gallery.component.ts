// src/app/pages/gallery/gallery.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { PublicGalleryService } from '../../services/public-gallery.service';
import { Gallery } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  albums: Gallery[] = [];
  isLoading = true;
  errorMessage = '';

  // Lightbox
  lightboxAlbum: Gallery | null = null;
  lightboxIndex = 0;

  // Sample albums shown when API returns nothing (for design preview)
  private readonly SAMPLE_ALBUMS: Gallery[] = [
    {
      id: 'sample-1',
      title: 'الجمعية العمومية ٢٠٢٥',
      description: 'اجتماع الجمعية العمومية السنوي لاتحاد الطلبة اليمنيين في ماليزيا',
      mainImage: '/assets/about/general_Assembly_meeting.jpg',
      images: [
        { id: 's1-1', url: '/assets/about/general_Assembly_meeting.jpg' },
        { id: 's1-2', url: '/assets/hero_section/image_slider1.webp' },
        { id: 's1-3', url: '/assets/hero_section/image_slider2.webp' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-2',
      title: 'فعاليات الاتحاد',
      description: 'لقطات من أبرز فعاليات وأنشطة اتحاد الطلبة',
      mainImage: '/assets/hero_section/image_slider2.webp',
      images: [
        { id: 's2-1', url: '/assets/hero_section/image_slider2.webp' },
        { id: 's2-2', url: '/assets/hero_section/image_slider3.webp' },
        { id: 's2-3', url: '/assets/about/vision_image.webp' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-3',
      title: 'رؤية الاتحاد',
      description: 'صور تعبّر عن رؤية الاتحاد ومسيرته',
      mainImage: '/assets/about/vision_image.webp',
      images: [
        { id: 's3-1', url: '/assets/about/vision_image.webp' },
        { id: 's3-2', url: '/assets/hero_section/image_slider1.webp' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-4',
      title: 'اليوم الطلابي',
      description: 'أنشطة اليوم الطلابي السنوي',
      mainImage: '/assets/hero_section/image_slider3.webp',
      images: [
        { id: 's4-1', url: '/assets/hero_section/image_slider3.webp' },
        { id: 's4-2', url: '/assets/about/general_Assembly_meeting.jpg' },
        { id: 's4-3', url: '/assets/hero_section/image_slider2.webp' },
        { id: 's4-4', url: '/assets/about/vision_image.webp' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-5',
      title: 'الاحتفال الوطني',
      description: 'احتفالات اليوم الوطني اليمني في كوالالمبور',
      mainImage: '/assets/hero_section/image_slider1.webp',
      images: [
        { id: 's5-1', url: '/assets/hero_section/image_slider1.webp' },
        { id: 's5-2', url: '/assets/hero_section/image_slider2.webp' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sample-6',
      title: 'ورش العمل الأكاديمية',
      description: 'ورش عمل وندوات أكاديمية لدعم الطلاب',
      mainImage: '/assets/hero_section/image_slider2.webp',
      images: [
        { id: 's6-1', url: '/assets/hero_section/image_slider2.webp' },
        { id: 's6-2', url: '/assets/about/general_Assembly_meeting.jpg' },
        { id: 's6-3', url: '/assets/hero_section/image_slider3.webp' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  constructor(private publicGalleryService: PublicGalleryService) {}

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.isLoading = true;
    this.publicGalleryService.getAllAlbums().subscribe({
      next: (albums) => {
        const sorted = albums.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        // Fall back to sample data if API returns nothing (design preview)
        this.albums = sorted.length > 0 ? sorted : this.SAMPLE_ALBUMS;
        this.isLoading = false;
      },
      error: () => {
        // Show sample data on error too so the design is visible
        this.albums = this.SAMPLE_ALBUMS;
        this.errorMessage = '';
        this.isLoading = false;
      },
    });
  }

  // ── Lightbox ────────────────────────────────────────────

  openLightbox(album: Gallery, index = 0): void {
    this.lightboxAlbum = album;
    this.lightboxIndex = index;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxAlbum = null;
    document.body.style.overflow = '';
  }

  prevImage(): void {
    if (!this.lightboxAlbum) return;
    const len = this.lightboxAlbum.images.length;
    this.lightboxIndex = (this.lightboxIndex - 1 + len) % len;
  }

  nextImage(): void {
    if (!this.lightboxAlbum) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxAlbum.images.length;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.lightboxAlbum) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft') this.nextImage();   // RTL: left = next
    if (e.key === 'ArrowRight') this.prevImage();  // RTL: right = prev
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ar-MY', {
      year: 'numeric',
      month: 'long',
    });
  }
}
