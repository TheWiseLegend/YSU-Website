import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminMembershipService } from '../../../services/admin-membership.service';
import { Member, MembershipApplication } from '../../../models/member.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit {
  members: Member[] = [];
  isLoading = true;
  activeTab: 'pending' | 'active' | 'expired' | 'all' = 'pending';

  selectedMember: Member | null = null;
  isApproving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private adminMembershipService: AdminMembershipService) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const status = this.activeTab === 'all' ? undefined : this.activeTab;

    this.adminMembershipService.getAllMembers(status).subscribe({
      next: (members) => {
        this.members = members;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'حدث خطأ أثناء تحميل البيانات';
        this.isLoading = false;
      }
    });
  }

  setTab(tab: 'pending' | 'active' | 'expired' | 'all'): void {
    this.activeTab = tab;
    this.selectedMember = null;
    this.loadMembers();
  }

  selectMember(member: Member): void {
    this.selectedMember = member;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeDetail(): void {
    this.selectedMember = null;
  }

  getLatestApplication(member: Member): MembershipApplication | null {
    return member.applications?.[0] ?? null;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'قيد المراجعة',
      active: 'نشط',
      expired: 'منتهي',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      active: 'status-active',
      expired: 'status-expired',
    };
    return map[status] ?? '';
  }

  approve(applicationId: string): void {
    this.isApproving = true;
    this.errorMessage = '';

    this.adminMembershipService.approveApplication(applicationId).subscribe({
      next: () => {
        this.successMessage = 'تمت الموافقة على العضوية بنجاح';
        this.isApproving = false;
        this.selectedMember = null;
        this.loadMembers();
      },
      error: () => {
        this.errorMessage = 'حدث خطأ أثناء الموافقة';
        this.isApproving = false;
      }
    });
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ar-SA');
  }

  showCancelModal = false;
cancelReason = '';
pendingCancelApplicationId = '';

openCancelModal(applicationId: string): void {
  this.pendingCancelApplicationId = applicationId;
  this.cancelReason = '';
  this.showCancelModal = true;
}

closeCancelModal(): void {
  this.showCancelModal = false;
  this.pendingCancelApplicationId = '';
  this.cancelReason = '';
}

confirmCancel(): void {
  if (!this.cancelReason.trim()) return;
  this.isApproving = true;

  this.adminMembershipService.cancelApplication(
    this.pendingCancelApplicationId,
    this.cancelReason
  ).subscribe({
    next: () => {
      this.successMessage = 'تم إلغاء الطلب بنجاح';
      this.isApproving = false;
      this.showCancelModal = false;
      this.selectedMember = null;
      this.loadMembers();
    },
    error: () => {
      this.errorMessage = 'حدث خطأ أثناء إلغاء الطلب';
      this.isApproving = false;
    }
  });
}
}