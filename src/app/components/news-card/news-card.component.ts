// src/app/components/news-card/news-card.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { News } from '../../models/news.interface';
import { OptimizedImageComponent } from '../optimized-image/optimized-image.component';
import { IntersectionLazyLoadDirective } from '../../directives/intersection-lazy-load.directive';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule, RouterModule, OptimizedImageComponent, IntersectionLazyLoadDirective],
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent implements OnInit {
  @Input() news!: News;
  
  constructor() { }
  
  ngOnInit(): void {
    // Component initialization code
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  
  limitSummary(summary: string): string {
    if (summary.length <= 120) {
      return summary;
    }
    return summary.substring(0, 120) + '...';
  }
}