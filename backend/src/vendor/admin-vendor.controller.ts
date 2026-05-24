import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Admin } from '../admin-auth/decorator/admin.decorator';
import { CreateVendorDto, UpdateVendorDto } from './dto';
import { VendorService } from './vendor.service';

@Controller('admin/vendors')
@Admin()
export class AdminVendorController {
  constructor(private vendorService: VendorService) {}

  @Post()
  create(@Body() dto: CreateVendorDto) {
    return this.vendorService.createVendor(dto);
  }

  @Get()
  findAll() {
    return this.vendorService.findAllVendors();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateVendor(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.vendorService.deactivateVendor(id);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.vendorService.reactivateVendor(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.vendorService.deleteVendor(id);
  }
}
