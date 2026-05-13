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
    mark: "h-12 w-12 rounded-[14px]",
    icon: "h-8 w-8",
    word: "text-base",
    tagline: "text-[0.6rem]"
  },
  md: {
    mark: "h-14 w-14 rounded-[16px]",
    icon: "h-9 w-9",
    word: "text-[1.35rem]",
    tagline: "text-[0.72rem]"
  },
  lg: {
    mark: "h-16 w-16 rounded-[18px]",
    icon: "h-10 w-10",
    word: "text-[1.7rem]",
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
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="MedDelivery ambulance logo">
      <rect x="11" y="24" width="26" height="17" rx="3.8" fill="none" stroke="#f8fafc" strokeWidth="4" />
      <path d="M37 29h9.2l7.1 8.3V41H37V29Z" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinejoin="round" />
      <path d="M23.5 28.5h7M27 25v7" stroke="#0ABFBC" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M14 41h34" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="43" r="4.5" fill="#0ABFBC" />
      <circle cx="46" cy="43" r="4.5" fill="#0ABFBC" />
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
      <span className={`${sizes.mark} grid shrink-0 place-items-center border-[3px] border-[#0e5a65] bg-[#10182c] shadow-[0_0_0_1px_rgba(7,25,34,0.55),0_18px_36px_rgba(2,13,22,0.28)]`}>
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
