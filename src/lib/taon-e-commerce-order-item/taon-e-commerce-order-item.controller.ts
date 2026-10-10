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

import { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
import { TaonECommerceOrderItemRepository } from './taon-e-commerce-order-item.repository';
//#endregion

@TaonController<TaonECommerceOrderItemController>({
  className: 'TaonECommerceOrderItemController',
  // allowedMethods: []
})
export class TaonECommerceOrderItemController extends TaonBaseCrudController<
  TaonECommerceOrderItemEntity,
  {
    /* file upload query params type */
  },
  TaonECommerceOrderItemController
> {
  entityClassResolveFn: () => typeof TaonECommerceOrderItemEntity = () => TaonECommerceOrderItemEntity;

  private readonly taonECommerceOrderItemRepository = this.injectCustomRepo(TaonECommerceOrderItemRepository);

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
        await this.taonECommerceOrderItemRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceOrderItemController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}