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

import { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
import { TaonECommerceCustomerAddressRepository } from './taon-e-commerce-customer-address.repository';
//#endregion

@TaonController<TaonECommerceCustomerAddressController>({
  className: 'TaonECommerceCustomerAddressController',
  // allowedMethods: []
})
export class TaonECommerceCustomerAddressController extends TaonBaseCrudController<
  TaonECommerceCustomerAddressEntity,
  {
    /* file upload query params type */
  },
  TaonECommerceCustomerAddressController
> {
  entityClassResolveFn: () => typeof TaonECommerceCustomerAddressEntity = () => TaonECommerceCustomerAddressEntity;

  private readonly taonECommerceCustomerAddressRepository = this.injectCustomRepo(TaonECommerceCustomerAddressRepository);

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
        await this.taonECommerceCustomerAddressRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonECommerceCustomerAddressController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}