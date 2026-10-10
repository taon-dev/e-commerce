//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
import { TaonECommercePaymentTransactionRepository } from './taon-e-commerce-payment-transaction.repository';
//#endregion

@TaonController<TaonECommercePaymentTransactionController>({
  className: 'TaonECommercePaymentTransactionController',
  // allowedMethods: []
})
export class TaonECommercePaymentTransactionController extends TaonBaseCrudController<
  TaonECommercePaymentTransactionEntity,
  {
    /* file upload query params type */
  },
  TaonECommercePaymentTransactionController
> {
  entityClassResolveFn: () => typeof TaonECommercePaymentTransactionEntity = () => TaonECommercePaymentTransactionEntity;

  private readonly taonECommercePaymentTransactionRepository = this.injectCustomRepo(TaonECommercePaymentTransactionRepository);

  //#region methods & getters / hello world
  /**
   * TODO remove this demo example method
   */
  @GET()
  helloWord(@Query('yourName') yourName: string): Taon.Response<string> {
    //#region @websqlFunc
    return async (req, res) => {
      const numOfEntities = await this.db.count();
      const numberOfEvenEntities =
        await this.taonECommercePaymentTransactionRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommercePaymentTransactionController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}