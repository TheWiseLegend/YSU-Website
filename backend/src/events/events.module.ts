import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { LocalStorageModule } from '../local-storage/local-storage.module';

@Module({
  imports: [LocalStorageModule],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}