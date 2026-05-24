// src/app/components/university-filter/university-filter.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityFilter } from '../../models/university-filter.model';

@Component({
  selector: 'app-university-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './university-filter.component.html',
  styleUrls: ['./university-filter.component.scss']
})
export class UniversityFilterComponent {
  @Output() filtersChanged = new EventEmitter<UniversityFilter>();
  
  // Initial filter state
  filter: UniversityFilter = {
    city: '',
    types: [],
    minFee: undefined,
    maxFee: undefined,
    languages: [],
    courses: [],
    hasUnionBranch: false
  };

  // Type options
  typeOptions = [
    { id: 'public-university', value: 'حكومية', checked: false },
    { id: 'private-university', value: 'خاصة', checked: false }
  ];

  // Language options
  languageOptions = [
    { id: 'lang-english', value: 'إنجليزي', checked: false },
    { id: 'lang-malay', value: 'ملايو', checked: false },
    { id: 'lang-arabic', value: 'عربي', checked: false },
    { id: 'lang-chinese', value: 'صيني', checked: false }
  ];

  // Course options grouped by category for better organization
  courseCategories = [
    {
      id: 'business',
      title: 'الأعمال والاقتصاد',
      expanded: false,
      icon: 'M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM9 17H7V7H9V17ZM13 17H11V7H13V17ZM17 17H15V9H17V17Z',
      courses: [
        { id: 'course-business', value: 'إدارة الأعمال', checked: false },
        { id: 'course-accounting', value: 'المحاسبة', checked: false },
        { id: 'course-economics', value: 'الاقتصاد', checked: false },
        { id: 'course-finance', value: 'المالية', checked: false },
        { id: 'course-islamic-banking', value: 'الصيرفة الإسلامية', checked: false },
        { id: 'course-international-business', value: 'الأعمال الدولية', checked: false },
        { id: 'course-entrepreneurship', value: 'ريادة الأعمال', checked: false },
        { id: 'course-energy-economics', value: 'اقتصاد الطاقة', checked: false }
      ]
    },
    {
      id: 'engineering',
      title: 'الهندسة',
      expanded: false,
      icon: 'M12 1V23M5 4L12 1L19 4L12 7L5 4V18L12 21L19 18V4M12 7V21',
      courses: [
        { id: 'course-engineering', value: 'الهندسة', checked: false },
        { id: 'course-civil-engineering', value: 'الهندسة المدنية', checked: false },
        { id: 'course-mechanical-engineering', value: 'الهندسة الميكانيكية', checked: false },
        { id: 'course-electrical-engineering', value: 'الهندسة الكهربائية', checked: false },
        { id: 'course-chemical-engineering', value: 'الهندسة الكيميائية', checked: false },
        { id: 'course-electronics-engineering', value: 'الهندسة الإلكترونية', checked: false },
        { id: 'course-manufacturing-engineering', value: 'هندسة التصنيع', checked: false },
        { id: 'course-microelectronics-engineering', value: 'هندسة الإلكترونيات الدقيقة', checked: false },
        { id: 'course-architectural-engineering', value: 'الهندسة المعمارية', checked: false },
        { id: 'course-building-technology', value: 'تكنولوجيا البناء', checked: false }
      ]
    },
    {
      id: 'medical',
      title: 'الطب والعلوم الصحية',
      expanded: false,
      icon: 'M22 12H20.2L18.9 10.7C18.9 10.1 19 9.6 19 9C19 8.4 18.9 7.9 18.9 7.3L20.2 6L18.2 2L16.5 2.9C16 2.4 15.4 2 14.8 1.7L14.5 0H9.5L9.2 1.7C8.6 2 8 2.4 7.5 2.9L5.8 2L3.8 6L5.1 7.3C5.1 7.9 5 8.4 5 9C5 9.6 5.1 10.1 5.1 10.7L3.8 12L5.8 16L7.5 15.1C8 15.6 8.6 16 9.2 16.3L9.5 18H14.5L14.8 16.3C15.4 16 16 15.6 16.5 15.1L18.2 16L20.2 12H22M10 12C9.4 12 9 11.6 9 11S9.4 10 10 10 11 10.4 11 11 10.6 12 10 12M14 12C13.4 12 13 11.6 13 11S13.4 10 14 10 15 10.4 15 11 14.6 12 14 12M15 14H13C13 13.4 12.6 13 12 13S11 13.4 11 14H9C9 13.4 8.6 13 8 13S7 13.4 7 14',
      courses: [
        { id: 'course-medicine', value: 'الطب', checked: false },
        { id: 'course-dentistry', value: 'طب الأسنان', checked: false },
        { id: 'course-pharmacy', value: 'الصيدلة', checked: false },
        { id: 'course-physiotherapy', value: 'العلاج الطبيعي', checked: false },
        { id: 'course-nursing', value: 'التمريض', checked: false },
        { id: 'course-veterinary', value: 'الطب البيطري', checked: false },
        { id: 'course-biomedical-sciences', value: 'العلوم الطبية الحيوية', checked: false },
        { id: 'course-psychology', value: 'علم النفس', checked: false }
      ]
    },
    {
      id: 'computer',
      title: 'علوم الحاسوب',
      expanded: false,
      icon: 'M2 3H22C23.1 3 24 3.9 24 5V19C24 20.1 23.1 21 22 21H2C0.9 21 0 20.1 0 19V5C0 3.9 0.9 3 2 3M2 5V7H22V5H2M2 9V11H22V9H2M2 13V15H22V13H2M2 17V19H22V17H2M4 6H6V8H4V6M4 10H6V12H4V10M4 14H6V16H4V14M4 18H6V20H4V18M8 6H10V8H8V6M8 10H10V12H8V10M8 14H10V16H8V14M8 18H10V20H8V18M12 6H14V8H12V6M12 10H14V12H12V10M12 14H14V16H12V14M12 18H14V20H12V18',
      courses: [
        { id: 'course-computer-science', value: 'علوم الحاسوب', checked: false },
        { id: 'course-it', value: 'تكنولوجيا المعلومات', checked: false },
        { id: 'course-software-engineering', value: 'هندسة البرمجيات', checked: false },
        { id: 'course-cybersecurity', value: 'الأمن السيبراني', checked: false },
        { id: 'course-data-science', value: 'علم البيانات', checked: false }
      ]
    },
    {
      id: 'science',
      title: 'العلوم والزراعة',
      expanded: false,
      icon: 'M12 2L13.09 8.26L22 9L14.45 14.97L17.91 22L12 18.5L6.09 22L9.55 14.97L2 9L10.91 8.26L12 2M8 16.5C8 17.3 8.7 18 9.5 18S11 17.3 11 16.5 10.3 15 9.5 15 8 15.7 8 16.5M13 20.5C13 21.3 13.7 22 14.5 22S16 21.3 16 20.5 15.3 19 14.5 19 13 19.7 13 20.5',
      courses: [
        { id: 'course-science', value: 'العلوم', checked: false },
        { id: 'course-agricultural-science', value: 'العلوم الزراعية', checked: false },
        { id: 'course-food-science', value: 'علوم الأغذية', checked: false },
        { id: 'course-physics', value: 'الفيزياء', checked: false },
        { id: 'course-chemistry', value: 'الكيمياء', checked: false },
        { id: 'course-mathematics', value: 'الرياضيات', checked: false },
        { id: 'course-biology', value: 'البيولوجيا', checked: false }
      ]
    },
    {
      id: 'other',
      title: 'تخصصات أخرى',
      expanded: false,
      icon: 'M12 2L22 7L12 12L2 7L12 2M2 17L12 22L22 17M2 12L12 17L22 12',
      courses: [
        { id: 'course-education', value: 'التعليم', checked: false },
        { id: 'course-law', value: 'القانون', checked: false },
        { id: 'course-architecture', value: 'العمارة', checked: false },
        { id: 'course-islamic-studies', value: 'الدراسات الإسلامية', checked: false },
        { id: 'course-hospitality', value: 'الضيافة والسياحة', checked: false }
      ]
    }
  ];

