// src/app/admin/admin-panel/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../../services/news.service';
import { EventsService } from '../../../services/events.service';
import { GalleryService } from '../../../services/gallery.service';
import { BranchesService } from '../../../services/branches.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  
  newsCount: number = 0;
  eventsCount: number = 0;
  branchesCount: number = 0;
  galleryCount: number = 0;
  isLoading: boolean = true;
  
  constructor(
    private newsService: NewsService,
    private eventsService: EventsService,
    private galleryService: GalleryService,
    private branchesService: BranchesService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    
    // Use forkJoin to make parallel API requests
    forkJoin({
      news: this.newsService.getAllNews().pipe(catchError(() => of([]))),
      events: this.eventsService.getAllEvents().pipe(catchError(() => of([]))),
      gallery: this.galleryService.getAllAlbums().pipe(catchError(() => of([]))),
      branches: this.branchesService.getAllBranches().pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        this.newsCount = results.news.length;
        this.eventsCount = results.events.length;
        this.galleryCount = results.gallery.length;
        this.branchesCount = results.branches.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}