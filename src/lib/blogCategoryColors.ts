import {
  fitHueAgainstBackground,
  hexToHsl,
  mixHex,
  type AccessibleColorPair,
} from "@/lib/accessibleColorPair";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_HUES,
  type BlogCategory,
} from "@/lib/blog-shared";

export function blogCategoryColors(
  pair: AccessibleColorPair,
): Record<BlogCategory, string> {
  const canvas = hexToHsl(pair.bg);
  const preferredLightness = canvas.l > 50 ? 40 : 70;
  // Fit against IDE chrome (8% text on canvas), not the flat page, so small
  // category labels still clear AA on tinted article chrome.
  const surface = mixHex(pair.text, pair.bg, 0.08);
  const colors = {} as Record<BlogCategory, string>;

  for (const category of BLOG_CATEGORIES) {
    colors[category] = fitHueAgainstBackground(
      surface,
      BLOG_CATEGORY_HUES[category],
      68,
      preferredLightness,
    );
  }

  return colors;
}
