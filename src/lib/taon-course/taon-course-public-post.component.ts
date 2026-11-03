import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { TaonCmsContentApiService } from '@taon-dev/cms/src';
import type { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { TaonCmsPostComponent } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course-public-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonCmsPostComponent],
  providers: [TaonCmsContentApiService],
  template: `
    <main class="taon-public-post">
      @if (loading()) {
        <p role="status">{{ t.gettext('Loading post...') }}</p>
      } @else if (error()) {
        <p role="alert">{{ error() }}</p>
      } @else if (post(); as currentPost) {
        <taon-cms-post [post]="currentPost" mode="view-clean" />
      } @else {
        <p role="status">{{ t.gettext('The post was not found.') }}</p>
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }
    .taon-public-post { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
  `],
})
export class TaonCoursePublicPostComponent {
  readonly t = t.for(this);

  readonly slug = input.required<string>();

  private readonly contentApi = inject(TaonCmsContentApiService);

  readonly post = signal<TaonCmsContentEntity | null>(null);

  readonly loading = signal(false);

  readonly error = signal('');

  constructor() {
    effect(onCleanup => {
      const slug = this.slug();
      let active = true;
      onCleanup(() => { active = false; });
      this.loading.set(true);
      this.error.set('');
      this.post.set(null);
      void this.contentApi.getPublicBySlug(slug).then(post => {
        if (active) {
          this.post.set(post);
        }
      }).catch((error: unknown) => {
        console.error('[taon-public-post] Unable to load post', error);
        if (active) {
          this.error.set(
            error instanceof Error
              ? error.message
              : this.t.gettext('The post could not be loaded.'),
          );
        }
      }).finally(() => {
        if (active) {
          this.loading.set(false);
        }
      });
    });
  }
}
