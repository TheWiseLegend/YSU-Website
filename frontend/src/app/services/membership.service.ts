import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { MemberAuthService } from './member-auth.service';
import { Member, MembershipApplication } from '../models/member.model';

export interface ApplyFormData {
  passportNumber: string;
  phone: string;
  gender: string;
  address: string;
  university: string;
  studentId: string;
  fieldOfStudy: string;
  yearOfStudy: number;
  graduationYear: number;
  enrollmentLetter: File;
  receipt: File;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private memberAuthService: MemberAuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.memberAuthService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getMe(): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/members/me`, {
      headers: this.getHeaders(),
    }).pipe(catchError(this.handleError));
  }

  apply(data: ApplyFormData): Observable<MembershipApplication> {
    const formData = new FormData();
    formData.append('passportNumber', data.passportNumber);
    formData.append('phone', data.phone);
    formData.append('gender', data.gender);
    formData.append('address', data.address);
    formData.append('university', data.university);
    formData.append('studentId', data.studentId);
    formData.append('fieldOfStudy', data.fieldOfStudy);
    formData.append('yearOfStudy', data.yearOfStudy.toString());
    formData.append('graduationYear', data.graduationYear.toString());
    formData.append('enrollmentLetter', data.enrollmentLetter);
    formData.append('receipt', data.receipt);

    return this.http.post<MembershipApplication>(
      `${this.apiUrl}/members/apply`,
      formData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  uploadProfileImage(file: File): Observable<Member> {
    const formData = new FormData();
    formData.append('profileImage', file);

    return this.http.patch<Member>(
      `${this.apiUrl}/members/profile-image`,
      formData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error.status === 400) errorMessage = error.error?.message ?? 'بيانات غير صحيحة';
    else if (error.status === 401) errorMessage = 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً';
    else if (error.status === 0) errorMessage = 'خطأ في الاتصال بالخادم';
    return throwError(() => errorMessage);
  }
}