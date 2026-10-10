import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { TaonECommerceBackofficeSettingsApiService } from './taon-e-commerce-backoffice-settings.api.service';

@Component({
  selector: 'app-taon-e-commerce-backoffice-settings',
  templateUrl: './taon-e-commerce-backoffice-settings.component.html',
  styleUrls: ['./taon-e-commerce-backoffice-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  providers: [TaonECommerceBackofficeSettingsApiService],
})
export class TaonECommerceBackofficeSettingsComponent {
  private readonly api = inject(TaonECommerceBackofficeSettingsApiService);

  readonly sellingEnabled = signal<boolean | null>(null);

  readonly loading = signal(true);

  readonly saving = signal(false);

  readonly error = signal('');

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.sellingEnabled.set(await this.api.getSellingEnabled());
    } catch (error) {
      console.error(
        '[taon-e-commerce-settings] Unable to load the selling setting',
        error,
      );
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Unable to load the selling setting.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  async toggleSelling(): Promise<void> {
    const current = this.sellingEnabled();
    if (current === null || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.error.set('');
    try {
      this.sellingEnabled.set(await this.api.setSellingEnabled(!current));
    } catch (error) {
      console.error(
        '[taon-e-commerce-settings] Unable to update the selling setting',
        error,
      );
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Unable to update the selling setting.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
