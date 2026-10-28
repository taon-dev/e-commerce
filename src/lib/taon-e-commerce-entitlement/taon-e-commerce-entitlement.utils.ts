import type { TaonECommerceEntitlementEntity } from './taon-e-commerce-entitlement.entity';
import type { TaonStripeSubscription } from '../taon-stripe/taon-stripe.models';

export function entitlementHasAccess(
  entitlement: Pick<
    TaonECommerceEntitlementEntity,
    'status' | 'stripeSubscriptionId' | 'currentPeriodEnd' | 'canceledAt'
  >,
  now = Date.now(),
): boolean {
  if (entitlement.stripeSubscriptionId) {
    // Stripe sets canceled_at when renewal is canceled, before access ends.
    if (entitlement.canceledAt && entitlement.currentPeriodEnd &&
      new Date(entitlement.currentPeriodEnd).getTime() <= now) {
      return false;
    }
    // Stripe keeps past_due subscriptions valid during its retry/dunning window.
    return entitlement.status === 'active' || entitlement.status === 'past_due';
  }
  return (
    entitlement.status === 'active' &&
    (!entitlement.currentPeriodEnd ||
      new Date(entitlement.currentPeriodEnd).getTime() > now)
  );
}

export function stripeSubscriptionState(subscription: TaonStripeSubscription): {
  status: TaonECommerceEntitlementEntity['status'];
  start: number | undefined;
  end: number | undefined;
} {
  return {
    status:
      subscription.status === 'active' || subscription.status === 'trialing'
        ? 'active'
        : subscription.status === 'past_due'
          ? 'past_due'
          : subscription.status === 'canceled'
            ? 'canceled'
            : subscription.status === 'unpaid' ||
                subscription.status === 'incomplete' ||
                subscription.status === 'paused'
              ? subscription.status
              : 'expired',
    start: subscription.current_period_start ??
      subscription.items?.data[0]?.current_period_start,
    end: subscription.current_period_end ??
      subscription.items?.data[0]?.current_period_end,
  };
}
