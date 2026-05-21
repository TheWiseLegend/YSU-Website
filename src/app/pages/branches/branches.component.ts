// src/app/pages/branches/branches.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { BranchCardComponent } from '../../components/branch-card/branch-card.component';
import { PublicBranchesService } from '../../services/public-branches.service';
import { Branch } from '../../services/branches.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, BranchCardComponent, RouterModule],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit {
  // All branches data
  allBranches: Branch[] = [];
  
  // Filtered branches to display
  filteredBranches: Branch[] = [];
  
  // List of cities for the filter
  cities: string[] = [];
  
  // Selected city filter
  selectedCity: string = 'الكل';

  // Loading state
  isLoading: boolean = true;

  // Error message
  errorMessage: string = '';

  constructor(private publicBranchesService: PublicBranchesService) { }

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.publicBranchesService.getAllBranches().subscribe({
      next: (branches) => {
        this.allBranches = branches;
        this.filteredBranches = [...this.allBranches];
        
        // Extract unique cities from branches
        this.extractCities();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.errorMessage = 'فشل في تحميل الفروع. يرجى المحاولة مرة أخرى لاحقًا.';
        this.isLoading = false;
      }
    });
  }
  
  // Extract unique cities from branches
  extractCities(): void {
    const citySet = new Set<string>();
    citySet.add('الكل'); 
    
    this.allBranches.forEach(branch => {
      if (branch.city) {
        citySet.add(branch.city);
      }
    });
    
    this.cities = Array.from(citySet);
  }
  
  // Filter branches by city
  filterByCity(city: string): void {
    this.selectedCity = city;
    
    if (city === 'الكل') {
      this.filteredBranches = [...this.allBranches];
    } else {
      this.filteredBranches = this.allBranches.filter(branch => branch.city === city);
    }
  }
}