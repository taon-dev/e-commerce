import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  computed,
} from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonECommerceOrderApiService } from '../taon-e-commerce-order.api.service';
import { TaonECommerceOrderEntity } from '../taon-e-commerce-order.entity';
import { TaonECommerceOrdersBackofficeModels } from './taon-e-commerce-orders-backoffice.models';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-e-commerce-orders-backoffice',
  templateUrl: './taon-e-commerce-orders-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-orders-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TaonDatatableComponent],
  providers: [TaonECommerceOrderApiService],
})
export class TaonECommerceOrdersBackofficeComponent {
  t = t.for(this);

  @ViewChild(TaonDatatableComponent)
  readonly datatable!: TaonDatatableComponent;

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  readonly api = inject(TaonECommerceOrderApiService);

  private readonly statusLabels = TaonECommerceOrdersBackofficeModels.statusLabels(this);

  private readonly columnLabels = {
    id: this.t.signal.gettext('Order ID'),
    user: this.t.signal.gettext('User'),
    status: this.t.signal.gettext('Status'),
    total: this.t.signal.gettext('Total'),
    currency: this.t.signal.gettext('Currency'),
    created: this.t.signal.gettext('Created'),
    actions: this.t.signal.gettext('Actions'),
    view: this.t.signal.gettext('View order'),
  };

  readonly columns = computed<MtxGridColumn[]>(() => [
    { header: this.columnLabels.id(), field: 'id', sortable: true },
    { header: this.columnLabels.user(), field: 'userId', sortable: true },
    {
      header: this.columnLabels.status(),
      field: 'status',
      sortable: true,
      formatter: (order: TaonECommerceOrderEntity) => this.statusLabels[order.status]?.() ?? order.status,
    },
    { header: this.columnLabels.total(), field: 'total', sortable: true },
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
          click: (order: TaonECommerceOrderEntity) => this.openOrder(order),
        },
      ],
    },
  ]);

  ngAfterViewInit(): void {
    this.datatable.reload();
  }

  openOrder(order: TaonECommerceOrderEntity): void {
    if (typeof order.id !== 'number') {
      return;
    }
    void this.router.navigate([order.id], { relativeTo: this.route });
  }

  public get crud() {
    return this.api.taonECommerceOrderController;
  }
}
