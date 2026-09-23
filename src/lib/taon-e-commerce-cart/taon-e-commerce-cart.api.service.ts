//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
import { TaonECommerceCartController } from './taon-e-commerce-cart.controller';
//#endregion

@Injectable()
export class TaonECommerceCartApiService extends TaonBaseAngularService {
  private taonECommerceCartController = this.injectController(TaonECommerceCartController);

  public get allMyEntities$(): Observable<TaonECommerceCartEntity[]> {
    return this.taonECommerceCartController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceCartController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}