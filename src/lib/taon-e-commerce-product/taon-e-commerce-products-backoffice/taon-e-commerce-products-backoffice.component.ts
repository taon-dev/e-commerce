import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonECommerceProductApiService } from '../taon-e-commerce-product.api.service';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product.entity';
import { TaonECommerceStripeSyncDialogComponent } from '../taon-e-commerce-stripe-sync-dialog.component';

@Component({
  selector: 'app-taon-e-commerce-products-backoffice',
  templateUrl: './taon-e-commerce-products-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-products-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TaonDatatableComponent],
  providers: [TaonECommerceProductApiService],
})
export class TaonECommerceProductsBackofficeComponent {
  @ViewChild(TaonDatatableComponent)
  readonly datatable!: TaonDatatableComponent;

  readonly api = inject(TaonECommerceProductApiService);

  readonly columns: MtxGridColumn[] = [
    { header: 'ID', field: 'id', sortable: true },
    { header: 'Name', field: 'name', sortable: true },
    { header: 'Type', field: 'type', sortable: true },
    { header: 'Price', field: 'price', sortable: true },
    { header: 'Currency', field: 'currency', sortable: true },
    { header: 'Active', field: 'active', sortable: true },
    {
      header: 'Stripe synchronized',
      field: 'stripeLastSyncedAt',
      sortable: true,
    },
    {
      header: 'Actions',
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: 'Edit product',
          click: (product: TaonECommerceProductEntity) => this.edit(product),
        },
      ],
    },
  ];

  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly syncDialogOpen = signal(false);

  ngAfterViewInit(): void {
    this.datatable.reload();
  }

  add(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  edit(product: TaonECommerceProductEntity): void {
    if (typeof product.id === 'number') {
      void this.router.navigate(['edit', product.id], {
        relativeTo: this.route,
      });
    }
  }

  async syncWithStripe(): Promise<void> {
    if (this.syncDialogOpen()) {
      return;
    }
    this.syncDialogOpen.set(true);
    this.dialog
      .open(TaonECommerceStripeSyncDialogComponent, {
        width: '42rem',
        maxWidth: '95vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe(results => {
        this.syncDialogOpen.set(false);
        if (Array.isArray(results) && results.some(result => result.success)) {
          this.datatable.reload();
        }
      });
  }

  public get crud() {
    return this.api.taonECommerceProductController;
  }
}
