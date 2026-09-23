//#region imports
import { Taon, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonProvider({
  className: 'TaonECommerceProductProvider',
})
export class TaonECommerceProductProvider extends TaonBaseProvider {
  enabledTaonECommerceProductOption: boolean = true;
}