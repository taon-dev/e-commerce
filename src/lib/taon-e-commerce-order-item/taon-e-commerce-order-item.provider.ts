//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonECommerceOrderItemConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonECommerceOrderItemProvider',
})
export class TaonECommerceOrderItemProvider extends TaonBaseProvider {
  enabledTaonECommerceOrderItemOption: boolean = true;
  config = new TaonTaonECommerceOrderItemConfig();
  clone() {
    return {
      enabledTaonECommerceOrderItemOption: this.enabledTaonECommerceOrderItemOption,
      config: this.config.clone(),
    };
  }
}