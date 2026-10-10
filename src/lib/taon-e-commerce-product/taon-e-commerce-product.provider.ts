//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonECommerceProductConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonECommerceProductProvider',
})
export class TaonECommerceProductProvider extends TaonBaseProvider {
  enabledTaonECommerceProductOption: boolean = true;
  config = new TaonTaonECommerceProductConfig();
  clone() {
    return {
      enabledTaonECommerceProductOption: this.enabledTaonECommerceProductOption,
      config: this.config.clone(),
    };
  }
}