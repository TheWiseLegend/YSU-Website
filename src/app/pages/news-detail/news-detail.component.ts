// src/app/pages/news-detail/news-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PublicNewsService } from '../../services/public-news.service';
import { News } from '../../models/news.interface';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, OptimizedImageComponent],
  templateUrl: './news-detail.component.html',
  styleUrls: ['./news-detail.component.scss']
})
export class NewsDetailComponent implements OnInit {
  newsId: string | null = null;
  newsItem: News | undefined;
  notFound: boolean = false;
  isLoading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private publicNewsService: PublicNewsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.newsId = params.get('id');
      
      if (this.newsId) {
        this.loadNews();
      }
    });
  }
  
  loadNews(): void {
    if (this.newsId) {
      this.publicNewsService.getNewsById(this.newsId).subscribe({
        next: (news) => {
          this.newsItem = news;
          this.notFound = false;
          this.isLoading = false;
          
          document.title = `${news.title} - اتحاد الطلبة اليمنيين في ماليزيا`;
        },
        error: (error) => {
          this.newsItem = undefined;
          this.notFound = true;
          this.isLoading = false;
        }
      });
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  
  splitContentIntoParagraphs(content: string): string[] {
    if (!content) return [];
    
    // Split the content by double newlines (or more)
    return content.split(/\n\s*\n/).filter(para => para.trim().length > 0);
  }
}