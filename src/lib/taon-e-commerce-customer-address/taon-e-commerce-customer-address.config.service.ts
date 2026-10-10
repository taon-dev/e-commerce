//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceCustomerAddressProvider } from './taon-e-commerce-customer-address.provider';
//#endregion

@Injectable()
export class TaonECommerceCustomerAddressConfigService extends TaonBaseAngularService {
  private taonECommerceCustomerAddressProvider = this.injectProvider(TaonECommerceCustomerAddressProvider);

  get isEnableOption() {
    return this.taonECommerceCustomerAddressProvider.enabledTaonECommerceCustomerAddressOption;
  }

  clone(): Partial<TaonECommerceCustomerAddressProvider> {
    const cloned = this.taonECommerceCustomerAddressProvider.clone();
    return cloned;
  }
}