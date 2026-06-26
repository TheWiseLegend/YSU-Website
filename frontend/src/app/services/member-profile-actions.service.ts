import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Bridges profile-menu actions raised by the shared NavbarComponent
 * (change photo / change password) to the page that owns the modals
 * (e.g. the membership dashboard).
 */
@Injectable({ providedIn: 'root' })
export class MemberProfileActionsService {
  private changePhotoSubject = new Subject<void>();
  private changePasswordSubject = new Subject<void>();

  changePhoto$: Observable<void> = this.changePhotoSubject.asObservable();
  changePassword$: Observable<void> = this.changePasswordSubject.asObservable();

  requestChangePhoto(): void {
    this.changePhotoSubject.next();
  }

  requestChangePassword(): void {
    this.changePasswordSubject.next();
  }
}
