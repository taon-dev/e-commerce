//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommercePaymentTransactionProvider } from './taon-e-commerce-payment-transaction.provider';
//#endregion

@Injectable()
export class TaonECommercePaymentTransactionConfigService extends TaonBaseAngularService {
  private taonECommercePaymentTransactionProvider = this.injectProvider(TaonECommercePaymentTransactionProvider);

  get isEnableOption() {
    return this.taonECommercePaymentTransactionProvider.enabledTaonECommercePaymentTransactionOption;
  }

  clone(): Partial<TaonECommercePaymentTransactionProvider> {
    const cloned = this.taonECommercePaymentTransactionProvider.clone();
    return cloned;
  }
}