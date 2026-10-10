//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonECommerceProductPermissionConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonECommerceProductPermissionProvider',
})
export class TaonECommerceProductPermissionProvider extends TaonBaseProvider {
  enabledTaonECommerceProductPermissionOption: boolean = true;
  config = new TaonTaonECommerceProductPermissionConfig();
  clone() {
    return {
      enabledTaonECommerceProductPermissionOption: this.enabledTaonECommerceProductPermissionOption,
      config: this.config.clone(),
    };
  }
}