import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TaonCmsPostComponent } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import type { TaonAuthContextEntity } from '@taon-dev/session/src';
import { Taon } from 'taon/src';

import { TaonCourseApiService } from './taon-course-api.service';
import { TaonECommerceCustomerApiService } from '../taon-e-commerce-customer/taon-e-commerce-customer.api.service';
import { TaonECommerceProductApiService } from '../taon-e-commerce-product/taon-e-commerce-product.api.service';
import { TaonCourseMediaDirective } from './taon-course-media.directive';
import { TaonCourseRowComponent } from './taon-course-row/taon-course-row.component';
import { TAON_COURSE_IN_TABS } from './taon-course-tabs.token';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatButtonModule, TaonCmsPostComponent, TaonCourseRowComponent, TaonCourseMediaDirective],
  providers: [
    TaonCourseApiService,
    TaonECommerceCustomerApiService,
    TaonECommerceProductApiService,
  ],
  templateUrl: './taon-course.component.html',
  styleUrl: './taon-course.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TaonCourseComponent {
  readonly t = t.for(this);

  readonly publicCoursePostSlug = input.required<string>();

  readonly privateCoursePostSlug = input('');

  readonly selectedBehavior = input<'accordion' | 'dialog'>('dialog');

  readonly context = input<TaonAuthContextEntity | null | undefined>(undefined);

  readonly productId = input<number | undefined>(undefined);

  readonly cartOpenRequested = output<void>();

  readonly inTabs = inject(TAON_COURSE_IN_TABS, { optional: true }) ?? false;

  readonly content = viewChild.required<TemplateRef<unknown>>('courseContent');

  readonly mediaError = signal(false);

  readonly productName = signal('');

  readonly purchaseError = signal('');

  readonly buying = signal(false);

  private readonly api = inject(TaonCourseApiService);

  private readonly products = inject(TaonECommerceProductApiService);

  private readonly customer = inject(TaonECommerceCustomerApiService);

  private readonly reload = signal(0);

  private readonly requestKey = computed(() => ({
    publicSlug: this.publicCoursePostSlug(),
    privateSlug: this.privateCoursePostSlug(),
    context: this.context(),
    productId: this.productId(),
    reload: this.reload(),
  }));

  private readonly result = signal<{
    key: ReturnType<typeof this.requestKey>;
    data?: Awaited<ReturnType<TaonCourseApiService['load']>>;
    error?: string;
  } | null>(null);

  // Invalidate synchronously on context changes, before the loading effect runs.
  readonly state = computed(() => {
    const result = this.result();
    return result?.key === this.requestKey() ? result : null;
  });

  readonly selectedPost = computed(() => this.state()?.data?.post ?? null);

  constructor() {
    effect(onCleanup => {
      const key = this.requestKey();
      this.mediaError.set(false);
      this.productName.set('');
      this.purchaseError.set('');
      let active = true;
      onCleanup(() => { active = false; });
      void this.api.load(key.publicSlug, key.privateSlug).then(data => {
        if (active) {
          this.result.set({ key, data });
        }
        const productId = key.productId;
        if (active && productId && Number.isSafeInteger(productId) && productId > 0) {
          void this.products.getPublicProductName(productId).then(product => {
            if (active) {
              this.productName.set(product.name);
            }
          }).catch((error: unknown) => {
            console.error('[taon-course] Unable to load course product', error);
            if (active) {
              this.purchaseError.set(this.t.gettext('The purchase option could not be loaded.'));
            }
          });
        }
      }).catch((error: unknown) => {
        console.error('[taon-course] Unable to load course', error);
        if (active) {
          this.result.set({ key, error: this.t.gettext('The course could not be loaded. Check its post slugs and your connection, then try again.') });
        }
      });
    });
  }

  refresh(): void {
    this.reload.update(value => value + 1);
  }

  async buyProduct(): Promise<void> {
    const productId = this.productId();
    if (!productId || this.buying()) {
      return;
    }
    if (!this.context()?.user) {
      this.purchaseError.set(
        this.t.gettext('Please sign in before adding this course to your cart.'),
      );
      return;
    }
    this.buying.set(true);
    this.purchaseError.set('');
    try {
      const response = await this.customer.controller
        .addToMyCart(productId, 1)
        .request!();
      if (response.statusCode >= 400) {
        throw new Error(response.responseText || this.t.gettext('The product could not be added to your cart.'));
      }
      this.cartOpenRequested.emit();
    } catch (error) {
      console.error('[taon-course] Unable to add product to cart', error);
      this.purchaseError.set(
        error instanceof Error
          ? error.message
          : this.t.gettext('The product could not be added to your cart.'),
      );
    } finally {
      this.buying.set(false);
    }
  }
}
