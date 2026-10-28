import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';

export interface TaonProductEligibility {
  canAdd: boolean;
  reason: string | null;
}

export interface TaonProductPurchaseState {
  purchasedQuantity: number;
  soldQuantity: number;
  subscriptionReserved: boolean;
}

export function isQuantityProduct(
  product: Pick<TaonECommerceProductEntity, 'type'>,
): boolean {
  return product.type === 'item';
}

export function isRecurringProduct(
  product: Pick<
    TaonECommerceProductEntity,
    'type' | 'subscriptionIntervalUnit' | 'subscriptionIntervalValue'
  >,
): boolean {
  return (
    product.type === 'subscription' &&
    product.subscriptionIntervalUnit === 'days' &&
    product.subscriptionIntervalValue > 0 &&
    product.subscriptionIntervalValue <= 365
  );
}

export function productPurchaseEligibility(
  product: TaonECommerceProductEntity,
  quantity: number,
  state: TaonProductPurchaseState,
  otherProducts: TaonECommerceProductEntity[] = [],
): TaonProductEligibility {
  let reason: string | null = null;
  if (!product.active) {
    reason = 'This product is not available.';
  } else if (!Number.isSafeInteger(quantity) || quantity < 1) {
    reason = 'Quantity must be a positive whole number.';
  } else if (!isQuantityProduct(product) && quantity !== 1) {
    reason = 'This product can only be added once.';
  } else if (product.type === 'lifetime' && state.purchasedQuantity > 0) {
    reason = 'This lifetime product is already owned or awaiting payment.';
  } else if (product.type === 'subscription' && state.subscriptionReserved) {
    reason = 'This subscription is already active or awaiting payment.';
  } else if (
    product.maxQuantityPerUser !== null &&
    state.purchasedQuantity + quantity > product.maxQuantityPerUser
  ) {
    reason = 'The per-user purchase limit has been reached.';
  } else if (
    product.stockLimit !== null &&
    state.soldQuantity + quantity > product.stockLimit
  ) {
    reason = 'This product is out of stock.';
  } else if (
    otherProducts.some(
      other => isRecurringProduct(product) || isRecurringProduct(other),
    )
  ) {
    reason = 'A recurring subscription must be checked out by itself.';
  } else if (
    otherProducts.some(
      other => other.currency.toUpperCase() !== product.currency.toUpperCase(),
    )
  ) {
    reason = 'All products in one checkout must use the same currency.';
  }
  return { canAdd: reason === null, reason };
}
