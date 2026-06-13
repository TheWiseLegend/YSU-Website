// src/app/pages/events/events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicEventsService } from '../../services/public-events.service';
import { Event } from '../../services/events.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, OptimizedImageComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private publicEventsService: PublicEventsService) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.publicEventsService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        const now = new Date();
        this.upcomingEvents = events
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.pastEvents = events
          .filter(e => new Date(e.date) < now)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'فشل في تحميل الفعاليات';
        this.isLoading = false;
      }
    });
  }

  formatDay(dateString: string): string {
    return new Date(dateString).getDate().toString();
  }

  formatMonth(dateString: string): string {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[new Date(dateString).getMonth()];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  isPastEvent(event: Event): boolean {
    return new Date(event.date) < new Date();
  }
}
