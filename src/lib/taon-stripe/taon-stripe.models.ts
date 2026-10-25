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
  metadata?: Record<string, string>;
}

export interface TaonStripeWebhookEvent {
  type: string;
  data?: { object?: Record<string, unknown> };
}

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
  subscription?: string | { id: string } | null;
  parent?: {
    subscription_details?: { subscription?: string | { id: string } | null };
  };
  amount_paid?: number;
  amount_due?: number;
  currency?: string;
}

export interface StripeWebhookEvent {
  type: string;
  data?: { object?: Record<string, unknown> };
}
