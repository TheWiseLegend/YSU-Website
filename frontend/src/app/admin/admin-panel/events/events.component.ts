// src/app/admin/admin-panel/events/events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventsService, Event, CreateEventDto, UpdateEventDto } from '../../../services/events.service';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class AdminEventsComponent implements OnInit {
  eventsList: Event[] = [];
  eventForm: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  showDeleteConfirmation = false;
  eventToDelete: string | null = null;

  constructor(
    private eventsService: EventsService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        this.eventsList = events.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.setErrorMessage('فشل في تحميل الفعاليات');
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.eventForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
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
    // Pass 'events' as folder type to organize uploaded images
    this.uploadService.uploadImage(this.selectedFile, 'events').subscribe({
      next: (response) => {
        this.eventForm.patchValue({ imageUrl: response.imageUrl });
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في رفع الصورة');
        this.isUploading = false;
      }
    });
  }

  editEvent(event: Event): void {
    this.isEditing = true;
    this.editingId = event.id;
    this.showForm = true;
    
    // Format the date for the input field (ISO format: YYYY-MM-DD)
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().split('T')[0];
    
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      date: formattedDate,
      location: event.location,
      imageUrl: event.imageUrl
    });
    
    this.imagePreview = event.imageUrl;
  }

  confirmDeleteEvent(id: string): void {
    this.eventToDelete = id;
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.eventToDelete = null;
    this.showDeleteConfirmation = false;
  }

  deleteEvent(): void {
    if (!this.eventToDelete) return;
    
    this.eventsService.deleteEvent(this.eventToDelete).subscribe({
      next: () => {
        this.setSuccessMessage('تم حذف الفعالية بنجاح');
        this.loadEvents();
        this.showDeleteConfirmation = false;
        this.eventToDelete = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في حذف الفعالية');
        this.showDeleteConfirmation = false;
        this.eventToDelete = null;
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    const formValue = this.eventForm.value;
    
    // Ensure the date is in ISO format
    const eventDate = new Date(formValue.date);
    formValue.date = eventDate.toISOString();
    
    if (this.isEditing && this.editingId) {
      this.eventsService.updateEvent(this.editingId, formValue).subscribe({
        next: () => {
          this.setSuccessMessage('تم تحديث الفعالية بنجاح');
          this.loadEvents();
          this.toggleForm();
        },
        error: (error) => {
          this.setErrorMessage('فشل في تحديث الفعالية');
        }
      });
    } else {
      this.eventsService.createEvent(formValue as CreateEventDto).subscribe({
        next: () => {
          this.setSuccessMessage('تم إضافة الفعالية بنجاح');
          this.loadEvents();
          this.toggleForm();
        },
        error: (error) => {
          this.setErrorMessage('فشل في إضافة الفعالية');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  displayDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صالح';
    }
    
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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