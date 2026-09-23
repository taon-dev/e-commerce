//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
import { TaonECommerceCartItemProvider } from './taon-e-commerce-cart-item.provider';
//#endregion

@TaonSubscriber<TaonECommerceCartItemSubscriber>({
  className: 'TaonECommerceCartItemSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceCartItemSubscriber extends TaonBaseSubscriberForEntity {
  taonECommerceCartItemProvider = this.injectProvider(TaonECommerceCartItemProvider);
  listenTo(): typeof TaonECommerceCartItemEntity {
    return TaonECommerceCartItemEntity;
  }
}