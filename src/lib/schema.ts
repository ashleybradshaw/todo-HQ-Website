import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { getPageProjects } from "@/lib/projects";

const PAGE_APP_CATEGORY: Record<string, string> = {
  RepDaily: "HealthApplication",
  ReadyGo: "SportsApplication",
  Contentic: "BusinessApplication",
};

const PAGE_APP_OS: Record<string, string> = {
  RepDaily: "iOS, Android, Web",
  ReadyGo: "iOS, Android, Web",
  Contentic: "Web",
};

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationGraph() {
  const applications = getPageProjects().map((project) => ({
    "@type": "SoftwareApplication" as const,
    name: project.name,
    applicationCategory:
      PAGE_APP_CATEGORY[project.name] ?? "BusinessApplication",
    operatingSystem: PAGE_APP_OS[project.name] ?? "Web",
    description: project.description,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        knowsAbout: [
          "Enterprise AI development",
          "Autonomous agents",
          "Multi-agent systems",
          "Custom backend factory",
          "Production SaaS architecture",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: `${SITE_NAME} software factory`,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        provider: { "@id": `${SITE_URL}/#organization` },
        description: SITE_DESCRIPTION,
        serviceType: [
          "AI workflow architecture",
          "Autonomous agentic workflows",
          "Multi-agent ecosystems",
          "Full-stack application development",
          "Scalable backend engineering",
        ],
        areaServed: "Worldwide",
        audience: {
          "@type": "Audience",
          audienceType:
            "Product leads, engineering leads, and technical founders evaluating AI workflow architecture",
        },
      },
      ...applications,
    ],
  };
}

export function contactPageGraph() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Book ${SITE_NAME}`,
    url: `${SITE_URL}/book`,
    description:
      "Contact //TODO Engineering about AI workflow architecture or production application work.",
    email: CONTACT_EMAIL,
    isPartOf: { "@id": `${SITE_URL}/#organization` },
  };
}
