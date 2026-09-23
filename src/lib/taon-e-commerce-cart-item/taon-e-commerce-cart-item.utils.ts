import { TaonECommerceCartItemModels } from './taon-e-commerce-cart-item.models';

export namespace TaonECommerceCartItemUtils {
  export function isActive(state: string): state is TaonECommerceCartItemModels.TaonECommerceCartItemState {
    return state === 'active';
  }
}