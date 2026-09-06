export type NavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type AppRosterItem = {
  id: string;
  name: string;
  status: string;
  description: string;
  href?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string[];
};

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  vat: string;
  duration: string;
  boxLabel: string;
  summary: string[];
  includes: string[];
  cta?: string;
  featured?: boolean;
  featuredLabel?: string;
};

export const siteData = {
  metadata: {
    title: "//TODO Engineering & Design",
    shortName: "//TODO",
    description:
      "//TODO is an engineering team shipping AI-driven applications, multi-agent backends, and automated development lifecycles.",
    email: "tech@todo.engineering",
    copyright: "© 2026 TODO Engineering & Design",
    url: "https://todo.engineering",
    social: [
      {
        label: "Email",
        href: "mailto:tech@todo.engineering",
      },
    ] satisfies SocialLink[],
  },

  nav: {
    items: [
      {
        id: "about",
        label: "{00001}[//About;]",
        href: "/#about",
        active: true,
      },
      {
        id: "work",
        label: "{00234}[//Work;]",
        href: "/#work",
      },
      {
        id: "book",
        label: "{16554}[//BookTeam;]",
        href: "/book",
      },
    ] satisfies NavItem[],
    spray: {
      label: "SPRAY",
      href: "#spray",
    },
  },

  about: {
    heading: "//WHAT;{TODO}",
    paragraphs: [
      "//TODO is an engineering team shipping AI-driven applications, multi-agent backends, and automated development lifecycles.",
      "We don’t just write code; we orchestrate the systems that write it. By leveraging multi-agent ecosystems and custom AI tooling, we automate the software development lifecycle.",
      "The result is faster shipping, scalable architecture, and a growing portfolio of in-house and client applications.",
    ],
  },

  roster: {
    heading: "//Work;{The App Roster}",
    subheading: "Shipped & Shipping",
    apps: [
      {
        id: "repdaily",
        name: "Repdaily",
        status: "Live on App Stores",
        description: "[Brief 1-sentence description].",
      },
      {
        id: "readygo",
        name: "ReadyGo",
        status: "In Active Development",
        description: "[Brief 1-sentence description].",
      },
      {
        id: "contentic",
        name: "Contentic",
        status: "Live",
        description: "AI Image Generation Web App.",
      },
      {
        id: "labs",
        name: "Labs / Pipeline",
        status: "Pipeline",
        description: "ERG Trainer, The Tower.",
      },
    ] satisfies AppRosterItem[],
    ctas: [
      { id: "repdaily", label: "Repdaily", href: "#work" },
      { id: "readygo", label: "ReadyGo", href: "#work" },
      { id: "contentic", label: "Contentic", href: "#work" },
    ],
  },

  faq: {
    heading: "We get asked a lot.",
    intro:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
    items: [
      {
        id: "build",
        question: "Can your team build for us?",
        answer: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
        ],
      },
      {
        id: "ownership",
        question: "Ownership and what does it mean",
        answer: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
        ],
      },
      {
        id: "nda",
        question: "NDA -  Transparent and Private",
        answer: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
        ],
      },
      {
        id: "payments",
        question: "How payments work",
        answer: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
        ],
      },
    ] satisfies FaqItem[],
  },

  pricing: {
    kicker: "Pricing",
    heading: "Unmistakable Costing. Agreed Upfront.",
    intro:
      "As you can see we have very fixed options, designed perfect to fit into your own business plan timelines. We are upfront with billings for product, service and aftercare.",
    socialProof:
      "Join 25+ founders who shipped their MVP projects in 2 weeks with TODO",
    endorsementsLabel: "Endorsements",
    cta: "Book a call",
    tiers: [
      {
        id: "benchmark-mvp",
        name: "Benchmark MVP",
        price: "£8,000",
        vat: "+ VAT",
        duration: "Two week Session Structure",
        boxLabel: "What’s in the box",
        summary: [
          "Shipped MVP, fully coded. (Handover - if required)",
          "Design and Development by our sprint team.",
          "Feedback loops and amendment sessions built in.",
        ],
        includes: [
          "Project management.",
          "Design sprint team.",
          "Engineer and development sprint team.",
        ],
        cta: "Book a call",
      },
      {
        id: "enlarged-mvp",
        name: "Enlarged MVP",
        price: "£16,000",
        vat: "+ VAT",
        duration: "three week Session Structure",
        boxLabel: "What’s in the box",
        featured: true,
        featuredLabel: "Most used this year",
        summary: [
          "Shipped MVP, fully coded + Handover documentation.",
          "Feedback loops and amendment sessions built in.",
          "Two full solid week of development time.",
          "One full solid week amendment management.",
        ],
        includes: [
          "Assigned Project Lead + Stakeholder feedback.",
          "Full Design sprint team.",
          "Extra Engineer and Development sprint team.",
        ],
        cta: "Book a call",
      },
      {
        id: "multi-service",
        name: "Multi-Service MVP (end to end)",
        price: "£40,000",
        vat: "+ VAT",
        duration: "Two month Session Structure",
        boxLabel: "What’s in the box - Full squad",
        summary: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
        ],
        includes: [],
        cta: "Book a call",
      },
      {
        id: "aftercare",
        name: "Aftercare & Service",
        price: "£100-300/PM",
        vat: "+ VAT",
        duration: "For as long as you need. (Rolling)",
        boxLabel: "What’s in the box",
        summary: [
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostru.",
        ],
        includes: [],
      },
    ] satisfies PricingTier[],
  },

  toolkit: {
    kicker: "Development Toolkit",
    heading: "Engineered for Velocity.",
    intro:
      "Combination of programming languages, frameworks, databases, front-end tools, back-end tools, and software APIs used to build and run a single application.",
    note: " Choosing the right tech stack is crucial for scalability, performance, and developer efficiency.",
  },

  footer: {
    privacyLabel: "Privacy Policy",
    privacyHref: "/privacy",
  },
} as const;

export type SiteData = typeof siteData;
