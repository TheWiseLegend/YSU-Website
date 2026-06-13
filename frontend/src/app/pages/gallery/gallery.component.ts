// src/app/pages/gallery/gallery.component.ts
import { Component, OnInit } from '@angular/core';
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

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ar-MY', {
      year: 'numeric',
      month: 'long',
    });
  }
}
