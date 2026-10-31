import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({ selector: '[taonCourseMedia]' })
export class TaonCourseMediaDirective {
  readonly mediaFailed = output<void>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const failed = (event: Event): void => {
      const target = event.target;
      if (target instanceof Element &&
          ['VIDEO', 'AUDIO', 'IMG'].includes(target.tagName)) {
        console.error('[taon-course] Unable to load post media');
        this.mediaFailed.emit();
      }
    };
    // Native media/image errors do not bubble out of the CMS renderer.
    element.addEventListener('error', failed, true);
    inject(DestroyRef).onDestroy(() => element.removeEventListener('error', failed, true));
  }
}
