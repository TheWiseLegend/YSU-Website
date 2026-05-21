import { UnionTeamMember } from '../services/public-union-team.service';

export interface PeriodTeam {
  period: string;
  isCurrentPeriod: boolean;
  administrativeMembers: UnionTeamMember[];
  supervisoryMembers: UnionTeamMember[];
}