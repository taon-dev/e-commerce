import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import type { TaonProductEligibility } from '../../taon-e-commerce-product/taon-e-commerce-product-eligibility';
import type { TaonECommerceProductEntity } from '../../taon-e-commerce-product/taon-e-commerce-product.entity';
import { TaonCartProductThumbnailComponent } from '../taon-cart-product-thumbnail/taon-cart-product-thumbnail.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export interface TaonCartProductDialogData {
  product: TaonECommerceProductEntity;
  eligibility: () => TaonProductEligibility | undefined;
  inCart: () => boolean;
  addToCart: () => Promise<boolean>;
  goToCart: () => void;
}

@Component({
  selector: 'taon-cart-product-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatDialogModule,
    TaonCartProductThumbnailComponent,
  ],
  templateUrl: './taon-cart-product-dialog.component.html',
  styleUrl: './taon-cart-product-dialog.component.scss',
})
export class TaonCartProductDialogComponent {
  t = t.for(this);

  readonly data = inject<TaonCartProductDialogData>(MAT_DIALOG_DATA);

  readonly busy = signal(false);

  readonly error = signal('');

  private readonly dialogRef = inject(
    MatDialogRef<TaonCartProductDialogComponent>,
  );

  get subscriptionLabel(): string {
    const value = this.data.product.subscriptionIntervalValue;
    switch (this.data.product.subscriptionIntervalUnit) {
      case 'seconds':
        return this.t.gettext('Subscription: [[ value ]] seconds', { value });
      case 'minutes':
        return this.t.gettext('Subscription: [[ value ]] minutes', { value });
      case 'hours':
        return this.t.gettext('Subscription: [[ value ]] hours', { value });
      case 'days':
        return this.t.gettext('Subscription: [[ value ]] days', { value });
      default:
        return this.t.gettext('Subscription: [[ value ]]', { value });
    }
  }

  async addToCart(): Promise<void> {
    if (this.busy() || !this.data.eligibility()?.canAdd) {
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      if (await this.data.addToCart()) {
        this.dialogRef.close();
      } else {
        this.error.set(
          this.t.gettext('Unable to add this product. Close the dialog for details or try again.'),
        );
      }
    } finally {
      this.busy.set(false);
    }
  }

  goToCart(): void {
    this.data.goToCart();
    this.dialogRef.close();
  }
}
