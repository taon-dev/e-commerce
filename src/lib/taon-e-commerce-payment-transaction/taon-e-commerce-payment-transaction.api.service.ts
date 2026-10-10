//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
import { TaonECommercePaymentTransactionController } from './taon-e-commerce-payment-transaction.controller';
//#endregion

@Injectable()
export class TaonECommercePaymentTransactionApiService extends TaonBaseAngularService {
  public readonly taonECommercePaymentTransactionController = this.injectController(TaonECommercePaymentTransactionController);

  public get allMyEntities$(): Observable<TaonECommercePaymentTransactionEntity[]> {
    return this.taonECommercePaymentTransactionController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommercePaymentTransactionController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}