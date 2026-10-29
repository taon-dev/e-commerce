//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import type { Translation } from '@taon-dev/i18n/src';

import { TaonECommerceProductPermissionEntity } from '../taon-e-commerce-product-permission/taon-e-commerce-product-permission.entity';
import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommerceProductRepository',
})
export class TaonECommerceProductRepository extends TaonBaseRepository<TaonECommerceProductEntity> {
  entityClassResolveFn: () => typeof TaonECommerceProductEntity = () => TaonECommerceProductEntity;

  private duplicationQueue: Promise<unknown> = Promise.resolve();

  /** Copies stored settings and assignments, without reassigning purchase history. */
  async duplicate(
    productId: number,
    t: Pick<Translation, 'gettext'>,
  ): Promise<TaonECommerceProductEntity> {
    //#region @websqlFunc
    const duplicateProduct = () => this.connection.transaction('SERIALIZABLE', async manager => {
      const products = manager.getRepository(TaonECommerceProductEntity);
      const original = await products.findOne({
        where: { id: productId },
        relations: { cmsContent: true, suggestedGroups: true, permissions: true },
      });
      if (!original) {
        throw new Error(t.gettext('The product was not found.'));
      }

      const suffix = / COPY(\d+)$/.exec(original.name);
      const baseName = suffix
        ? original.name.slice(0, suffix.index)
        : original.name;
      const names = new Set(
        (await products.find({ select: { name: true } })).map(product => product.name),
      );
      let copyNumber = suffix ? BigInt(suffix[1]) + 1n : 1n;
      let name = `${baseName} COPY${copyNumber}`;
      while (names.has(name)) {
        name = `${baseName} COPY${++copyNumber}`;
      }
      if (name.length > 500) {
        throw new Error(t.gettext('The duplicated product name exceeds 500 characters.'));
      }

      const duplicate = products.create({
        ...original,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        permissions: undefined,
        cartItems: undefined,
        orderItems: undefined,
        purchaseEligibility: undefined,
        name,
      });
      const saved = await products.save(duplicate);
      const permissions = manager.getRepository(TaonECommerceProductPermissionEntity);
      saved.permissions = await permissions.save(
        original.permissions.map(link =>
          permissions.create({
            productId: saved.id,
            permissionId: link.permissionId,
          }),
        ),
      );
      return saved;
    });
    // WebSQL shares a connection, so concurrent copies must not use nested transactions.
    const result = this.duplicationQueue.then(duplicateProduct, duplicateProduct);
    this.duplicationQueue = result;
    return result;
    //#endregion
  }

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