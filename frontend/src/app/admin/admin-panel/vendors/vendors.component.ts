import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  LucideDynamicIcon,
  LucideUtensils,
  LucideShoppingCart,
  LucideGlobe,
  LucideGraduationCap,
  LucideCoffee,
  LucideHeart,
  LucideDumbbell,
  LucideShirt,
  LucideCar,
  LucideStore,
  provideLucideIcons,
  LucideIcon,
} from '@lucide/angular';
import { VendorService } from '../../../services/vendor.service';
import { UploadService } from '../../../services/upload.service';
import { Vendor, VendorCategory } from '../../../models/vendor.model';

export interface IconOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const VENDOR_ICONS: IconOption[] = [
  { key: 'utensils',       label: 'مطعم',      icon: LucideUtensils },
  { key: 'shopping-cart',  label: 'بقالة',      icon: LucideShoppingCart },
  { key: 'globe',          label: 'سياحة',      icon: LucideGlobe },
  { key: 'graduation-cap', label: 'تعليم',      icon: LucideGraduationCap },
  { key: 'coffee',         label: 'مقهى',       icon: LucideCoffee },
  { key: 'heart',          label: 'صحة',        icon: LucideHeart },
  { key: 'dumbbell',       label: 'رياضة',      icon: LucideDumbbell },
  { key: 'shirt',          label: 'ملابس',      icon: LucideShirt },
  { key: 'car',            label: 'مواصلات',    icon: LucideCar },
  { key: 'store',          label: 'متجر',       icon: LucideStore },
];

@Component({
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon],
  providers: [
    provideLucideIcons(
      LucideUtensils, LucideShoppingCart, LucideGlobe, LucideGraduationCap,
      LucideCoffee, LucideHeart, LucideDumbbell, LucideShirt, LucideCar, LucideStore
    ),
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss'],
})
export class AdminVendorsComponent implements OnInit {
  // ─── Vendors ────────────────────────────────────────────────────────────────
  vendors: Vendor[] = [];
  vendorForm: FormGroup;
  isEditingVendor = false;
  editingVendorId: string | null = null;
  isLoadingVendors = false;
  showVendorForm = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: VendorCategory[] = [];
  categoryForm: FormGroup;
  isEditingCategory = false;
  editingCategoryId: string | null = null;
  isLoadingCategories = false;
  showCategoryForm = false;

  // ─── Icon picker ─────────────────────────────────────────────────────────────
  readonly availableIcons: IconOption[] = VENDOR_ICONS;
  showIconPicker = false;

  // ─── Shared ──────────────────────────────────────────────────────────────────
  successMessage = '';
  errorMessage = '';

  constructor(
    private vendorService: VendorService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.vendorForm = this.fb.group({
      name:       ['', [Validators.required, Validators.maxLength(100)]],
      categoryId: ['', Validators.required],
      discount:   ['', [Validators.required, Validators.maxLength(100)]],
      location:   ['', Validators.maxLength(100)],
      imageUrl:   ['', Validators.maxLength(500)],
      mapsUrl:    ['', Validators.maxLength(500)],
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      icon: [''],
    });
  }

  ngOnInit(): void {
    this.loadVendors();
    this.loadCategories();
  }

  // ─── Toast helpers ───────────────────────────────────────────────────────────

  setSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  setErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => (this.errorMessage = ''), 3000);
  }

  // ─── Vendor methods ──────────────────────────────────────────────────────────

  loadVendors(): void {
    this.isLoadingVendors = true;
    this.vendorService.getAll().subscribe({
      next: (vendors) => { this.vendors = vendors; this.isLoadingVendors = false; },
      error: () => { this.setErrorMessage('فشل في تحميل الموردين'); this.isLoadingVendors = false; },
    });
  }

  toggleVendorForm(): void {
    this.showVendorForm = !this.showVendorForm;
    if (!this.showVendorForm) this.resetVendorForm();
  }

  resetVendorForm(): void {
    this.vendorForm.reset();
    this.isEditingVendor = false;
    this.editingVendorId = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  editVendor(vendor: Vendor): void {
    this.isEditingVendor = true;
    this.editingVendorId = vendor.id;
    this.showVendorForm = true;
    this.vendorForm.patchValue({
      name: vendor.name, categoryId: vendor.categoryId,
      discount: vendor.discount, location: vendor.location ?? '',
      imageUrl: vendor.imageUrl ?? '', mapsUrl: vendor.mapsUrl ?? '',
    });
    this.imagePreview = vendor.imageUrl ?? null;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.setErrorMessage('الرجاء اختيار صورة صالحة');
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadService.uploadImage(this.selectedFile, 'vendors').subscribe({
      next: (response) => {
        this.vendorForm.patchValue({ imageUrl: response.imageUrl });
        this.isUploading = false;
        this.selectedFile = null;
      },
      error: () => { this.setErrorMessage('فشل في رفع الصورة'); this.isUploading = false; },
    });
  }

  onVendorSubmit(): void {
    if (this.vendorForm.invalid) return;
    const dto = this.vendorForm.value;

    if (this.isEditingVendor && this.editingVendorId) {
      this.vendorService.update(this.editingVendorId, dto).subscribe({
        next: () => { this.setSuccessMessage('تم تحديث المورد بنجاح'); this.loadVendors(); this.toggleVendorForm(); },
        error: () => this.setErrorMessage('فشل في تحديث المورد'),
      });
    } else {
      this.vendorService.create(dto).subscribe({
        next: () => { this.setSuccessMessage('تم إضافة المورد بنجاح'); this.loadVendors(); this.toggleVendorForm(); },
        error: () => this.setErrorMessage('فشل في إضافة المورد'),
      });
    }
  }

  toggleVendorStatus(vendor: Vendor): void {
    const action$ = vendor.isActive ? this.vendorService.deactivate(vendor.id) : this.vendorService.reactivate(vendor.id);
    action$.subscribe({
      next: () => { this.setSuccessMessage(vendor.isActive ? 'تم تعطيل المورد بنجاح' : 'تم تفعيل المورد بنجاح'); this.loadVendors(); },
      error: () => this.setErrorMessage('فشل في تغيير حالة المورد'),
    });
  }

  // ─── Category methods ────────────────────────────────────────────────────────

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.vendorService.getCategories().subscribe({
      next: (categories) => { this.categories = categories; this.isLoadingCategories = false; },
      error: () => { this.setErrorMessage('فشل في تحميل الفئات'); this.isLoadingCategories = false; },
    });
  }

  toggleCategoryForm(): void {
    this.showCategoryForm = !this.showCategoryForm;
    if (!this.showCategoryForm) this.resetCategoryForm();
  }

  resetCategoryForm(): void {
    this.categoryForm.reset();
    this.isEditingCategory = false;
    this.editingCategoryId = null;
    this.showIconPicker = false;
  }

  editCategory(category: VendorCategory): void {
    this.isEditingCategory = true;
    this.editingCategoryId = category.id;
    this.showCategoryForm = true;
    this.categoryForm.patchValue({ name: category.name, icon: category.icon ?? '' });
  }

  selectIcon(key: string): void {
    this.categoryForm.patchValue({ icon: key });
    this.showIconPicker = false;
  }

  getSelectedIconData(): LucideIcon | null {
    const key = this.categoryForm.get('icon')?.value;
    return this.availableIcons.find(i => i.key === key)?.icon ?? null;
  }

  getIconDataByKey(key: string | null | undefined): LucideIcon | null {
    if (!key) return null;
    return this.availableIcons.find(i => i.key === key)?.icon ?? null;
  }

  onCategorySubmit(): void {
    if (this.categoryForm.invalid) return;
    const dto = this.categoryForm.value;

    if (this.isEditingCategory && this.editingCategoryId) {
      this.vendorService.updateCategory(this.editingCategoryId, dto).subscribe({
        next: () => { this.setSuccessMessage('تم تحديث الفئة بنجاح'); this.loadCategories(); this.toggleCategoryForm(); },
        error: () => this.setErrorMessage('فشل في تحديث الفئة'),
      });
    } else {
      this.vendorService.createCategory(dto).subscribe({
        next: () => { this.setSuccessMessage('تم إضافة الفئة بنجاح'); this.loadCategories(); this.toggleCategoryForm(); },
        error: () => this.setErrorMessage('فشل في إضافة الفئة'),
      });
    }
  }

  toggleCategoryStatus(category: VendorCategory): void {
    const action$ = category.isActive
      ? this.vendorService.deactivateCategory(category.id)
      : this.vendorService.reactivateCategory(category.id);
    action$.subscribe({
      next: () => {
        this.setSuccessMessage(category.isActive ? 'تم تعطيل الفئة بنجاح' : 'تم تفعيل الفئة بنجاح');
        this.loadVendors();
        this.loadCategories();
      },
      error: () => this.setErrorMessage('فشل في تغيير حالة الفئة'),
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  activeCategories(): VendorCategory[] {
    return this.categories.filter(c => c.isActive);
  }
}
