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

import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { TaonECommerceProductRepository } from './taon-e-commerce-product.repository';
//#endregion

@TaonController<TaonECommerceProductController>({
  className: 'TaonECommerceProductController',
})
export class TaonECommerceProductController extends TaonBaseCrudController<TaonECommerceProductEntity> {
  entityClassResolveFn: () => typeof TaonECommerceProductEntity = () => TaonECommerceProductEntity;

  taonECommerceProductRepository = this.injectCustomRepo(TaonECommerceProductRepository);

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
        await this.taonECommerceProductRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceProductController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}