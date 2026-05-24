// src/app/services/public-news.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { News } from '../models/news.interface';

@Injectable({
  providedIn: 'root'
})
export class PublicNewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/news`);
  }

  getNewsById(id: string): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/news/${id}`);
  }
}