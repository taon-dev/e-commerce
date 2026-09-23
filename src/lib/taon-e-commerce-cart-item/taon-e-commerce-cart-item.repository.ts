//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCartItemRepository',
})
export class TaonECommerceCartItemRepository extends TaonBaseRepository<TaonECommerceCartItemEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCartItemEntity = () => TaonECommerceCartItemEntity;

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