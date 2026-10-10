import { TaonECommerceProductPermissionModels } from './taon-e-commerce-product-permission.models';

export namespace TaonECommerceProductPermissionUtils {
  export function isActive(state: string): state is TaonECommerceProductPermissionModels.TaonECommerceProductPermissionState {
    return state === 'active';
  }
}