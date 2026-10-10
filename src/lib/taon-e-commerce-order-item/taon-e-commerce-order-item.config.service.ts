//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceOrderItemProvider } from './taon-e-commerce-order-item.provider';
//#endregion

@Injectable()
export class TaonECommerceOrderItemConfigService extends TaonBaseAngularService {
  private taonECommerceOrderItemProvider = this.injectProvider(TaonECommerceOrderItemProvider);

  get isEnableOption() {
    return this.taonECommerceOrderItemProvider.enabledTaonECommerceOrderItemOption;
  }

  clone(): Partial<TaonECommerceOrderItemProvider> {
    const cloned = this.taonECommerceOrderItemProvider.clone();
    return cloned;
  }
}