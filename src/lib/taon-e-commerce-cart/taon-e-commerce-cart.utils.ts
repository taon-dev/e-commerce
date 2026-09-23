import { TaonECommerceCartModels } from './taon-e-commerce-cart.models';

export namespace TaonECommerceCartUtils {
  export function isActive(state: string): state is TaonECommerceCartModels.TaonECommerceCartState {
    return state === 'active';
  }
}