import { TaonECommerceProductModels } from './taon-e-commerce-product.models';

export namespace TaonECommerceProductUtils {
  export function isActive(state: string): state is TaonECommerceProductModels.TaonECommerceProductState {
    return state === 'active';
  }
}