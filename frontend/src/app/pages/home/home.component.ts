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
import { AppLoaderService } from '../../services/app-loader.service';

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
    { src: '/assets/hero_section/image_slider4.webp' },
    { src: '/assets/hero_section/image_slider5.webp' },
    { src: '/assets/hero_section/image_slider6.webp' },
    { src: '/assets/hero_section/image_slider7.webp' },
    { src: '/assets/hero_section/image_slider8.webp' },
    { src: '/assets/hero_section/image_slider9.webp' },
    { src: '/assets/hero_section/image_slider10.webp' },
    { src: '/assets/hero_section/image_slider11.webp' },
  ];

  currentIndex = 0;
  private intervalId: any;
  isPaused = false;
  readonly transitionInterval = 6000;

  // ── Loading screen ──────────────────────────────────────────
  // The single loader lives in index.html (#ysu-app-loader) and is shown from
  // the very first browser paint. This page holds it until the first hero
  // images are ready, then tells AppLoaderService to remove it. On cached
  // loads the images resolve synchronously → the loader is gone almost at once.
  private readonly preloadCount = 3;        // wait for first N hero images
  private readonly loaderSafetyMs = 6000;   // hard ceiling so it never hangs
  private safetyTimer: any;
  private isSettled = false;

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

  // ── About emblem reveal ──────────────────────────────────────
  // The emblem sits among heavy blur layers + infinite GPU animations, which
  // mobile browsers rasterize lazily → it pops in blank when scrolled to.
  // Reveal it with a fade so the paint is intentional, not jarring.
  @ViewChild('aboutEmblem') aboutEmblem!: ElementRef<HTMLElement>;
  emblemRevealed = false;
  private emblemObserver?: IntersectionObserver;

  stats: Stat[] = [
    { value: 7000, suffix: '+', label: 'طالب وطالبة', current: 0 },
    { value: 19,   suffix: '',  label: 'فرعاً جامعياً', current: 0 },
    { value: 150,  suffix: '',  label: 'فعالية سنوية', current: 0 },
    { value: 145,  suffix: '',  label: 'قيادات فروع', current: 0 },
  ];

  constructor(
    private publicEventsService: PublicEventsService,
    private publicNewsService: PublicNewsService,
    private cdr: ChangeDetectorRef,
    private appLoader: AppLoaderService,
  ) {
    // Claim the pre-boot loader so AppComponent doesn't auto-hide it before
    // our hero images are ready.
    this.appLoader.hold();
  }

  ngOnInit(): void {
    this.startImageTransition();
    this.preloadHeroImages();
    this.loadUpcomingEvents();
    this.loadLatestNews();
    this.setVhVariable();
  }

  ngAfterViewInit(): void {
    this.initStatsObserver();
    this.initEmblemObserver();
  }

  ngOnDestroy(): void {
    this.clearImageTransition();
    clearTimeout(this.safetyTimer);
    this.statsObserver?.disconnect();
    this.emblemObserver?.disconnect();
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

  preloadHeroImages(): void {
    const firstN = this.slides.slice(0, this.preloadCount);

    let settled = 0;
    const onOne = () => {
      settled += 1;
      if (settled >= this.preloadCount) this.settle();
    };

    // Check synchronously whether the first N images are already cached.
    let cachedCount = 0;
    const pending: HTMLImageElement[] = [];
    firstN.forEach((s) => {
      const img = new Image();
      img.src = s.src;
      if (img.complete) cachedCount += 1;
      else pending.push(img);
    });

    if (cachedCount >= this.preloadCount) {
      // All cached → drop the loader immediately.
      this.settle();
      this.warmRemaining();
      return;
    }

    // Safety ceiling so the loader can never hang.
    this.safetyTimer = setTimeout(() => this.settle(), this.loaderSafetyMs);

    settled = cachedCount;
    pending.forEach((img) => {
      let counted = false;
      const once = () => { if (!counted) { counted = true; onOne(); } };
      img.onload = once;
      img.onerror = once; // count errors too, so we never hang
      if (img.complete) once();
    });

    this.warmRemaining();
  }

  // Warm the remaining slides in the background.
  private warmRemaining(): void {
    this.slides.slice(this.preloadCount).forEach((s) => { new Image().src = s.src; });
  }

  // Called once the first N images are ready (or on safety timeout).
  private settle(): void {
    if (this.isSettled) return;
    this.isSettled = true;
    clearTimeout(this.safetyTimer);
    this.appLoader.hide();
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

  private initEmblemObserver(): void {
    const el = this.aboutEmblem?.nativeElement;
    if (!el) return;

    // No IntersectionObserver (old browsers) → just show it.
    if (!('IntersectionObserver' in window)) {
      this.emblemRevealed = true;
      this.cdr.markForCheck();
      return;
    }

    this.emblemObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.emblemRevealed = true;
          this.cdr.markForCheck();
          this.emblemObserver?.disconnect();
        }
      },
      // Reveal a bit before it enters the viewport so it's painted in time.
      { threshold: 0.15, rootMargin: '200px 0px' },
    );
    this.emblemObserver.observe(el);
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
