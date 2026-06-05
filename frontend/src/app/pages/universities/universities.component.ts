// src/app/pages/universities/universities.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { UniversityCardComponent } from '../../components/university-card/university-card.component';
import { UniversityFilterComponent } from '../../components/university-filter/university-filter.component';
import { UNIVERSITIES } from '../../data/universities-data';
import { University } from '../../models/university.model';
import { UniversityFilter } from '../../models/university-filter.model';

const FILTER_STORAGE_KEY = 'universities_filter';

@Component({
  selector: 'app-universities',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    UniversityCardComponent,
    UniversityFilterComponent,
  ],
  templateUrl: './universities.component.html',
  styleUrls: ['./universities.component.scss'],
})
export class UniversitiesComponent implements OnInit, AfterViewInit {
  universities = UNIVERSITIES;
  filteredUniversities: University[] = [];
  activeFilter: UniversityFilter = {};

  /** Passed down to the filter component so it can pre-tick restored state */
  initialFilter: UniversityFilter = {};

  private pendingScrollY: number | null = null;

  constructor(
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    // ── Restore filter from sessionStorage ──────────────────
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        this.initialFilter = JSON.parse(saved) as UniversityFilter;
        this.activeFilter = { ...this.initialFilter };
      } catch {
        this.initialFilter = {};
      }
    }

    this.applyFilters();

    // ── Stash the scroll target for AfterViewInit ────────────
    const scrollY = history.state?.scrollY;
    if (scrollY) {
      this.pendingScrollY = scrollY;
    }
  }

  ngAfterViewInit(): void {
    // DOM is fully rendered — now safe to scroll
    if (this.pendingScrollY !== null) {
      const target = this.pendingScrollY;
      this.pendingScrollY = null;
      // rAF ensures the browser has painted the layout before we jump
      requestAnimationFrame(() => {
        window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });
      });
    }
  }

  // ── Called by the filter component on every change ───────
  onFiltersChanged(filters: UniversityFilter): void {
    this.activeFilter = filters;
    this.applyFilters();
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }

  // ── Navigate to detail, saving scroll position first ─────
  navigateToUniversity(universityId: string): void {
    const currentState = { ...history.state, scrollY: window.scrollY };
    this.location.replaceState(this.location.path(true), '', currentState);
    this.router.navigate(['/universities', universityId]);
  }

  private applyFilters(): void {
    this.filteredUniversities = this.universities.filter((university) => {
      let match = true;

      if (this.activeFilter.city?.trim()) {
        match = match && university.location === this.activeFilter.city;
      }

      if (this.activeFilter.types?.length) {
        match = match && this.activeFilter.types.includes(university.type);
      }

      if (this.activeFilter.minFee !== undefined) {
        match = match && university.tuitionFee >= this.activeFilter.minFee;
      }

      if (this.activeFilter.maxFee !== undefined) {
        match = match && university.tuitionFee <= this.activeFilter.maxFee;
      }

      if (this.activeFilter.languages?.length) {
        match = match && this.hasCommonElement(university.language, this.activeFilter.languages);
      }

      if (this.activeFilter.courses?.length) {
        match = match && this.hasCommonElement(university.courses, this.activeFilter.courses);
      }

      if (this.activeFilter.hasUnionBranch) {
        match = match && university.hasUnionBranch;
      }

      return match;
    });
  }

  private hasCommonElement(a: string[], b: string[]): boolean {
    return a.some((item) => b.includes(item));
  }
}
