//#region imports
import { TaonSessionRepository } from '@taon-dev/session/src';
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  Body,
  GET,
  POST,
  PUT,
  Models,
  getStatusCode,
  HttpStatusEnum,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import {
  TaonAuthContextRepository,
  TaonSessionCoreGroups,
  TaonSessionCoreRoles,
} from '../decorators/taon-cms-authorization';
import { TaonECommerceCustomerRepository } from '../taon-e-commerce-customer/taon-e-commerce-customer.repository';
import {
  TaonStripeSyncResult,
  TaonStripeWebhookEvent,
} from '../taon-stripe/taon-stripe.models';
import { TaonECommerceStripeRepository } from '../taon-stripe/taon-stripe.repository';

import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { TaonECommerceProductRepository } from './taon-e-commerce-product.repository';
//#endregion

@TaonController<TaonECommerceProductController>({
  className: 'TaonECommerceProductController',
  allowedMethods: [
    'getAll',
    'paginationQuery',
    'save',
    'updateById',
    'getStripeConfiguration',
    'syncWithStripe',
    'stripeWebhook',
    'getProductForEditing',
  ],
})
export class TaonECommerceProductController extends TaonBaseCrudController<
  TaonECommerceProductEntity,
  {
    /* file upload query params type */
  },
  TaonECommerceProductController
