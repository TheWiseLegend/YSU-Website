// src/app/components/optimized-image/optimized-image.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-container" [class.loaded]="imageLoaded" [style.height.px]="height">
      <!-- Low quality placeholder (blurred) -->
      <div class="placeholder" *ngIf="!imageLoaded" [style.background-image]="'url(' + placeholderUrl + ')'"></div>
      
      <!-- Main image with lazy loading -->
      <img
        [src]="src"
        [alt]="alt"
        (load)="onImageLoaded()"
        loading="lazy"
        [width]="width"
        [height]="height"
        class="main-image"
        [class.visible]="imageLoaded"
      />
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      overflow: hidden;
      background-color: #f0f0f0;
      width: 100%;
    }
    
    .placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-size: cover;
      background-position: center;
      filter: blur(10px);
      transform: scale(1.1);
    }
    
    .main-image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    
    .main-image.visible {
      opacity: 1;
    }
  `]
})
export class OptimizedImageComponent implements OnInit {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() width: number = 0;
  @Input() height: number = 0;
  
  imageLoaded: boolean = false;
  placeholderUrl: string = '';
  
  ngOnInit() {
    // Generate a tiny placeholder URL or use a smaller version
    this.generatePlaceholder();
  }
  
  onImageLoaded() {
    this.imageLoaded = true;
  }
  
  private generatePlaceholder() {
    
    if (this.src.includes('firebasestorage.googleapis.com')) {
      // Just use a very small image for the placeholder
      this.placeholderUrl = this.src;
    } else {
      // For other image sources
      this.placeholderUrl = this.src;
    }
  }
}