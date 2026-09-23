//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceProductRepository',
})
export class TaonECommerceProductRepository extends TaonBaseRepository<TaonECommerceProductEntity> {
  entityClassResolveFn: () => typeof TaonECommerceProductEntity = () => TaonECommerceProductEntity;

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