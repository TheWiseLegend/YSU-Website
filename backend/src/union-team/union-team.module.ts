import { Module } from '@nestjs/common';
import { UnionTeamController } from './union-team.controller';
import { UnionTeamService } from './union-team.service';

@Module({
  controllers: [UnionTeamController],
  providers: [UnionTeamService]
})
export class UnionTeamModule {}