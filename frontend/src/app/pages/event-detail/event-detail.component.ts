// src/app/pages/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';
import { PublicEventsService } from '../../services/public-events.service';
import { Event } from '../../services/events.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, OptimizedImageComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  eventId: string | null = null;
  event: Event | undefined;
  notFound: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private publicEventsService: PublicEventsService
  ) {}

  ngOnInit(): void {
    // Get the event ID from the route
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      
      if (this.eventId) {
        this.loadEventDetails();
      }
    });
  }
  
  loadEventDetails(): void {
    if (!this.eventId) return;
    
    this.isLoading = true;
    this.publicEventsService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.notFound = false;
        this.isLoading = false;
        
        document.title = `${event.title} - اتحاد الطلبة اليمنيين في ماليزيا`;
      },
      error: (error) => {
        this.event = undefined;
        this.notFound = true;
        this.isLoading = false;
        this.errorMessage = 'فشل في تحميل تفاصيل الفعالية. يرجى المحاولة مرة أخرى لاحقًا.';
      }
    });
  }

    // In event-detail.component.ts
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      
      // Use Arabic month names
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    }
  
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  formatDay(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  formatMonth(dateString: string): string {
    const date = new Date(dateString);
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[date.getMonth()];
  }

  isPastEvent(): boolean {
    if (!this.event) return false;
    
    const now = new Date();
    const eventDate = new Date(this.event.date);
    return eventDate < now;
  }
  

  openMapLocation(): void {
    if (!this.event) return;
    
    // Create a Google Maps search URL with the location
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.event.location)}`;
    window.open(mapUrl, '_blank');
  }
  
  addToCalendar(): void {
    if (!this.event) return;
    
    const eventDate = new Date(this.event.date);
    // End time is 2 hours after start time (adjust as needed)
    const endTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
    
    // Format dates for Google Calendar
    const startDate = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = endTime.toISOString().replace(/-|:|\.\d+/g, '');
    
    // Create Google Calendar URL
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(this.event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(this.event.description)}&location=${encodeURIComponent(this.event.location)}`;
    
    window.open(googleCalUrl, '_blank');
  }

  shareEvent(platform: string): void {
    if (!this.event) return;
    
    const eventUrl = window.location.href;
    const eventTitle = this.event.title;
    const eventDesc = this.event.description;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(eventTitle + ': ' + eventUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
  }
}