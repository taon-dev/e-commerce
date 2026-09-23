//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
import { TaonECommerceCartProvider } from './taon-e-commerce-cart.provider';
//#endregion

@TaonSubscriber<TaonECommerceCartSubscriber>({
  className: 'TaonECommerceCartSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceCartSubscriber extends TaonBaseSubscriberForEntity {
  taonECommerceCartProvider = this.injectProvider(TaonECommerceCartProvider);
  listenTo(): typeof TaonECommerceCartEntity {
    return TaonECommerceCartEntity;
  }
}