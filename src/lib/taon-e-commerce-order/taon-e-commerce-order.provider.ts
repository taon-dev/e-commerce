//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonECommerceOrderConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonECommerceOrderProvider',
})
export class TaonECommerceOrderProvider extends TaonBaseProvider {
  enabledTaonECommerceOrderOption: boolean = true;
  config = new TaonTaonECommerceOrderConfig();
  clone() {
    return {
      enabledTaonECommerceOrderOption: this.enabledTaonECommerceOrderOption,
      config: this.config.clone(),
    };
  }
}