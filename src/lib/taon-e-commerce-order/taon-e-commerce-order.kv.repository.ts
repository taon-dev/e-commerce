//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceOrderKvRepository',
})
export class TaonECommerceOrderKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceOrderEntity[];
}> {
  async notifyUsers(users: TaonECommerceOrderEntity[]) {
    this.set('usersToNotify', users);
  }
}