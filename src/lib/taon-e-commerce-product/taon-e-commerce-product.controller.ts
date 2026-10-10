//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  POST,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { TaonECommerceProductRepository } from './taon-e-commerce-product.repository';
//#endregion

@TaonController<TaonECommerceProductController>({
  className: 'TaonECommerceProductController',
  allowedMethods: ['getAll', 'paginationQuery', 'save', 'updateById'],
})
export class TaonECommerceProductController extends TaonBaseCrudController<
  TaonECommerceProductEntity,
  {
    /* file upload query params type */
  },
  TaonECommerceProductController
> {
  entityClassResolveFn: () => typeof TaonECommerceProductEntity = () =>
    TaonECommerceProductEntity;

  private readonly taonECommerceProductRepository = this.injectCustomRepo(
    TaonECommerceProductRepository,
  );

  @POST()
  syncWithStripe(): Taon.Response<void> {
    return async () => {
      throw new Error(
        'Stripe synchronization is not configured for this project.',
      );
    };
  }

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
