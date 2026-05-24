// src/app/admin/admin-panel/union-team/union-team.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UnionTeamService, CreateUnionTeamMemberDto, UpdateUnionTeamMemberDto } from '../../../services/union-team.service';
import { UploadService } from '../../../services/upload.service';
import { UnionTeamMember } from '../../../services/public-union-team.service';

@Component({
  selector: 'app-admin-union-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './union-team.component.html',
  styleUrls: ['./union-team.component.scss']
})
export class AdminUnionTeamComponent implements OnInit {
  teamMembers: UnionTeamMember[] = [];
  memberForm: FormGroup;
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
  memberToDelete: string | null = null;
  
  // Store the current editing member data
  currentEditingMember: UnionTeamMember | null = null;
  
  // Type filter options
  memberTypes = ['الهيئة الإدارية', 'هيئة الرقابة والتفتيش', 'أخرى'];
  selectedType: string | null = null;
  searchTerm: string = '';

  constructor(
    private unionTeamService: UnionTeamService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      position: ['', Validators.required],
      type: ['', Validators.required],
      imageUrl: ['', Validators.required],
      period: [this.getCurrentPeriod(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.unionTeamService.getAllMembers().subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.isLoading = false;
      },
      error: (error) => {
        this.setErrorMessage('فشل في تحميل أعضاء الفريق');
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
    this.memberForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.currentEditingMember = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
  }

  getCurrentPeriod(): string {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
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
    this.uploadService.uploadImage(this.selectedFile, 'union-team').subscribe({
      next: (response) => {
        this.memberForm.patchValue({ imageUrl: response.imageUrl });
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: (error) => {
        this.setErrorMessage('فشل في رفع الصورة');
        this.isUploading = false;
      }
    });
  }

  editMember(member: UnionTeamMember): void {
    this.isEditing = true;
    this.editingId = member.id;
    this.currentEditingMember = member;
    this.showForm = true;
    this.memberForm.patchValue({
      name: member.name,
      position: member.position,
      type: member.type,
      imageUrl: member.imageUrl
    });
    this.imagePreview = member.imageUrl;
  }

  confirmDeleteMember(id: string): void {
    this.memberToDelete = id;
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.memberToDelete = null;
    this.showDeleteConfirmation = false;
  }

  deleteMember(): void {
    if (!this.memberToDelete) return;
    
    // Find the member to get their image URL
    const memberToDelete = this.teamMembers.find(member => member.id === this.memberToDelete);
    
    if (memberToDelete && memberToDelete.imageUrl) {
      // Delete member and image using the new method
      this.unionTeamService.deleteMemberWithImage(this.memberToDelete, memberToDelete.imageUrl).subscribe({
        next: () => {
          this.setSuccessMessage('تم حذف العضو والصورة بنجاح');
          this.loadTeamMembers();
          this.showDeleteConfirmation = false;
          this.memberToDelete = null;
        },
        error: (error) => {
          this.setErrorMessage('فشل في حذف العضو');
          this.showDeleteConfirmation = false;
          this.memberToDelete = null;
        }
      });
    } else {
      // Fallback to regular delete if no image URL
      this.unionTeamService.deleteMember(this.memberToDelete).subscribe({
        next: () => {
          this.setSuccessMessage('تم حذف العضو بنجاح');
          this.loadTeamMembers();
          this.showDeleteConfirmation = false;
          this.memberToDelete = null;
        },
        error: (error) => {
          this.setErrorMessage('فشل في حذف العضو');
          this.showDeleteConfirmation = false;
          this.memberToDelete = null;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.memberForm.invalid) {
      this.setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    const formValue = this.memberForm.value;
    
    if (this.isEditing && this.editingId && this.currentEditingMember) {
      // Check if a new image was selected and uploaded
      if (this.selectedFile && this.currentEditingMember.imageUrl !== formValue.imageUrl) {
        // Replace the image and update the member
        this.unionTeamService.updateMemberWithImageReplace(
          this.editingId, 
          formValue, 
          this.currentEditingMember.imageUrl,
          this.selectedFile
        ).subscribe({
          next: () => {
            this.setSuccessMessage('تم تحديث العضو والصورة بنجاح');
            this.loadTeamMembers();
            this.toggleForm();
          },
          error: (error) => {
            this.setErrorMessage('فشل في تحديث العضو');
          }
        });
      } else {
        // Just update the member without changing the image
        this.unionTeamService.updateMember(this.editingId, formValue).subscribe({
          next: () => {
            this.setSuccessMessage('تم تحديث العضو بنجاح');
            this.loadTeamMembers();
            this.toggleForm();
          },
          error: (error) => {
            this.setErrorMessage('فشل في تحديث العضو');
          }
        });
      }
    } else {
      // Create new member
      this.unionTeamService.createMember(formValue as CreateUnionTeamMemberDto).subscribe({
        next: () => {
          this.setSuccessMessage('تم إضافة العضو بنجاح');
          this.loadTeamMembers();
          this.toggleForm();
        },
        error: (error) => {
          this.setErrorMessage('فشل في إضافة العضو');
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

  // Filter methods
  filterByType(type: string | null): void {
    this.selectedType = type;
  }

  get filteredMembers(): UnionTeamMember[] {
    let filtered = [...this.teamMembers];
    
    // Apply type filter
    if (this.selectedType) {
      filtered = filtered.filter(member => member.type === this.selectedType);
    }
    
    // Apply search filter if search term exists
    if (this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchLower) ||
        member.position.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }
}