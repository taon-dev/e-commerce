//#region imports
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import type { TaonStripeSyncResult } from '../taon-stripe/taon-stripe.models';

import { TaonECommerceProductApiService } from './taon-e-commerce-product.api.service';
import type { TaonECommerceStripeConfiguration } from './taon-e-commerce-product.api.service';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-e-commerce-stripe-sync-dialog',
  template: `
    <h2 mat-dialog-title>{{ t.gettext('Sync products with Stripe') }}</h2>
    <mat-dialog-content>
      @if (loadingConfiguration()) {
        <p role="status">{{ t.gettext('Checking Stripe connection...') }}</p>
      } @else {
        <p [class.connected]="configuration()?.connected" [class.disconnected]="!configuration()?.connected">
          <span aria-hidden="true">{{ configuration()?.connected ? '●' : '●' }}</span>
          {{ configuration()?.message }}
        </p>
        @if (configuration()?.webhookUrl) {
          <div class="webhook-url">
            <strong>{{ t.gettext('Stripe webhook URL:') }}</strong>
            <code>{{ configuration()?.webhookUrl }}</code>
            <button mat-button type="button" (click)="copyWebhookUrl()">{{ t.gettext('Copy') }}</button>
          </div>
        }
      }
      @if (syncing()) {
        <p role="status">{{ t.gettext('Synchronizing products with Stripe...') }}</p>
      }
      @if (results().length) {
        <p role="status">
          {{ t.gettext('Synchronization finished: [[ succeeded ]] succeeded, [[ failed ]] failed.', { succeeded: successfulCount(), failed: results().length - successfulCount() }) }}
        </p>
        <ul>
          @for (result of results(); track result.productId) {
            <li [class.sync-failed]="!result.success">
              {{ result.success
                ? t.gettext('[[ productName ]]: synchronized', { productName: result.productName })
                : t.gettext('[[ productName ]]: [[ error ]]', { productName: result.productName, error: result.error }) }}
            </li>
          }
        </ul>
      }
      @if (error()) {
        <p role="alert" class="sync-failed">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [disabled]="syncing()" (click)="close()">{{ t.gettext('Cancel / Close') }}</button>
      <button
        mat-flat-button
        type="button"
        [disabled]="loadingConfiguration() || !configuration()?.connected || syncing()"
        (click)="start()">
        {{ syncing() ? t.gettext('Syncing...') : t.gettext('Start') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .connected { color: #188038; }
      .disconnected, .sync-failed { color: #b3261e; }
      .webhook-url { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; }
      .webhook-url strong { grid-column: 1 / -1; }
      .webhook-url code { overflow-wrap: anywhere; }
      ul { padding-inline-start: 1.25rem; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  providers: [TaonECommerceProductApiService],
})
export class TaonECommerceStripeSyncDialogComponent {
  readonly t = t.for(this);

  private readonly api = inject(TaonECommerceProductApiService);

  private readonly dialogRef = inject(
    MatDialogRef<TaonECommerceStripeSyncDialogComponent>,
  );

  readonly loadingConfiguration = signal(true);

  readonly syncing = signal(false);

  readonly configuration = signal<TaonECommerceStripeConfiguration | null>(null);

  readonly results = signal<TaonStripeSyncResult[]>([]);

  readonly error = signal('');

  constructor() {
    void this.loadConfiguration();
  }

  successfulCount(): number {
    return this.results().filter(result => result.success).length;
  }

  close(): void {
    this.dialogRef.close(this.results());
  }

  async copyWebhookUrl(): Promise<void> {
    const url = this.configuration()?.webhookUrl;
    if (!url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('[taon-e-commerce-stripe-sync] Unable to copy webhook URL', error);
      this.error.set(this.t.gettext('Unable to copy the webhook URL. Select and copy it manually.'));
    }
  }

  async start(): Promise<void> {
    if (this.syncing() || !this.configuration()?.connected) {
      return;
    }
    this.syncing.set(true);
    this.error.set('');
    this.results.set([]);
    try {
      this.results.set(await this.api.syncWithStripe(crypto.randomUUID()));
    } catch (error) {
      console.error('[taon-e-commerce-stripe-sync] Synchronization failed', error);
      this.error.set(
        error instanceof Error ? error.message : this.t.gettext('Stripe synchronization failed.'),
      );
    } finally {
      this.syncing.set(false);
    }
  }

  private async loadConfiguration(): Promise<void> {
    this.loadingConfiguration.set(true);
    this.error.set('');
    try {
      this.configuration.set(await this.api.getStripeConfiguration());
    } catch (error) {
      console.error('[taon-e-commerce-stripe-sync] Unable to check Stripe', error);
      this.configuration.set({
        connected: false,
        message: error instanceof Error ? error.message : this.t.gettext('Unable to connect to Stripe.'),
        webhookUrl: '',
      });
    } finally {
      this.loadingConfiguration.set(false);
    }
  }
}
