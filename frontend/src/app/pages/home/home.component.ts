import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicEventsService } from '../../services/public-events.service';
import { PublicNewsService } from '../../services/public-news.service';
import { Event } from '../../services/events.service';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';
import { News } from '../../models/news.interface';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  current: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, OptimizedImageComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // ── Slider ──────────────────────────────────────────────────
  slides = [
    { src: '/assets/hero_section/image_slider1.webp' },
    { src: '/assets/hero_section/image_slider2.webp' },
    { src: '/assets/hero_section/image_slider3.webp' },
  ];

  currentIndex = 0;
  private intervalId: any;
  isPaused = false;
  readonly transitionInterval = 6000;

  // ── Events ──────────────────────────────────────────────────
  upcomingEvents: Event[] = [];
  isLoadingEvents = false;
  eventsError = '';

  // ── News ────────────────────────────────────────────────────
  latestNews: News[] = [];
  isLoadingNews = false;
  newsError = '';

  // ── Stats ───────────────────────────────────────────────────
  @ViewChild('statsSection') statsSection!: ElementRef<HTMLElement>;
  statsAnimated = false;
  private statsObserver?: IntersectionObserver;

  stats: Stat[] = [
    { value: 1500, suffix: '+', label: 'طالب وطالبة', current: 0 },
    { value: 13,   suffix: '',  label: 'فرعاً جامعياً', current: 0 },
    { value: 30,   suffix: '+', label: 'فعالية سنوية', current: 0 },
    { value: 9,    suffix: '',  label: 'مؤتمرات عامة', current: 0 },
  ];

  constructor(
    private publicEventsService: PublicEventsService,
    private publicNewsService: PublicNewsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.startImageTransition();
    this.preloadImages();
    this.loadUpcomingEvents();
    this.loadLatestNews();
    this.setVhVariable();
  }

  ngAfterViewInit(): void {
    this.initStatsObserver();
  }

  ngOnDestroy(): void {
    this.clearImageTransition();
    this.statsObserver?.disconnect();
  }

  // ── Slider ──────────────────────────────────────────────────
  // Set --vh to actual window.innerHeight so mobile hero fills the screen
  setVhVariable(): void {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
  }

  preloadImages(): void {
    this.slides.forEach(s => {
      const img = new Image();
      img.src = s.src;
    });
  }

  startImageTransition(): void {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) this.nextImage();
    }, this.transitionInterval);
  }

  clearImageTransition(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetTimer();
  }

  prevImage(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetTimer();
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.resetTimer();
  }

  resetTimer(): void {
    this.clearImageTransition();
    this.startImageTransition();
  }

  scrollToEvents(): void {
    document.querySelector('#about')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  @HostListener('mouseenter')
  onMouseEnter(): void { this.isPaused = true; }

  @HostListener('mouseleave')
  onMouseLeave(): void { this.isPaused = false; }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    this.isPaused = document.hidden;
  }

  // ── Events ──────────────────────────────────────────────────
  loadUpcomingEvents(): void {
    this.isLoadingEvents = true;
    this.publicEventsService.getUpcomingEvents(3).subscribe({
      next: (events) => {
        const now = new Date();
        this.upcomingEvents = events
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        this.isLoadingEvents = false;
      },
      error: () => {
        this.eventsError = 'تعذّر تحميل الفعاليات، يرجى المحاولة لاحقاً';
        this.isLoadingEvents = false;
      },
    });
  }

  formatDay(dateString: string): string {
    return new Date(dateString).getDate().toString();
  }

  formatMonth(dateString: string): string {
    const months = [
      'يناير','فبراير','مارس','أبريل','مايو','يونيو',
      'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
    ];
    return months[new Date(dateString).getMonth()];
  }

  // ── News ────────────────────────────────────────────────────
  loadLatestNews(): void {
    this.isLoadingNews = true;
    this.publicNewsService.getAllNews().subscribe({
      next: (news) => {
        this.latestNews = news
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        this.isLoadingNews = false;
      },
      error: () => {
        this.newsError = 'تعذّر تحميل الأخبار، يرجى المحاولة لاحقاً';
        this.isLoadingNews = false;
      },
    });
  }

  formatNewsDate(dateString: string): string {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  // ── Stats counter ────────────────────────────────────────────
  private initStatsObserver(): void {
    if (!this.statsSection?.nativeElement) return;

    this.statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.statsAnimated = true;
          this.animateStats();
          this.statsObserver?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.statsObserver.observe(this.statsSection.nativeElement);
  }

  private animateStats(): void {
    const duration = 200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.stats = this.stats.map(s => ({
        ...s,
        current: Math.round(s.value * eased),
      }));
      this.cdr.markForCheck();

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}
