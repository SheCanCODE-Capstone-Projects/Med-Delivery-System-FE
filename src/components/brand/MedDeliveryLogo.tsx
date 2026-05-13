import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type MedDeliveryLogoProps = {
  href?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  label?: string;
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: {
    mark: "h-10 w-10 rounded-[10px]",
    icon: "h-8 w-8",
    word: "text-base",
    tagline: "text-[0.6rem]"
  },
  md: {
    mark: "h-14 w-14 rounded-[14px]",
    icon: "h-11 w-11",
    word: "text-[1.75rem]",
    tagline: "text-xs"
  },
  lg: {
    mark: "h-[4.5rem] w-[4.5rem] rounded-[18px]",
    icon: "h-14 w-14",
    word: "text-[2.25rem]",
    tagline: "text-sm"
  }
};

/**
 * Renders the reusable ambulance mark used by the MedDelivery brand lockup.
 *
 * @param className - Optional sizing and layout classes applied to the SVG.
 * @returns The MedDelivery ambulance logo mark.
 */
function LogoMark({ className }: Pick<ComponentPropsWithoutRef<"svg">, "className">) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="MedDelivery ambulance logo">
      <rect x="6" y="17" width="21" height="11" rx="3.5" fill="white" opacity="0.96" />
      <path d="M27 20h7.2c1.4 0 2.74.63 3.66 1.72L41 25.6V31h-4.2" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 12h5v3.4h3.5v5h-3.5v3.4h-5v-3.4H9v-5h3.5V12Z" fill="#0ABFBC" />
      <path d="M10 22.5h13" fill="none" stroke="#0ABFBC" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M31 20v7.2h9.2" fill="none" stroke="#0ABFBC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="31.5" r="4.2" fill="#0ABFBC" />
      <circle cx="34" cy="31.5" r="4.2" fill="#0ABFBC" />
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
  const wordText = theme === "dark" ? "text-white" : "text-slate-900";
  const taglineText = theme === "dark" ? "text-[#7AABB0]" : "text-slate-500";
  const content = (
    <>
      <span className={`${sizes.mark} grid shrink-0 place-items-center bg-[#0f172a] shadow-[0_0_0_1px_rgba(94,222,221,0.42),0_12px_26px_rgba(15,23,42,0.24)]`}>
        <LogoMark className={sizes.icon} />
      </span>
      {showText ? (
        <span className="min-w-0">
          <span className={`${sizes.word} block font-bold leading-none tracking-normal ${wordText}`}>
            <span>Med</span>
            <span className="text-[#0ABFBC]">Delivery</span>
          </span>
          {showTagline ? (
            <span className={`${sizes.tagline} mt-1 block font-semibold leading-tight tracking-normal ${taglineText}`}>
              {label ?? "Your Pharmacy, Delivered to Your Door"}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  return (
    <Link href={href} className={`flex items-center gap-3 no-underline ${className}`} aria-label="MedDelivery home">
      {content}
    </Link>
  );
}
