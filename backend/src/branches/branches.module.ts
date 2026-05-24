import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { LocalStorageModule } from '../local-storage/local-storage.module';

@Module({
  imports: [LocalStorageModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService]
})
export class BranchesModule {}