import type { Metadata } from "next";
import { JetBrains_Mono, Unbounded } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { Navigation } from "@/components/Navigation";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { SectionTransitionGate } from "@/components/SectionTransitionGate";
import { SiteFooterBar } from "@/components/SiteFooterBar";
import { SiteFooterGate } from "@/components/SiteFooterGate";
import { SprayProvider } from "@/components/SprayProvider";
import { organizationGraph } from "@/lib/schema";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: "700",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Design and AI Engineering Studio`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  keywords: [
    "custom software development",
    "AI engineering",
    "design engineering",
    "hardware-connected apps",
    "CMS development",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Design and AI Engineering Studio`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Design and AI Engineering Studio`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** Pre-paint /home IDE hide — scoped pathname; failsafe clears in 4s. */
const IDE_FIRST_BOOT_SCRIPT = `(function(){try{var p=location.pathname;if(p!=="/home"&&p!=="/home/")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;try{if(sessionStorage.getItem("todo-ide-boot-v8")==="1")return;if(sessionStorage.getItem("todo-ide-boot-force")==="1")return;}catch(e){}document.documentElement.setAttribute("data-ide-first","");setTimeout(function(){try{if(!document.documentElement.hasAttribute("data-ide-first"))return;var b=document.querySelector("[data-ide-boot]");if(!b||b.getAttribute("data-ide-boot")!=="done")document.documentElement.removeAttribute("data-ide-first");}catch(e){}},4000);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Pre-paint only — must stay tiny; try/catch for private mode.
          dangerouslySetInnerHTML={{ __html: IDE_FIRST_BOOT_SCRIPT }}
        />
        <noscript>
          <style>{`[data-ide-first] .ide-boot-tabs,[data-ide-first] .ide-boot-chrome,[data-ide-first] .ide-boot-status,[data-ide-first] .ide-boot-editor,[data-ide-first] .ide-boot-sidecar,[data-ide-first] .ide-boot-line{opacity:1!important;transform:none!important;animation:none!important}.ide-bone-overlay{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full bg-[#4545FF] text-[#DFDFFF]">
        <JsonLd data={organizationGraph()} />
        <SprayProvider>
          <NoiseOverlay />
          <Navigation />
          <SectionTransitionGate>{children}</SectionTransitionGate>
          <SiteFooterGate>
            <SiteFooterBar />
          </SiteFooterGate>
        </SprayProvider>
      </body>
    </html>
  );
}
