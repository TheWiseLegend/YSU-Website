// src/app/components/university-card/university-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { University } from '../../models/university.model';

@Component({
  selector: 'app-university-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './university-card.component.html',
  styleUrls: ['./university-card.component.scss']
})
export class UniversityCardComponent {
  @Input() university!: University;
}