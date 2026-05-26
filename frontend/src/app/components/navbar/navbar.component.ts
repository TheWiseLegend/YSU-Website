import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

// Routes where the navbar should always be solid (no dark hero behind it)
const SOLID_NAV_ROUTES = ['/verify', '/contact', '/digital-library'];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  isMenuOpen = false;
  isMoreOpen = false;
  isMobileMoreOpen = false;
  isScrolled = false;
  forceSolid = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.forceSolid = SOLID_NAV_ROUTES.some(r => e.urlAfterRedirects.startsWith(r));
    });
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

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
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
  }
}
