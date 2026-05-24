import { Module } from '@nestjs/common';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';
import { BranchesModule } from '../branches/branches.module';
import { LocalStorageModule } from '../local-storage/local-storage.module';

@Module({
  imports: [BranchesModule, LocalStorageModule],
  controllers: [TeamMembersController],
  providers: [TeamMembersService]
})
export class TeamMembersModule {}