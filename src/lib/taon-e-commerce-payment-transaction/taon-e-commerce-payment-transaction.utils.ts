import { TaonECommercePaymentTransactionModels } from './taon-e-commerce-payment-transaction.models';

export namespace TaonECommercePaymentTransactionUtils {
  export function isActive(state: string): state is TaonECommercePaymentTransactionModels.TaonECommercePaymentTransactionState {
    return state === 'active';
  }
}