//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
import { TaonECommerceOrderController } from './taon-e-commerce-order.controller';
//#endregion

@Injectable()
export class TaonECommerceOrderApiService extends TaonBaseAngularService {
  public readonly taonECommerceOrderController = this.injectController(TaonECommerceOrderController);

  public get allMyEntities$(): Observable<TaonECommerceOrderEntity[]> {
    return this.taonECommerceOrderController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceOrderController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}