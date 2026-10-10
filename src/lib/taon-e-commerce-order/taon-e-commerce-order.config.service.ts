//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceOrderProvider } from './taon-e-commerce-order.provider';
//#endregion

@Injectable()
export class TaonECommerceOrderConfigService extends TaonBaseAngularService {
  private taonECommerceOrderProvider = this.injectProvider(TaonECommerceOrderProvider);

  get isEnableOption() {
    return this.taonECommerceOrderProvider.enabledTaonECommerceOrderOption;
  }

  clone(): Partial<TaonECommerceOrderProvider> {
    const cloned = this.taonECommerceOrderProvider.clone();
    return cloned;
  }
}