import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TaonCmsPostComponent } from '@taon-dev/cms/src';
import type { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';
import { TaonCourseMediaDirective } from '../taon-course-media.directive';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course-post-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    TaonCmsPostComponent,
    TaonCourseMediaDirective,
  ],
  templateUrl: './taon-course-post-dialog.component.html',
  styleUrl: './taon-course-post-dialog.component.scss',
})
export class TaonCoursePostDialogComponent {
  readonly t = t.for(this);
  readonly post = inject<TaonCmsContentEntity>(MAT_DIALOG_DATA);
  readonly mediaFailed = signal(false);
  readonly hasMedia = !!(
    this.post.videoKey ||
    this.post.audioKey ||
    this.post.attachmentKey
  );
  readonly hasVideo = this.post.type === 'video' && !!this.post.videoKey;
}
