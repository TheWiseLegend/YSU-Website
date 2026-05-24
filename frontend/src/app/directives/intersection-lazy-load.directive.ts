// src/app/directives/intersection-lazy-load.directive.ts
import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ImagePreloadService } from '../services/image-preload.service';

@Directive({
  selector: '[appIntersectionLazyLoad]',
  standalone: true
})
export class IntersectionLazyLoadDirective implements OnInit, OnDestroy {
  @Input('appIntersectionLazyLoad') imageUrl: string = '';
  
  private observer: IntersectionObserver | null = null;
  
  constructor(
    private el: ElementRef,
    private imagePreloadService: ImagePreloadService
  ) {}
  
  ngOnInit(): void {
    if (!this.imageUrl) return;
    
    if (this.imagePreloadService.isImagePreloaded(this.imageUrl)) {
      this.loadImage();
      return;
    }
    
    // Set up intersection observer to load image when it comes into view
    this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
      rootMargin: '200px 0px', 
      threshold: 0.01
    });
    
    this.observer.observe(this.el.nativeElement);
  }
  
  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  private onIntersection(entries: IntersectionObserverEntry[]): void {
    if (entries.some(entry => entry.isIntersecting)) {
      // Element is now visible (or about to be), load the image
      this.loadImage();
      
      // Stop observing once we've started loading
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }
  
  private loadImage(): void {
    // Tell the preload service to prioritize this image
    this.imagePreloadService.addImages([this.imageUrl], true);
  }
}