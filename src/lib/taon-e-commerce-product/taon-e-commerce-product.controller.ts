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
  TaonUpdateOptions,
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
  isHandledStripeEvent,
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
    'duplicate',
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

  private readonly taonECommerceCustomerRepository = this.injectCustomRepo(
    TaonECommerceCustomerRepository,
  );

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  private readonly taonAuthContextRepository = this.injectCustomRepo(
    TaonAuthContextRepository,
  );
  //#endregion

  //#region methods / save
  @POST()
  override save(
    @Body('item') item: TaonECommerceProductEntity,
  ): Taon.Response<TaonECommerceProductEntity> {
    //#region @websqlFunc
    super.save;
    return async () => {
      item.stripeProductId = null;
      item.stripePriceId = null;
      item.stripeLastSyncedAt = null;
      item.stripeSyncedPrice = null;
      item.stripeSyncedCurrency = null;
      item.stripeSyncedType = null;
      item.stripeSyncedName = null;
      item.stripeSyncedDescription = null;
      item.stripeSyncedActive = null;
      item.stripeSyncedIntervalValue = null;
      item.stripeSyncedIntervalUnit = null;
      return this.taonECommerceProductRepository.save(item);
    };
    //#endregion
  }
  //#endregion

  //#region methods / update by id
  @PUT()
  updateById(
    @Query('id') id: number | string,
    @Body('item') item: TaonECommerceProductEntity,
    @Body('options') options?: TaonUpdateOptions<TaonECommerceProductEntity>,
  ): Models.Http.Response<TaonECommerceProductEntity> {
    //#region @websqlFunc
    return async (req, res, { t }) => {
      const existing = await this.taonECommerceProductRepository.findOne({
        where: { id: Number(id) },
      });
      if (!existing) {
        throw new Error(t.gettext('The product was not found.'));
      }
      item.stripeProductId = existing.stripeProductId;
      item.stripePriceId = existing.stripePriceId;
      item.stripeLastSyncedAt = existing.stripeLastSyncedAt;
      item.stripeSyncedPrice = existing.stripeSyncedPrice;
      item.stripeSyncedCurrency = existing.stripeSyncedCurrency;
      item.stripeSyncedType = existing.stripeSyncedType;
      item.stripeSyncedName = existing.stripeSyncedName;
      item.stripeSyncedDescription = existing.stripeSyncedDescription;
      item.stripeSyncedActive = existing.stripeSyncedActive;
      item.stripeSyncedIntervalValue = existing.stripeSyncedIntervalValue;
      item.stripeSyncedIntervalUnit = existing.stripeSyncedIntervalUnit;
      return this.db.updateById(id, item);
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
    return async (req, res, { t }) => {
      const product = await this.taonECommerceProductRepository.findOne({
        where: { id: Number(productId) },
        relations: { cmsContent: true, suggestedGroups: true },
      });
      if (!product) {
        throw new Error(t.gettext('The product was not found.'));
      }
      return product;
    };
    //#endregion
  }
  //#endregion

  @POST()
  duplicate(
    @Body('productId') productId: number,
  ): Taon.Response<TaonECommerceProductEntity> {
    //#region @websqlFunc
    return async (req, res, { t }) => {
      if (!Number.isSafeInteger(productId) || productId <= 0) {
        throw new Error(t.gettext('The product ID is invalid.'));
      }
      return this.taonECommerceProductRepository.duplicate(productId, t);
    };
    //#endregion
  }

  //#region methods / before each request
  protected async beforeEachRequest({
    req,
    res,
    methodConfig,
    t,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonECommerceProductController>): Promise<void> {
    //#region @websqlFunc
    if (methodConfig.methodName === 'stripeWebhook') {
      return;
    }
    await this.taonSessionRepository.throwIfNotAuthenticated({ req, res });
    const context = await this.taonAuthContextRepository.getContext(
      req.userId,
      req.sessionId,
    );
    if (
      !context?.isSuperUser &&
      !context?.isInGroup(TaonSessionCoreGroups.Administrator)
    ) {
      Taon.error({
        message: t.gettext('Administrator access is required for product management.'),
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
    return async (req, res) => ({
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
    return async (req, res, { t }) => {
      if (!/^[\da-f-]{36}$/i.test(syncId)) {
        throw new Error(t.gettext('A valid synchronization request ID is required.'));
      }
      if (
        !(await this.taonECommerceStripeRepository.checkConnection()).connected
      ) {
        throw new Error(
          t.gettext('Stripe is not connected. Check the server configuration.'),
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
                : t.gettext('Stripe synchronization failed.'),
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
    return async (req, res, { t }) => {
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
          throw new Error(t.gettext('The Stripe webhook payload is invalid.'));
        }
        if (isHandledStripeEvent(event)) {
          await this.taonECommerceCustomerRepository.processStripeEvent(event);
        }
        return { received: true };
      } catch (error) {
        console.error(error);
        Taon.error({
          status: 400,
          message: t.gettext('Stripe webhook rejected.'),
        });
        return {
          // TODO not needed
          received: false,
        };
      }
    };
    //#endregion
  }
  //#endregion
}
