import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminVendorCategoryController } from './admin-vendor-category.controller';
import { AdminVendorController } from './admin-vendor.controller';
import { VendorPublicController } from './vendor-public.controller';
import { VendorService } from './vendor.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [
    AdminVendorController,
    AdminVendorCategoryController,
    VendorPublicController,
  ],
  providers: [VendorService],
})
export class VendorModule {}
