//#region imports
import {
  TaonRepository,
  TaonBaseRepository,
  TaonBaseCustomRepository,
} from 'taon/src';

import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';
import { StripeApiError, TaonStripeSubscription } from './taon-stripe.models';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { TaonECommerceCartProvider } from '../taon-e-commerce-cart/taon-e-commerce-cart.provider';
//#endregion

@TaonRepository({
  className: 'TaonECommerceStripeRepository',
})
export class TaonECommerceStripeRepository extends TaonBaseCustomRepository {
  protected readonly taonECommerceCartProvider = this.injectProvider(
    TaonECommerceCartProvider,
  );

  //#region methods / check connection
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    //#region @backendFunc
    try {
      await this.request('/v1/account');
      return { connected: true, message: 'Connected to Stripe' };
    } catch (error) {
      return {
        connected: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to connect to Stripe.',
      };
    }
    //#endregion
  }
  //#endregion

  //#region methods / synchronize product
  async synchronizeProduct(
    product: TaonECommerceProductEntity,
    syncId: string,
  ): Promise<{ stripeProductId: string; stripePriceId: string }> {
    //#region @backendFunc
    const version = `${product.id}:${syncId}`;
    const createdProduct = await this.request<{ id: string }>(
      '/v1/products',
      'POST',
      {
        name: product.name,
        description: product.description || undefined,
        active: product.active,
        'metadata[taonProductId]': String(product.id),
      },
      `taon-product-${this.idempotencyToken(version)}`,
    );

    const priceParameters: Record<string, string | number | undefined> = {
      currency: product.currency.toLowerCase(),
      product: createdProduct.id,
      unit_amount: Math.round(product.price * 100),
    };
    if (
      product.type === 'subscription' &&
      product.subscriptionIntervalUnit === 'days' &&
      product.subscriptionIntervalValue &&
      product.subscriptionIntervalValue <= 365
    ) {
      priceParameters['recurring[interval]'] = 'day';
      priceParameters['recurring[interval_count]'] =
        product.subscriptionIntervalValue;
    }
    const createdPrice = await this.request<{ id: string }>(
      '/v1/prices',
      'POST',
      priceParameters,
      `taon-price-${this.idempotencyToken(version)}`,
    );

    if (product.stripePriceId && product.stripePriceId !== createdPrice.id) {
      await this.request(
        `/v1/prices/${encodeURIComponent(product.stripePriceId)}`,
        'POST',
        { active: false },
      );
    }
    if (
      product.stripeProductId &&
      product.stripeProductId !== createdProduct.id
    ) {
      await this.request(
        `/v1/products/${encodeURIComponent(product.stripeProductId)}`,
        'POST',
        { active: false },
      );
    }

    return {
      stripeProductId: createdProduct.id,
      stripePriceId: createdPrice.id,
    };
    //#endregion
  }
  //#endregion

  //#region methods / create checkout session
  async createCheckoutSession(options: {
    orderId: number;
    userId: number;
    lineItems: Array<{ stripePriceId: string; quantity: number }>;
    subscription: boolean;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ id: string; url: string }> {
    //#region @backendFunc
    const parameters: Record<string, string | number> = {
      mode: options.subscription ? 'subscription' : 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      client_reference_id: String(options.orderId),
      'metadata[taonOrderId]': String(options.orderId),
      'metadata[taonUserId]': String(options.userId),
    };
    options.lineItems.forEach((item, index) => {
      parameters[`line_items[${index}][price]`] = item.stripePriceId;
      parameters[`line_items[${index}][quantity]`] = item.quantity;
    });
    if (options.subscription) {
      parameters['subscription_data[metadata][taonOrderId]'] = String(
        options.orderId,
      );
      parameters['subscription_data[metadata][taonUserId]'] = String(
        options.userId,
      );
    }

    const session = await this.request<{ id: string; url: string }>(
      '/v1/checkout/sessions',
      'POST',
      parameters,
    );
    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL.');
    }
    return session;
    //#endregion
  }
  //#endregion

  //#region methods / get subscription
  async getSubscription(
    subscriptionId: string,
  ): Promise<TaonStripeSubscription> {
    //#region @backendFunc
    return this.request<TaonStripeSubscription>(
      `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    );
    //#endregion
  }
  //#endregion

  //#region methods / verify webhook signature
  async verifyWebhookSignature(
    rawBody: Uint8Array | undefined,
    signatureHeader: string | undefined,
  ): Promise<unknown> {
    //#region @backendFunc
    const webhookSecret =
      this.taonECommerceCartProvider.STRIPE_WEBHOOK_SECRET_KEY;

    if (!rawBody || !signatureHeader) {
      throw new Error(
        'The Stripe webhook request is missing its raw body or signature.',
      );
    }

    const signatureParts = signatureHeader
      .split(',')
      .map(part => part.split('=', 2))
      .filter(([key, value]) => Boolean(key && value));
    const timestamp = signatureParts.find(([key]) => key === 't')?.[1];
    const signatures = signatureParts
      .filter(([key]) => key === 'v1')
      .map(([, value]) => value);
    if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) {
      throw new Error('The Stripe webhook signature is invalid.');
    }
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      throw new Error('The Stripe webhook signature has expired.');
    }

    const expected = createHmac('sha256', webhookSecret)
      .update(
        Buffer.concat([Buffer.from(`${timestamp}.`), Buffer.from(rawBody)]),
      )
      .digest();
    const verified = signatures.some(signature => {
      if (!/^[\da-f]{64}$/i.test(signature)) {
        return false;
      }
      const actual = Buffer.from(signature, 'hex');
      return (
        actual.length === expected.length && timingSafeEqual(actual, expected)
      );
    });
    if (!verified) {
      throw new Error('The Stripe webhook signature could not be verified.');
    }

    return JSON.parse(Buffer.from(rawBody).toString('utf8')) as unknown;
    //#endregion
  }
  //#endregion

  //#region methods / request
  private async request<T = unknown>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    parameters?: Record<string, string | number | boolean | undefined>,
    idempotencyKey?: string,
  ): Promise<T> {
    //#region @backendFunc
    const body = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters ?? {})) {
      if (value !== undefined) {
        body.set(key, String(value));
      }
    }

    const response = await fetch(`https://api.stripe.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.taonECommerceCartProvider.STRIPE_SECRET_KEY}`,
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        ...(method === 'POST'
          ? { 'Content-Type': 'application/x-www-form-urlencoded' }
          : {}),
      },
      ...(method === 'POST' ? { body } : {}),
    });
    const result = (await response.json()) as T & StripeApiError;
    if (!response.ok) {
      throw new Error(
        result.error?.message || `Stripe request failed (${response.status}).`,
      );
    }
    return result;
    //#endregion
  }
  //#endregion

  //#region methods / idempotency token
  private idempotencyToken(value: string): string {
    //#region @backendFunc
    return createHash('sha256').update(value).digest('hex').slice(0, 48);
    //#endregion
  }
  //#endregion
}
