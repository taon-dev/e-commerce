import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { TaonECommerceOrderItemApiService } from '../taon-e-commerce-order-item/taon-e-commerce-order-item.api.service';
import { TaonECommerceOrderApiService } from '../taon-e-commerce-order/taon-e-commerce-order.api.service';
import { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommerceOrderItemEntity } from '../taon-e-commerce-order-item/taon-e-commerce-order-item.entity';

interface DashboardSummary {
  paidOrders: number;
  productsSold: number;
  earnings: Array<{ currency: string; total: number }>;
}

@Component({
  selector: 'app-taon-e-commerce-backoffice-dashboard',
  templateUrl: './taon-e-commerce-backoffice-dashboard.component.html',
  styleUrls: ['./taon-e-commerce-backoffice-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  providers: [TaonECommerceOrderApiService, TaonECommerceOrderItemApiService],
})
export class TaonECommerceBackofficeDashboardComponent {
  private readonly orderApi = inject(TaonECommerceOrderApiService);

  private readonly orderItemApi = inject(TaonECommerceOrderItemApiService);

  readonly summary = signal<DashboardSummary | null>(null);

  readonly loading = signal(true);

  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.summary.set(null);

    try {
      const [ordersResponse, itemsResponse] = await Promise.all([
        this.orderApi.taonECommerceOrderController.getAll().request!(),
        this.orderItemApi.taonECommerceOrderItemController.getAll().request!(),
      ]);
      if (ordersResponse.statusCode >= 400 || itemsResponse.statusCode >= 400) {
        throw new Error(
          ordersResponse.responseText ||
            itemsResponse.responseText ||
            'Unable to load e-commerce summary data.',
        );
      }

      const orders = ordersResponse.body?.json;
      const items = itemsResponse.body?.json;
      if (!Array.isArray(orders) || !Array.isArray(items)) {
        throw new Error('The e-commerce summary response was invalid.');
      }

      const paidOrders = (orders as TaonECommerceOrderEntity[]).filter(
        order => order.status === 'paid',
      );
      const paidOrderIds = new Set(paidOrders.map(order => order.id));
      const productsSold = (items as TaonECommerceOrderItemEntity[])
        .filter(item => paidOrderIds.has(item.orderId))
        .reduce((count, item) => count + item.quantity, 0);
      const earningsByCurrency = new Map<string, number>();

      for (const order of paidOrders) {
        const currency = order.currency.toUpperCase();
        const total = Number(order.total);
        if (!Number.isFinite(total)) {
          throw new Error(`Order ${order.id} has an invalid total.`);
        }
        earningsByCurrency.set(
          currency,
          (earningsByCurrency.get(currency) ?? 0) + total,
        );
      }

      this.summary.set({
        paidOrders: paidOrders.length,
        productsSold,
        earnings: [...earningsByCurrency].map(([currency, total]) => ({
          currency,
          total,
        })),
      });
    } catch (error) {
      console.error(
        '[taon-e-commerce-dashboard] Unable to load summary',
        error,
      );
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Unable to load e-commerce summary data.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
