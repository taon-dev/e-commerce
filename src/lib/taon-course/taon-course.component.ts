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
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TaonCmsPostComponent } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import type { TaonAuthContextEntity } from '@taon-dev/session/src';
import { Taon } from 'taon/src';

import { TaonCourseApiService } from './taon-course-api.service';
import { TaonCourseMediaDirective } from './taon-course-media.directive';
import { TaonCourseRowComponent } from './taon-course-row/taon-course-row.component';
import { TAON_COURSE_IN_TABS } from './taon-course-tabs.token';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatButtonModule, TaonCmsPostComponent, TaonCourseRowComponent, TaonCourseMediaDirective],
  providers: [TaonCourseApiService],
  templateUrl: './taon-course.component.html',
  styleUrl: './taon-course.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TaonCourseComponent {
  readonly t = t.for(this);

  readonly publicCoursePostSlug = input.required<string>();

  readonly privateCoursePostSlug = input('');

  readonly context = input<TaonAuthContextEntity | null | undefined>(undefined);

  readonly inTabs = inject(TAON_COURSE_IN_TABS, { optional: true }) ?? false;

  readonly content = viewChild.required<TemplateRef<unknown>>('courseContent');

  readonly mediaError = signal(false);

  private readonly api = inject(TaonCourseApiService);

  private readonly reload = signal(0);

  private readonly requestKey = computed(() => ({
    publicSlug: this.publicCoursePostSlug(),
    privateSlug: this.privateCoursePostSlug(),
    context: this.context(),
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
      let active = true;
      onCleanup(() => { active = false; });
      void this.api.load(key.publicSlug, key.privateSlug).then(data => {
        if (active) {
          this.result.set({ key, data });
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
}
