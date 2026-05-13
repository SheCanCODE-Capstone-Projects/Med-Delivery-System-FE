import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type MedDeliveryLogoProps = {
  href?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  label?: string;
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
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="MedDelivery ambulance logo">
      <rect x="3" y="3" width="90" height="90" rx="18" fill="#0f172a" />
      <rect x="3" y="3" width="90" height="90" rx="18" fill="none" stroke="#5ededd" strokeWidth="2" opacity="0.72" />
      <path d="M20 23h13v15H20z" fill="#f8fafc" />
      <path d="M24.2 19h4.6v7h-4.6z" fill="#5ededd" />
      <path d="M21 37h11" stroke="#c8f3f2" strokeWidth="2" strokeLinecap="round" />
      <path d="M25.6 51.5h36.8c3.1 0 5.6 2.5 5.6 5.6V68H25.6c-3.1 0-5.6-2.5-5.6-5.6v-5.3c0-3.1 2.5-5.6 5.6-5.6Z" fill="#f8fafc" />
      <path d="M67.6 56h12.2c1.9 0 3.7.88 4.85 2.4L91 66.8V68H67.6V56Z" fill="#dff7f6" />
      <path d="M70.5 59.2h8.2c1 0 1.96.48 2.56 1.29l3.34 4.51H70.5v-5.8Z" fill="#a7ece9" />
      <path d="M86.8 66.8H94" stroke="#5ededd" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M27.5 68h4.2M57.5 68h5" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
      <circle cx="34" cy="70" r="8.2" fill="#0f172a" stroke="#5ededd" strokeWidth="3.8" />
      <circle cx="34" cy="70" r="3.2" fill="#f8fafc" />
      <circle cx="64" cy="70" r="8.2" fill="#0f172a" stroke="#5ededd" strokeWidth="3.8" />
      <circle cx="64" cy="70" r="3.2" fill="#f8fafc" />
      <path d="M40.5 47v14M33.5 54h14" stroke="#18c6c3" strokeWidth="5" strokeLinecap="round" />
      <path d="M13 51h9M9 57h13" stroke="#f8fafc" strokeWidth="3.2" strokeLinecap="round" opacity="0.94" />
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
    </>
  );

  return (
    <Link href={href} className={`flex items-center gap-3 no-underline ${className}`} aria-label="MedDelivery home">
      {content}
    </Link>
  );
}
