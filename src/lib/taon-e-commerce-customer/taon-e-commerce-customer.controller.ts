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

import { TaonECommerceCustomerRepository } from './taon-e-commerce-customer.repository';
import type { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import type { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import type { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';

export interface TaonECommerceSubscriptionStatus {
  id: string;
  productName: string;
  status: 'active' | 'cancelled';
  validUntil: string | null;
}

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

  private readonly unsubscribedUsers = new Set<number>();

  protected async beforeEachRequest({
    req,
    res,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonECommerceCustomerController>): Promise<void> {
    await this.sessionRepository.throwIfNotAuthenticated({ req, res });
  }

  @GET()
  getMyCart(): Taon.Response<TaonECommerceCartEntity> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getCart(userId);
    };
  }

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

  @POST()
  removeFromMyCart(
    @Body('itemId') itemId: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.removeItem(userId, itemId);
    };
  }

  @GET()
  getMyOrders(): Taon.Response<TaonECommerceOrderEntity[]> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getOrders(userId);
    };
  }

  @GET()
  getMyTransactions(): Taon.Response<TaonECommercePaymentTransactionEntity[]> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return this.customerRepository.getTransactions(userId);
    };
  }

  @GET()
  getMySubscriptionStatuses(): Taon.Response<
    TaonECommerceSubscriptionStatus[]
  > {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      return [
        {
          id: `example-subscription-${userId}`,
          productName: 'Example subscription',
          status: this.unsubscribedUsers.has(userId) ? 'cancelled' : 'active',
          validUntil: null,
        },
      ];
    };
  }

  @POST()
  unsubscribeFromExampleSubscription(): Taon.Response<void> {
    return async req => {
      const userId = Number('userId' in req ? req.userId : undefined);
      this.unsubscribedUsers.add(userId);
    };
  }
}
