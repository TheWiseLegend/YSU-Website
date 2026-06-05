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

  constructor(private publicGalleryService: PublicGalleryService) {}

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.isLoading = true;
    this.publicGalleryService.getAllAlbums().subscribe({
      next: (albums) => {
        this.albums = albums.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'فشل في تحميل معرض الصور';
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
