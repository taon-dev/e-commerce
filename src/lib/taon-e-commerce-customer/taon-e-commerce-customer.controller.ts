//#region imports
import { TaonSessionRepository } from '@taon-dev/session/src';
import {
  Body,
  GET,
  Models,
  POST,
  Taon,
  TaonBaseController,
  TaonController,
} from 'taon/src';

import {
  TaonCartCheckoutCancelParam,
  TaonCartCheckoutSuccessParam,
} from '../taon-cart/taon-cart.models';
import type { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import type { TaonECommerceEntitlementEntity } from '../taon-e-commerce-entitlement/taon-e-commerce-entitlement.entity';
import type { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import type { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';
import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

import { TaonECommerceCustomerRepository } from './taon-e-commerce-customer.repository';
//#endregion

//#region subscription status
export interface TaonECommerceSubscriptionStatus {
  id: number;
  productName: string;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  validUntil: Date | null;
  startedAt: Date;
}
//#endregion

@TaonController<TaonECommerceCustomerController>({
  className: 'TaonECommerceCustomerController',
})
export class TaonECommerceCustomerController extends TaonBaseController<
  {},
  TaonECommerceCustomerController
> {
  private readonly sessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  private readonly customerRepository = this.injectCustomRepo(
    TaonECommerceCustomerRepository,
  );

  //#region methods / before each request
  protected async beforeEachRequest({
    req,
    res,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonECommerceCustomerController>): Promise<void> {
    await this.sessionRepository.throwIfNotAuthenticated({ req, res });
  }
  //#endregion

  //#region methods / get my cart
  @GET()
  getMyCart(): Taon.Response<TaonECommerceCartEntity> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getCart(userId);
    };
  }
  //#endregion

  //#region methods / get buy products
  @GET()
  getBuyProducts(): Taon.Response<TaonECommerceProductEntity[]> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getSuggestedProducts(userId);
    };
  }
  //#endregion

  //#region methods / add to my cart
  @POST()
  addToMyCart(
    @Body('productId') productId: number,
    @Body('quantity') quantity: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.addProduct(userId, productId, quantity);
    };
  }
  //#endregion

  //#region methods / update my cart item
  @POST()
  updateMyCartItem(
    @Body('itemId') itemId: number,
    @Body('quantity') quantity: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.setItemQuantity(userId, itemId, quantity);
    };
  }
  //#endregion

  //#region methods / remove from my cart
  @POST()
  removeFromMyCart(
    @Body('itemId') itemId: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.removeItem(userId, itemId);
    };
  }
  //#endregion

  //#region methods / get my orders
  @GET()
  getMyOrders(): Taon.Response<TaonECommerceOrderEntity[]> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getOrders(userId);
    };
  }
  //#endregion

  //#region methods / get my transactions
  @GET()
  getMyTransactions(): Taon.Response<TaonECommercePaymentTransactionEntity[]> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getTransactions(userId);
    };
  }
  //#endregion

  //#region methods / get my subscription statuses
  @GET()
  getMySubscriptionStatuses(): Taon.Response<
    TaonECommerceSubscriptionStatus[]
  > {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      const entitlements =
        await this.customerRepository.getEntitlements(userId);
      return entitlements.map(
        (entitlement: TaonECommerceEntitlementEntity) => ({
          id: entitlement.id,
          productName: entitlement.product.name,
          status: entitlement.status,
          validUntil: entitlement.currentPeriodEnd,
          startedAt: entitlement.startedAt,
        }),
      );
    };
  }
  //#endregion

  //#region methods / create my checkout session
  @POST()
  createMyCheckoutSession(): Taon.Response<{
    orderId: number;
    checkoutUrl: string;
  }> {
    //#region @websqlFunc
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      const origin = this.ctx.frontendHostUri.origin;
      return this.customerRepository.createCheckoutSession(userId, {
        successUrl: `${origin}?${TaonCartCheckoutSuccessParam}=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}?${TaonCartCheckoutCancelParam}=cancel`,
      });
    };
    //#endregion
  }
  //#endregion

  //#region methods / get my entitlements
  @GET()
  getMyEntitlements(): Taon.Response<TaonECommerceEntitlementEntity[]> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getEntitlements(userId);
    };
  }
  //#endregion
}
