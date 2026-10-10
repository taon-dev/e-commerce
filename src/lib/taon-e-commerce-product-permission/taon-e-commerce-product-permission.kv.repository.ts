//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceProductPermissionKvRepository',
})
export class TaonECommerceProductPermissionKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceProductPermissionEntity[];
}> {
  async notifyUsers(users: TaonECommerceProductPermissionEntity[]) {
    this.set('usersToNotify', users);
  }
}