// src/app/pages/digital-library/digital-library.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-digital-library',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './digital-library.component.html',
  styleUrls: ['./digital-library.component.scss']
})
export class DigitalLibraryComponent {
  constructor() {}
}