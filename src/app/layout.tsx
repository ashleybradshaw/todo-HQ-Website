import type { Metadata } from "next";
import { Space_Mono, Unbounded } from "next/font/google";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: "700",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "//TODO Engineering & Design",
  description:
    "//TODO is an engineering team shipping AI-driven applications, multi-agent backends, and automated development lifecycles.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#4545FF] text-[#DDDDFF]">
        {children}
        <NoiseOverlay />
      </body>
    </html>
  );
}
