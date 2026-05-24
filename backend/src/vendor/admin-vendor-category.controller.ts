import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Admin } from '../admin-auth/decorator/admin.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { VendorService } from './vendor.service';

@Controller('admin/vendor-categories')
@Admin()
export class AdminVendorCategoryController {
  constructor(private vendorService: VendorService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.vendorService.createCategory(dto);
  }

  @Get()
  findAll() {
    return this.vendorService.findAllCategories();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.vendorService.updateCategory(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.vendorService.deactivateCategory(id);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.vendorService.reactivateCategory(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.vendorService.deleteCategory(id);
  }
}
