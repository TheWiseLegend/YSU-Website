// src/app/pages/news/news.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
import { PublicNewsService } from '../../services/public-news.service';
import { ImagePreloadService } from '../../services/image-preload.service';
import { News } from '../../models/news.interface';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, NewsCardComponent],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  newsItems: News[] = [];
  isLoading = true;
  errorMessage = '';
  visibleItems = 6;

  constructor(
    private publicNewsService: PublicNewsService,
    private imagePreloadService: ImagePreloadService
  ) { }

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.publicNewsService.getAllNews().subscribe({
      next: (news) => {
        this.newsItems = news.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
        
        // Preload all news images to improve perceived performance
        if (this.newsItems.length > 0) {
          // Preload visible items with priority
          const priorityUrls = this.newsItems.slice(0, this.visibleItems).map(item => item.imageUrl);
          this.imagePreloadService.addImages(priorityUrls, true);
          
          // Preload remaining items without priority
          if (this.newsItems.length > this.visibleItems) {
            const remainingUrls = this.newsItems.slice(this.visibleItems).map(item => item.imageUrl);
            this.imagePreloadService.addImages(remainingUrls);
          }
        }
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل الأخبار';
        this.isLoading = false;
      }
    });
  }
  
  loadMoreItems(): void {
    this.visibleItems += 6;
  }
}