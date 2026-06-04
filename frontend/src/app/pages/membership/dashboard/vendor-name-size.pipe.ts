import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns a CSS class based on the length of a vendor name so the card body
 * can shrink the font size for longer names.
 *
 * ≤ 20 chars  → ''              (default, 0.95rem)
 * 21–35 chars → 'name--md'      (0.85rem)
 * > 35 chars  → 'name--sm'      (0.75rem)
 */
@Pipe({ name: 'vendorNameSize', standalone: true })
export class VendorNameSizePipe implements PipeTransform {
  transform(name: string): string {
    if (!name) return '';
    if (name.length <= 20) return '';
    if (name.length <= 35) return 'name--md';
    return 'name--sm';
  }
}
