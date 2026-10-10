//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
import { TaonECommerceCustomerAddressProvider } from './taon-e-commerce-customer-address.provider';
//#endregion

@TaonSubscriber<TaonECommerceCustomerAddressSubscriber>({
  className: 'TaonECommerceCustomerAddressSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceCustomerAddressSubscriber extends TaonBaseSubscriberForEntity {
  private readonly taonECommerceCustomerAddressProvider = this.injectProvider(TaonECommerceCustomerAddressProvider);
  listenTo(): typeof TaonECommerceCustomerAddressEntity {
    return TaonECommerceCustomerAddressEntity;
  }
}