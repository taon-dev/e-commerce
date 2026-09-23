//#region imports
import { Taon, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonProvider({
  className: 'TaonECommerceCartItemProvider',
})
export class TaonECommerceCartItemProvider extends TaonBaseProvider {
  enabledTaonECommerceCartItemOption: boolean = true;
}