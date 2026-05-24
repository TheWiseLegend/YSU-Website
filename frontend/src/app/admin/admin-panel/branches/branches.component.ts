// src/app/admin/admin-panel/branches/branches.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchesService } from '../../../services/branches.service';
import { UploadService } from '../../../services/upload.service';
import { RouterModule } from '@angular/router';

export interface Branch {
  id: string;
  universityName: string;
  city: string;
  address: string;
  imageUrl: string;
  phone: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  description: string;
  establishedAt: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-branches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class AdminBranchesComponent implements OnInit {
  branches: Branch[] = [];
  branchForm: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  isSubmitting = false;
  showDeleteConfirmation = false;
  branchToDelete: string | null = null;

  constructor(
    private branchesService: BranchesService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.branchForm = this.fb.group({
      universityName: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      facebook: [''],
      instagram: [''],
      linkedin: [''],
      description: ['', Validators.required],
      establishedAt: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.branchesService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches = branches.sort((a, b) => 
          a.universityName.localeCompare(b.universityName)
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.setErrorMessage('فشل في تحميل الفروع');
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
    this.branchForm.reset();
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
    // Pass 'branches' as folder type to organize uploaded images
    this.uploadService.uploadImage(this.selectedFile, 'branches').subscribe({
      next: (response) => {
        this.branchForm.patchValue({ imageUrl: response.imageUrl });
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في رفع الصورة');
        this.isUploading = false;
      }
    });
  }

  editBranch(branch: Branch): void {
    this.isEditing = true;
    this.editingId = branch.id;
    this.showForm = true;
    
    // Format the date for the input field
    const branchDate = new Date(branch.establishedAt);
    const formattedDate = branchDate.toISOString().split('T')[0];
    
    this.branchForm.patchValue({
      universityName: branch.universityName,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      email: branch.email || '',
      facebook: branch.facebook || '',
      instagram: branch.instagram || '',
      linkedin: branch.linkedin || '',
      description: branch.description,
      establishedAt: formattedDate,
      imageUrl: branch.imageUrl
    });
    
    this.imagePreview = branch.imageUrl;
  }

  confirmDeleteBranch(id: string): void {
    this.branchToDelete = id;
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.branchToDelete = null;
    this.showDeleteConfirmation = false;
  }

  deleteBranch(): void {
    if (!this.branchToDelete) return;
    
    this.branchesService.deleteBranch(this.branchToDelete).subscribe({
      next: () => {
        this.setSuccessMessage('تم حذف الفرع بنجاح');
        this.loadBranches();
        this.showDeleteConfirmation = false;
        this.branchToDelete = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في حذف الفرع');
        this.showDeleteConfirmation = false;
        this.branchToDelete = null;
      }
    });
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      this.setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    this.isSubmitting = true;
    const formValue = this.branchForm.value;
    
    // Ensure the date is in ISO format
    if (formValue.establishedAt) {
      const date = new Date(formValue.establishedAt);
      formValue.establishedAt = date.toISOString();
    }
    
    if (this.isEditing && this.editingId) {
      this.branchesService.updateBranch(this.editingId, formValue).subscribe({
        next: () => {
          this.setSuccessMessage('تم تحديث الفرع بنجاح');
          this.loadBranches();
          this.toggleForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.setErrorMessage('فشل في تحديث الفرع');
          this.isSubmitting = false;
        }
      });
    } else {
      this.branchesService.createBranch(formValue).subscribe({
        next: () => {
          this.setSuccessMessage('تم إضافة الفرع بنجاح');
          this.loadBranches();
          this.toggleForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.setErrorMessage('فشل في إضافة الفرع');
          this.isSubmitting = false;
        }
      });
    }
  }

  formatDate(dateString: string): string {
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