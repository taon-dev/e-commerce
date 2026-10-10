import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
} from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { TaonECommerceOrderApiService } from '../taon-e-commerce-order.api.service';
import { TaonECommerceOrderEntity } from '../taon-e-commerce-order.entity';

@Component({
  selector: 'app-taon-e-commerce-orders-backoffice',
  templateUrl: './taon-e-commerce-orders-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-orders-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TaonDatatableComponent],
  providers: [TaonECommerceOrderApiService],
})
export class TaonECommerceOrdersBackofficeComponent {
  @ViewChild(TaonDatatableComponent)
  readonly datatable!: TaonDatatableComponent;

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  readonly api = inject(TaonECommerceOrderApiService);

  readonly columns: MtxGridColumn[] = [
    { header: 'Order ID', field: 'id', sortable: true },
    { header: 'User', field: 'userId', sortable: true },
    { header: 'Status', field: 'status', sortable: true },
    { header: 'Total', field: 'total', sortable: true },
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
          tooltip: 'View order',
          click: (order: TaonECommerceOrderEntity) => this.openOrder(order),
        },
      ],
    },
  ];

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
