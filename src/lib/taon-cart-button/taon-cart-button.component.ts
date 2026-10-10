import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TaonECommerceCustomerApiService } from '../taon-e-commerce-customer/taon-e-commerce-customer.api.service';
import { TaonCartComponent } from '../taon-cart/taon-cart.component';
import type { TaonCartConfig } from '../taon-cart/taon-cart.models';

@Component({
  selector: 'taon-cart-button',
  templateUrl: './taon-cart-button.component.html',
  styleUrls: ['./taon-cart-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatBadgeModule, MatButtonModule, MatIconModule],
  providers: [TaonECommerceCustomerApiService],
})
export class TaonCartButtonComponent {
  @Input() config: TaonCartConfig = {};

  private readonly dialog = inject(MatDialog);
  private readonly api = inject(TaonECommerceCustomerApiService);
  readonly cartItemCount = signal(0);
  readonly error = signal('');

  constructor() {
    void this.loadCartCount();
  }

  get badgeText(): string {
    return this.config?.iconShortText ?? String(this.cartItemCount());
  }

  openCart(): void {
    const dialog = this.dialog.open(TaonCartComponent, {
      width: '100vw',
      height: '100dvh',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      panelClass: 'taon-cart-fullscreen-dialog',
    });
    dialog.componentRef?.setInput('config', this.config);
    dialog.afterClosed().subscribe(() => void this.loadCartCount());
  }

  private async loadCartCount(): Promise<void> {
    try {
      const response = await this.api.controller.getMyCart().request!();
      if (response.statusCode >= 400) {
        throw new Error(response.responseText || 'Unable to load your cart.');
      }
      const cart = response.body?.json;
      if (!cart || !Array.isArray(cart.items)) {
        throw new Error('The cart response was invalid.');
      }
      this.cartItemCount.set(
        cart.items.reduce(
          (count: number, item: { quantity: number }) =>
            count + item.quantity,
          0,
        ),
      );
    } catch (error) {
      console.error('[taon-cart-button] Unable to load cart count', error);
      this.error.set(
        error instanceof Error ? error.message : 'Unable to load your cart.',
      );
    }
  }
}
