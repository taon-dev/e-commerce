import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TaonECommerceOrderItemApiService } from '../../taon-e-commerce-order-item/taon-e-commerce-order-item.api.service';
import { TaonECommerceOrderApiService } from '../taon-e-commerce-order.api.service';
import { TaonECommercePaymentTransactionApiService } from '../../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.api.service';
import type { TaonECommerceOrderEntity } from '../taon-e-commerce-order.entity';
import type { TaonECommerceOrderItemEntity } from '../../taon-e-commerce-order-item/taon-e-commerce-order-item.entity';
import type { TaonECommercePaymentTransactionEntity } from '../../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';

@Component({
  selector: 'taon-e-commerce-order-details-backoffice',
  templateUrl: './taon-e-commerce-order-details-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-order-details-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [
    TaonECommerceOrderApiService,
    TaonECommerceOrderItemApiService,
    TaonECommercePaymentTransactionApiService,
  ],
})
export class TaonECommerceOrderDetailsBackofficeComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly orderApi = inject(TaonECommerceOrderApiService);

  private readonly itemApi = inject(TaonECommerceOrderItemApiService);

  private readonly transactionApi = inject(
    TaonECommercePaymentTransactionApiService,
  );

  readonly order = signal<TaonECommerceOrderEntity | null>(null);

  readonly items = signal<TaonECommerceOrderItemEntity[]>([]);

  readonly transactions = signal<TaonECommercePaymentTransactionEntity[]>([]);

  readonly loading = signal(true);

  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.loading.set(false);
      this.error.set('The order ID is invalid.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      const [orderResponse, itemsResponse, transactionsResponse] =
        await Promise.all([
          this.orderApi.taonECommerceOrderController.getBy(id).request!(),
          this.itemApi.taonECommerceOrderItemController.getAll().request!(),
          this.transactionApi.taonECommercePaymentTransactionController.getAll()
            .request!(),
        ]);
      if (
        orderResponse.statusCode >= 400 ||
        itemsResponse.statusCode >= 400 ||
        transactionsResponse.statusCode >= 400
      ) {
        throw new Error(
          orderResponse.responseText ||
            itemsResponse.responseText ||
            transactionsResponse.responseText ||
            'Unable to load order details.',
        );
      }

      const order = orderResponse.body?.json;
      const items = itemsResponse.body?.json;
      const transactions = transactionsResponse.body?.json;
      if (!order || !Array.isArray(items) || !Array.isArray(transactions)) {
        throw new Error('The order details response was invalid.');
      }

      this.order.set(order);
      this.items.set(
        (items as TaonECommerceOrderItemEntity[]).filter(
          item => item.orderId === id,
        ),
      );
      this.transactions.set(
        (transactions as TaonECommercePaymentTransactionEntity[]).filter(
          transaction => transaction.orderId === id,
        ),
      );
    } catch (error) {
      console.error(
        '[taon-e-commerce-order-details] Unable to load order',
        error,
      );
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Unable to load order details.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
