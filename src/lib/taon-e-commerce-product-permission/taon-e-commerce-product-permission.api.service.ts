//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
import { TaonECommerceProductPermissionController } from './taon-e-commerce-product-permission.controller';
//#endregion

@Injectable()
export class TaonECommerceProductPermissionApiService extends TaonBaseAngularService {
  public readonly taonECommerceProductPermissionController = this.injectController(TaonECommerceProductPermissionController);

  public get allMyEntities$(): Observable<TaonECommerceProductPermissionEntity[]> {
    return this.taonECommerceProductPermissionController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceProductPermissionController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}