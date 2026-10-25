//#region models

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import type { TaonCmsContentEntity } from '@taon-dev/cms/src';
import type { TaonPermissionEntity } from '@taon-dev/session/src';
import type { TaonGroupEntity } from '@taon-dev/session/src';
import { TaonPermissionApiService } from '@taon-dev/session/src';

import { TaonECommerceProductPermissionApiService } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.api.service';
import { TaonECommerceProductPermissionEntity } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.entity';

import { TaonECommerceProductApiService } from './taon-e-commerce-product.api.service';
import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

//#region models
export interface TaonECommerceProductEditDialogData {
  product?: TaonECommerceProductEntity;
}

type ProductType = 'lifetime' | 'item' | 'subscription';
type ProductCurrency = 'PLN' | 'EUR' | 'USD';
type IntervalUnit = 'seconds' | 'minutes' | 'hours' | 'days';

interface ProductDraft {
  name: string;
  description: string;
  active: boolean;
  type: ProductType;
  price: number | null;
  currency: ProductCurrency;
  maxQuantityPerUser: number | null;
  stockLimit: number | null;
  subscriptionIntervalValue: number | null;
  subscriptionIntervalUnit: IntervalUnit;
  cmsContentId: number | null;
  inheritPermissionsFromPost: boolean;
}
//#endregion

