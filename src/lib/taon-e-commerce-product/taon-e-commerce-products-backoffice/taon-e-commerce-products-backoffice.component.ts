import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonECommerceProductApiService } from '../taon-e-commerce-product.api.service';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product.entity';
import { TaonECommerceProductEditDialogComponent } from '../taon-e-commerce-product-edit-dialog.component';
import type { TaonECommerceProductEditDialogData } from '../taon-e-commerce-product-edit-dialog.component';

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

  readonly syncInProgress = signal(false);

  readonly syncError = signal('');

  ngAfterViewInit(): void {
    this.datatable.reload();
  }

  add(): void {
    this.openEditor({});
  }

  edit(product: TaonECommerceProductEntity): void {
    this.openEditor({ product });
  }

  async syncWithStripe(): Promise<void> {
    if (this.syncInProgress()) {
      return;
    }

    this.syncInProgress.set(true);
    this.syncError.set('');
    try {
      await this.api.syncWithStripe();
      this.datatable.reload();
    } catch (error) {
      console.error(
        '[taon-e-commerce-products-backoffice] Stripe sync failed',
        error,
      );
      this.syncError.set(
        error instanceof Error
          ? error.message
          : 'Stripe synchronization could not be completed.',
      );
    } finally {
      this.syncInProgress.set(false);
    }
  }

  private openEditor(data: TaonECommerceProductEditDialogData): void {
    const ref = this.dialog.open(TaonECommerceProductEditDialogComponent, {
      data,
      width: '44rem',
      maxWidth: '95vw',
      disableClose: true,
    });
    ref.afterClosed().subscribe(product => {
      if (product) {
        this.datatable.reload();
      }
    });
  }

  public get crud() {
    return this.api.taonECommerceProductController;
  }
}
