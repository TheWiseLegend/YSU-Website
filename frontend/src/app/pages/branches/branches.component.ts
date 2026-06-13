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
  allBranches: Branch[] = [];
  filteredBranches: Branch[] = [];
  cities: string[] = [];
  selectedCity = 'الكل';
  isLoading = true;
  errorMessage = '';

  constructor(private publicBranchesService: PublicBranchesService) { }

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.publicBranchesService.getAllBranches().subscribe({
      next: (branches) => {
        this.allBranches = branches;
        this.filteredBranches = [...branches];
        this.extractCities();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'فشل في تحميل الفروع. يرجى المحاولة مرة أخرى لاحقًا.';
        this.isLoading = false;
      }
    });
  }

  extractCities(): void {
    const citySet = new Set<string>(['الكل']);
    this.allBranches.forEach(b => { if (b.city) citySet.add(b.city); });
    this.cities = Array.from(citySet);
  }

  filterByCity(city: string): void {
    this.selectedCity = city;
    this.filteredBranches = city === 'الكل'
      ? [...this.allBranches]
      : this.allBranches.filter(b => b.city === city);
  }
}
