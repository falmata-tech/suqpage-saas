export const SHOWROOM_MOTION_INTENSITIES = [
  "quiet",
  "balanced",
  "expressive",
] as const;

export const SHOWROOM_DECORATIVE_DEPTHS = [
  "clean",
  "subtle",
  "signature",
] as const;

export const SHOWROOM_PREVIEW_DEVICES = ["responsive", "mobile"] as const;

export type ShowroomMotionIntensity =
  (typeof SHOWROOM_MOTION_INTENSITIES)[number];
export type ShowroomDecorativeDepth =
  (typeof SHOWROOM_DECORATIVE_DEPTHS)[number];
export type ShowroomPreviewDevice = (typeof SHOWROOM_PREVIEW_DEVICES)[number];

export type ShowroomExperienceSettings = {
  motionIntensity: ShowroomMotionIntensity;
  decorativeDepth: ShowroomDecorativeDepth;
};

export const DEFAULT_SHOWROOM_EXPERIENCE = Object.freeze({
  motionIntensity: "balanced",
  decorativeDepth: "subtle",
}) satisfies Readonly<ShowroomExperienceSettings>;
