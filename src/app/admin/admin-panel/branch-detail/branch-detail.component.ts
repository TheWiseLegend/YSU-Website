// src/app/admin/admin-panel/branches/branch-detail/branch-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BranchesService, Branch } from '../../../services/branches.service';

@Component({
  selector: 'app-admin-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss']
})
export class AdminBranchDetailComponent implements OnInit {
  branchId: string | null = null;
  branch: Branch | undefined;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private branchesService: BranchesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.branchId = params.get('id');
      
      if (this.branchId) {
        this.loadBranchDetails();
      }
    });
  }

  loadBranchDetails(): void {
    if (!this.branchId) return;

    this.isLoading = true;
    this.branchesService.getBranchById(this.branchId).subscribe({
      next: (branch) => {
        this.branch = branch;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل تفاصيل الفرع';
        this.isLoading = false;
      }
    });
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
}