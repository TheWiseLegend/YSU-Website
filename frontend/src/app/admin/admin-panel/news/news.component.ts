// src/app/admin/admin-panel/news/news.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService } from '../../../services/news.service';
import { UploadService } from '../../../services/upload.service'; // Changed from firebase-upload.service
import { News, CreateNewsDto, UpdateNewsDto } from '../../../models/news.interface';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class AdminNewsComponent implements OnInit {
  newsList: News[] = [];
  newsForm: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  constructor(
    private newsService: NewsService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.newsForm = this.fb.group({
      title: ['', Validators.required],
      summary: ['', Validators.required],
      content: [''],
      imageUrl: ['', Validators.required],
      createdAt: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadNews();
    this.setDefaultDate(); 
  }

  setDefaultDate(): void {
    // Set current date and time as default
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16); 
    this.newsForm.patchValue({ createdAt: isoString });
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getAllNews().subscribe({
      next: (news) => {
        this.newsList = news.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.setErrorMessage('فشل في تحميل الأخبار');
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    } else if (!this.isEditing) {
      this.setDefaultDate();
    }
  }

  resetForm(): void {
    this.newsForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
    this.setDefaultDate(); 
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      
      // Show image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.setErrorMessage('الرجاء اختيار صورة صالحة');
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    // Pass 'news' as folder type to organize uploaded images
    this.uploadService.uploadImage(this.selectedFile, 'news').subscribe({
      next: (response) => {
        this.newsForm.patchValue({ imageUrl: response.imageUrl });
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في رفع الصورة');
        this.isUploading = false;
      }
    });
  }

  editNews(news: News): void {
    this.isEditing = true;
    this.editingId = news.id;
    this.showForm = true;
    
    // Format the date for the datetime-local input
    const newsDate = new Date(news.createdAt);
    const formattedDate = newsDate.toISOString().slice(0, 16);
    
    this.newsForm.patchValue({
      title: news.title,
      summary: news.summary,
      content: news.content,
      imageUrl: news.imageUrl,
      createdAt: formattedDate
    });
    this.imagePreview = news.imageUrl;
  }

  deleteNews(id: string): void {
    if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          this.setSuccessMessage('تم حذف الخبر بنجاح');
          this.loadNews();
        },
        error: (error) => {
          this.setErrorMessage('فشل في حذف الخبر');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.newsForm.valid) {
      const formValue = this.newsForm.value;
      
      // Ensure createdAt is properly formatted as ISO string
      const newsData: CreateNewsDto | UpdateNewsDto = {
        ...formValue,
        createdAt: new Date(formValue.createdAt).toISOString()
      };
      
      if (this.isEditing && this.editingId) {
        this.newsService.updateNews(this.editingId, newsData).subscribe({
          next: () => {
            this.setSuccessMessage('تم تحديث الخبر بنجاح');
            this.loadNews();
            this.toggleForm();
          },
          error: (error) => {
            this.setErrorMessage('فشل في تحديث الخبر');
          }
        });
      } else {
        this.newsService.createNews(newsData as CreateNewsDto).subscribe({
          next: () => {
            this.setSuccessMessage('تم إضافة الخبر بنجاح');
            this.loadNews();
            this.toggleForm();
          },
          error: (error) => {
            this.setErrorMessage('فشل في إضافة الخبر');
          }
        });
      }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }

  setSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }
}