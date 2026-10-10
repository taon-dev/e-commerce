//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-e-commerce-payment-transactions-backoffice',
  templateUrl: './taon-e-commerce-payment-transactions-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-payment-transactions-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonECommercePaymentTransactionsBackofficeComponent {}