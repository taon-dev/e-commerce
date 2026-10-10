//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceOrderItemKvRepository',
})
export class TaonECommerceOrderItemKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceOrderItemEntity[];
}> {
  async notifyUsers(users: TaonECommerceOrderItemEntity[]) {
    this.set('usersToNotify', users);
  }
}