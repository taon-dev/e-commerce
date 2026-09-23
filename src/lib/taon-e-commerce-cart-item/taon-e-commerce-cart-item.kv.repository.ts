//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCartItemKvRepository',
})
export class TaonECommerceCartItemKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceCartItemEntity[];
}> {
  async notifyUsers(users: TaonECommerceCartItemEntity[]) {
    this.set('usersToNotify', users);
  }
}