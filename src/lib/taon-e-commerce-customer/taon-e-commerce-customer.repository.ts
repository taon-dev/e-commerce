//#region imports
import type { Translation } from '@taon-dev/i18n/src';
import { TaonSessionUserGroupEntity } from '@taon-dev/session/src';
import { TaonCmsContentRepository } from '@taon-dev/cms/src';
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import type { EntityManager } from 'taon-typeorm/src';

import { TaonECommerceCartEntity } from '../taon-e-commerce-cart/taon-e-commerce-cart.entity';
import { TaonECommerceCartItemEntity } from '../taon-e-commerce-cart-item/taon-e-commerce-cart-item.entity';
import { TaonECommerceEntitlementEntity } from '../taon-e-commerce-entitlement/taon-e-commerce-entitlement.entity';
import { TaonECommerceOrderEntity } from '../taon-e-commerce-order/taon-e-commerce-order.entity';
import { TaonECommerceOrderItemEntity } from '../taon-e-commerce-order-item/taon-e-commerce-order-item.entity';
import { TaonECommercePaymentTransactionEntity } from '../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.entity';
import { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';
import {
  StripeCheckoutSessionEvent,
  StripeInvoiceEvent,
  StripeWebhookEvent,
  TaonStripeSubscription,
  StripeCharge,
} from '../taon-stripe/taon-stripe.models';
import { TaonECommerceStripeRepository } from '../taon-stripe/taon-stripe.repository';
import {
  isRecurringProduct,
  isQuantityProduct,
  productPurchaseEligibility,
  TaonProductEligibility,
} from '../taon-e-commerce-product/taon-e-commerce-product-eligibility';
import {
  entitlementHasAccess,
  stripeSubscriptionState,
} from '../taon-e-commerce-entitlement/taon-e-commerce-entitlement.utils';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCustomerRepository',
})
export class TaonECommerceCustomerRepository extends TaonBaseRepository<TaonECommerceCartEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCartEntity = () =>
    TaonECommerceCartEntity;

  private readonly taonECommerceStripeRepository = this.injectCustomRepo(
    TaonECommerceStripeRepository,
  );

  private readonly cmsContentRepository = this.injectCustomRepo(
    TaonCmsContentRepository,
  );

  private async prepareProductPosts(
    products: TaonECommerceProductEntity[],
  ): Promise<void> {
    //#region @websqlFunc
    for (const product of products) {
      const post = product.cmsContent;
      if (!post) {
        continue;
      }
      if (post.status !== 'published') {
        product.cmsContent = null;
        continue;
      }
      // Product previews must not expose the content being sold.
      const { permissions } =
        await this.cmsContentRepository.getPermissionConfiguration(post.id);
      if (permissions.length) {
        post.body = null;
      }
      post.videoKey = null;
      post.audioKey = null;
      post.attachmentKey = null;
      post.permissions = [];
    }
    //#endregion
  }

  //#region methods / get cart
  async getCart(
    userId: number,
    t?: Pick<Translation, 'gettext'>,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    let cart = await this.repo.findOne({
      where: { userId },
      relations: { items: { product: { cmsContent: { permissions: true } } } },
    });
    if (!cart) {
      cart = await this.repo.save(this.repo.create({ userId }));
      cart = await this.repo.findOne({
        where: { id: cart.id },
        relations: {
          items: { product: { cmsContent: { permissions: true } } },
        },
      });
    }
    if (!cart) {
      throw new Error(
        t?.gettext('Unable to load the current user cart.') ??
          'Unable to load the current user cart.',
      );
    }
    const singletonItems = cart.items.filter(
      item =>
        item.product?.active === true &&
        !isQuantityProduct(item.product) &&
        item.quantity !== 1,
    );
    if (singletonItems.length) {
      for (const item of singletonItems) {
        item.quantity = 1;
      }
      await this.connection
        .getRepository(TaonECommerceCartItemEntity)
        .save(singletonItems);
    }
    const inactiveItems = cart.items.filter(
      item => item.product?.active !== true,
    );
    if (inactiveItems.length) {
      await this.connection
        .getRepository(TaonECommerceCartItemEntity)
        .remove(inactiveItems);
      const refreshedCart = await this.repo.findOne({
        where: { id: cart.id },
        relations: {
          items: { product: { cmsContent: { permissions: true } } },
        },
      });
      if (!refreshedCart) {
        throw new Error(
          t?.gettext('Unable to refresh the current user cart.') ??
            'Unable to refresh the current user cart.',
        );
      }
      await this.prepareProductPosts(
        refreshedCart.items.map(item => item.product),
      );
      return refreshedCart;
    }
    await this.prepareProductPosts(cart.items.map(item => item.product));
    return cart;
    //#endregion
  }
  //#endregion

  //#region methods / get suggested products
  async getSuggestedProducts(
    userId: number,
    t?: Pick<Translation, 'gettext'>,
  ): Promise<TaonECommerceProductEntity[]> {
    //#region @websqlFunc
    const [memberships, products] = await Promise.all([
      this.connection
        .getRepository(TaonSessionUserGroupEntity)
        .find({ where: { userId } }),
      this.connection.getRepository(TaonECommerceProductEntity).find({
        where: { active: true },
        relations: { suggestedGroups: true, cmsContent: { permissions: true } },
        order: { name: 'ASC' },
      }),
    ]);
    const groupIds = new Set(memberships.map(membership => membership.groupId));
    const suggested = products.filter(
      product =>
        !product.suggestedGroups.length ||
        product.suggestedGroups.some(group => groupIds.has(group.id)),
    );
    const cart = await this.getCart(userId, t);
    for (const product of suggested) {
      product.purchaseEligibility = await this.getPurchaseEligibility(
        userId,
        product,
        (cart.items.find(item => item.productId === product.id)?.quantity ??
          0) + 1,
        cart,
        t,
      );
    }
    await this.prepareProductPosts(suggested);
    return suggested;
    //#endregion
  }
  //#endregion

  //#region methods / add product
  async addProduct(
    userId: number,
    productId: number,
    quantity: number,
    t?: Pick<Translation, 'gettext'>,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        t?.gettext('Product and quantity must be positive whole numbers.') ??
          'Product and quantity must be positive whole numbers.',
      );
    }

    const cart = await this.getCart(userId, t);
    await this.connection.transaction('SERIALIZABLE', async manager => {
      const product = await manager
        .getRepository(TaonECommerceProductEntity)
        .findOne({ where: { id: productId, active: true } });
      if (!product) {
        throw new Error(
          t?.gettext('The selected product is not available.') ??
            'The selected product is not available.',
        );
      }
      const currentCart = await manager
        .getRepository(TaonECommerceCartEntity)
        .findOne({
          where: { id: cart.id },
          relations: { items: { product: true } },
        });
      if (!currentCart) {
        throw new Error(
          t?.gettext('The cart was not found.') ?? 'The cart was not found.',
        );
      }
      const items = manager.getRepository(TaonECommerceCartItemEntity);
      const existing = await items.findOne({
        where: { cartId: cart.id, productId },
      });
      const eligibility = await this.getPurchaseEligibility(
        userId,
        product,
        (existing?.quantity ?? 0) + quantity,
        currentCart,
        t,
        manager,
      );
      if (!eligibility.canAdd) {
        throw new Error(eligibility.reason!);
      }
      if (existing) {
        existing.quantity += quantity;
        await items.save(existing);
      } else {
        await items.save(
          items.create({ cartId: cart.id, productId, quantity }),
        );
      }
    });
    return this.getCart(userId, t);
    //#endregion
  }
  //#endregion

  //#region methods / set item quantity
  async setItemQuantity(
    userId: number,
    itemId: number,
    quantity: number,
    t?: Pick<Translation, 'gettext'>,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (
      !Number.isSafeInteger(itemId) ||
      itemId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        t?.gettext('Item and quantity must be positive whole numbers.') ??
          'Item and quantity must be positive whole numbers.',
      );
    }
    const cart = await this.getCart(userId, t);
    await this.connection.transaction('SERIALIZABLE', async manager => {
      const currentCart = await manager
        .getRepository(TaonECommerceCartEntity)
        .findOne({
          where: { id: cart.id },
          relations: { items: { product: true } },
        });
      const item = currentCart?.items.find(
        candidate => candidate.id === itemId,
      );
      if (!item) {
        throw new Error(
          t?.gettext('The cart item was not found.') ??
            'The cart item was not found.',
        );
      }
      const eligibility = await this.getPurchaseEligibility(
        userId,
        item.product,
        quantity,
        currentCart,
        t,
        manager,
      );
      if (!eligibility.canAdd) {
        throw new Error(eligibility.reason!);
      }
      item.quantity = quantity;
      await manager.getRepository(TaonECommerceCartItemEntity).save(item);
    });
    return this.getCart(userId, t);
    //#endregion
  }
  //#endregion

  //#region methods / remove item
  async removeItem(
    userId: number,
    itemId: number,
    t?: Pick<Translation, 'gettext'>,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (!Number.isSafeInteger(itemId) || itemId <= 0) {
      throw new Error(
        t?.gettext('The cart item ID is invalid.') ??
          'The cart item ID is invalid.',
      );
    }
    const cart = await this.getCart(userId, t);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const item = await items.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new Error(
        t?.gettext('The cart item was not found.') ??
          'The cart item was not found.',
      );
    }
    await items.remove(item);
    return this.getCart(userId, t);
    //#endregion
  }
  //#endregion

  //#region methods / get orders
  async getOrders(userId: number): Promise<TaonECommerceOrderEntity[]> {
    //#region @websqlFunc
    return this.connection.getRepository(TaonECommerceOrderEntity).find({
      where: { userId },
      relations: { items: true, transactions: true },
      order: { createdAt: 'DESC' },
    });
    //#endregion
  }
  //#endregion

  //#region methods / get transactions
  async getTransactions(
    userId: number,
  ): Promise<TaonECommercePaymentTransactionEntity[]> {
    //#region @websqlFunc
    return this.connection
      .getRepository(TaonECommercePaymentTransactionEntity)
      .find({
        where: { order: { userId } },
        relations: { order: true },
        order: { createdAt: 'DESC' },
      });
    //#endregion
  }
  //#endregion

  //#region methods / create checkout session
  private async getPurchaseEligibility(
    userId: number,
    product: TaonECommerceProductEntity,
    quantity: number,
    cart: TaonECommerceCartEntity,
    t?: Pick<Translation, 'gettext'>,
    manager: Pick<EntityManager, 'getRepository'> = this.connection,
  ): Promise<TaonProductEligibility> {
    //#region @websqlFunc
    const priorItems = await manager
      .getRepository(TaonECommerceOrderItemEntity)
      .find({
        where: [
          { productId: product.id, order: { status: 'paid' } },
          { productId: product.id, order: { status: 'pending' } },
        ],
        relations: { order: true },
      });
    const entitlements =
      product.type === 'subscription'
        ? await manager.getRepository(TaonECommerceEntitlementEntity).find({
            where: { userId, productId: product.id },
          })
        : [];
    return productPurchaseEligibility(
      product,
      quantity,
      {
        purchasedQuantity: priorItems
          .filter(item => item.order.userId === userId)
          .reduce((total, item) => total + item.quantity, 0),
        soldQuantity: priorItems.reduce(
          (total, item) => total + item.quantity,
          0,
        ),
        subscriptionReserved:
          priorItems.some(
            item =>
              item.order.userId === userId && item.order.status === 'pending',
          ) ||
          entitlements.some(
            entitlement =>
              entitlementHasAccess(entitlement) ||
              (Boolean(entitlement.stripeSubscriptionId) &&
                entitlement.status !== 'canceled' &&
                entitlement.status !== 'expired'),
          ),
      },
      cart.items
        .filter(item => item.productId !== product.id)
        .map(item => item.product),
      t,
    );
    //#endregion
  }

  async createCheckoutSession(
    userId: number,
    urls: { successUrl: string; cancelUrl: string },
    t?: Pick<Translation, 'gettext'>,
  ): Promise<{ orderId: number; checkoutUrl: string }> {
    //#region @websqlFunc
    const cart = await this.getCart(userId, t);
    if (!cart.items.length) {
      throw new Error(
        t?.gettext('Your cart has no active products to check out.') ??
          'Your cart has no active products to check out.',
      );
    }

    const productRepository = this.connection.getRepository(
      TaonECommerceProductEntity,
    );
    const products = new Map<number, TaonECommerceProductEntity>();
    let currency: string | null = null;
    let recurringCount = 0;

    for (const item of cart.items) {
      const product = await productRepository.findOne({
        where: { id: item.productId, active: true },
      });
      if (!product || product.active !== true) {
        throw new Error(
          t?.gettext('A product in your cart is no longer available.') ??
            'A product in your cart is no longer available.',
        );
      }
      if (!product.stripeProductId || !product.stripePriceId) {
        throw new Error(
          `"${product.name}" has not been synchronized with Stripe.`,
        );
      }
      if (
        product.stripeSyncedPrice !== product.price ||
        product.stripeSyncedCurrency !== product.currency.toUpperCase() ||
        product.stripeSyncedType !== product.type ||
        product.stripeSyncedName !== product.name ||
        product.stripeSyncedDescription !== product.description ||
        product.stripeSyncedActive !== product.active ||
        product.stripeSyncedIntervalValue !==
          (product.type === 'subscription'
            ? product.subscriptionIntervalValue
            : null) ||
        product.stripeSyncedIntervalUnit !==
          (product.type === 'subscription'
            ? product.subscriptionIntervalUnit
            : null)
      ) {
        throw new Error(
          `"${product.name}" changed after its last Stripe sync.`,
        );
      }
      if (currency !== null && product.currency.toUpperCase() !== currency) {
        throw new Error(
          t?.gettext('All products in one checkout must use the same currency.') ??
            'All products in one checkout must use the same currency.',
        );
      }
      currency = product.currency.toUpperCase();
      if (
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        (product.type !== 'item' && item.quantity !== 1)
      ) {
        throw new Error(
          `"${product.name}" does not allow this purchase quantity.`,
        );
      }
      if (isRecurringProduct(product)) {
        recurringCount += 1;
      }

      const eligibility = await this.getPurchaseEligibility(
        userId,
        product,
        item.quantity,
        cart,
        t,
      );
      if (!eligibility.canAdd) {
        throw new Error(eligibility.reason!);
      }
      products.set(product.id, product);
    }

    if (
      recurringCount &&
      (recurringCount !== cart.items.length || cart.items.length > 1)
    ) {
      throw new Error(
        t?.gettext('A recurring subscription must be checked out by itself.') ??
          'A recurring subscription must be checked out by itself.',
      );
    }

    const subtotal = cart.items.reduce((total, item) => {
      const product = products.get(item.productId)!;
      return total + product.price * item.quantity;
    }, 0);
    const order = await this.connection.transaction(
      'SERIALIZABLE',
      async manager => {
        for (const item of cart.items) {
          const eligibility = await this.getPurchaseEligibility(
            userId,
            products.get(item.productId)!,
            item.quantity,
            cart,
            t,
            manager,
          );
          if (!eligibility.canAdd) {
            throw new Error(eligibility.reason!);
          }
        }
        const orderRepository = manager.getRepository(TaonECommerceOrderEntity);
        const itemRepository = manager.getRepository(
          TaonECommerceOrderItemEntity,
        );
        const createdOrder = await orderRepository.save(
          orderRepository.create({
            userId,
            status: 'pending',
            currency: currency!,
            subtotal,
            total: subtotal,
            stripeCheckoutSessionId: null,
          }),
        );
        const orderItems = cart.items.map(item => {
          const product = products.get(item.productId)!;
          return itemRepository.create({
            orderId: createdOrder.id,
            productId: product.id,
            productName: product.name,
            unitPrice: product.price,
            quantity: item.quantity,
            totalPrice: product.price * item.quantity,
          });
        });
        await itemRepository.save(orderItems);
        return createdOrder;
      },
    );
    const orderRepository = this.connection.getRepository(
      TaonECommerceOrderEntity,
    );

    try {
      const checkout =
        await this.taonECommerceStripeRepository.createCheckoutSession({
          orderId: order.id,
          userId,
          lineItems: cart.items.map(item => ({
            stripePriceId: products.get(item.productId)!.stripePriceId!,
            quantity: item.quantity,
          })),
          subscription: recurringCount > 0,
          successUrl: urls.successUrl,
          cancelUrl: urls.cancelUrl,
        });
      order.stripeCheckoutSessionId = checkout.id;
      await orderRepository.save(order);
      return { orderId: order.id, checkoutUrl: checkout.url };
    } catch (error) {
      order.status = 'failed';
      await orderRepository.save(order);
      throw error;
    }
    //#endregion
  }
  //#endregion

  //#region methods / process stripe event
  async processStripeEvent(event: StripeWebhookEvent): Promise<void> {
    //#region @websqlFunc
    await this.connection.transaction('SERIALIZABLE', manager =>
      this.processStripeEventInTransaction(event, manager),
    );
    //#endregion
  }

  private async processStripeEventInTransaction(
    event: StripeWebhookEvent,
    manager: EntityManager,
  ): Promise<void> {
    //#region @websqlFunc
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded' ||
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session =
        await this.taonECommerceStripeRepository.getCheckoutSession(
          event.data.object.id,
        );
      if (
        session.status === 'expired' ||
        (event.type === 'checkout.session.async_payment_failed' &&
          session.payment_status === 'unpaid')
      ) {
        await this.markCheckoutSessionFailed(session, manager);
      } else {
        await this.completeCheckoutSession(session, manager);
      }
      return;
    }
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await this.updateSubscription(
        await this.taonECommerceStripeRepository.getSubscription(
          event.data.object.id,
        ),
        manager,
      );
      return;
    }
    if (
      event.type === 'invoice.paid' ||
      event.type === 'invoice.payment_succeeded' ||
      event.type === 'invoice.payment_failed'
    ) {
      const invoice = await this.taonECommerceStripeRepository.getInvoice(
        event.data.object.id,
      );
      const subscriptionId = this.stripeObjectId(
        invoice.subscription ??
          invoice.parent?.subscription_details?.subscription,
      );
      if (subscriptionId) {
        const subscription =
          await this.taonECommerceStripeRepository.getSubscription(
            subscriptionId,
          );
        if (
          !subscription.metadata?.taonOrderId &&
          !(await manager
            .getRepository(TaonECommerceEntitlementEntity)
            .findOne({
              where: { stripeSubscriptionId: subscriptionId },
            }))
        ) {
          return;
        }
        await this.updateSubscription(subscription, manager);
        if (invoice.status === 'paid') {
          await this.recordInvoicePayment(invoice, subscriptionId, manager);
        } else {
          await this.recordInvoiceFailure(invoice, subscriptionId, manager);
        }
      }

      return;
    }
    if (event.type === 'charge.refunded') {
      const charge = await this.taonECommerceStripeRepository.getCharge(
        event.data.object.id,
      );
      if (charge.refunded || charge.amount_refunded >= charge.amount) {
        await this.reversePurchase(charge, manager);
      }
    } else if (event.type === 'charge.dispute.closed') {
      const dispute = await this.taonECommerceStripeRepository.getDispute(
        event.data.object.id,
      );
      if (dispute.status === 'lost') {
        const chargeId = this.stripeObjectId(dispute.charge);
        if (!chargeId) {
          throw new Error('The Stripe dispute has no charge ID.');
        }
        const charge =
          await this.taonECommerceStripeRepository.getCharge(chargeId);
        if (dispute.amount >= charge.amount) {
          await this.reversePurchase(charge, manager);
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region methods / get entitlements
  async getEntitlements(
    userId: number,
  ): Promise<TaonECommerceEntitlementEntity[]> {
    //#region @websqlFunc
    const repository = this.connection.getRepository(
      TaonECommerceEntitlementEntity,
    );
    const entitlements = await repository.find({
      where: { userId },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
    const now = Date.now();
    for (const entitlement of entitlements) {
      if (
        entitlement.status === 'active' &&
        !entitlement.stripeSubscriptionId &&
        entitlement.currentPeriodEnd &&
        entitlement.currentPeriodEnd.getTime() <= now
      ) {
        entitlement.status = 'expired';
        await repository.save(entitlement);
      }
    }
    return entitlements;
    //#endregion
  }
  //#endregion

  //#region methods / complete checkout session
  private async completeCheckoutSession(
    session: StripeCheckoutSessionEvent,
    manager: EntityManager,
  ): Promise<void> {
    const orderId = Number(session.metadata?.taonOrderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0 || !session.id) {
      throw new Error(
        'The Stripe Checkout session has invalid Taon order metadata.',
      );
    }
    const orderRepository = manager.getRepository(TaonECommerceOrderEntity);
    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: { items: { product: true } },
    });
    if (!order || order.stripeCheckoutSessionId !== session.id) {
      throw new Error(
        'The Stripe Checkout session does not match a local order.',
      );
    }
    if (Number(session.metadata?.taonUserId) !== order.userId) {
      throw new Error(
        'The Stripe Checkout session user does not match the local order.',
      );
    }
    if (order.status === 'refunded') {
      return;
    }
    if (
      (session.payment_status !== 'paid' &&
        session.payment_status !== 'no_payment_required') ||
      session.amount_total === null ||
      session.amount_total === undefined
    ) {
      return;
    }
    if (
      session.currency?.toUpperCase() !== order.currency ||
      Math.abs(session.amount_total / 100 - order.total) > 0.01
    ) {
      throw new Error(
        'The Stripe Checkout total does not match the local order.',
      );
    }

    const subscriptionId = this.stripeObjectId(session.subscription);
    const subscription = subscriptionId
      ? await this.taonECommerceStripeRepository.getSubscription(subscriptionId)
      : null;
    if (
      subscription &&
      (subscription.metadata?.taonOrderId !== String(order.id) ||
        subscription.metadata?.taonUserId !== String(order.userId))
    ) {
      throw new Error(
        'The Stripe subscription metadata does not match the local order.',
      );
    }

    const transactionRepository = manager.getRepository(
      TaonECommercePaymentTransactionEntity,
    );
    const paymentIntentId =
      this.stripeObjectId(session.payment_intent) ?? session.id;
    const existingTransaction = await transactionRepository.findOne({
      where: {
        provider: 'stripe',
        providerTransactionId: paymentIntentId,
      },
    });
    const transaction =
      existingTransaction ??
      transactionRepository.create({
        orderId: order.id,
        provider: 'stripe',
        providerTransactionId: paymentIntentId,
        amount: order.total,
        currency: order.currency,
        status: 'succeeded',
      });
    if (transaction.orderId !== order.id) {
      throw new Error(
        'The Stripe payment is already associated with another order.',
      );
    }
    const shouldConsumeCart = order.status !== 'paid';
    transaction.status = 'succeeded';
    await transactionRepository.save(transaction);
    order.status = 'paid';
    await orderRepository.save(order);

    const cart = shouldConsumeCart
      ? await manager
          .getRepository(TaonECommerceCartEntity)
          .findOne({ where: { userId: order.userId } })
      : null;
    if (cart) {
      const cartItems = manager.getRepository(TaonECommerceCartItemEntity);
      const ownedItems = await cartItems.find({ where: { cartId: cart.id } });
      const purchasedQuantities = new Map<number, number>();
      for (const item of order.items) {
        purchasedQuantities.set(
          item.productId,
          (purchasedQuantities.get(item.productId) ?? 0) + item.quantity,
        );
      }
      for (const item of ownedItems) {
        const remaining =
          item.quantity - (purchasedQuantities.get(item.productId) ?? 0);
        if (remaining <= 0) {
          await cartItems.remove(item);
        } else if (remaining !== item.quantity) {
          item.quantity = remaining;
          await cartItems.save(item);
        }
      }
    }

    const entitlementRepository = manager.getRepository(
      TaonECommerceEntitlementEntity,
    );
    for (const item of order.items) {
      const product = item.product;
      const startedAt = new Date();
      let periodEnd: Date | null = null;
      let periodStart: Date | null = null;
      if (subscription && product.type === 'subscription') {
        const state = stripeSubscriptionState(subscription);
        periodStart = this.dateFromUnix(state.start);
        periodEnd = this.dateFromUnix(state.end);
      } else if (product.type === 'subscription') {
        periodStart = startedAt;
        periodEnd = this.calculateEntitlementExpiry(product, startedAt);
      }
      const existingEntitlement = subscriptionId
        ? await entitlementRepository.findOne({
            where: { stripeSubscriptionId: subscriptionId },
          })
        : await entitlementRepository.findOne({
            where: { orderId: order.id, productId: product.id },
          });
      const entitlement =
        existingEntitlement ??
        entitlementRepository.create({
          userId: order.userId,
          productId: product.id,
          orderId: order.id,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: this.stripeObjectId(session.customer),
          startedAt,
        });
      if (!existingEntitlement || subscription) {
        entitlement.status = subscription
          ? stripeSubscriptionState(subscription).status
          : 'active';
        entitlement.currentPeriodStart = periodStart;
        entitlement.currentPeriodEnd = periodEnd;
        entitlement.canceledAt = subscription
          ? this.dateFromUnix(subscription.canceled_at)
          : null;
      }
      await entitlementRepository.save(entitlement);
    }
  }
  //#endregion

  //#region methods / record invoice payment
  private async recordInvoicePayment(
    invoice: StripeInvoiceEvent,
    subscriptionId: string,
    manager: EntityManager,
  ): Promise<void> {
    const entitlement = await manager
      .getRepository(TaonECommerceEntitlementEntity)
      .findOne({ where: { stripeSubscriptionId: subscriptionId } });
    if (!entitlement) {
      throw new Error(
        'The Stripe invoice subscription has no local entitlement.',
      );
    }
    const order = await manager
      .getRepository(TaonECommerceOrderEntity)
      .findOne({ where: { id: entitlement.orderId } });
    if (!order) {
      throw new Error('The Stripe invoice order was not found.');
    }
    const repository = manager.getRepository(
      TaonECommercePaymentTransactionEntity,
    );
    const transaction =
      (await repository.findOne({
        where: { provider: 'stripe', providerTransactionId: invoice.id },
      })) ??
      repository.create({
        orderId: entitlement.orderId,
        provider: 'stripe',
        providerTransactionId: invoice.id,
        status: 'succeeded',
        amount:
          typeof invoice.amount_paid === 'number'
            ? invoice.amount_paid / 100
            : order.total,
        currency: order.currency,
      });
    if (transaction.orderId !== entitlement.orderId) {
      throw new Error(
        'The Stripe invoice is already associated with another order.',
      );
    }
    if (transaction.status === 'refunded') {
      return;
    }
    transaction.status = 'succeeded';
    transaction.amount =
      typeof invoice.amount_paid === 'number'
        ? invoice.amount_paid / 100
        : order.total;
    transaction.currency = order.currency;
    await repository.save(transaction);
  }
  //#endregion

  //#region methods / record invoice failure
  private async recordInvoiceFailure(
    invoice: StripeInvoiceEvent,
    subscriptionId: string,
    manager: EntityManager,
  ): Promise<void> {
    const entitlement = await manager
      .getRepository(TaonECommerceEntitlementEntity)
      .findOne({ where: { stripeSubscriptionId: subscriptionId } });
    const subscription = !entitlement
      ? await this.taonECommerceStripeRepository.getSubscription(subscriptionId)
      : null;
    const orderId =
      entitlement?.orderId ?? Number(subscription?.metadata?.taonOrderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      throw new Error('The failed Stripe invoice has no local order.');
    }
    const order = await manager
      .getRepository(TaonECommerceOrderEntity)
      .findOne({ where: { id: orderId } });
    if (
      !order ||
      (subscription &&
        subscription.metadata?.taonUserId !== String(order.userId))
    ) {
      throw new Error('The failed Stripe invoice order was not found.');
    }
    const repository = manager.getRepository(
      TaonECommercePaymentTransactionEntity,
    );
    const transaction =
      (await repository.findOne({
        where: { provider: 'stripe', providerTransactionId: invoice.id },
      })) ??
      repository.create({
        orderId: order.id,
        provider: 'stripe',
        providerTransactionId: invoice.id,
        amount: (invoice.amount_due ?? 0) / 100,
        currency: order.currency,
        status: 'failed',
      });
    if (transaction.orderId !== order.id) {
      throw new Error(
        'The Stripe invoice is already associated with another order.',
      );
    }
    if (
      transaction.status !== 'succeeded' &&
      transaction.status !== 'refunded'
    ) {
      transaction.status = 'failed';
      await repository.save(transaction);
    }
  }
  //#endregion

  //#region methods / mark checkout session failed
  private async markCheckoutSessionFailed(
    session: StripeCheckoutSessionEvent,
    manager: EntityManager,
  ): Promise<void> {
    //#region @websqlFunc
    const orderId = Number(session.metadata?.taonOrderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0 || !session.id) {
      throw new Error(
        'The Stripe Checkout session has invalid Taon order metadata.',
      );
    }
    const orderRepository = manager.getRepository(TaonECommerceOrderEntity);
    const order = await orderRepository.findOne({ where: { id: orderId } });
    if (!order || order.stripeCheckoutSessionId !== session.id) {
      throw new Error(
        'The Stripe Checkout session does not match a local order.',
      );
    }
    if (order.status !== 'pending') {
      return;
    }
    order.status = session.status === 'expired' ? 'cancelled' : 'failed';
    await orderRepository.save(order);
    const providerTransactionId =
      this.stripeObjectId(session.payment_intent) ?? session.id;
    const transactionRepository = manager.getRepository(
      TaonECommercePaymentTransactionEntity,
    );
    const transaction =
      (await transactionRepository.findOne({
        where: { provider: 'stripe', providerTransactionId },
      })) ??
      transactionRepository.create({
        orderId: order.id,
        provider: 'stripe',
        providerTransactionId,
        amount: order.total,
        currency: order.currency,
        status: 'failed',
      });
    transaction.status = 'failed';
    await transactionRepository.save(transaction);
    //#endregion
  }
  //#endregion

  //#region methods / update subscription
  private async updateSubscription(
    subscription: TaonStripeSubscription,
    manager: EntityManager,
  ): Promise<void> {
    const repository = manager.getRepository(TaonECommerceEntitlementEntity);
    let entitlements = await repository.find({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!entitlements.length && subscription.metadata?.taonOrderId) {
      const order = await manager
        .getRepository(TaonECommerceOrderEntity)
        .findOne({
          where: { id: Number(subscription.metadata.taonOrderId) },
        });
      if (!order?.stripeCheckoutSessionId) {
        throw new Error('The Stripe subscription order is not ready yet.');
      }
      const session =
        await this.taonECommerceStripeRepository.getCheckoutSession(
          order.stripeCheckoutSessionId,
        );
      if (this.stripeObjectId(session.subscription) !== subscription.id) {
        throw new Error(
          'The Stripe subscription does not match the order checkout.',
        );
      }
      await this.completeCheckoutSession(session, manager);
      entitlements = await repository.find({
        where: { stripeSubscriptionId: subscription.id },
      });
    }
    const state = stripeSubscriptionState(subscription);
    for (const entitlement of entitlements) {
      const order = await manager
        .getRepository(TaonECommerceOrderEntity)
        .findOne({
          where: { id: entitlement.orderId },
        });
      if (order?.status === 'refunded') {
        continue;
      }
      entitlement.status = state.status;
      entitlement.currentPeriodStart = this.dateFromUnix(state.start);
      entitlement.currentPeriodEnd = this.dateFromUnix(state.end);
      entitlement.canceledAt = this.dateFromUnix(subscription.canceled_at);
      await repository.save(entitlement);
    }
  }
  //#endregion

  private async reversePurchase(
    charge: StripeCharge,
    manager: EntityManager,
  ): Promise<void> {
    //#region @websqlFunc
    const paymentIntentId = this.stripeObjectId(charge.payment_intent);
    if (!paymentIntentId) {
      return;
    }
    const transactions = manager.getRepository(
      TaonECommercePaymentTransactionEntity,
    );
    const transaction = await transactions.findOne({
      where: { provider: 'stripe', providerTransactionId: paymentIntentId },
    });
    const session = transaction
      ? null
      : await this.taonECommerceStripeRepository.getCheckoutForPaymentIntent(
          paymentIntentId,
        );
    const orders = manager.getRepository(TaonECommerceOrderEntity);
    const order = transaction
      ? await orders.findOne({ where: { id: transaction.orderId } })
      : session
        ? await orders.findOne({
            where: { stripeCheckoutSessionId: session.id },
          })
        : null;
    // Ignore payments that were not created by this application's checkout.
    if (!order) {
      return;
    }
    const reversedTransaction =
      transaction ??
      transactions.create({
        orderId: order.id,
        provider: 'stripe',
        providerTransactionId: paymentIntentId,
        status: 'refunded',
        amount: order.total,
        currency: order.currency,
      });
    reversedTransaction.status = 'refunded';
    await transactions.save(reversedTransaction);
    const entitlements = manager.getRepository(TaonECommerceEntitlementEntity);
    const grants = await entitlements.find({ where: { orderId: order.id } });
    for (const grant of grants) {
      grant.status = 'expired';
      await entitlements.save(grant);
    }
    order.status = 'refunded';
    await orders.save(order);
    //#endregion
  }

  //#region methods / calculate entitlement expiry
  private calculateEntitlementExpiry(
    product: TaonECommerceProductEntity,
    startedAt: Date,
  ): Date | null {
    //#region @websqlFunc
    const value = product.subscriptionIntervalValue;
    const unit = product.subscriptionIntervalUnit;
    if (!value || value <= 0 || !unit) {
      throw new Error(
        `Subscription duration is not configured for "${product.name}".`,
      );
    }
    const multiplier = {
      seconds: 1000,
      minutes: 60_000,
      hours: 3_600_000,
      days: 86_400_000,
    }[unit];
    return new Date(startedAt.getTime() + value * multiplier);
    //#endregion
  }
  //#endregion

  //#region methods / date from unix
  private dateFromUnix(value: number | null | undefined): Date | null {
    return typeof value === 'number' ? new Date(value * 1000) : null;
  }
  //#endregion

  //#region methods / stripe object id
  private stripeObjectId(
    value: string | { id: string } | null | undefined,
  ): string | null {
    return typeof value === 'string' ? value : (value?.id ?? null);
  }
  //#endregion
}
