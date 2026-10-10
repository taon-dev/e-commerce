//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceProductPermissionRepository',
})
export class TaonECommerceProductPermissionRepository extends TaonBaseRepository<TaonECommerceProductPermissionEntity> {
  entityClassResolveFn: () => typeof TaonECommerceProductPermissionEntity = () => TaonECommerceProductPermissionEntity;

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