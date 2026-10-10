import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonECommercePaymentTransactionApiService } from '../taon-e-commerce-payment-transaction.api.service';
import { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction.entity';

@Component({
  selector: 'app-taon-e-commerce-payment-transactions-backoffice',
  templateUrl:
    './taon-e-commerce-payment-transactions-backoffice.component.html',
  styleUrls: [
    './taon-e-commerce-payment-transactions-backoffice.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TaonDatatableComponent],
  providers: [TaonECommercePaymentTransactionApiService],
})
export class TaonECommercePaymentTransactionsBackofficeComponent {
  @ViewChild(TaonDatatableComponent)
  readonly datatable!: TaonDatatableComponent;

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  readonly api = inject(TaonECommercePaymentTransactionApiService);

  readonly columns: MtxGridColumn[] = [
    { header: 'ID', field: 'id', sortable: true },
    { header: 'Order ID', field: 'orderId', sortable: true },
    { header: 'Provider', field: 'provider', sortable: true },
    {
      header: 'Provider transaction ID',
      field: 'providerTransactionId',
      sortable: true,
    },
    { header: 'Status', field: 'status', sortable: true },
    { header: 'Amount', field: 'amount', sortable: true },
    { header: 'Currency', field: 'currency', sortable: true },
    { header: 'Created', field: 'createdAt', sortable: true },
    {
      header: 'Actions',
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: 'View transaction',
          click: (transaction: TaonECommercePaymentTransactionEntity) =>
            this.openTransaction(transaction),
        },
      ],
    },
  ];

  ngAfterViewInit(): void {
    this.datatable.reload();
  }

  openTransaction(transaction: TaonECommercePaymentTransactionEntity): void {
    if (typeof transaction.id !== 'number') {
      return;
    }
    void this.router.navigate([transaction.id], { relativeTo: this.route });
  }

  public get crud() {
    return this.api.taonECommercePaymentTransactionController;
  }
}
