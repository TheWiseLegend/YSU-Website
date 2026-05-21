// src/app/pages/about/about.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { PublicUnionTeamService, UnionTeamMember } from '../../services/public-union-team.service';
import { PeriodTeam } from '../../models/period-team.interface';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  administrativeTeamMembers: UnionTeamMember[] = [];
  supervisoryTeamMembers: UnionTeamMember[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  periodTeams: PeriodTeam[] = [];
  currentPeriod: string = '';
  expandedPeriods: Set<string> = new Set();
  currentPeriodTeam: PeriodTeam | null = null;
  historicalPeriods: PeriodTeam[] = [];

  
  constructor(private publicUnionTeamService: PublicUnionTeamService) {}
  
  ngOnInit(): void {
    this.publicUnionTeamService.getCurrentPeriod().subscribe({
      next: (response) => {
        this.currentPeriod = response.currentPeriod;
        this.loadTeamMembers();
      },
      error: (error) => {
        console.error('Error loading current period:', error);
        this.loadTeamMembers();
      }
    });
  }
  
  loadTeamMembers(): void {
    this.isLoading = true;
    this.publicUnionTeamService.getAllPeriods().subscribe({
      next: (periods) => {
        if (periods.length === 0) {
          this.isLoading = false;
          return;
        }
        
        // Load members for each period
        const memberRequests = periods.map(period =>
          this.publicUnionTeamService.getMembersByPeriod(period).pipe(
            map(members => ({ period, members }))
          )
        );
        
        forkJoin(memberRequests).subscribe({
          next: (periodData) => {
            this.periodTeams = periodData.map(data => ({
              period: data.period,
              isCurrentPeriod: data.period === this.currentPeriod,
              administrativeMembers: data.members.filter(m => m.type === 'الهيئة الإدارية'),
              supervisoryMembers: data.members.filter(m => m.type === 'هيئة الرقابة والتفتيش')
            }));
            
            // Make sure this line correctly identifies the current period team
            this.currentPeriodTeam = this.periodTeams.find(pt => pt.isCurrentPeriod) || null;
            this.historicalPeriods = this.periodTeams.filter(pt => !pt.isCurrentPeriod)
                                      .sort((a, b) => b.period.localeCompare(a.period));
            
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading team members:', error);
            this.errorMessage = 'فشل في تحميل أعضاء الفريق';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading periods:', error);
        this.errorMessage = 'فشل في تحميل الفترات';
        this.isLoading = false;
      }
    });
  }

  togglePeriodExpansion(period: string): void {
    if (this.expandedPeriods.has(period)) {
      this.expandedPeriods.delete(period);
    } else {
      this.expandedPeriods.add(period);
    }
  }
  
  isPeriodExpanded(period: string): boolean {
    return this.expandedPeriods.has(period);
  }
  
  // Administrative Leaders with sorting
  getAdministrativeLeaders(): UnionTeamMember[] {
    if (!this.currentPeriodTeam) return [];
    
    const leaders = this.currentPeriodTeam.administrativeMembers.filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
    
    return leaders.sort((a, b) => {
      if (a.position === 'رئيس الاتحاد العام') return -1;
      if (b.position === 'رئيس الاتحاد العام') return 1;
      return 0;
    });
  }

  getAdministrativeOtherMembers(): UnionTeamMember[] {
    if (!this.currentPeriodTeam) return [];
    
    return this.currentPeriodTeam.administrativeMembers.filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  // Supervisory Leaders with sorting
  getSupervisoryLeaders(): UnionTeamMember[] {
    if (!this.currentPeriodTeam) return [];
    
    const leaders = this.currentPeriodTeam.supervisoryMembers.filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
    
    return leaders.sort((a, b) => {
      if (a.position === 'رئيس الهيئة الرقابية') return -1;
      if (b.position === 'رئيس الهيئة الرقابية') return 1;
      return 0;
    });
  }

  getSupervisoryOtherMembers(): UnionTeamMember[] {
    if (!this.currentPeriodTeam) return [];
    
    return this.currentPeriodTeam.supervisoryMembers.filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  // Helper methods
  hasAdministrativeLeaders(): boolean {
    return this.getAdministrativeLeaders().length > 0;
  }

  hasSupervisoryLeaders(): boolean {
    return this.getSupervisoryLeaders().length > 0;
  }

  // Historical Period - Administrative Leaders
  getHistoricalAdministrativeLeaders(periodTeam: PeriodTeam): UnionTeamMember[] {
    const leaders = periodTeam.administrativeMembers.filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
    
    return leaders.sort((a, b) => {
      if (a.position === 'رئيس الاتحاد العام') return -1;
      if (b.position === 'رئيس الاتحاد العام') return 1;
      return 0;
    });
  }

  getHistoricalAdministrativeOtherMembers(periodTeam: PeriodTeam): UnionTeamMember[] {
    return periodTeam.administrativeMembers.filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  // Historical Period - Supervisory Leaders
  getHistoricalSupervisoryLeaders(periodTeam: PeriodTeam): UnionTeamMember[] {
    const leaders = periodTeam.supervisoryMembers.filter(member => 
      member.position.includes('رئيس') || member.position.includes('نائب الرئيس')
    );
    
    return leaders.sort((a, b) => {
      if (a.position === 'رئيس الهيئة الرقابية') return -1;
      if (b.position === 'رئيس الهيئة الرقابية') return 1;
      return 0;
    });
  }

  getHistoricalSupervisoryOtherMembers(periodTeam: PeriodTeam): UnionTeamMember[] {
    return periodTeam.supervisoryMembers.filter(member => 
      !member.position.includes('رئيس') && !member.position.includes('نائب الرئيس')
    );
  }

  // Helper methods for historical periods
  hasHistoricalAdministrativeLeaders(periodTeam: PeriodTeam): boolean {
    return this.getHistoricalAdministrativeLeaders(periodTeam).length > 0;
  }

  hasHistoricalSupervisoryLeaders(periodTeam: PeriodTeam): boolean {
    return this.getHistoricalSupervisoryLeaders(periodTeam).length > 0;
  }

}