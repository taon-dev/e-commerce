import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TaonECommerceOrderApiService } from '../../taon-e-commerce-order/taon-e-commerce-order.api.service';
import type { TaonECommerceOrderEntity } from '../../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommercePaymentTransactionApiService } from '../taon-e-commerce-payment-transaction.api.service';
import type { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction.entity';

@Component({
  selector: 'taon-e-commerce-payment-transaction-details-backoffice',
  templateUrl:
    './taon-e-commerce-payment-transaction-details-backoffice.component.html',
  styleUrls: [
    './taon-e-commerce-payment-transaction-details-backoffice.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [
    TaonECommercePaymentTransactionApiService,
    TaonECommerceOrderApiService,
  ],
})
export class TaonECommercePaymentTransactionDetailsBackofficeComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly transactionApi = inject(
    TaonECommercePaymentTransactionApiService,
  );

  private readonly orderApi = inject(TaonECommerceOrderApiService);

  readonly transaction = signal<TaonECommercePaymentTransactionEntity | null>(
    null,
  );

  readonly order = signal<TaonECommerceOrderEntity | null>(null);

  readonly loading = signal(true);

  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.loading.set(false);
      this.error.set('The transaction ID is invalid.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      const transactionResponse =
        await this.transactionApi.taonECommercePaymentTransactionController.getBy(
          id,
        ).request!();
      if (transactionResponse.statusCode >= 400) {
        throw new Error(
          transactionResponse.responseText ||
            'Unable to load transaction details.',
        );
      }

      const transaction = transactionResponse.body?.json;
      if (!transaction || typeof transaction.orderId !== 'number') {
        throw new Error('The transaction details response was invalid.');
      }

      const orderResponse =
        await this.orderApi.taonECommerceOrderController.getBy(
          transaction.orderId,
        ).request!();
      if (orderResponse.statusCode >= 400 || !orderResponse.body?.json) {
        throw new Error(
          orderResponse.responseText || 'Unable to load the related order.',
        );
      }

      this.transaction.set(transaction);
      this.order.set(orderResponse.body.json);
    } catch (error) {
      console.error(
        '[taon-e-commerce-transaction-details] Unable to load transaction',
        error,
      );
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Unable to load transaction details.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