@Component({
  selector: 'taon-e-commerce-product-edit-dialog',
  templateUrl: './taon-e-commerce-product-edit-dialog.component.html',
  styleUrls: ['./taon-e-commerce-product-edit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
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
  //#region fields & getters
  readonly data =
    inject<TaonECommerceProductEditDialogData>(MAT_DIALOG_DATA, {
      optional: true,
    }) ?? {};

  readonly dialogRef = inject(
    MatDialogRef<TaonECommerceProductEditDialogComponent>,
    { optional: true },
  );

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly productApi = inject(TaonECommerceProductApiService);

  private readonly productPermissionApi = inject(
    TaonECommerceProductPermissionApiService,
  );

  private readonly permissionApi = inject(TaonPermissionApiService);

  readonly productTypes: ProductType[] = ['lifetime', 'item', 'subscription'];

  readonly intervalUnits: IntervalUnit[] = [
    'seconds',
    'minutes',
    'hours',
    'days',
  ];

  readonly currencies: ProductCurrency[] = ['PLN', 'EUR', 'USD'];

  private readonly initialCurrency =
    this.currencies.find(
      currency => currency === this.data.product?.currency,
    ) ?? 'USD';

  readonly draft = signal<ProductDraft>({
    name: this.data.product?.name ?? '',
    description: this.data.product?.description ?? '',
    active: this.data.product?.active ?? true,
    type: this.normalizeProductType(this.data.product?.type),
    price: this.data.product?.price ?? 0,
    currency: this.initialCurrency,
    maxQuantityPerUser: this.data.product?.maxQuantityPerUser ?? null,
    stockLimit: this.data.product?.stockLimit ?? null,
    subscriptionIntervalValue:
      this.data.product?.subscriptionIntervalValue ?? null,
    subscriptionIntervalUnit:
      this.data.product?.subscriptionIntervalUnit ?? 'days',
    cmsContentId: this.data.product?.cmsContentId ?? null,
    inheritPermissionsFromPost:
      this.data.product?.inheritPermissionsFromPost ?? false,
  });

  readonly permissions = signal<TaonPermissionEntity[]>([]);

  readonly groups = signal<TaonGroupEntity[]>([]);

  readonly posts = signal<TaonCmsContentEntity[]>([]);

  readonly selectedGroupIds = signal<number[]>([]);

  readonly selectedPermissionIds = signal<number[]>([]);

  readonly loading = signal(true);

  readonly permissionsLoaded = signal(false);

  readonly saving = signal(false);

  readonly error = signal('');
  //#endregion

  //#region constructor
  constructor() {
    void this.load();
  }
  //#endregion

  //#region methods / load
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.permissionsLoaded.set(false);

    try {
      const productId = Number(this.route.snapshot.paramMap.get('id'));
      if (
        this.route.snapshot.paramMap.has('id') &&
        (!Number.isSafeInteger(productId) || productId <= 0)
      ) {
        throw new Error('The product ID in the route is invalid.');
      }
      if (
        !this.data.product &&
        Number.isSafeInteger(productId) &&
        productId > 0
      ) {
        const productResponse =
          await this.productApi.taonECommerceProductController.getProductForEditing(
            productId,
          ).request!();
        if (productResponse.statusCode >= 400 || !productResponse.body?.json) {
          throw new Error(
            productResponse.responseText || 'Unable to load the product.',
          );
        }
        this.data.product = productResponse.body.json;
        this.draft.set(this.draftFromProduct(this.data.product));
      }

      const [
        permissionsResponse,
        linksResponse,
        groupsResponse,
        postsResponse,
      ] = await Promise.all([
        this.permissionApi.taonPermissionController.getAll().request!(),
        this.productPermissionApi.taonECommerceProductPermissionController.getAll()
          .request!(),
        this.productApi.groupController.getAll().request!(),
        this.productApi.cmsContentController.getAll().request!(),
      ]);

      if (
        permissionsResponse.statusCode >= 400 ||
        linksResponse.statusCode >= 400 ||
        groupsResponse.statusCode >= 400 ||
        postsResponse.statusCode >= 400
      ) {
        throw new Error(
          permissionsResponse.responseText ||
            linksResponse.responseText ||
            groupsResponse.responseText ||
            postsResponse.responseText ||
            'Unable to load product editor options.',
        );
      }

      const permissionRows = permissionsResponse.body?.json;
      const productPermissionRows = linksResponse.body?.json;
      const groupRows = groupsResponse.body?.json;
      const postRows = postsResponse.body?.json;
      if (
        !Array.isArray(permissionRows) ||
        !Array.isArray(productPermissionRows) ||
        !Array.isArray(groupRows) ||
        !Array.isArray(postRows)
      ) {
        throw new Error('The product editor options response was invalid.');
      }

      this.permissions.set(permissionRows);
      this.groups.set(groupRows);
      this.posts.set(postRows);
      this.permissionsLoaded.set(true);
      const currentProductId = this.data.product?.id;
      this.selectedPermissionIds.set(
        typeof currentProductId === 'number'
          ? (productPermissionRows as TaonECommerceProductPermissionEntity[])
              .filter(link => link.productId === currentProductId)
              .map(link => link.permissionId)
          : [],
      );
      this.selectedGroupIds.set(
        this.data.product?.suggestedGroups?.map(group => group.id) ?? [],
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
  //#endregion

  //#region methods / update type
  updateType(type: ProductType): void {
    this.draft.update(draft => ({ ...draft, type }));
  }
  //#endregion

  //#region methods / update price
  updatePrice(price: number | null): void {
    this.draft.update(draft => ({ ...draft, price }));
  }
  //#endregion

  //#region methods / update name
  updateName(name: string): void {
    this.draft.update(draft => ({ ...draft, name }));
  }
  //#endregion

  //#region methods / update description
  updateDescription(description: string): void {
    this.draft.update(draft => ({ ...draft, description }));
  }
  //#endregion

  //#region methods / update active
  updateActive(active: boolean): void {
    this.draft.update(draft => ({ ...draft, active }));
  }
  //#endregion

  //#region methods / update currency
  updateCurrency(currency: ProductCurrency): void {
    this.draft.update(draft => ({ ...draft, currency }));
  }
  //#endregion

  //#region methods / update max quantity per user
  updateMaxQuantityPerUser(value: number | null): void {
    this.draft.update(draft => ({ ...draft, maxQuantityPerUser: value }));
  }
  //#endregion

  //#region methods / update stock limit
  updateStockLimit(value: number | null): void {
    this.draft.update(draft => ({ ...draft, stockLimit: value }));
  }
  //#endregion

  //#region methods / update subscription interval value
  updateSubscriptionIntervalValue(value: number | null): void {
    this.draft.update(draft => ({
      ...draft,
      subscriptionIntervalValue: value,
    }));
  }
  //#endregion

  //#region methods / update subscription interval unit
  updateSubscriptionIntervalUnit(value: IntervalUnit): void {
    this.draft.update(draft => ({ ...draft, subscriptionIntervalUnit: value }));
  }
  //#endregion

  //#region methods / update cms content id
  updateCmsContentId(value: number | null): void {
    this.draft.update(draft => ({ ...draft, cmsContentId: value }));
  }
  //#endregion

  //#region methods / update permission inheritance
  updatePermissionInheritance(value: boolean): void {
    this.draft.update(draft => ({
      ...draft,
      inheritPermissionsFromPost: value,
    }));
    if (value) {
      this.selectedPermissionIds.set([]);
    }
  }
  //#endregion

  //#region methods / cancel
  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      void this.router.navigate(['..'], { relativeTo: this.route });
    }
  }
  //#endregion

  //#region methods / save
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
      draft.price < 0 ||
      (draft.maxQuantityPerUser !== null &&
        (!Number.isSafeInteger(draft.maxQuantityPerUser) ||
          draft.maxQuantityPerUser < 1)) ||
      (draft.stockLimit !== null &&
        (!Number.isSafeInteger(draft.stockLimit) || draft.stockLimit < 1)) ||
      (draft.type === 'subscription' &&
        (!draft.subscriptionIntervalValue ||
          !Number.isSafeInteger(draft.subscriptionIntervalValue) ||
          draft.subscriptionIntervalValue < 1))
    ) {
      this.error.set(
        'Enter a valid name, currency, price, quantity limit, stock limit, and subscription interval.',
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
        maxQuantityPerUser:
          draft.type === 'item' ? draft.maxQuantityPerUser : null,
        stockLimit: draft.type === 'item' ? draft.stockLimit : null,
        subscriptionIntervalValue:
          draft.type === 'subscription'
            ? draft.subscriptionIntervalValue
            : null,
        subscriptionIntervalUnit:
          draft.type === 'subscription' ? draft.subscriptionIntervalUnit : null,
        cmsContentId: draft.cmsContentId,
        cmsContent:
          this.posts().find(post => post.id === draft.cmsContentId) ?? null,
        inheritPermissionsFromPost: draft.inheritPermissionsFromPost,
        suggestedGroups: this.groups().filter(group =>
          this.selectedGroupIds().includes(group.id),
        ),
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
      const selectedIds = new Set(
        draft.inheritPermissionsFromPost ? [] : this.selectedPermissionIds(),
      );
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

      if (this.dialogRef) {
        this.dialogRef.close(savedProduct);
      } else {
        await this.router.navigate(['..'], { relativeTo: this.route });
      }
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
  //#endregion

  //#region methods / normalize product type
  private normalizeProductType(
    type: TaonECommerceProductEntity['type'] | undefined,
  ): ProductType {
    return type === 'lifetime' || type === 'subscription' ? type : 'item';
  }
  //#endregion

  //#region methods / draft from product
  private draftFromProduct(product: TaonECommerceProductEntity): ProductDraft {
    return {
      name: product.name,
      description: product.description ?? '',
      active: product.active,
      type: this.normalizeProductType(product.type),
      price: product.price,
      currency:
        this.currencies.find(currency => currency === product.currency) ??
        'USD',
      maxQuantityPerUser: product.maxQuantityPerUser ?? null,
      stockLimit: product.stockLimit ?? null,
      subscriptionIntervalValue: product.subscriptionIntervalValue ?? null,
      subscriptionIntervalUnit: product.subscriptionIntervalUnit ?? 'days',
      cmsContentId: product.cmsContentId ?? null,
      inheritPermissionsFromPost: product.inheritPermissionsFromPost ?? false,
    };
  }
  //#endregion
}
