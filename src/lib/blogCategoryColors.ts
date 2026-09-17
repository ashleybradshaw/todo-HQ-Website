import {
  fitHueAgainstBackground,
  hexToHsl,
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
  const colors = {} as Record<BlogCategory, string>;

  for (const category of BLOG_CATEGORIES) {
    colors[category] = fitHueAgainstBackground(
      pair.bg,
      BLOG_CATEGORY_HUES[category],
      68,
      preferredLightness,
    );
  }

  return colors;
}
