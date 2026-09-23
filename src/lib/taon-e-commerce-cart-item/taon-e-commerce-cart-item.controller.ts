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

import { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
import { TaonECommerceCartItemRepository } from './taon-e-commerce-cart-item.repository';
//#endregion

@TaonController<TaonECommerceCartItemController>({
  className: 'TaonECommerceCartItemController',
  allowedMethods: [],
})
export class TaonECommerceCartItemController extends TaonBaseCrudController<TaonECommerceCartItemEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCartItemEntity = () =>
    TaonECommerceCartItemEntity;

  taonECommerceCartItemRepository = this.injectCustomRepo(
    TaonECommerceCartItemRepository,
  );

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
        await this.taonECommerceCartItemRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceCartItemController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}
