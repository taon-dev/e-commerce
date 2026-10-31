export const TaonCmsApplicationHook = {
  ABOUT_ME_SHORT: 'about-me-short',
  ABOUT_ME_LONG: 'about-me-long',
  TIMETABLE: 'timetable',
} as const;

export type TaonCmsApplicationHook =
  (typeof TaonCmsApplicationHook)[keyof typeof TaonCmsApplicationHook];
