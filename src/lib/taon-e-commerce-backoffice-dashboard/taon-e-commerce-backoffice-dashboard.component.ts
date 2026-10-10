//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-e-commerce-backoffice-dashboard',
  templateUrl: './taon-e-commerce-backoffice-dashboard.component.html',
  styleUrls: ['./taon-e-commerce-backoffice-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonECommerceBackofficeDashboardComponent {}