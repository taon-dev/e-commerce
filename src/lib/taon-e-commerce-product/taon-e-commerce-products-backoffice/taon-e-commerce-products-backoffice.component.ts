import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  signal,
  AfterViewInit,
  computed,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { Translation } from '@taon-dev/i18n/src';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Taon } from 'taon/src';

import { TaonECommerceProductApiService } from '../taon-e-commerce-product.api.service';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product.entity';
import { TaonECommerceStripeSyncDialogComponent } from '../taon-e-commerce-stripe-sync-dialog.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-e-commerce-products-backoffice',
  templateUrl: './taon-e-commerce-products-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-products-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, TaonDatatableComponent],
  providers: [TaonECommerceProductApiService],
})
export class TaonECommerceProductsBackofficeComponent implements AfterViewInit {
  readonly t = t.for(this);

  @ViewChild(TaonDatatableComponent)
  readonly datatable!: TaonDatatableComponent;

  readonly taonECommerceProductApiService = inject(
    TaonECommerceProductApiService,
  );

  private readonly labels = {
    id: this.t.signal.gettext('ID'),
    name: this.t.signal.gettext('Name'),
    type: this.t.signal.gettext('Type'),
    price: this.t.signal.gettext('Price'),
    currency: this.t.signal.gettext('Currency'),
    active: this.t.signal.gettext('Active'),
    synchronized: this.t.signal.gettext('Stripe synchronized'),
    actions: this.t.signal.gettext('Actions'),
    edit: this.t.signal.gettext('Edit product'),
    duplicate: this.t.signal.gettext('Duplicate'),
  };

  private readonly productTypeLabels = {
    lifetime: this.t.signal.gettext('Lifetime'),
    item: this.t.signal.gettext('Item'),
    subscription: this.t.signal.gettext('Subscription'),
    digital: this.t.signal.gettext('Digital'),
    physical: this.t.signal.gettext('Physical'),
    service: this.t.signal.gettext('Service'),
  };

  readonly columns = computed<MtxGridColumn[]>(() => [
    { header: this.labels.id(), field: 'id', sortable: true },
    { header: this.labels.name(), field: 'name', sortable: true },
    {
      header: this.labels.type(),
      field: 'type',
      sortable: true,
      formatter: (product: TaonECommerceProductEntity) => this.productTypeLabels[product.type]?.() ?? product.type,
    },
    { header: this.labels.price(), field: 'price', sortable: true },
    { header: this.labels.currency(), field: 'currency', sortable: true },
    {
      header: this.labels.active(),
      field: 'active',
      sortable: true,
      formatter: (product: TaonECommerceProductEntity) => product.active ? this.t.gettext('Yes') : this.t.gettext('No'),
    },
    {
      header: this.labels.synchronized(),
      field: 'stripeLastSyncedAt',
      sortable: true,
    },
    {
      header: this.labels.actions(),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: this.labels.edit(),
          click: (product: TaonECommerceProductEntity) => this.edit(product),
        },
        {
          type: 'icon',
          icon: 'content_copy',
          tooltip: this.labels.duplicate(),
          disabled: () => this.duplicating(),
          click: (product: TaonECommerceProductEntity) => void this.duplicate(product),
        },
      ],
    },
  ]);

  private readonly dialog = inject(MatDialog);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  readonly syncDialogOpen = signal(false);

  readonly duplicating = signal(false);

  readonly error = signal('');

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

  async duplicate(product: TaonECommerceProductEntity): Promise<void> {
    if (this.duplicating()) {
      return;
    }
    this.duplicating.set(true);
    this.error.set('');
    try {
      await this.taonECommerceProductApiService.duplicate(product.id);
      this.datatable.reload();
    } catch (error) {
      console.error('[taon-e-commerce-products] Unable to duplicate product', error);
      this.error.set(error instanceof Error
        ? error.message
        : this.t.gettext('Unable to duplicate the product.'));
    } finally {
      this.duplicating.set(false);
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
    return this.taonECommerceProductApiService.crudController;
  }
}
