import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideDynamicIcon, provideLucideIcons, LucideIcon } from '@lucide/angular';
import { VendorService } from '../../../services/vendor.service';
import { UploadService } from '../../../services/upload.service';
import { CreateVendorDto, Vendor, VendorCategory, VendorImage } from '../../../models/vendor.model';
import { VENDOR_ICONS, VendorIconOption, ALL_VENDOR_LUCIDE_ICONS, getVendorIcon } from '../../../data/vendor-icons';

@Component({
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideDynamicIcon, DatePipe],
  providers: [
    provideLucideIcons(...ALL_VENDOR_LUCIDE_ICONS),
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

  // Main logo upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  // Gallery images
  galleryImages: VendorImage[] = [];          // existing images (when editing)
  pendingGalleryFiles: File[] = [];           // new files queued for upload
  pendingGalleryPreviews: string[] = [];      // data-URL previews for queued files
  isUploadingGallery = false;

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: VendorCategory[] = [];
  categoryForm: FormGroup;
  isEditingCategory = false;
  editingCategoryId: string | null = null;
  isLoadingCategories = false;
  showCategoryForm = false;

  // ─── Icon picker ─────────────────────────────────────────────────────────────
  readonly availableIcons: VendorIconOption[] = VENDOR_ICONS;
  showIconPicker = false;

  // ─── Confirmation dialogs ────────────────────────────────────────────────────
  confirmDeleteVendorId: string | null = null;
  confirmDeleteCategoryId: string | null = null;
  blockedDeleteCategoryId: string | null = null;

  // ─── Shared ──────────────────────────────────────────────────────────────────
  successMessage = '';
  errorMessage = '';

  constructor(
    private vendorService: VendorService,
    private uploadService: UploadService,
    private fb: FormBuilder
  ) {
    this.vendorForm = this.fb.group({
      name:               ['', [Validators.required, Validators.maxLength(100)]],
      categoryId:         ['', Validators.required],
      discount:           [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      location:           ['', Validators.maxLength(100)],
      imageUrl:           ['', Validators.maxLength(500)],
      mapsUrl:            ['', Validators.maxLength(500)],
      phone:              ['', Validators.maxLength(20)],
      notes:              [''],
      discountExpiresAt:  [''],
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
    this.galleryImages = [];
    this.pendingGalleryFiles = [];
    this.pendingGalleryPreviews = [];
  }

  editVendor(vendor: Vendor): void {
    this.isEditingVendor = true;
    this.editingVendorId = vendor.id;
    this.showVendorForm = true;

    // Format date for <input type="date"> (YYYY-MM-DD)
    const expiryDate = vendor.discountExpiresAt
      ? new Date(vendor.discountExpiresAt).toISOString().split('T')[0]
      : '';

    this.vendorForm.patchValue({
      name:              vendor.name,
      categoryId:        vendor.categoryId,
      discount:          parseInt(vendor.discount, 10) || null,
      location:          vendor.location ?? '',
      imageUrl:          vendor.imageUrl ?? '',
      mapsUrl:           vendor.mapsUrl ?? '',
      phone:             vendor.phone ?? '',
      notes:             vendor.notes ?? '',
      discountExpiresAt: expiryDate,
    });

    this.imagePreview = vendor.imageUrl ?? null;
    this.galleryImages = [...(vendor.images ?? [])];
    this.pendingGalleryFiles = [];
    this.pendingGalleryPreviews = [];
  }

  // ─── Main logo upload ────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
      this.setErrorMessage('الرجاء اختيار صورة صالحة');
    }
  }

  // ─── Gallery image upload ────────────────────────────────────────────────────

  onGalleryFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const validFiles = files.filter(f => f.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      this.setErrorMessage('بعض الملفات المختارة ليست صوراً صالحة');
    }

    validFiles.forEach(file => {
      this.pendingGalleryFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.pendingGalleryPreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be re-selected if needed
    (event.target as HTMLInputElement).value = '';
  }

  removePendingGalleryFile(index: number): void {
    this.pendingGalleryFiles.splice(index, 1);
    this.pendingGalleryPreviews.splice(index, 1);
  }

  removeExistingGalleryImage(index: number): void {
    this.galleryImages.splice(index, 1);
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  onVendorSubmit(): void {
    if (this.vendorForm.invalid) return;

    // Upload main logo first if a new file was selected
    if (this.selectedFile) {
      this.isUploading = true;
      this.uploadService.uploadImage(this.selectedFile, 'vendors').subscribe({
        next: (response) => {
          this.vendorForm.patchValue({ imageUrl: response.imageUrl });
          this.isUploading = false;
          this.selectedFile = null;
          this.uploadGalleryThenSave();
        },
        error: () => { this.setErrorMessage('فشل في رفع الصورة الرئيسية'); this.isUploading = false; },
      });
    } else {
      this.uploadGalleryThenSave();
    }
  }

  private uploadGalleryThenSave(): void {
    if (this.pendingGalleryFiles.length === 0) {
      this.saveVendor([]);
      return;
    }

    this.isUploadingGallery = true;
    const uploadedUrls: string[] = [];
    let completed = 0;
    let failed = false;

    this.pendingGalleryFiles.forEach(file => {
      this.uploadService.uploadImage(file, 'vendors').subscribe({
        next: (response) => {
          uploadedUrls.push(response.imageUrl);
          completed++;
          if (completed === this.pendingGalleryFiles.length) {
            this.isUploadingGallery = false;
            this.saveVendor(uploadedUrls);
          }
        },
        error: () => {
          if (!failed) {
            failed = true;
            this.isUploadingGallery = false;
            this.setErrorMessage('فشل في رفع بعض صور المعرض');
          }
        },
      });
    });
  }

  private saveVendor(newGalleryUrls: string[]): void {
    // Combine existing gallery images (not removed) + newly uploaded ones
    const allImageUrls = [
      ...this.galleryImages.map(img => img.url),
      ...newGalleryUrls,
    ];

    const dto = this.normalizeVendorDto(this.vendorForm.value, allImageUrls);

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

  deleteVendor(id: string): void {
    this.vendorService.delete(id).subscribe({
      next: () => { this.setSuccessMessage('تم حذف المورد بنجاح'); this.confirmDeleteVendorId = null; this.loadVendors(); },
      error: () => { this.setErrorMessage('فشل في حذف المورد'); this.confirmDeleteVendorId = null; },
    });
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
    return getVendorIcon(key);
  }

  getIconDataByKey(key: string | null | undefined): LucideIcon | null {
    if (!key) return null;
    return getVendorIcon(key);
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

  deleteCategory(id: string): void {
    this.vendorService.deleteCategory(id).subscribe({
      next: () => { this.setSuccessMessage('تم حذف الفئة بنجاح'); this.confirmDeleteCategoryId = null; this.loadCategories(); },
      error: (err) => {
        const msg = err?.error?.message ?? 'فشل في حذف الفئة';
        this.setErrorMessage(msg);
        this.confirmDeleteCategoryId = null;
      },
    });
  }

  requestDeleteCategory(categoryId: string): void {
    const vendorCount = this.vendors.filter(v => v.categoryId === categoryId).length;
    if (vendorCount > 0) {
      this.blockedDeleteCategoryId = categoryId;
    } else {
      this.confirmDeleteCategoryId = categoryId;
    }
  }

  vendorCountForCategory(categoryId: string): number {
    return this.vendors.filter(v => v.categoryId === categoryId).length;
  }

  toggleCategoryStatus(category: VendorCategory): void {
    const action$ = category.isActive
      ? this.vendorService.deactivateCategory(category.id)
      : this.vendorService.reactivateCategory(category.id);

    action$.subscribe({
      next: () => {
        this.setSuccessMessage(category.isActive ? 'تم تعطيل الفئة بنجاح' : 'تم تفعيل الفئة بنجاح');
        this.loadCategories();
        this.loadVendors();
      },
      error: () => this.setErrorMessage('فشل في تغيير حالة الفئة'),
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  activeCategories(): VendorCategory[] {
    return this.categories.filter((category) => category.isActive);
  }

  isSubmitting(): boolean {
    return this.isUploading || this.isUploadingGallery;
  }

  isExpired(dateStr: string | null): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  private normalizeOptionalField(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeVendorDto(
    formValue: {
      name: string;
      categoryId: string;
      discount: number;
      location?: string;
      imageUrl?: string;
      mapsUrl?: string;
      phone?: string;
      notes?: string;
      discountExpiresAt?: string;
    },
    imageUrls: string[]
  ): CreateVendorDto {
    return {
      name:              formValue.name,
      categoryId:        formValue.categoryId,
      discount:          `${formValue.discount}%`,
      location:          this.normalizeOptionalField(formValue.location),
      imageUrl:          this.normalizeOptionalField(formValue.imageUrl),
      mapsUrl:           this.normalizeOptionalField(formValue.mapsUrl),
      phone:             this.normalizeOptionalField(formValue.phone),
      notes:             this.normalizeOptionalField(formValue.notes),
      discountExpiresAt: this.normalizeOptionalField(formValue.discountExpiresAt),
      imageUrls,
    };
  }
}
