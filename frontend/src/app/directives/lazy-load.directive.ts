// src/app/directives/lazy-load.directive.ts
import { Directive, ElementRef, OnInit, OnDestroy, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoadSrc: string = '';
  @Input() appLazyLoadAlt: string = '';
  
  private observer: IntersectionObserver | null = null;
  private isLoaded = false;
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      
      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadImage();
    }
  }
  
  ngOnDestroy(): void {
    // Clean up the observer when the directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  private onIntersect(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
    // Check if the element is intersecting with the viewport
    if (entries.some(entry => entry.isIntersecting) && !this.isLoaded) {
      this.loadImage();
      // Stop observing once the image is loaded
      observer.unobserve(this.el.nativeElement);
    }
  }
  
  private loadImage(): void {
    // If the element is an img, set the src attribute
    if (this.el.nativeElement.tagName.toLowerCase() === 'img') {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyLoadSrc);
      if (this.appLazyLoadAlt) {
        this.renderer.setAttribute(this.el.nativeElement, 'alt', this.appLazyLoadAlt);
      }
    } else {
      // If it's not an img, set the background-image style
      this.renderer.setStyle(
        this.el.nativeElement, 
        'background-image', 
        `url(${this.appLazyLoadSrc})`
      );
    }
    
    this.isLoaded = true;
  }
}