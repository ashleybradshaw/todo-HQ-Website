import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationGraph() {
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
      {
        "@type": "SoftwareApplication",
        name: "RepDaily",
        applicationCategory: "HealthApplication",
        operatingSystem: "iOS, Android, Web",
        description:
          "Camera-based fitness tracking shipped through the //TODO internal software factory.",
      },
      {
        "@type": "SoftwareApplication",
        name: "ReadyGo",
        applicationCategory: "SportsApplication",
        operatingSystem: "iOS, Android, Web",
        description:
          "Pre-activity planning for runners and cyclists, designed and shipped with an integrated AI workflow stack.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Contentic",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Production content operations software from the //TODO factory roster.",
      },
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
