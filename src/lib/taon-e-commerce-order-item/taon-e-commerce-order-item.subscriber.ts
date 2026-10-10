//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
import { TaonECommerceOrderItemProvider } from './taon-e-commerce-order-item.provider';
//#endregion

@TaonSubscriber<TaonECommerceOrderItemSubscriber>({
  className: 'TaonECommerceOrderItemSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceOrderItemSubscriber extends TaonBaseSubscriberForEntity {
  private readonly taonECommerceOrderItemProvider = this.injectProvider(TaonECommerceOrderItemProvider);
  listenTo(): typeof TaonECommerceOrderItemEntity {
    return TaonECommerceOrderItemEntity;
  }
}