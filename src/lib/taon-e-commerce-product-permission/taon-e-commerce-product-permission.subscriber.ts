//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
import { TaonECommerceProductPermissionProvider } from './taon-e-commerce-product-permission.provider';
//#endregion

@TaonSubscriber<TaonECommerceProductPermissionSubscriber>({
  className: 'TaonECommerceProductPermissionSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommerceProductPermissionSubscriber extends TaonBaseSubscriberForEntity {
  private readonly taonECommerceProductPermissionProvider = this.injectProvider(TaonECommerceProductPermissionProvider);
  listenTo(): typeof TaonECommerceProductPermissionEntity {
    return TaonECommerceProductPermissionEntity;
  }
}