//#region imports
import { TaonSessionRepository } from '@taon-dev/session/src';
import { TaonCmsContentStorageController } from '@taon-dev/cms/src';
import {
  Body,
  GET,
  Models,
  POST,
  Query,
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
import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

import { TaonECommerceCustomerRepository } from './taon-e-commerce-customer.repository';
//#endregion

//#region subscription status
export interface TaonECommerceSubscriptionStatus {
  id: number;
  productName: string;
  status: TaonECommerceEntitlementEntity['status'];
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

  private readonly cmsStorageController = this.injectController(
    TaonCmsContentStorageController,
  );

  @GET()
  getProductThumbnail(
    @Query('productId') productId: number,
  ): Taon.Response<string> {
    //#region @websqlFunc
    return async req => {
      if (!Number.isSafeInteger(productId) || productId <= 0) {
        throw new Error('The product ID is invalid.');
      }
      const product = await this.ctx.connection
        .getRepository(TaonECommerceProductEntity)
        .findOne({
          where: { id: productId, active: true },
          relations: { cmsContent: true },
        });
      const post = product?.cmsContent;
      if (post?.status !== 'published' || !post.thumbnailKey) {
        throw new Error('The product thumbnail was not found.');
      }
      const key = post.thumbnailKey;
      if (!(await this.cmsStorageController.isMediaObjectAvailable(key))) {
        throw new Error('The product thumbnail is unavailable.');
      }
      // Only the thumbnail is a sales preview; paid media stays behind CMS access checks.
      const token = await this.cmsStorageController.createStorageDownloadToken({
        key,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      return this.cmsStorageController.buildStorageDownloadUrl({
        req,
        key,
        private: true,
        token,
        download: false,
      });
    };
    //#endregion
  }

  //#region methods / before each request
  protected async beforeEachRequest({
    req,
    res,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonECommerceCustomerController>): Promise<void> {
    //#region @websqlFunc
    await this.sessionRepository.throwIfNotAuthenticated({ req, res });
    //#endregion
  }
  //#endregion

  //#region methods / get my cart
  @GET()
  getMyCart(): Taon.Response<TaonECommerceCartEntity> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.getCart(userId);
    };
    //#endregion
  }
  //#endregion

  //#region methods / get buy products
  @GET()
  getBuyProducts(): Taon.Response<TaonECommerceProductEntity[]> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.getSuggestedProducts(userId);
    };
    //#endregion
  }
  //#endregion

  //#region methods / add to my cart
  @POST()
  addToMyCart(
    @Body('productId') productId: number,
    @Body('quantity') quantity: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.addProduct(userId, productId, quantity);
    };
    //#endregion
  }
  //#endregion

  //#region methods / update my cart item
  @POST()
  updateMyCartItem(
    @Body('itemId') itemId: number,
    @Body('quantity') quantity: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.setItemQuantity(userId, itemId, quantity);
    };
    //#endregion
  }
  //#endregion

  //#region methods / remove from my cart
  @POST()
  removeFromMyCart(
    @Body('itemId') itemId: number,
  ): Taon.Response<TaonECommerceCartEntity> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.removeItem(userId, itemId);
    };
    //#endregion
  }
  //#endregion

  //#region methods / get my orders
  @GET()
  getMyOrders(): Taon.Response<TaonECommerceOrderEntity[]> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.getOrders(userId);
    };
    //#endregion
  }
  //#endregion

  //#region methods / get my transactions
  @GET()
  getMyTransactions(): Taon.Response<TaonECommercePaymentTransactionEntity[]> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.getTransactions(userId);
    };
    //#endregion
  }
  //#endregion

  //#region methods / get my subscription statuses
  @GET()
  getMySubscriptionStatuses(): Taon.Response<
    TaonECommerceSubscriptionStatus[]
  > {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
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
    //#endregion
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
      const userId = Number(req?.userId);
      const origin = this.ctx.frontendHostUri.origin;
      return this.customerRepository.createCheckoutSession(userId, {
        successUrl: `${origin}/#/app?${TaonCartCheckoutSuccessParam}=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/#/app?${TaonCartCheckoutCancelParam}=true`,
      });
    };
    //#endregion
  }
  //#endregion

  //#region methods / get my entitlements
  @GET()
  getMyEntitlements(): Taon.Response<TaonECommerceEntitlementEntity[]> {
    //#region @websqlFunc
    return async req => {
      const userId = Number(req.userId);
      return this.customerRepository.getEntitlements(userId);
    };
    //#endregion
  }
  //#endregion
}
