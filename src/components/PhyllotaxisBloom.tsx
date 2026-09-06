"use client";

import { motion } from "framer-motion";
import { PHYLLOtAXIS_BLOOM_INNER } from "@/assets/phyllotaxisBloomMarkup";
import { cn } from "@/lib/cn";

type PhyllotaxisBloomProps = React.ComponentProps<typeof motion.svg>;

export function PhyllotaxisBloom({ className, ...props }: PhyllotaxisBloomProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1026 1024"
      fill="none"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-full", className)}
      {...props}
      dangerouslySetInnerHTML={{ __html: PHYLLOtAXIS_BLOOM_INNER }}
    />
  );
}
