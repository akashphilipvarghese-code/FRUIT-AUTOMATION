"use client";

interface ClearScanLogoProps {
  size?: "small" | "medium";
  showTagline?: boolean;
  className?: string;
}

export function ClearScanLogo({
  size = "medium",
  showTagline = true,
  className = "",
}: ClearScanLogoProps) {
  const isSmall = size === "small";
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span
        className={`font-bold text-[#FF8C00] tracking-tight ${
          isSmall ? "text-xl" : "text-3xl sm:text-4xl"
        }`}
      >
        ClearScan
      </span>
      {showTagline && (
        <span className="text-gray-500 text-xs sm:text-sm">
          AI-Powered Fruit Quality
        </span>
      )}
    </div>
  );
}
