import {
  CONTACT_EMAIL,
  CONTENT_BYLINE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL,
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

export function breadcrumbGraph(
  items: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function organizationGraph() {
  const sameAs = [SOCIAL.x].filter((url) => url.length > 0);
  const applications = getPageProjects().map((project) => {
    const operatingSystem = PAGE_APP_OS[project.name];
    return {
      "@type": "SoftwareApplication" as const,
      name: project.name,
      applicationCategory:
        PAGE_APP_CATEGORY[project.name] ?? "BusinessApplication",
      ...(project.status === "building" || !operatingSystem
        ? {}
        : { operatingSystem }),
      description: project.description,
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/logo.png`,
          width: 512,
          height: 512,
        },
        email: CONTACT_EMAIL,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        description: SITE_DESCRIPTION,
        knowsAbout: [
          "Custom software development",
          "AI engineering",
          "Design engineering",
          "Hardware-connected apps",
          "CMS development",
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#content-team`,
        name: CONTENT_BYLINE,
        url: SITE_URL,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-GB",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: `${SITE_NAME} design and AI engineering studio`,
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
    name: `Book a call · ${SITE_NAME}`,
    url: `${SITE_URL}/book`,
    description:
      "Contact //TODO Engineering about AI workflow architecture or production application work.",
    email: CONTACT_EMAIL,
    isPartOf: { "@id": `${SITE_URL}/#organization` },
  };
}
