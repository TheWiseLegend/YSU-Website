// src/app/components/navbar/navbar.component.ts
// Updated navbar component with ViewEncapsulation.None

import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None  // Add this line
})
export class NavbarComponent {
  isMenuOpen = false;
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    
    if (this.isMenuOpen) {
      setTimeout(() => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
          navLinks.scrollHeight;
        }
      }, 10);
    }
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (target.closest('.menu-toggle')) {
      return;
    }
    
    if (this.isMenuOpen && 
        (!target.closest('.nav-links') || target.closest('a'))) {
      this.isMenuOpen = false;
    }
  }
}