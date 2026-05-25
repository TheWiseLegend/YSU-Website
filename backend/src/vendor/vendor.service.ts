import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  CreateVendorDto,
  UpdateCategoryDto,
  UpdateVendorDto,
} from './dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  // ─── Vendor CRUD ────────────────────────────────────────────────────────────

  async createVendor(dto: CreateVendorDto) {
    const category = await this.prisma.vendorCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.prisma.vendor.create({ data: dto });
  }

  findAllVendors() {
    return this.prisma.vendor.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateVendor(id: string, dto: UpdateVendorDto) {
    if (dto.categoryId) {
      const category = await this.prisma.vendorCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    try {
      return await this.prisma.vendor.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Vendor not found');
      throw error;
    }
  }

  async deactivateVendor(id: string) {
    try {
      return await this.prisma.vendor.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Vendor not found');
      throw error;
    }
  }

  async reactivateVendor(id: string) {
    try {
      return await this.prisma.vendor.update({
        where: { id },
        data: { isActive: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Vendor not found');
      throw error;
    }
  }

  async deleteVendor(id: string) {
    try {
      await this.prisma.vendor.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Vendor not found');
      throw error;
    }
  }

  // ─── Category CRUD ───────────────────────────────────────────────────────────

  async createCategory(dto: CreateCategoryDto) {
    try {
      return await this.prisma.vendorCategory.create({ data: dto });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  findAllCategories() {
    return this.prisma.vendorCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.vendorCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');

    try {
      return await this.prisma.vendorCategory.update({ where: { id }, data: dto });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async deactivateCategory(id: string) {
    const category = await this.prisma.vendorCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // Cascade deactivation to all active vendors in this category
    await this.prisma.vendor.updateMany({
      where: { categoryId: id, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.vendorCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async reactivateCategory(id: string) {
    try {
      return await this.prisma.vendorCategory.update({
        where: { id },
        data: { isActive: true },
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Category not found');
      throw error;
    }
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.vendorCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const vendorCount = await this.prisma.vendor.count({ where: { categoryId: id } });
    if (vendorCount > 0) {
      throw new BadRequestException('Cannot delete a category that has vendors. Remove or reassign the vendors first.');
    }

    await this.prisma.vendorCategory.delete({ where: { id } });
  }

  // ─── Public ──────────────────────────────────────────────────────────────────

  async findActiveVendorById(id: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, isActive: true, category: { isActive: true } },
      include: { category: true },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    return {
      id: vendor.id,
      name: vendor.name,
      categoryName: vendor.category.name,
      categoryIcon: vendor.category.icon ?? null,
      location: vendor.location,
      discount: vendor.discount,
      imageUrl: vendor.imageUrl,
      mapsUrl: vendor.mapsUrl,
      createdAt: vendor.createdAt,
    };
  }

  async findActiveVendors() {
    try {
      const vendors = await this.prisma.vendor.findMany({
        where: {
          isActive: true,
          category: { isActive: true },
        },
        include: { category: true },
        orderBy: [
          { category: { name: 'asc' } },
          { name: 'asc' },
        ],
      });

      return vendors.map((v) => ({
        id: v.id,
        name: v.name,
        categoryName: v.category.name,
        categoryIcon: v.category.icon ?? null,
        location: v.location,
        discount: v.discount,
        imageUrl: v.imageUrl,
        mapsUrl: v.mapsUrl,
        createdAt: v.createdAt,
      }));
    } catch {
      return [];
    }
  }
}
