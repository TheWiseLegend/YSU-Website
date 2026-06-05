// src/app/pages/student-guide/student-guide.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-student-guide',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  templateUrl: './student-guide.component.html',
  styleUrls: ['./student-guide.component.scss']
})
export class StudentGuideComponent {
}