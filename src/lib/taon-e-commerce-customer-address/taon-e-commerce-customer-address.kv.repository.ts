//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCustomerAddressKvRepository',
})
export class TaonECommerceCustomerAddressKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommerceCustomerAddressEntity[];
}> {
  async notifyUsers(users: TaonECommerceCustomerAddressEntity[]) {
    this.set('usersToNotify', users);
  }
}