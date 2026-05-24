  // src/app/pages/university-detail/university-detail.component.ts
  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ActivatedRoute, RouterModule } from '@angular/router';
  import { PageHeaderComponent } from '../../components/page-header/page-header.component';
  import { UNIVERSITY_DETAILS } from '../../data/university-details';
  import { UniversityDetail } from '../../models/university-detail.model';

  @Component({
    selector: 'app-university-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, PageHeaderComponent],
    templateUrl: './university-detail.component.html',
    styleUrl: './university-detail.component.scss'
  })
  export class UniversityDetailComponent implements OnInit {
    universityId: string | null = null;
    selectedUniversity: UniversityDetail | null = null;
    notFound: boolean = false;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
      // Get the university ID from the route parameters
      this.route.paramMap.subscribe(params => {
        this.universityId = params.get('id');
        
        if (this.universityId) {
          const universityKeys = Object.keys(UNIVERSITY_DETAILS);
          if (universityKeys.includes(this.universityId)) {
            this.selectedUniversity = (UNIVERSITY_DETAILS as any)[this.universityId];
            this.notFound = false;
          } else {
            this.selectedUniversity = null;
            this.notFound = true;
          }
        }
      });
    }
  }