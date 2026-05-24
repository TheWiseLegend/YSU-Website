// src/app/pages/branch-detail/branch-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { PublicBranchesService } from '../../services/public-branches.service';
import { Branch } from '../../services/branches.service';
import { PublicTeamMembersService } from '../../services/public-team-members.service';
import { TeamMember } from '../../services/team-members.service';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss']
})
export class BranchDetailComponent implements OnInit {
  branchId: string | null = null;
  branch: Branch | undefined;
  notFound: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';
  teamMembers: TeamMember[] = [];
  isLoadingTeam: boolean = false;
  teamError: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private publicBranchesService: PublicBranchesService,
    private publicTeamMembersService: PublicTeamMembersService
  ) {}

  ngOnInit(): void {
    // Get the branch ID from the route
    this.route.paramMap.subscribe(params => {
      this.branchId = params.get('id');
      
      if (this.branchId) {
        this.loadBranchDetails(this.branchId);
      } else {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }
  
  loadTeamMembers(branchId: string): void {
    this.isLoadingTeam = true;
    this.publicTeamMembersService.getTeamMembersByBranchId(branchId).subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.isLoadingTeam = false;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.teamError = 'فشل في تحميل أعضاء فريق الفرع';
        this.isLoadingTeam = false;
      }
    });
  }

  loadBranchDetails(id: string): void {
    this.isLoading = true;
    this.publicBranchesService.getBranchById(id).subscribe({
      next: (branch) => {
        this.branch = branch;
        this.notFound = false;
        this.isLoading = false;
        
        // Load team members after branch details are loaded
        this.loadTeamMembers(id);
      },
      error: (error) => {
        console.error('Error loading branch details:', error);
        this.branch = undefined;
        this.notFound = true;
        this.isLoading = false;
        this.errorMessage = 'فشل في تحميل تفاصيل الفرع. يرجى المحاولة مرة أخرى لاحقًا.';
      }
    });
  }
  
  // Get leadership members (president and vice president)
  getLeadershipMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      member.position.includes('رئيس') || 
      member.position.includes('نائب الرئيس')
    );
  }
  
  // Get all non-leadership members
  getOtherMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      !member.position.includes('رئيس') && 
      !member.position.includes('نائب الرئيس')
    );
  }
  
  // Format the date (YYYY-MM-DD) to a readable format in Arabic
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Get month name in Arabic
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  }
  // Get administrative team members
  getAdministrativeMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      member.type === 'الهيئة التنفيذية'
    );
  }

  // Get supervisory team members
  getSupervisoryMembers(): TeamMember[] {
    return this.teamMembers.filter(member => 
      member.type === 'لجنة الرقابة والتفتيش'
    );
  }
  getAdministrativeLeaders(): TeamMember[] {
    const leaders = this.getAdministrativeMembers().filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
    
    return leaders.sort((a, b) => {
      if (a.position === 'رئيس الفرع') return -1;
      if (b.position === 'رئيس الفرع') return 1;
      return 0;
    });
  }

  getAdministrativeOtherMembers(): TeamMember[] {
    return this.getAdministrativeMembers().filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  getSupervisoryLeaders(): TeamMember[] {
    const leaders = this.getSupervisoryMembers().filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
    
    return leaders.sort((a, b) => {
      if (a.position === 'رئيس الفرع') return -1;
      if (b.position === 'رئيس الفرع') return 1;
      return 0;
    });
  }

  getSupervisoryOtherMembers(): TeamMember[] {
    return this.getSupervisoryMembers().filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  hasAdministrativeLeaders(): boolean {
    return this.getAdministrativeLeaders().length > 0;
  }

  hasSupervisoryLeaders(): boolean {
    return this.getSupervisoryLeaders().length > 0;
  }
}