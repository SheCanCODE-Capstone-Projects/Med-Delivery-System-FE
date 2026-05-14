import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

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
 * Renders the reusable ambulance mark used by the MedDelivery brand lockup.
 *
 * @param className - Optional sizing and layout classes applied to the SVG.
 * @returns The MedDelivery ambulance logo mark.
 */
function LogoMark({ className }: Pick<ComponentPropsWithoutRef<"svg">, "className">) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M12 31.5h26.5c2.8 0 5.4 1.2 7.2 3.3l5 5.7H56"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M14 27h22v15H14zM36 31h8.2l6.2 7.2V42H36z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path d="M21 34h9M25.5 29.5v9" stroke="var(--logo-accent)" strokeLinecap="round" strokeWidth="4" />
      <circle cx="23" cy="45" r="4" fill="var(--logo-accent)" />
      <circle cx="47" cy="45" r="4" fill="var(--logo-accent)" />
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
  ariaLabel,
  showText = true,
  showTagline = true,
  className = ""
}: MedDeliveryLogoProps) {
  const sizes = sizeClasses[size];
  const wordText = theme === "dark" ? "text-white" : "text-slate-900";
  const taglineText = theme === "dark" ? "text-[#7AABB0]" : "text-slate-500";
  const markText = theme === "dark" ? "text-slate-50" : "text-slate-50";
  const markChrome = theme === "dark"
    ? "border-[#125c69] bg-[#07121f]"
    : "border-[#125c69] bg-[#07121f]";
  const linkLabel = ariaLabel ?? (href === "/" ? "MedDelivery home" : "MedDelivery");
  const content = (
    <>
      <span
        className={`${sizes.mark} ${markChrome} ${markText} grid shrink-0 place-items-center border shadow-[0_0_0_1px_rgba(10,191,188,0.08)] [--logo-accent:#0ABFBC]`}
      >
        <LogoMark className={sizes.icon} />
      </span>
      {showText ? (
        <span className="min-w-0">
          <span className={`${sizes.word} block font-bold leading-none tracking-normal ${wordText}`}>
            MedDelivery
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
    <Link href={href} className={`flex items-center gap-3 no-underline ${className}`} aria-label={linkLabel}>
      {content}
    </Link>
  );
}
