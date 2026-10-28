export interface TaonStripeSyncResult {
  productId: number;
  productName: string;
  success: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  error?: string;
}

export interface TaonStripeSubscription {
  id: string;
  status: string;
  customer: string | { id: string };
  current_period_start?: number;
  current_period_end?: number;
  canceled_at?: number | null;
  ended_at?: number | null;
  cancel_at_period_end?: boolean;
  items?: {
    data: Array<{
      current_period_start?: number;
      current_period_end?: number;
    }>;
  };
  metadata?: Record<string, string>;
}

export type TaonStripeWebhookEvent = StripeWebhookEvent;

export interface StripeApiError {
  error?: { message?: string };
}

export interface StripeCheckoutSessionEvent {
  id: string;
  status?: string;
  mode?: string;
  payment_status?: string;
  payment_intent?: string | { id: string } | null;
  subscription?: string | { id: string } | null;
  customer?: string | { id: string } | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string>;
}

export interface StripeInvoiceEvent {
  id: string;
  status?: string;
  subscription?: string | { id: string } | null;
  parent?: {
    subscription_details?: { subscription?: string | { id: string } | null };
  };
  amount_paid?: number;
  amount_due?: number;
  currency?: string;
}

export interface StripeCharge {
  id: string;
  payment_intent: string | { id: string } | null;
  amount: number;
  amount_refunded: number;
  refunded: boolean;
}

export interface StripeDispute {
  id: string;
  amount: number;
  charge: string | { id: string };
  status: string;
}

interface StripeEventObjects {
  'checkout.session.completed': StripeCheckoutSessionEvent;
  'checkout.session.expired': StripeCheckoutSessionEvent;
  'checkout.session.async_payment_failed': StripeCheckoutSessionEvent;
  'checkout.session.async_payment_succeeded': StripeCheckoutSessionEvent;
  'customer.subscription.created': TaonStripeSubscription;
  'customer.subscription.updated': TaonStripeSubscription;
  'customer.subscription.deleted': TaonStripeSubscription;
  'invoice.paid': StripeInvoiceEvent;
  'invoice.payment_succeeded': StripeInvoiceEvent;
  'invoice.payment_failed': StripeInvoiceEvent;
  'charge.refunded': StripeCharge;
  'charge.dispute.closed': StripeDispute;
}

export type StripeWebhookEvent = {
  [T in keyof StripeEventObjects]: {
    type: T;
    data: { object: StripeEventObjects[T] };
  };
}[keyof StripeEventObjects];

export function isHandledStripeEvent(event: unknown): event is StripeWebhookEvent {
  if (!event || typeof event !== 'object' ||
    !('type' in event) || typeof event.type !== 'string') {
    return false;
  }
  const handled = [
    'checkout.session.completed',
    'checkout.session.expired',
    'checkout.session.async_payment_failed',
    'checkout.session.async_payment_succeeded',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.paid',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'charge.refunded',
    'charge.dispute.closed',
  ].includes(event.type);
  if (handled && (!('data' in event) || !event.data ||
    typeof event.data !== 'object' || !('object' in event.data) ||
    !event.data.object || typeof event.data.object !== 'object' ||
    !('id' in event.data.object) || typeof event.data.object.id !== 'string')) {
    throw new Error('The Stripe event has no valid resource ID.');
  }
  return handled;
}