> {
  //#region fields & getters
  entityClassResolveFn: () => typeof TaonECommerceProductEntity = () =>
    TaonECommerceProductEntity;

  private readonly taonECommerceProductRepository = this.injectCustomRepo(
    TaonECommerceProductRepository,
  );

  private readonly taonECommerceStripeRepository = this.injectCustomRepo(
    TaonECommerceStripeRepository,
  );

  private readonly customerRepository = this.injectCustomRepo(
    TaonECommerceCustomerRepository,
  );

  private readonly sessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  private readonly authContextRepository = this.injectCustomRepo(
    TaonAuthContextRepository,
  );
  //#endregion

  //#region methods / save
  @POST()
  override save(
    @Body() product: TaonECommerceProductEntity,
  ): Taon.Response<TaonECommerceProductEntity> {
    //#region @websqlFunc
    return async () => {
      product.stripeProductId = null;
      product.stripePriceId = null;
      product.stripeLastSyncedAt = null;
      product.stripeSyncedPrice = null;
      product.stripeSyncedCurrency = null;
      product.stripeSyncedType = null;
      product.stripeSyncedName = null;
      product.stripeSyncedDescription = null;
      product.stripeSyncedActive = null;
      product.stripeSyncedIntervalValue = null;
      product.stripeSyncedIntervalUnit = null;
      return this.taonECommerceProductRepository.save(product);
    };
    //#endregion
  }
  //#endregion

  //#region methods / update by id
  @PUT()
  override updateById(
    @Query('id') id: number | string,
    @Body() product: TaonECommerceProductEntity,
  ): Taon.Response<TaonECommerceProductEntity> {
    //#region @websqlFunc
    return async () => {
      const existing = await this.taonECommerceProductRepository.findOne({
        where: { id: Number(id) },
      });
      if (!existing) {
        throw new Error('The product was not found.');
      }
      product.stripeProductId = existing.stripeProductId;
      product.stripePriceId = existing.stripePriceId;
      product.stripeLastSyncedAt = existing.stripeLastSyncedAt;
      product.stripeSyncedPrice = existing.stripeSyncedPrice;
      product.stripeSyncedCurrency = existing.stripeSyncedCurrency;
      product.stripeSyncedType = existing.stripeSyncedType;
      product.stripeSyncedName = existing.stripeSyncedName;
      product.stripeSyncedDescription = existing.stripeSyncedDescription;
      product.stripeSyncedActive = existing.stripeSyncedActive;
      product.stripeSyncedIntervalValue = existing.stripeSyncedIntervalValue;
      product.stripeSyncedIntervalUnit = existing.stripeSyncedIntervalUnit;
      return this.db.updateById<TaonECommerceProductEntity>(id, product);
    };
    //#endregion
  }
  //#endregion

  //#region methods / get product for editing
  @GET()
  getProductForEditing(
    @Query('productId') productId: number,
  ): Taon.Response<TaonECommerceProductEntity> {
    //#region @websqlFunc
    return async () => {
      const product = await this.taonECommerceProductRepository.findOne({
        where: { id: Number(productId) },
        relations: { cmsContent: true, suggestedGroups: true },
      });
      if (!product) {
        throw new Error('The product was not found.');
      }
      return product;
    };
    //#endregion
  }
  //#endregion

  //#region methods / before each request
  protected async beforeEachRequest({
    req,
    res,
    methodConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonECommerceProductController>): Promise<void> {
    //#region @websqlFunc
    if (methodConfig.methodName === 'stripeWebhook') {
      return;
    }
    await this.sessionRepository.throwIfNotAuthenticated({ req, res });
    const context = await this.authContextRepository.getContext(
      req.userId,
      req.sessionId,
    );
    if (
      !context?.isSuperUser &&
      !context?.isInGroup(TaonSessionCoreGroups.Administrator)
    ) {
      Taon.error({
        message: 'Administrator access is required for product management.',
        status: getStatusCode(HttpStatusEnum.FORBIDDEN),
      });
    }
    //#endregion
  }
  //#endregion

  //#region methods / get stripe configuration
  @GET()
  getStripeConfiguration(): Taon.Response<{
    connected: boolean;
    message: string;
    webhookUrl: string;
  }> {
    //#region @websqlFunc
    return async () => ({
      ...(await this.taonECommerceStripeRepository.checkConnection()),
      webhookUrl: this.getThisControllerMethodFullUrl('stripeWebhook'),
    });
    //#endregion
  }
  //#endregion

  //#region methods / sync with stripe
  @POST()
  syncWithStripe(
    @Body('syncId') syncId: string,
  ): Taon.Response<TaonStripeSyncResult[]> {
    //#region @websqlFunc
    return async () => {
      if (!/^[\da-f-]{36}$/i.test(syncId)) {
        throw new Error('A valid synchronization request ID is required.');
      }
      if (
        !(await this.taonECommerceStripeRepository.checkConnection()).connected
      ) {
        throw new Error(
          'Stripe is not connected. Check the server configuration.',
        );
      }
      const products = await this.taonECommerceProductRepository.find();
      const results: TaonStripeSyncResult[] = [];
      for (const product of products) {
        try {
          const stripeProduct =
            await this.taonECommerceStripeRepository.synchronizeProduct(
              product,
              syncId,
            );
          product.stripeProductId = stripeProduct.stripeProductId;
          product.stripePriceId = stripeProduct.stripePriceId;
          product.stripeLastSyncedAt = new Date();
          product.stripeSyncedPrice = product.price;
          product.stripeSyncedCurrency = product.currency.toUpperCase();
          product.stripeSyncedType = product.type;
          product.stripeSyncedName = product.name;
          product.stripeSyncedDescription = product.description;
          product.stripeSyncedActive = product.active;
          product.stripeSyncedIntervalValue =
            product.type === 'subscription'
              ? product.subscriptionIntervalValue
              : null;
          product.stripeSyncedIntervalUnit =
            product.type === 'subscription'
              ? product.subscriptionIntervalUnit
              : null;
          await this.taonECommerceProductRepository.save(product);
          results.push({
            productId: product.id,
            productName: product.name,
            success: true,
            ...stripeProduct,
          });
        } catch (error) {
          results.push({
            productId: product.id,
            productName: product.name,
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Stripe synchronization failed.',
          });
        }
      }
      return results;
    };
    //#endregion
  }
  //#endregion

  //#region methods / stripe webhook
  @POST()
  stripeWebhook(): Taon.Response<{ received: boolean }> {
    //#region @websqlFunc
    return async (req, res) => {
      try {
        const event =
          await this.taonECommerceStripeRepository.verifyWebhookSignature(
            req.rawBody,
            // @ts-ignore
            req.headers['stripe-signature'],
          );
        if (
          !event ||
          typeof event !== 'object' ||
          !('type' in event) ||
          typeof event.type !== 'string' ||
          !('data' in event) ||
          !event.data ||
          typeof event.data !== 'object' ||
          !('object' in event.data) ||
          !event.data.object ||
          typeof event.data.object !== 'object'
        ) {
          throw new Error('The Stripe webhook payload is invalid.');
        }
        await this.customerRepository.processStripeEvent(
          event as TaonStripeWebhookEvent,
        );
        return { received: true };
      } catch (error) {
        console.error(error);
        Taon.error({
          status: 400,
          message: '[taon-e-commerce] Stripe webhook rejected',
        });
        return { // TODO not needed
          received: false,
        };
      }
    };
    //#endregion
  }
  //#endregion
}
