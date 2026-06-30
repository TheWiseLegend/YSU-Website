import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminMembershipService } from '../../../services/admin-membership.service';
import { Member, MembershipApplication } from '../../../models/member.model';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';

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

  constructor(private adminMembershipService: AdminMembershipService, private http: HttpClient) {}

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

  downloadProfileImage(member: Member): void {
    if (!member.profileImageUrl) return;

    this.http.get(member.profileImageUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `${member.membershipId}_${member.fullNameEn}.webp`;

        // iOS Safari doesn't support <a download> — open in new tab instead
        if (typeof link.download === 'undefined') {
          window.open(objectUrl, '_blank');
        } else {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      },
      error: () => {
        // Fallback: open image in new tab (always works on mobile)
        if (member.profileImageUrl) window.open(member.profileImageUrl, '_blank');
      }
    });
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

exportToExcel(): void {
  if (this.members.length === 0) return;
  const tabLabel: Record<string, string> = {
    pending: 'قيد المراجعة',
    active: 'نشط',
    expired: 'منتهي',
    all: 'الكل',
  };

  const data = this.members.map((member) => {
    const app = this.getLatestApplication(member);
    return {
      'رقم العضوية': member.membershipId,
      'الاسم بالعربية': member.fullNameAr,
      'الاسم بالإنجليزية': member.fullNameEn,
      'البريد الإلكتروني': member.email,
      'الجامعة': app?.university ?? '—',
      'التخصص': app?.fieldOfStudy ?? '—',
      'السنة الدراسية': app?.yearOfStudy ?? '—',
      'رقم الهاتف': app?.phone ?? '—',
      'جواز السفر': app?.passportNumber ?? '—',
      'الحالة': app ? this.getStatusLabel(app.status) : 'جديد',
      'تاريخ التقديم': app ? this.formatDate(app.submittedAt) : '—',
      'تاريخ الموافقة': app?.approvedAt ? this.formatDate(app.approvedAt) : '—',
      'تاريخ الانتهاء': app?.expiresAt ? this.formatDate(app.expiresAt) : '—',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, tabLabel[this.activeTab] ?? 'أعضاء');

  const fileName = `أعضاء_${tabLabel[this.activeTab] ?? 'الكل'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

  // ─── QR Code modal (on-demand) ────────────────────────────
  showQrModal = false;
  qrMember: Member | null = null;
  qrCodeDataUrl = '';
  qrVerifyUrl = '';
  isGeneratingQr = false;
  qrLinkCopied = false;

  async openQrModal(member: Member): Promise<void> {
    this.qrMember = member;
    this.showQrModal = true;
    this.qrLinkCopied = false;
    this.qrCodeDataUrl = '';
    this.qrVerifyUrl = `${window.location.origin}/verify/${member.membershipId}`;
    this.isGeneratingQr = true;

    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(this.qrVerifyUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#2E3F6E', light: '#FFFFFF' },
      });
    } catch {
      this.errorMessage = 'حدث خطأ أثناء إنشاء رمز QR';
    } finally {
      this.isGeneratingQr = false;
    }
  }

  closeQrModal(): void {
    this.showQrModal = false;
    this.qrMember = null;
    this.qrCodeDataUrl = '';
    this.qrVerifyUrl = '';
    this.qrLinkCopied = false;
  }

  downloadQrCode(): void {
    if (!this.qrCodeDataUrl || !this.qrMember) return;

    // Convert data URL → Blob → object URL (same flow as profile image download,
    // which works on iOS Safari where direct data-URL downloads fail).
    const blob = this.dataUrlToBlob(this.qrCodeDataUrl);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `QR_${this.qrMember.membershipId}.png`;

    if (typeof link.download === 'undefined') {
      window.open(objectUrl, '_blank');
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  copyQrLink(): void {
    if (!this.qrVerifyUrl) return;
    navigator.clipboard.writeText(this.qrVerifyUrl).then(
      () => {
        this.qrLinkCopied = true;
        setTimeout(() => (this.qrLinkCopied = false), 2000);
      },
      () => {
        this.errorMessage = 'تعذّر نسخ الرابط';
      }
    );
  }
}