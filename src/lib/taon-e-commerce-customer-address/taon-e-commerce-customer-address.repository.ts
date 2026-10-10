//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCustomerAddressRepository',
})
export class TaonECommerceCustomerAddressRepository extends TaonBaseRepository<TaonECommerceCustomerAddressEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCustomerAddressEntity = () => TaonECommerceCustomerAddressEntity;

  /**
   * TODO remove this demo example method
   */
  async countEntitesWithEvenId(): Promise<number> {
    //#region @websqlFunc
    const result = await this.count({
      where: {
        id: Raw(alias => `${alias} % 2 = 0`),
      },
    });
    return result;
    //#endregion
  }
}