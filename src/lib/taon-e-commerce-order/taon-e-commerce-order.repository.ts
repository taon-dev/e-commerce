//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceOrderRepository',
})
export class TaonECommerceOrderRepository extends TaonBaseRepository<TaonECommerceOrderEntity> {
  entityClassResolveFn: () => typeof TaonECommerceOrderEntity = () => TaonECommerceOrderEntity;

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