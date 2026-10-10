//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-e-commerce-orders-backoffice',
  templateUrl: './taon-e-commerce-orders-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-orders-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonECommerceOrdersBackofficeComponent {}