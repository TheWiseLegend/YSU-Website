import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { VendorService } from './vendor.service';

@Controller('vendors')
export class VendorPublicController {
  constructor(private vendorService: VendorService) {}

  @Get('public')
  @Public()
  findActive() {
    return this.vendorService.findActiveVendors();
  }

  @Get('public/:id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.vendorService.findActiveVendorById(id);
  }
}
