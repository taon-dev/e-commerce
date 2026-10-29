import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonECommerceOrderApiService } from '../../taon-e-commerce-order/taon-e-commerce-order.api.service';
import type { TaonECommerceOrderEntity } from '../../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommercePaymentTransactionApiService } from '../taon-e-commerce-payment-transaction.api.service';
import type { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction.entity';
import { TaonECommerceOrdersBackofficeModels } from '../../taon-e-commerce-order/taon-e-commerce-orders-backoffice/taon-e-commerce-orders-backoffice.models';
import { TaonECommercePaymentTransactionsBackofficeModels } from './taon-e-commerce-payment-transactions-backoffice.models';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

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
  t = t.for(this);

  readonly statusLabels = TaonECommercePaymentTransactionsBackofficeModels.statusLabels(this);

  readonly providerLabels = TaonECommercePaymentTransactionsBackofficeModels.providerLabels(this);

  readonly orderStatusLabels = TaonECommerceOrdersBackofficeModels.statusLabels(this);

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
      this.error.set(this.t.gettext('The transaction ID is invalid.'));
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
            this.t.gettext('Unable to load transaction details.'),
        );
      }

      const transaction = transactionResponse.body?.json;
      if (!transaction || typeof transaction.orderId !== 'number') {
        throw new Error(this.t.gettext('The transaction details response was invalid.'));
      }

      const orderResponse =
        await this.orderApi.taonECommerceOrderController.getBy(
          transaction.orderId,
        ).request!();
      if (orderResponse.statusCode >= 400 || !orderResponse.body?.json) {
        throw new Error(
          orderResponse.responseText || this.t.gettext('Unable to load the related order.'),
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
          : this.t.gettext('Unable to load transaction details.'),
      );
    } finally {
      this.loading.set(false);
    }
  }
}
