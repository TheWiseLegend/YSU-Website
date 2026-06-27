import { Component, HostListener, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';
import { MemberAuthService } from '../../services/member-auth.service';
import { MembershipService } from '../../services/membership.service';
import { MemberProfileActionsService } from '../../services/member-profile-actions.service';
import { Member } from '../../models/member.model';

// Routes where the navbar should always be solid (no dark hero behind it)
const SOLID_NAV_ROUTES = ['/verify', '/membership'];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isMoreOpen = false;
  isMobileMoreOpen = false;
  isScrolled = false;
  forceSolid = false;

  // Auth / profile state
  isLoggedIn = false;
  member: Member | null = null;
  imageFailed = false;
  // True on /membership/* pages — there we swap العضوية for the profile menu
  isMembershipArea = false;
  showProfileMenu = false;

  private authSub?: Subscription;

  get isDark() { return this.themeService.isDark; }

  // Show the profile menu instead of the العضوية button only when the member
  // is logged in AND viewing a membership-area page.
  get showProfile(): boolean {
    return this.isLoggedIn && this.isMembershipArea;
  }

  get memberInitials(): string {
    const name = this.member?.fullNameAr?.trim();
    if (!name) return '';
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private memberAuthService: MemberAuthService,
    private membershipService: MembershipService,
    private profileActions: MemberProfileActionsService,
    private zone: NgZone,
  ) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      this.forceSolid = SOLID_NAV_ROUTES.some(r => url.startsWith(r));
      this.isMembershipArea = url.startsWith('/membership');
    });

    // Seed from the current URL — on a full reload the navbar is created after
    // the router's initial NavigationEnd has already fired, so the subscription
    // above would otherwise miss it.
    const currentUrl = this.router.url;
    this.forceSolid = SOLID_NAV_ROUTES.some(r => currentUrl.startsWith(r));
    this.isMembershipArea = currentUrl.startsWith('/membership');

    this.authSub = this.memberAuthService.loggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.imageFailed = false;
        this.membershipService.getMe().subscribe({
          next: (member) => (this.member = member),
          error: () => (this.member = null),
        });
      } else {
        this.member = null;
      }
    });
  }

  ngOnInit(): void {
    // Bind scroll OUTSIDE Angular's zone so it doesn't trigger a full app
    // change-detection pass on every scroll tick (the main source of scroll
    // jank, worst on Safari). Only re-enter the zone when isScrolled actually
    // flips — which happens once around the 20px threshold.
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScrollHandler, { passive: true });
    });
  }

  private onScrollHandler = (): void => {
    const scrolled = window.scrollY > 20;
    if (scrolled !== this.isScrolled) {
      this.zone.run(() => {
        this.isScrolled = scrolled;
      });
    }
  };

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    window.removeEventListener('scroll', this.onScrollHandler);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) this.isMobileMoreOpen = false;
  }

  toggleMore(event: Event): void {
    event.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }

  toggleMobileMore(event: Event): void {
    event.stopPropagation();
    this.isMobileMoreOpen = !this.isMobileMoreOpen;
  }

  closeMore(): void {
    this.isMoreOpen = false;
  }

  // ── Profile menu ──────────────────────────────────────────
  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  onChangePhoto(): void {
    this.showProfileMenu = false;
    this.profileActions.requestChangePhoto();
  }

  onChangePassword(): void {
    this.showProfileMenu = false;
    this.profileActions.requestChangePassword();
  }

  logout(): void {
    this.showProfileMenu = false;
    this.memberAuthService.logout();
    this.router.navigate(['/membership/login']);
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.menu-toggle')) return;
    if (this.isMenuOpen && (!target.closest('.nav-links') || target.closest('a'))) {
      this.isMenuOpen = false;
      this.isMobileMoreOpen = false;
    }
    if (!target.closest('.more-dropdown-wrapper')) {
      this.isMoreOpen = false;
    }
    if (!target.closest('.profile-wrapper')) {
      this.showProfileMenu = false;
    }
  }
}
