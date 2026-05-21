// src/app/admin/admin-panel/branch-team/branch-team.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamMembersService } from '../../../services/team-members.service';
import { UploadService } from '../../../services/upload.service';
import { BranchesService } from '../../../services/branches.service';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  type: string;
  imageUrl: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-branch-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './branch-team.component.html',
  styleUrls: ['./branch-team.component.scss']
})
export class BranchTeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  memberForm: FormGroup;
  branchId: string | null = null;
  branchName: string = '';
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
  
  // Member types 
  memberTypes = ['الهيئة التنفيذية', 'لجنة الرقابة والتفتيش'];
  
  // For filtering members by type
  selectedType: string | null = null;

  constructor(
    private teamMembersService: TeamMembersService,
    private branchesService: BranchesService,
    private uploadService: UploadService, 
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      position: ['', Validators.required],
      type: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get the branch ID from the URL
    this.route.paramMap.subscribe(params => {
      this.branchId = params.get('id');
      
      if (this.branchId) {
        this.loadBranchDetails();
        this.loadTeamMembers();
      }
    });
  }
  
  loadBranchDetails(): void {
    if (!this.branchId) return;
    
    this.branchesService.getBranchById(this.branchId).subscribe({
      next: (branch) => {
        this.branchName = branch.universityName;
      },
      error: (error) => {
        console.error('Error loading branch details:', error);
      }
    });
  }

  loadTeamMembers(): void {
    if (!this.branchId) return;
    
    this.isLoading = true;
    this.teamMembersService.getTeamMembersByBranchId(this.branchId).subscribe({
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
    this.uploadService.uploadImage(this.selectedFile, 'branches').subscribe({
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

  editMember(member: TeamMember): void {
    this.isEditing = true;
    this.editingId = member.id;
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
    
    this.teamMembersService.deleteTeamMember(this.memberToDelete).subscribe({
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

  onSubmit(): void {
    if (this.memberForm.invalid) {
      this.setErrorMessage('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    if (!this.branchId) {
      this.setErrorMessage('معرف الفرع غير متوفر');
      return;
    }
    
    const formValue = this.memberForm.value;
    const memberData = {
      ...formValue,
      branchId: this.branchId
    };
    
    if (this.isEditing && this.editingId) {
      this.teamMembersService.updateTeamMember(this.editingId, formValue).subscribe({
        next: () => {
          this.setSuccessMessage('تم تحديث العضو بنجاح');
          this.loadTeamMembers();
          this.toggleForm();
        },
        error: (error) => {
          this.setErrorMessage('فشل في تحديث العضو');
        }
      });
    } else {
      this.teamMembersService.createTeamMember(memberData).subscribe({
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

  // Get leadership members (president and vice president)
  getLeadershipMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      member.position.includes('رئيس') || 
      member.position.includes('نائب الرئيس')
    );
  }
  
  // Get all non-leadership members
  getOtherMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      !member.position.includes('رئيس') && 
      !member.position.includes('نائب الرئيس')
    );
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

  // Get administrative team members
  getAdministrativeMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      member.type === 'الهيئة التنفيذية'
    );
  }
  
  // Get supervisory team members
  getSupervisoryMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      member.type === 'لجنة الرقابة والتفتيش'
    );
  }

  getAdministrativeLeaders(): TeamMember[] {
    return this.getAdministrativeMembers().filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
  }

  getAdministrativeOtherMembers(): TeamMember[] {
    return this.getAdministrativeMembers().filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  getSupervisoryLeaders(): TeamMember[] {
    return this.getSupervisoryMembers().filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
  }

  getSupervisoryOtherMembers(): TeamMember[] {
    return this.getSupervisoryMembers().filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  hasAdministrativeLeaders(): boolean {
    return this.getAdministrativeLeaders().length > 0;
  }

  hasSupervisoryLeaders(): boolean {
    return this.getSupervisoryLeaders().length > 0;
  }
}