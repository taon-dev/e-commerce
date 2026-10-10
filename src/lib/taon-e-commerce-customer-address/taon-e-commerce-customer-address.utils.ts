import { TaonECommerceCustomerAddressModels } from './taon-e-commerce-customer-address.models';

export namespace TaonECommerceCustomerAddressUtils {
  export function isActive(state: string): state is TaonECommerceCustomerAddressModels.TaonECommerceCustomerAddressState {
    return state === 'active';
  }
}