import Link from "next/link";
import { cn } from "@/lib/utils";

type MedDeliveryLogoProps = {
  href?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  label?: string;
  ariaLabel?: string;
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: {
    mark: "h-10 w-10 rounded-lg",
    icon: "h-5 w-5",
    word: "text-xl",
    tagline: "text-[0.68rem]"
  },
  md: {
    mark: "h-12 w-12 rounded-xl",
    icon: "h-6 w-6",
    word: "text-2xl",
    tagline: "text-sm"
  },
  lg: {
    mark: "h-14 w-14 rounded-[14px]",
    icon: "h-7 w-7",
    word: "text-[1.7rem]",
    tagline: "text-base"
  }
};

/**
 * Renders the standardized MedDelivery logo icon based on the landing page design.
 */
function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <rect x="1" y="9" width="13" height="8" rx="1.5"
        fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="1.4" />
      <path d="M14 12h4l2.5 3V17H14V12z"
        stroke="white" strokeWidth="1.4" strokeLinejoin="round"
        fill="rgba(255,255,255,0.08)" />
      <circle cx="5"  cy="17" r="1.5" fill="#0ABFBC" />
      <circle cx="17" cy="17" r="1.5" fill="#0ABFBC" />
      <path d="M6.5 12v2.5M5.2 13.2h2.6"
        stroke="#0ABFBC" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * MedDeliveryLogo renders the linked brand mark and wordmark used across public and app pages.
 *
 * @param props - Logo destination, theme, sizing, label, tagline visibility, and custom classes.
 * @returns The linked MedDelivery brand lockup.
 */
export default function MedDeliveryLogo({
  href = "/",
  theme = "dark",
  size = "sm",
  label,
  showText = true,
  showTagline = true,
  className = ""
}: MedDeliveryLogoProps) {
  const sizes = sizeClasses[size];
  const isDark = theme === "dark";
  
  const wordText = isDark ? "text-white" : "text-slate-900";
  const taglineText = isDark ? "text-[#7AABB0]" : "text-slate-500";
  
  const content = (
    <>
      <div className={cn(
        sizes.mark,
        "flex-shrink-0 rounded-[9px] border border-[rgba(10,191,188,0.28)] shadow-[0_0_14px_rgba(10,191,188,0.15)] flex items-center justify-center transition-shadow",
        isDark ? "bg-[#0F172A]" : "bg-slate-900" 
      )}>
        <LogoIcon className={sizes.icon} />
      </div>
      {showText && (
        <div className="flex flex-col gap-0 min-w-0">
          <span className={cn("font-bold leading-tight tracking-tight", sizes.word, wordText)}>
            MedDelivery
          </span>
          {showTagline && (
            <span className={cn("leading-snug", sizes.tagline, taglineText)}>
              {label ?? "Your Pharmacy, Delivered to Your Door"}
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <Link href={href} className={cn("flex items-center gap-3 no-underline group", className)} aria-label="MedDelivery home">
      {content}
    </Link>
  );
}

