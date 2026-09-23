//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceCartRepository',
})
export class TaonECommerceCartRepository extends TaonBaseRepository<TaonECommerceCartEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCartEntity = () => TaonECommerceCartEntity;

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