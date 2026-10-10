import { TaonECommerceOrderItemModels } from './taon-e-commerce-order-item.models';

export namespace TaonECommerceOrderItemUtils {
  export function isActive(state: string): state is TaonECommerceOrderItemModels.TaonECommerceOrderItemState {
    return state === 'active';
  }
}