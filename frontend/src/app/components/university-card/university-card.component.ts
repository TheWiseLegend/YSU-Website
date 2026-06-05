// src/app/components/university-card/university-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { University } from '../../models/university.model';

@Component({
  selector: 'app-university-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './university-card.component.html',
  styleUrls: ['./university-card.component.scss'],
})
export class UniversityCardComponent {
  @Input() university!: University;
  @Output() cardClick = new EventEmitter<string>();

  navigate(): void {
    this.cardClick.emit(this.university.id);
  }
}