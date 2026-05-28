export type MembershipStatus = 'pending' | 'active' | 'expired' | 'cancelled';

export interface MembershipApplication {
  id: string;
  memberId: string;
  passportNumber: string;
  phone: string;
  gender: string;
  address: string;
  university: string;
  studentId: string;
  fieldOfStudy: string;
  yearOfStudy: number;
  graduationYear: number;
  enrollmentLetterUrl: string;
  receiptUrl: string;
  status: MembershipStatus;
  submittedAt: string;
  approvedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
}

export interface Member {
  id: string;
  membershipId: string;
  email: string;
  fullNameAr: string;
  fullNameEn: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  applications: MembershipApplication[];
}

export interface MemberWithLatestApplication extends Member {
  latestApplication: MembershipApplication | null;
  currentStatus: 'new' | MembershipStatus;
}