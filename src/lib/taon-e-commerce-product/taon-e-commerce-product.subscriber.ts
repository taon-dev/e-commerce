//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { TaonECommerceProductProvider } from './taon-e-commerce-product.provider';
//#endregion

@TaonSubscriber<TaonECommerceProductSubscriber>({
  className: 'TaonECommerceProductSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceProductSubscriber extends TaonBaseSubscriberForEntity {
  taonECommerceProductProvider = this.injectProvider(TaonECommerceProductProvider);
  listenTo(): typeof TaonECommerceProductEntity {
    return TaonECommerceProductEntity;
  }
}