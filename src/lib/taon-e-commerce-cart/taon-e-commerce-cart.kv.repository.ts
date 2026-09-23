//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCartKvRepository',
})
export class TaonECommerceCartKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceCartEntity[];
}> {
  async notifyUsers(users: TaonECommerceCartEntity[]) {
    this.set('usersToNotify', users);
  }
}