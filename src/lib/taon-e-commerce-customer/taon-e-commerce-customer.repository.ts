//#region imports
import { TaonSessionUserGroupEntity } from '@taon-dev/session/src';
import { TaonBaseRepository, TaonRepository } from 'taon/src';

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
} from '../taon-stripe/taon-stripe.models';
import { TaonECommerceStripeRepository } from '../taon-stripe/taon-stripe.repository';
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

  //#region methods / get cart
  async getCart(userId: number): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    let cart = await this.repo.findOne({
      where: { userId },
      relations: { items: { product: true } },
    });
    if (!cart) {
      cart = await this.repo.save(this.repo.create({ userId }));
      cart = await this.repo.findOne({
        where: { id: cart.id },
        relations: { items: { product: true } },
      });
    }
    if (!cart) {
      throw new Error('Unable to load the current user cart.');
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
        relations: { items: { product: true } },
      });
      if (!refreshedCart) {
        throw new Error('Unable to refresh the current user cart.');
      }
      return refreshedCart;
    }
    return cart;
    //#endregion
  }
  //#endregion

  //#region methods / get suggested products
  async getSuggestedProducts(
    userId: number,
  ): Promise<TaonECommerceProductEntity[]> {
    //#region @websqlFunc
    const [memberships, products] = await Promise.all([
      this.connection
        .getRepository(TaonSessionUserGroupEntity)
        .find({ where: { userId } }),
      this.connection.getRepository(TaonECommerceProductEntity).find({
        where: { active: true },
        relations: { suggestedGroups: true },
        order: { name: 'ASC' },
      }),
    ]);
    const groupIds = new Set(memberships.map(membership => membership.groupId));
    return products.filter(
      product =>
        !product.suggestedGroups.length ||
        product.suggestedGroups.some(group => groupIds.has(group.id)),
    );
    //#endregion
  }
  //#endregion

  //#region methods / add product
  async addProduct(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error('Product and quantity must be positive whole numbers.');
    }

    const product = await this.connection
      .getRepository(TaonECommerceProductEntity)
      .findOne({ where: { id: productId, active: true } });
    if (!product) {
      throw new Error('The selected product is not available.');
    }

    const cart = await this.getCart(userId);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const existing = await items.findOne({
      where: { cartId: cart.id, productId },
    });
    if (existing) {
      existing.quantity += quantity;
      await items.save(existing);
    } else {
      await items.save(items.create({ cartId: cart.id, productId, quantity }));
    }
    return this.getCart(userId);
    //#endregion
  }
  //#endregion

  //#region methods / set item quantity
  async setItemQuantity(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (
      !Number.isSafeInteger(itemId) ||
      itemId <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error('Item and quantity must be positive whole numbers.');
    }
    const cart = await this.getCart(userId);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const item = await items.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new Error('The cart item was not found.');
    }
    item.quantity = quantity;
    await items.save(item);
    return this.getCart(userId);
    //#endregion
  }
  //#endregion

  //#region methods / remove item
  async removeItem(
    userId: number,
    itemId: number,
  ): Promise<TaonECommerceCartEntity> {
    //#region @websqlFunc
    if (!Number.isSafeInteger(itemId) || itemId <= 0) {
      throw new Error('The cart item ID is invalid.');
    }
    const cart = await this.getCart(userId);
    const items = this.connection.getRepository(TaonECommerceCartItemEntity);
    const item = await items.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new Error('The cart item was not found.');
    }
    await items.remove(item);
    return this.getCart(userId);
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
  async createCheckoutSession(
    userId: number,
    urls: { successUrl: string; cancelUrl: string },
  ): Promise<{ orderId: number; checkoutUrl: string }> {
    //#region @websqlFunc
    const cart = await this.getCart(userId);
    if (!cart.items.length) {
      throw new Error('Your cart has no active products to check out.');
    }

    const productRepository = this.connection.getRepository(
      TaonECommerceProductEntity,
    );
    const orderItemRepository = this.connection.getRepository(
      TaonECommerceOrderItemEntity,
    );
    const products = new Map<number, TaonECommerceProductEntity>();
    let currency: string | null = null;
    const isRecurringSubscription = (product: TaonECommerceProductEntity) =>
      product.type === 'subscription' &&
      product.subscriptionIntervalUnit === 'days' &&
      Boolean(product.subscriptionIntervalValue) &&
      product.subscriptionIntervalValue! <= 365;
    let recurringCount = 0;

    for (const item of cart.items) {
      const product = await productRepository.findOne({
        where: { id: item.productId, active: true },
      });
      if (!product || product.active !== true) {
        throw new Error('A product in your cart is no longer available.');
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
      if (isRecurringSubscription(product)) {
        recurringCount += 1;
      }

      const priorItems = await orderItemRepository.find({
        where: [
          { productId: product.id, order: { userId, status: 'paid' } },
          { productId: product.id, order: { userId, status: 'pending' } },
        ],
        relations: { order: true },
      });
      const priorQuantity = priorItems.reduce(
        (total, prior) => total + prior.quantity,
        0,
      );
      const previouslySold =
        product.stockLimit === null
          ? 0
          : (
              await orderItemRepository.find({
                where: [
                  { productId: product.id, order: { status: 'paid' } },
                  { productId: product.id, order: { status: 'pending' } },
                ],
                relations: { order: true },
              })
            ).reduce((total, prior) => total + prior.quantity, 0);
      if (product.type === 'lifetime' && priorQuantity > 0) {
        throw new Error(`"${product.name}" has already been purchased.`);
      }
      if (
        product.maxQuantityPerUser !== null &&
        priorQuantity + item.quantity > product.maxQuantityPerUser
      ) {
        throw new Error(
          `The per-user purchase limit for "${product.name}" was reached.`,
        );
      }
      if (
        product.stockLimit !== null &&
        previouslySold + item.quantity > product.stockLimit
      ) {
        throw new Error(`"${product.name}" is out of stock.`);
      }
      products.set(product.id, product);
    }

    if (
      recurringCount &&
      (recurringCount !== cart.items.length || cart.items.length > 1)
    ) {
      throw new Error(
        'A recurring subscription must be checked out by itself.',
      );
    }

    const subtotal = cart.items.reduce((total, item) => {
      const product = products.get(item.productId)!;
      return total + product.price * item.quantity;
    }, 0);
    const order = await this.connection.transaction(async manager => {
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
    });
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
    const payload = event.data?.object;
    if (!payload) {
      throw new Error('Stripe webhook event has no data object.');
    }
    if (event.type === 'checkout.session.completed') {
      await this.completeCheckoutSession(
        payload as unknown as StripeCheckoutSessionEvent,
      );
      return;
    }
    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      await this.markCheckoutSessionFailed(
        payload as unknown as StripeCheckoutSessionEvent,
      );
      return;
    }
    if (event.type === 'checkout.session.async_payment_succeeded') {
      await this.completeCheckoutSession(
        payload as unknown as StripeCheckoutSessionEvent,
      );
      return;
    }
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await this.updateSubscription(
        payload as unknown as TaonStripeSubscription,
      );
      return;
    }
    if (
      event.type === 'invoice.payment_succeeded' ||
      event.type === 'invoice.payment_failed'
    ) {
      const invoice = payload as unknown as StripeInvoiceEvent;
      const subscriptionId = this.stripeObjectId(
        invoice.subscription ??
          invoice.parent?.subscription_details?.subscription,
      );
      if (subscriptionId) {
        await this.updateSubscription(
          await this.taonECommerceStripeRepository.getSubscription(
            subscriptionId,
          ),
        );
        if (event.type === 'invoice.payment_succeeded') {
          await this.recordInvoicePayment(invoice, subscriptionId);
        } else {
          await this.recordInvoiceFailure(invoice, subscriptionId);
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
  ): Promise<void> {
    const orderId = Number(session.metadata?.taonOrderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0 || !session.id) {
      throw new Error(
        'The Stripe Checkout session has invalid Taon order metadata.',
      );
    }
    const orderRepository = this.connection.getRepository(
      TaonECommerceOrderEntity,
    );
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

    const transactionRepository = this.connection.getRepository(
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
      ? await this.repo.findOne({ where: { userId: order.userId } })
      : null;
    if (cart) {
      const cartItems = this.connection.getRepository(
        TaonECommerceCartItemEntity,
      );
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

    const entitlementRepository = this.connection.getRepository(
      TaonECommerceEntitlementEntity,
    );
    for (const item of order.items) {
      const product = item.product;
      const startedAt = new Date();
      let periodEnd: Date | null = null;
      let periodStart: Date | null = null;
      if (subscription && product.type === 'subscription') {
        periodStart = this.dateFromUnix(subscription.current_period_start);
        periodEnd = this.dateFromUnix(subscription.current_period_end);
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
      entitlement.status = 'active';
      entitlement.currentPeriodStart = periodStart;
      entitlement.currentPeriodEnd = periodEnd;
      if (
        subscription &&
        subscription.status !== 'active' &&
        subscription.status !== 'trialing'
      ) {
        entitlement.status = 'past_due';
      }
      await entitlementRepository.save(entitlement);
    }
  }
  //#endregion

  //#region methods / record invoice payment
  private async recordInvoicePayment(
    invoice: StripeInvoiceEvent,
    subscriptionId: string,
  ): Promise<void> {
    const entitlement = await this.connection
      .getRepository(TaonECommerceEntitlementEntity)
      .findOne({ where: { stripeSubscriptionId: subscriptionId } });
    if (!entitlement) {
      throw new Error(
        'The Stripe invoice subscription has no local entitlement.',
      );
    }
    const order = await this.connection
      .getRepository(TaonECommerceOrderEntity)
      .findOne({ where: { id: entitlement.orderId } });
    if (!order) {
      throw new Error('The Stripe invoice order was not found.');
    }
    const repository = this.connection.getRepository(
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
  ): Promise<void> {
    const entitlement = await this.connection
      .getRepository(TaonECommerceEntitlementEntity)
      .findOne({ where: { stripeSubscriptionId: subscriptionId } });
    if (!entitlement) {
      throw new Error('The failed Stripe invoice has no local entitlement.');
    }
    const order = await this.connection
      .getRepository(TaonECommerceOrderEntity)
      .findOne({ where: { id: entitlement.orderId } });
    if (!order) {
      throw new Error('The failed Stripe invoice order was not found.');
    }
    const repository = this.connection.getRepository(
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
        amount: (invoice.amount_due ?? 0) / 100,
        currency: order.currency,
        status: 'failed',
      });
    if (transaction.orderId !== entitlement.orderId) {
      throw new Error(
        'The Stripe invoice is already associated with another order.',
      );
    }
    if (transaction.status !== 'succeeded') {
      transaction.status = 'failed';
      await repository.save(transaction);
    }
  }
  //#endregion

  //#region methods / mark checkout session failed
  private async markCheckoutSessionFailed(
    session: StripeCheckoutSessionEvent,
  ): Promise<void> {
    const orderId = Number(session.metadata?.taonOrderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0 || !session.id) {
      throw new Error(
        'The Stripe Checkout session has invalid Taon order metadata.',
      );
    }
    const orderRepository = this.connection.getRepository(
      TaonECommerceOrderEntity,
    );
    const order = await orderRepository.findOne({ where: { id: orderId } });
    if (!order || order.stripeCheckoutSessionId !== session.id) {
      throw new Error(
        'The Stripe Checkout session does not match a local order.',
      );
    }
    if (order.status === 'paid') {
      return;
    }
    order.status = session.status === 'expired' ? 'cancelled' : 'failed';
    await orderRepository.save(order);
    const providerTransactionId =
      this.stripeObjectId(session.payment_intent) ?? session.id;
    const transactionRepository = this.connection.getRepository(
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
  }
  //#endregion

  //#region methods / update subscription
  private async updateSubscription(
    subscription: TaonStripeSubscription,
  ): Promise<void> {
    const repository = this.connection.getRepository(
      TaonECommerceEntitlementEntity,
    );
    const entitlements = await repository.find({
      where: { stripeSubscriptionId: subscription.id },
    });
    const status =
      subscription.status === 'active' || subscription.status === 'trialing'
        ? 'active'
        : subscription.status === 'canceled'
          ? 'canceled'
          : subscription.status === 'past_due' ||
              subscription.status === 'unpaid'
            ? 'past_due'
            : 'expired';
    for (const entitlement of entitlements) {
      entitlement.status = status;
      entitlement.currentPeriodStart = this.dateFromUnix(
        subscription.current_period_start,
      );
      entitlement.currentPeriodEnd = this.dateFromUnix(
        subscription.current_period_end,
      );
      entitlement.canceledAt = this.dateFromUnix(subscription.canceled_at);
      await repository.save(entitlement);
    }
  }
  //#endregion

  //#region methods / calculate entitlement expiry
  private calculateEntitlementExpiry(
    product: TaonECommerceProductEntity,
    startedAt: Date,
  ): Date | null {
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
