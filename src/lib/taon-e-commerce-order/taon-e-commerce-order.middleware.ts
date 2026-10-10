//#region imports
import { Taon, TaonBaseMiddleware, TaonMiddleware } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonMiddleware({
  className: 'TaonECommerceOrderMiddleware',
})
export class TaonECommerceOrderMiddleware extends TaonBaseMiddleware {}