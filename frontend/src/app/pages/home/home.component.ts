// src/app/pages/home/home.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicEventsService } from '../../services/public-events.service';
import { PublicNewsService } from '../../services/public-news.service';
import { Event } from '../../services/events.service';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';
import { News } from '../../models/news.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, OptimizedImageComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  sliderImages: string[] = [
    '/assets/hero_section/image_slider1.webp', 
    '/assets/hero_section/image_slider2.webp', 
    '/assets/hero_section/image_slider3.webp', 
  ]; 

  // Current image index
  currentIndex: number = 0;
  
  // Timer for image transitions
  private intervalId: any;
  
  // Control whether animations should run
  isPaused: boolean = false;
  
  // Default interval duration
  transitionInterval: number = 6000; 

  // Array of upcoming events
  upcomingEvents: Event[] = [];
  isLoadingEvents: boolean = false;
  eventsError: string = '';

  // Array of latest news
  latestNews: News[] = [];
  isLoadingNews: boolean = false;
  newsError: string = '';

  constructor(
    private publicEventsService: PublicEventsService,
    private publicNewsService: PublicNewsService
  ) {}

  ngOnInit(): void {
    
    // Start automatic image transition
    this.startImageTransition();
    
    // Preload images for smoother experience
    this.preloadImages();
    
    // Load upcoming events
    this.loadUpcomingEvents();
    
    // Load latest news
    this.loadLatestNews();
  }

  ngOnDestroy(): void {
    // Clear timer when component is destroyed
    this.clearImageTransition();
  }
  
  // Load upcoming events from the API
  loadUpcomingEvents(): void {
    this.isLoadingEvents = true;
    this.publicEventsService.getUpcomingEvents(3).subscribe({
      next: (events) => {
        // Get current date to filter past events
        const now = new Date();
        
        // Filter only future events and sort by nearest date first
        this.upcomingEvents = events
          .filter(event => new Date(event.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3); 
        
        this.isLoadingEvents = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.eventsError = 'فشل في تحميل الفعاليات القادمة';
        this.isLoadingEvents = false;
      }
    });
  }
  
  // Load latest news from the API
  loadLatestNews(): void {
    this.isLoadingNews = true;
    this.publicNewsService.getAllNews().subscribe({
      next: (news) => {
        this.latestNews = news
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        this.isLoadingNews = false;
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.newsError = 'فشل في تحميل الأخبار';
        this.isLoadingNews = false;
      }
    });
  }
  
  // Preload all slider images
  preloadImages(): void {
    this.sliderImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  // Start automatic image transition
  startImageTransition(): void {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.nextImage();
      }
    }, this.transitionInterval);
  }

  // Clear the timer
  clearImageTransition(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Go to next image
  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.sliderImages.length;
    this.resetTimer();
  }

  // Go to previous image
  prevImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.sliderImages.length) % this.sliderImages.length;
    this.resetTimer();
  }

  // Reset timer when manually navigating
  resetTimer(): void {
    this.clearImageTransition();
    this.startImageTransition();
  }

  // Scroll to the next section
  scrollToNextSection(): void {
    const nextSection = document.querySelector('#next-events');
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  // Format date to extract day
  formatDay(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString();
  }
  
  // Format date to extract month
  formatMonth(dateString: string): string {
    const date = new Date(dateString);
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[date.getMonth()];
  }
  
  // Pause slider on hover to improve user experience
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isPaused = true;
  }
  
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isPaused = false;
  }
  
  // Prevent transition during page visibility change
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
    }
  }

  // Format news date
  formatNewsDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
} 