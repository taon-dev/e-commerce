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

import { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
import { TaonECommerceProductPermissionRepository } from './taon-e-commerce-product-permission.repository';
//#endregion

@TaonController<TaonECommerceProductPermissionController>({
  className: 'TaonECommerceProductPermissionController',
  // allowedMethods: []
})
export class TaonECommerceProductPermissionController extends TaonBaseCrudController<
  TaonECommerceProductPermissionEntity,
  {
    /* file upload query params type */
  },
  TaonECommerceProductPermissionController
> {
  entityClassResolveFn: () => typeof TaonECommerceProductPermissionEntity = () => TaonECommerceProductPermissionEntity;

  private readonly taonECommerceProductPermissionRepository = this.injectCustomRepo(TaonECommerceProductPermissionRepository);

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
        await this.taonECommerceProductPermissionRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceProductPermissionController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}