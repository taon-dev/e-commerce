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

import { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
import { TaonECommerceOrderRepository } from './taon-e-commerce-order.repository';
//#endregion

@TaonController<TaonECommerceOrderController>({
  className: 'TaonECommerceOrderController',
  // allowedMethods: []
})
export class TaonECommerceOrderController extends TaonBaseCrudController<
  TaonECommerceOrderEntity,
  {
    /* file upload query params type */
  },
  TaonECommerceOrderController
> {
  entityClassResolveFn: () => typeof TaonECommerceOrderEntity = () => TaonECommerceOrderEntity;

  private readonly taonECommerceOrderRepository = this.injectCustomRepo(TaonECommerceOrderRepository);

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
        await this.taonECommerceOrderRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceOrderController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}