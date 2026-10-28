//#region imports
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { TaonPurchaseStatusDialogComponent } from '@taon-dev/ui/src';
import { Subscription } from 'rxjs';

import type { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import { TaonECommerceCustomerApiService } from '../taon-e-commerce-customer/taon-e-commerce-customer.api.service';
import type { TaonECommerceEntitlementEntity } from '../taon-e-commerce-entitlement/taon-e-commerce-entitlement.entity';
import { entitlementHasAccess } from '../taon-e-commerce-entitlement/taon-e-commerce-entitlement.utils';
import type { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { isQuantityProduct } from '../taon-e-commerce-product/taon-e-commerce-product-eligibility';
import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

import {
  TaonCartProductDialogComponent,
  TaonCartProductDialogData,
} from './taon-cart-product-dialog/taon-cart-product-dialog.component';
import { TaonCartProductThumbnailComponent } from './taon-cart-product-thumbnail/taon-cart-product-thumbnail.component';
import {
  TaonCartCheckoutCancelParam,
  TaonCartCheckoutSuccessParam,
  type TaonCartConfig,
} from './taon-cart.models';
//#endregion

@Component({
  selector: 'taon-cart',
  templateUrl: './taon-cart.component.html',
  styleUrls: ['./taon-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TaonDatatableComponent,
    TaonCartProductThumbnailComponent,
  ],
  providers: [TaonECommerceCustomerApiService],
})
export class TaonCartComponent implements OnInit, OnDestroy {
  //#region fields & getters
  @Input() config: TaonCartConfig = {};

  private readonly api = inject(TaonECommerceCustomerApiService);

  private readonly dialogRef = inject(MatDialogRef, { optional: true });

  readonly cart = signal<TaonECommerceCartEntity | null>(null);

  readonly orders = signal<TaonECommerceOrderEntity[]>([]);

  readonly entitlements = signal<TaonECommerceEntitlementEntity[]>([]);

  readonly products = signal<TaonECommerceProductEntity[]>([]);

  readonly productsLoaded = signal(false);

  readonly mainTabIndex = signal(0);

  readonly purchasedTabIndex = signal(0);

  readonly loadingCart = signal(false);

  readonly loadingOrders = signal(false);

  readonly loadingEntitlements = signal(false);

  readonly creatingCheckout = signal(false);

  readonly changingCart = signal(false);

  readonly isQuantityProduct = isQuantityProduct;

  readonly dialog = inject(MatDialog);

  readonly error = signal('');

  readonly sub = new Subscription();

  readonly router = inject(Router);

  readonly activatedRoute = inject(ActivatedRoute);

  readonly orderColumns: MtxGridColumn[] = [
    { header: 'Order ID', field: 'id', sortable: true },
    { header: 'Status', field: 'status', sortable: true },
    { header: 'Total', field: 'total', sortable: true },
    { header: 'Currency', field: 'currency', sortable: true },
    { header: 'Created', field: 'createdAt', sortable: true },
  ];

  get suggestedProducts(): TaonECommerceProductEntity[] {
    return this.products();
  }

  get hasSuggestedProducts(): boolean {
    return this.suggestedProducts.length > 0;
  }

  get validCartItems() {
    return (this.cart()?.items ?? []).filter(
      item => item.product?.active === true,
    );
  }

  get cartSubtotal(): number {
    return this.validCartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }

  get activeSubscriptionEntitlements(): TaonECommerceEntitlementEntity[] {
    return this.entitlements().filter(
      entitlement =>
        entitlement.product.type === 'subscription' &&
        entitlementHasAccess(entitlement),
    );
  }

  get purchasedProductHistory(): TaonECommerceEntitlementEntity[] {
    return this.entitlements().filter(
      entitlement => entitlement.product.type !== 'subscription',
    );
  }
  //#endregion

  constructor() {
    void this.loadCart();
    void this.loadProducts();
  }

  ngOnInit(): void {
    this.sub.add(
      this.activatedRoute.queryParamMap.subscribe(params => {
        const success = params.get(TaonCartCheckoutSuccessParam);
        const cancel = params.get(TaonCartCheckoutCancelParam);
        if (success === 'true') {
          this.dialog.open(TaonPurchaseStatusDialogComponent, {
            data: {
              success: true,
              message: 'Checkout completed. Your purchase will appear after Stripe confirms payment.',
            },
          });
          this.cleanQueryParams();
        }

        if (cancel === 'true') {
          this.dialog.open(TaonPurchaseStatusDialogComponent, {
            data: {
              success: false,
              message: 'You left checkout. Your order will be updated when Stripe confirms its status.',
            },
          });

          this.cleanQueryParams();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  eligibility(product: TaonECommerceProductEntity) {
    return this.products().find(candidate => candidate.id === product.id)?.purchaseEligibility;
  }

  openProduct(product: TaonECommerceProductEntity): void {
    if (!product.cmsContent) {
      return;
    }
    this.dialog.open<TaonCartProductDialogComponent, TaonCartProductDialogData>(
      TaonCartProductDialogComponent,
      {
        width: '640px',
        maxWidth: '95vw',
        data: {
          product,
          eligibility: () => this.eligibility(product),
          inCart: () => this.validCartItems.some(item => item.productId === product.id),
          addToCart: () => this.addProduct(product),
          goToCart: () => this.onMainTabChange(1),
        },
      },
    );
  }

  //#region methods / close
  close(): void {
    this.dialogRef?.close();
  }
  //#endregion

  //#region methods / on main tab change
  onMainTabChange(index: number): void {
    this.mainTabIndex.set(index);
    if (index === 0) {
      void this.loadProducts();
    }
    if (index === 3) {
      void this.loadEntitlements();
    }
  }
  //#endregion

  cleanQueryParams(): void {
    void this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
  }

  //#region methods / on settings tab change
  onSettingsTabChange(index: number): void {
    this.purchasedTabIndex.set(index);
    if (index === 0) {
      void this.loadEntitlements();
    } else if (index === 1) {
      void this.loadOrders();
    }
  }
  //#endregion

  //#region methods / load cart
  async loadCart(): Promise<void> {
    this.loadingCart.set(true);
    this.error.set('');
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.getMyCart().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your cart.', error);
    } finally {
      this.loadingCart.set(false);
    }
  }
  //#endregion

  //#region methods / load products
  async loadProducts(): Promise<void> {
    try {
      const products = await this.request<TaonECommerceProductEntity[]>(
        this.api.controller.getBuyProducts().request!(),
      );
      this.products.set(products.filter(product => product.active === true));
      this.productsLoaded.set(true);
    } catch (error) {
      this.reportError('Unable to load available products.', error);
      this.products.set([]);
      this.productsLoaded.set(true);
    }
  }
  //#endregion

  //#region methods / add product
  async addProduct(product: TaonECommerceProductEntity): Promise<boolean> {
    if (this.changingCart()) {
      return false;
    }
    if (!this.eligibility(product)?.canAdd) {
      this.error.set(this.eligibility(product)?.reason ?? 'This product is not available.');
      return false;
    }
    if (typeof product.id !== 'number') {
      this.error.set(
        'This suggested product does not have a saved product ID.',
      );
      return false;
    }
    this.changingCart.set(true);
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.addToMyCart(product.id, 1).request!(),
        ),
      );
      await this.loadProducts();
      return true;
    } catch (error) {
      this.reportError('Unable to add this product to your cart.', error);
      return false;
    } finally {
      this.changingCart.set(false);
    }
  }
  //#endregion

  //#region methods / update quantity
  async updateQuantity(itemId: number, quantity: number): Promise<void> {
    if (this.changingCart()) {
      return;
    }
    if (quantity < 1) {
      await this.removeItem(itemId);
      return;
    }
    this.changingCart.set(true);
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.updateMyCartItem(itemId, quantity).request!(),
        ),
      );
      await this.loadProducts();
    } catch (error) {
      this.reportError('Unable to update the cart item.', error);
    } finally {
      this.changingCart.set(false);
    }
  }
  //#endregion

  //#region methods / remove item
  async removeItem(itemId: number): Promise<void> {
    if (this.changingCart()) {
      return;
    }
    this.changingCart.set(true);
    try {
      this.cart.set(
        await this.request<TaonECommerceCartEntity>(
          this.api.controller.removeFromMyCart(itemId).request!(),
        ),
      );
      await this.loadProducts();
    } catch (error) {
      this.reportError('Unable to remove the cart item.', error);
    } finally {
      this.changingCart.set(false);
    }
  }
  //#endregion

  //#region methods / load orders
  async loadOrders(): Promise<void> {
    this.loadingOrders.set(true);
    this.error.set('');
    try {
      this.orders.set(
        await this.request<TaonECommerceOrderEntity[]>(
          this.api.controller.getMyOrders().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your orders.', error);
    } finally {
      this.loadingOrders.set(false);
    }
  }
  //#endregion

  //#region methods / load entitlements
  async loadEntitlements(): Promise<void> {
    this.loadingEntitlements.set(true);
    this.error.set('');
    try {
      this.entitlements.set(
        await this.request<TaonECommerceEntitlementEntity[]>(
          this.api.controller.getMyEntitlements().request!(),
        ),
      );
    } catch (error) {
      this.reportError('Unable to load your purchases.', error);
    } finally {
      this.loadingEntitlements.set(false);
    }
  }
  //#endregion

  //#region methods / go to checkout
  goToCheckout(): void {
    if (!this.validCartItems.length) {
      return;
    }
    this.mainTabIndex.set(2);
  }
  //#endregion

  //#region methods / checkout
  async checkout(): Promise<void> {
    if (this.creatingCheckout() || !this.validCartItems.length) {
      return;
    }
    this.creatingCheckout.set(true);
    this.error.set('');
    try {
      const session = await this.request<{ checkoutUrl: string }>(
        this.api.controller.createMyCheckoutSession().request!(),
      );
      window.location.assign(session.checkoutUrl);
    } catch (error) {
      this.reportError('Unable to start Stripe Checkout.', error);
    } finally {
      this.creatingCheckout.set(false);
    }
  }
  //#endregion

  //#region methods / request
  private async request<T>(
    endpoint: Promise<{
      statusCode: number;
      responseText: string;
      body?: { json?: T };
    }>,
  ): Promise<T> {
    const response = await endpoint;
    if (response.statusCode >= 400) {
      throw new Error(response.responseText || 'The request failed.');
    }
    const result = response.body?.json;
    if (result === undefined || result === null) {
      throw new Error('The server returned an empty response.');
    }
    return result;
  }
  //#endregion

  //#region methods / report error
  private reportError(message: string, error: unknown): void {
    console.error('[taon-cart]', message, error);
    this.error.set(error instanceof Error ? error.message : message);
  }
  //#endregion
}
