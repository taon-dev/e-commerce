import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import type { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import type { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommerceCustomerApiService } from '../taon-e-commerce-customer/taon-e-commerce-customer.api.service';
import type { TaonECommerceEntitlementEntity } from '../taon-e-commerce-entitlement/taon-e-commerce-entitlement.entity';
import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';
import type { TaonCartConfig } from './taon-cart.models';

@Component({
  selector: 'taon-cart',
  templateUrl: './taon-cart.component.html',
  styleUrls: ['./taon-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TaonDatatableComponent,
  ],
  providers: [TaonECommerceCustomerApiService],
})
export class TaonCartComponent {
  @Input() config: TaonCartConfig = {};

  private readonly api = inject(TaonECommerceCustomerApiService);
  private readonly dialogRef = inject(MatDialogRef, { optional: true });

  readonly cart = signal<TaonECommerceCartEntity | null>(null);
  readonly orders = signal<TaonECommerceOrderEntity[]>([]);
  readonly entitlements = signal<TaonECommerceEntitlementEntity[]>([]);
  readonly products = signal<TaonECommerceProductEntity[]>([]);
  readonly productsLoaded = signal(false);
  readonly mainTabIndex = signal(0);
  readonly purchasedTabIndex = signal(0);
  readonly loadingCart = signal(false);
  readonly loadingOrders = signal(false);
  readonly loadingEntitlements = signal(false);
  readonly creatingCheckout = signal(false);
  readonly error = signal('');

  readonly orderColumns: MtxGridColumn[] = [
    { header: 'Order ID', field: 'id', sortable: true },
    { header: 'Status', field: 'status', sortable: true },
    { header: 'Total', field: 'total', sortable: true },
    { header: 'Currency', field: 'currency', sortable: true },
    { header: 'Created', field: 'createdAt', sortable: true },
  ];

  constructor() {
    void this.loadCart();
    void this.loadProducts();
  }

  close(): void {
    this.dialogRef?.close();
  }

  onMainTabChange(index: number): void {
    this.mainTabIndex.set(index);
    if (index === 3) {
      void this.loadEntitlements();
    }
  }

  onSettingsTabChange(index: number): void {
    this.purchasedTabIndex.set(index);
    if (index === 0) {
      void this.loadEntitlements();
    } else if (index === 1) {
      void this.loadOrders();
    }
  }

  get suggestedProducts(): TaonECommerceProductEntity[] {
    return this.products();
  }

  get hasSuggestedProducts(): boolean {
    return this.suggestedProducts.length > 0;
  }

  get validCartItems() {
    return (this.cart()?.items ?? []).filter(
      item => item.product?.active === true,
    );
  }

  get cartSubtotal(): number {
    return this.validCartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }

  get activeSubscriptionEntitlements(): TaonECommerceEntitlementEntity[] {
    const now = Date.now();
    return this.entitlements().filter(
      entitlement =>
        entitlement.product.type === 'subscription' &&
        (entitlement.status === 'active' ||
          (entitlement.status === 'canceled' &&
            Boolean(entitlement.currentPeriodEnd) &&
          Date.parse(entitlement.currentPeriodEnd!.toString()) > now)),
    );
  }

  get purchasedProductHistory(): TaonECommerceEntitlementEntity[] {
    return this.entitlements().filter(
      entitlement => entitlement.product.type !== 'subscription',
    );
  }

  async loadCart(): Promise<void> {
    this.loadingCart.set(true);
    this.error.set('');
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.getMyCart().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your cart.', error);
    } finally {
      this.loadingCart.set(false);
    }
  }

  async loadProducts(): Promise<void> {
    try {
      const products = await this.request<TaonECommerceProductEntity[]>(
        this.api.controller.getBuyProducts().request!(),
      );
      this.products.set(products.filter(product => product.active === true));
      this.productsLoaded.set(true);
    } catch (error) {
      this.reportError('Unable to load available products.', error);
      this.products.set([]);
      this.productsLoaded.set(true);
    }
  }

  async addProduct(product: TaonECommerceProductEntity): Promise<void> {
    if (typeof product.id !== 'number') {
      this.error.set('This suggested product does not have a saved product ID.');
      return;
    }
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.addToMyCart(product.id, 1).request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to add this product to your cart.', error);
    }
  }

  async updateQuantity(itemId: number, quantity: number): Promise<void> {
    if (quantity < 1) {
      await this.removeItem(itemId);
      return;
    }
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.updateMyCartItem(itemId, quantity).request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to update the cart item.', error);
    }
  }

  async removeItem(itemId: number): Promise<void> {
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.removeFromMyCart(itemId).request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to remove the cart item.', error);
    }
  }

  async loadOrders(): Promise<void> {
    this.loadingOrders.set(true);
    this.error.set('');
    try {
      this.orders.set(
        await this.request<TaonECommerceOrderEntity[]>(
          this.api.controller.getMyOrders().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your orders.', error);
    } finally {
      this.loadingOrders.set(false);
    }
  }

  async loadEntitlements(): Promise<void> {
    this.loadingEntitlements.set(true);
    this.error.set('');
    try {
      this.entitlements.set(
        await this.request<TaonECommerceEntitlementEntity[]>(
          this.api.controller.getMyEntitlements().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your purchases.', error);
    } finally {
      this.loadingEntitlements.set(false);
    }
  }

  goToCheckout(): void {
    if (!this.validCartItems.length) {
      return;
    }
    this.mainTabIndex.set(2);
  }

  async checkout(): Promise<void> {
    if (this.creatingCheckout() || !this.validCartItems.length) {
      return;
    }
    this.creatingCheckout.set(true);
    this.error.set('');
    try {
      const session = await this.request<{ checkoutUrl: string }>(
        this.api.controller.createMyCheckoutSession().request!(),
      );
      window.location.assign(session.checkoutUrl);
    } catch (error) {
      this.reportError('Unable to start Stripe Checkout.', error);
    } finally {
      this.creatingCheckout.set(false);
    }
  }

  private async request<T>(
    endpoint: Promise<{
      statusCode: number;
      responseText: string;
      body?: { json?: T };
    }>,
  ): Promise<T> {
    const response = await endpoint;
    if (response.statusCode >= 400) {
      throw new Error(response.responseText || 'The request failed.');
    }
    const result = response.body?.json;
    if (result === undefined || result === null) {
      throw new Error('The server returned an empty response.');
    }
    return result;
  }

  private reportError(message: string, error: unknown): void {
    console.error('[taon-cart]', message, error);
    this.error.set(error instanceof Error ? error.message : message);
  }
}
