import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonECommercePaymentTransactionApiService } from '../taon-e-commerce-payment-transaction.api.service';
import { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction.entity';
import { TaonECommercePaymentTransactionsBackofficeModels } from './taon-e-commerce-payment-transactions-backoffice.models';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

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
  t = t.for(this);

  @ViewChild(TaonDatatableComponent)
  readonly datatable!: TaonDatatableComponent;

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  readonly api = inject(TaonECommercePaymentTransactionApiService);

  private readonly statusLabels = TaonECommercePaymentTransactionsBackofficeModels.statusLabels(this);

  private readonly providerLabels = TaonECommercePaymentTransactionsBackofficeModels.providerLabels(this);

  private readonly columnLabels = {
    id: this.t.signal.gettext('ID'),
    orderId: this.t.signal.gettext('Order ID'),
    provider: this.t.signal.gettext('Provider'),
    providerTransactionId: this.t.signal.gettext('Provider transaction ID'),
    status: this.t.signal.gettext('Status'),
    amount: this.t.signal.gettext('Amount'),
    currency: this.t.signal.gettext('Currency'),
    created: this.t.signal.gettext('Created'),
    actions: this.t.signal.gettext('Actions'),
    view: this.t.signal.gettext('View transaction'),
  };

  readonly columns = computed<MtxGridColumn[]>(() => [
    { header: this.columnLabels.id(), field: 'id', sortable: true },
    { header: this.columnLabels.orderId(), field: 'orderId', sortable: true },
    {
      header: this.columnLabels.provider(),
      field: 'provider',
      sortable: true,
      formatter: (transaction: TaonECommercePaymentTransactionEntity) => this.providerLabels[transaction.provider]?.() ?? transaction.provider,
    },
    {
      header: this.columnLabels.providerTransactionId(),
      field: 'providerTransactionId',
      sortable: true,
    },
    {
      header: this.columnLabels.status(),
      field: 'status',
      sortable: true,
      formatter: (transaction: TaonECommercePaymentTransactionEntity) => this.statusLabels[transaction.status]?.() ?? transaction.status,
    },
    { header: this.columnLabels.amount(), field: 'amount', sortable: true },
    { header: this.columnLabels.currency(), field: 'currency', sortable: true },
    { header: this.columnLabels.created(), field: 'createdAt', sortable: true },
    {
      header: this.columnLabels.actions(),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.columnLabels.view(),
          click: (transaction: TaonECommercePaymentTransactionEntity) =>
            this.openTransaction(transaction),
        },
      ],
    },
  ]);

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
