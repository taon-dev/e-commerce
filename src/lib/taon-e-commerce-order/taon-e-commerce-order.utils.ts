import { TaonECommerceOrderModels } from './taon-e-commerce-order.models';

export namespace TaonECommerceOrderUtils {
  export function isActive(state: string): state is TaonECommerceOrderModels.TaonECommerceOrderState {
    return state === 'active';
  }
}