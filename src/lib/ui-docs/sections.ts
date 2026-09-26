export type UiSectionId =
  | "readme"
  | "colors"
  | "type"
  | "spacing"
  | "motion"
  | "icons"
  | "components"
  | "rules";

export type UiSectionMeta = {
  id: UiSectionId;
  file: string;
  label: string;
  /** Tree indent for components/ children feel. */
  treeDepth: 0 | 1;
};

export const UI_SECTIONS: readonly UiSectionMeta[] = [
  { id: "readme", file: "README.md", label: "README", treeDepth: 0 },
  { id: "colors", file: "colors.css", label: "colours", treeDepth: 0 },
  { id: "type", file: "type.ts", label: "type", treeDepth: 0 },
  { id: "spacing", file: "spacing.css", label: "spacing", treeDepth: 0 },
  { id: "motion", file: "motion.css", label: "motion", treeDepth: 0 },
  { id: "icons", file: "icons.tsx", label: "icons", treeDepth: 0 },
  {
    id: "components",
    file: "components/",
    label: "components",
    treeDepth: 0,
  },
  { id: "rules", file: "rules.md", label: "rules", treeDepth: 0 },
] as const;

export function sectionById(id: UiSectionId): UiSectionMeta {
  const found = UI_SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown UI section: ${id}`);
  return found;
}
