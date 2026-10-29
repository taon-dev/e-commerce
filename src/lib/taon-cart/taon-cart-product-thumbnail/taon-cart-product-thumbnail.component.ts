import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { defaultThumbnailUrl } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonECommerceCustomerApiService } from '../../taon-e-commerce-customer/taon-e-commerce-customer.api.service';
import type { TaonECommerceProductEntity } from '../../taon-e-commerce-product/taon-e-commerce-product.entity';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-cart-product-thumbnail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TaonECommerceCustomerApiService],
  templateUrl: './taon-cart-product-thumbnail.component.html',
  styleUrl: './taon-cart-product-thumbnail.component.scss',
})
export class TaonCartProductThumbnailComponent {
  t = t.for(this);

  readonly product = input.required<TaonECommerceProductEntity>();

  readonly maxHeight = input(100);

  readonly url = signal('');

  readonly error = signal('');

  private readonly api = inject(TaonECommerceCustomerApiService);

  constructor() {
    effect(onCleanup => {
      const product = this.product();
      const post = product.cmsContent;
      let active = true;
      onCleanup(() => {
        active = false;
      });
      this.url.set('');
      this.error.set('');
      if (!post?.thumbnailKey) {
        return;
      }
      const placeholder = defaultThumbnailUrl(post.thumbnailKey);
      if (placeholder) {
        this.url.set(placeholder);
        return;
      }
      void this.api.controller.getProductThumbnail(product.id).request!()
        .then(response => {
          if (response.statusCode >= 400 || !response.body?.text) {
            throw new Error(
              response.responseText ||
                this.t.gettext('The product thumbnail could not be loaded.'),
            );
          }
          if (active) {
            this.url.set(response.body.text);
          }
        })
        .catch((error: unknown) => {
          console.error('[taon-cart] Unable to load post thumbnail', error);
          if (active) {
            this.error.set(this.t.gettext('Thumbnail unavailable.'));
          }
        });
    });
  }

  imageFailed(): void {
    console.error('[taon-cart] Unable to display post thumbnail');
    this.url.set('');
    this.error.set(this.t.gettext('Thumbnail unavailable.'));
  }
}
