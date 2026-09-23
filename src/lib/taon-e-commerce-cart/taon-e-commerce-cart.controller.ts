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

import { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
import { TaonECommerceCartRepository } from './taon-e-commerce-cart.repository';
//#endregion

@TaonController<TaonECommerceCartController>({
  className: 'TaonECommerceCartController',
  allowedMethods: []
})
export class TaonECommerceCartController extends TaonBaseCrudController<TaonECommerceCartEntity> {
  entityClassResolveFn: () => typeof TaonECommerceCartEntity = () => TaonECommerceCartEntity;

  taonECommerceCartRepository = this.injectCustomRepo(TaonECommerceCartRepository);

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
        await this.taonECommerceCartRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceCartController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}
