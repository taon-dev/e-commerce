//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommercePaymentTransactionRepository',
})
export class TaonECommercePaymentTransactionRepository extends TaonBaseRepository<TaonECommercePaymentTransactionEntity> {
  entityClassResolveFn: () => typeof TaonECommercePaymentTransactionEntity = () => TaonECommercePaymentTransactionEntity;

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