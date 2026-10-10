//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonECommercePaymentTransactionConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonECommercePaymentTransactionProvider',
})
export class TaonECommercePaymentTransactionProvider extends TaonBaseProvider {
  enabledTaonECommercePaymentTransactionOption: boolean = true;
  config = new TaonTaonECommercePaymentTransactionConfig();
  clone() {
    return {
      enabledTaonECommercePaymentTransactionOption: this.enabledTaonECommercePaymentTransactionOption,
      config: this.config.clone(),
    };
  }
}