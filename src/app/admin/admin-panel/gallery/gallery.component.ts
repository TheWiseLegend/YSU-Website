// src/app/admin/admin-panel/gallery/gallery.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { GalleryService } from '../../../services/gallery.service';
import { UploadService } from '../../../services/upload.service'; 

interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  mainImage: string;
  createdAt: string;
  updatedAt: string;
  images: { id: string; url: string }[];
}

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class AdminGalleryComponent implements OnInit {
  albums: GalleryAlbum[] = [];
  albumForm: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  
  // Main image upload
  selectedMainFile: File | null = null;
  mainImagePreview: string | null = null;
  isUploadingMain = false;
  
  // Additional images upload
  selectedFiles: File[] = [];
  imagesPreviews: { file: File; preview: string }[] = [];
  isUploading = false;
  
  // Delete confirmation
  showDeleteConfirmation = false;
  albumToDelete: string | null = null;

  constructor(
    private galleryService: GalleryService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.albumForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      mainImage: ['', Validators.required],
      images: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.isLoading = true;
    this.galleryService.getAllAlbums().subscribe({
      next: (albums) => {
        this.albums = albums.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.setErrorMessage('فشل في تحميل معرض الصور');
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
    this.albumForm.reset();
    this.getImagesArray().clear();
    this.isEditing = false;
    this.editingId = null;
    this.selectedMainFile = null;
    this.mainImagePreview = null;
    this.selectedFiles = [];
    this.imagesPreviews = [];
    this.errorMessage = '';
  }

  getImagesArray(): FormArray {
    return this.albumForm.get('images') as FormArray;
  }

  addImageField(url: string = ''): void {
    this.getImagesArray().push(this.fb.group({
      url: [url, Validators.required]
    }));
  }

  removeImageField(index: number): void {
    this.getImagesArray().removeAt(index);
  }

  onMainFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedMainFile = file;
      
      // Show image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.setErrorMessage('الرجاء اختيار صورة صالحة');
    }
  }

  uploadMainImage(): void {
    if (!this.selectedMainFile) return;

    this.isUploadingMain = true;
    // Pass 'gallery' as folder type to organize uploaded images
    this.uploadService.uploadImage(this.selectedMainFile, 'gallery').subscribe({
      next: (response) => {
        this.albumForm.patchValue({ mainImage: response.imageUrl });
        this.isUploadingMain = false;
        this.selectedMainFile = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في رفع الصورة الرئيسية');
        this.isUploadingMain = false;
      }
    });
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Convert FileList to array and filter for images
      const newFiles = Array.from(files).filter(file => 
        (file as File).type.startsWith('image/')
      ) as File[];
      
      // Create previews for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagesPreviews.push({
            file: file,
            preview: reader.result as string
          });
        };
        reader.readAsDataURL(file);
      });
      
      // Add to selected files array
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
    }
  }

  uploadImages(): void {
    if (this.selectedFiles.length === 0) return;

    this.isUploading = true;
    // Pass 'gallery' as folder type to organize uploaded images
    this.uploadService.uploadMultipleImages(this.selectedFiles, 'gallery').subscribe({
      next: (response) => {
        // Add each image URL to the form array
        response.imageUrls.forEach(url => {
          this.addImageField(url);
        });
        
        this.isUploading = false;
        this.selectedFiles = [];
        this.imagesPreviews = [];
      },
      error: (error) => {
        this.setErrorMessage('فشل في رفع الصور');
        this.isUploading = false;
      }
    });
  }

  editAlbum(album: GalleryAlbum): void {
    this.isEditing = true;
    this.editingId = album.id;
    this.showForm = true;
    
    // Reset form array
    this.getImagesArray().clear();
    
    // Add existing images to form array
    album.images.forEach(image => {
      this.addImageField(image.url);
    });
    
    // Set form values
    this.albumForm.patchValue({
      title: album.title,
      description: album.description || '',
      mainImage: album.mainImage
    });
    
    // Set image preview
    this.mainImagePreview = album.mainImage;
  }

  confirmDeleteAlbum(id: string): void {
    this.albumToDelete = id;
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.albumToDelete = null;
    this.showDeleteConfirmation = false;
  }

  deleteAlbum(): void {
    if (!this.albumToDelete) return;
    
    this.galleryService.deleteAlbum(this.albumToDelete).subscribe({
      next: () => {
        this.setSuccessMessage('تم حذف الألبوم بنجاح');
        this.loadAlbums();
        this.showDeleteConfirmation = false;
        this.albumToDelete = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في حذف الألبوم');
        this.showDeleteConfirmation = false;
        this.albumToDelete = null;
      }
    });
  }

  onSubmit(): void {
    if (this.albumForm.invalid) {
      this.setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    const formValue = this.albumForm.value;
    
    // Convert images form array to the expected format
    const images = formValue.images.map((item: any) => ({
      url: item.url
    }));
    
    const albumData = {
      title: formValue.title,
      description: formValue.description,
      mainImage: formValue.mainImage,
      images: images
    };
    
    if (this.isEditing && this.editingId) {
      this.galleryService.updateAlbum(this.editingId, albumData).subscribe({
        next: () => {
          this.setSuccessMessage('تم تحديث الألبوم بنجاح');
          this.loadAlbums();
          this.toggleForm();
        },
        error: (error) => {
          this.setErrorMessage('فشل في تحديث الألبوم');
        }
      });
    } else {
      this.galleryService.createAlbum(albumData).subscribe({
        next: () => {
          this.setSuccessMessage('تم إضافة الألبوم بنجاح');
          this.loadAlbums();
          this.toggleForm();
        },
        error: (error) => {
          this.setErrorMessage('فشل في إضافة الألبوم');
        }
      });
    }
  }

  removeImage(albumId: string, imageId: string): void {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      this.galleryService.removeImage(imageId).subscribe({
        next: () => {
          this.setSuccessMessage('تم حذف الصورة بنجاح');
          // Update the album in the UI
          const album = this.albums.find(a => a.id === albumId);
          if (album) {
            album.images = album.images.filter(img => img.id !== imageId);
          }
        },
        error: (error) => {
          this.setErrorMessage('فشل في حذف الصورة');
        }
      });
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

  removePreview(index: number): void {
    this.imagesPreviews.splice(index, 1);
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
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