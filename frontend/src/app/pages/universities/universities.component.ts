// src/app/pages/universities/universities.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { UniversityCardComponent } from '../../components/university-card/university-card.component';
import { UniversityFilterComponent } from '../../components/university-filter/university-filter.component';
import { UNIVERSITIES } from '../../data/universities-data';
import { University } from '../../models/university.model';
import { UniversityFilter } from '../../models/university-filter.model';

@Component({
  selector: 'app-universities',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    UniversityCardComponent,
    UniversityFilterComponent
  ],
  templateUrl: './universities.component.html',
  styleUrls: ['./universities.component.scss']
})
export class UniversitiesComponent implements OnInit {
  // All universities from our data
  universities = UNIVERSITIES;
  
  // Filtered universities to display
  filteredUniversities: University[] = [];
  
  // Current active filters
  activeFilter: UniversityFilter = {};
  
  ngOnInit(): void {
    // Initialize with all universities
    this.filteredUniversities = [...this.universities];
  }
  
  // Handle filter changes
  onFiltersChanged(filters: UniversityFilter): void {
    console.log('Filters changed:', filters);
    this.activeFilter = filters;
    this.applyFilters();
  }
  
  // Apply filters to universities list
  private applyFilters(): void {
    console.log('Applying filters...');
    this.filteredUniversities = this.universities.filter(university => {
      // Start with assuming this university passes all filters
      let matchesFilter = true;
      
      // Filter by city
      if (this.activeFilter.city && this.activeFilter.city.trim() !== '') {
        matchesFilter = matchesFilter && university.location === this.activeFilter.city;
      }
      
      // Filter by type
      if (this.activeFilter.types && this.activeFilter.types.length > 0) {
        matchesFilter = matchesFilter && this.activeFilter.types.includes(university.type);
      }
      
      // Filter by tuition fee range
      if (this.activeFilter.minFee !== undefined) {
        matchesFilter = matchesFilter && university.tuitionFee >= this.activeFilter.minFee;
      }
      
      if (this.activeFilter.maxFee !== undefined) {
        matchesFilter = matchesFilter && university.tuitionFee <= this.activeFilter.maxFee;
      }
      
      // Filter by language
      if (this.activeFilter.languages && this.activeFilter.languages.length > 0) {
        matchesFilter = matchesFilter && this.hasCommonElement(university.language, this.activeFilter.languages);
      }
      
      // Filter by courses
      if (this.activeFilter.courses && this.activeFilter.courses.length > 0) {
        matchesFilter = matchesFilter && this.hasCommonElement(university.courses, this.activeFilter.courses);
      }
      
      // Filter by union branch
      if (this.activeFilter.hasUnionBranch) {
        matchesFilter = matchesFilter && university.hasUnionBranch;
      }
      
      return matchesFilter;
    });
    
    console.log('Filtered universities:', this.filteredUniversities.length);
  }
  
  // Helper method to check if two arrays have at least one common element
  private hasCommonElement(array1: string[], array2: string[]): boolean {
    return array1.some(item => array2.includes(item));
  }
}