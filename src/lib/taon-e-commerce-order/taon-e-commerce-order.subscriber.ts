//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
import { TaonECommerceOrderProvider } from './taon-e-commerce-order.provider';
//#endregion

@TaonSubscriber<TaonECommerceOrderSubscriber>({
  className: 'TaonECommerceOrderSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceOrderSubscriber extends TaonBaseSubscriberForEntity {
  private readonly taonECommerceOrderProvider = this.injectProvider(TaonECommerceOrderProvider);
  listenTo(): typeof TaonECommerceOrderEntity {
    return TaonECommerceOrderEntity;
  }
}