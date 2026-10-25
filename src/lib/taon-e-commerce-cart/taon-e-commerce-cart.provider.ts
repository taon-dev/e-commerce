//#region imports
import { Taon, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonProvider({
  className: 'TaonECommerceCartProvider',
})
export class TaonECommerceCartProvider extends TaonBaseProvider {
  declare STRIPE_SECRET_KEY: string;

  declare STRIPE_WEBHOOK_SECRET_KEY: string;

}
