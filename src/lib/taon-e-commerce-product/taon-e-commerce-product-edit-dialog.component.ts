import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaonPermissionApiService } from '@taon-dev/session/src';
import type { TaonPermissionEntity } from '@taon-dev/session/src';

import { TaonECommerceProductPermissionApiService } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.api.service';
import { TaonECommerceProductPermissionEntity } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.entity';
import { TaonECommerceProductApiService } from './taon-e-commerce-product.api.service';
import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';

export interface TaonECommerceProductEditDialogData {
  product?: TaonECommerceProductEntity;
}

type ProductType = TaonECommerceProductEntity['type'];
type ProductCurrency = 'PLN' | 'EUR' | 'USD';

interface ProductDraft {
  name: string;
  description: string;
  active: boolean;
  type: ProductType;
  price: number | null;
  currency: ProductCurrency;
}

@Component({
  selector: 'taon-e-commerce-product-edit-dialog',
  templateUrl: './taon-e-commerce-product-edit-dialog.component.html',
  styleUrls: ['./taon-e-commerce-product-edit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    TaonECommerceProductApiService,
    TaonECommerceProductPermissionApiService,
    TaonPermissionApiService,
  ],
})
export class TaonECommerceProductEditDialogComponent {
  readonly data = inject<TaonECommerceProductEditDialogData>(MAT_DIALOG_DATA);

  readonly dialogRef = inject(
    MatDialogRef<TaonECommerceProductEditDialogComponent>,
  );

  private readonly productApi = inject(TaonECommerceProductApiService);

  private readonly productPermissionApi = inject(
    TaonECommerceProductPermissionApiService,
  );

  private readonly permissionApi = inject(TaonPermissionApiService);

  readonly productTypes: ProductType[] = ['digital', 'physical', 'service'];
  readonly currencies: ProductCurrency[] = ['PLN', 'EUR', 'USD'];
  private readonly initialCurrency =
    this.currencies.find(
      currency => currency === this.data.product?.currency,
    ) ?? 'USD';

  readonly draft = signal<ProductDraft>({
    name: this.data.product?.name ?? '',
    description: this.data.product?.description ?? '',
    active: this.data.product?.active ?? true,
    type: this.data.product?.type ?? ('digital' as ProductType),
    price: this.data.product?.price ?? 0,
    currency: this.initialCurrency,
  });

  readonly permissions = signal<TaonPermissionEntity[]>([]);

  readonly selectedPermissionIds = signal<number[]>([]);

  readonly loading = signal(true);

  readonly permissionsLoaded = signal(false);

  readonly saving = signal(false);

  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.permissionsLoaded.set(false);

    try {
      const [permissionsResponse, linksResponse] = await Promise.all([
        this.permissionApi.taonPermissionController.getAll().request!(),
        this.productPermissionApi.taonECommerceProductPermissionController.getAll()
          .request!(),
      ]);

      if (
        permissionsResponse.statusCode >= 400 ||
        linksResponse.statusCode >= 400
      ) {
        throw new Error(
          permissionsResponse.responseText ||
            linksResponse.responseText ||
            'Unable to load product permissions.',
        );
      }

      const permissionRows = permissionsResponse.body?.json;
      const productPermissionRows = linksResponse.body?.json;
      if (
        !Array.isArray(permissionRows) ||
        !Array.isArray(productPermissionRows)
      ) {
        throw new Error('The permissions response was invalid.');
      }

      this.permissions.set(permissionRows);
      this.permissionsLoaded.set(true);
      const productId = this.data.product?.id;
      this.selectedPermissionIds.set(
        typeof productId === 'number'
          ? (productPermissionRows as TaonECommerceProductPermissionEntity[])
              .filter(link => link.productId === productId)
              .map(link => link.permissionId)
          : [],
      );
    } catch (error) {
      console.error(
        '[taon-e-commerce-product-edit] Unable to load permissions',
        error,
      );
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Unable to load product permissions.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  updateType(type: ProductType): void {
    this.draft.update(draft => ({ ...draft, type }));
  }

  updatePrice(price: number | null): void {
    this.draft.update(draft => ({ ...draft, price }));
  }

  updateName(name: string): void {
    this.draft.update(draft => ({ ...draft, name }));
  }

  updateDescription(description: string): void {
    this.draft.update(draft => ({ ...draft, description }));
  }

  updateActive(active: boolean): void {
    this.draft.update(draft => ({ ...draft, active }));
  }

  updateCurrency(currency: ProductCurrency): void {
    this.draft.update(draft => ({ ...draft, currency }));
  }

  async save(): Promise<void> {
    if (this.saving() || this.loading() || !this.permissionsLoaded()) {
      return;
    }

    const draft = this.draft();
    if (
      !draft.name.trim() ||
      !this.currencies.includes(draft.currency) ||
      draft.price === null ||
      !Number.isFinite(draft.price) ||
      draft.price < 0
    ) {
      this.error.set(
        'Enter a name, a supported currency, and a non-negative price.',
      );
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const product = Object.assign(new TaonECommerceProductEntity(), {
        ...this.data.product,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        active: draft.active,
        type: draft.type,
        price: draft.price,
        currency: draft.currency,
      });
      const productResponse = this.data.product
        ? await this.productApi.taonECommerceProductController.updateById(
            this.data.product.id!,
            product,
          ).request!()
        : await this.productApi.taonECommerceProductController.save(product)
            .request!();

      if (productResponse.statusCode >= 400) {
        throw new Error(
          productResponse.responseText || 'Unable to save the product.',
        );
      }
      const savedProduct = productResponse.body?.json;
      if (!savedProduct || typeof savedProduct.id !== 'number') {
        throw new Error('The saved product response was invalid.');
      }
      this.data.product = savedProduct;

      const linksResponse =
        await this.productPermissionApi.taonECommerceProductPermissionController.getAll()
          .request!();
      if (
        linksResponse.statusCode >= 400 ||
        !Array.isArray(linksResponse.body?.json)
      ) {
        throw new Error(
          linksResponse.responseText ||
            'Unable to update the product permissions.',
        );
      }

      const existingLinks = (
        linksResponse.body.json as TaonECommerceProductPermissionEntity[]
      ).filter(link => link.productId === savedProduct.id);
      const selectedIds = new Set(this.selectedPermissionIds());
      for (const link of existingLinks) {
        if (!selectedIds.has(link.permissionId)) {
          const deleteResponse =
            await this.productPermissionApi.taonECommerceProductPermissionController.deleteById(
              link.id!,
            ).request!();
          if (deleteResponse.statusCode >= 400) {
            throw new Error(
              deleteResponse.responseText ||
                'Unable to remove a product permission.',
            );
          }
        }
      }

      const existingIds = new Set(existingLinks.map(link => link.permissionId));
      for (const permissionId of selectedIds) {
        if (!existingIds.has(permissionId)) {
          const link = Object.assign(
            new TaonECommerceProductPermissionEntity(),
            {
              productId: savedProduct.id,
              permissionId,
            },
          );
          const saveResponse =
            await this.productPermissionApi.taonECommerceProductPermissionController.save(
              link,
            ).request!();
          if (saveResponse.statusCode >= 400) {
            throw new Error(
              saveResponse.responseText ||
                'Unable to attach a permission to the product.',
            );
          }
        }
      }

      this.dialogRef.close(savedProduct);
    } catch (error) {
      console.error(
        '[taon-e-commerce-product-edit] Unable to save product',
        error,
      );
      this.error.set(
        error instanceof Error ? error.message : 'Unable to save the product.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
