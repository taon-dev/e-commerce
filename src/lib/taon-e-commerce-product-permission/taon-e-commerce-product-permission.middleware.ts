//#region imports
import { Taon, TaonBaseMiddleware, TaonMiddleware } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonMiddleware({
  className: 'TaonECommerceProductPermissionMiddleware',
})
export class TaonECommerceProductPermissionMiddleware extends TaonBaseMiddleware {}