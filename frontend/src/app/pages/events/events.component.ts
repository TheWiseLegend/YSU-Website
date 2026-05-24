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
        
        // Get current date to filter past events
        const now = new Date();
        
        // Split events into upcoming and past
        this.upcomingEvents = events
          .filter(event => new Date(event.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        this.pastEvents = events
          .filter(event => new Date(event.date) < now)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل الفعاليات';
        this.isLoading = false;
      }
    });
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
  
  // Format date to full readable format
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  isPastEvent(event: Event): boolean {
    const now = new Date();
    const eventDate = new Date(event.date);
    return eventDate < now;
  }
}