//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceOrderItemRepository',
})
export class TaonECommerceOrderItemRepository extends TaonBaseRepository<TaonECommerceOrderItemEntity> {
  entityClassResolveFn: () => typeof TaonECommerceOrderItemEntity = () => TaonECommerceOrderItemEntity;

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