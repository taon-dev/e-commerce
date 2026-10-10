//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceCustomerAddressDefaultsValues } from './taon-e-commerce-customer-address.constants';
//#endregion

@TaonEntity<TaonECommerceCustomerAddressEntity>({
  className: 'TaonECommerceCustomerAddressEntity',
  createTable: true,
  // defaultModelMapping: () => ({
  //   '': TaonECommerceCustomerAddressEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonECommerceCustomerAddressEntity extends TaonBaseAbstractEntity<TaonECommerceCustomerAddressEntity> {
 // TODO
}
