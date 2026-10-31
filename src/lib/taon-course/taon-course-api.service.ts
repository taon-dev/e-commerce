import { Injectable } from '@angular/core';
import { TaonBaseAngularService } from 'taon/src';

import { TaonCourseController, TaonCourseResponse } from './taon-course.controller';

@Injectable()
export class TaonCourseApiService extends TaonBaseAngularService {
  private readonly controller = this.injectController(TaonCourseController);

  async load(publicSlug: string, privateSlug: string): Promise<TaonCourseResponse> {
    const response = await this.controller.getCourse(publicSlug, privateSlug).request!();
    if (response.statusCode >= 400 || !response.body?.json?.post) {
      throw new Error(response.responseText || 'The course could not be loaded.');
    }
    return response.body.json;
  }
}
