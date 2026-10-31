import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  TaonCmsContentApiService,
  TaonCmsContentType,
  TaonCmsPostComponent,
} from '@taon-dev/cms/src';
import type { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonCourseMediaDirective } from '../taon-course-media.directive';
import { TaonCoursePostDialogComponent } from '../taon-course-post-dialog/taon-course-post-dialog.component';
import { TaonCourseThumbnailComponent } from '../taon-course-thumbnail/taon-course-thumbnail.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    TaonCmsPostComponent,
    TaonCourseThumbnailComponent,
    TaonCourseMediaDirective,
  ],
  providers: [TaonCmsContentApiService],
  templateUrl: './taon-course-row.component.html',
  styleUrl: './taon-course-row.component.scss',
})
export class TaonCourseRowComponent {
  readonly t = t.for(this);

  readonly post = input.required<TaonCmsContentEntity>();

  readonly expanded = signal(false);

  readonly busy = signal(false);

  readonly error = signal('');

  private readonly api = inject(TaonCmsContentApiService);

  private readonly dialog = inject(MatDialog);

  private readonly document = inject(DOCUMENT);

  private readonly destroyRef = inject(DestroyRef);

  private postDialog?: MatDialogRef<TaonCoursePostDialogComponent>;

  private request = 0;

  constructor() {
    effect(onCleanup => {
      this.post();
      this.expanded.set(false);
      this.busy.set(false);
      this.error.set('');
      onCleanup(() => {
        this.request++;
        this.postDialog?.close();
      });
    });
  }

  async open(): Promise<void> {
    const post = this.post();
    if (post.type === TaonCmsContentType.Normal) {
      this.postDialog?.close();
      this.postDialog = this.dialog.open(TaonCoursePostDialogComponent, {
        data: post,
        width: '900px',
        maxWidth: '96vw',
        maxHeight: '90dvh',
        ariaLabel: post.title,
      });
      return;
    }
    if (post.type !== TaonCmsContentType.Attachment) {
      this.error.set('');
      if (
        (post.type === TaonCmsContentType.Video && !post.videoKey) ||
        (post.type === TaonCmsContentType.Audio && !post.audioKey)
      ) {
        this.mediaFailed();
        return;
      }
      this.expanded.set(true);
      return;
    }
    if (this.busy()) {
      return;
    }
    const request = ++this.request;
    this.busy.set(true);
    this.error.set('');
    try {
      const url = await this.api
        .getPublicAttachmentLinkBySlug(post.slug)
        .catch(() => this.api.getAttachmentLinkBySlug(post.slug));
      if (!url) {
        throw new Error('Empty attachment URL.');
      }
      if (this.destroyRef.destroyed || request !== this.request) {
        return;
      }
      const link = this.document.createElement('a');
      link.href = url;
      link.download = '';
      link.click();
    } catch (error) {
      console.error('[taon-course] Unable to download attachment', error);
      if (!this.destroyRef.destroyed && request === this.request) {
        this.error.set(
          this.t.gettext(
            'The attachment could not be downloaded. Please try again.',
          ),
        );
      }
    } finally {
      if (!this.destroyRef.destroyed && request === this.request) {
        this.busy.set(false);
      }
    }
  }

  mediaFailed(): void {
    this.error.set(
      this.t.gettext(
        'The media could not be loaded. Close the player and try again.',
      ),
    );
  }
}
