import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMore(event: Event): void {
    event.stopPropagation();
    this.isMoreOpen = !this.isMoreOpen;
  }

  closeMore(): void {
    this.isMoreOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: Event): void {
    const target = event.target as HTMLElement;

    if (target.closest('.menu-toggle')) return;

    if (this.isMenuOpen &&
      (!target.closest('.nav-links') || target.closest('a'))) {
      this.isMenuOpen = false;
    }

    if (!target.closest('.more-dropdown-wrapper')) {
      this.isMoreOpen = false;
    }
  }
}
