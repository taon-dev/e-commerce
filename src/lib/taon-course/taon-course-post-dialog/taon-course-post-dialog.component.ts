import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaonCmsPostComponent } from '@taon-dev/cms/src';
import type { TaonCmsContentEntity } from '@taon-dev/cms/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course-post-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, TaonCmsPostComponent],
  templateUrl: './taon-course-post-dialog.component.html',
})
export class TaonCoursePostDialogComponent {
  readonly t = t.for(this);
  readonly post = inject<TaonCmsContentEntity>(MAT_DIALOG_DATA);
}
