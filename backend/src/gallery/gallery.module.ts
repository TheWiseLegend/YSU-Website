import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { LocalStorageModule } from '../local-storage/local-storage.module';

@Module({
  imports: [LocalStorageModule],
  controllers: [GalleryController],
  providers: [GalleryService]
})
export class GalleryModule {}