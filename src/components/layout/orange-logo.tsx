import * as React from "react";

export function OrangeLogo({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Citrus Rind */}
      <circle cx="50" cy="50" r="46" fill="#F97316" />
      {/* Inner White Pith */}
      <circle cx="50" cy="50" r="41" fill="#FEF3C7" />
      {/* Citrus Pulp Base */}
      <circle cx="50" cy="50" r="37" fill="#FB923C" />
      {/* Segments Dividers */}
      <path
        d="M50 13 V87 M13 50 H87 M24 24 L76 76 M24 76 L76 24"
        stroke="#FEF3C7"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Center Axis */}
      <circle cx="50" cy="50" r="6" fill="#FEF3C7" />
      <circle cx="50" cy="50" r="3" fill="#F97316" />
      {/* Small leaf on top */}
      <path
        d="M48 6 C48 6 42 -2 33 2 C28 5 35 12 48 8"
        fill="#16A34A"
      />
    </svg>
  );
}

