"use client";

import {
  Bell,
  Briefcase,
  Check,
  House,
  Languages,
  Mail,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { MetricChips } from "@/components/ui-docs/spec/MetricChips";
import { SpecSection } from "@/components/ui-docs/spec/SpecSection";
import { uiPage } from "@/content/pages/ui";

const SIZES = [
  { px: 16, label: "16" },
  { px: 20, label: "20" },
  { px: 24, label: "24" },
] as const;

export function IconographySpec() {
  const { icons } = uiPage.sections;

  return (
    <SpecSection
      id="ui-icons"
      eyebrow={icons.eyebrow}
      metric={icons.metric}
      title={icons.title}
      description={icons.description}
    >
      <div className="flex min-w-0 flex-col gap-6">
        {SIZES.map((size) => (
          <div key={size.label} className="min-w-0 space-y-3">
            <MetricChips
              name={`size ${size.label}`}
              values={["stroke 1.5", `box ${size.label}`]}
            />
            <ul className="flex min-w-0 flex-wrap gap-3 text-foreground">
              <li aria-label="Mail">
                <Mail size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
              <li aria-label="Bell">
                <Bell size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
              <li aria-label="House">
                <House size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
              <li aria-label="Briefcase">
                <Briefcase size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
              <li aria-label="Shield check">
                <ShieldCheck
                  size={size.px}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </li>
              <li aria-label="Shield alert">
                <ShieldAlert
                  size={size.px}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </li>
              <li aria-label="Settings">
                <Settings size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
              <li aria-label="Check">
                <Check size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
              <li aria-label="Languages">
                <Languages
                  size={size.px}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </li>
              <li aria-label="Wallet">
                <Wallet size={size.px} strokeWidth={1.5} aria-hidden="true" />
              </li>
            </ul>
          </div>
        ))}
      </div>
    </SpecSection>
  );
}
