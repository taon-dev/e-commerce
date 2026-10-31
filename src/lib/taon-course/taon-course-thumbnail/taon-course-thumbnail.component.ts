import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  defaultThumbnailKey,
  defaultThumbnailUrl,
  TaonCmsContentApiService,
} from '@taon-dev/cms/src';
import type { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course-thumbnail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TaonCmsContentApiService],
  templateUrl: './taon-course-thumbnail.component.html',
  styleUrl: './taon-course-thumbnail.component.scss',
})
export class TaonCourseThumbnailComponent {
  readonly t = t.for(this);
  readonly post = input.required<TaonCmsContentEntity>();
  readonly url = signal('');
  readonly error = signal('');
  private readonly api = inject(TaonCmsContentApiService);

  constructor() {
    effect(onCleanup => {
      const post = this.post();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      this.url.set('');
      this.error.set('');
      const placeholder = defaultThumbnailUrl(
        post.thumbnailKey || defaultThumbnailKey(post.type),
      );
      if (placeholder) {
        this.url.set(placeholder);
        return;
      }
      // Follow the CMS renderer's public-first/private fallback.
      void this.api
        .getThumbnailLinkBySlug(post.slug, true)
        .catch(() => this.api.getThumbnailLinkBySlug(post.slug))
        .then(url => {
          if (!url) {
            throw new Error('Empty thumbnail URL.');
          }
          if (active) {
            this.url.set(url);
          }
        })
        .catch((error: unknown) => {
          console.error('[taon-course] Unable to load thumbnail', error);
          if (active) {
            this.error.set(this.t.gettext('Thumbnail unavailable.'));
          }
        });
    });
  }

  imageFailed(): void {
    console.error('[taon-course] Unable to display thumbnail');
    this.url.set('');
    this.error.set(this.t.gettext('Thumbnail unavailable.'));
  }
}
