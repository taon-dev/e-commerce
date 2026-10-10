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
import type { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';
import { TaonECommerceCustomerApiService } from '../taon-e-commerce-customer/taon-e-commerce-customer.api.service';
import type { TaonECommerceSubscriptionStatus } from '../taon-e-commerce-customer/taon-e-commerce-customer.controller';
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
  readonly transactions = signal<TaonECommercePaymentTransactionEntity[]>([]);
  readonly subscriptions = signal<TaonECommerceSubscriptionStatus[]>([]);
  readonly loadingCart = signal(false);
  readonly loadingOrders = signal(false);
  readonly loadingTransactions = signal(false);
  readonly loadingSubscriptions = signal(false);
  readonly error = signal('');

  readonly orderColumns: MtxGridColumn[] = [
    { header: 'Order ID', field: 'id', sortable: true },
    { header: 'Status', field: 'status', sortable: true },
    { header: 'Total', field: 'total', sortable: true },
    { header: 'Currency', field: 'currency', sortable: true },
    { header: 'Created', field: 'createdAt', sortable: true },
  ];

  readonly transactionColumns: MtxGridColumn[] = [
    { header: 'ID', field: 'id', sortable: true },
    { header: 'Order ID', field: 'orderId', sortable: true },
    { header: 'Provider', field: 'provider', sortable: true },
    { header: 'Status', field: 'status', sortable: true },
    { header: 'Amount', field: 'amount', sortable: true },
    { header: 'Currency', field: 'currency', sortable: true },
    { header: 'Created', field: 'createdAt', sortable: true },
  ];

  constructor() {
    void this.loadCart();
  }

  close(): void {
    this.dialogRef?.close();
  }

  onMainTabChange(index: number): void {
    if (index === (this.hasSuggestedProducts ? 2 : 1)) {
      void this.loadSubscriptions();
    }
  }

  onSettingsTabChange(index: number): void {
    if (index === 0) {
      void this.loadSubscriptions();
    } else if (index === 1) {
      void this.loadOrders();
    } else if (index === 2) {
      void this.loadTransactions();
    }
  }

  get suggestedProducts(): TaonECommerceProductEntity[] {
    return this.config?.suggestedProducts ?? [];
  }

  get hasSuggestedProducts(): boolean {
    return this.suggestedProducts.length > 0;
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

  async loadTransactions(): Promise<void> {
    this.loadingTransactions.set(true);
    this.error.set('');
    try {
      this.transactions.set(
        await this.request<TaonECommercePaymentTransactionEntity[]>(
          this.api.controller.getMyTransactions().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your transactions.', error);
    } finally {
      this.loadingTransactions.set(false);
    }
  }

  async loadSubscriptions(): Promise<void> {
    this.loadingSubscriptions.set(true);
    this.error.set('');
    try {
      this.subscriptions.set(
        await this.request<TaonECommerceSubscriptionStatus[]>(
          this.api.controller.getMySubscriptionStatuses().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load subscription statuses.', error);
    } finally {
      this.loadingSubscriptions.set(false);
    }
  }

  async unsubscribe(): Promise<void> {
    this.error.set('');
    try {
      const response = await this.api.controller
        .unsubscribeFromExampleSubscription()
        .request!();
      if (response.statusCode >= 400) {
        throw new Error(response.responseText || 'The request failed.');
      }
      await this.loadSubscriptions();
    } catch (error) {
      this.reportError('Unable to unsubscribe.', error);
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
