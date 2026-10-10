//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonECommerceCustomerAddressConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonECommerceCustomerAddressProvider',
})
export class TaonECommerceCustomerAddressProvider extends TaonBaseProvider {
  enabledTaonECommerceCustomerAddressOption: boolean = true;
  config = new TaonTaonECommerceCustomerAddressConfig();
  clone() {
    return {
      enabledTaonECommerceCustomerAddressOption: this.enabledTaonECommerceCustomerAddressOption,
      config: this.config.clone(),
    };
  }
}