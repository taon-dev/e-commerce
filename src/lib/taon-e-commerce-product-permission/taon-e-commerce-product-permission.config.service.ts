//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceProductPermissionProvider } from './taon-e-commerce-product-permission.provider';
//#endregion

@Injectable()
export class TaonECommerceProductPermissionConfigService extends TaonBaseAngularService {
  private taonECommerceProductPermissionProvider = this.injectProvider(TaonECommerceProductPermissionProvider);

  get isEnableOption() {
    return this.taonECommerceProductPermissionProvider.enabledTaonECommerceProductPermissionOption;
  }

  clone(): Partial<TaonECommerceProductPermissionProvider> {
    const cloned = this.taonECommerceProductPermissionProvider.clone();
    return cloned;
  }
}