  // For backward compatibility with existing filter logic
  get courseOptions() {
    return this.courseCategories.flatMap(category => category.courses);
  }

  // Expanded courses view
  coursesExpanded = false;
  
  // Method to toggle courses view
  toggleCoursesView() {
    this.coursesExpanded = !this.coursesExpanded;
  }

  // Method to toggle course category expansion
  toggleCategoryExpansion(categoryId: string) {
    const category = this.courseCategories.find(cat => cat.id === categoryId);
    if (category) {
      category.expanded = !category.expanded;
    }
  }

  // Handle checkbox change
  onCheckboxChange(event: Event, group: string, value: string) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    
    // Update the appropriate filter group
    switch(group) {
      case 'type':
        this.updateFilterArray('types', value, checked);
        break;
      case 'language':
        this.updateFilterArray('languages', value, checked);
        break;
      case 'course':
        this.updateFilterArray('courses', value, checked);
        break;
      case 'branch':
        this.filter.hasUnionBranch = checked;
        break;
    }
    
    // Immediately emit the updated filters
    this.emitFilters();
  }

  // Handle city selection change
  onCityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filter.city = select.value;
    this.emitFilters();
  }

  // Handle fee range change
  onFeeChange(event: Event, field: 'minFee' | 'maxFee') {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseInt(input.value, 10) : undefined;
    this.filter[field] = value;
    this.emitFilters();
  }

  // Update filter arrays (types, languages, courses)
  private updateFilterArray(field: 'types' | 'languages' | 'courses', value: string, add: boolean) {
    if (!this.filter[field]) {
      this.filter[field] = [];
    }
    
    if (add) {
      (this.filter[field] as string[]).push(value);
    } else {
      this.filter[field] = (this.filter[field] as string[]).filter(item => item !== value);
    }
  }

  // Reset all filters
  resetFilters() {
    // Reset checkboxes
    this.typeOptions.forEach(option => option.checked = false);
    this.languageOptions.forEach(option => option.checked = false);
    
    // Reset course categories and course checkboxes
    this.courseCategories.forEach(category => {
      category.expanded = false;
      category.courses.forEach(course => course.checked = false);
    });
    
    // Reset filter object
    this.filter = {
      city: '',
      types: [],
      minFee: undefined,
      maxFee: undefined,
      languages: [],
      courses: [],
      hasUnionBranch: false
    };
    
    // Emit the reset filters
    console.log("Filters reset");
    this.emitFilters();
  }

  // Apply filters
  applyFilters() {
    console.log("Applying filters", this.filter);
    this.emitFilters();
  }
  
  // Emit the current filters
  private emitFilters() {
    console.log("Emitting filters", this.filter);
    this.filtersChanged.emit({...this.filter});
  }
  
  // Add this method to your UniversityFilterComponent class
  trackByCategory(index: number, category: any): string {
    return category.id;
  }

  // Get the count of checked items in a category
  getCategoryCheckedCount(categoryId: string): number {
    const category = this.courseCategories.find(cat => cat.id === categoryId);
    if (!category) return 0;
    return category.courses.filter(course => course.checked).length;
  }

  // Get total checked courses count
  getTotalCheckedCoursesCount(): number {
    return this.courseCategories.reduce((total, category) => 
      total + category.courses.filter(course => course.checked).length, 0
    );
  }
}