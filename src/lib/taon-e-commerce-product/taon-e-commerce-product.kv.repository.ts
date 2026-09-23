//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceProductKvRepository',
})
export class TaonECommerceProductKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceProductEntity[];
}> {
  async notifyUsers(users: TaonECommerceProductEntity[]) {
    this.set('usersToNotify', users);
  }
}