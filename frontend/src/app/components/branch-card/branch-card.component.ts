// src/app/components/branch-card/branch-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Branch } from '../../services/branches.service';

@Component({
  selector: 'app-branch-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branch-card.component.html',
  styleUrls: ['./branch-card.component.scss']
})
export class BranchCardComponent {
  @Input() branch!: Branch;
  
  constructor() { }
  
  get branchTitle(): string {
    return `فرع جامعة ${this.branch.universityName}`;
  }
}