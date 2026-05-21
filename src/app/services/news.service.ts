// src/app/services/news.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { News, CreateNewsDto, UpdateNewsDto } from '../models/news.interface';
import { AdminAuthService } from './admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private adminAuthService: AdminAuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.adminAuthService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/news`, { headers: this.getHeaders() });
  }

  getNewsById(id: string): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/news/${id}`, { headers: this.getHeaders() });
  }

  createNews(news: CreateNewsDto): Observable<News> {
    return this.http.post<News>(`${this.apiUrl}/news`, news, { headers: this.getHeaders() });
  }

  updateNews(id: string, news: UpdateNewsDto): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/news/${id}`, news, { headers: this.getHeaders() });
  }

  deleteNews(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/news/${id}`, { headers: this.getHeaders() });
  }
}