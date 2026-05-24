import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { LocalStorageModule } from '../local-storage/local-storage.module';

@Module({
  imports: [LocalStorageModule],
  controllers: [NewsController],
  providers: [NewsService]
})
export class NewsModule {}