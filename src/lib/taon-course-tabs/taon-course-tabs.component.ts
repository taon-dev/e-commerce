import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TAON_COURSE_IN_TABS } from '../taon-course/taon-course-tabs.token';
import { TaonCourseThumbnailComponent } from '../taon-course/taon-course-thumbnail/taon-course-thumbnail.component';
import { TaonCourseComponent } from '../taon-course/taon-course.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-course-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatTabsModule, TaonCourseThumbnailComponent],
  providers: [{ provide: TAON_COURSE_IN_TABS, useValue: true }],
  templateUrl: './taon-course-tabs.component.html',
  styleUrl: './taon-course-tabs.component.scss',
})
export class TaonCourseTabsComponent {
  readonly t = t.for(this);

  readonly courses = contentChildren(TaonCourseComponent);
}
