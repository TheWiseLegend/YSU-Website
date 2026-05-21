// src/app/models/news.interface.ts
export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  createdAt: string; 
  updatedAt: string;
}

export interface CreateNewsDto {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  createdAt?: string; 
}

export interface UpdateNewsDto {
  title?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  createdAt?: string; 
}